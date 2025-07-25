import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Zap, Annoyed, Mic } from 'lucide-react';

const PALETTE_ITEMS = [
    { id: 'music', name: 'Music Block', icon: Music },
    { id: 'station_id', name: 'Station ID', icon: Zap },
    { id: 'commercial', name: 'Commercials', icon: Annoyed },
    { id: 'promo', name: 'Promo', icon: Mic },
];

function PaletteItem({ item, index }) {
    const Icon = item.icon;
    return (
        <Draggable draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg aspect-square text-center cursor-grab ${snapshot.isDragging ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                    <Icon className="w-6 h-6 mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-300">{item.name}</p>
                </div>
            )}
        </Draggable>
    );
}

export default function ClockwheelItemPalette({ droppableId }) {
    return (
        <Card className="h-full bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg text-white">Category List</CardTitle>
            </CardHeader>
            <CardContent>
                <Droppable droppableId={droppableId} isDropDisabled={true}>
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-3 gap-2"
                        >
                            {PALETTE_ITEMS.map((item, index) => (
                                <PaletteItem key={item.id} item={item} index={index} />
                            ))}
                            {/* Droppable doesn't render a placeholder when isDropDisabled=true, but keep for structure */}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </CardContent>
        </Card>
    );
}