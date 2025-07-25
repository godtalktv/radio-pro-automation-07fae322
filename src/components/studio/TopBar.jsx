
import React, { useState, useEffect } from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Button } from "@/components/ui/button";
import {
  Settings,
  HelpCircle,
  Radio,
  Mic,
  VolumeX,
  RefreshCw,
  Clapperboard,
  Calendar,
  TestTube, // Added TestTube icon for AutoDJ Test button
  Twitter, // Import Twitter icon
  UserIcon, // Add UserIcon for Virtual Host button
  RotateCcw, // Add refresh icon
} from 'lucide-react';
import { useCustomization } from '../settings/CustomizationProvider';
import AutoDJTester from './AutoDJTester'; // New import for the external AutoDJTester component
import MicSettingsPanel from './MicSettingsPanel';
import LineInSettingsPanel from './LineInSettingsPanel';
import TwitterPanel from './TwitterPanel'; // Import TwitterPanel
import VirtualHostPanel from './VirtualHostPanel'; // Add this import
import StationSettingsPanel from './StationSettingsPanel'; // New import for the settings panel

// New Component for Volume Controls, styled to match the image
const VolumeControl = ({ icon: Icon, label, status, onToggle, settingsLabel, onSettingsClick }) => (
  <div className="flex flex-col gap-1 items-center">
    <div className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold text-sm rounded-full px-3 py-1 text-center shadow-md border-t-2 border-white/50">
      {label}
    </div>
    <Button
      onClick={onToggle}
      variant="outline"
      className={`bg-slate-200 hover:bg-slate-300 text-black font-semibold text-sm rounded-md px-3 py-2 flex items-center justify-center gap-2 border border-slate-400 w-full ${
        status.endsWith('ON') ? 'bg-green-400 hover:bg-green-500' : ''
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{status}</span>
    </Button>
    <button onClick={onSettingsClick} className="text-slate-400 text-[10px] text-center opacity-50 hover:opacity-100 hover:underline">{settingsLabel} settings</button>
  </div>
);

// New component for horizontal VU meters, styled to match the image
const HorizontalVUMeter = ({ level }) => (
  <div className="w-full h-3 bg-black/50 rounded-sm overflow-hidden border border-slate-600">
    <div className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-150" style={{ width: `${level}%` }}></div>
  </div>
);

const CenterClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-center">
            <div className="text-3xl font-bold font-mono text-white tracking-wider">
                {time.toLocaleTimeString([], { hour12: true })}
            </div>
            <div className="text-sm text-slate-400">
                {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
                VTPlayer 1:False 2:False
            </div>
        </div>
    );
};


export default function TopBar({ onViewChange, currentView, onCompressorClick, user, onLoginSuccess }) {
  const { isPlaying, isAutoDJ, handleAutoDJToggle, isMicOn, toggleMic, isLineInOn, toggleLineIn } = useAudio();
  const { getStationCallsign } = useCustomization();
  
  const [showAutoDJTester, setShowAutoDJTester] = useState(false); // New state for AutoDJ Tester
  const [showMicSettings, setShowMicSettings] = useState(false);
  const [showLineInSettings, setShowLineInSettings] = useState(false);
  const [showTwitterPanel, setShowTwitterPanel] = useState(false); // New state for Twitter Panel
  const [showVirtualHostPanel, setShowVirtualHostPanel] = useState(false); // Add this state
  const [showStationSettings, setShowStationSettings] = useState(false); // New state

  const [currentDate, setCurrentDate] = useState('');
  const [vuLevels, setVuLevels] = useState([0, 0]);

  // Add refresh handler
  const handleRefresh = () => {
    if (window.confirm('Are you sure you want to refresh the studio? Any unsaved changes will be lost.')) {
      window.location.reload();
    }
  };

  useEffect(() => {
    const date = new Date();
    // Format to match: July 2025 THU H-0
    const formatted = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()} ${date.toLocaleString('default', { weekday: 'short' }).toUpperCase()} H-0`;
    setCurrentDate(formatted);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setVuLevels([Math.random() * 85 + 10, Math.random() * 80 + 15]);
      }, 150);
    } else {
      setVuLevels([0, 0]);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <>
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 p-2 border-b-2 border-slate-900 shadow-lg">
        <div className="flex items-center justify-between">
          
          {/* Left Controls - Add Refresh button */}
          <div className="grid grid-cols-9 grid-rows-2 gap-1 h-16"> {/* Changed from 8 to 9 columns */}
              {/* Column 1 */}
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold col-start-1 row-start-1">
                RadioPro
              </Button>
              <Button size="sm" variant="outline" className="bg-slate-200 hover:bg-slate-300 text-black flex flex-col p-0 leading-none col-start-1 row-start-2">
                <span className="text-[10px] font-semibold">Professional</span>
                <span className="text-[8px] text-slate-600">By Broadcaster</span>
              </Button>

              {/* Column 2 */}
              <Button variant="outline" className="bg-slate-200 hover:bg-slate-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-2 row-span-2">
                  <span className="text-xs font-semibold">Mute</span>
                  <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                  <VolumeX className="w-4 h-4 text-white" />
                  </div>
              </Button>

              {/* Column 3 */}
              <Button
                  onClick={() => handleAutoDJToggle(!isAutoDJ)}
                  className={`w-full flex flex-col items-center justify-center gap-1 p-1 transition-colors col-start-3 row-span-2 ${
                  isAutoDJ 
                  ? 'bg-green-500 text-black border-green-700' 
                  : 'bg-slate-200 text-black hover:bg-slate-300'
                  }`}
                  variant={isAutoDJ ? 'default' : 'outline'}
              >
                  <span className="text-xs font-semibold">Auto</span>
                  <div className="relative w-7 h-7 flex items-center justify-center">
                      <RefreshCw className={`w-7 h-7 ${isAutoDJ ? 'text-black/80' : 'text-slate-600'}`} />
                      <Settings className={`w-4 h-4 absolute ${isAutoDJ ? 'text-black/80' : 'text-slate-600'}`} />
                  </div>
              </Button>

              {/* Column 4 - Test AutoDJ Button */}
              <Button
                  onClick={() => setShowAutoDJTester(true)}
                  variant="outline"
                  className="bg-slate-200 hover:bg-slate-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-4 row-span-2"
              >
                  <span className="text-xs font-semibold">Test</span>
                  <TestTube className="w-7 h-7 text-green-500" />
              </Button>

              {/* Column 5 - Schedule Button */}
              <Button 
                  onClick={() => onViewChange('scheduler')}
                  variant="outline" 
                  className="bg-slate-200 hover:bg-slate-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-5 row-span-2"
              >
                  <span className="text-xs font-semibold">Schedule</span>
                  <Calendar className="w-7 h-7 text-purple-500" />
              </Button>

              {/* Column 6 - Twitter Button */}
              <Button
                  onClick={() => setShowTwitterPanel(true)}
                  variant="outline"
                  className="bg-sky-200 hover:bg-sky-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-6 row-span-2"
              >
                  <span className="text-xs font-semibold">Tweet</span>
                  <Twitter className="w-7 h-7 text-sky-500" />
              </Button>

              {/* Column 7 - Virtual Host Button */}
              <Button
                  onClick={() => setShowVirtualHostPanel(true)}
                  variant="outline"
                  className="bg-slate-200 hover:bg-slate-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-7 row-span-2"
              >
                  <span className="text-xs font-semibold">Host</span>
                  <UserIcon className="w-7 h-7 text-purple-500" />
              </Button>

              {/* Column 8 - Refresh Button (NEW) */}
              <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="bg-blue-200 hover:bg-blue-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-8 row-span-2"
                  title="Refresh Studio Application"
              >
                  <span className="text-xs font-semibold">Refresh</span>
                  <RotateCcw className="w-7 h-7 text-blue-600" />
              </Button>

              {/* Column 9 - Settings (moved from 8 to 9) */}
              <Button 
                onClick={() => setShowStationSettings(true)}
                variant="outline" 
                className="bg-slate-200 hover:bg-slate-300 text-black w-full flex flex-col items-center justify-center gap-1 p-1 col-start-9 row-span-2">
                  <span className="text-xs font-semibold">Settings</span>
                  <Settings className="w-7 h-7 text-blue-500" />
              </Button>
          </div>


          {/* Center Logo & Clock */}
          <div className="flex items-center gap-8">
              <div className="text-center">
                  <div className="bg-black px-4 py-1 rounded-t-md">
                      <span className="text-2xl font-bold tracking-wider text-white">RadioPro</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-0.5 rounded-b-md text-sm">
                      {getStationCallsign() || 'PRO STUDIO'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                      Music Scheduler + Playout + Encoder in 1
                  </div>
              </div>
              <CenterClock />
          </div>

          {/* Right Controls - Redesigned to match image */}
          <div className="flex items-center gap-2">
              <VolumeControl
                  icon={Radio}
                  label="Line Vol: 100"
                  status={isLineInOn ? 'LineIN ON' : 'LineIN OFF'}
                  onToggle={() => toggleLineIn(!isLineInOn)}
                  settingsLabel="Line"
                  onSettingsClick={() => setShowLineInSettings(true)}
              />
              <VolumeControl
                  icon={Mic}
                  label="Mic Vol: 100"
                  status={isMicOn ? 'Mic ON' : 'Mic OFF'}
                  onToggle={() => toggleMic(!isMicOn)}
                  settingsLabel="Mic"
                  onSettingsClick={() => setShowMicSettings(true)}
              />

              <div className="bg-slate-700/50 rounded-md p-1 flex flex-col gap-1.5 border border-slate-600 self-stretch">
                  <div className="flex items-center justify-between gap-4 px-1">
                      <Button
                          size="sm"
                          className="bg-black/50 text-white h-6 text-xs px-3"
                          onClick={() => onViewChange('streaming')}
                      >
                          Stream Settings
                      </Button>
                      <div className="text-center">
                          <span className="text-xs text-slate-400">{currentDate}</span>
                          <div className="text-xs text-green-400 font-semibold">
                              Shoutcast/Icecast/Live365 Ready
                          </div>
                      </div>
                      <div className={`font-bold text-lg ${isPlaying ? 'text-green-400' : 'text-white'}`}>
                          {isPlaying ? 'ON AIR' : 'OFF AIR'}
                      </div>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                      <HorizontalVUMeter level={vuLevels[0]} />
                      <HorizontalVUMeter level={vuLevels[1]} />
                  </div>
              </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showAutoDJTester && (
        <AutoDJTester onClose={() => setShowAutoDJTester(false)} />
      )}
      {showMicSettings && (
        <MicSettingsPanel onClose={() => setShowMicSettings(false)} />
      )}
      {showLineInSettings && (
        <LineInSettingsPanel onClose={() => setShowLineInSettings(false)} />
      )}
      {showTwitterPanel && (
        <TwitterPanel onClose={() => setShowTwitterPanel(false)} />
      )}
      {showVirtualHostPanel && (
        <VirtualHostPanel onClose={() => setShowVirtualHostPanel(false)} />
      )}
      {showStationSettings && (
        <StationSettingsPanel onClose={() => setShowStationSettings(false)} />
      )}
    </>
  );
}
