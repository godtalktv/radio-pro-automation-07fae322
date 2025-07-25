import React, { useEffect, useState } from 'react';
import { useAudio } from './AudioPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Volume2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function PersistentPlayer() {
  // Get all audio state
  const audioContext = useAudio();
  const [localVolume, setLocalVolume] = useState(75);

  // Ensure we have audio context
  if (!audioContext) {
    console.warn('[PersistentPlayer] No audio context available');
    return null;
  }

  // Destructure with fallbacks
  const {
    currentTrack = null,
    isPlaying = false,
    progress = 0,
    duration = 0,
    volume = [75],
    isPlayerMinimized = false,
    isLoading = false,
    error = null,
    handlePlayPause = () => console.log('handlePlayPause not available'),
    handleSkipNext = () => console.log('handleSkipNext not available'),
    skipToPrevious = () => console.log('skipToPrevious not available'),
    setVolumeLevel = () => console.log('setVolumeLevel not available'),
    togglePlayerMinimized = () => console.log('togglePlayerMinimized not available'),
  } = audioContext;

  // Ensure volume is always a number
  const currentVolume = Array.isArray(volume) ? volume[0] : (typeof volume === 'number' ? volume : 75);

  // Sync local volume with audio state
  useEffect(() => {
    setLocalVolume(currentVolume);
  }, [currentVolume]);

  // Debug logging
  useEffect(() => {
    console.log('[PersistentPlayer] State update:', {
      currentTrack: currentTrack?.title || 'none',
      isPlaying,
      progress,
      duration,
      volume: currentVolume,
      isLoading,
      error: error || 'none'
    });
  }, [currentTrack, isPlaying, progress, duration, currentVolume, isLoading, error]);

  // Utility to format time from seconds to MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasError = !!error && currentTrack;

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    const volumeValue = Array.isArray(newVolume) ? newVolume[0] : newVolume;
    setLocalVolume(volumeValue);
    setVolumeLevel(volumeValue);
  };

  // Enhanced play/pause handler
  const handlePlayPauseClick = () => {
    console.log('[PersistentPlayer] Play/Pause clicked, current state:', { isPlaying, currentTrack: !!currentTrack });
    handlePlayPause();
  };

  // Enhanced skip handler
  const handleSkipClick = () => {
    console.log('[PersistentPlayer] Skip clicked');
    handleSkipNext();
  };

  // Render a simplified version when there's no track
  if (!currentTrack && !hasError && !isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-950/95 backdrop-blur-lg border-t border-slate-700/50 z-50 flex items-center justify-center px-6 shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 text-slate-500">
          <Music className="w-6 h-6" />
          <p className="font-medium">No track selected. Choose a song from the library or enable AutoDJ to begin.</p>
        </div>
      </div>
    );
  }

  const renderPlayPauseButton = () => {
    if (isLoading) {
      return <Loader2 className="w-6 h-6 animate-spin text-blue-400" />;
    }
    if (isPlaying) {
      return <Pause className="w-6 h-6" />;
    }
    return <Play className="w-6 h-6 ml-1" />;
  };

  // --- MINIMIZED PLAYER VIEW ---
  if (isPlayerMinimized) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-lg border-t border-slate-700/50 z-50 flex items-center px-4 shadow-2xl transition-all duration-300">
        {/* Progress bar at top */}
        <div className="w-full bg-slate-700 h-1 absolute top-0 left-0">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        
        {/* Track info */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            hasError ? 'bg-gradient-to-br from-red-500 to-orange-500' : 
            isPlaying ? 'bg-gradient-to-br from-green-500 to-blue-500' :
            'bg-gradient-to-br from-blue-500 to-purple-500'
          }`}>
            {hasError ? <AlertTriangle className="w-5 h-5 text-white" /> : <Music className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-white truncate text-sm ${hasError ? 'text-red-400' : ''}`}>
              {currentTrack?.title || (isLoading ? 'Loading...' : 'No Track')}
            </h3>
            <p className="text-sm text-slate-400 truncate">
              {hasError ? error : currentTrack?.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 w-1/3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={skipToPrevious} 
            className="text-slate-400 hover:text-white" 
            disabled={isLoading || hasError}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handlePlayPauseClick} 
            className="w-10 h-10 rounded-full bg-white text-slate-900 hover:bg-slate-200" 
            disabled={hasError}
          >
            {renderPlayPauseButton()}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSkipClick} 
            className="text-slate-400 hover:text-white" 
            disabled={isLoading}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Expand button */}
        <div className="flex items-center w-1/3 justify-end">
          <Button variant="ghost" size="icon" onClick={togglePlayerMinimized} className="text-slate-400 hover:text-white">
            <ChevronUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // --- MAXIMIZED PLAYER VIEW ---
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-950/95 backdrop-blur-lg border-t border-slate-700/50 z-50 flex items-center px-6 shadow-2xl transition-all duration-300">
      
      {/* Left Section: Track Info */}
      <div className="flex items-center gap-4 w-1/4 min-w-0">
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 relative ${
          hasError ? 'bg-gradient-to-br from-red-500 to-orange-500' : 
          isPlaying ? 'bg-gradient-to-br from-green-500 to-blue-500' :
          'bg-gradient-to-br from-blue-500 to-purple-500'
        }`}>
          {hasError ? <AlertTriangle className="w-7 h-7 text-white" /> : <Music className="w-7 h-7 text-white" />}
          {isPlaying && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg animate-pulse opacity-30"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-white truncate ${hasError ? 'text-red-400' : ''}`}>
            {currentTrack?.title || (isLoading ? 'Loading Track...' : 'No Track')}
          </h3>
          <p className="text-sm text-slate-400 truncate">
            {hasError ? error : currentTrack?.artist || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Center Section: Controls & Progress */}
      <div className="flex flex-col items-center justify-center gap-2 w-1/2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={skipToPrevious} 
            className="text-slate-400 hover:text-white" 
            disabled={isLoading || hasError}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button 
            onClick={handlePlayPauseClick} 
            className="w-12 h-12 rounded-full bg-white text-slate-900 hover:bg-slate-200" 
            disabled={hasError}
          >
            {renderPlayPauseButton()}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSkipClick} 
            className="text-slate-400 hover:text-white" 
            disabled={isLoading}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-xs text-slate-400 w-10 text-right">
            {formatTime((progress / 100) * (duration || 0))}
          </span>
          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-10">
            {formatTime(duration || 0)}
          </span>
        </div>
      </div>

      {/* Right Section: Volume & Toggle */}
      <div className="flex items-center gap-4 w-1/4 justify-end">
        <Volume2 className="w-5 h-5 text-slate-400" />
        <Slider
          value={[localVolume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-28"
          disabled={hasError}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={togglePlayerMinimized} 
          className="text-slate-500 hover:text-white"
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}