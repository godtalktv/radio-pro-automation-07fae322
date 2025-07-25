
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  Settings, 
  Wifi, 
  WifiOff, 
  Users, 
  Mic, 
  Volume2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Server,
  Music,
  Headphones,
  Activity
} from 'lucide-react';

export default function StreamingPanel({ onClose }) {
  const [encoders, setEncoders] = useState([
    { id: 1, name: 'Encoder 1', active: false, type: 'shoutcast', status: 'disconnected' },
    { id: 2, name: 'Encoder 2', active: false, type: 'icecast', status: 'disconnected' },
    { id: 3, name: 'Encoder 3', active: true, type: 'live365', status: 'connected' },
    { id: 4, name: 'Encoder 4', active: false, type: 'shoutcast', status: 'disconnected' },
    { id: 5, name: 'Encoder 5', active: false, type: 'icecast', status: 'disconnected' },
    { id: 6, name: 'Encoder 6', active: false, type: 'custom', status: 'disconnected' },
    { id: 7, name: 'Encoder 7', active: false, type: 'shoutcast', status: 'disconnected' },
    { id: 8, name: 'Encoder 8', active: false, type: 'icecast', status: 'disconnected' },
    { id: 9, name: 'Encoder 9', active: false, type: 'live365', status: 'disconnected' },
    { id: 10, name: 'Encoder 10', active: false, type: 'shoutcast', status: 'disconnected' },
    { id: 11, name: 'Encoder 11', active: false, type: 'icecast', status: 'disconnected' },
    { id: 12, name: 'AI Server', active: false, type: 'ai', status: 'disconnected' }
  ]);

  const [selectedEncoder, setSelectedEncoder] = useState(3);
  const [streamSettings, setStreamSettings] = useState({
    enabled: true,
    type: 'live365',
    serverPath: 'yourStreamServerPath.com',
    mountPoint: '/Mount',
    portNumber: '8000',
    username: 'source',
    password: '',
    sourcePassword: '',
    stationName: 'Your Station Name',
    stationUrl: 'Your Station Website',
    genre: 'Genre',
    description: 'Description',
    autoReconnect: true,
    format: 'MP3',
    bitrate: '128',
    sampleRate: '44100',
    makePublic: false
  });

  const [statistics, setStatistics] = useState({
    listeners: 32,
    peakListeners: 87,
    totalPlayTime: '2:34:12',
    songsPlayed: 42,
    avgListenTime: '3:45'
  });

  const [micSettings, setMicSettings] = useState({
    bypass: false,
    enhance: true,
    level: 75,
    preview: false
  });

  const toggleEncoder = (id) => {
    setEncoders(encoders.map(enc => 
      enc.id === id 
        ? { ...enc, active: !enc.active, status: !enc.active ? 'connected' : 'disconnected' }
        : enc
    ));
  };

  const handleStreamSettingChange = (key, value) => {
    setStreamSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const connectedEncoders = encoders.filter(enc => enc.active).length;
  const totalListeners = statistics.listeners;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[80vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              Professional Streaming Suite
            </CardTitle>
            <p className="text-sm text-blue-400 mt-1">
              Stream to Shoutcast, Icecast, or Live365 Servers - Built-in Encoder Included
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports Windows 7, 10, 11 & Cloud Windows VPS Operation
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400">
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            
            {/* Left Panel - 12 Built-in Encoders */}
            <div className="p-4 border-r border-slate-700">
              <div className="mb-4">
                <h3 className="text-white font-bold">12 Built-in Encoders</h3>
                <p className="text-sm text-blue-400">Professional Multi-Stream Capability</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {encoders.map(encoder => (
                  <Button
                    key={encoder.id}
                    onClick={() => {
                      setSelectedEncoder(encoder.id);
                      toggleEncoder(encoder.id);
                    }}
                    className={`h-12 text-xs ${
                      encoder.active 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{encoder.name}</span>
                      <div className="flex items-center gap-1">
                        {encoder.active ? 
                          <CheckCircle className="w-3 h-3" /> : 
                          <WifiOff className="w-3 h-3" />
                        }
                        <span className="text-xs capitalize">{encoder.type}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Connection Status */}
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-center mb-2">
                  <Badge className="bg-blue-500 text-white">
                    Professional Broadcasting Suite
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Active Encoders</span>
                  <Badge className={`${connectedEncoders > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {connectedEncoders}/12
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Total Listeners</span>
                  <Badge className="bg-blue-500">
                    <Users className="w-3 h-3 mr-1" />
                    {totalListeners}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Broadcast Status</span>
                  <Badge className={`${connectedEncoders > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {connectedEncoders > 0 ? 'LIVE ON AIR' : 'OFF AIR'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Center Panel - Server Configuration */}
            <div className="p-4 space-y-4">
              <h3 className="text-white font-bold mb-4">Shoutcast/Icecast Server Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={streamSettings.enabled}
                    onCheckedChange={(checked) => handleStreamSettingChange('enabled', checked)}
                    id="enable-encoder"
                  />
                  <Label htmlFor="enable-encoder" className="text-slate-300">Enable Encoder</Label>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">Type:</Label>
                  <Select 
                    value={streamSettings.type}
                    onValueChange={(value) => handleStreamSettingChange('type', value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live365">Live 365 (2017)</SelectItem>
                      <SelectItem value="shoutcast">Shoutcast v1</SelectItem>
                      <SelectItem value="shoutcast2">Shoutcast v2</SelectItem>
                      <SelectItem value="icecast">Icecast v1</SelectItem>
                      <SelectItem value="icecast2">Icecast v2</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">Connected 32; Server Path:</Label>
                  <Input
                    value={streamSettings.serverPath}
                    onChange={(e) => handleStreamSettingChange('serverPath', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="yourStreamServerPath.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300 text-sm">Mount Point:</Label>
                    <Input
                      value={streamSettings.mountPoint}
                      onChange={(e) => handleStreamSettingChange('mountPoint', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Port Number:</Label>
                    <Input
                      value={streamSettings.portNumber}
                      onChange={(e) => handleStreamSettingChange('portNumber', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300 text-sm">Username:</Label>
                    <Input
                      value={streamSettings.username}
                      onChange={(e) => handleStreamSettingChange('username', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Password:</Label>
                    <Input
                      type="password"
                      value={streamSettings.password}
                      onChange={(e) => handleStreamSettingChange('password', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">Source Password:</Label>
                  <Input
                    type="password"
                    value={streamSettings.sourcePassword}
                    onChange={(e) => handleStreamSettingChange('sourcePassword', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="**************"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Station Info & Advanced Settings */}
            <div className="p-4 border-l border-slate-700">
              <Tabs defaultValue="station" className="h-full">
                <TabsList className="bg-slate-800">
                  <TabsTrigger value="station" className="text-xs">Station Info</TabsTrigger>
                  <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="station" className="space-y-3 mt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      checked={streamSettings.makePublic}
                      onCheckedChange={(checked) => handleStreamSettingChange('makePublic', checked)}
                      id="make-public"
                    />
                    <Label htmlFor="make-public" className="text-slate-300 font-bold">Make Public</Label>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Name:</Label>
                    <Input
                      value={streamSettings.stationName}
                      onChange={(e) => handleStreamSettingChange('stationName', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">URL:</Label>
                    <Input
                      value={streamSettings.stationUrl}
                      onChange={(e) => handleStreamSettingChange('stationUrl', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Genre:</Label>
                    <Input
                      value={streamSettings.genre}
                      onChange={(e) => handleStreamSettingChange('genre', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Description:</Label>
                    <Textarea
                      value={streamSettings.description}
                      onChange={(e) => handleStreamSettingChange('description', e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white h-20"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={streamSettings.autoReconnect}
                      onCheckedChange={(checked) => handleStreamSettingChange('autoReconnect', checked)}
                      id="auto-reconnect"
                    />
                    <Label htmlFor="auto-reconnect" className="text-slate-300">Auto-reconnect</Label>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-3 mt-4">
                  <h4 className="text-white font-bold">Audio Format/Bitrate</h4>
                  
                  <div>
                    <Label className="text-slate-300 text-sm">Format:</Label>
                    <Select 
                      value={streamSettings.format}
                      onValueChange={(value) => handleStreamSettingChange('format', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MP3">MP3</SelectItem>
                        <SelectItem value="AAC">AAC Plus</SelectItem>
                        <SelectItem value="OGG">OGG Vorbis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Bitrate:</Label>
                    <Select 
                      value={streamSettings.bitrate}
                      onValueChange={(value) => handleStreamSettingChange('bitrate', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="64">64 kbps</SelectItem>
                        <SelectItem value="128">128 kbps</SelectItem>
                        <SelectItem value="192">192 kbps</SelectItem>
                        <SelectItem value="320">320 kbps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Sample Rate:</Label>
                    <Select 
                      value={streamSettings.sampleRate}
                      onValueChange={(value) => handleStreamSettingChange('sampleRate', value)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="22050">22050 Hz</SelectItem>
                        <SelectItem value="44100">44100 Hz</SelectItem>
                        <SelectItem value="48000">48000 Hz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                    <h5 className="text-white font-bold flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Microphone Settings
                    </h5>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={micSettings.bypass}
                        onCheckedChange={(checked) => setMicSettings({...micSettings, bypass: checked})}
                        id="mic-bypass"
                      />
                      <Label htmlFor="mic-bypass" className="text-slate-300 text-sm">Mic bypass direct to stream</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={micSettings.enhance}
                        onCheckedChange={(checked) => setMicSettings({...micSettings, enhance: checked})}
                        id="mic-enhance"
                      />
                      <Label htmlFor="mic-enhance" className="text-slate-300 text-sm">Mic Enhance FX</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={micSettings.preview}
                        onCheckedChange={(checked) => setMicSettings({...micSettings, preview: checked})}
                        id="studio-preview"
                      />
                      <Label htmlFor="studio-preview" className="text-slate-300 text-sm">Preview music in studio without affecting broadcast</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-3 mt-4">
                  <h4 className="text-white font-bold">Advanced Features</h4>
                  
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Artist / Song / Gender / Tempo Separation Rules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Listener counts and song tune out/in Statistics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Re-Stream/Simulcast other web streams using .pLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Micro Caster transmit without stream provider</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Send Text to Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Beep when disconnected</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-3">
                    <h5 className="text-white font-bold mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Live Statistics
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Current Listeners:</span>
                        <div className="text-green-400 font-bold">{statistics.listeners}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Peak Today:</span>
                        <div className="text-blue-400 font-bold">{statistics.peakListeners}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Songs Played:</span>
                        <div className="text-purple-400 font-bold">{statistics.songsPlayed}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Listen Time:</span>
                        <div className="text-orange-400 font-bold">{statistics.avgListenTime}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
