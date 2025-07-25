import React from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Button } from "@/components/ui/button";
import { History, PlusSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function HistoryPanel() {
  const { playHistory, addTrackToQueue } = useAudio();
  const { toast } = useToast();

  const handleRequeue = (track) => {
    addTrackToQueue(track);
    toast({
      title: "Track Re-queued",
      description: `"${track.title}" has been added to the end of the queue.`,
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };
  
  if (playHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
        <History className="w-12 h-12 mb-4" />
        <h3 className="font-semibold text-slate-300">No Play History Yet</h3>
        <p className="text-sm">Played tracks will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {playHistory.map((track, index) => (
          <div
            key={track.id + '-' + index}
            className="flex items-center p-2 border-b border-slate-700/50 hover:bg-slate-800/50"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              <p className="text-xs text-slate-400 truncate">{track.artist}</p>
            </div>
            <p className="text-xs font-mono text-slate-500 mx-2">{formatTimeAgo(track.last_played)}</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-400 hover:text-white"
              onClick={() => handleRequeue(track)}
              title="Add back to queue"
            >
              <PlusSquare className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}