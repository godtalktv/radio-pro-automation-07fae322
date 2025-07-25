import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Zap, X, SlidersHorizontal, Info } from 'lucide-react';
import { useAudio } from './AudioPlayer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = {
  default: { threshold: -24, ratio: 12, attack: 0.003, release: 0.25, knee: 30, makeupGain: 6, name: "Default Broadcast" },
  subtle: { threshold: -18, ratio: 4, attack: 0.01, release: 0.2, knee: 20, makeupGain: 4, name: "Subtle Glue" },
  vocal: { threshold: -28, ratio: 6, attack: 0.005, release: 0.15, knee: 15, makeupGain: 7, name: "Vocal Enhancer" },
  aggressive: { threshold: -30, ratio: 20, attack: 0.001, release: 0.1, knee: 5, makeupGain: 8, name: "Aggressive Pumper" },
};

export default function CompressorPanel({ onClose }) {
  const { compressorSettings, updateCompressorSettings, isCompressorActive, toggleCompressor } = useAudio();
  const [localSettings, setLocalSettings] = useState(compressorSettings);

  useEffect(() => {
    setLocalSettings(compressorSettings);
  }, [compressorSettings]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (presetName) => {
    const preset = Object.values(PRESETS).find(p => p.name === presetName) || PRESETS.default;
    setLocalSettings(preset);
  };
  
  const handleSave = () => {
    updateCompressorSettings(localSettings);
    onClose();
  };

  const SliderControl = ({ label, value, min, max, step, unit, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-slate-300 text-sm">{label}</Label>
        <span className="text-sm font-mono text-blue-300 bg-slate-700/50 px-2 py-0.5 rounded">
          {value.toFixed(label === 'Attack' || label === 'Release' ? 3 : 1)} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Master Audio Compressor
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                <div className="flex flex-col">
                    <Label htmlFor="compressor-enable" className="font-bold text-white text-lg">Master Compressor</Label>
                    <span className="text-xs text-slate-400">Applies dynamic range compression to the final output.</span>
                </div>
                <Switch
                    id="compressor-enable"
                    checked={isCompressorActive}
                    onCheckedChange={toggleCompressor}
                />
            </div>
        
            <div className="space-y-4">
                <div>
                    <Label className="text-slate-300 text-sm">Presets</Label>
                    <Select onValueChange={handlePresetChange} defaultValue={localSettings.name || 'Default Broadcast'}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue placeholder="Load a preset..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(PRESETS).map(p => (
                                <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <SliderControl label="Threshold" value={localSettings.threshold} min={-100} max={0} step={0.1} unit="dB" onChange={(val) => handleSettingChange('threshold', val)} />
                <SliderControl label="Ratio" value={localSettings.ratio} min={1} max={20} step={0.1} unit=":1" onChange={(val) => handleSettingChange('ratio', val)} />
                <SliderControl label="Attack" value={localSettings.attack} min={0} max={1} step={0.001} unit="s" onChange={(val) => handleSettingChange('attack', val)} />
                <SliderControl label="Release" value={localSettings.release} min={0} max={1} step={0.01} unit="s" onChange={(val) => handleSettingChange('release', val)} />
                <SliderControl label="Makeup Gain" value={localSettings.makeupGain} min={0} max={24} step={0.1} unit="dB" onChange={(val) => handleSettingChange('makeupGain', val)} />
            </div>

            <div className="flex justify-end mt-2">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save and Close</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}