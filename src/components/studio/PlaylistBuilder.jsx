import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Playlist, Track, Show } from "@/api/entities";
import { User } from '@/api/entities';
import { useAudio } from '../audio/AudioPlayer';
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Save, 
  Play, 
  Trash2, 
  Clock, 
  Music, 
  Mic, 
  Radio,
  GripVertical,
  Calendar,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PlaylistBuilder() {
  const { allTracks, handlePlayNow, addTrackToQueue } = useAudio();
  const { toast } = useToast();
  
  // Playlist state
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Library state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filteredTracks, setFilteredTracks] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPlaylists();
    setFilteredTracks(allTracks);
  }, [allTracks]);

  useEffect(() => {
    filterTracks();
  }, [searchTerm, filterCategory, allTracks]);

  useEffect(() => {
    calculateTotalDuration();
  }, [playlistTracks]);

  const loadPlaylists = async () => {
    try {
      const user = await User.me();
      const fetchedPlaylists = await Playlist.filter({ organization_id: user.organization_id });
      setPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load playlists."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTracks = () => {
    let filtered = allTracks.filter(track => {
      const matchesSearch = !searchTerm || 
        track.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.album?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
        track.category === filterCategory ||
        track.track_type === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredTracks(filtered);
  };

  const calculateTotalDuration = () => {
    const total = playlistTracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    setTotalDuration(total);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter a playlist name."
      });
      return;
    }

    setIsCreatingPlaylist(true);
    try {
      const user = await User.me();
      const newPlaylist = await Playlist.create({
        name: newPlaylistName.trim(),
        description: '',
        organization_id: user.organization_id,
        tracks: [],
        total_duration: 0,
        status: 'draft'
      });

      setPlaylists([...playlists, newPlaylist]);
      setSelectedPlaylist(newPlaylist);
      setPlaylistTracks([]);
      setNewPlaylistName('');
      
      toast({
        title: "Playlist Created",
        description: `"${newPlaylist.name}" has been created successfully.`,
        className: "bg-green-900 border-green-600"
      });
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Failed to create playlist."
      });
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleSelectPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    if (playlist.tracks && playlist.tracks.length > 0) {
      // Load track details
      const trackIds = playlist.tracks.map(t => t.track_id);
      const trackDetails = allTracks.filter(t => trackIds.includes(t.id));
      
      // Maintain order from playlist
      const orderedTracks = playlist.tracks
        .map(pt => trackDetails.find(t => t.id === pt.track_id))
        .filter(Boolean);
      
      setPlaylistTracks(orderedTracks);
    } else {
      setPlaylistTracks([]);
    }
  };

  const handleSavePlaylist = async () => {
    if (!selectedPlaylist) return;
    
    setIsSaving(true);
    try {
      const tracksData = playlistTracks.map((track, index) => ({
        track_id: track.id,
        position: index + 1
      }));

      await Playlist.update(selectedPlaylist.id, {
        tracks: tracksData,
        total_duration: totalDuration
      });

      toast({
        title: "Playlist Saved",
        description: `"${selectedPlaylist.name}" has been saved with ${playlistTracks.length} tracks.`,
        className: "bg-green-900 border-green-600"
      });
      
      await loadPlaylists(); // Refresh the list
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save playlist."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Handle drag from library to playlist
    if (source.droppableId === 'library' && destination.droppableId === 'playlist') {
      const track = filteredTracks.find(t => t.id === draggableId);
      if (track && !playlistTracks.find(t => t.id === track.id)) {
        const newTracks = [...playlistTracks];
        newTracks.splice(destination.index, 0, track);
        setPlaylistTracks(newTracks);
      }
      return;
    }

    // Handle reordering within playlist
    if (source.droppableId === 'playlist' && destination.droppableId === 'playlist') {
      const newTracks = Array.from(playlistTracks);
      const [reorderedItem] = newTracks.splice(source.index, 1);
      newTracks.splice(destination.index, 0, reorderedItem);
      setPlaylistTracks(newTracks);
      return;
    }
  };

  const removeFromPlaylist = (trackId) => {
    setPlaylistTracks(tracks => tracks.filter(t => t.id !== trackId));
  };

  const getTrackIcon = (trackType) => {
    switch (trackType) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'station_id': return <Radio className="w-4 h-4" />;
      case 'voice_track': return <Mic className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getUniqueCategories = () => {
    const categories = new Set();
    allTracks.forEach(track => {
      if (track.category) categories.add(track.category);
      if (track.track_type) categories.add(track.track_type);
    });
    return Array.from(categories);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading Playlist Builder...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Professional Playlist Builder</h2>
          <div className="flex items-center gap-2">
            {selectedPlaylist && (
              <Button
                onClick={handleSavePlaylist}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Playlist
              </Button>
            )}
          </div>
        </div>
        
        {/* Playlist Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-slate-300">Playlist:</Label>
            <Select value={selectedPlaylist?.id || ''} onValueChange={(id) => handleSelectPlaylist(playlists.find(p => p.id === id))}>
              <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select or create a playlist" />
              </SelectTrigger>
              <SelectContent>
                {playlists.map(playlist => (
                  <SelectItem key={playlist.id} value={playlist.id}>
                    {playlist.name} ({playlist.tracks?.length || 0} tracks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-48 bg-slate-700 border-slate-600 text-white"
            />
            <Button
              onClick={handleCreatePlaylist}
              disabled={isCreatingPlaylist}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreatingPlaylist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
          
          {selectedPlaylist && (
            <Badge className="bg-blue-600 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(totalDuration)}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Library Panel */}
          <div className="w-1/2 border-r border-slate-700 flex flex-col">
            <div className="flex-shrink-0 bg-slate-800 p-3 border-b border-slate-700">
              <h3 className="text-lg font-semibold mb-3">Music Library</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search tracks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-slate-400 border-slate-600">
                {filteredTracks.length} tracks
              </Badge>
            </div>
            
            <Droppable droppableId="library">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredTracks.map((track, index) => (
                    <Draggable key={track.id} draggableId={track.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 cursor-grab ${
                            snapshot.isDragging ? 'opacity-50' : 'hover:bg-slate-700'
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-slate-500" />
                          {getTrackIcon(track.track_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{track.title}</p>
                            <p className="text-slate-400 text-sm truncate">{track.artist}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(track.duration)}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePlayNow(track)}
                            className="flex-shrink-0 text-slate-400 hover:text-white"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Playlist Panel */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-shrink-0 bg-slate-800 p-3 border-b border-slate-700">
              <h3 className="text-lg font-semibold mb-2">
                {selectedPlaylist ? `${selectedPlaylist.name}` : 'Select a Playlist'}
              </h3>
              {selectedPlaylist && (
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{playlistTracks.length} tracks</span>
                  <span>Total: {formatTime(totalDuration)}</span>
                  <Badge className={`${selectedPlaylist.status === 'live' ? 'bg-red-600' : 'bg-slate-600'}`}>
                    {selectedPlaylist.status}
                  </Badge>
                </div>
              )}
            </div>
            
            {selectedPlaylist ? (
              <Droppable droppableId="playlist">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 overflow-y-auto p-2 space-y-1 ${
                      snapshot.isDraggingOver ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    {playlistTracks.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        <div className="text-center">
                          <Music className="w-12 h-12 mx-auto mb-4" />
                          <p>Drag tracks from the library to build your playlist</p>
                        </div>
                      </div>
                    ) : (
                      playlistTracks.map((track, index) => (
                        <Draggable key={track.id} draggableId={track.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 ${
                                snapshot.isDragging ? 'opacity-50' : ''
                              }`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="w-4 h-4 text-slate-500" />
                              </div>
                              <Badge variant="outline" className="text-xs min-w-8 text-center">
                                {index + 1}
                              </Badge>
                              {getTrackIcon(track.track_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{track.title}</p>
                                <p className="text-slate-400 text-sm truncate">{track.artist}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatDuration(track.duration)}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handlePlayNow(track)}
                                className="flex-shrink-0 text-slate-400 hover:text-white"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFromPlaylist(track.id)}
                                className="flex-shrink-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a playlist above or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}