import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayLog } from "@/api/entities";
import { TrendingUp, TrendingDown, Users, Clock, BarChart3, Zap } from 'lucide-react';

export default function AudiencePleaserPanel() {
  const [stats, setStats] = useState({
    currentListeners: 0,
    tuneInRate: 0,
    tuneOutRate: 0,
    avgListenTime: 0,
    trackPerformance: [],
    hourlyTrends: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudienceStats();
    const interval = setInterval(loadAudienceStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAudienceStats = async () => {
    try {
      // Get recent play logs for analysis
      const recentPlays = await PlayLog.list('-play_start_time', 100);
      
      // Calculate tune-in/out statistics
      const tuneInEvents = recentPlays.filter(p => p.play_type === 'scheduled' && p.completion_percentage > 80);
      const tuneOutEvents = recentPlays.filter(p => p.completion_percentage < 30);
      
      // Simulate real-time listener data (in production, this would come from streaming server)
      const currentListeners = Math.floor(Math.random() * 200) + 50;
      const tuneInRate = ((tuneInEvents.length / recentPlays.length) * 100).toFixed(1);
      const tuneOutRate = ((tuneOutEvents.length / recentPlays.length) * 100).toFixed(1);
      
      // Calculate average listen time
      const avgCompletion = recentPlays.reduce((sum, p) => sum + p.completion_percentage, 0) / recentPlays.length;
      const avgListenTime = (avgCompletion * 3.5).toFixed(1); // Assuming 3.5 min avg song length
      
      setStats({
        currentListeners,
        tuneInRate: parseFloat(tuneInRate),
        tuneOutRate: parseFloat(tuneOutRate),
        avgListenTime: parseFloat(avgListenTime),
        trackPerformance: recentPlays.slice(0, 10),
        hourlyTrends: generateHourlyTrends()
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load audience stats:', error);
      setIsLoading(false);
    }
  };

  const generateHourlyTrends = () => {
    // Generate sample hourly data for the last 24 hours
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      listeners: Math.floor(Math.random() * 150) + 25,
      tuneIns: Math.floor(Math.random() * 20) + 5,
      tuneOuts: Math.floor(Math.random() * 15) + 2
    }));
  };

  const formatTime = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Audience Pleaser™ (2012)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400">Loading audience analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Audience Pleaser™ (2012)
          <Badge className="bg-blue-500/20 text-blue-300">INDUSTRY FIRST</Badge>
        </CardTitle>
        <p className="text-xs text-slate-400">Real-time tune-in/tune-out statistics</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Current Listeners</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.currentListeners}</div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Avg Listen Time</span>
            </div>
            <div className="text-2xl font-bold text-white">{formatTime(stats.avgListenTime)}</div>
          </div>
        </div>

        {/* Tune In/Out Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Tune-In Rate</span>
            </div>
            <div className="text-xl font-bold text-green-400">{stats.tuneInRate}%</div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm text-slate-400">Tune-Out Rate</span>
            </div>
            <div className="text-xl font-bold text-red-400">{stats.tuneOutRate}%</div>
          </div>
        </div>

        {/* Recent Track Performance */}
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <h4 className="text-white font-medium mb-2">Recent Track Performance</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {stats.trackPerformance.slice(0, 5).map((track, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate">Track {index + 1}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${track.completion_percentage > 70 ? 'text-green-400' : track.completion_percentage > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {track.completion_percentage.toFixed(0)}%
                  </span>
                  {track.completion_percentage > 70 ? 
                    <TrendingUp className="w-3 h-3 text-green-400" /> : 
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={loadAudienceStats} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh Analytics
        </Button>
      </CardContent>
    </Card>
  );
}