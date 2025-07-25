import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Track } from "@/api/entities";
import { Calendar, DollarSign, Clock, Plus, Edit, Trash2 } from 'lucide-react';

export default function TrafficScheduler() {
  const [commercials, setCommercials] = useState([]);
  const [trafficLog, setTrafficLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSpot, setShowAddSpot] = useState(false);

  useEffect(() => {
    loadCommercialContent();
    loadTrafficLog();
  }, []);

  const loadCommercialContent = async () => {
    try {
      const commercialTracks = await Track.filter({ track_type: 'commercial' });
      setCommercials(commercialTracks);
    } catch (error) {
      console.error('Failed to load commercials:', error);
    }
  };

  const loadTrafficLog = async () => {
    try {
      // In a real implementation, this would load from a TrafficLog entity
      // For now, we'll simulate some traffic data
      const mockTrafficLog = [
        {
          id: '1',
          time: '06:15',
          advertiser: 'Local Auto Dealer',
          duration: 30,
          rate: 25.00,
          status: 'scheduled'
        },
        {
          id: '2', 
          time: '06:45',
          advertiser: 'Coffee Shop Chain',
          duration: 60,
          rate: 45.00,
          status: 'aired'
        },
        {
          id: '3',
          time: '07:15',
          advertiser: 'Real Estate Agency',
          duration: 30,
          rate: 30.00,
          status: 'scheduled'
        }
      ];
      
      setTrafficLog(mockTrafficLog);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load traffic log:', error);
      setIsLoading(false);
    }
  };

  const totalRevenue = trafficLog.reduce((sum, spot) => sum + spot.rate, 0);
  const airedSpots = trafficLog.filter(spot => spot.status === 'aired').length;
  const scheduledSpots = trafficLog.filter(spot => spot.status === 'scheduled').length;

  if (isLoading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-6">
          <div className="text-slate-400">Loading traffic scheduler...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Built-in Traffic Scheduler (2023)
          <Badge className="bg-green-500/20 text-green-300">INNOVATION FIRST</Badge>
        </CardTitle>
        <p className="text-xs text-slate-400">Commercial management and revenue tracking</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">${totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-slate-400">Today's Revenue</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">{airedSpots}</div>
            <div className="text-xs text-slate-400">Spots Aired</div>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-400">{scheduledSpots}</div>
            <div className="text-xs text-slate-400">Scheduled</div>
          </div>
        </div>

        {/* Traffic Log */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Today's Traffic Log</h4>
            <Button 
              size="sm" 
              onClick={() => setShowAddSpot(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Spot
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trafficLog.map(spot => (
              <div key={spot.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono text-sm">{spot.time}</span>
                    <span className="text-slate-300">{spot.advertiser}</span>
                    <Badge 
                      className={`text-xs ${
                        spot.status === 'aired' ? 'bg-green-500/20 text-green-400' : 
                        'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {spot.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {spot.duration}s • ${spot.rate.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Commercials */}
        <div className="bg-slate-900/50 rounded-lg p-3">
          <h4 className="text-white font-medium mb-2">Available Commercials ({commercials.length})</h4>
          <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
            {commercials.map(commercial => (
              <div key={commercial.id} className="text-sm p-2 bg-slate-800/50 rounded">
                <div className="text-slate-300 truncate">{commercial.title}</div>
                <div className="text-xs text-slate-400">
                  {Math.floor(commercial.duration)}s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Spots
          </Button>
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Generate Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}