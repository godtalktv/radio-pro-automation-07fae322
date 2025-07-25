
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "../audio/AudioPlayer";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Music, 
  Clock,
  X,
  GripVertical,
  Save,
  Play,
  Pause,
  Zap // Added Zap icon
} from "lucide-react";
import { Playlist } from "@/api/entities";

export default function PlaylistEditor({ playlist, tracks, onSave, onClose }) {
  const [playlistTracks, setPlaylistTracks] = useState(playlist.tracks || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const audio = useAudio();

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.artist?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre;
    const notInPlaylist = !playlistTracks.some(pt => pt.track_id === track.id);
    return matchesSearch && matchesGenre && notInPlaylist;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTrack = (track) => {
    const newTrack = {
      track_id: track.id,
      position: playlistTracks.length + 1,
      track: track // Store full track data for display
    };
    setPlaylistTracks([...playlistTracks, newTrack]);
  };

  const removeTrack = (index) => {
    setPlaylistTracks(playlistTracks.filter((_, i) => i !== index));
  };

  const moveTrack = (fromIndex, toIndex) => {
    const updatedTracks = [...playlistTracks];
    const [movedTrack] = updatedTracks.splice(fromIndex, 1);
    updatedTracks.splice(toIndex, 0, movedTrack);
    
    // Update positions
    updatedTracks.forEach((track, index) => {
      track.position = index + 1;
    });
    
    setPlaylistTracks(updatedTracks);
  };

  const getTotalDuration = () => {
    return playlistTracks.reduce((total, pt) => {
      const track = pt.track || tracks.find(t => t.id === pt.track_id);
      return total + (track?.duration || 0);
    }, 0);
  };

  const handleSave = async () => {
    const playlistData = {
      ...playlist,
      tracks: playlistTracks.map(pt => ({
        track_id: pt.track_id,
        position: pt.position
      })),
      total_duration: getTotalDuration()
    };

    await Playlist.update(playlist.id, playlistData);
    onSave();
    onClose();
  };

  const handlePlayTrack = (track) => {
    if (audio.currentTrack?.id === track.id && audio.isPlaying) {
      audio.pauseTrack();
    } else {
      audio.playTrack(track);
    }
  };

  // New handlePlayNow function
  const handlePlayNow = async (track) => {
    if (audio.isLoading) return;
    await audio.handlePlayNow(track);
  };

  const isCurrentTrack = (track) => audio.currentTrack?.id === track.id;
  const isPlaying = (track) => isCurrentTrack(track) && audio.isPlaying;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Edit: {playlist.name}</h1>
            <p className="text-slate-400">
              {playlistTracks.length} tracks • {formatTime(getTotalDuration())} total
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Track Library */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-400" />
                Add Tracks
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tracks..."
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
                  />
                </div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-white text-sm"
                >
                  <option value="all">All Genres</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <div 
                    key={track.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                      isCurrentTrack(track) ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center ${
                      isCurrentTrack(track) ? 'from-blue-500 to-purple-500' : 'from-purple-500 to-blue-500'
                    }`}>
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate text-sm ${
                        isCurrentTrack(track) ? 'text-blue-400' : 'text-white'
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {track.artist} • {formatTime(track.duration)}
                      </p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                      {track.genre}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Play Now button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayNow(track)}
                        className="h-8 w-8 p-0 text-yellow-400 hover:bg-yellow-500/10"
                        title="Play Now"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePlayTrack(track)}
                        className={`h-8 w-8 p-0 ${
                          isPlaying(track) 
                            ? 'text-orange-400 hover:bg-orange-500/10' 
                            : 'text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {isPlaying(track) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addTrack(track)}
                        className="bg-blue-600 hover:bg-blue-700 h-8 px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Playlist */}
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-green-400" />
                Playlist ({playlistTracks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {playlistTracks.map((playlistTrack, index) => {
                  const track = playlistTrack.track || tracks.find(t => t.id === playlistTrack.track_id);
                  if (!track) return null;

                  return (
                    <div 
                      key={`${track.id}-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border group ${
                        isCurrentTrack(track) 
                          ? 'bg-blue-500/10 border-blue-500/30' 
                          : 'bg-slate-800/20 border-slate-700/30'
                      }`}
                    >
                      <div className="text-slate-500 text-sm font-mono w-6 text-center">
                        {index + 1}
                      </div>
                      <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                      <div className={`w-8 h-8 bg-gradient-to-br rounded flex items-center justify-center ${
                        isCurrentTrack(track) ? 'from-blue-500 to-purple-500' : 'from-green-500 to-blue-500'
                      }`}>
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate text-sm ${
                          isCurrentTrack(track) ? 'text-blue-400' : 'text-white'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {track.artist} • {formatTime(track.duration)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Play Now button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayNow(track)}
                          className="h-8 w-8 text-yellow-400 hover:bg-yellow-500/10"
                          title="Play Now"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePlayTrack(track)}
                          className={`h-8 w-8 ${
                            isPlaying(track)
                              ? 'text-orange-400 hover:bg-orange-500/10'
                              : 'text-green-400 hover:bg-green-500/10'
                          }`}
                        >
                          {isPlaying(track) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTrack(index)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {playlistTracks.length === 0 && (
                  <div className="text-center py-8">
                    <Music className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No tracks in playlist</p>
                    <p className="text-slate-600 text-sm">Add tracks from the library</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
