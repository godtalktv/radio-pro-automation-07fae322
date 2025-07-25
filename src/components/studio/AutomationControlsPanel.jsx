
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAudio } from '../audio/AudioPlayer';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Settings, 
  Clock, 
  Music, 
  Radio,
  Calendar,
  Zap,
  Users
} from 'lucide-react';
import RotationScheduler from '../scheduler/RotationScheduler';
import AudiencePleaserPanel from './AudiencePleaserPanel';
import TrafficScheduler from './TrafficScheduler';
import DCSStatusPanel from './DCSStatusPanel'; // Add new import

export default function AutomationControlsPanel() {
  const { 
    isAutoDJ, 
    handleAutoDJToggle, 
    queue, 
    playHistory, 
    currentScheduledShow,
    isGapKillerActive 
  } = useAudio();

  const [showRotationScheduler, setShowRotationScheduler] = useState(false);

  // If scheduler is showing, render it instead of the main panel
  if (showRotationScheduler) {
    return (
      <RotationScheduler 
        onClose={() => setShowRotationScheduler(false)} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto">
      {/* AutoDJ Status Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              AutoDJ Status
            </CardTitle>
            <Badge className={isAutoDJ ? 'bg-green-500' : 'bg-red-500/80'}>
              {isAutoDJ ? 'ACTIVE' : 'OFF'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Button
            onClick={() => handleAutoDJToggle(!isAutoDJ)}
            className={`w-full ${
              isAutoDJ 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isAutoDJ ? 'Stop AutoDJ' : 'Start AutoDJ'}
          </Button>
          
          {currentScheduledShow && (
            <div className="text-xs text-slate-400">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" />
                <span>Current Show:</span>
              </div>
              <div className="text-white font-medium">{currentScheduledShow.name}</div>
              <div className="text-slate-500">Host: {currentScheduledShow.host}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programming Control Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Programming Control
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <Button
            onClick={() => setShowRotationScheduler(true)}
            variant="outline"
            className="w-full bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Rotation Scheduler
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600"
          >
            <Music className="w-4 h-4 mr-2" />
            Music Rules
          </Button>
          
          <Button
            variant="outline"
            className="w-full bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Gap Killer
            {isGapKillerActive && <Badge className="ml-2 bg-yellow-500">ON</Badge>}
          </Button>
        </CardContent>
      </Card>

      {/* Queue Status Card */}
      <Card className="bg-slate-800/50 border-slate-700/50 flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-green-400" />
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tracks in Queue:</span>
              <span className="text-white font-mono">{queue.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Played Today:</span>
              <span className="text-white font-mono">{playHistory.length}</span>
            </div>
            
            <Separator className="bg-slate-600" />
            
            {queue.length > 0 && (
              <div>
                <div className="text-slate-400 mb-1">Next Up:</div>
                <div className="space-y-1">
                  {queue.slice(0, 3).map((track, index) => (
                    <div key={track.id} className="text-xs">
                      <div className="text-white truncate">{track.title}</div>
                      <div className="text-slate-500 truncate">{track.artist}</div>
                    </div>
                  ))}
                  {queue.length > 3 && (
                    <div className="text-slate-500 text-xs">
                      +{queue.length - 3} more tracks
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Audience Pleaser Panel */}
      <AudiencePleaserPanel />
      
      {/* Traffic Scheduler Panel */}
      <TrafficScheduler />
      
      {/* DCS Status Panel */}
      <DCSStatusPanel />
      
      {/* Professional Features Summary */}
      <Card className="bg-slate-800/30 border-slate-700/50 flex-shrink-0">
          <CardHeader className="p-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Professional Features Active
              </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Music Scheduler + Playout + Encoder</span>
                      <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Real-time Auto Cross Fading</span>
                      <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Built-in Audio Processing</span>
                      <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Audience Pleaser (2012)</span>
                      <Badge className="bg-blue-500/20 text-blue-400">FIRST</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Real-time Rotation Mode</span>
                      <Badge className="bg-blue-500/20 text-blue-400">FIRST</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-slate-400">Built-in Traffic Scheduler</span>
                      <Badge className="bg-purple-500/20 text-purple-400">2023</Badge>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
