import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Radio, X } from 'lucide-react';
import { useAudio } from '../audio/AudioPlayer';

export default function LineInSettingsPanel({ onClose }) {
  const { setLineInUrl, lineInUrl, lineInVolume, setLineInVolume } = useAudio();
  const [localUrl, setLocalUrl] = useState(lineInUrl);
  const [localVolume, setLocalVolume] = useState(lineInVolume);

  const handleSave = () => {
    setLineInUrl(localUrl);
    setLineInVolume(localVolume);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Line-In Settings
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="line-in-url" className="text-slate-300">Stream URL (e.g., another radio stream)</Label>
            <Input
              id="line-in-url"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://your-stream-url.com/stream"
              className="bg-slate-800 border-slate-600 text-white"
            />
             <p className="text-xs text-slate-400 mt-1">Note: Due to web security, only CORS-enabled streams will work.</p>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="line-in-volume" className="text-slate-300">Input Volume</Label>
              <span className="text-sm font-mono text-blue-300">{localVolume}</span>
            </div>
            <Slider
              id="line-in-volume"
              value={[localVolume]}
              onValueChange={(val) => setLocalVolume(val[0])}
              max={100}
              step={1}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}