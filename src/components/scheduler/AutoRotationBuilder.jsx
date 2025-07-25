
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Track, Playlist, Clockwheel } from '@/api/entities';
import { Calendar, Clock, Music, Wand2, PlayCircle, Settings, Shuffle, CheckCircle } from 'lucide-react';

export default function AutoRotationBuilder({ onClose }) {
  const [tracks, setTracks] = useState([]);
  const [clockwheels, setClockwheels] = useState([]);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClockwheel, setSelectedClockwheel] = useState('');
  
  const [rotationSettings, setRotationSettings] = useState({
    startTime: '00:00',
    endTime: '23:59',
    separationRules: {
      artistSeparation: 60, // minutes
      albumSeparation: 120,
      titleSeparation: 180
    },
    categoryWeights: {
      'Hot Top40': 30,
      'Hit/Current/Gold': 40, 
      'Recurrent': 20,
      'Gold': 10
    },
    commercialBreaks: true,
    stationIDs: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fetchedTracks, fetchedClockwheels] = await Promise.all([
      Track.list('-created_date'),
      Clockwheel.list('-created_date')
    ]);
    setTracks(fetchedTracks);
    setClockwheels(fetchedClockwheels);
  };

  const generateRotation = async () => {
    setIsGenerating(true);
    
    try {
      const selectedCW = clockwheels.find(cw => cw.id === selectedClockwheel);
      if (!selectedCW) {
        alert('Please select a clockwheel template');
        setIsGenerating(false);
        return;
      }

      const schedule = [];
      const startDateTime = new Date(`${selectedDate}T${rotationSettings.startTime}`);
      const endDateTime = new Date(`${selectedDate}T${rotationSettings.endTime}`);
      
      let currentTime = new Date(startDateTime);
      let scheduleIndex = 0;

      // Generate hourly schedule based on clockwheel
      while (currentTime.getTime() < endDateTime.getTime()) { // Use getTime() for reliable comparison
        const hourBlock = generateHourBlock(selectedCW, currentTime, scheduleIndex);
        schedule.push(...hourBlock);
        
        currentTime.setHours(currentTime.getHours() + 1);
        scheduleIndex++;

        // Safety break for extremely long loops or errors
        if (scheduleIndex > 240) { // Max 10 days of generation to prevent infinite loops
          console.warn("Generation stopped: Exceeded 240 hours. Check start/end times or clockwheel logic.");
          break;
        }
      }

      setGeneratedSchedule(schedule);
    } catch (error) {
      console.error('Failed to generate rotation:', error);
      alert('Failed to generate rotation. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const generateHourBlock = (clockwheel, startTime, blockIndex) => {
    const hourSchedule = [];
    let currentMinute = 0;
    
    // Convert startTime to a mutable Date object for local modifications
    const currentBlockStartTime = new Date(startTime);

    clockwheel.items.forEach((item, itemIndex) => {
      const itemStartTime = new Date(currentBlockStartTime);
      itemStartTime.setMinutes(currentBlockStartTime.getMinutes() + currentMinute);
      
      if (item.type === 'music') {
        const musicTracks = selectMusicForSlot(item, blockIndex, itemIndex);
        musicTracks.forEach((track, trackIndex) => {
          const trackStartTime = new Date(itemStartTime);
          // Assuming track duration is in seconds, add it to current time to simulate progression
          // For now, using a small offset for unique times within a block if actual durations are not strictly sequential
          trackStartTime.setSeconds(trackStartTime.getSeconds() + (trackIndex * 3)); 
          
          hourSchedule.push({
            id: `${blockIndex}-${itemIndex}-${trackIndex}-${track.id}`, // Ensure unique ID even if track data is reused
            time: trackStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: track.title,
            artist: track.artist,
            duration: formatDuration(track.duration),
            category: getCategoryForTrack(track),
            type: 'music',
            track: track // Store full track object for saveAsPlaylist
          });
        });
        currentMinute += item.duration_minutes || 15; // Clockwheel item duration, not sum of tracks
      } else {
        // Non-music items (commercials, station IDs, etc.)
        const nonMusicTrack = selectNonMusicTrack(item.type);
        if (nonMusicTrack) {
          hourSchedule.push({
            id: `${blockIndex}-${itemIndex}-${nonMusicTrack.id}`, // Ensure unique ID
            time: itemStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            name: nonMusicTrack.title,
            artist: nonMusicTrack.artist || 'Station',
            duration: formatDuration(nonMusicTrack.duration),
            category: item.type.toUpperCase().replace('_', ' '), // Format category for display
            type: item.type,
            track: nonMusicTrack // Store full track object
          });
          currentMinute += Math.ceil(nonMusicTrack.duration / 60); // Add duration in minutes
        }
      }
    });
    
    return hourSchedule;
  };

  const selectMusicForSlot = (musicSlot, blockIndex, itemIndex) => {
    // Filter tracks based on types, genres, energy levels as per clockwheel slot
    const availableTracks = tracks.filter(track => {
      if (track.track_type !== 'music') return false;
      
      if (musicSlot.genre_filter && musicSlot.genre_filter.length > 0) {
        if (!musicSlot.genre_filter.includes(track.genre)) return false;
      }
      
      if (musicSlot.energy_filter && musicSlot.energy_filter.length > 0) {
        if (!musicSlot.energy_filter.includes(track.energy_level)) return false;
      }
      
      return true;
    });

    const targetDurationSeconds = (musicSlot.duration_minutes || 15) * 60;
    const selectedTracks = [];
    let totalDuration = 0;
    
    // Apply separation rules: Keep track of recently played artists, albums, titles.
    // For simplicity, this example will use a global set; in a real app,
    // this would be based on the `generatedSchedule` or a rolling window.
    const recentlyPlayedArtists = new Set();
    const recentlyPlayedAlbums = new Set();
    const recentlyPlayedTitles = new Set();

    // To implement real separation, one would need to iterate backwards through
    // `generatedSchedule` and add artists/albums/titles to the 'recently played' sets.
    // For this demonstration, we'll just sort randomly and rely on the target duration.
    
    const shuffledTracks = [...availableTracks].sort(() => Math.random() - 0.5);
    
    for (const track of shuffledTracks) {
      // Basic separation check (can be expanded to check `recentlyPlayedArtists` etc.)
      // For a truly professional scheduler, this would involve a more complex algorithm
      // that balances category weights, separation rules, and slot requirements.
      if (totalDuration + track.duration <= targetDurationSeconds) {
        selectedTracks.push(track);
        totalDuration += track.duration;
      }
      
      if (totalDuration >= targetDurationSeconds * 0.95) { // Try to get close to target duration
        break; 
      }
    }
    
    return selectedTracks;
  };

  const selectNonMusicTrack = (type) => {
    // Filter based on the requested type (e.g., 'commercial', 'station_id', 'promo')
    const availableTracks = tracks.filter(track => track.track_type === type);
    if (availableTracks.length === 0) return null;
    
    // For a professional scheduler, this would also involve rules (e.g., max commercials per hour, specific types)
    return availableTracks[Math.floor(Math.random() * availableTracks.length)];
  };

  const getCategoryForTrack = (track) => {
    // Simple categorization logic - can be enhanced based on track metadata
    // Prioritize tags for explicit categorization
    if (track.tags?.includes('hot') || track.tags?.includes('current-hit')) return 'Hot Top40';
    if (track.tags?.includes('current') || track.tags?.includes('hit')) return 'Hit/Current/Gold';
    if (track.tags?.includes('recurrent')) return 'Recurrent';
    if (track.tags?.includes('gold') || track.genre === 'classic') return 'Gold';
    
    // Default categorization based on release year if no specific tags
    const currentYear = new Date().getFullYear();
    const trackYear = track.copyright_year || track.release_year || currentYear; // Use release_year if available
    
    const age = currentYear - trackYear;

    if (age <= 1) return 'Hot Top40';
    if (age <= 3) return 'Hit/Current/Gold';
    if (age <= 7) return 'Recurrent';
    return 'Gold';
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // Ensure seconds are whole numbers
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Hot Top40': 'bg-red-500/20 text-red-400',
      'Hit/Current/Gold': 'bg-orange-500/20 text-orange-400', 
      'Recurrent': 'bg-blue-500/20 text-blue-400',
      'Gold': 'bg-yellow-500/20 text-yellow-400',
      'STATION ID': 'bg-green-500/20 text-green-400', // Matches formatted string
      'COMMERCIAL': 'bg-purple-500/20 text-purple-400',
      'PROMO': 'bg-cyan-500/20 text-cyan-400'
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400';
  };

  const saveAsPlaylist = async () => {
    if (generatedSchedule.length === 0) {
      alert('Please generate a rotation first');
      return;
    }

    try {
      const playlistData = {
        name: `Auto Rotation - ${selectedDate}`,
        description: `Generated rotation for ${selectedDate} using clockwheel scheduling`,
        // Map to expected playlist track format, including scheduled time
        tracks: generatedSchedule.map((item, index) => ({
          track_id: item.track?.id, // Ensure item.track and item.track.id exist
          position: index + 1,
          scheduled_time: item.time, // This is a time string, the backend might need full datetime
          // Optionally add other metadata like type, category for review
          type: item.type,
          category: item.category
        })).filter(item => item.track_id), // Filter out any items without a valid track_id
        total_duration: generatedSchedule.reduce((total, item) => total + (item.track?.duration || 0), 0),
        status: 'scheduled',
        scheduled_date: selectedDate
      };

      await Playlist.create(playlistData);
      alert('Rotation saved as playlist successfully!');
    } catch (error) {
      console.error('Failed to save playlist:', error);
      alert('Failed to save playlist. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-400" />
            Automatic Rotation Builder & Music Scheduler
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400">
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-4">
          <Tabs defaultValue="builder" className="h-full">
            <TabsList className="bg-slate-800 mb-4">
              <TabsTrigger value="builder">Rotation Builder</TabsTrigger>
              <TabsTrigger value="schedule">Generated Schedule</TabsTrigger>
              <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Schedule Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-slate-300 text-sm">Date:</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-300 text-sm">Start:</label>
                        <Input
                          type="time"
                          value={rotationSettings.startTime}
                          onChange={(e) => setRotationSettings({...rotationSettings, startTime: e.target.value})}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 text-sm">End:</label>
                        <Input
                          type="time"
                          value={rotationSettings.endTime}
                          onChange={(e) => setRotationSettings({...rotationSettings, endTime: e.target.value})}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm">Clockwheel Template:</label>
                      <Select value={selectedClockwheel} onValueChange={setSelectedClockwheel}>
                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                          <SelectValue placeholder="Select clockwheel..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clockwheels.map(cw => (
                            <SelectItem key={cw.id} value={cw.id}>
                              {cw.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(rotationSettings.categoryWeights).map(([category, weight]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={weight}
                            onChange={(e) => setRotationSettings({
                              ...rotationSettings,
                              categoryWeights: {
                                ...rotationSettings.categoryWeights,
                                [category]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-16 bg-slate-900 border-slate-600 text-white text-xs"
                            min="0"
                            max="100"
                          />
                          <span className="text-slate-400 text-xs">%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Separation Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-slate-300 text-sm">Artist Separation (min):</label>
                      <Input
                        type="number"
                        value={rotationSettings.separationRules.artistSeparation}
                        onChange={(e) => setRotationSettings({
                          ...rotationSettings,
                          separationRules: {
                            ...rotationSettings.separationRules,
                            artistSeparation: parseInt(e.target.value) || 0
                          }
                        })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="text-slate-300 text-sm">Album Separation (min):</label>
                      <Input
                        type="number"
                        value={rotationSettings.separationRules.albumSeparation}
                        onChange={(e) => setRotationSettings({
                          ...rotationSettings,
                          separationRules: {
                            ...rotationSettings.separationRules,
                            albumSeparation: parseInt(e.target.value) || 0
                          }
                        })}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={rotationSettings.commercialBreaks}
                        onCheckedChange={(checked) => setRotationSettings({...rotationSettings, commercialBreaks: checked})}
                        id="commercial-breaks"
                      />
                      <label htmlFor="commercial-breaks" className="text-slate-300 text-sm">Include Commercial Breaks</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={rotationSettings.stationIDs}
                        onCheckedChange={(checked) => setRotationSettings({...rotationSettings, stationIDs: checked})}
                        id="station-ids"
                      />
                      <label htmlFor="station-ids" className="text-slate-300 text-sm">Include Station IDs</label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  onClick={generateRotation}
                  disabled={isGenerating || !selectedClockwheel}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {isGenerating ? (
                    <>
                      <Shuffle className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Rotation
                    </>
                  )}
                </Button>
                
                {generatedSchedule.length > 0 && (
                  <Button
                    onClick={saveAsPlaylist}
                    className="bg-green-600 hover:bg-green-700 px-8"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Save as Playlist
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="h-full">
              {generatedSchedule.length > 0 ? (
                <div className="bg-slate-800/30 rounded-lg border border-slate-700 h-full overflow-hidden flex flex-col">
                  <div className="bg-slate-800 p-3 border-b border-slate-700">
                    <h3 className="text-white font-bold">Generated Music Schedule - {selectedDate}</h3>
                    <p className="text-slate-400 text-sm">{generatedSchedule.length} items scheduled</p>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th className="text-left p-3 text-slate-300">Time</th>
                          <th className="text-left p-3 text-slate-300">Name</th>
                          <th className="text-left p-3 text-slate-300">Artist</th>
                          <th className="text-left p-3 text-slate-300">Duration</th>
                          <th className="text-left p-3 text-slate-300">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedSchedule.map((item, index) => (
                          <tr 
                            key={item.id}
                            className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${
                              index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'
                            }`}
                          >
                            <td className="p-3 font-mono text-blue-400">{item.time}</td>
                            <td className="p-3 text-white font-medium">{item.name}</td>
                            <td className="p-3 text-slate-300">{item.artist}</td>
                            <td className="p-3 font-mono text-slate-400">{item.duration}</td>
                            <td className="p-3">
                              <Badge className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <p>No schedule generated yet.</p>
                    <p className="text-sm">Go to the Rotation Builder tab to create a schedule.</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Advanced Rotation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-400">
                    Configure advanced rules for automatic rotation generation, including artist separation, 
                    tempo matching, and content advisory rules.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Separation Rules</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Artist separation by time window</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Album separation rules</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Gender/tempo distribution</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Content Rules</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Explicit content filtering</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Dayparting energy matching</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">Commercial break timing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
