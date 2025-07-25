// Professional Radio Compliance Engine with Intelligent Caching
// Handles DMCA compliance, performance rights logging, and industry reporting

import { PlayLog, ComplianceRule, Track } from "@/api/entities";

class ComplianceEngine {
  constructor() {
    this.activeRules = [];
    this.recentPlays = [];
    this.playCache = new Map(); // Cache recent plays to avoid API calls
    this.lastCacheUpdate = null;
    this.cacheValidityPeriod = 60000; // 1 minute cache validity
    this.pendingLogs = []; // Queue for batch processing
    this.batchTimer = null;
    
    this.loadRules();
    this.startBatchProcessor();
  }

  async loadRules() {
    try {
      this.activeRules = await ComplianceRule.filter({ is_active: true });
      console.log(`[ComplianceEngine] Loaded ${this.activeRules.length} active compliance rules`);
    } catch (error) {
      console.error('[ComplianceEngine] Failed to load rules:', error);
      this.activeRules = [];
    }
  }

  startBatchProcessor() {
    // Process pending logs every 30 seconds to reduce API calls
    this.batchTimer = setInterval(() => {
      this.processPendingLogs();
    }, 30000);
  }

  async processPendingLogs() {
    if (this.pendingLogs.length === 0) return;
    
    console.log(`[ComplianceEngine] Processing ${this.pendingLogs.length} pending logs`);
    
    // Process logs in batches to avoid rate limits
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < this.pendingLogs.length; i += batchSize) {
      batches.push(this.pendingLogs.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      try {
        await Promise.all(batch.map(logData => this.createPlayLogSafely(logData)));
        // Remove processed logs
        this.pendingLogs = this.pendingLogs.filter(log => !batch.includes(log));
        
        // Small delay between batches to respect rate limits
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error('[ComplianceEngine] Batch processing error:', error);
        // Keep failed logs for retry
        break;
      }
    }
  }

  async createPlayLogSafely(logData) {
    try {
      const playLog = await PlayLog.create(logData);
      console.log('[ComplianceEngine] ✅ Play log created successfully');
      return playLog;
    } catch (error) {
      console.error('[ComplianceEngine] Failed to create play log:', error);
      throw error;
    }
  }

  async refreshPlayCache() {
    const now = Date.now();
    
    // Only refresh cache if it's stale
    if (this.lastCacheUpdate && (now - this.lastCacheUpdate) < this.cacheValidityPeriod) {
      return;
    }
    
    try {
      console.log('[ComplianceEngine] 🔄 Refreshing play cache...');
      
      // Get recent plays from the last 24 hours
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPlays = await PlayLog.filter({
        play_start_time: { $gte: cutoffTime.toISOString() }
      });
      
      // Update cache
      this.playCache.clear();
      recentPlays.forEach(play => {
        const key = `${play.track_id}_${play.play_start_time}`;
        this.playCache.set(key, play);
      });
      
      this.recentPlays = recentPlays;
      this.lastCacheUpdate = now;
      
      console.log(`[ComplianceEngine] ✅ Cache refreshed with ${recentPlays.length} recent plays`);
      
    } catch (error) {
      console.error('[ComplianceEngine] Failed to refresh cache:', error);
      // Don't throw - use existing cache if available
    }
  }

  getRecentPlaysFromCache(trackId, timeWindowMinutes) {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000);
    
    return Array.from(this.playCache.values()).filter(play => {
      const playTime = new Date(play.play_start_time).getTime();
      return play.track_id === trackId && playTime >= cutoffTime;
    });
  }

  getRecentPlaysByArtistFromCache(artist, timeWindowMinutes) {
    const cutoffTime = Date.now() - (timeWindowMinutes * 60 * 1000);
    
    return Array.from(this.playCache.values()).filter(play => {
      const playTime = new Date(play.play_start_time).getTime();
      return play.metadata_snapshot?.artist === artist && playTime >= cutoffTime;
    });
  }

  async canPlayTrack(track, currentShow = null) {
    // Refresh cache if needed (but don't wait for it to avoid blocking)
    this.refreshPlayCache().catch(err => 
      console.warn('[ComplianceEngine] Cache refresh failed:', err)
    );
    
    const violations = [];
    
    // Use cached data for compliance checks to avoid API rate limits
    for (const rule of this.activeRules) {
      try {
        const violation = await this.checkRuleWithCache(rule, track, currentShow);
        if (violation) {
          violations.push(violation);
        }
      } catch (error) {
        console.warn(`[ComplianceEngine] Error checking rule ${rule.rule_name}:`, error);
        // Continue with other rules even if one fails
      }
    }

    const canPlay = violations.length === 0 || violations.every(v => v.severity !== 'block');
    
    return {
      canPlay,
      violations,
      warnings: violations.filter(v => v.severity === 'warning')
    };
  }

  async checkRuleWithCache(rule, track, currentShow) {
    const { rule_type, parameters, severity } = rule;
    
    switch (rule_type) {
      case 'dmca_spacing':
        return this.checkDMCASpacingCached(track, parameters, severity);
      
      case 'artist_separation':
        return this.checkArtistSeparationCached(track, parameters, severity);
      
      case 'album_separation':
        return this.checkAlbumSeparationCached(track, parameters, severity);
      
      case 'performance_rights':
        return this.checkPerformanceRights(track, parameters, severity);
      
      case 'content_advisory':
        return this.checkContentAdvisory(track, parameters, severity);
      
      default:
        return null;
    }
  }

  checkDMCASpacingCached(track, parameters, severity) {
    const timeWindow = parameters.time_window_minutes || 60;
    
    try {
      const recentPlays = this.getRecentPlaysFromCache(track.id, timeWindow);
      
      if (recentPlays.length > 0) {
        const lastPlay = recentPlays[0];
        const timeSinceLastPlay = (Date.now() - new Date(lastPlay.play_start_time).getTime()) / (1000 * 60);
        
        if (timeSinceLastPlay < timeWindow) {
          return {
            rule: 'DMCA Spacing',
            message: `Track "${track.title}" was played ${Math.round(timeSinceLastPlay)} minutes ago. DMCA requires ${timeWindow} minute spacing.`,
            severity,
            lastPlayTime: lastPlay.play_start_time
          };
        }
      }
    } catch (error) {
      console.warn('[ComplianceEngine] Error checking DMCA spacing from cache:', error);
    }
    
    return null;
  }

  checkArtistSeparationCached(track, parameters, severity) {
    const timeWindow = parameters.time_window_minutes || 30;
    
    try {
      const artistPlays = this.getRecentPlaysByArtistFromCache(track.artist, timeWindow);
      
      if (artistPlays.length > 0) {
        return {
          rule: 'Artist Separation',
          message: `Artist "${track.artist}" was played recently. Industry standard requires ${timeWindow} minute artist separation.`,
          severity,
          recentPlays: artistPlays.length
        };
      }
    } catch (error) {
      console.warn('[ComplianceEngine] Error checking artist separation from cache:', error);
    }
    
    return null;
  }

  checkAlbumSeparationCached(track, parameters, severity) {
    if (!track.album) return null;
    
    const timeWindow = parameters.time_window_minutes || 60;
    const cutoffTime = Date.now() - (timeWindow * 60 * 1000);
    
    try {
      const albumPlays = Array.from(this.playCache.values()).filter(play => {
        const playTime = new Date(play.play_start_time).getTime();
        return play.metadata_snapshot?.album === track.album && playTime >= cutoffTime;
      });
      
      if (albumPlays.length > 0) {
        return {
          rule: 'Album Separation',
          message: `Album "${track.album}" was played recently. Requires ${timeWindow} minute separation.`,
          severity,
          recentPlays: albumPlays.length
        };
      }
    } catch (error) {
      console.warn('[ComplianceEngine] Error checking album separation from cache:', error);
    }
    
    return null;
  }

  async checkPerformanceRights(track, parameters, severity) {
    // Check if track has required performance rights metadata
    if (!track.performance_rights_org || track.performance_rights_org === 'unknown') {
      return {
        rule: 'Performance Rights',
        message: `Track "${track.title}" missing performance rights organization data (BMI/ASCAP/SESAC).`,
        severity,
        missingData: 'performance_rights_org'
      };
    }
    
    return null;
  }

  async checkContentAdvisory(track, parameters, severity) {
    // Check explicit content and content advisory flags
    const advisoryFlags = track.content_advisory || [];
    const blockedContent = parameters.blocked_content || [];
    
    const violations = advisoryFlags.filter(flag => blockedContent.includes(flag));
    
    if (violations.length > 0) {
      return {
        rule: 'Content Advisory',
        message: `Track "${track.title}" contains blocked content: ${violations.join(', ')}.`,
        severity,
        contentFlags: violations
      };
    }
    
    return null;
  }

  async logPlay(track, showId, clockwheelId, playType = 'manual') {
    const logData = {
      track_id: track.id,
      show_id: showId,
      clockwheel_id: clockwheelId,
      play_start_time: new Date().toISOString(),
      actual_duration: 0, // Will be updated when track ends
      completion_percentage: 0, // Will be updated when track ends
      play_type: playType,
      royalty_status: 'pending',
      dmca_compliant: true,
      sound_exchange_eligible: track.sound_exchange_eligible !== false,
      metadata_snapshot: {
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        album: track.album || '',
        duration: track.duration,
        genre: track.genre,
        track_type: track.track_type,
        isrc: track.isrc || null,
        label: track.label || null,
        publisher: track.publisher || null
      }
    };

    // Add to pending queue instead of immediate API call
    this.pendingLogs.push(logData);
    console.log('[ComplianceEngine] ⏳ Play log queued for batch processing');
    
    // Return a placeholder log object
    return {
      id: `pending_${Date.now()}`,
      ...logData
    };
  }

  async updatePlayCompletion(logId, actualDuration, endTime) {
    // For now, just log this - in a full implementation we'd update the record
    console.log(`[ComplianceEngine] Track completed: ${actualDuration}s duration`);
    
    // Update any pending logs
    const pendingLog = this.pendingLogs.find(log => log.track_id && log.play_start_time);
    if (pendingLog) {
      pendingLog.actual_duration = actualDuration;
      pendingLog.completion_percentage = Math.min(100, (actualDuration / pendingLog.metadata_snapshot.duration) * 100);
      pendingLog.play_end_time = endTime.toISOString();
    }
  }

  // Cleanup method
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Process any remaining logs
    if (this.pendingLogs.length > 0) {
      this.processPendingLogs();
    }
  }
}

// Create and export singleton instance
const complianceEngine = new ComplianceEngine();
export default complianceEngine;