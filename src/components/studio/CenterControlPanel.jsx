import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from '../audio/AudioPlayer';
import { Volume2, Shuffle, RotateCcw } from 'lucide-react';

export default function CenterControlPanel() {
  const { 
    volume, 
    handleVolumeChange, 
    crossfaderPosition, 
    setCrossfader,
    isAutoDJ,
    handleAutoDJToggle 
  } = useAudio();

  return (
    <Card className="h-full w-full bg-slate-800/50 border-slate-700/50 p-1">
      <div className="h-full flex flex-col justify-center items-center gap-1">
        {/* Master Volume */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <Volume2 className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">{volume}</span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Crossfader */}
        <div className="w-full">
          <div className="text-center text-xs text-slate-400 mb-1">CROSSFADER</div>
          <Slider
            value={[crossfaderPosition]}
            onValueChange={(value) => setCrossfader(value[0])}
            min={-1}
            max={1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>A</span>
            <span>B</span>
          </div>
        </div>

        {/* AutoDJ Toggle */}
        <Button
          onClick={() => handleAutoDJToggle(!isAutoDJ)}
          size="sm"
          className={`w-full h-6 text-xs ${
            isAutoDJ ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'
          }`}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          {isAutoDJ ? 'AUTO ON' : 'AUTO OFF'}
        </Button>
      </div>
    </Card>
  );
}