import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlayCircle, 
  Edit, 
  Trash2, 
  Music,
  Clock,
  Calendar,
  Settings
} from "lucide-react";
import { format } from "date-fns";

export default function PlaylistGrid({ playlists, onEdit, onDelete, onOpenEditor, isLoading }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-slate-800" />
              <Skeleton className="h-4 w-1/2 bg-slate-800" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-slate-800" />
                <Skeleton className="h-4 w-2/3 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <Card 
          key={playlist.id}
          className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-200 group"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-white text-lg truncate">
                  {playlist.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(playlist.status || 'draft')}>
                    {playlist.status || 'draft'}
                  </Badge>
                  {playlist.scheduled_date && (
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(playlist.scheduled_date), 'MMM d')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {playlist.description && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {playlist.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                <span>{playlist.tracks?.length || 0} tracks</span>
              </div>
              {playlist.total_duration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(playlist.total_duration)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenEditor(playlist.id)}
                className="flex-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
              >
                <Settings className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(playlist)}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(playlist.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {playlists.length === 0 && (
        <div className="col-span-full text-center py-12">
          <PlayCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No playlists created yet</p>
        </div>
      )}
    </div>
  );
}