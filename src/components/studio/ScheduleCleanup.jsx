import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Show, Clockwheel, Playlist } from "@/api/entities";
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function ScheduleCleanup({ onComplete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState({ message: '', type: 'idle' });
  const [deletionResults, setDeletionResults] = useState({
    shows: 0,
    clockwheels: 0,
    playlists: 0
  });

  const handleCompleteCleanup = async () => {
    setIsDeleting(true);
    setDeleteStatus({ message: 'Starting complete cleanup...', type: 'loading' });

    try {
      // 1. Delete all Shows
      setDeleteStatus({ message: 'Deleting all shows...', type: 'loading' });
      const allShows = await Show.list('-created_date', 1000);
      let deletedShows = 0;
      
      for (const show of allShows) {
        try {
          await Show.delete(show.id);
          deletedShows++;
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (error) {
          console.warn(`Failed to delete show ${show.id}:`, error);
        }
      }

      // 2. Delete all Clockwheels
      setDeleteStatus({ message: 'Deleting all clockwheels...', type: 'loading' });
      const allClockwheels = await Clockwheel.list('-created_date', 1000);
      let deletedClockwheels = 0;
      
      for (const clockwheel of allClockwheels) {
        try {
          await Clockwheel.delete(clockwheel.id);
          deletedClockwheels++;
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (error) {
          console.warn(`Failed to delete clockwheel ${clockwheel.id}:`, error);
        }
      }

      // 3. Delete all Playlists
      setDeleteStatus({ message: 'Deleting all playlists...', type: 'loading' });
      const allPlaylists = await Playlist.list('-created_date', 1000);
      let deletedPlaylists = 0;
      
      for (const playlist of allPlaylists) {
        try {
          await Playlist.delete(playlist.id);
          deletedPlaylists++;
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        } catch (error) {
          console.warn(`Failed to delete playlist ${playlist.id}:`, error);
        }
      }

      setDeletionResults({
        shows: deletedShows,
        clockwheels: deletedClockwheels,
        playlists: deletedPlaylists
      });

      setDeleteStatus({ 
        message: `Cleanup complete! Deleted ${deletedShows} shows, ${deletedClockwheels} clockwheels, and ${deletedPlaylists} playlists.`, 
        type: 'success' 
      });

    } catch (error) {
      console.error('Cleanup failed:', error);
      setDeleteStatus({ 
        message: `Cleanup failed: ${error.message}`, 
        type: 'error' 
      });
    }

    setIsDeleting(false);
  };

  return (
    <Card className="w-full max-w-2xl bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Complete Schedule Cleanup
        </CardTitle>
        <p className="text-sm text-slate-400">
          This will permanently delete ALL shows, clockwheels, and playlists from your system.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="bg-red-900/50 border-red-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-300">
            <strong>Warning:</strong> This action cannot be undone. All your scheduling data will be permanently removed.
          </AlertDescription>
        </Alert>

        {deleteStatus.type !== 'idle' && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            deleteStatus.type === 'success' ? 'bg-green-500/10 text-green-400' :
            deleteStatus.type === 'error' ? 'bg-red-500/10 text-red-400' :
            'bg-slate-800/50 text-slate-300'
          }`}>
            {deleteStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {deleteStatus.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {deleteStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            <p>{deleteStatus.message}</p>
          </div>
        )}

        {deleteStatus.type === 'success' && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Deletion Summary:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{deletionResults.shows}</div>
                <div className="text-slate-400">Shows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{deletionResults.clockwheels}</div>
                <div className="text-slate-400">Clockwheels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{deletionResults.playlists}</div>
                <div className="text-slate-400">Playlists</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCompleteCleanup}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete All Schedules'}
          </Button>
          
          {deleteStatus.type === 'success' && (
            <Button
              onClick={onComplete}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Category Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}