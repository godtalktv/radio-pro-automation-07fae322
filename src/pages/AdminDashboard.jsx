import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Radio, 
  Music, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Shield, 
  Settings,
  Database,
  Clock,
  PlayCircle,
  Headphones,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  UserPlus,
  Building
} from 'lucide-react';
import { User, Track, Show, Playlist, Organization, License, PlayLog } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTracks: 0,
    totalShows: 0,
    totalPlaylists: 0,
    totalOrganizations: 0,
    activeLicenses: 0,
    playsToday: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [recentPlays, setRecentPlays] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [licenses, setLicenses] = useState([]);
  
  // Edit states
  const [editingUser, setEditingUser] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);
  const [editingLicense, setEditingLicense] = useState(null);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [showNewLicenseForm, setShowNewLicenseForm] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (user?.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You need admin privileges to access this dashboard."
        });
        return;
      }
      setCurrentUser(user);
      await loadDashboardData();
    } catch (error) {
      console.error('Admin access check failed:', error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to access the admin dashboard."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load basic statistics
      const [users, tracks, shows, playlists, orgs, licensesData] = await Promise.all([
        User.list(),
        Track.list('-created_date', 100),
        Show.list(),
        Playlist.list(),
        Organization.list(),
        License.list()
      ]);

      // Try to load play logs (may not exist yet)
      let playLogs = [];
      try {
        playLogs = await PlayLog.list('-play_start_time', 50);
      } catch (e) {
        console.log('PlayLog entity not available yet');
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const playsToday = playLogs.filter(log => 
        log.play_start_time?.startsWith(today)
      ).length;

      setStats({
        totalUsers: users.length,
        totalTracks: tracks.length,
        totalShows: shows.length,
        totalPlaylists: playlists.length,
        totalOrganizations: orgs.length,
        activeLicenses: licensesData.filter(l => l.status === 'active').length,
        playsToday
      });

      setRecentUsers(users.slice(0, 10));
      setRecentTracks(tracks.slice(0, 10));
      setRecentPlays(playLogs.slice(0, 10));
      setOrganizations(orgs);
      setLicenses(licensesData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Data Load Error",
        description: "Failed to load some dashboard data."
      });
    }
  };

  // User Management Functions
  const handleEditUser = async (userData) => {
    try {
      await User.update(userData.id, userData);
      await loadDashboardData();
      setEditingUser(null);
      toast({ title: "Success", description: "User updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update user." });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await User.delete(userId);
      await loadDashboardData();
      toast({ title: "Success", description: "User deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await User.create(userData);
      await loadDashboardData();
      setShowNewUserForm(false);
      toast({ title: "Success", description: "User created successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create user." });
    }
  };

  // Organization Management Functions
  const handleEditOrganization = async (orgData) => {
    try {
      await Organization.update(orgData.id, orgData);
      await loadDashboardData();
      setEditingOrg(null);
      toast({ title: "Success", description: "Organization updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update organization." });
    }
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!window.confirm("Are you sure you want to delete this organization? This will affect all associated users.")) return;
    
    try {
      await Organization.delete(orgId);
      await loadDashboardData();
      toast({ title: "Success", description: "Organization deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete organization." });
    }
  };

  const handleCreateOrganization = async (orgData) => {
    try {
      await Organization.create(orgData);
      await loadDashboardData();
      setShowNewOrgForm(false);
      toast({ title: "Success", description: "Organization created successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create organization." });
    }
  };

  // License Management Functions
  const handleEditLicense = async (licenseData) => {
    try {
      await License.update(licenseData.id, licenseData);
      await loadDashboardData();
      setEditingLicense(null);
      toast({ title: "Success", description: "License updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update license." });
    }
  };

  const handleDeleteLicense = async (licenseId) => {
    if (!window.confirm("Are you sure you want to delete this license?")) return;
    
    try {
      await License.delete(licenseId);
      await loadDashboardData();
      toast({ title: "Success", description: "License deleted successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete license." });
    }
  };

  const handleCreateLicense = async (licenseData) => {
    try {
      await License.create({
        ...licenseData,
        issued_date: new Date().toISOString(),
        status: 'active'
      });
      await loadDashboardData();
      setShowNewLicenseForm(false);
      toast({ title: "Success", description: "License created successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create license." });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">
              You need administrator privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              System administration and user management
            </p>
          </div>
          <Badge className="bg-green-600 text-white">
            Logged in as: {currentUser.full_name || currentUser.email}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Organizations</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
                </div>
                <Building className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Licenses</p>
                  <p className="text-2xl font-bold text-white">{stats.activeLicenses}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Tracks</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
                </div>
                <Music className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="organizations" className="data-[state=active]:bg-green-600">
              <Building className="w-4 h-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="licenses" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              Licenses
            </TabsTrigrer>
            <TabsTrigger value="system" className="data-[state=active]:bg-orange-600">
              <Database className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">User Management</CardTitle>
                  <Button 
                    onClick={() => setShowNewUserForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400">Name</th>
                        <th className="text-left p-2 text-slate-400">Email</th>
                        <th className="text-left p-2 text-slate-400">Role</th>
                        <th className="text-left p-2 text-slate-400">Organization</th>
                        <th className="text-left p-2 text-slate-400">Created</th>
                        <th className="text-left p-2 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50">
                          <td className="p-2 text-white">{user.full_name || 'N/A'}</td>
                          <td className="p-2 text-slate-300">{user.email}</td>
                          <td className="p-2">
                            <Badge className={user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'}>
                              {user.role || 'user'}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-300">{user.organization_id || 'None'}</td>
                          <td className="p-2 text-slate-400">{formatDate(user.created_date)}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingUser(user)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Organization Management</CardTitle>
                  <Button 
                    onClick={() => setShowNewOrgForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400">Name</th>
                        <th className="text-left p-2 text-slate-400">Owner Email</th>
                        <th className="text-left p-2 text-slate-400">Status</th>
                        <th className="text-left p-2 text-slate-400">Created</th>
                        <th className="text-left p-2 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((org) => (
                        <tr key={org.id} className="border-b border-slate-700/50">
                          <td className="p-2 text-white">{org.name}</td>
                          <td className="p-2 text-slate-300">{org.owner_email}</td>
                          <td className="p-2">
                            <Badge className={
                              org.subscription_status === 'active' ? 'bg-green-600' : 
                              org.subscription_status === 'trial' ? 'bg-yellow-600' : 'bg-red-600'
                            }>
                              {org.subscription_status}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-400">{formatDate(org.created_date)}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingOrg(org)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteOrganization(org.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">License Management</CardTitle>
                  <Button 
                    onClick={() => setShowNewLicenseForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create License
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-slate-400">Customer</th>
                        <th className="text-left p-2 text-slate-400">License Type</th>
                        <th className="text-left p-2 text-slate-400">Status</th>
                        <th className="text-left p-2 text-slate-400">Expiry</th>
                        <th className="text-left p-2 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.map((license) => (
                        <tr key={license.id} className="border-b border-slate-700/50">
                          <td className="p-2 text-white">{license.customer_name}</td>
                          <td className="p-2 text-slate-300">{license.license_type}</td>
                          <td className="p-2">
                            <Badge className={
                              license.status === 'active' ? 'bg-green-600' : 
                              license.status === 'expired' ? 'bg-red-600' : 'bg-yellow-600'
                            }>
                              {license.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-400">
                            {license.expiry_date ? formatDate(license.expiry_date) : 'Never'}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEditingLicense(license)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteLicense(license.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Shows:</span>
                    <span className="text-white">{stats.totalShows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Playlists:</span>
                    <span className="text-white">{stats.totalPlaylists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plays Today:</span>
                    <span className="text-white">{stats.playsToday}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentPlays.slice(0, 5).map((play, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                        <div>
                          <p className="text-white text-sm">{play.metadata_snapshot?.title || 'Unknown Track'}</p>
                          <p className="text-slate-400 text-xs">{play.metadata_snapshot?.artist || 'Unknown Artist'}</p>
                        </div>
                        <div className="text-slate-400 text-xs">
                          {formatTime(play.play_start_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        {editingUser && (
          <UserEditModal 
            user={editingUser} 
            onSave={handleEditUser}
            onClose={() => setEditingUser(null)}
            organizations={organizations}
          />
        )}

        {/* New User Modal */}
        {showNewUserForm && (
          <UserCreateModal 
            onSave={handleCreateUser}
            onClose={() => setShowNewUserForm(false)}
            organizations={organizations}
          />
        )}

        {/* Edit Organization Modal */}
        {editingOrg && (
          <OrgEditModal 
            organization={editingOrg} 
            onSave={handleEditOrganization}
            onClose={() => setEditingOrg(null)}
          />
        )}

        {/* New Organization Modal */}
        {showNewOrgForm && (
          <OrgCreateModal 
            onSave={handleCreateOrganization}
            onClose={() => setShowNewOrgForm(false)}
          />
        )}

        {/* Edit License Modal */}
        {editingLicense && (
          <LicenseEditModal 
            license={editingLicense} 
            onSave={handleEditLicense}
            onClose={() => setEditingLicense(null)}
            organizations={organizations}
          />
        )}

        {/* New License Modal */}
        {showNewLicenseForm && (
          <LicenseCreateModal 
            onSave={handleCreateLicense}
            onClose={() => setShowNewLicenseForm(false)}
            organizations={organizations}
          />
        )}
      </div>
    </div>
  );
}

// User Edit Modal Component
function UserEditModal({ user, onSave, onClose, organizations }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    role: user.role || 'user',
    organization_id: user.organization_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Edit User</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Organization</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData({...formData, organization_id: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// User Create Modal Component
function UserCreateModal({ onSave, onClose, organizations }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user',
    organization_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Create New User</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Organization</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData({...formData, organization_id: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create User</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Organization Edit Modal Component
function OrgEditModal({ organization, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: organization.name || '',
    owner_email: organization.owner_email || '',
    subscription_status: organization.subscription_status || 'trial'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...organization, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Edit Organization</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Organization Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Owner Email</Label>
              <Input
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Subscription Status</Label>
              <Select value={formData.subscription_status} onValueChange={(value) => setFormData({...formData, subscription_status: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Organization Create Modal Component
function OrgCreateModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    owner_email: '',
    subscription_status: 'trial'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Create New Organization</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Organization Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Owner Email</Label>
              <Input
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Subscription Status</Label>
              <Select value={formData.subscription_status} onValueChange={(value) => setFormData({...formData, subscription_status: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Create Organization</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// License Edit Modal Component
function LicenseEditModal({ license, onSave, onClose, organizations }) {
  const [formData, setFormData] = useState({
    customer_name: license.customer_name || '',
    customer_email: license.customer_email || '',
    license_type: license.license_type || 'trial',
    status: license.status || 'active',
    organization_id: license.organization_id || '',
    expiry_date: license.expiry_date ? license.expiry_date.split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const saveData = { ...license, ...formData };
    if (formData.expiry_date) {
      saveData.expiry_date = new Date(formData.expiry_date).toISOString();
    }
    onSave(saveData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Edit License</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Customer Name</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Customer Email</Label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">License Type</Label>
              <Select value={formData.license_type} onValueChange={(value) => setFormData({...formData, license_type: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Organization</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData({...formData, organization_id: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Expiry Date (leave blank for no expiry)</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// License Create Modal Component
function LicenseCreateModal({ onSave, onClose, organizations }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    license_type: 'trial',
    organization_id: '',
    activation_key: crypto.randomUUID(),
    expiry_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const saveData = { ...formData };
    if (formData.expiry_date) {
      saveData.expiry_date = new Date(formData.expiry_date).toISOString();
    }
    onSave(saveData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Create New License</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Customer Name</Label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Customer Email</Label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">License Type</Label>
              <Select value={formData.license_type} onValueChange={(value) => setFormData({...formData, license_type: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Organization</Label>
              <Select value={formData.organization_id} onValueChange={(value) => setFormData({...formData, organization_id: value})}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Activation Key</Label>
              <Input
                value={formData.activation_key}
                onChange={(e) => setFormData({...formData, activation_key: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label className="text-slate-300">Expiry Date (leave blank for no expiry)</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Create License</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}