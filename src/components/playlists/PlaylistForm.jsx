import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, XCircle } from "lucide-react";

export default function PlaylistForm({ playlist, onSubmit, onCancel }) {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist || {
    name: "",
    description: "",
    status: "draft",
    scheduled_date: "",
    tracks: [],
    total_duration: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(currentPlaylist);
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
      <CardHeader>
        <CardTitle className="text-white">
          {playlist ? 'Edit Playlist' : 'Create New Playlist'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Playlist Name *</Label>
              <Input
                value={currentPlaylist.name}
                onChange={(e) => setCurrentPlaylist({...currentPlaylist, name: e.target.value})}
                placeholder="Morning Drive Mix, Jazz Hour..."
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select 
                value={currentPlaylist.status}
                onValueChange={(value) => setCurrentPlaylist({...currentPlaylist, status: value})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={currentPlaylist.description}
              onChange={(e) => setCurrentPlaylist({...currentPlaylist, description: e.target.value})}
              placeholder="Playlist description..."
              className="bg-slate-800/50 border-slate-700/50 text-white h-24"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Scheduled Date</Label>
            <Input
              type="date"
              value={currentPlaylist.scheduled_date}
              onChange={(e) => setCurrentPlaylist({...currentPlaylist, scheduled_date: e.target.value})}
              className="bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {playlist ? 'Update Playlist' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}