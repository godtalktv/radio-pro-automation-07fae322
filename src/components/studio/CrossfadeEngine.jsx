import React, { useEffect, useRef } from 'react';
import { useAudio } from '../audio/AudioPlayer';

// Real-time Automatic Cross Fading Engine (Industry First - 2012)
export const CrossfadeEngine = () => {
  const { 
    deckA, 
    deckB, 
    activeDeck, 
    crossfaderPosition, 
    setCrossfader,
    isAutoDJ 
  } = useAudio();
  
  const crossfadeTimerRef = useRef(null);
  const lastTrackEndWarningRef = useRef(null);

  useEffect(() => {
    if (isAutoDJ) {
      startAutoCrossfadeMonitoring();
    } else {
      stopAutoCrossfadeMonitoring();
    }

    return () => stopAutoCrossfadeMonitoring();
  }, [isAutoDJ]);

  const startAutoCrossfadeMonitoring = () => {
    // Monitor track progress for automatic crossfading
    const monitorInterval = setInterval(() => {
      const currentDeck = activeDeck === 'A' ? deckA : deckB;
      const nextDeck = activeDeck === 'A' ? deckB : deckA;
      
      if (currentDeck.isPlaying && currentDeck.duration > 0) {
        const currentTime = (currentDeck.progress / 100) * currentDeck.duration;
        const timeRemaining = currentDeck.duration - currentTime;
        
        // Start crossfade 10 seconds before track ends (if next track is ready)
        if (timeRemaining <= 10 && timeRemaining > 8 && nextDeck.track && !nextDeck.isPlaying) {
          console.log('[CrossfadeEngine] Starting automatic crossfade');
          startAutomaticCrossfade();
        }
        
        // Warning at 15 seconds remaining
        if (timeRemaining <= 15 && timeRemaining > 13 && lastTrackEndWarningRef.current !== currentDeck.track?.id) {
          lastTrackEndWarningRef.current = currentDeck.track?.id;
          console.log('[CrossfadeEngine] Track ending in 15 seconds, preparing crossfade');
        }
      }
    }, 1000);

    crossfadeTimerRef.current = monitorInterval;
  };

  const stopAutoCrossfadeMonitoring = () => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  };

  const startAutomaticCrossfade = () => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
    }

    const nextDeck = activeDeck === 'A' ? deckB : deckA;
    const nextDeckId = activeDeck === 'A' ? 'B' : 'A';
    
    // Start playing the next track
    if (nextDeck.track && !nextDeck.isPlaying) {
      console.log('[CrossfadeEngine] Starting next track for crossfade');
      // This would trigger the next deck to play
      // The actual play triggering is handled by the AudioPlayer
    }

    // Perform smooth crossfade over 8 seconds
    let crossfadeStep = 0;
    const totalSteps = 80; // 8 seconds at 100ms intervals
    const stepSize = 100 / totalSteps; // Crossfader range is -50 to +50 (100 total)

    const crossfadeInterval = setInterval(() => {
      crossfadeStep++;
      
      // Calculate crossfader position (-50 to +50)
      let newPosition;
      if (activeDeck === 'A') {
        // Fade from A (left) to B (right): -50 to +50
        newPosition = -50 + (crossfadeStep * stepSize);
      } else {
        // Fade from B (right) to A (left): +50 to -50
        newPosition = 50 - (crossfadeStep * stepSize);
      }
      
      // Clamp to valid range
      newPosition = Math.max(-50, Math.min(50, newPosition));
      setCrossfader(newPosition);
      
      if (crossfadeStep >= totalSteps) {
        clearInterval(crossfadeInterval);
        console.log('[CrossfadeEngine] Automatic crossfade completed');
        
        // Resume monitoring after crossfade
        startAutoCrossfadeMonitoring();
      }
    }, 100);
  };

  return null; // This is a processing engine, no UI component
};

export default CrossfadeEngine;