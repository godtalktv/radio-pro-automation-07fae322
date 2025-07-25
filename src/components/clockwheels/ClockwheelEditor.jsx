import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import ClockwheelVisualizer from './ClockwheelVisualizer';
import ClockwheelItemList from './ClockwheelItemList';
import ClockwheelItemPalette from './ClockwheelItemPalette';

const ITEM_PALETTE_ID = 'item-palette';
const ITEM_LIST_ID = 'item-list';

export default function ClockwheelEditor({ clockwheel, onSave, onClose, onDelete, tracks }) {
    const [editedClockwheel, setEditedClockwheel] = useState(clockwheel);
    const [totalDuration, setTotalDuration] = useState(0);

    useEffect(() => {
        const duration = editedClockwheel.items.reduce((acc, item) => acc + (item.duration_minutes || 0), 0);
        setTotalDuration(duration);
    }, [editedClockwheel.items]);

    const handleNameChange = (e) => {
        setEditedClockwheel({ ...editedClockwheel, name: e.target.value });
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        let newItems = Array.from(editedClockwheel.items);
        
        // Dragging from Palette to List
        if (source.droppableId === ITEM_PALETTE_ID && destination.droppableId === ITEM_LIST_ID) {
            const itemType = result.draggableId;
            const newItem = {
                // Using a temporary unique ID for React key purposes until saved
                id: `${itemType}-${Date.now()}`, 
                type: itemType,
                duration_minutes: 5, // Default duration
                genre_filter: [],
                energy_filter: []
            };
            newItems.splice(destination.index, 0, newItem);
        }
        // Reordering within the List
        else if (source.droppableId === ITEM_LIST_ID && destination.droppableId === ITEM_LIST_ID) {
            const [reorderedItem] = newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, reorderedItem);
        }

        // Update positions
        const updatedItems = newItems.map((item, index) => ({ ...item, position: index + 1 }));
        setEditedClockwheel({ ...editedClockwheel, items: updatedItems });
    };

    const handleItemUpdate = (index, updatedItem) => {
        const newItems = [...editedClockwheel.items];
        newItems[index] = updatedItem;
        setEditedClockwheel({ ...editedClockwheel, items: newItems });
    };
    
    const handleItemRemove = (index) => {
        const newItems = editedClockwheel.items.filter((_, i) => i !== index);
        const updatedItems = newItems.map((item, i) => ({ ...item, position: i + 1 }));
        setEditedClockwheel({ ...editedClockwheel, items: updatedItems });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-950 text-white p-4 font-sans">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <Button onClick={onClose} variant="ghost" size="icon"><ArrowLeft /></Button>
                    <Input 
                        value={editedClockwheel.name} 
                        onChange={handleNameChange}
                        className="text-2xl font-bold bg-transparent border-none focus:ring-0 focus:border-slate-500"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="font-bold">{formatDuration(totalDuration)}</p>
                        <p className="text-xs text-slate-400">Total Duration</p>
                    </div>
                    <Button onClick={() => onSave(editedClockwheel)} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Rotation
                    </Button>
                     {editedClockwheel.id && (
                        <Button onClick={() => onDelete(editedClockwheel.id)} variant="destructive">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 grid grid-cols-12 gap-4 pt-4 min-h-0">
                    <div className="col-span-4">
                        <ClockwheelVisualizer items={editedClockwheel.items} />
                    </div>
                    <div className="col-span-4">
                        <ClockwheelItemList 
                            items={editedClockwheel.items} 
                            onUpdate={handleItemUpdate}
                            onRemove={handleItemRemove}
                            droppableId={ITEM_LIST_ID}
                        />
                    </div>
                    <div className="col-span-4">
                        <ClockwheelItemPalette droppableId={ITEM_PALETTE_ID} />
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}