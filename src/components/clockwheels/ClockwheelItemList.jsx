import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Music, Zap, Annoyed, Mic } from 'lucide-react';

const TYPE_ICONS = {
    music: Music,
    station_id: Zap,
    commercial: Annoyed,
    promo: Mic,
};

function ClockwheelItem({ item, index, onUpdate, onRemove }) {
    const Icon = TYPE_ICONS[item.type] || Music;
    
    const handleDurationChange = (e) => {
        onUpdate(index, { ...item, duration_minutes: parseInt(e.target.value) || 0 });
    };

    return (
        <Draggable draggableId={item.id?.toString() || `item-${index}`} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 p-2 rounded-lg ${snapshot.isDragging ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                    <div {...provided.dragHandleProps} className="text-slate-500 cursor-grab">
                        <GripVertical />
                    </div>
                    <Icon className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                        <p className="font-medium capitalize">{item.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="number"
                            value={item.duration_minutes}
                            onChange={handleDurationChange}
                            className="w-20 bg-slate-900 border-slate-700 h-8"
                            min="1"
                        />
                        <span className="text-sm text-slate-400">min</span>
                    </div>
                    <Button onClick={() => onRemove(index)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </Draggable>
    );
}

export default function ClockwheelItemList({ items, onUpdate, onRemove, droppableId }) {
    return (
        <Card className="h-full bg-slate-900 border-slate-800 flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg text-white">Editing Rotation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
                <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-2 p-2 rounded-lg min-h-[100px] ${snapshot.isDraggingOver ? 'bg-slate-800/50' : ''}`}
                        >
                            {items.map((item, index) => (
                                <ClockwheelItem 
                                    key={item.id?.toString() || index} 
                                    item={item} 
                                    index={index}
                                    onUpdate={onUpdate}
                                    onRemove={onRemove}
                                />
                            ))}
                            {provided.placeholder}
                            {items.length === 0 && !snapshot.isDraggingOver && (
                                <div className="text-center text-slate-500 py-10">
                                    <p>Drag items from the right to build your clockwheel.</p>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </CardContent>
        </Card>
    );
}