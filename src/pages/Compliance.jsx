import React, { useState, useEffect } from "react";
import { PlayLog, ComplianceRule, Track } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Calendar,
  Music,
  TrendingUp,
  Clock
} from "lucide-react";

export default function Compliance() {
  const [playLogs, setPlayLogs] = useState([]);
  const [complianceRules, setComplianceRules] = useState([]);
  const [violations, setViolations] = useState([]);
  const [reportStats, setReportStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    try {
      const [logs, rules] = await Promise.all([
        PlayLog.list('-play_start_time', 100),
        ComplianceRule.list()
      ]);
      
      setPlayLogs(logs);
      setComplianceRules(rules);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = logs.filter(log => log.play_start_time?.startsWith(today));
      
      setReportStats({
        totalPlaysToday: todayLogs.length,
        musicPlaysToday: todayLogs.filter(log => log.metadata_snapshot?.track_type === 'music').length,
        complianceViolations: logs.filter(log => !log.dmca_compliant).length,
        pendingReports: logs.filter(log => log.royalty_status === 'pending').length
      });
      
    } catch (error) {
      console.error("Failed to load compliance data:", error);
    }
    setIsLoading(false);
  };

  const generateBMIReport = async () => {
    const musicLogs = playLogs.filter(log => 
      log.metadata_snapshot?.track_type === 'music' && 
      log.completion_percentage >= 25
    );
    
    const reportData = musicLogs.map(log => ({
      title: log.metadata_snapshot?.title || 'Unknown',
      artist: log.metadata_snapshot?.artist || 'Unknown',
      album: log.metadata_snapshot?.album || '',
      duration: log.actual_duration,
      playDate: new Date(log.play_start_time).toLocaleDateString(),
      playTime: new Date(log.play_start_time).toLocaleTimeString(),
      isrc: log.metadata_snapshot?.isrc || '',
      label: log.metadata_snapshot?.label || '',
      publisher: log.metadata_snapshot?.publisher || ''
    }));

    // Create CSV content
    const csvContent = [
      ['Title', 'Artist', 'Album', 'Duration', 'Play Date', 'Play Time', 'ISRC', 'Label', 'Publisher'].join(','),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BMI_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateSoundExchangeReport = async () => {
    const eligibleLogs = playLogs.filter(log => 
      log.sound_exchange_eligible && 
      log.metadata_snapshot?.track_type === 'music'
    );

    const reportData = eligibleLogs.map(log => ({
      title: log.metadata_snapshot?.title || 'Unknown',
      artist: log.metadata_snapshot?.artist || 'Unknown',
      album: log.metadata_snapshot?.album || '',
      isrc: log.metadata_snapshot?.isrc || 'N/A',
      playDateTime: new Date(log.play_start_time).toISOString(),
      listenerCount: log.listener_count || 0,
      completionPercentage: log.completion_percentage
    }));

    const csvContent = [
      ['Title', 'Artist', 'Album', 'ISRC', 'Play Date/Time', 'Listener Count', 'Completion %'].join(','),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SoundExchange_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Compliance & Reporting</h1>
            <p className="text-slate-400">DMCA compliance, performance rights, and industry reporting</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportStats.totalPlaysToday}</p>
                  <p className="text-sm text-slate-400">Total Plays Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportStats.musicPlaysToday}</p>
                  <p className="text-sm text-slate-400">Music Tracks Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportStats.pendingReports}</p>
                  <p className="text-sm text-slate-400">Pending Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{reportStats.complianceViolations}</p>
                  <p className="text-sm text-slate-400">Violations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="bg-slate-800/50 text-slate-300">
            <TabsTrigger value="logs">Play Logs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Recent Play Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {log.metadata_snapshot?.title || 'Unknown Track'}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {log.metadata_snapshot?.artist} • {formatTime(log.play_start_time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          log.dmca_compliant ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {log.dmca_compliant ? 'Compliant' : 'Violation'}
                        </Badge>
                        <Badge className={`${
                          log.royalty_status === 'reported' ? 'bg-blue-500/20 text-blue-400' : 
                          log.royalty_status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {log.royalty_status}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {log.completion_percentage}% played
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-400" />
                    Performance Rights Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">BMI Play Report</h4>
                      <p className="text-sm text-slate-400">
                        Detailed play log for BMI performance royalty reporting
                      </p>
                    </div>
                    <Button onClick={generateBMIReport} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Generate BMI Report
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <h4 className="font-medium text-white">SoundExchange Report</h4>
                      <p className="text-sm text-slate-400">
                        Digital performance royalty report for internet radio
                      </p>
                    </div>
                    <Button onClick={generateSoundExchangeReport} className="bg-purple-600 hover:bg-purple-700">
                      <Download className="w-4 h-4 mr-2" />
                      Generate SoundExchange Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Active Compliance Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{rule.rule_name}</h4>
                        <p className="text-sm text-slate-400">{rule.description}</p>
                        <p className="text-xs text-slate-500">{rule.legal_basis}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          rule.severity === 'block' ? 'bg-red-500/20 text-red-400' :
                          rule.severity === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {rule.severity}
                        </Badge>
                        <Badge className={`${
                          rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}