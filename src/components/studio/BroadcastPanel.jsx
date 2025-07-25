
import React, { useEffect, useState } from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Volume2, 
  Radio,
  Mic,
  Clock,
  Music,
  Disc,
  ArrowUp, 
  ArrowDown, 
  Zap,
  Headphones, // Added for monitoring
  Image as ImageIcon // Added for placeholder
} from 'lucide-react';
import { useCustomization } from '../settings/CustomizationProvider';

export default function BroadcastPanel({ isCollapsed = false, onToggleCollapse }) {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    queue,
    playHistory,
    isAutoDJ,
    activeDeck,
    deckA,
    deckB,
    handleGlobalPlayPause, // Updated from handlePlayPause
    handleSkipNext,
    handleAutoDJToggle,
    volume,
    handleVolumeChange,
    isGapKillerActive,
    currentScheduledShow,
    allTracks,
    selectTrackFromClockwheel,
    selectIntelligentTrack,
    isMonitoringActive, // Get monitoring state
    toggleMonitoring // Get monitoring toggle function
  } = useAudio();
  const { settings } = useCustomization();
  const stationLogoUrl = settings?.logo_url;

  // State for upcoming tracks preview
  const [upcomingTracks, setUpcomingTracks] = React.useState([]);
  const [artError, setArtError] = useState(false);

  useEffect(() => {
    setArtError(false);
  }, [currentTrack]);


  // Generate upcoming tracks based on rotation
  React.useEffect(() => {
    const generateUpcomingTracks = async () => {
      if (!isAutoDJ) {
        // If not in AutoDJ mode, show manual queue
        setUpcomingTracks(queue.slice(0, 3));
        return;
      }

      // In AutoDJ mode, predict next tracks based on rotation
      try {
        const predicted = [];
        
        for (let i = 0; i < 3; i++) {
          let nextTrack = null;
          
          // Try to get track from current show's clockwheel
          if (currentScheduledShow && currentScheduledShow.clockwheel_id) {
            nextTrack = await selectTrackFromClockwheel(currentScheduledShow.clockwheel_id);
          }
          
          // Fallback to intelligent selection
          if (!nextTrack) {
            nextTrack = await selectIntelligentTrack();
          }
          
          if (nextTrack) {
            predicted.push(nextTrack);
          }
        }
        
        setUpcomingTracks(predicted);
      } catch (error) {
        console.error('Error generating upcoming tracks:', error);
        setUpcomingTracks([]);
      }
    };

    generateUpcomingTracks();
  }, [isAutoDJ, currentScheduledShow, queue, currentTrack, allTracks, selectTrackFromClockwheel, selectIntelligentTrack]); // Added dependencies

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeWithMs = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00.0";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const elapsedTime = currentTrack ? (progress / 100) * duration : 0;
  const remainingTime = currentTrack ? duration - elapsedTime : 0;

  if (isCollapsed) {
    return (
      <div className="h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 flex items-center px-4 shadow-2xl">
        {/* Collapsed View - Minimal Info Bar */}
        <div className="flex items-center justify-between w-full">
          {/* Left - Basic Transport */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGlobalPlayPause} // Updated
              className={`h-6 w-6 rounded-full ${
                isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              size="sm"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            
            <Button
              onClick={handleSkipNext}
              className="h-6 w-6 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>

          {/* Center - Current Track (Compact) */}
          <div className="flex-1 mx-4 min-w-0">
            {currentTrack ? (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                
                {/* Collapsed Album Art */}
                <div className="w-5 h-5 bg-black/30 rounded-sm flex-shrink-0">
                  {currentTrack.album_art_url && !artError ? (
                    <img
                      src={currentTrack.album_art_url}
                      className="w-full h-full object-cover rounded-sm"
                      onError={() => setArtError(true)}
                      alt="Album Art"
                    />
                  ) : stationLogoUrl ? (
                    <img src={stationLogoUrl} className="w-full h-full object-contain p-0.5" alt="Station Logo"/>
                  ) : (
                    <ImageIcon className="w-full h-full text-slate-600 p-0.5" />
                  )}
                </div>

                <span className="text-white font-medium truncate">
                  {currentTrack.title} - {currentTrack.artist}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  {formatTime(elapsedTime)} / {formatTime(duration)}
                </span>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No Track Loaded</div>
            )}
          </div>

          {/* Right - Expand Button */}
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            title="Expand Control Panel"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Full/Expanded View
  return (
    <div className="relative h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 flex items-center px-4 shadow-2xl">
      
      {/* Collapse Button - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white h-6 w-6"
          title="Collapse Control Panel"
        >
          <ArrowDown className="w-3 h-3" />
        </Button>
      </div>

      {/* Left Section - Transport Controls */}
      <div className="flex items-center gap-3 mr-6">
        <Button
          onClick={handleGlobalPlayPause} // Updated
          className={`h-14 w-14 rounded-full ${
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
        </Button>
        <div className="flex flex-col gap-1">
          <Button
            onClick={handleSkipNext}
            className="h-6 w-10 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              // Stop functionality
              if (isPlaying) handleGlobalPlayPause(); // Updated
            }}
            className="h-6 w-10 bg-red-800 hover:bg-red-900"
            size="sm"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center Section - Display & Progress */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="h-10 bg-black/50 rounded-lg p-2 flex items-center justify-between border border-slate-700/50">
          {isGapKillerActive ? (
            <div className="flex items-center gap-2 text-orange-400 font-bold animate-pulse">
              <Zap className="w-4 h-4" />
              <span>GAP KILLER ACTIVE</span>
            </div>
          ) : currentTrack ? (
            <div className="flex-1 flex items-center min-w-0 gap-2">
              <div className="h-8 w-8 bg-black/50 rounded flex-shrink-0">
                {currentTrack.album_art_url && !artError ? (
                  <img
                    src={currentTrack.album_art_url}
                    className="w-full h-full object-cover rounded"
                    onError={() => setArtError(true)}
                    alt="Album Art"
                  />
                ) : stationLogoUrl ? (
                  <img src={stationLogoUrl} className="w-full h-full object-contain p-1" alt="Station Logo"/>
                ) : (
                  <ImageIcon className="w-full h-full text-slate-600 p-1" />
                )}
              </div>
              <span className={`text-sm font-bold mr-1 ${isPlaying ? 'text-green-400' : 'text-slate-400'}`}>
                ON AIR:
              </span>
              <span className="text-white truncate" title={`${currentTrack.title} by ${currentTrack.artist}`}>
                {currentTrack.title} <span className="text-slate-400 font-normal">by {currentTrack.artist}</span>
              </span>
            </div>
          ) : (
            <div className="text-slate-500 font-bold">SILENCE</div>
          )}
          <div className="text-lg font-mono font-bold text-red-400">
            -{formatTime(remainingTime)}
          </div>
        </div>

        <Slider 
          value={[progress]} 
          onValueChange={() => {}} 
          max={100}
          className="w-full h-3"
          thumbClassName="h-4 w-4"
          trackClassName="bg-slate-700/50"
          rangeClassName="bg-gradient-to-r from-green-500 to-blue-500"
        />
      </div>

      {/* Right Section - Mode & Volume */}
      <div className="flex items-center ml-6">
        {/* Upcoming Tracks */}
        <div className="w-56 text-xs text-slate-400 mr-4">
          <h4 className="font-bold mb-1 text-slate-300">
            {isAutoDJ ? 'Coming Up (Rotation)' : 'Coming Up (Queue)'}
          </h4>
          <ul className="space-y-0.5">
            {upcomingTracks.slice(0, 2).map((track, i) => (
              <li key={`${track.id}-${i}`} className="truncate">
                <span className="font-mono">{i + 1}.</span> {track.title} - {track.artist}
              </li>
            ))}
            {upcomingTracks.length === 0 && <li className="italic">Empty</li>}
          </ul>
        </div>

        <div className="h-full w-px bg-slate-700/50 mx-4"></div>

        <div className="flex flex-col items-center gap-2">
           <Button
            size="sm"
            variant="outline"
            onClick={toggleMonitoring}
            className={`w-28 transition-all ${isMonitoringActive ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'text-slate-300 border-slate-600'}`}
            title="Toggle Studio Monitoring"
          >
            <Headphones className="w-4 h-4 mr-2" />
            {isMonitoringActive ? 'Monitor ON' : 'Monitor OFF'}
          </Button>
          <Button
            size="sm"
            onClick={() => handleAutoDJToggle(!isAutoDJ)}
            className={`w-28 ${isAutoDJ ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600'}`}
            title={isAutoDJ ? 'Switch to Manual Mode' : 'Switch to Automated Mode'}
          >
            {isAutoDJ ? <Radio className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isAutoDJ ? 'Auto' : 'Manual'}
          </Button>
        </div>
      </div>
    </div>
  );
}
