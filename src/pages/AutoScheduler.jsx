import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Track, Playlist, Show, Clockwheel } from "@/api/entities";
import { Wand2, Clock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAudio } from "../components/audio/AudioPlayer";

// --- Professional Clockwheel Templates ---
const SHOW_TEMPLATES = [
  {
    name: 'Early Morning Mix',
    start: '00:00',
    end: '06:00',
    clockwheel: {
      name: 'Late Night/Early Morning',
      items: [
        { position: 1, type: 'music', duration_minutes: 12, genre_filter: ['ambient', 'classical', 'jazz'], energy_filter: ['low'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 12, genre_filter: ['folk', 'blues', 'soul'], energy_filter: ['low', 'medium'] },
        { position: 4, type: 'music', duration_minutes: 15, genre_filter: ['classical', 'ambient'], energy_filter: ['low'] },
        { position: 5, type: 'commercial', exact_item_count: 1 },
        { position: 6, type: 'music', duration_minutes: 18, genre_filter: ['jazz', 'blues'], energy_filter: ['low', 'medium'] }
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
        { position: 1, type: 'music', duration_minutes: 10, genre_filter: ['pop', 'rock', 'alternative'], energy_filter: ['high', 'medium'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 8, genre_filter: ['pop', 'r_and_b'], energy_filter: ['high'] },
        { position: 4, type: 'commercial', exact_item_count: 2 },
        { position: 5, type: 'music', duration_minutes: 12, genre_filter: ['rock', 'alternative', 'pop'], energy_filter: ['medium', 'high'] },
        { position: 6, type: 'promo', exact_item_count: 1 },
        { position: 7, type: 'music', duration_minutes: 15, genre_filter: ['pop', 'hip_hop', 'r_and_b'], energy_filter: ['high'] },
        { position: 8, type: 'station_id', exact_item_count: 1 },
        { position: 9, type: 'music', duration_minutes: 10, genre_filter: ['rock', 'alternative'], energy_filter: ['medium', 'high'] }
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
        { position: 1, type: 'music', duration_minutes: 12, genre_filter: ['pop', 'r_and_b', 'hip_hop'], energy_filter: ['medium'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 15, genre_filter: ['pop', 'soul', 'funk'], energy_filter: ['medium'] },
        { position: 4, type: 'commercial', exact_item_count: 1 },
        { position: 5, type: 'music', duration_minutes: 18, genre_filter: ['hip_hop', 'r_and_b', 'pop'], energy_filter: ['medium', 'high'] },
        { position: 6, type: 'music', duration_minutes: 12, genre_filter: ['pop', 'alternative'], energy_filter: ['medium'] }
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
        { position: 1, type: 'music', duration_minutes: 15, genre_filter: ['folk', 'blues', 'reggae', 'soul'], energy_filter: ['low', 'medium'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 12, genre_filter: ['jazz', 'folk', 'alternative'], energy_filter: ['low'] },
        { position: 4, type: 'commercial', exact_item_count: 1 },
        { position: 5, type: 'music', duration_minutes: 18, genre_filter: ['reggae', 'soul', 'blues'], energy_filter: ['medium'] },
        { position: 6, type: 'music', duration_minutes: 12, genre_filter: ['folk', 'alternative'], energy_filter: ['low', 'medium'] }
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
        { position: 1, type: 'music', duration_minutes: 12, genre_filter: ['rock', 'metal', 'punk', 'alternative'], energy_filter: ['high'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 15, genre_filter: ['rock', 'alternative'], energy_filter: ['high'] },
        { position: 4, type: 'commercial', exact_item_count: 1 },
        { position: 5, type: 'music', duration_minutes: 18, genre_filter: ['metal', 'punk', 'rock'], energy_filter: ['high'] },
        { position: 6, type: 'promo', exact_item_count: 1 },
        { position: 7, type: 'music', duration_minutes: 12, genre_filter: ['alternative', 'rock'], energy_filter: ['medium', 'high'] }
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
        { position: 1, type: 'music', duration_minutes: 15, genre_filter: ['electronic', 'funk', 'disco', 'house'], energy_filter: ['medium', 'high'] },
        { position: 2, type: 'station_id', exact_item_count: 1 },
        { position: 3, type: 'music', duration_minutes: 12, genre_filter: ['funk', 'disco', 'soul'], energy_filter: ['medium'] },
        { position: 4, type: 'commercial', exact_item_count: 1 },
        { position: 5, type: 'music', duration_minutes: 20, genre_filter: ['electronic', 'house', 'disco'], energy_filter: ['medium', 'high'] },
        { position: 6, type: 'music', duration_minutes: 10, genre_filter: ['funk', 'soul'], energy_filter: ['medium'] }
      ]
    }
  }
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AutoScheduler() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: 'idle' });
  const { handleAutoDJToggle } = useAudio();

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

      // Check for required content types
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

      // Delete old shows first
      const showDeletionPromises = existingShows.map(async (show) => {
        try { 
          await Show.delete(show.id); 
        } catch (e) { 
          console.warn("Failed to delete show:", e); 
        }
      });
      await Promise.all(showDeletionPromises);

      // Delete old auto-generated clockwheels
      const clockwheelDeletionPromises = autoClockwheels.map(async (cw) => {
        try { 
          await Clockwheel.delete(cw.id); 
        } catch (e) { 
          console.warn("Failed to delete clockwheel:", e); 
        }
      });
      await Promise.all(clockwheelDeletionPromises);

      // 3. Create clockwheels for each show template
      setStatus({ message: 'Creating professional clockwheel templates...', type: 'loading' });
      const createdClockwheels = {};

      for (const template of SHOW_TEMPLATES) {
        const clockwheelData = {
          name: `Auto-Generated: ${template.clockwheel.name}`,
          items: template.clockwheel.items
        };

        const newClockwheel = await Clockwheel.create(clockwheelData);
        createdClockwheels[template.name] = newClockwheel.id;
        console.log(`Created clockwheel: ${clockwheelData.name}`);
      }

      // 4. Generate shows for each day using the clockwheels
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

          await Show.create(showData);
          console.log(`Created show: ${template.name} for ${day}`);
        }
      }

      // 5. Activate Auto DJ Mode
      setStatus({ message: 'Activating Auto DJ with professional programming...', type: 'loading' });
      
      console.log('[AutoScheduler] Professional schedule complete. Enabling Auto DJ mode.');
      handleAutoDJToggle(true);
      
      // Give time for the system to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({ 
        message: 'Professional weekly schedule generated! Your station is now running with industry-standard clockwheel programming.', 
        type: 'success' 
      });

    } catch (error) {
      console.error("Auto-scheduling failed:", error);
      setStatus({ message: error.message || 'An unexpected error occurred.', type: 'error' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Wand2 className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Professional Auto Scheduler</h1>
            <p className="text-slate-400">Generate industry-standard clockwheel-based programming and activate automated broadcasting.</p>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Generate Professional Schedule & Start Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-slate-300">
              This professional scheduler creates <strong>clockwheel-based programming</strong> using industry standards. 
              Each hour follows a structured template with music, station IDs, commercials, and promos timed perfectly.
            </p>
            
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h3 className="text-blue-400 font-medium mb-2">🏢 Professional Features:</h3>
              <ul className="text-blue-300/80 text-sm space-y-1 text-left max-w-md mx-auto">
                <li>• <strong>6 Clockwheel Templates</strong> - Morning Drive, Midday, Evening, etc.</li>
                <li>• <strong>Smart Content Rotation</strong> - Music, Station IDs, Commercials</li>
                <li>• <strong>Genre & Energy Matching</strong> - Right music for the right time</li>
                <li>• <strong>Industry-Standard Timing</strong> - Professional broadcast flow</li>
                <li>• <strong>24/7 Automated Coverage</strong> - Never go silent</li>
                <li>• <strong>Instant AutoDJ Activation</strong> - Start broadcasting immediately</li>
              </ul>
            </div>

            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h3 className="text-green-400 font-medium mb-2">📋 Clockwheel Templates Created:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-300/80">
                {SHOW_TEMPLATES.map((template, index) => (
                  <div key={index} className="text-left">
                    <strong>{template.name}</strong> ({template.start}-{template.end})
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleGenerateSchedule}
              disabled={isLoading}
              className="w-full max-w-sm h-12 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-6 h-6 mr-2" />
              )}
              {isLoading ? 'Creating Professional Schedule...' : 'Generate Professional Schedule & Start AutoDJ'}
            </Button>
            
            {status.type !== 'idle' && (
              <div className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
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

            {status.type === 'success' && (
              <div className="space-y-3">
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Link to={createPageUrl('Dashboard')}>
                    Go to Live Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Link to={createPageUrl('Schedule')}>
                    View Generated Schedule
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Link to={createPageUrl('Clockwheels')}>
                    Manage Clockwheels
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}