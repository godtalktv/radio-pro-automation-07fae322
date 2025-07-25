
import { Track, Show, Clockwheel } from "@/api/entities";
import complianceEngine from "./ComplianceEngine";

// Helper function for shuffling arrays
const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

class AutoDJEngine {
  constructor(audioService) {
    this.audioService = audioService;
    this.isActive = false;
    this.currentClockwheel = null;
    this.clockwheelPosition = 0;
    this.queueBuilderInterval = null;
    this.scheduleCheckInterval = null;
    this.crossfadeEnabled = true;
    this.crossfadeDuration = 5000; // 5 seconds
    this.targetQueueLength = 5; // Keep 5 tracks ahead
    this.fallbackMode = false; // When true, indicates a need for less strict filtering (managed internally now)
    this.buildingQueue = false; // Flag to prevent concurrent queue building attempts
    
    console.log('[AutoDJEngine] Professional AutoDJ Engine initialized');
  }

  async start() {
    if (this.isActive) return;
    
    console.log('[AutoDJEngine] 🤖 Starting AutoDJ System');
    this.isActive = true;
    
    // Start the main AutoDJ loops
    this.startScheduleMonitoring();
    this.startQueueBuilder();
    
    // Ensure a clockwheel is loaded before attempting to build the initial queue
    if (!this.currentClockwheel) {
      await this.checkCurrentSchedule(); // This will load a show-specific or generic clockwheel
    }
    
    // Build initial queue
    await this.buildQueue();
    
    // Start playing if nothing is currently playing
    if (!this.audioService.state.isPlaying && !this.audioService.state.currentTrack) {
      await this.playNext();
    }
    
    this.audioService.setState({ isAutoDJ: true });
    console.log('[AutoDJEngine] ✅ AutoDJ is now LIVE');
  }

  async stop() {
    if (!this.isActive) return;
    
    console.log('[AutoDJEngine] 🛑 Stopping AutoDJ System');
    this.isActive = false;
    
    // Stop all intervals
    if (this.queueBuilderInterval) {
      clearInterval(this.queueBuilderInterval);
      this.queueBuilderInterval = null;
    }
    
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval);
      this.scheduleCheckInterval = null;
    }
    
    this.audioService.setState({ isAutoDJ: false });
    console.log('[AutoDJEngine] AutoDJ stopped');
  }

  startScheduleMonitoring() {
    // Check for schedule changes every 30 seconds
    this.scheduleCheckInterval = setInterval(() => {
      this.checkCurrentSchedule();
    }, 30000);
    
    // Initial check
    this.checkCurrentSchedule();
  }

  startQueueBuilder() {
    // Build queue every 20 seconds to stay ahead
    // The buildQueue logic itself will now manage its internal state to prevent re-entrancy
    this.queueBuilderInterval = setInterval(() => {
      if (this.isActive) {
        this.buildQueue();
      }
    }, 20000);
  }

  async checkCurrentSchedule() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5);
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      const shows = await Show.list();
      const currentShow = shows.find(show => 
        show.day_of_week === currentDay &&
        show.start_time <= currentTime &&
        show.end_time > currentTime
      );

      // Check if show changed
      const previousShow = this.audioService.state.currentScheduledShow;
      if (!previousShow && currentShow) {
        console.log(`[AutoDJEngine] 📻 New show started: ${currentShow.name}`);
        await this.loadShowClockwheel(currentShow);
      } else if (previousShow && !currentShow) {
        console.log('[AutoDJEngine] 📻 Show ended, switching to generic programming');
        await this.loadGenericClockwheel();
      } else if (previousShow && currentShow && previousShow.id !== currentShow.id) {
        console.log(`[AutoDJEngine] 📻 Show changed: ${currentShow.name}`);
        await this.loadShowClockwheel(currentShow);
      } else if (!this.currentClockwheel) { // Ensure a clockwheel is loaded even if no show change was detected (e.g., initial load)
        console.log('[AutoDJEngine] No current show active, or first load. Ensuring a clockwheel is active.');
        if (currentShow) {
          await this.loadShowClockwheel(currentShow);
        } else {
          await this.loadGenericClockwheel();
        }
      }

      this.audioService.setState({ currentScheduledShow: currentShow });

    } catch (error) {
      console.error('[AutoDJEngine] Error checking schedule:', error);
      // Fallback to generic if schedule check fails
      await this.loadGenericClockwheel();
    }
  }

  async loadShowClockwheel(show) {
    try {
      if (show.clockwheel_id) {
        const clockwheel = await Clockwheel.get(show.clockwheel_id);
        if (clockwheel) {
          console.log(`[AutoDJEngine] 🕐 Loaded clockwheel: ${clockwheel.name}`);
          this.currentClockwheel = clockwheel;
          this.clockwheelPosition = 0;
          this.fallbackMode = false; // Reset fallback mode
          
          // Clear queue and rebuild with new clockwheel
          this.audioService.setState({ queue: [] });
          await this.buildQueue();
        } else {
            console.warn(`[AutoDJEngine] Clockwheel with ID ${show.clockwheel_id} not found. Falling back to generic.`);
            await this.loadGenericClockwheel(); // Fallback if clockwheel ID exists but object not found
        }
      } else {
        console.warn(`[AutoDJEngine] Show ${show.name} has no clockwheel_id. Falling back to generic.`);
        await this.loadGenericClockwheel(); // Fallback if no clockwheel ID defined for show
      }
    } catch (error) {
      console.error('[AutoDJEngine] Error loading show clockwheel:', error);
      await this.loadGenericClockwheel();
    }
  }

  async loadGenericClockwheel() {
    // Create a simple generic clockwheel for off-hours or fallback
    this.currentClockwheel = {
      name: 'Generic Programming',
      items: [
        { position: 1, type: 'music', duration_minutes: 15, genre_filter: ['pop', 'rock', 'alternative'], energy_filter: ['medium', 'high'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 15, genre_filter: ['hip_hop', 'r_and_b', 'pop'], energy_filter: ['medium'] },
        { position: 4, type: 'commercial', exact_item_count: 1 },
        { position: 5, type: 'music', duration_minutes: 20, genre_filter: ['rock', 'alternative', 'pop'], energy_filter: ['medium', 'high'] }
      ]
    };
    this.clockwheelPosition = 0;
    console.log('[AutoDJEngine] 🕐 Loaded generic programming clockwheel');
    
    // Rebuild queue with generic programming
    this.audioService.setState({ queue: [] });
    await this.buildQueue(); // Trigger immediate queue build with the new clockwheel
  }

  async buildQueue() {
    if (!this.isActive) {
      console.log("[AutoDJEngine] AutoDJ not active, skipping queue build.");
      return;
    }
    
    // Prevent concurrent queue building attempts
    if (this.buildingQueue) {
        console.log("[AutoDJEngine] Queue build in progress, skipping concurrent attempt.");
        return;
    }
    this.buildingQueue = true; // Set flag
    
    try {
        console.log(`[AutoDJEngine] Checking queue status. Current length: ${this.audioService.state.queue.length}, Target: ${this.targetQueueLength}`);
        
        // Fill the queue up to the target length
        while (this.audioService.state.queue.length < this.targetQueueLength) {
            if (!this.currentClockwheel || !this.currentClockwheel.items || this.currentClockwheel.items.length === 0) {
                console.error("[AutoDJEngine] Cannot build queue: No clockwheel or clockwheel items loaded. Attempting to recover with generic clockwheel.");
                await this.loadGenericClockwheel(); // Attempt to recover
                // If still no valid clockwheel after recovery, we must try to find *any* track
                if (!this.currentClockwheel || this.currentClockwheel.items.length === 0) {
                    console.error("[AutoDJEngine] Still no valid clockwheel after recovery attempt. Trying desperation fallback.");
                    const desperationTrack = await this.findFallbackTrack();
                    if (desperationTrack) {
                        const currentQueue = this.audioService.state.queue;
                        this.audioService.setState({ queue: [...currentQueue, desperationTrack] });
                        console.log(`[AutoDJEngine] ➕ Added desperation track due to no clockwheel: ${desperationTrack.title}`);
                    } else {
                        console.error('[AutoDJEngine] FATAL ERROR: No track found, even in desperation mode. The music library might be empty. AutoDJ will stop trying until new tracks are available.');
                        this.stop(); 
                        this.audioService.setState({ error: "AutoDJ failed: Could not find any tracks to play." });
                        return; // Exit the loop and method
                    }
                    // If a desperation track was added, continue the while loop to try and fill further
                    continue; 
                }
            }
            
            const clockwheelItems = this.currentClockwheel.items.sort((a, b) => a.position - b.position);
            
            // Get the next item from the clockwheel, looping if necessary
            const currentItem = clockwheelItems[this.clockwheelPosition % clockwheelItems.length];
            this.clockwheelPosition++;

            console.log(`[AutoDJEngine] 🕐 Processing clockwheel item #${currentItem.position}: ${currentItem.type}`);

            let track = await this.findNextTrack(currentItem);
            
            if (track) {
                const currentQueue = this.audioService.state.queue;
                this.audioService.setState({ queue: [...currentQueue, track] });
                console.log(`[AutoDJEngine] ➕ Added to queue: ${track.title} (${track.track_type})`);
                this.fallbackMode = false; // Reset fallback mode on success
            } else {
                console.warn(`[AutoDJEngine] ⚠️ Could not find a suitable track for clockwheel item type: ${currentItem.type}. Activating fallback.`);
                this.fallbackMode = true; // Activate fallback for subsequent attempts if primary search fails

                const fallbackTrack = await this.findFallbackTrack();
                if (fallbackTrack) {
                    const currentQueue = this.audioService.state.queue;
                    this.audioService.setState({ queue: [...currentQueue, fallbackTrack] });
                    console.log(`[AutoDJEngine] ➕ Added FALLBACK track to queue: ${fallbackTrack.title}`);
                } else {
                    console.error('[AutoDJEngine] FATAL ERROR: No track found, even in desperation mode. The music library might be empty. AutoDJ will stop trying until new tracks are available.');
                    this.stop(); 
                    this.audioService.setState({ error: "AutoDJ failed: Could not find any tracks to play." });
                    return; // Exit the loop
                }
            }
        }
        console.log(`[AutoDJEngine] ✅ Queue built to target length: ${this.audioService.state.queue.length}`);
    } catch (error) {
        console.error('[AutoDJEngine] Error during queue building process:', error);
        // On error, if the queue is empty, try to add at least one fallback track
        if (this.audioService.state.queue.length === 0) {
            const emergencyTrack = await this.findFallbackTrack();
            if (emergencyTrack) {
                this.audioService.setState({ queue: [emergencyTrack] });
                console.log(`[AutoDJEngine] ➕ Added emergency track after build error: ${emergencyTrack.title}`);
            } else {
                console.error('[AutoDJEngine] CRITICAL: Failed to build queue and no emergency track found. AutoDJ cannot continue.');
                this.stop();
                this.audioService.setState({ error: "AutoDJ failed: Critical error building queue and no tracks available." });
            }
        }
    } finally {
        this.buildingQueue = false; // Reset flag
    }
  }

  async findNextTrack(currentItem) {
    try {
      const allTracks = this.audioService.state.allTracks;
      if (!allTracks || allTracks.length === 0) {
        console.warn('[AutoDJEngine] No tracks available in library to match clockwheel criteria.');
        return null;
      }
      
      // Use clockwheel-based selection by filtering all tracks with the current item's criteria
      let candidateTracks = this.getTracksFromClockwheel(allTracks, currentItem);
      
      if (candidateTracks.length === 0) {
        console.log(`[AutoDJEngine] No tracks found matching strict clockwheel criteria for type: ${currentItem.type}.`);
        return null; // Let buildQueue handle fallback by calling findFallbackTrack
      }
      
      // Shuffle and try tracks until we find a compliant one
      const shuffledTracks = shuffle(candidateTracks);
      
      for (const track of shuffledTracks.slice(0, Math.min(shuffledTracks.length, 20))) { // Try up to 20 tracks for compliance
        try {
          const complianceCheck = await complianceEngine.canPlayTrack(
            track, 
            this.audioService.state.currentScheduledShow
          );
          
          if (complianceCheck.canPlay) {
            console.log(`[AutoDJEngine] ✅ Selected compliant track for clockwheel item: ${track.title} by ${track.artist}`);
            return track;
          } else {
            // console.log(`[AutoDJEngine] ❌ Track blocked for clockwheel item: ${track.title} - ${complianceCheck.violations.map(v => v.message).join(', ')}`);
            // Avoid excessive logging for blocked tracks during primary search for better performance
          }
        } catch (complianceError) {
          console.warn(`[AutoDJEngine] Compliance check failed for clockwheel track ${track.title}:`, complianceError);
          // Continue to next track instead of failing completely due to a compliance engine error
        }
      }
      
      console.warn('[AutoDJEngine] No compliant tracks found for clockwheel item after trying candidates.');
      return null; // Let buildQueue handle fallback
      
    } catch (error) {
      console.error('[AutoDJEngine] Error finding next track for clockwheel item:', error);
      return null;
    }
  }

  async findFallbackTrack() {
    console.log('[AutoDJEngine] 🚨 Searching for any suitable fallback track...');
    const allTracks = this.audioService.state.allTracks;

    if (!allTracks || allTracks.length === 0) {
        console.error('[AutoDJEngine] FATAL: Cannot find fallback track because library is empty.');
        return null;
    }
    
    // Filter for basic playable music tracks (ensure they have a file_url)
    const allPlayableMusicTracks = allTracks.filter(t => t.track_type === 'music' && t.file_url);

    if (allPlayableMusicTracks.length === 0) {
        console.error('[AutoDJEngine] FATAL: No playable music tracks found in library for fallback.');
        return null;
    }

    const shuffled = shuffle(allPlayableMusicTracks);

    // 1. First Pass: Try to find a compliant track
    console.log('[AutoDJEngine] Fallback Pass 1: Searching for a compliant music track.');
    for (const track of shuffled) {
        try {
            const complianceCheck = await complianceEngine.canPlayTrack(track, this.audioService.state.currentScheduledShow);
            if (complianceCheck.canPlay) {
                console.log(`[AutoDJEngine] ✅ Found compliant fallback track: ${track.title}`);
                return track;
            } else {
                // console.log(`[AutoDJEngine] ❌ Fallback track blocked: ${track.title} - ${complianceCheck.violations.map(v => v.message).join(', ')}`);
            }
        } catch (complianceError) {
            console.warn(`[AutoDJEngine] Compliance check failed for fallback track ${track.title}:`, complianceError);
        }
    }
    
    // 2. Desperation Mode: If no compliant track is found, play *anything* to avoid dead air.
    console.warn('[AutoDJEngine] ⚠️ No compliant track found during fallback. Entering Desperation Mode to avoid dead air. Compliance rules will be ignored for this track.');
    
    // The shuffled array already exists, just return the first one. It's guaranteed to exist because of the allPlayableMusicTracks check above.
    const desperationTrack = shuffled[0];
    console.log(`[AutoDJEngine] ✅ Found desperation mode track: ${desperationTrack.title}. Playing this to keep the station live.`);
    return desperationTrack;
  }

  // Modified to accept allTracks and currentItem explicitly for better reusability
  getTracksFromClockwheel(allTracks, currentItem) {
    if (!currentItem) {
      console.error("[AutoDJEngine] getTracksFromClockwheel called without a currentItem.");
      return [];
    }
    
    let filteredTracks = allTracks.filter(track => {
      // Basic type filter
      if (track.track_type !== currentItem.type) {
        return false;
      }
      
      // Must have a file URL to be playable
      if (!track.file_url) {
        return false;
      }
      
      // Genre filter for music
      if (currentItem.type === 'music' && currentItem.genre_filter && currentItem.genre_filter.length > 0) {
        if (!currentItem.genre_filter.includes(track.genre)) {
          return false;
        }
      }
      
      // Energy filter for music
      if (currentItem.type === 'music' && currentItem.energy_filter && currentItem.energy_filter.length > 0) {
        if (!currentItem.energy_filter.includes(track.energy_level)) {
          return false;
        }
      }
      
      // For station_id and commercial, ensure they are playable (already covered by file_url, but good for clarity)
      if ((currentItem.type === 'station_id' || currentItem.type === 'commercial') && !track.file_url) {
        return false;
      }

      return true;
    });
    
    console.log(`[AutoDJEngine] Found ${filteredTracks.length} tracks matching clockwheel criteria for type: ${currentItem.type}`);
    return filteredTracks;
  }

  async playNext() {
    if (!this.isActive) return;
    
    console.log('[AutoDJEngine] 🎵 AutoDJ playing next track');
    
    // Ensure queue is built (this call will now fill up the queue to targetLength if not already)
    await this.buildQueue();
    
    if (this.audioService.state.queue.length > 0) {
      await this.audioService.handleSkipNext();
    } else {
      console.warn('[AutoDJEngine] No tracks in queue to play. Attempting emergency play via fallback.');
      
      // Emergency: Try to get any track from findFallbackTrack
      const emergencyTrack = await this.findFallbackTrack();
      
      if (emergencyTrack) {
        console.log('[AutoDJEngine] 🚨 Emergency fallback - playing track to prevent dead air.');
        await this.audioService.playTrack(emergencyTrack);
      } else {
        console.error('[AutoDJEngine] 🚨 CRITICAL: No playable tracks found in library for emergency play. AutoDJ stopped.');
        this.stop(); // Stop if even emergency fallback fails
      }
    }
  }

  configure(settings) {
    console.log('[AutoDJEngine] 🔧 Configuring AutoDJ with settings:', settings);
    
    if (settings.targetQueueLength !== undefined) {
      if (typeof settings.targetQueueLength === 'number' && settings.targetQueueLength >= 1) {
        this.targetQueueLength = settings.targetQueueLength;
      } else {
        console.warn('[AutoDJEngine] Invalid targetQueueLength provided, must be a number >= 1.');
      }
    }
    
    if (settings.crossfadeEnabled !== undefined) {
      this.crossfadeEnabled = settings.crossfadeEnabled;
    }
    
    if (settings.crossfadeDuration !== undefined) {
      if (typeof settings.crossfadeDuration === 'number' && settings.crossfadeDuration >= 0) {
        this.crossfadeDuration = settings.crossfadeDuration * 1000; // Convert to milliseconds
      } else {
        console.warn('[AutoDJEngine] Invalid crossfadeDuration provided, must be a number >= 0.');
      }
    }
    
    // Trigger queue rebuild with new settings if active
    if (this.isActive) {
      this.buildQueue();
    }
  }
}

export default AutoDJEngine;
