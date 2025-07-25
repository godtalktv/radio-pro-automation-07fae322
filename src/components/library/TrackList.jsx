
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudio } from "../audio/AudioPlayer";
import { 
  Music, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Clock,
  ExternalLink,
  Zap,
  BrainCircuit,
  Loader2,
  AlertTriangle // New icon for error
} from "lucide-react";

export default function TrackList({ tracks, onEdit, onDelete, isLoading, onAnalyze, analyzingTrackId }) {
  const audio = useAudio();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = (track) => {
    if (window.confirm(`Are you sure you want to delete "${track.title}"?`)) {
      onDelete(track.id);
    }
  };

  const handlePlayPause = async (track) => {
    if (audio.isLoading) return; // Prevent actions while loading
    
    if (audio.currentTrack?.id === track.id && audio.isPlaying) {
      await audio.pauseTrack();
    } else {
      await audio.playTrack(track);
    }
  };

  const handlePlayNow = async (track) => {
    if (audio.isLoading) return;
    await audio.handlePlayNow(track);
  };

  const isCurrentTrack = (track) => audio.currentTrack?.id === track.id;
  const isPlaying = (track) => isCurrentTrack(track) && audio.isPlaying;
  const isAnalyzing = (track) => analyzingTrackId === track.id;

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5" />
            Track Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="w-16 h-16 rounded-lg bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </div>
                <Skeleton className="h-8 w-20 bg-slate-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-blue-400" />
          Track Library ({tracks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tracks.map((track) => {
            const hasError = isCurrentTrack(track) && audio.error;

            return (
              <div 
                key={track.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group border ${
                  hasError 
                    ? 'bg-red-500/10 border-red-500/30'
                    : isCurrentTrack(track) 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'border-transparent hover:bg-slate-800/30 hover:border-slate-700/30'
                } ${isAnalyzing(track) ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center relative ${
                    hasError 
                      ? 'from-red-500 to-orange-500'
                      : isCurrentTrack(track) 
                        ? 'from-blue-500 to-purple-500' 
                        : 'from-purple-500 to-blue-500'
                  }`}>
                    {hasError ? <AlertTriangle className="w-8 h-8 text-white" /> : <Music className="w-8 h-8 text-white" />}
                    {isPlaying(track) && !hasError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl animate-pulse opacity-20"></div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate text-lg ${
                    hasError ? 'text-red-400' : isCurrentTrack(track) ? 'text-blue-400' : 'text-white'
                  }`}>
                    {track.title}
                  </h3>
                  <p className="text-slate-300 truncate">
                    {track.artist}
                  </p>
                  {track.album && (
                    <p className="text-sm text-slate-400 truncate">
                      {track.album}
                    </p>
                  )}
                  {hasError ? (
                    <div className="mt-2 p-2 bg-red-500/10 rounded-md">
                        <p className="text-red-300 text-xs font-medium">{audio.error}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        {track.genre}
                      </Badge>
                      {track.energy_level && (
                        <Badge className={`text-xs ${
                          track.energy_level === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          track.energy_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}>
                          {track.energy_level}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatTime(track.duration)}
                      </div>
                      {track.bpm && (
                        <span className="text-xs text-slate-500">
                          {track.bpm} BPM
                        </span>
                      )}
                      {track.ai_enhanced && (
                         <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">AI Enhanced</Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAnalyze(track)}
                    className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    title="Re-analyze with AI"
                    disabled={isAnalyzing(track)}
                  >
                    {isAnalyzing(track) ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayNow(track)}
                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                    title="Play Now"
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayPause(track)}
                    className={`h-8 w-8 transition-colors ${
                      isPlaying(track)
                        ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
                        : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                    }`}
                    title={isPlaying(track) ? "Pause Track" : "Play Track"}
                  >
                    {isPlaying(track) ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  {track.file_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      title="Open File"
                      onClick={() => window.open(track.file_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(track)}
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
                    title="Edit Track"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(track)}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title="Delete Track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
          
          {tracks.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">No tracks found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
