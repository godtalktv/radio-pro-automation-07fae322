
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAudio } from '../audio/AudioPlayer';
import { 
  Music, 
  Clock, 
  Play, 
  SkipForward, 
  ListMusic,
  Radio,
  Mic,
  Zap,
  Loader2 // Added Loader2 import
} from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// formatTimeFromNow is removed as it's no longer used in the new 'Coming Up Next' display logic.
// The outline implies its removal by not including it.

const getTrackTypeIcon = (trackType) => {
  switch (trackType) {
    case 'music': return <Music className="w-4 h-4 text-blue-400" />;
    case 'station_id': return <Radio className="w-4 h-4 text-green-400" />;
    case 'commercial': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'voice_track': return <Mic className="w-4 h-4 text-purple-400" />;
    default: return <Music className="w-4 h-4 text-slate-400" />;
  }
};

export default function PlaylistPanel() {
  const { 
    deckA, 
    deckB, 
    queue, 
    playHistory, 
    isAutoDJ, 
    currentTrack,
    activeDeck,
    allTracks // allTracks is still provided by useAudio, but selectNextTrackIntelligently is removed from this component
  } = useAudio();
  
  // Removed stableUpcomingTracks state and its associated useEffect
  // Removed selectNextTrackIntelligently useMemo (as per outline)

  // Get currently playing track
  const nowPlaying = currentTrack || (deckA.isPlaying ? deckA.track : deckB.track);

  // Determine the inactive deck and its track
  const inactiveDeckId = activeDeck === 'A' ? 'B' : 'A';
  const inactiveDeck = inactiveDeckId === 'A' ? deckA : deckB;
  const comingUpNextTrack = inactiveDeck.track;

  // Build the rest of the upcoming list
  const upcomingQueue = useMemo(() => {
    let upcoming = [...queue];

    // If the "coming up next" track is the first in the queue, remove it to avoid duplication
    if (comingUpNextTrack && upcoming[0]?.id === comingUpNextTrack.id) {
      upcoming = upcoming.slice(1);
    }
    
    return upcoming;
  }, [queue, comingUpNextTrack]);

  return (
    <div className="h-full bg-slate-900 p-4 space-y-4 overflow-y-auto">
      {/* Now Playing Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Now Playing
            {isAutoDJ && <Badge className="bg-blue-500">AutoDJ Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nowPlaying ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTrackTypeIcon(nowPlaying.track_type)}
                    <h3 className="text-lg font-bold text-white truncate">
                      {nowPlaying.title}
                    </h3>
                  </div>
                  <p className="text-slate-300 truncate">{nowPlaying.artist}</p>
                  {nowPlaying.album && (
                    <p className="text-slate-400 text-sm truncate">{nowPlaying.album}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-white font-mono text-lg">
                    {formatTime(nowPlaying.duration)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    Deck {activeDeck}
                  </div>
                  {nowPlaying.category && (
                    <Badge variant="secondary" className="mt-1">
                      {nowPlaying.category}
                    </Badge>
                  )}
                  {nowPlaying.energy_level && (
                    <Badge variant="outline" className="mt-1 ml-1 text-xs">
                      {nowPlaying.energy_level} energy
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Track Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Progress</span>
                  <span>{Math.round((activeDeck === 'A' ? deckA.progress : deckB.progress) || 0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(activeDeck === 'A' ? deckA.progress : deckB.progress) || 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Music className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>No track currently playing</p>
              <p className="text-sm">Queue a track or start AutoDJ</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Tracks Section */}
      <Card className="bg-slate-800 border-slate-700 flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <SkipForward className="w-5 h-5 text-blue-400" />
              Coming Up Next
              {/* Removed the stableUpcomingTracks.length badge */}
            </CardTitle>
            {isAutoDJ && ( // Condition simplified as per outline
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                Intelligent Programming Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {comingUpNextTrack || upcomingQueue.length > 0 ? ( // Changed condition
            <div className="divide-y divide-slate-700/50">
              {/* The track on the inactive deck */}
              {comingUpNextTrack && ( // Only render if a track exists on the inactive deck
                <div className="p-3 bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-slate-400 font-mono text-sm">
                        NEXT
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {inactiveDeck.isLoading ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : getTrackTypeIcon(comingUpNextTrack.track_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white truncate">
                          {comingUpNextTrack.title}
                        </h4>
                        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Deck {inactiveDeckId}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm truncate">{comingUpNextTrack.artist}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-slate-300 font-mono text-sm">
                        {formatTime(comingUpNextTrack.duration)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* The rest of the queue */}
              {upcomingQueue.slice(0, comingUpNextTrack ? 9 : 10).map((track, index) => ( // Adjust slice based on if inactive deck track is shown
                <div key={`${track.id}-queue-${index}`} className="p-3 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-slate-500 font-mono text-xs">
                        {String(index + (comingUpNextTrack ? 2 : 1)).padStart(2, '0')} {/* Adjust numbering */}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {getTrackTypeIcon(track.track_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-300 truncate text-sm">
                        {track.title}
                      </h4>
                      <p className="text-slate-500 text-xs truncate">{track.artist}</p>
                    </div>
                    <div className="flex-shrink-0 text-slate-400 font-mono text-xs">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <ListMusic className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-medium mb-2">Next track is being selected...</h3>
              <p className="text-sm mb-4">AutoDJ is finding the perfect track to play next.</p>
              {/* Removed the 'Enable AutoDJ' button as per outline */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Played Section */}
      {playHistory.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Recently Played
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {playHistory.slice(0, 5).map((track, index) => (
                <div 
                  key={`${track.id}-history-${index}`}
                  className="p-3 border-b border-slate-700/50 last:border-b-0 opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getTrackTypeIcon(track.track_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-300 truncate text-sm">
                        {track.title}
                      </h4>
                      <p className="text-slate-500 text-xs truncate">{track.artist}</p>
                    </div>
                    <div className="flex-shrink-0 text-slate-500 text-xs">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
