import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Clock, 
  Shuffle, 
  Volume2, 
  Zap, 
  Shield, 
  Music, 
  Radio,
  Save,
  RotateCcw,
  AlertTriangle,
  Info
} from "lucide-react";
import { useAudio } from "../audio/AudioPlayer";

const DEFAULT_CONFIG = {
  // Queue Management
  targetQueueLength: 5,
  minimumQueueLength: 2,
  buildAheadTime: 300, // seconds
  
  // Crossfading & Transitions
  crossfadeEnabled: true,
  crossfadeDuration: 5000, // milliseconds
  autoFadeIn: true,
  autoFadeOut: true,
  
  // Music Rotation & Variety
  artistSeparationMinutes: 60,
  albumSeparationMinutes: 120,
  genreRotationEnabled: true,
  energyFlowEnabled: true,
  avoidRecentlyPlayed: true,
  recentTrackWindow: 240, // minutes
  
  // Content Timing
  stationIdFrequency: 15, // minutes
  commercialFrequency: 20, // minutes
  promoFrequency: 30, // minutes
  maxConsecutiveMusic: 4,
  
  // Smart Features
  weatherIntegration: false,
  newsIntegration: false,
  timeAnnouncements: false,
  listenerCountAnnouncements: false,
  
  // Compliance & Legal
  dmcaCompliance: true,
  performanceRightsLogging: true,
  soundExchangeReporting: true,
  contentAdvisoryChecks: true,
  
  // Fallback Behavior
  fallbackToAnyMusic: true,
  emergencyPlaylist: null,
  silenceDetection: true,
  autoRestart: true,
  
  // Voice Tracking
  voiceTrackingEnabled: false,
  voiceTrackFadeUnder: -12, // dB
  voiceTrackTimeout: 30, // seconds
  
  // Advanced Mixing
  beatMatching: false,
  keyMatching: false,
  harmonic: false,
  tempoSmoothing: false
};

export default function AutoDJSettings({ isOpen, onClose, onSave }) {
  const { getAutoDJStatus, configureAutoDJ } = useAudio();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    // Load current AutoDJ configuration
    loadCurrentConfig();
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    try {
      const status = getAutoDJStatus();
      if (status.config) {
        setConfig({ ...DEFAULT_CONFIG, ...status.config });
      }
    } catch (error) {
      console.error('Failed to load AutoDJ config:', error);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await configureAutoDJ(config);
      setHasChanges(false);
      if (onSave) onSave(config);
    } catch (error) {
      console.error('Failed to save AutoDJ config:', error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Advanced AutoDJ Configuration
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="ghost" onClick={onClose} className="text-slate-400">
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 m-4 mb-0">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="mixing">Audio</TabsTrigger>
              <TabsTrigger value="compliance">Legal</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="p-6 space-y-6">
              {/* General Settings */}
              <TabsContent value="general" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Queue Management
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Target Queue Length</Label>
                      <Slider
                        value={[config.targetQueueLength]}
                        onValueChange={([value]) => handleConfigChange('targetQueueLength', value)}
                        min={2}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">{config.targetQueueLength} tracks ahead</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Build Ahead Time</Label>
                      <Slider
                        value={[config.buildAheadTime]}
                        onValueChange={([value]) => handleConfigChange('buildAheadTime', value)}
                        min={60}
                        max={1800}
                        step={30}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">{Math.round(config.buildAheadTime / 60)} minutes</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-purple-400" />
                      Music Variety
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Artist Separation</Label>
                      <Switch
                        checked={config.artistSeparationMinutes > 0}
                        onCheckedChange={(checked) => 
                          handleConfigChange('artistSeparationMinutes', checked ? 60 : 0)
                        }
                      />
                    </div>

                    {config.artistSeparationMinutes > 0 && (
                      <div className="space-y-2">
                        <Slider
                          value={[config.artistSeparationMinutes]}
                          onValueChange={([value]) => handleConfigChange('artistSeparationMinutes', value)}
                          min={15}
                          max={240}
                          step={15}
                          className="w-full"
                        />
                        <span className="text-xs text-slate-400">{config.artistSeparationMinutes} minutes between same artist</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Genre Rotation</Label>
                      <Switch
                        checked={config.genreRotationEnabled}
                        onCheckedChange={(checked) => handleConfigChange('genreRotationEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Energy Flow</Label>
                      <Switch
                        checked={config.energyFlowEnabled}
                        onCheckedChange={(checked) => handleConfigChange('energyFlowEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Content Settings */}
              <TabsContent value="content" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-blue-400" />
                      Station Content
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Station ID Frequency</Label>
                      <Slider
                        value={[config.stationIdFrequency]}
                        onValueChange={([value]) => handleConfigChange('stationIdFrequency', value)}
                        min={5}
                        max={60}
                        step={5}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">Every {config.stationIdFrequency} minutes</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Commercial Frequency</Label>
                      <Slider
                        value={[config.commercialFrequency]}
                        onValueChange={([value]) => handleConfigChange('commercialFrequency', value)}
                        min={10}
                        max={120}
                        step={10}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">Every {config.commercialFrequency} minutes</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Max Consecutive Music</Label>
                      <Slider
                        value={[config.maxConsecutiveMusic]}
                        onValueChange={([value]) => handleConfigChange('maxConsecutiveMusic', value)}
                        min={2}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">{config.maxConsecutiveMusic} songs in a row</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      Smart Features
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Weather Integration</Label>
                      <Switch
                        checked={config.weatherIntegration}
                        onCheckedChange={(checked) => handleConfigChange('weatherIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">News Integration</Label>
                      <Switch
                        checked={config.newsIntegration}
                        onCheckedChange={(checked) => handleConfigChange('newsIntegration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Time Announcements</Label>
                      <Switch
                        checked={config.timeAnnouncements}
                        onCheckedChange={(checked) => handleConfigChange('timeAnnouncements', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Listener Count Announcements</Label>
                      <Switch
                        checked={config.listenerCountAnnouncements}
                        onCheckedChange={(checked) => handleConfigChange('listenerCountAnnouncements', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Audio & Mixing Settings */}
              <TabsContent value="mixing" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-green-400" />
                      Crossfading & Transitions
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Enable Crossfading</Label>
                      <Switch
                        checked={config.crossfadeEnabled}
                        onCheckedChange={(checked) => handleConfigChange('crossfadeEnabled', checked)}
                      />
                    </div>

                    {config.crossfadeEnabled && (
                      <div className="space-y-2">
                        <Label className="text-slate-300">Crossfade Duration</Label>
                        <Slider
                          value={[config.crossfadeDuration]}
                          onValueChange={([value]) => handleConfigChange('crossfadeDuration', value)}
                          min={1000}
                          max={15000}
                          step={500}
                          className="w-full"
                        />
                        <span className="text-xs text-slate-400">{config.crossfadeDuration / 1000} seconds</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Auto Fade In</Label>
                      <Switch
                        checked={config.autoFadeIn}
                        onCheckedChange={(checked) => handleConfigChange('autoFadeIn', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Auto Fade Out</Label>
                      <Switch
                        checked={config.autoFadeOut}
                        onCheckedChange={(checked) => handleConfigChange('autoFadeOut', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      Advanced Mixing
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Beat Matching</Label>
                      <Switch
                        checked={config.beatMatching}
                        onCheckedChange={(checked) => handleConfigChange('beatMatching', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Key Matching</Label>
                      <Switch
                        checked={config.keyMatching}
                        onCheckedChange={(checked) => handleConfigChange('keyMatching', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Harmonic Mixing</Label>
                      <Switch
                        checked={config.harmonic}
                        onCheckedChange={(checked) => handleConfigChange('harmonic', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Tempo Smoothing</Label>
                      <Switch
                        checked={config.tempoSmoothing}
                        onCheckedChange={(checked) => handleConfigChange('tempoSmoothing', checked)}
                      />
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-300 text-xs">
                          Advanced mixing features require BPM and key data in your tracks for optimal results.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Legal & Compliance */}
              <TabsContent value="compliance" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      Legal Compliance
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">DMCA Compliance</Label>
                      <Switch
                        checked={config.dmcaCompliance}
                        onCheckedChange={(checked) => handleConfigChange('dmcaCompliance', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Performance Rights Logging</Label>
                      <Switch
                        checked={config.performanceRightsLogging}
                        onCheckedChange={(checked) => handleConfigChange('performanceRightsLogging', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">SoundExchange Reporting</Label>
                      <Switch
                        checked={config.soundExchangeReporting}
                        onCheckedChange={(checked) => handleConfigChange('soundExchangeReporting', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Content Advisory Checks</Label>
                      <Switch
                        checked={config.contentAdvisoryChecks}
                        onCheckedChange={(checked) => handleConfigChange('contentAdvisoryChecks', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      Fallback & Safety
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Fallback to Any Music</Label>
                      <Switch
                        checked={config.fallbackToAnyMusic}
                        onCheckedChange={(checked) => handleConfigChange('fallbackToAnyMusic', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Silence Detection</Label>
                      <Switch
                        checked={config.silenceDetection}
                        onCheckedChange={(checked) => handleConfigChange('silenceDetection', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Auto Restart</Label>
                      <Switch
                        checked={config.autoRestart}
                        onCheckedChange={(checked) => handleConfigChange('autoRestart', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Recent Track Window</Label>
                      <Slider
                        value={[config.recentTrackWindow]}
                        onValueChange={([value]) => handleConfigChange('recentTrackWindow', value)}
                        min={60}
                        max={1440}
                        step={30}
                        className="w-full"
                      />
                      <span className="text-xs text-slate-400">{Math.round(config.recentTrackWindow / 60)} hours</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Voice Tracking</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Enable Voice Tracking</Label>
                      <Switch
                        checked={config.voiceTrackingEnabled}
                        onCheckedChange={(checked) => handleConfigChange('voiceTrackingEnabled', checked)}
                      />
                    </div>

                    {config.voiceTrackingEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Fade Under Level (dB)</Label>
                          <Slider
                            value={[config.voiceTrackFadeUnder]}
                            onValueChange={([value]) => handleConfigChange('voiceTrackFadeUnder', value)}
                            min={-20}
                            max={0}
                            step={1}
                            className="w-full"
                          />
                          <span className="text-xs text-slate-400">{config.voiceTrackFadeUnder} dB</span>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Voice Track Timeout</Label>
                          <Slider
                            value={[config.voiceTrackTimeout]}
                            onValueChange={([value]) => handleConfigChange('voiceTrackTimeout', value)}
                            min={10}
                            max={120}
                            step={5}
                            className="w-full"
                          />
                          <span className="text-xs text-slate-400">{config.voiceTrackTimeout} seconds</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-700/50" />

                  <div className="p-4 bg-slate-800/30 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Configuration Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Queue Length:</span>
                        <span className="text-white ml-2">{config.targetQueueLength} tracks</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Crossfade:</span>
                        <span className="text-white ml-2">{config.crossfadeEnabled ? `${config.crossfadeDuration/1000}s` : 'Off'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Artist Separation:</span>
                        <span className="text-white ml-2">{config.artistSeparationMinutes}min</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Station ID:</span>
                        <span className="text-white ml-2">Every {config.stationIdFrequency}min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="border-t border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-slate-800/50 text-slate-300 border-slate-700/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}