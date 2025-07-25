import React, { useState, useEffect } from "react";
import { Playlist, Track } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { PlayCircle, Plus } from "lucide-react";

import PlaylistGrid from "../components/playlists/PlaylistGrid";
import PlaylistForm from "../components/playlists/PlaylistForm";
import PlaylistEditor from "../components/playlists/PlaylistEditor";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedPlaylists, fetchedTracks] = await Promise.all([
      Playlist.list('-created_date'),
      Track.list('-created_date')
    ]);
    setPlaylists(fetchedPlaylists);
    setTracks(fetchedTracks);
    setIsLoading(false);
  };

  const handleSubmit = async (playlistData) => {
    if (editingPlaylist) {
      await Playlist.update(editingPlaylist.id, playlistData);
    } else {
      await Playlist.create(playlistData);
    }
    setShowForm(false);
    setEditingPlaylist(null);
    loadData();
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setShowForm(true);
  };

  const handleOpenEditor = (playlistId) => {
    setEditingPlaylistId(playlistId);
  };

  const handleDelete = async (playlistId) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      await Playlist.delete(playlistId);
      loadData();
    }
  };

  if (editingPlaylistId) {
    const playlist = playlists.find(p => p.id === editingPlaylistId);
    return (
      <PlaylistEditor
        playlist={playlist}
        tracks={tracks}
        onSave={loadData}
        onClose={() => setEditingPlaylistId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Playlists</h1>
            <p className="text-slate-400">Create and manage your radio playlists</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Playlist
          </Button>
        </div>

        {showForm && (
          <PlaylistForm
            playlist={editingPlaylist}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPlaylist(null);
            }}
          />
        )}

        <PlaylistGrid 
          playlists={playlists}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenEditor={handleOpenEditor}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}