
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayLog } from "@/api/entities"; // Fix: Revert to barrel import
import { Database, FileText, CheckCircle, AlertCircle, Download, Activity } from 'lucide-react';

export default function DCSStatusPanel() {
  const [captureStatus, setCaptureStatus] = useState({
    isActive: true,
    sessionsToday: 0,
    totalCaptured: 0,
    lastCapture: null,
    complianceRate: 0,
    recentLogs: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCaptureStats();
    const interval = setInterval(loadCaptureStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCaptureStats = async () => {
    try {
      // Get today's play logs
      const today = new Date().toISOString().split('T')[0];
      const recentLogs = await PlayLog.list('-play_start_time', 50);
      const todaysLogs = recentLogs.filter(log => 
        log.play_start_time?.startsWith(today)
      );

      // Calculate compliance rate
      const compliantLogs = recentLogs.filter(log => log.dmca_compliant);
      const complianceRate = recentLogs.length > 0 
        ? ((compliantLogs.length / recentLogs.length) * 100).toFixed(1)
        : 100;

      setCaptureStatus({
        isActive: true,
        sessionsToday: todaysLogs.length,
        totalCaptured: recentLogs.length,
        lastCapture: recentLogs[0]?.play_start_time || null,
        complianceRate: parseFloat(complianceRate),
        recentLogs: recentLogs.slice(0, 10)
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load DCS stats:', error);
      setIsLoading(false);
    }
  };

  const exportPlayLogs = async () => {
    try {
      const logs = await PlayLog.list('-play_start_time', 1000);
      const csvContent = generateCSVContent(logs);
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `radio_play_log_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to export play logs:', error);
    }
  };

  const generateCSVContent = (logs) => {
    const headers = [
      'Date/Time',
      'Title',
      'Artist',
      'Album',
      'Duration',
      'Play Type',
      'Completion %',
      'ISRC',
      'Label',
      'Genre',
      'Listener Count',
      'DMCA Compliant',
      'SoundExchange Eligible'
    ];

    const rows = logs.map(log => [
      log.play_start_time,
      log.metadata_snapshot?.title || '',
      log.metadata_snapshot?.artist || '',
      log.metadata_snapshot?.album || '',
      log.actual_duration || log.metadata_snapshot?.duration || '',
      log.play_type,
      log.completion_percentage?.toFixed(1) || '',
      log.metadata_snapshot?.isrc || '',
      log.metadata_snapshot?.label || '',
      log.metadata_snapshot?.genre || '',
      log.listener_count || '',
      log.dmca_compliant ? 'Yes' : 'No',
      log.sound_exchange_eligible ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-4">
          <div className="text-slate-400">Loading DCS status...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader className="p-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-blue-400" />
          DCS Metadata Capture
          <Badge className={`text-xs ${captureStatus.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {captureStatus.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* Capture Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 p-2 rounded text-center">
            <div className="text-lg font-bold text-white">{captureStatus.sessionsToday}</div>
            <div className="text-xs text-slate-400">Today</div>
          </div>
          <div className="bg-slate-900/50 p-2 rounded text-center">
            <div className="text-lg font-bold text-blue-400">{captureStatus.totalCaptured}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">DMCA Compliance</span>
            {captureStatus.complianceRate >= 95 ? 
              <CheckCircle className="w-4 h-4 text-green-400" /> :
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            }
          </div>
          <div className="text-lg font-bold text-white">{captureStatus.complianceRate}%</div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-slate-400">Recent Captures</span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto text-xs">
            {captureStatus.recentLogs.slice(0, 3).map((log, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300 truncate">
                  {log.metadata_snapshot?.title || 'Unknown'}
                </span>
                <span className="text-slate-400 font-mono">
                  {formatTime(log.play_start_time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Capture Info */}
        <div className="text-xs text-slate-400">
          Last: {formatTime(captureStatus.lastCapture)}
        </div>

        {/* Export Button */}
        <Button 
          onClick={exportPlayLogs}
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-3 h-3 mr-2" />
          Export Play Log
        </Button>

        {/* DCS Features */}
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>ISRC Tracking</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex items-center justify-between">
            <span>SoundExchange Ready</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex items-center justify-between">
            <span>BMI/ASCAP Compatible</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
          <div className="flex items-center justify-between">
            <span>DMCA Compliance</span>
            <CheckCircle className="w-3 h-3 text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
