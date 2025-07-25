import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAudio } from '../audio/AudioPlayer';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Clock, 
  Mic, 
  Radio,
  Music,
  Loader2,
  Volume2,
  Headphones,
  Activity,
  Users,
  Signal
} from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTimeWithMs = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00.0";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const ms = Math.floor((seconds - totalSeconds) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

// Live Clock Component
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="text-center bg-black rounded-lg p-4 border border-slate-700">
      <div className="text-3xl font-mono font-bold text-green-400">
        {time.toLocaleTimeString([], { hour12: false })}
      </div>
      <div className="text-sm text-slate-400">
        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
};

// Now Playing Display
const NowPlayingDisplay = ({ track, isPlaying, progress, duration }) => {
  const remaining = duration - (duration * progress / 100);
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-500" />
          ON AIR - Now Playing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {track ? (
          <>
            <div className="flex items-start gap-4">
              <img 
                src={track.album_art_url || 'https://placehold.co/80x80/0f172a/94a3b8?text=♪'} 
                alt="Album Art" 
                className="w-20 h-20 rounded-lg object-cover border border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">{track.title}</h3>
                <p className="text-lg text-slate-300 truncate">{track.artist}</p>
                <p className="text-sm text-slate-400 truncate">{track.album}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${isPlaying ? 'bg-red-600' : 'bg-slate-600'}`}>
                    {isPlaying ? 'LIVE' : 'STOPPED'}
                  </Badge>
                  <Badge variant="outline" className="text-slate-300">
                    {track.category || track.track_type}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-mono">
                  {formatTimeWithMs(duration * progress / 100)} / {formatTimeWithMs(duration)}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time Remaining</span>
                <span className="text-red-400 font-mono font-bold">
                  -{formatTimeWithMs(remaining)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Music className="w-12 h-12 mx-auto mb-2" />
            <p>No track loaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Queue Display
const QueueDisplay = ({ queue, onPlayTrack }) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-500" />
          Up Next ({queue.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p>Queue is empty</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queue.slice(0, 5).map((track, index) => (
              <div 
                key={track.id} 
                className="flex items-center gap-3 p-2 bg-slate-900 rounded border border-slate-700 hover:bg-slate-700 cursor-pointer"
                onClick={() => onPlayTrack(track)}
              >
                <Badge variant="outline" className="text-xs min-w-6 text-center">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{track.title}</p>
                  <p className="text-slate-400 text-xs truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {formatTime(track.duration)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Live Statistics
const LiveStats = () => {
  const [stats, setStats] = useState({
    listeners: 0,
    bitrate: '128kbps',
    uptime: '02:34:15',
    streamStatus: 'connected'
  });
  
  useEffect(() => {
    // Simulate live listener count
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        listeners: Math.floor(Math.random() * 50) + 25
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Live Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.listeners}</div>
            <div className="text-xs text-slate-400">Current Listeners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.bitrate}</div>
            <div className="text-xs text-slate-400">Stream Quality</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Stream Status</span>
          <Badge className={`${stats.streamStatus === 'connected' ? 'bg-green-600' : 'bg-red-600'}`}>
            <Signal className="w-3 h-3 mr-1" />
            {stats.streamStatus}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Uptime</span>
          <span className="text-white font-mono">{stats.uptime}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Voice Tracking Cue Points
const VoiceTrackingCues = ({ track }) => {
  if (!track) return null;
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-500" />
          Voice Tracking Cues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Intro Time</span>
          <span className="text-green-400 font-mono">
            {formatTimeWithMs(track.intro_time || 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Vocal Start</span>
          <span className="text-yellow-400 font-mono">
            {formatTimeWithMs(track.vocal_start_time || 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Outro Time</span>
          <span className="text-red-400 font-mono">
            {formatTimeWithMs(track.outro_time || 0)}
          </span>
        </div>
        <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-700/30">
          <p className="text-xs text-blue-300">
            💡 <strong>Voice Track Tip:</strong> Best talk time is during the intro ({formatTime(track.intro_time || 0)}) 
            before vocals start at {formatTime(track.vocal_start_time || 0)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LiveAssistPanel() {
  const { 
    currentTrack, 
    isPlaying, 
    deckA, 
    deckB, 
    activeDeck,
    queue,
    handlePlayNow,
    playDeckA,
    playDeckB,
    pauseDeckA,
    pauseDeckB
  } = useAudio();
  
  const activeTrack = activeDeck === 'A' ? deckA.track : deckB.track;
  const activeProgress = activeDeck === 'A' ? deckA.progress : deckB.progress;
  const activeDuration = activeDeck === 'A' ? deckA.duration : deckB.duration;
  const activeIsPlaying = activeDeck === 'A' ? deckA.isPlaying : deckB.isPlaying;
  
  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto bg-slate-900">
      {/* Top Row - Now Playing & Clock */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <NowPlayingDisplay 
            track={activeTrack}
            isPlaying={activeIsPlaying}
            progress={activeProgress}
            duration={activeDuration}
          />
        </div>
        <div className="space-y-4">
          <LiveClock />
          <LiveStats />
        </div>
      </div>
      
      {/* Middle Row - Queue & Voice Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <QueueDisplay queue={queue} onPlayTrack={handlePlayNow} />
        <VoiceTrackingCues track={activeTrack} />
      </div>
      
      {/* Bottom Row - Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Live Assist Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => activeDeck === 'A' ? pauseDeckA() : pauseDeckB()}
              disabled={!activeIsPlaying}
              className="bg-red-600 hover:bg-red-700"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Current
            </Button>
            
            <Button
              onClick={() => queue.length > 0 && handlePlayNow(queue[0])}
              disabled={queue.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Next
            </Button>
            
            <Button
              onClick={() => queue.length > 1 && handlePlayNow(queue[1])}
              disabled={queue.length < 2}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip to #2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}