import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, X } from 'lucide-react';
import { useAudio } from '../audio/AudioPlayer';

export default function MicSettingsPanel({ onClose }) {
  const { setMicDevice, micDeviceId, micVolume, setMicVolume } = useAudio();
  const [devices, setDevices] = useState([]);
  const [localVolume, setLocalVolume] = useState(micVolume);
  const [selectedDevice, setSelectedDevice] = useState(micDeviceId);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const audioDevices = (await navigator.mediaDevices.enumerateDevices()).filter(
          (device) => device.kind === 'audioinput'
        );
        setDevices(audioDevices);
        if (!micDeviceId && audioDevices.length > 0) {
          setSelectedDevice(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Could not get audio devices:", error);
      }
    };
    getDevices();
  }, [micDeviceId]);

  const handleSave = () => {
    setMicDevice(selectedDevice);
    setMicVolume(localVolume);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-400" />
            Microphone Settings
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="mic-device" className="text-slate-300">Input Device</Label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger id="mic-device" className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${devices.indexOf(device) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="mic-volume" className="text-slate-300">Input Volume</Label>
              <span className="text-sm font-mono text-blue-300">{localVolume}</span>
            </div>
            <Slider
              id="mic-volume"
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