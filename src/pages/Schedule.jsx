import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import LoginForm from '../components/auth/LoginForm';
import ScheduleGrid from '../components/schedule/ScheduleGrid';
import { Loader2, Radio } from 'lucide-react';

export default function Schedule() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setAuthError(false);
    } catch (error) {
      console.log('User not authenticated:', error);
      setAuthError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuthStatus();
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setAuthError(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 text-white animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading RadioPro Studio...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Schedule Management</h1>
            <p className="text-slate-400">
              Welcome back, {user.full_name || user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        <ScheduleGrid />
      </div>
    </div>
  );
}