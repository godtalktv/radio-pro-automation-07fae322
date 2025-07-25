import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Show, Clockwheel } from "@/api/entities";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

// Rate limiting utility
const createRateLimitedFunction = (fn, delay = 1000) => {
  let timeoutId = null;
  let isExecuting = false;
  
  return async (...args) => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(async () => {
        if (isExecuting) {
          // If already executing, wait and retry
          setTimeout(() => resolve(fn(...args)), delay);
          return;
        }
        
        isExecuting = true;
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          if (error.message?.includes('Rate limit') || error.response?.status === 429) {
            // Wait longer and retry
            setTimeout(() => resolve(fn(...args)), delay * 2);
          } else {
            reject(error);
          }
        } finally {
          isExecuting = false;
        }
      }, delay);
    });
  };
};

export default function RotationScheduler({ onClose }) {
  const [shows, setShows] = useState([]);
  const [clockwheels, setClockwheels] = useState([]);
  const [editingShow, setEditingShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Rate-limited save function
  const rateLimitedSave = createRateLimitedFunction(async (showData) => {
    if (editingShow?.id) {
      return await Show.update(editingShow.id, showData);
    } else {
      return await Show.create(showData);
    }
  }, 1500); // 1.5 second delay between saves

  // Rate-limited delete function
  const rateLimitedDelete = createRateLimitedFunction(async (id) => {
    return await Show.delete(id);
  }, 1000);

  // Rate-limited load function
  const rateLimitedLoad = createRateLimitedFunction(async () => {
    const [fetchedShows, fetchedClockwheels] = await Promise.all([
      Show.list('-created_date'),
      Clockwheel.list('-created_date')
    ]);
    return { fetchedShows, fetchedClockwheels };
  }, 500);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { fetchedShows, fetchedClockwheels } = await rateLimitedLoad();
      setShows(fetchedShows);
      setClockwheels(fetchedClockwheels);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load schedule data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveShow = async (showData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await rateLimitedSave(showData);
      setSuccess(editingShow ? 'Show updated successfully!' : 'Show created successfully!');
      setEditingShow(null);
      
      // Reload data after a brief delay
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (err) {
      console.error('Failed to save show:', err);
      if (err.message?.includes('Rate limit') || err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(`Failed to save show: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      await rateLimitedDelete(id);
      setSuccess('Show deleted successfully!');
      
      // Reload data after a brief delay
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (err) {
      console.error('Failed to delete show:', err);
      if (err.message?.includes('Rate limit') || err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError(`Failed to delete show: ${err.message}`);
      }
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <Card className="w-full h-full bg-slate-900 border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading schedule data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Rotation Scheduler
          </CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            Manage your weekly programming schedule
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status Messages */}
        {error && (
          <Alert className="bg-red-900/50 border-red-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-900/50 border-green-500/50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Add New Show Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Weekly Schedule</h3>
          <Button
            onClick={() => setEditingShow({})}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Show
          </Button>
        </div>

        {/* Shows List */}
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(day => {
            const dayShows = shows.filter(show => show.day_of_week === day.value)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));

            return (
              <div key={day.value} className="space-y-2">
                <h4 className="font-medium text-white">{day.label}</h4>
                {dayShows.length > 0 ? (
                  <div className="space-y-2">
                    {dayShows.map(show => (
                      <div
                        key={show.id}
                        className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="font-medium text-white">{show.name}</h5>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Clock className="w-3 h-3 mr-1" />
                              {show.start_time} - {show.end_time}
                            </Badge>
                            {show.recurring && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">Host: {show.host}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingShow(show)}
                            className="text-slate-400 hover:text-white"
                            disabled={isSaving}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteShow(show.id)}
                            className="text-red-500 hover:text-red-400"
                            disabled={isSaving}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-700/50 rounded-lg text-center">
                    <p className="text-slate-500">No shows scheduled for {day.label}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit Show Modal */}
        {editingShow && (
          <ShowEditor
            show={editingShow}
            clockwheels={clockwheels}
            onSave={handleSaveShow}
            onCancel={() => setEditingShow(null)}
            isSaving={isSaving}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Show Editor Component
const ShowEditor = ({ show, clockwheels, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    name: show.name || '',
    host: show.host || 'Auto DJ',
    day_of_week: show.day_of_week || 'monday',
    start_time: show.start_time || '00:00',
    end_time: show.end_time || '01:00',
    clockwheel_id: show.clockwheel_id || '',
    recurring: show.recurring !== false,
    is_auto_generated: show.is_auto_generated || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            {show.id ? 'Edit Show' : 'Add New Show'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Show Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Host</Label>
              <Input
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-slate-300">Day of Week</Label>
              <Select
                value={formData.day_of_week}
                onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Clockwheel</Label>
              <Select
                value={formData.clockwheel_id}
                onValueChange={(value) => setFormData({ ...formData, clockwheel_id: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Select a clockwheel" />
                </SelectTrigger>
                <SelectContent>
                  {clockwheels.map(cw => (
                    <SelectItem key={cw.id} value={cw.id}>
                      {cw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Show
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};