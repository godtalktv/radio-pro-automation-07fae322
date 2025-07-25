import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayLog, Track } from '@/api/entities';
import { History, Search, Download, Music, Clock, Users, Play } from 'lucide-react';

export default function PlayHistory() {
  const [playLogs, setPlayLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalPlays: 0,
    totalListeners: 0,
    topTrack: null,
    totalDuration: 0
  });

  useEffect(() => {
    loadPlayHistory();
  }, [selectedDate]);

  useEffect(() => {
    filterLogs();
  }, [playLogs, searchTerm]);

  const loadPlayHistory = async () => {
    setIsLoading(true);
    try {
      // Get recent play logs
      const logs = await PlayLog.list('-play_start_time', 100);
      
      // Filter by selected date if needed
      const dateFilteredLogs = logs.filter(log => {
        if (!selectedDate) return true;
        return log.play_start_time?.startsWith(selectedDate);
      });
      
      setPlayLogs(dateFilteredLogs);
      
      // Calculate statistics
      const stats = {
        totalPlays: dateFilteredLogs.length,
        totalListeners: dateFilteredLogs.reduce((sum, log) => sum + (log.listener_count || 0), 0),
        totalDuration: dateFilteredLogs.reduce((sum, log) => sum + (log.actual_duration || 0), 0),
        topTrack: getMostPlayedTrack(dateFilteredLogs)
      };
      
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load play history:', error);
    }
    setIsLoading(false);
  };

  const filterLogs = () => {
    if (!searchTerm) {
      setFilteredLogs(playLogs);
      return;
    }

    const filtered = playLogs.filter(log => {
      const title = log.metadata_snapshot?.title?.toLowerCase() || '';
      const artist = log.metadata_snapshot?.artist?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return title.includes(search) || artist.includes(search);
    });

    setFilteredLogs(filtered);
  };

  const getMostPlayedTrack = (logs) => {
    const trackCounts = {};
    
    logs.forEach(log => {
      const key = `${log.metadata_snapshot?.title || 'Unknown'} - ${log.metadata_snapshot?.artist || 'Unknown'}`;
      trackCounts[key] = (trackCounts[key] || 0) + 1;
    });

    const mostPlayed = Object.entries(trackCounts).sort(([,a], [,b]) => b - a)[0];
    return mostPlayed ? { title: mostPlayed[0], count: mostPlayed[1] } : null;
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportPlaylist = () => {
    const csvContent = [
      ['Time', 'Title', 'Artist', 'Duration', 'Category', 'Listeners', 'Completion %'].join(','),
      ...filteredLogs.map(log => [
        formatTime(log.play_start_time),
        log.metadata_snapshot?.title || 'Unknown',
        log.metadata_snapshot?.artist || 'Unknown',
        formatDuration(log.actual_duration || 0),
        log.metadata_snapshot?.track_type || 'music',
        log.listener_count || 0,
        log.completion_percentage || 0
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `play-history-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400">Loading play history...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Play History
          </h2>
          <p className="text-slate-400">Track your broadcast history and performance</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white"
          />
          <Button onClick={exportPlaylist} variant="outline" className="bg-slate-800 border-slate-600">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{statistics.totalPlays}</p>
                <p className="text-xs text-slate-400">Total Plays</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{Math.round(statistics.totalListeners / Math.max(statistics.totalPlays, 1))}</p>
                <p className="text-xs text-slate-400">Avg Listeners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{formatDuration(statistics.totalDuration)}</p>
                <p className="text-xs text-slate-400">Total Airtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate">
                  {statistics.topTrack?.title || 'No Data'}
                </p>
                <p className="text-xs text-slate-400">Most Played</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tracks..."
          className="pl-10 bg-slate-800 border-slate-600 text-white"
        />
      </div>

      {/* Play History Table */}
      <Card className="flex-1 bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-0">
          <div className="overflow-auto h-full">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-slate-300">Time</th>
                  <th className="text-left p-3 text-slate-300">Title</th>
                  <th className="text-left p-3 text-slate-300">Artist</th>
                  <th className="text-left p-3 text-slate-300">Duration</th>
                  <th className="text-left p-3 text-slate-300">Category</th>
                  <th className="text-left p-3 text-slate-300">Listeners</th>
                  <th className="text-left p-3 text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="p-3 font-mono text-slate-300">
                      {formatTime(log.play_start_time)}
                    </td>
                    <td className="p-3 text-white font-medium">
                      {log.metadata_snapshot?.title || 'Unknown'}
                    </td>
                    <td className="p-3 text-slate-300">
                      {log.metadata_snapshot?.artist || 'Unknown'}
                    </td>
                    <td className="p-3 font-mono text-slate-400">
                      {formatDuration(log.actual_duration || 0)}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${
                        log.metadata_snapshot?.track_type === 'music'
                          ? 'bg-blue-500/20 text-blue-400'
                          : log.metadata_snapshot?.track_type === 'commercial'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {log.metadata_snapshot?.track_type || 'music'}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400">
                      {log.listener_count || 0}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${
                        log.completion_percentage >= 90
                          ? 'bg-green-500/20 text-green-400'
                          : log.completion_percentage >= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {log.completion_percentage || 0}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}