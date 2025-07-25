import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Playlist } from "@/api/entities";
import { Loader2, ListVideo, Clock } from 'lucide-react';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0h 0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default function AutoPlaylistsPanel() {
  const [autoPlaylists, setAutoPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAutoPlaylists();
  }, []);

  const fetchAutoPlaylists = async () => {
    setIsLoading(true);
    try {
      const fetchedPlaylists = await Playlist.filter({ is_auto_generated: true });
      setAutoPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error("Failed to fetch auto-generated playlists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full bg-slate-900/30 border-slate-700/60 flex flex-col">
      <CardHeader className="p-3 border-b border-slate-700/60">
        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
          <ListVideo className="w-5 h-5 text-purple-400" />
          Auto-Generated Rotations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading Rotations...
          </div>
        ) : autoPlaylists.length === 0 ? (
          <div className="text-center py-4 text-slate-500 px-2">
            <ListVideo className="w-10 h-10 mx-auto mb-2" />
            <p className="font-semibold">No Auto-Generated Playlists</p>
            <p className="text-xs mt-1">
              Use the Auto-Scheduler to generate programming and playlists automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {autoPlaylists.map(playlist => (
              <div key={playlist.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md border border-slate-700/50">
                <p className="text-sm font-medium text-slate-200 truncate">{playlist.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(playlist.total_duration)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}