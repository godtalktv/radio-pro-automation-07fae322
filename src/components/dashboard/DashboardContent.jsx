import React from "react";
import { useAudio } from "../audio/AudioPlayer";
import CurrentTrackDisplay from "./CurrentTrackDisplay";
import LiveControls from "./LiveControls";
import QueueDisplay from "./QueueDisplay";
import StationStats from "./StationStats";
import BroadcastPanel from "./BroadcastPanel";

export default function DashboardContent() {
  const audio = useAudio();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Live Control Center</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CurrentTrackDisplay 
            track={audio.currentTrack}
            isPlaying={audio.isPlaying}
            progress={audio.progress}
            isLoading={audio.isLoading}
            duration={audio.duration}
            currentShow={audio.currentScheduledShow}
          />
          <LiveControls 
            isPlaying={audio.isPlaying || false}
            volume={audio.volume ? [audio.volume] : [75]}
            onPlayPause={audio.handlePlayPause || (() => {})}
            onSkipNext={audio.handleSkipNext || (() => {})}
            onSkipPrevious={audio.skipToPrevious || (() => {})}
            onVolumeChange={(value) => audio.setVolumeLevel && audio.setVolumeLevel(value[0])}
            isAutoDJ={audio.isAutoDJ || false}
            onAutoDJToggle={audio.handleAutoDJToggle || (() => {})}
            currentTrack={audio.currentTrack}
            isScheduleActive={!!audio.currentScheduledShow}
          />
          <QueueDisplay 
            queue={audio.queue || []}
            currentShow={audio.currentScheduledShow}
            nextShow={audio.nextScheduledShow}
            isLoading={audio.isLoading || false}
            onPlayTrack={audio.handlePlayNow || (() => {})}
          />
        </div>
        
        <div className="space-y-6">
          <BroadcastPanel 
            broadcastConfig={audio.broadcastConfig || { serverUrl: '', mountPoint: '', password: '' }}
            setBroadcastConfig={audio.setBroadcastConfig || (() => {})}
            startBroadcast={audio.startBroadcast || (() => {})}
            stopBroadcast={audio.stopBroadcast || (() => {})}
            broadcastStatus={audio.broadcastStatus || 'offline'}
          />
          <StationStats 
            currentShow={audio.currentScheduledShow}
            nextShow={audio.nextScheduledShow}
            isLoading={audio.isLoading || false}
            isAutoDJ={audio.isAutoDJ || false}
          />
        </div>
      </div>
    </div>
  );
}