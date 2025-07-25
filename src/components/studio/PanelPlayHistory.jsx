import React, { useState, useEffect } from 'react';
import { PlayLog } from '@/api/entities';
import { Loader2, History } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function PanelPlayHistory() {
  const [playLogs, setPlayLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayHistory();
    const interval = setInterval(loadPlayHistory, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPlayHistory = async () => {
    try {
      const logs = await PlayLog.list('-play_start_time', 50); // Get last 50 plays
      setPlayLogs(logs);
    } catch (error) {
      console.error('Failed to load play history for panel:', error);
    }
    setIsLoading(false);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading History...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
        <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Artist</th>
                    <th className="p-2">Type</th>
                </tr>
            </thead>
            <tbody>
                {playLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                        <td className="p-2 font-mono text-slate-400">
                            {formatTime(log.play_start_time)}
                        </td>
                        <td className="p-2 text-white font-medium">
                            {log.metadata_snapshot?.title || 'Unknown'}
                        </td>
                        <td className="p-2 text-slate-300">
                            {log.metadata_snapshot?.artist || 'Unknown'}
                        </td>
                        <td className="p-2">
                           <Badge className={`text-xs ${
                                log.metadata_snapshot?.track_type === 'music' ? 'bg-blue-500/20 text-blue-400'
                                : log.metadata_snapshot?.track_type === 'commercial' ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                                {log.metadata_snapshot?.track_type || 'N/A'}
                            </Badge>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}