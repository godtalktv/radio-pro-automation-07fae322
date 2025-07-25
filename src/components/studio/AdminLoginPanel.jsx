
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Key,
  Settings,
  Database,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
  Wifi,
  HardDrive,
  Music, // Added Music icon
  RotateCcw // Added RotateCcw icon for refresh functionality
} from 'lucide-react';

export default function AdminLoginPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Auto-login for demo
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'radiopro2024'
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null); // New state for quick actions

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    // Simulate admin login (in production, this would be a secure API call)
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'radiopro2024') {
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError('Invalid admin credentials. Use admin/radiopro2024 for demo.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
  };

  // Quick action handlers
  const handleDatabaseBackup = () => {
    setActiveQuickAction('database_backup');
  };

  const handleSystemHealthCheck = () => {
    setActiveQuickAction('system_health');
  };

  const handleConfiguration = () => {
    setActiveQuickAction('configuration');
  };

  const closeQuickAction = () => {
    setActiveQuickAction(null);
  };

  // Quick Action Components
  const DatabaseBackupPanel = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Database Backup & Management
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={closeQuickAction}>✕</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Backup Options</Label>
            <div className="space-y-2">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Database className="w-4 h-4 mr-2" />
                Full System Backup
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Music className="w-4 h-4 mr-2" />
                Music Library Only
              </Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings & Configuration
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Recent Backups</Label>
            <div className="bg-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Full Backup</span>
                <span className="text-slate-400">2024-01-15 08:30</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Music Library</span>
                <span className="text-slate-400">2024-01-14 22:15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Settings</span>
                <span className="text-slate-400">2024-01-14 15:45</span>
              </div>
            </div>
          </div>
        </div>
        <Alert className="bg-blue-900/50 border-blue-600/50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            Automatic backups are scheduled daily at 3:00 AM. Manual backups are recommended before major system changes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const SystemHealthPanel = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          System Health Check
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={closeQuickAction}>✕</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Audio System</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Web Audio API</span>
                <Badge className="bg-green-500">✓ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Audio Context</span>
                <Badge className="bg-green-500">✓ Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Compressor Engine</span>
                <Badge className="bg-green-500">✓ Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Crossfader</span>
                <Badge className="bg-green-500">✓ Ready</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Broadcasting</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">AutoDJ Engine</span>
                <Badge className="bg-green-500">✓ Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Scheduler</span>
                <Badge className="bg-green-500">✓ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Stream Encoder</span>
                <Badge className="bg-yellow-500">⚠ Standby</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Metadata System</span>
                <Badge className="bg-green-500">✓ Capturing</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-white font-semibold">Performance Metrics</h3>
          <div className="bg-slate-700 rounded-lg p-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.8%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">12ms</div>
              <div className="text-xs text-slate-400">Audio Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">2.1GB</div>
              <div className="text-xs text-slate-400">Memory Usage</div>
            </div>
          </div>
        </div>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <Activity className="w-4 h-4 mr-2" />
          Run Complete System Diagnostic
        </Button>
      </CardContent>
    </Card>
  );

  const ConfigurationPanel = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          System Configuration
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={closeQuickAction}>✕</Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="audio" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="master-audio-buffer-size" className="text-slate-300">Master Audio Buffer Size</Label>
                <select id="master-audio-buffer-size" className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md p-2">
                  <option value="256">256 samples (5.8ms latency)</option>
                  <option value="512" selected>512 samples (11.6ms latency) - Recommended</option>
                  <option value="1024">1024 samples (23.2ms latency)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="sample-rate" className="text-slate-300">Sample Rate</Label>
                <select id="sample-rate" className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md p-2">
                  <option value="44100" selected>44.1 kHz - CD Quality</option>
                  <option value="48000">48 kHz - Professional</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-gain" defaultChecked className="rounded" />
                <Label htmlFor="auto-gain" className="text-slate-300">Auto Gain Control</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="streaming" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="encoder-quality" className="text-slate-300">Default Encoder Quality</Label>
                <select id="encoder-quality" className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md p-2">
                  <option value="128">128 kbps MP3</option>
                  <option value="192" selected>192 kbps MP3 - Recommended</option>
                  <option value="320">320 kbps MP3</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-reconnect" defaultChecked className="rounded" />
                <Label htmlFor="auto-reconnect" className="text-slate-300">Auto-Reconnect on Disconnect</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="smart-scheduling" defaultChecked className="rounded" />
                <Label htmlFor="smart-scheduling" className="text-slate-300">Smart Scheduling (AI-Assisted)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="crossfade" defaultChecked className="rounded" />
                <Label htmlFor="crossfade" className="text-slate-300">Automatic Crossfading</Label>
              </div>
              <div>
                <Label htmlFor="crossfade-duration" className="text-slate-300">Default Crossfade Duration</Label>
                <select id="crossfade-duration" className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md p-2">
                  <option value="2">2 seconds</option>
                  <option value="3" selected>3 seconds</option>
                  <option value="5">5 seconds</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Alert className="bg-red-900/50 border-red-600/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                Advanced settings should only be modified by experienced administrators. Incorrect settings may affect system stability.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="debug-mode" className="rounded" />
                <Label htmlFor="debug-mode" className="text-slate-300">Debug Mode (Verbose Logging)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="performance-monitor" defaultChecked className="rounded" />
                <Label htmlFor="performance-monitor" className="text-slate-300">Performance Monitoring</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={closeQuickAction}>Cancel</Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Apply Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!isLoggedIn) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Admin Access
            </CardTitle>
            <p className="text-slate-400">
              Enter administrator credentials
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {loginError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Key className="w-4 h-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Admin Login
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              <p>Demo Credentials:</p>
              <p className="font-mono">admin / radiopro2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render quick action panels when active
  if (activeQuickAction === 'database_backup') {
    return <div className="h-full bg-slate-900 p-4 overflow-y-auto"><DatabaseBackupPanel /></div>;
  }
  if (activeQuickAction === 'system_health') {
    return <div className="h-full bg-slate-900 p-4 overflow-y-auto"><SystemHealthPanel /></div>;
  }
  if (activeQuickAction === 'configuration') {
    return <div className="h-full bg-slate-900 p-4 overflow-y-auto"><ConfigurationPanel /></div>;
  }

  return (
    <div className="h-full bg-slate-900 p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Administrator Panel</h1>
              <p className="text-slate-400">RadioPro Studio - System Administration</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-red-400 border-red-600 hover:bg-red-600/20"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">ONLINE</div>
                  <div className="text-sm text-slate-400">System Status</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1</div>
                  <div className="text-sm text-slate-400">Active Users</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">99.8%</div>
                  <div className="text-sm text-slate-400">Uptime</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-4 text-center">
                  <Server className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">2.1GB</div>
                  <div className="text-sm text-slate-400">Memory Usage</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions with Refresh */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleDatabaseBackup}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSystemHealthCheck}
                >
                  <Server className="w-4 h-4 mr-2" />
                  System Health Check
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleConfiguration}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => window.location.reload()}
                  title="Refresh the entire studio application"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh Studio
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400">
                  <p>User management features will be implemented here.</p>
                  <p className="mt-2">Current user: Administrator (admin@radiopro.com)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Version</Label>
                    <p className="text-white font-mono">RadioPro Studio v2.0.1</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Build Date</Label>
                    <p className="text-white font-mono">2024-01-15</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Uptime</Label>
                    <p className="text-white font-mono">2d 14h 32m</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Audio Engine</Label>
                    <p className="text-white font-mono">Web Audio API v1.1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Tab */}
          <TabsContent value="license">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">License Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-semibold">Professional License Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">License Type</Label>
                    <p className="text-white">Professional</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Expires</Label>
                    <p className="text-white">Never (Perpetual)</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Max Users</Label>
                    <p className="text-white">Unlimited</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Support</Label>
                    <p className="text-white">Premium</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Global Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400">
                  <p>Global system settings and configuration options will be available here.</p>
                  <p className="mt-2">This includes audio processing, streaming, and automation settings.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
