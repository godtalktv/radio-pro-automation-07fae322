import React from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Music, GripVertical, Trash2, Play, ListMusic } from 'lucide-react';

export default function QueuePanel() {
  const { queue, reorderQueue, removeTrackFromQueue, handlePlayNow } = useAudio();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderQueue(result.source.index, result.destination.index);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
        <ListMusic className="w-12 h-12 mb-4" />
        <h3 className="font-semibold text-slate-300">The Queue is Empty</h3>
        <p className="text-sm">Drag tracks here or add from the library to build your playlist.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="queue">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto"
            >
              {queue.map((track, index) => (
                <Draggable key={track.id + '-' + index} draggableId={track.id + '-' + index} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center p-2 border-b border-slate-700/50 ${
                        snapshot.isDragging ? 'bg-slate-700' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="p-2 cursor-grab text-slate-500 hover:text-white">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{track.title}</p>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mx-2">{formatTime(track.duration)}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-400 hover:text-green-300"
                          onClick={() => handlePlayNow(track, index)}
                          title="Play Now"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:text-red-400"
                          onClick={() => removeTrackFromQueue(index)}
                          title="Remove from Queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}