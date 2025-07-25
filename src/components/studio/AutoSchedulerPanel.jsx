
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Track, Show, Clockwheel } from "@/api/entities";
import { Wand2, Clock, Loader2, CheckCircle, AlertTriangle, Plus, Edit, Trash2, Play, ArrowLeft, Calendar, RefreshCw } from "lucide-react";
import { useAudio } from "../audio/AudioPlayer";
import PlaylistGenerator from "../scheduler/PlaylistGenerator"; // Updated import name
import VisualRotationEditor from "../scheduler/VisualRotationEditor";
import RotationScheduler from "../scheduler/RotationScheduler"; // Import the new scheduler
import SystemReset from './SystemReset'; // New import

// Professional Clockwheel Templates - Fixed with required ID fields
const SHOW_TEMPLATES = [
  {
    name: 'Early Morning Mix',
    start: '00:00',
    end: '06:00',
    clockwheel: {
      name: 'Late Night/Early Morning',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 12, genre_filter: ['ambient', 'classical', 'jazz'], energy_filter: ['low'], estimated_duration: 720 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 12, genre_filter: ['folk', 'blues', 'soul'], energy_filter: ['low', 'medium'], estimated_duration: 720 },
        { id: 'item_4', position: 4, type: 'music', duration_minutes: 15, genre_filter: ['classical', 'ambient'], energy_filter: ['low'], estimated_duration: 900 },
        { id: 'item_5', position: 5, type: 'commercial', exact_item_count: 1, estimated_duration: 60 },
        { id: 'item_6', position: 6, type: 'music', duration_minutes: 18, genre_filter: ['jazz', 'blues'], energy_filter: ['low', 'medium'], estimated_duration: 1080 }
      ]
    }
  },
  {
    name: 'Morning Drive',
    start: '06:00',
    end: '10:00',
    clockwheel: {
      name: 'Morning Drive Hour',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 10, genre_filter: ['pop', 'rock', 'alternative'], energy_filter: ['high', 'medium'], estimated_duration: 600 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 8, genre_filter: ['pop', 'r_and_b'], energy_filter: ['high'], estimated_duration: 480 },
        { id: 'item_4', position: 4, type: 'commercial', exact_item_count: 2, estimated_duration: 120 },
        { id: 'item_5', position: 5, type: 'music', duration_minutes: 12, genre_filter: ['rock', 'alternative', 'pop'], energy_filter: ['medium', 'high'], estimated_duration: 720 },
        { id: 'item_6', position: 6, type: 'promo', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_7', position: 7, type: 'music', duration_minutes: 15, genre_filter: ['pop', 'hip_hop', 'r_and_b'], energy_filter: ['high'], estimated_duration: 900 },
        { id: 'item_8', position: 8, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_9', position: 9, type: 'music', duration_minutes: 10, genre_filter: ['rock', 'alternative'], energy_filter: ['medium', 'high'], estimated_duration: 600 }
      ]
    }
  },
  {
    name: 'Midday Hits',
    start: '10:00',
    end: '14:00',
    clockwheel: {
      name: 'Midday Programming',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 12, genre_filter: ['pop', 'r_and_b', 'hip_hop'], energy_filter: ['medium'], estimated_duration: 720 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 15, genre_filter: ['pop', 'soul', 'funk'], energy_filter: ['medium'], estimated_duration: 900 },
        { id: 'item_4', position: 4, type: 'commercial', exact_item_count: 1, estimated_duration: 60 },
        { id: 'item_5', position: 5, type: 'music', duration_minutes: 18, genre_filter: ['hip_hop', 'r_and_b', 'pop'], energy_filter: ['medium', 'high'], estimated_duration: 1080 },
        { id: 'item_6', position: 6, type: 'music', duration_minutes: 12, genre_filter: ['pop', 'alternative'], energy_filter: ['medium'], estimated_duration: 720 }
      ]
    }
  },
  {
    name: 'Afternoon Chill',
    start: '14:00',
    end: '18:00',
    clockwheel: {
      name: 'Afternoon Relaxed',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 15, genre_filter: ['folk', 'blues', 'reggae', 'soul'], energy_filter: ['low', 'medium'], estimated_duration: 900 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 12, genre_filter: ['jazz', 'folk', 'alternative'], energy_filter: ['low'], estimated_duration: 720 },
        { id: 'item_4', position: 4, type: 'commercial', exact_item_count: 1, estimated_duration: 60 },
        { id: 'item_5', position: 5, type: 'music', duration_minutes: 18, genre_filter: ['reggae', 'soul', 'blues'], energy_filter: ['medium'], estimated_duration: 1080 },
        { id: 'item_6', position: 6, type: 'music', duration_minutes: 12, genre_filter: ['folk', 'alternative'], energy_filter: ['low', 'medium'], estimated_duration: 720 }
      ]
    }
  },
  {
    name: 'Evening Rock Block',
    start: '18:00',
    end: '22:00',
    clockwheel: {
      name: 'Evening Rock Hour',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 12, genre_filter: ['rock', 'metal', 'punk', 'alternative'], energy_filter: ['high'], estimated_duration: 720 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 15, genre_filter: ['rock', 'alternative'], energy_filter: ['high'], estimated_duration: 900 },
        { id: 'item_4', position: 4, type: 'commercial', exact_item_count: 1, estimated_duration: 60 },
        { id: 'item_5', position: 5, type: 'music', duration_minutes: 18, genre_filter: ['metal', 'punk', 'rock'], energy_filter: ['high'], estimated_duration: 1080 },
        { id: 'item_6', position: 6, type: 'promo', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_7', position: 7, type: 'music', duration_minutes: 12, genre_filter: ['alternative', 'rock'], energy_filter: ['medium', 'high'], estimated_duration: 720 }
      ]
    }
  },
  {
    name: 'Late Night Grooves',
    start: '22:00',
    end: '24:00',
    clockwheel: {
      name: 'Late Night Vibes',
      items: [
        { id: 'item_1', position: 1, type: 'music', duration_minutes: 15, genre_filter: ['electronic', 'funk', 'disco', 'house'], energy_filter: ['medium', 'high'], estimated_duration: 900 },
        { id: 'item_2', position: 2, type: 'station_id', exact_item_count: 1, estimated_duration: 30 },
        { id: 'item_3', position: 3, type: 'music', duration_minutes: 12, genre_filter: ['funk', 'disco', 'soul'], energy_filter: ['medium'], estimated_duration: 720 },
        { id: 'item_4', position: 4, type: 'commercial', exact_item_count: 1, estimated_duration: 60 },
        { id: 'item_5', position: 5, type: 'music', duration_minutes: 20, genre_filter: ['electronic', 'house', 'disco'], energy_filter: ['medium', 'high'], estimated_duration: 1200 },
        { id: 'item_6', position: 6, type: 'music', duration_minutes: 10, genre_filter: ['funk', 'soul'], energy_filter: ['medium'], estimated_duration: 600 }
      ]
    }
  }
];

// This object defines average durations for different content types.
// It's used to provide a fallback duration if estimated_duration or duration_minutes is not available.
const CONTENT_TYPES = {
  music: { avgDuration: 180 }, // 3 minutes
  station_id: { avgDuration: 30 }, // 30 seconds
  commercial: { avgDuration: 60 }, // 1 minute
  promo: { avgDuration: 30 }, // 30 seconds
  // Add other types as needed
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AutoSchedulerPanel({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'idle' });
  const [clockwheels, setClockwheels] = useState([]);
  const [editingClockwheelId, setEditingClockwheelId] = useState(null);
  const [showPlaylistGenerator, setShowPlaylistGenerator] = useState(false); // Renamed state
  const [showRotationScheduler, setShowRotationScheduler] = useState(false); // New state
  const [showSystemReset, setShowSystemReset] = useState(false); // New state
  const { handleAutoDJToggle } = useAudio();

  useEffect(() => {
    loadClockwheels();
  }, []);

  const loadClockwheels = async () => {
    try {
      const fetched = await Clockwheel.list('-created_date');
      setClockwheels(fetched);
    } catch (error) {
      console.error('Failed to load clockwheels:', error);
    }
  };
  
  const handleEditorClose = (didSave) => {
    setEditingClockwheelId(null);
    if (didSave) {
      loadClockwheels(); // Refresh the list if changes were saved
    }
  };

  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setStatus({ message: 'Starting professional auto-scheduler...', type: 'loading' });

    try {
      // 1. Verify we have content to work with
      setStatus({ message: 'Verifying music library...', type: 'loading' });
      const allTracks = await Track.list('-created_date', 5000);
      if (allTracks.length === 0) {
        throw new Error("Music library is empty. Please upload tracks before generating a schedule.");
      }

      const musicTracks = allTracks.filter(t => t.track_type === 'music');
      const stationIds = allTracks.filter(t => t.track_type === 'station_id');
      
      if (musicTracks.length === 0) {
        throw new Error("No music tracks found. Please upload music tracks before generating a schedule.");
      }

      if (stationIds.length === 0) {
        console.warn("No station ID tracks found. Shows will still be created but may not sound professional.");
      }

      // 2. Clear previously auto-generated content
      setStatus({ message: 'Clearing old auto-generated schedule...', type: 'loading' });
      const existingShows = await Show.filter({ is_auto_generated: true });
      const existingClockwheels = await Clockwheel.list();
      const autoClockwheels = existingClockwheels.filter(cw => cw.name.includes('Auto-Generated'));

      // Delete existing shows with delay
      for (const show of existingShows) {
        try { 
          await Show.delete(show.id);
          await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
        } catch (e) { 
          console.warn("Failed to delete show:", e); 
        }
      }

      // Delete existing clockwheels with delay
      for (const cw of autoClockwheels) {
        try { 
          await Clockwheel.delete(cw.id);
          await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
        } catch (e) { 
          console.warn("Failed to delete clockwheel:", e); 
        }
      }

      // 3. Create clockwheels for each show template with delay
      setStatus({ message: 'Creating professional clockwheel templates...', type: 'loading' });
      const createdClockwheels = {};

      for (const template of SHOW_TEMPLATES) {
        const clockwheelData = {
          name: `Auto-Generated: ${template.clockwheel.name}`,
          items: template.clockwheel.items
        };

        try {
          const newClockwheel = await Clockwheel.create(clockwheelData);
          createdClockwheels[template.name] = newClockwheel.id;
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between creates
        } catch (error) {
          console.error(`Failed to create clockwheel for ${template.name}:`, error);
          throw new Error(`Failed to create clockwheel: ${error.message}`);
        }
      }

      // 4. Generate shows for each day using the clockwheels with delay
      for (const day of DAYS) {
        setStatus({ message: `Generating professional schedule for ${day}...`, type: 'loading' });
        
        for (const template of SHOW_TEMPLATES) {
          const showData = {
            name: template.name,
            host: 'Auto DJ',
            day_of_week: day,
            start_time: template.start,
            end_time: template.end,
            clockwheel_id: createdClockwheels[template.name],
            is_auto_generated: true,
            recurring: true
          };

          try {
            await Show.create(showData);
            await new Promise(resolve => setTimeout(resolve, 400)); // 400ms delay between creates
          } catch (error) {
            console.error(`Failed to create show ${template.name} for ${day}:`, error);
            throw new Error(`Failed to create show: ${error.message}`);
          }
        }
      }

      // 5. Activate Auto DJ Mode
      setStatus({ message: 'Activating Auto DJ with professional programming...', type: 'loading' });
      handleAutoDJToggle(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({ 
        message: 'Professional weekly schedule generated! Your station is now running with industry-standard clockwheel programming.', 
        type: 'success' 
      });

      await loadClockwheels(); // Refresh clockwheel list

    } catch (error) {
      console.error("Auto-scheduling failed:", error);
      setStatus({ message: error.message || 'An unexpected error occurred.', type: 'error' });
    }

    setIsLoading(false);
  };

  const handleDeleteClockwheel = async (id) => {
    if (window.confirm("Are you sure you want to delete this clockwheel?")) {
      try {
        await Clockwheel.delete(id);
        await loadClockwheels();
      } catch (error) {
        console.error('Failed to delete clockwheel:', error);
      }
    }
  };

  if (showSystemReset) {
    return <SystemReset onComplete={() => {setShowSystemReset(false); loadClockwheels();}} />;
  }

  if (editingClockwheelId !== null) {
      return <VisualRotationEditor clockwheelId={editingClockwheelId === 'new' ? null : editingClockwheelId} onClose={handleEditorClose} />;
  }

  if (showRotationScheduler) {
      return <RotationScheduler onClose={() => setShowRotationScheduler(false)} />;
  }

  return (
    <Card className="w-full max-w-6xl h-[90vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between p-4 bg-slate-800 border-b border-slate-700 flex-shrink-0">
         <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-white mb-0">Professional Auto Scheduler</CardTitle>
            <p className="text-sm text-blue-400">Developed by a Radio Broadcaster - Industry FIRST Features</p>
            <p className="text-sm text-slate-400">Generate clockwheel-based programming with Real-time Rotation Mode</p>
         </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSystemReset(true)}
            variant="outline"
            className="bg-red-600/20 text-red-400 border-red-600/50 hover:bg-red-600/30"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            System Reset
          </Button>
          <Button 
              onClick={onBack}
              variant="outline"
              className="bg-slate-700/50 text-slate-300 border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
          </Button>
        </div>
       </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Auto Scheduler Card */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400" />
              Generate Professional Schedule & Start Automation
            </CardTitle>
            <p className="text-sm text-blue-400">
              ✨ Industry FIRST: Built-in Powerful Scheduler (2012) with Audience Pleaser Settings
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-300">
              This professional scheduler creates <strong>clockwheel-based programming</strong> using industry standards. 
              Features our unique <strong>Real-time Rotation Mode</strong> with automatic crossfading and silence removal.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-400 font-medium mb-2">🎯 Professional Features:</h3>
                <ul className="text-blue-300/80 text-sm space-y-1">
                  <li>• <strong>Music Scheduler + Playout + Encoder</strong> - All in ONE!</li>
                  <li>• <strong>Simple Top of Hour Operation</strong> - No complicated syncing</li>
                  <li>• <strong>Real-time Automatic Cross Fading</strong> - Industry First</li>
                  <li>• <strong>Built-in Audio Processing</strong> - DSP/VST support</li>
                  <li>• <strong>Audience Pleaser Settings</strong> - Tune-in/tune-out stats</li>
                </ul>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h3 className="text-green-400 font-medium mb-2">🚀 Innovation FIRSTS:</h3>
                <ul className="text-green-300/80 text-sm space-y-1">
                  <li>• <strong>Audience Pleaser</strong> (2012) - Tune statistics</li>
                  <li>• <strong>Real-time Rotation Mode</strong> (2012) - Dynamic scheduling</li>
                  <li>• <strong>Multi-Party goLive</strong> (2022) - Remote collaboration</li>
                  <li>• <strong>Built-in Traffic Scheduler</strong> (2023) - Commercial management</li>
                  <li>• <strong>Cloud Windows VPS Ready</strong> - No sound cards needed</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-500/10 rounded-lg border border-orange-500/20 p-4">
              <h3 className="text-orange-400 font-medium mb-2">📻 Streaming Ready:</h3>
              <p className="text-orange-300/80 text-sm">
                Stream to <strong>Shoutcast, Icecast, or Live365</strong> servers with built-in encoder. 
                Supports Windows 7, 10, 11, and Cloud Windows VPS operation.
              </p>
            </div>
            
            <div className="text-center">
              <Button
                onClick={handleGenerateSchedule}
                disabled={isLoading}
                className="w-full max-w-md h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-6 h-6 mr-2" />
                )}
                {isLoading ? 'Creating Professional Schedule...' : 'Generate BEST Possible Radio Schedule'}
              </Button>
            </div>
            
            {status.type !== 'idle' && (
              <div className={`p-4 rounded-lg flex items-center justify-center gap-3 ${
                status.type === 'success' ? 'bg-green-500/10 text-green-400' :
                status.type === 'error' ? 'bg-red-500/10 text-red-400' :
                'bg-slate-800/50 text-slate-300'
              }`}>
                {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {status.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {status.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                <p className="font-medium">{status.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clockwheel Management */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Manage Clockwheels
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowRotationScheduler(true)} // Changed onClick
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Rotation Scheduler {/* Changed text */}
                </Button>
                 <Button 
                  onClick={() => setEditingClockwheelId('new')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Clockwheel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clockwheels.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p>No clockwheels created yet. Use the Auto Scheduler above to generate professional templates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clockwheels.map(cw => (
                  <div key={cw.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white truncate">{cw.name}</h3>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          onClick={() => setEditingClockwheelId(cw.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteClockwheel(cw.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cw.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 capitalize">{item.type.replace('_', ' ')}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatDuration(item.estimated_duration || CONTENT_TYPES[item.type]?.avgDuration || 180)} {/* Updated formatDuration call */}
                          </Badge>
                        </div>
                      ))}
                      {cw.items?.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{cw.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Music Scheduler Modal (now Playlist Generator) */}
        {showPlaylistGenerator && ( // Renamed state
          <PlaylistGenerator // Renamed component
            onClose={() => setShowPlaylistGenerator(false)} // Renamed state setter
          />
        )}
      </CardContent>
    </Card>
  );
}

// Helper to format duration, can be moved to a utils file
function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return "N/A";
  }
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}
