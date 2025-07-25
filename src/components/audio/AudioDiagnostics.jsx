import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudio } from './AudioPlayer';
import { Settings, RefreshCw, Play, Pause } from 'lucide-react';

export default function AudioDiagnostics() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [htmlAudioState, setHtmlAudioState] = useState({});
  const [refreshCount, setRefreshCount] = useState(0);
  
  const audioContext = useAudio();

  // Monitor the actual HTML audio element
  useEffect(() => {
    const checkHtmlAudio = () => {
      const audioElements = document.querySelectorAll('audio');
      const audioState = {};
      
      audioElements.forEach((audio, index) => {
        audioState[`audio_${index}`] = {
          src: audio.src,
          paused: audio.paused,
          currentTime: audio.currentTime,
          duration: audio.duration,
          volume: audio.volume,
          readyState: audio.readyState,
          networkState: audio.networkState,
          error: audio.error ? audio.error.message : null
        };
      });
      
      setHtmlAudioState(audioState);
    };

    const interval = setInterval(checkHtmlAudio, 1000);
    checkHtmlAudio(); // Initial check
    
    return () => clearInterval(interval);
  }, [refreshCount]);

  const handleForceSync = () => {
    console.log('[AudioDiagnostics] Force syncing audio state...');
    
    // Find the audio element that's actually playing
    const audioElements = document.querySelectorAll('audio');
    let playingAudio = null;
    
    audioElements.forEach(audio => {
      if (!audio.paused && audio.currentTime > 0) {
        playingAudio = audio;
      }
    });

    if (playingAudio) {
      console.log('[AudioDiagnostics] Found playing audio:', {
        src: playingAudio.src,
        currentTime: playingAudio.currentTime,
        duration: playingAudio.duration
      });
      
      // Try to sync with our state management
      if (audioContext && audioContext.handlePlayPause) {
        // Force update the audio context
        setRefreshCount(prev => prev + 1);
      }
    }
  };

  const handlePlayPauseTest = () => {
    if (audioContext && audioContext.handlePlayPause) {
      audioContext.handlePlayPause();
    }
  };

  if (!showDiagnostics) {
    return (
      <Button
        onClick={() => setShowDiagnostics(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 bg-slate-800/50 border-slate-700/50 text-slate-300"
      >
        <Settings className="w-4 h-4 mr-2" />
        Audio Debug
      </Button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 w-96">
      <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Audio Diagnostics</span>
            <Button
              onClick={() => setShowDiagnostics(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* React Audio Context State */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">React Audio Context:</h4>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Current Track: {audioContext?.currentTrack?.title || 'None'}</div>
              <div>Is Playing: <Badge className={audioContext?.isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{String(audioContext?.isPlaying)}</Badge></div>
              <div>Is Loading: <Badge className={audioContext?.isLoading ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}>{String(audioContext?.isLoading)}</Badge></div>
              <div>Progress: {audioContext?.progress?.toFixed(1) || 0}%</div>
              <div>Volume: {Array.isArray(audioContext?.volume) ? audioContext.volume[0] : audioContext?.volume}</div>
              <div>Error: {audioContext?.error || 'None'}</div>
            </div>
          </div>

          {/* HTML Audio Elements State */}
          <div>
            <h4 className="text-sm font-medium text-white mb-2">HTML Audio Elements:</h4>
            <div className="text-xs text-slate-300 space-y-2">
              {Object.entries(htmlAudioState).map(([key, audio]) => (
                <div key={key} className="p-2 bg-slate-800/30 rounded">
                  <div className="font-medium">{key}:</div>
                  <div>Paused: <Badge className={audio.paused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>{String(audio.paused)}</Badge></div>
                  <div>Time: {audio.currentTime?.toFixed(1) || 0}s / {audio.duration?.toFixed(1) || 0}s</div>
                  <div>Volume: {(audio.volume * 100).toFixed(0)}%</div>
                  <div>Ready State: {audio.readyState}</div>
                  <div>Network State: {audio.networkState}</div>
                  {audio.error && <div className="text-red-400">Error: {audio.error}</div>}
                  {audio.src && <div className="truncate">Src: {audio.src.substring(0, 50)}...</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleForceSync}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Sync
            </Button>
            <Button
              onClick={handlePlayPauseTest}
              size="sm"
              variant="outline"
              className="bg-slate-800/50 border-slate-700/50 text-slate-300"
            >
              {audioContext?.isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Test Play/Pause
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}