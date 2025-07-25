
import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Track, Show, Clockwheel, QueueState } from "@/api/entities";
import { User } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";
import _ from 'lodash';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, Music, Loader2, RefreshCw, Zap
} from 'lucide-react';
import { postTweet } from '@/api/functions';
import { useCustomization } from '../settings/CustomizationProvider';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider.');
  }
  return context;
};

// Define a minimal CrossfadeEngine component to make the file compile
// This component is a placeholder based on the outline.
// In a real application, this would contain logic for crossfading audio or visuals,
// potentially using the `useAudio` context to control the crossfaderPosition.
const CrossfadeEngine = () => {
  return null;
};

const initialDeckState = {
    track: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    isLoading: false,
    error: null,
    blobUrl: null,
};

export const AudioProvider = ({ children }) => {
  const { toast } = useToast();
  const { settings, getStationName } = useCustomization(); // Get customization context

  // Core player state for two decks - STABLE REFS
  const [deckA, setDeckA] = useState(initialDeckState);
  const [deckB, setDeckB] = useState(initialDeckState);
  const [activeDeck, setActiveDeck] = useState('A');

  // Global state
  const [volume, setVolume] = useState(75);
  const [globalError, setGlobalError] = useState(null);
  const [crossfaderPosition, setCrossfaderPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Library and queue state
  const [tracks, setTracks] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);
  const [queueState, setQueueState] = useState(null);

  // Automation state
  const [isAutoDJ, setIsAutoDJ] = useState(false);
  const [currentScheduledShow, setCurrentScheduledShow] = useState(null);
  const [isGapKillerActive, setIsGapKillerActive] = useState(false);
  const [gapKillerTracks, setGapKillerTracks] = useState([]);

  // Add CrossfadeEngine integration
  const [autoCrossfadeEnabled, setAutoCrossfadeEnabled] = useState(true);

  // Enhanced AutoDJ with Real-time Rotation Mode
  const [rotationMode, setRotationMode] = useState(true); // Real-time Rotation Mode (2012)
  const [dynamicScheduling, setDynamicScheduling] = useState(true);

  // Audio processing state
  const [isCompressorActive, setIsCompressorActive] = useState(true);
  const [compressorSettings, setCompressorSettings] = useState({
    threshold: -24,
    ratio: 12,
    attack: 0.003,
    release: 0.25,
    knee: 30,
    makeupGain: 6,
    name: 'Default Broadcast',
  });

  // Monitoring State
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // Live input state
  const [isMicOn, setIsMicOn] = useState(false);
  const [micDeviceId, setMicDeviceId] = useState('');
  const [micVolume, setMicVolume] = useState(80);
  const [isLineInOn, setIsLineInOn] = useState(false);
  const [lineInUrl, setLineInUrl] = useState('');
  const [lineInVolume, setLineInVolume] = useState(80);

  // Audio refs - STABLE
  const audioRefA = useRef(null);
  const audioRefB = useRef(null);
  const monitorAudioRef = useRef(null);
  const soundEffectRef = useRef(null);
  const lineInAudioRef = useRef(null); // New ref for Line In audio element

  // Web Audio API refs
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const sourceARef = useRef(null);
  const gainARef = useRef(null);
  const sourceBRef = useRef(null);
  const gainBRef = useRef(null);
  const micStreamRef = useRef(null);
  const micSourceNodeRef = useRef(null);
  const micGainNodeRef = useRef(null);
  const lineInSourceNodeRef = useRef(null);
  const lineInGainNodeRef = useRef(null);

  // Crossfade timer ref
  const crossfadeTimerRef = useRef(null);

  // AutoDJ state refs for stable access
  const autoDJRef = useRef({
    isActive: false,
    lastTrackEndTime: null,
    preloadTimer: null,
    transitionTimer: null,
    currentQueue: [],
    playedTracks: [],
    isPreloading: false
  });

  // STABLE state reference
  const stableStateRef = useRef({
    deckA: initialDeckState,
    deckB: initialDeckState,
    activeDeck: 'A',
    isAutoDJ: false,
    isTransitioning: false,
    queue: [],
    playHistory: [],
    tracks: []
  });

  // Update stable state ref whenever state changes
  useEffect(() => {
    stableStateRef.current = {
      deckA,
      deckB,
      activeDeck,
      isAutoDJ,
      isTransitioning,
      queue,
      playHistory,
      tracks: allTracks
    };
    autoDJRef.current.isActive = isAutoDJ;
    autoDJRef.current.currentQueue = queue;
    autoDJRef.current.isTransitioning = isTransitioning;
  }, [deckA, deckB, activeDeck, isAutoDJ, isTransitioning, queue, playHistory, allTracks]);

  // Derived state
  const isVoiceTrackPlaying = (deckA.isPlaying && deckA.track?.track_type === 'voice_track') ||
                               (deckB.isPlaying && deckB.track?.track_type === 'voice_track');
  const isPlaying = deckA.isPlaying || deckB.isPlaying;
  const currentTrack = activeDeck === 'A' ? deckA.track : deckB.track;

  // STABLE deck state updater
  const updateDeckState = useCallback((deckId, newState) => {
    if (deckId === 'A') {
      setDeckA(prev => {
        const updated = { ...prev, ...newState };
        stableStateRef.current.deckA = updated;
        return updated;
      });
    } else {
      setDeckB(prev => {
        const updated = { ...prev, ...newState };
        stableStateRef.current.deckB = updated;
        return updated;
      });
    }
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    const initializeAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') return; // Check if already initialized or closed

      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = context;

        // Master Gain Node
        masterGainRef.current = context.createGain();
        masterGainRef.current.connect(context.destination);

        // Deck A
        if (audioRefA.current) {
          sourceARef.current = context.createMediaElementSource(audioRefA.current);
          gainARef.current = context.createGain();
          sourceARef.current.connect(gainARef.current).connect(masterGainRef.current);
        }
        // Deck B
        if (audioRefB.current) {
          sourceBRef.current = context.createMediaElementSource(audioRefB.current);
          gainBRef.current = context.createGain();
          sourceBRef.current.connect(gainBRef.current).connect(masterGainRef.current);
        }
        // Line In
        if (lineInAudioRef.current) {
          lineInSourceNodeRef.current = context.createMediaElementSource(lineInAudioRef.current);
          lineInGainNodeRef.current = context.createGain();
          lineInSourceNodeRef.current.connect(lineInGainNodeRef.current).connect(masterGainRef.current);
        }
        console.log("Web Audio Context initialized.");
      } catch (e) {
        console.error("Web Audio API initialization failed:", e);
        setGlobalError("Web Audio API is not supported or failed to initialize.");
      }
    };

    // We need a user interaction to start the AudioContext
    // This event listener will ensure the context is resumed/initialized on first click
    const clickHandler = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => console.log("AudioContext resumed on user gesture."));
      } else if (!audioContextRef.current) {
        initializeAudioContext();
      }
    };

    document.body.addEventListener('click', clickHandler, { once: true });

    return () => {
      document.body.removeEventListener('click', clickHandler);
      if (crossfadeTimerRef.current) {
        clearInterval(crossfadeTimerRef.current);
      }
      // Clean up AudioContext on component unmount
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().then(() => console.log("AudioContext closed.")).catch(console.error);
      }
    }
  }, []);

  // STABLE load track function - MOVED UP BEFORE USE
  const loadTrack = useCallback(async (deckId, track) => {
    if (!track?.file_url) {
      updateDeckState(deckId, { error: 'Track has no valid audio URL.', isLoading: false });
      return;
    }

    console.log(`[AudioProvider] Loading track to Deck ${deckId}:`, track.title);

    const currentDeckState = deckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;
    if (currentDeckState.blobUrl) {
      URL.revokeObjectURL(currentDeckState.blobUrl);
    }

    updateDeckState(deckId, {
      isLoading: true,
      error: null,
      track: track,
      blobUrl: null,
      progress: 0,
      duration: 0
    });

    try {
      const audio = deckId === 'A' ? audioRefA.current : audioRefB.current;
      if (audio) {
        audio.pause();
        audio.src = ''; // Clear source to ensure re-load
        audio.load(); // Load cleared source
        audio.src = track.file_url; // Set new source

        await new Promise((resolve, reject) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve();
          };

          const onError = (e) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error(`Audio element error: ${e.message || e.type}`));
          };

          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
          audio.load(); // Trigger loading
        });
      }

      updateDeckState(deckId, { isLoading: false });

    } catch (err) {
      console.error(`[AudioProvider] Failed to load track to Deck ${deckId}:`, err);
      updateDeckState(deckId, {
        error: `Failed to load track: ${err.message}`,
        isLoading: false,
        track: null
      });
    }
  }, [updateDeckState]);

  // STABLE eject function
  const ejectTrack = useCallback((deckId) => {
    const audioRef = deckId === 'A' ? audioRefA.current : audioRefB.current;
    const deckCurrentState = deckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;

    if (audioRef) {
      audioRef.pause();
      audioRef.src = '';
      audioRef.load();
    }

    // Removed specific blobUrl check for monitor, as monitoring isn't tied to blobURLs anymore
    // No change needed for monitorAudioRef here, it's a separate output.

    if (deckCurrentState.blobUrl) {
      URL.revokeObjectURL(deckCurrentState.blobUrl);
    }

    updateDeckState(deckId, initialDeckState);
  }, [updateDeckState]);

  // Helper function to get current scheduled show
  const getCurrentScheduledShow = useCallback(() => {
    // This would query the Show entity based on current time
    // For now, return null - future enhancement
    return null;
  }, []);

  // Helper function to calculate track selection weight
  const calculateTrackWeight = useCallback((track, playHistory) => {
    let weight = 100; // Base weight

    // Reduce weight for recently played tracks
    const timesPlayedRecently = playHistory.slice(0, 20).filter(h => h.id === track.id).length;
    weight -= timesPlayedRecently * 25;

    // Boost weight for tracks that haven't been played much
    const totalPlays = track.play_count_total || 0;
    if (totalPlays < 5) {
      weight += 20; // Boost newer/less-played tracks
    }

    // Boost weight based on energy level match
    const now = new Date();
    const currentHour = now.getHours();
    if (
      (currentHour >= 6 && currentHour <= 9 && track.energy_level === 'high') ||
      (currentHour >= 10 && currentHour <= 15 && track.energy_level === 'medium') ||
      (currentHour >= 16 && currentHour <= 19 && track.energy_level === 'high') ||
      (currentHour >= 20 && currentHour <= 23 && track.energy_level === 'medium') ||
      ((currentHour < 6 || currentHour >= 24) && track.energy_level === 'low')
    ) {
      weight += 15;
    }

    return Math.max(1, weight); // Ensure minimum weight of 1
  }, []);

  // Enhanced track selection with programming rules
  const selectNextTrackIntelligently = useCallback(() => {
    console.log('[AutoDJ] Selecting next track intelligently...');
    
    const { tracks: availableTracks, playHistory } = stableStateRef.current;
    
    if (availableTracks.length === 0) {
      console.warn('[AutoDJ] No tracks available for selection');
      return null;
    }

    // Get current time and day for scheduling context
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    console.log(`[AutoDJ] Current time context: ${currentDay} ${currentHour}:00`);

    // 1. Filter by track type - prioritize music for AutoDJ
    let candidateTracks = availableTracks.filter(track => 
      track.track_type === 'music' && track.duration > 30
    );

    // 2. Apply time-of-day energy level rules
    let preferredEnergyLevel;
    if (currentHour >= 6 && currentHour <= 9) {
      preferredEnergyLevel = 'high'; // Morning drive time
    } else if (currentHour >= 10 && currentHour <= 15) {
      preferredEnergyLevel = 'medium'; // Midday
    } else if (currentHour >= 16 && currentHour <= 19) {
      preferredEnergyLevel = 'high'; // Afternoon drive
    } else if (currentHour >= 20 && currentHour <= 23) {
      preferredEnergyLevel = 'medium'; // Evening
    } else {
      preferredEnergyLevel = 'low'; // Late night/early morning
    }

    // Filter by energy level if available
    const energyFilteredTracks = candidateTracks.filter(track => 
      track.energy_level === preferredEnergyLevel || !track.energy_level
    );
    
    if (energyFilteredTracks.length > 0) {
      candidateTracks = energyFilteredTracks;
      console.log(`[AutoDJ] Filtered to ${candidateTracks.length} tracks by energy level: ${preferredEnergyLevel}`);
    }

    // 3. Apply artist separation rules (don't repeat same artist within last 5 tracks)
    const recentArtists = playHistory.slice(0, 5).map(track => 
      track.artist?.toLowerCase().trim()
    ).filter(Boolean);

    const artistSeparatedTracks = candidateTracks.filter(track => 
      !recentArtists.includes(track.artist?.toLowerCase().trim())
    );

    if (artistSeparatedTracks.length > 0) {
      candidateTracks = artistSeparatedTracks;
      console.log(`[AutoDJ] Applied artist separation: ${candidateTracks.length} tracks remaining`);
    }

    // 4. Apply genre/category rotation rules
    const recentCategories = playHistory.slice(0, 3).map(track => 
      track.category?.toLowerCase()
    ).filter(Boolean);

    // Try to avoid repeating the same category too frequently
    const categoryRotatedTracks = candidateTracks.filter(track => {
      const trackCategory = track.category?.toLowerCase();
      return !trackCategory || !recentCategories.includes(trackCategory);
    });

    if (categoryRotatedTracks.length > 0) {
      candidateTracks = categoryRotatedTracks;
      console.log(`[AutoDJ] Applied category rotation: ${candidateTracks.length} tracks remaining`);
    }

    // 5. Apply tempo/BPM flow rules (avoid jarring tempo changes)
    const currentTrack = stableStateRef.current.activeDeck === 'A' ? 
      stableStateRef.current.deckA.track : stableStateRef.current.deckB.track;

    if (currentTrack?.bpm && currentTrack.bpm > 0) {
      const currentBPM = currentTrack.bpm;
      
      // Prefer tracks within ±20 BPM of current track for smooth flow
      const tempoMatchedTracks = candidateTracks.filter(track => {
        if (!track.bpm || track.bpm <= 0) return true; // Include tracks without BPM data
        const bpmDiff = Math.abs(track.bpm - currentBPM);
        return bpmDiff <= 20;
      });

      if (tempoMatchedTracks.length > 0) {
        candidateTracks = tempoMatchedTracks;
        console.log(`[AutoDJ] Applied tempo matching (±20 BPM from ${currentBPM}): ${candidateTracks.length} tracks`);
      }
    }

    // 6. Apply scheduled show context if available
    // This would integrate with clockwheel programming
    const currentScheduledShow = getCurrentScheduledShow();
    if (currentScheduledShow?.clockwheel_id) {
      // Future enhancement: filter by clockwheel requirements
      console.log(`[AutoDJ] Show context: ${currentScheduledShow.name}`);
    }

    // 7. Final selection with weighted randomization
    if (candidateTracks.length === 0) {
      console.warn('[AutoDJ] No tracks passed all filters, falling back to basic music selection');
      candidateTracks = availableTracks.filter(track => track.track_type === 'music');
    }

    if (candidateTracks.length === 0) {
      console.error('[AutoDJ] No music tracks available at all');
      return null;
    }

    // Weighted selection favoring newer or less-played tracks
    const weightedTracks = candidateTracks.map(track => ({
      track,
      weight: calculateTrackWeight(track, playHistory)
    }));

    // Sort by weight (higher weight = more likely to be selected)
    weightedTracks.sort((a, b) => b.weight - a.weight);

    // Select from top 30% of weighted tracks for variety
    const topCandidates = weightedTracks.slice(0, Math.max(1, Math.ceil(weightedTracks.length * 0.3)));
    const selectedTrack = topCandidates[Math.floor(Math.random() * topCandidates.length)].track;

    console.log(`[AutoDJ] Selected: "${selectedTrack.title}" by ${selectedTrack.artist} (Category: ${selectedTrack.category})`);
    return selectedTrack;
  }, [getCurrentScheduledShow, calculateTrackWeight]);

  // STABLE play function
  const playTrack = useCallback(async (deckId) => {
    const currentDeck = deckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;
    const audio = deckId === 'A' ? audioRefA.current : audioRefB.current;

    if (!currentDeck.track || !audio || !audioContextRef.current) return;

    // Resume context if suspended (important for user interaction)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      await audio.play();
      setActiveDeck(deckId);
      console.log(`[AudioProvider] Started playing on Deck ${deckId}:`, currentDeck.track.title);

      // Add to play history and remove from queue if it was the first item
      const { queue: currentQueue } = stableStateRef.current;
      if (currentQueue[0]?.id === currentDeck.track.id) {
          setPlayHistory(prev => [currentQueue[0], ...prev.slice(0, 49)]);
          setQueue(prev => prev.slice(1));
      }

      // Auto-Tweet Logic
      if (settings?.twitter_auto_post_enabled && currentDeck.track.track_type === 'music') {
        const template = settings.twitter_now_playing_template || '';
        const stationName = getStationName();
        const tweetText = template
          .replace('{title}', currentDeck.track.title)
          .replace('{artist}', currentDeck.track.artist)
          .replace('{stationName}', stationName);

        try {
          console.log(`[Twitter] Auto-posting: ${tweetText}`);
          await postTweet({ status: tweetText });
          toast({ title: "Tweet Sent", description: "Now Playing update posted to Twitter." });
        } catch (tweetError) {
          console.error("[Twitter] Failed to auto-post tweet:", tweetError);
          toast({ variant: "destructive", title: "Twitter Error", description: "Failed to post Now Playing update." });
        }
      }

    } catch (err) {
      console.error(`[AudioProvider] Play failed on Deck ${deckId}:`, err);
      updateDeckState(deckId, { isPlaying: false, error: `Playback failed: ${err.message}` });
    }
  }, [updateDeckState, settings, getStationName, toast, setPlayHistory, setQueue]);

  const pauseTrack = useCallback((deckId) => {
    const audio = deckId === 'A' ? audioRefA.current : audioRefB.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const seekDeck = useCallback((deckId, time) => {
    const audio = deckId === 'A' ? audioRefA.current : audioRefB.current;
    if (audio && !isNaN(time) && time >= 0 && time <= audio.duration) {
      audio.currentTime = time;
    }
  }, []);

  // Separate crossfade execution logic
  const startCrossfadeExecution = useCallback((fromDeckId, toDeckId) => {
    console.log(`[AutoDJ] Executing crossfade from Deck ${fromDeckId} to Deck ${toDeckId}`);
    setIsTransitioning(true);
    playTrack(toDeckId);
    
    const transitionDuration = (settings?.default_crossfade_time || 3) * 1000;
    const intervalTime = 50;
    const steps = transitionDuration / intervalTime;
    const stepValue = 200 / steps;

    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
    }

    crossfadeTimerRef.current = setInterval(() => {
      setCrossfaderPosition(prevPos => {
        let newPos;
        if (fromDeckId === 'A') {
          newPos = prevPos + stepValue;
          if (newPos >= 100) {
            clearInterval(crossfadeTimerRef.current);
            setCrossfaderPosition(100); // Ensure it snaps to 100
            setIsTransitioning(false);
            // Eject the faded-out track after successful crossfade
            setTimeout(() => ejectTrack('A'), 2000); // Give 2 seconds for sound to fully fade
            return 100;
          }
        } else {
          newPos = prevPos - stepValue;
          if (newPos <= -100) {
            clearInterval(crossfadeTimerRef.current);
            setCrossfaderPosition(-100); // Ensure it snaps to -100
            setIsTransitioning(false);
            // Eject the faded-out track after successful crossfade
            setTimeout(() => ejectTrack('B'), 2000); // Give 2 seconds for sound to fully fade
            return -100;
          }
        }
        return newPos;
      });
    }, intervalTime);
  }, [playTrack, ejectTrack, settings?.default_crossfade_time, setCrossfaderPosition, setIsTransitioning]);

  // START: Cue-based Crossfade Logic
  const startCrossfade = useCallback(() => {
    const fromDeckId = stableStateRef.current.activeDeck;
    const toDeckId = fromDeckId === 'A' ? 'B' : 'A';

    let toDeck = toDeckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;
    
    // If the target deck doesn't have a track, intelligently select one
    if (!toDeck.track) {
      console.log(`[AutoDJ] Target deck ${toDeckId} is empty, selecting intelligent track`);
      
      const nextTrack = selectNextTrackIntelligently();
      if (nextTrack) {
        console.log(`[AutoDJ] Loading intelligent selection: "${nextTrack.title}" to Deck ${toDeckId}`);
        loadTrack(toDeckId, nextTrack);
        
        // Wait a moment for the track to load before starting crossfade
        setTimeout(() => {
          const updatedToDeck = toDeckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;
          if (updatedToDeck.track && !updatedToDeck.isLoading) {
            startCrossfadeExecution(fromDeckId, toDeckId);
          } else {
            console.warn(`[AutoDJ] Failed to load track to Deck ${toDeckId}, cannot crossfade`);
          }
        }, 1000); // Allow 1 second for track to load
        return;
      } else {
        console.warn(`[AutoDJ] No intelligent track selection possible, checking queue`);
        
        // Fallback to queue if intelligent selection fails
        const { queue: currentQueue } = stableStateRef.current;
        if (currentQueue.length > 0) {
          console.log(`[AutoDJ] Loading queued track: "${currentQueue[0].title}" to Deck ${toDeckId}`);
          loadTrack(toDeckId, currentQueue[0]);
          
          setTimeout(() => {
            const updatedToDeck = toDeckId === 'A' ? stableStateRef.current.deckA : stableStateRef.current.deckB;
            if (updatedToDeck.track && !updatedToDeck.isLoading) {
              startCrossfadeExecution(fromDeckId, toDeckId);
            } else {
              console.warn(`[AutoDJ] Failed to load queued track to Deck ${toDeckId}, cannot crossfade`);
            }
          }, 1000); // Allow 1 second for track to load
          return;
        } else {
          console.error(`[AutoDJ] No tracks available for crossfade`);
          return;
        }
      }
    }
    
    // If target deck already has a track, proceed with crossfade
    startCrossfadeExecution(fromDeckId, toDeckId);
  }, [selectNextTrackIntelligently, loadTrack, startCrossfadeExecution]);
  // END: Cue-based Crossfade Logic

  // Queue management with throttling
  const queueUpdateTimeoutRef = useRef(null);
  const pendingQueueUpdate = useRef(null);

  const updateQueueState = useCallback(async (newItems) => {
    if (!queueState) return;

    pendingQueueUpdate.current = newItems;

    if (queueUpdateTimeoutRef.current) {
      clearTimeout(queueUpdateTimeoutRef.current);
    }

    queueUpdateTimeoutRef.current = setTimeout(async () => {
      const itemsToUpdate = pendingQueueUpdate.current;
      if (!itemsToUpdate) return;

      try {
        const updatedRecord = await QueueState.update(queueState.id, { items: itemsToUpdate });
        setQueueState(updatedRecord);
        pendingQueueUpdate.current = null;
      } catch (error) {
        console.error('[Queue] Failed to update queue state:', error);
        if (error.message?.includes('Rate limit')) {
          setTimeout(() => {
            if (pendingQueueUpdate.current) {
              updateQueueState(pendingQueueUpdate.current);
            }
          }, 3000);
        }
      }
    }, 1000);
  }, [queueState]);

  // Real-time Rotation Mode - Dynamic track selection based on listener behavior
  // This function is now superseded by selectNextTrackIntelligently
  // But kept for context if any other part uses it directly outside autoDJ.
  const selectNextTrackIntelligentlyOld = useCallback(() => {
    if (!rotationMode) return null;

    const availableTracks = stableStateRef.current.tracks.filter(t => t.track_type === 'music');
    if (availableTracks.length === 0) return null;

    // Simulate intelligent track selection based on:
    // 1. Time of day
    // 2. Recent play history
    // 3. Energy level progression
    // 4. Audience analytics (if available)

    const currentHour = new Date().getHours();
    let preferredEnergyLevel;

    if (currentHour >= 6 && currentHour <= 9) {
      preferredEnergyLevel = 'high'; // Morning drive time
    } else if (currentHour >= 10 && currentHour <= 15) {
      preferredEnergyLevel = 'medium'; // Midday
    } else if (currentHour >= 16 && currentHour <= 19) {
      preferredEnergyLevel = 'high'; // Afternoon drive
    } else {
      preferredEnergyLevel = 'low'; // Evening/night
    }

    // Filter tracks by preferred energy level
    const energyFilteredTracks = availableTracks.filter(t =>
      t.energy_level === preferredEnergyLevel || !t.energy_level
    );

    const tracksToChooseFrom = energyFilteredTracks.length > 0 ? energyFilteredTracks : availableTracks;

    // Avoid recently played tracks (artist separation)
    const recentlyPlayedArtists = stableStateRef.current.playHistory
      .slice(0, 10)
      .map(t => t.artist?.toLowerCase())
      .filter(Boolean);

    const separatedTracks = tracksToChooseFrom.filter(t =>
      !recentlyPlayedArtists.includes(t.artist?.toLowerCase())
    );

    const finalTrackPool = separatedTracks.length > 0 ? separatedTracks : tracksToChooseFrom;

    // Select random track from the intelligently filtered pool
    return finalTrackPool[Math.floor(Math.random() * finalTrackPool.length)];
  }, [rotationMode]);

  // Initialize system
  useEffect(() => {
    const initialize = async () => {
      try {
        const fetchedTracks = await Track.list('-created_date', 5000);
        setTracks(fetchedTracks);
        setAllTracks(fetchedTracks);

        const fillers = fetchedTracks.filter(t => t.track_type === 'gap_filler');
        setGapKillerTracks(fillers);

        const user = await User.me();
        if (user?.organization_id) {
          const existingStates = await QueueState.filter({ organization_id: user.organization_id });

          if (existingStates.length > 0) {
            setQueueState(existingStates[0]);
            const trackIds = existingStates[0].items || [];
            if (trackIds.length > 0) {
              const trackDetails = await Track.filter({ id: { $in: trackIds } });
              const orderedTracks = trackIds
                .map(id => trackDetails.find(t => t.id === id))
                .filter(Boolean);
              setQueue(orderedTracks);
            }
          } else {
            const newQueue = await QueueState.create({
              organization_id: user.organization_id,
              items: []
            });
            setQueueState(newQueue);
          }
        }
      } catch (error) {
        console.error('[AudioProvider] Initialization failed:', error);
        setGlobalError("Failed to initialize audio system.");
      }
    };
    initialize();
  }, []);

  // Auto-load next track from queue to the inactive deck or intelligently select
  useEffect(() => {
    // 1. When AutoDJ is active and queue is empty, intelligently pre-load next track
    if (queue.length === 0 && isAutoDJ) {
      const inactiveDeckId = activeDeck === 'A' ? 'B' : 'A';
      const inactiveDeck = inactiveDeckId === 'A' ? deckA : deckB;
      
      // Only load if the inactive deck is truly empty and not already loading
      if (!inactiveDeck.track && !inactiveDeck.isLoading) {
        const nextTrack = selectNextTrackIntelligently();
        if (nextTrack) {
          console.log(`[AutoDJ] Pre-loading intelligent selection to Deck ${inactiveDeckId}: "${nextTrack.title}"`);
          loadTrack(inactiveDeckId, nextTrack);
        } else {
          console.warn('[AutoDJ] Intelligent selection yielded no track for pre-load.');
        }
      }
      return; // Exit as this condition is handled
    }

    // 2. Original queue-based auto-load logic (if queue is not empty, or AutoDJ is off)
    if (queue.length === 0) { // No tracks in queue to load
      return;
    }

    const inactiveDeckId = activeDeck === 'A' ? 'B' : 'A';
    const inactiveDeck = inactiveDeckId === 'A' ? deckA : deckB;

    // If the inactive deck already has a track, do nothing.
    if (inactiveDeck.track) {
      return;
    }

    // Get the next track from the top of the queue.
    const nextTrack = queue[0];
    
    // Load the track into the inactive deck.
    if (nextTrack) {
        console.log(`[Queue Logic] Auto-loading next track "${nextTrack.title}" to Deck ${inactiveDeckId}.`);
        loadTrack(inactiveDeckId, nextTrack);
    }
  }, [queue, activeDeck, deckA.track, deckB.track, loadTrack, isAutoDJ, selectNextTrackIntelligently]);

  // STABLE audio event handlers - ONCE ONLY
  useEffect(() => {
    const setupStableAudioEvents = (audio, deckId) => {
      if (!audio) return () => {};

      const handlePlay = () => {
        updateDeckState(deckId, { isPlaying: true });
        console.log(`[AudioPlayer] Deck ${deckId} started playing`);
      };

      const handlePause = () => {
        updateDeckState(deckId, { isPlaying: false });
        console.log(`[AudioPlayer] Deck ${deckId} paused`);
      };

      const handleEnded = () => {
        console.log(`[AudioPlayer] Deck ${deckId} ended`);
        updateDeckState(deckId, { isPlaying: false, progress: 0 });

        // AutoDJ logic - handle track ending (this will only be hit if outro_time is 0 or not configured)
        if (autoDJRef.current.isActive && deckId === stableStateRef.current.activeDeck && !stableStateRef.current.isTransitioning) {
          console.log(`[AutoDJ] Track ended on active deck ${deckId} (no cue point or outro_time 0), initiating instant transition.`);
          startCrossfade(); // Trigger a crossfade even if it's a hard cut
        }
      };

      const handleLoadedMetadata = () => {
        updateDeckState(deckId, { duration: audio.duration || 0, isLoading: false });
        console.log(`[AudioPlayer] Deck ${deckId} loaded metadata, duration: ${audio.duration}s`);
      };

      const handleTimeUpdate = () => {
        if (audio.duration && audio.duration > 0) {
          const progress = (audio.currentTime / audio.duration) * 100;
          updateDeckState(deckId, { progress: Math.min(100, Math.max(0, progress)) });
        }

        const { deckA, deckB, activeDeck, isAutoDJ, isTransitioning: isCurrentlyTransitioning } = stableStateRef.current;

        // AutoDJ cue-point check (the core of this feature)
        if (isAutoDJ && !isCurrentlyTransitioning && deckId === activeDeck) {
          const track = deckId === 'A' ? deckA.track : deckB.track;

          // Only trigger if track has a defined outro_time > 0
          if (track && typeof track.outro_time === 'number' && track.outro_time > 0) {
            const cuePoint = track.duration - track.outro_time;
            if (audio.currentTime >= cuePoint) {
              console.log(`[AutoDJ] Cue point hit on Deck ${deckId}. Starting transition.`);
              startCrossfade();
            }
          }
        }
      };

      const handleLoadStart = () => updateDeckState(deckId, { isLoading: true, error: null });
      const handleCanPlay = () => updateDeckState(deckId, { isLoading: false });
      const handleError = (e) => {
        console.error(`[AudioPlayer] Deck ${deckId} error:`, e);
        updateDeckState(deckId, { error: 'Audio playback error', isLoading: false, isPlaying: false });
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    };

    const cleanupA = setupStableAudioEvents(audioRefA.current, 'A');
    const cleanupB = setupStableAudioEvents(audioRefB.current, 'B');

    return () => {
      cleanupA();
      cleanupB();
    };
  }, [updateDeckState, startCrossfade]);

  // Volume control via Web Audio API
  useEffect(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const currentTime = audioContextRef.current.currentTime;

    // Master Volume
    masterGainRef.current.gain.setValueAtTime(volume / 100, currentTime);

    // Crossfader logic (constant power curve)
    // Crossfader position: -100 (A fully on, B off) to 100 (B fully on, A off)
    const normalizedPos = crossfaderPosition / 100; // -1 to 1

    // Deck A gain: 1 at -1, sqrt(0.5) at 0, 0 at 1
    const gainAValue = Math.cos((normalizedPos + 1) * 0.25 * Math.PI);
    // Deck B gain: 0 at -1, sqrt(0.5) at 0, 1 at 1
    const gainBValue = Math.cos((1 - normalizedPos) * 0.25 * Math.PI);

    if (gainARef.current) gainARef.current.gain.setValueAtTime(gainAValue, currentTime);
    if (gainBRef.current) gainBRef.current.gain.setValueAtTime(gainBValue, currentTime);

    // Mic and Line In are not affected by crossfader, only master volume and their own gain
    if (micGainNodeRef.current) micGainNodeRef.current.gain.setValueAtTime(micVolume / 100, currentTime);
    if (lineInGainNodeRef.current) lineInGainNodeRef.current.gain.setValueAtTime(lineInVolume / 100, currentTime);

  }, [volume, crossfaderPosition, micVolume, lineInVolume]);

  // Queue management functions
  const addTrackToQueue = useCallback(async (track, index = -1) => {
    if (!track?.id) return;

    const existingIndex = queue.findIndex(queueTrack => queueTrack.id === track.id);
    if (existingIndex !== -1) return; // Prevent duplicates

    const newQueue = [...queue];
    if (index === -1) {
      newQueue.push(track);
    } else {
      newQueue.splice(index, 0, track);
    }

    setQueue(newQueue);
    const newItems = newQueue.map(t => t.id);
    await updateQueueState(newItems);
  }, [queue, updateQueueState]);

  const removeTrackFromQueue = useCallback(async (index) => {
    if (index < 0 || index >= queue.length) return;

    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    const newItems = newQueue.map(t => t.id);
    await updateQueueState(newItems);
  }, [queue, updateQueueState]);

  const handlePlayNow = useCallback(async (track) => {
    const { deckA: currentDeckA, deckB: currentDeckB } = stableStateRef.current;

    // Choose the non-playing deck, or Deck A as a default
    const targetDeckId = currentDeckA.isPlaying ? 'B' : 'A';
    const otherDeckId = targetDeckId === 'A' ? 'B' : 'A';

    // Stop the other deck if it's playing
    const otherDeckAudio = otherDeckId === 'A' ? audioRefA.current : audioRefB.current;
    if (otherDeckAudio && (otherDeckId === 'A' ? currentDeckA : currentDeckB).isPlaying) {
      otherDeckAudio.pause();
    }
    ejectTrack(otherDeckId);

    // Load and play the requested track
    await loadTrack(targetDeckId, track);
    await playTrack(targetDeckId);

    toast({
      title: "Playing Now",
      description: `${track.title} by ${track.artist}`,
    });
  }, [loadTrack, playTrack, ejectTrack, toast]);

  // AutoDJ toggle with improved logic
  const handleAutoDJToggle = useCallback(async (enabled) => {
    console.log(`[AutoDJ] Toggling to: ${enabled}`);
    setIsAutoDJ(enabled);
    autoDJRef.current.isActive = enabled;

    if (enabled) {
      // Starting AutoDJ
      const { deckA, deckB } = stableStateRef.current;

      // If no tracks are playing, start one
      if (!deckA.isPlaying && !deckB.isPlaying) {
        console.log('[AutoDJ] No tracks playing, starting initial track');
        const initialTrack = selectNextTrackIntelligently();
        if (initialTrack) {
          await loadTrack('A', initialTrack);
          await playTrack('A');
        } else {
          console.warn('[AutoDJ] Could not find an initial track to play intelligently. Checking for any music track.');
          const availableMusicTracks = stableStateRef.current.tracks.filter(t => t.track_type === 'music');
          if (availableMusicTracks.length > 0) {
            const randomTrack = availableMusicTracks[Math.floor(Math.random() * availableMusicTracks.length)];
            await loadTrack('A', randomTrack);
            await playTrack('A');
          } else {
            console.error('[AutoDJ] No music tracks found in library to start AutoDJ.');
            toast({ variant: "destructive", title: "AutoDJ Error", description: "No music tracks available to start AutoDJ." });
            setIsAutoDJ(false); // Turn off AutoDJ if no music can be played
            autoDJRef.current.isActive = false;
          }
        }
      }
    } else {
      // If AutoDJ is disabled, clear any pending crossfade timers
      if (crossfadeTimerRef.current) {
        clearInterval(crossfadeTimerRef.current);
        setCrossfaderPosition(0); // Reset crossfader to center
        setIsTransitioning(false); // End any ongoing transition
      }
    }
  }, [loadTrack, playTrack, setCrossfaderPosition, setIsTransitioning, selectNextTrackIntelligently, toast]);

  const toggleMic = useCallback(async (turnOn) => {
    if (!audioContextRef.current) {
        toast({ variant: "destructive", title: "Audio Not Ready", description: "Click anywhere on the page to initialize the audio engine first." });
        return;
    }
    // Ensure context is running
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (turnOn) {
      if (micStreamRef.current) return; // Already on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: micDeviceId ? { exact: micDeviceId } : undefined } });
        micStreamRef.current = stream;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        micSourceNodeRef.current = source;

        const gain = audioContextRef.current.createGain();
        // Set initial gain based on micVolume state
        gain.gain.setValueAtTime(micVolume / 100, audioContextRef.current.currentTime);
        micGainNodeRef.current = gain;

        source.connect(gain).connect(masterGainRef.current);
        setIsMicOn(true);
        toast({ title: "Microphone ON" });
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setGlobalError(`Mic Error: ${err.message}`);
        setIsMicOn(false); // Ensure state is false if error occurs
        toast({ variant: "destructive", title: "Microphone Error", description: err.message });
      }
    } else {
      if (!micStreamRef.current) return; // Already off
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micSourceNodeRef.current?.disconnect();
      micGainNodeRef.current?.disconnect(); // Disconnect gain node too

      micStreamRef.current = null;
      micSourceNodeRef.current = null;
      micGainNodeRef.current = null;
      setIsMicOn(false);
      toast({ title: "Microphone OFF", variant: 'destructive' });
    }
  }, [micDeviceId, micVolume, toast]);

  const toggleLineIn = useCallback(async (turnOn) => {
    if (!lineInAudioRef.current || !lineInUrl) {
        toast({ variant: "destructive", title: "Line-In Not Configured", description: "Please set a stream URL in Line-In settings." });
        return;
    }
    if (!audioContextRef.current) {
        toast({ variant: "destructive", title: "Audio Not Ready", description: "Click anywhere on the page to initialize the audio engine first." });
        return;
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (turnOn) {
      // Set initial gain for line-in if it's being turned on
      if (lineInGainNodeRef.current) {
        lineInGainNodeRef.current.gain.setValueAtTime(lineInVolume / 100, audioContextRef.current.currentTime);
      }
      lineInAudioRef.current.src = lineInUrl;
      lineInAudioRef.current.load(); // Ensure load is called for new src
      lineInAudioRef.current.play().catch(e => {
        console.error(`Line-In Play Error: ${e.message}`);
        setGlobalError(`Line-In Error: ${e.message}`);
        setIsLineInOn(false); // Ensure state is false if error occurs
        toast({ variant: "destructive", title: "Line-In Playback Error", description: e.message });
      });
      setIsLineInOn(true);
      toast({ title: "Line-In ON" });
    } else {
      lineInAudioRef.current.pause();
      lineInAudioRef.current.src = ""; // Clear source to stop streaming
      lineInAudioRef.current.load(); // Load cleared source
      setIsLineInOn(false);
      toast({ title: "Line-In OFF", variant: 'destructive' });
    }
  }, [lineInUrl, lineInVolume, toast]);

  // Context value
  const contextValue = {
    // Deck states
    deckA,
    deckB,
    activeDeck,

    // Global state
    volume,
    error: globalError,
    isPlaying,
    currentTrack,

    // Crossfader controls
    crossfaderPosition,
    setCrossfader: setCrossfaderPosition,
    isTransitioning,

    // Library and queue
    tracks,
    allTracks,
    queue,
    playHistory,

    // Automation
    isAutoDJ,
    currentScheduledShow,
    isGapKillerActive,

    // Audio processing
    isCompressorActive,
    compressorSettings,
    isVoiceTrackPlaying,

    // Monitoring
    isMonitoringActive,

    // Live Inputs
    isMicOn,
    toggleMic,
    micDeviceId,
    setMicDevice: setMicDeviceId,
    micVolume,
    setMicVolume,
    isLineInOn,
    toggleLineIn,
    lineInUrl,
    setLineInUrl,
    lineInVolume,
    setLineInVolume,

    // Professional Features
    autoCrossfadeEnabled,
    setAutoCrossfadeEnabled,
    rotationMode,
    setRotationMode: (enabled) => {
      setRotationMode(enabled);
      console.log(`[Real-time Rotation Mode] ${enabled ? 'Enabled' : 'Disabled'}`);
    },
    dynamicScheduling,
    setDynamicScheduling,

    // Enhanced track selection
    selectNextTrackIntelligently, // Now exposed

    // Control functions per deck
    loadToDeckA: (track) => loadTrack('A', track),
    loadToDeckB: (track) => loadTrack('B', track),
    playDeckA: () => playTrack('A'),
    playDeckB: () => playTrack('B'),
    pauseDeckA: () => pauseTrack('A'),
    pauseDeckB: () => pauseTrack('B'),
    ejectDeckA: () => ejectTrack('A'),
    ejectDeckB: () => ejectTrack('B'),
    seekDeck,

    // Global controls
    handleVolumeChange: (newVolume) => setVolume(newVolume[0]),
    handleAutoDJToggle,

    // Queue functions
    addTrackToQueue,
    removeTrackFromQueue,

    // Play Now function
    handlePlayNow,

    // Utility functions
    reloadTracks: async () => {
      const fetchedTracks = await Track.list('-created_date', 5000);
      setTracks(fetchedTracks);
      setAllTracks(fetchedTracks);
    },
    toggleCompressor: () => setIsCompressorActive(p => !p),
    updateCompressorSettings: (settings) => setCompressorSettings(p => ({ ...p, ...settings })),
    toggleMonitoring: () => setIsMonitoringActive(prev => !prev),
  };

  return (
    <AudioContext.Provider value={contextValue}>
      <audio ref={audioRefA} crossOrigin="anonymous" preload="metadata" />
      <audio ref={audioRefB} crossOrigin="anonymous" preload="metadata" />
      <audio ref={monitorAudioRef} crossOrigin="anonymous" muted={!isMonitoringActive} />
      <audio ref={soundEffectRef} crossOrigin="anonymous" />
      <audio ref={lineInAudioRef} crossOrigin="anonymous" />

      {/* Add CrossfadeEngine component */}
      <CrossfadeEngine />
      {children}
    </AudioContext.Provider>
  );
};
