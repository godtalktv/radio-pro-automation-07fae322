/**
 * @file ContentFeedManager.js
 * @description Intelligent content feed system that keeps the player continuously supplied with tracks
 */

import { Track, Show, Clockwheel } from "@/api/entities";

class ContentFeedManager {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.isActive = false;
    this.feedInterval = null;
    this.currentClockwheel = null;
    this.clockwheelPosition = 0;
    this.lastPlayedTracks = new Set(); // For separation rules
    this.genreRotation = ['rock', 'pop', 'alternative', 'hip_hop', 'jazz', 'electronic'];
    this.currentGenreIndex = 0;
    
    // Feed configuration
    this.config = {
      minQueueLength: 5,          // Always keep at least 5 tracks queued
      maxQueueLength: 20,         // Don't exceed 20 tracks to avoid memory issues
      separationMinutes: 30,      // Don't repeat same track within 30 minutes
      artistSeparation: 3,        // Don't play same artist within 3 tracks
      energyBalancing: true,      // Balance high/medium/low energy tracks
      clockwheelMode: false,      // Use clockwheel scheduling
      genreRotation: true,        // Rotate through different genres
      contentMix: {               // Percentage mix of content types
        music: 85,
        station_id: 10,
        commercial: 3,
        promo: 2
      }
    };

    console.log('[ContentFeedManager] ✅ Feed Manager Initialized');
  }

  // Start the content feed
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('[ContentFeedManager] 🚀 Starting intelligent content feed');
    
    // Initial queue population
    this.replenishQueue();
    
    // Set up interval to continuously monitor and replenish queue
    this.feedInterval = setInterval(() => {
      this.monitorAndReplenish();
    }, 10000); // Check every 10 seconds
    
    // Subscribe to audio manager events
    this.unsubscribe = this.audioManager.subscribe((state) => {
      this.handleAudioStateChange(state);
    });
  }

  // Stop the content feed
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('[ContentFeedManager] ⏹️ Stopping content feed');
    
    if (this.feedInterval) {
      clearInterval(this.feedInterval);
      this.feedInterval = null;
    }
    
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // Monitor queue and replenish when needed
  monitorAndReplenish() {
    const currentState = this.audioManager.state;
    
    if (currentState.queue.length < this.config.minQueueLength) {
      console.log(`[ContentFeedManager] 📥 Queue low (${currentState.queue.length}), replenishing...`);
      this.replenishQueue();
    }
  }

  // Handle changes in audio state
  handleAudioStateChange(state) {
    // Track when tracks are played for separation rules
    if (state.currentTrack && state.isPlaying) {
      this.lastPlayedTracks.add({
        id: state.currentTrack.id,
        artist: state.currentTrack.artist,
        timestamp: Date.now()
      });
      
      // Clean up old entries (older than separation time)
      const cutoffTime = Date.now() - (this.config.separationMinutes * 60 * 1000);
      this.lastPlayedTracks = new Set([...this.lastPlayedTracks].filter(
        entry => entry.timestamp > cutoffTime
      ));
    }
  }

  // Main queue replenishment logic
  async replenishQueue() {
    try {
      const currentState = this.audioManager.state;
      const needed = this.config.maxQueueLength - currentState.queue.length;
      
      if (needed <= 0) return;
      
      console.log(`[ContentFeedManager] 🎵 Adding ${needed} tracks to queue`);
      
      let newTracks = [];
      
      if (this.config.clockwheelMode && this.currentClockwheel) {
        newTracks = await this.generateClockwheelContent(needed);
      } else {
        newTracks = await this.generateSmartMix(needed);
      }
      
      // Add tracks to queue
      if (newTracks.length > 0) {
        this.audioManager.emit({
          queue: [...currentState.queue, ...newTracks]
        });
        console.log(`[ContentFeedManager] ✅ Added ${newTracks.length} tracks to queue`);
      }
      
    } catch (error) {
      console.error('[ContentFeedManager] ❌ Failed to replenish queue:', error);
    }
  }

  // Generate content based on clockwheel programming
  async generateClockwheelContent(needed) {
    if (!this.currentClockwheel || !this.currentClockwheel.items) {
      return this.generateSmartMix(needed);
    }
    
    const tracks = [];
    const allTracks = this.audioManager.state.allTracks;
    
    for (let i = 0; i < needed; i++) {
      const clockwheelItem = this.currentClockwheel.items[this.clockwheelPosition % this.currentClockwheel.items.length];
      this.clockwheelPosition++;
      
      const selectedTracks = await this.selectTracksForClockwheelItem(clockwheelItem, allTracks);
      tracks.push(...selectedTracks);
    }
    
    return tracks.slice(0, needed);
  }

  // Select tracks based on clockwheel item specifications
  async selectTracksForClockwheelItem(item, allTracks) {
    let filteredTracks = allTracks.filter(track => track.track_type === item.type);
    
    // Apply genre filter for music
    if (item.type === 'music' && item.genre_filter && item.genre_filter.length > 0) {
      filteredTracks = filteredTracks.filter(track => 
        item.genre_filter.includes(track.genre)
      );
    }
    
    // Apply energy filter for music
    if (item.type === 'music' && item.energy_filter && item.energy_filter.length > 0) {
      filteredTracks = filteredTracks.filter(track => 
        item.energy_filter.includes(track.energy_level)
      );
    }
    
    // Apply separation rules
    filteredTracks = this.applySeparationRules(filteredTracks);
    
    // Calculate how many tracks to select
    let count = 1;
    if (item.exact_item_count) {
      count = item.exact_item_count;
    } else if (item.duration_minutes) {
      // Estimate track count based on duration (average 3.5 minutes per song)
      count = Math.ceil(item.duration_minutes / 3.5);
    }
    
    // Select random tracks
    const selected = [];
    for (let i = 0; i < count && filteredTracks.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      selected.push(filteredTracks[randomIndex]);
      filteredTracks.splice(randomIndex, 1); // Remove to avoid duplicates
    }
    
    return selected;
  }

  // Generate intelligent content mix without clockwheel
  async generateSmartMix(needed) {
    const allTracks = this.audioManager.state.allTracks;
    const tracks = [];
    
    for (let i = 0; i < needed; i++) {
      const contentType = this.selectContentType();
      const track = await this.selectTrackByType(contentType, allTracks);
      if (track) {
        tracks.push(track);
      }
    }
    
    return tracks;
  }

  // Select content type based on configured mix
  selectContentType() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    for (const [type, percentage] of Object.entries(this.config.contentMix)) {
      cumulative += percentage;
      if (rand <= cumulative) {
        return type;
      }
    }
    
    return 'music'; // Fallback
  }

  // Select a track of specific type with smart filtering
  async selectTrackByType(type, allTracks) {
    let candidates = allTracks.filter(track => track.track_type === type);
    
    if (candidates.length === 0) {
      // Fallback to music if no tracks of requested type
      candidates = allTracks.filter(track => track.track_type === 'music');
    }
    
    // Apply separation rules
    candidates = this.applySeparationRules(candidates);
    
    // For music, apply genre rotation
    if (type === 'music' && this.config.genreRotation) {
      const currentGenre = this.genreRotation[this.currentGenreIndex];
      const genreTracks = candidates.filter(track => track.genre === currentGenre);
      
      if (genreTracks.length > 0) {
        candidates = genreTracks;
        this.currentGenreIndex = (this.currentGenreIndex + 1) % this.genreRotation.length;
      }
    }
    
    // Select random track from candidates
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    return null;
  }

  // Apply separation rules to filter out recently played content
  applySeparationRules(tracks) {
    const recentlyPlayed = Array.from(this.lastPlayedTracks);
    
    return tracks.filter(track => {
      // Don't repeat same track
      if (recentlyPlayed.some(recent => recent.id === track.id)) {
        return false;
      }
      
      // Don't repeat same artist too frequently
      const recentArtists = recentlyPlayed.slice(0, this.config.artistSeparation)
        .map(recent => recent.artist);
      if (recentArtists.includes(track.artist)) {
        return false;
      }
      
      return true;
    });
  }

  // Set current clockwheel for programming
  setClockwheel(clockwheel) {
    this.currentClockwheel = clockwheel;
    this.clockwheelPosition = 0;
    this.config.clockwheelMode = !!clockwheel;
    console.log(`[ContentFeedManager] 🎯 Set clockwheel: ${clockwheel?.name || 'None'}`);
  }

  // Update feed configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[ContentFeedManager] ⚙️ Updated configuration:', this.config);
  }

  // Get current feed status
  getStatus() {
    return {
      isActive: this.isActive,
      queueLength: this.audioManager.state.queue.length,
      currentClockwheel: this.currentClockwheel?.name || null,
      clockwheelPosition: this.clockwheelPosition,
      config: this.config
    };
  }
}

export default ContentFeedManager;