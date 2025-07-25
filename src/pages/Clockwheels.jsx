import React, { useState, useEffect } from "react";
import { Clockwheel, Track } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, ListMusic } from "lucide-react";

import ClockwheelList from "../components/clockwheels/ClockwheelList";
import ClockwheelEditor from "../components/clockwheels/ClockwheelEditor"; // The new editor

export default function Clockwheels() {
  const [clockwheels, setClockwheels] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [editingClockwheel, setEditingClockwheel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedClockwheels, fetchedTracks] = await Promise.all([
      Clockwheel.list('-created_date'),
      Track.list('-created_date')
    ]);
    setClockwheels(fetchedClockwheels);
    setTracks(fetchedTracks);
    setIsLoading(false);
  };
  
  const handleEdit = (clockwheel) => {
    setEditingClockwheel(clockwheel);
  };

  const handleNew = () => {
    setEditingClockwheel({
      name: "New Clockwheel",
      items: []
    });
  };

  const handleSave = async (clockwheelData) => {
    if (clockwheelData.id) {
      await Clockwheel.update(clockwheelData.id, clockwheelData);
    } else {
      const newClockwheel = await Clockwheel.create(clockwheelData);
      setEditingClockwheel(newClockwheel); // Update state with the newly created clockwheel
    }
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this clockwheel? This is used by shows and could affect scheduling.")) {
      await Clockwheel.delete(id);
      if (editingClockwheel && editingClockwheel.id === id) {
        setEditingClockwheel(null);
      }
      await loadData();
    }
  };
  
  const handleCloseEditor = () => {
    setEditingClockwheel(null);
  }

  if (editingClockwheel) {
    return (
      <ClockwheelEditor
        clockwheel={editingClockwheel}
        onSave={handleSave}
        onClose={handleCloseEditor}
        onDelete={handleDelete}
        tracks={tracks}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clockwheels</h1>
            <p className="text-slate-400">Manage your hourly programming templates.</p>
          </div>
          <Button 
            onClick={handleNew}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Clockwheel
          </Button>
        </div>

        <ClockwheelList
          clockwheels={clockwheels}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}