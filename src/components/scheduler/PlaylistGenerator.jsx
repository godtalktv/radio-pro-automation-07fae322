import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Track, Show, Clockwheel, Playlist } from '@/api/entities';
import { Loader2, X, Wand2, CheckCircle, ListMusic } from 'lucide-react';

const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function PlaylistGenerator({ onClose }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [daysToGenerate, setDaysToGenerate] = useState(30);
    const [log, setLog] = useState([]);
    const [data, setData] = useState(null);
    const { toast } = useToast();

    const addToLog = (message) => setLog(prev => [...prev.slice(-10), message]);

    const fetchData = useCallback(async () => {
        addToLog("Fetching necessary data...");
        try {
            const [tracks, shows, clockwheels] = await Promise.all([
                Track.list('-created_date', 5000),
                Show.list(),
                Clockwheel.list(),
            ]);
            setData({ tracks, shows, clockwheels });
            addToLog("Data fetched successfully.");
        } catch (error) {
            console.error("Data fetching error:", error);
            addToLog("Error: Could not fetch station data.");
            toast({ variant: "destructive", title: "Error", description: "Could not fetch station data." });
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async () => {
        if (!data) {
            toast({ variant: "destructive", title: "Error", description: "Data not loaded yet. Please wait." });
            return;
        }

        setIsGenerating(true);
        setLog([]);
        addToLog(`Starting generation for ${daysToGenerate} days...`);

        try {
            // 1. Clear previously auto-generated playlists
            addToLog("Clearing old auto-generated playlists...");
            const oldPlaylists = await Playlist.filter({ is_auto_generated: true });
            for (const p of oldPlaylists) {
                await Playlist.delete(p.id);
            }
            addToLog(`Cleared ${oldPlaylists.length} old playlists.`);
            
            const { tracks, shows, clockwheels } = data;
            const musicTracks = tracks.filter(t => t.track_type === 'music');
            let recentlyPlayed = []; // Array of track IDs to track for separation

            for (let i = 0; i < daysToGenerate; i++) {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + i);
                const dayOfWeek = DAYS_OF_WEEK[currentDate.getDay()];

                addToLog(`Generating for: ${currentDate.toLocaleDateString()}`);
                
                let dailyTracks = [];

                for (let hour = 0; hour < 24; hour++) {
                    const show = shows.find(s => s.day_of_week === dayOfWeek && parseInt(s.start_time.split(':')[0]) === hour);
                    if (!show || !show.clockwheel_id) continue;

                    const clockwheel = clockwheels.find(c => c.id === show.clockwheel_id);
                    if (!clockwheel || !clockwheel.items) continue;
                    
                    let hourlyDuration = 0;

                    for (const item of clockwheel.items) {
                         const availableTracks = tracks.filter(t => 
                            (t.category === item.type || (item.type === 'Music' && t.track_type === 'music')) &&
                            !recentlyPlayed.slice(-20).includes(t.id) // Basic track separation
                         );
                        
                        if (availableTracks.length > 0) {
                            const track = availableTracks[Math.floor(Math.random() * availableTracks.length)];
                            dailyTracks.push({ track_id: track.id, position: dailyTracks.length });
                            recentlyPlayed.push(track.id);
                            hourlyDuration += track.duration || 180;
                        }

                        // Stop adding if we exceed an hour for this block
                        if (hourlyDuration >= 3600) break;
                    }
                }
                
                // Create the playlist for the day
                if(dailyTracks.length > 0) {
                     await Playlist.create({
                        name: `Auto-Generated - ${currentDate.toLocaleDateString()}`,
                        tracks: dailyTracks,
                        scheduled_date: currentDate.toISOString().split('T')[0],
                        is_auto_generated: true,
                        status: 'scheduled'
                    });
                }
            }
            
            addToLog("Playlist generation complete!");
            toast({ title: "Success", description: `${daysToGenerate} days of playlists have been generated.` });

        } catch (error) {
            console.error("Generation failed:", error);
            addToLog(`Error: ${error.message}`);
            toast({ variant: "destructive", title: "Generation Failed", description: "An error occurred during playlist generation." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 text-white">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-blue-400" />
                            Generate Daily Playlists
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} disabled={isGenerating}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-400">
                        This tool will automatically generate playlists for each day based on your Rotation Schedule. It uses your clockwheels to intelligently select tracks.
                    </p>
                    <div>
                        <Label htmlFor="days-to-generate">Days to Generate</Label>
                        <Input 
                            id="days-to-generate"
                            type="number"
                            value={daysToGenerate}
                            onChange={(e) => setDaysToGenerate(parseInt(e.target.value))}
                            className="bg-slate-800 border-slate-600"
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg h-40 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
                        {log.map((entry, i) => <div key={i}>{entry}</div>)}
                        {isGenerating && <Loader2 className="w-4 h-4 animate-spin inline-block" />}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerate} disabled={isGenerating || !data} className="w-full bg-green-600 hover:bg-green-700">
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Generating...' : 'Start Generation'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}