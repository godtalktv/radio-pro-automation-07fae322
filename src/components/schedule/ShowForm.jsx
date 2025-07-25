import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // Badge is no longer used but kept for consistency, can be removed if not needed elsewhere.
import { X, Save, XCircle } from "lucide-react";
import { Clockwheel } from "@/api/entities";

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

const GENRES = [
  'rock', 'pop', 'jazz', 'classical', 'electronic', 'hip_hop', 
  'country', 'blues', 'folk', 'alternative', 'reggae', 'punk', 
  'metal', 'r_and_b', 'soul', 'funk', 'disco'
];

export default function ShowForm({ show, onSubmit, onCancel }) {
  const [currentShow, setCurrentShow] = useState(show || {
    name: "",
    host: "",
    description: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    recurring: true,
    clockwheel_id: "",
  });
  
  const [clockwheels, setClockwheels] = useState([]);

  useEffect(() => {
      async function fetchClockwheels() {
          const fetched = await Clockwheel.list();
          setClockwheels(fetched);
      }
      fetchClockwheels();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(currentShow);
  };

  // handleGenreToggle and GENRES array are no longer used in the form, 
  // but GENRES array is kept as it's a global constant and might be used elsewhere.
  // The handleGenreToggle function is removed as it's specific to the old genre preferences UI.

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
      <CardHeader>
        <CardTitle className="text-white">
          {show ? 'Edit Show' : 'Create New Show'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Show Name</Label>
              <Input
                value={currentShow.name}
                onChange={(e) => setCurrentShow({...currentShow, name: e.target.value})}
                placeholder="Morning Drive, Evening Jazz..."
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Host</Label>
              <Input
                value={currentShow.host}
                onChange={(e) => setCurrentShow({...currentShow, host: e.target.value})}
                placeholder="Host name (optional)"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={currentShow.description}
              onChange={(e) => setCurrentShow({...currentShow, description: e.target.value})}
              placeholder="Show description..."
              className="bg-slate-800/50 border-slate-700/50 text-white h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Clockwheel *</Label>
              <Select 
                value={currentShow.clockwheel_id}
                onValueChange={(value) => setCurrentShow({...currentShow, clockwheel_id: value})}
                required
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select clockwheel" />
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
            <div className="space-y-2">
              <Label className="text-slate-300">Day of Week *</Label>
              <Select 
                value={currentShow.day_of_week}
                onValueChange={(value) => setCurrentShow({...currentShow, day_of_week: value})}
                required
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(day => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Start Time *</Label>
              <Input
                type="time"
                value={currentShow.start_time}
                onChange={(e) => setCurrentShow({...currentShow, start_time: e.target.value})}
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">End Time *</Label>
              <Input
                type="time"
                value={currentShow.end_time}
                onChange={(e) => setCurrentShow({...currentShow, end_time: e.target.value})}
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={currentShow.recurring}
                onCheckedChange={(checked) => setCurrentShow({...currentShow, recurring: checked})}
              />
              <Label htmlFor="recurring" className="text-slate-300">
                Recurring weekly
              </Label>
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
              {show ? 'Update Show' : 'Create Show'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}