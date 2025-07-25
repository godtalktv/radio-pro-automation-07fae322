
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Clockwheel } from "@/api/entities";
import { X, Plus, Save, Loader2, Trash2, GripVertical, Music, Radio, Mic, FileAudio } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ClockwheelVisualizer from '../clockwheels/ClockwheelVisualizer'; // Import the visualizer

const CONTENT_TYPES = [
    { value: 'music', label: 'Music', icon: <Music className="w-4 h-4 text-blue-400" /> },
    { value: 'station_id', label: 'Station ID', icon: <Radio className="w-4 h-4 text-purple-400" /> },
];

export default function VisualRotationEditor({ clockwheelId, onClose }) {
    const { toast } = useToast();
    const [clockwheel, setClockwheel] = useState(null);
    const [name, setName] = useState('');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadClockwheel = async () => {
            if (clockwheelId) {
                try {
                    const fetched = await Clockwheel.get(clockwheelId);
                    setClockwheel(fetched);
                    setName(fetched.name);
                    // Ensure items have unique IDs for drag and drop
                    setItems(fetched.items.map(item => ({ ...item, id: item.id || crypto.randomUUID() })));
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to load clockwheel.' });
                }
            } else {
                setName('New Clockwheel');
                setItems([]);
            }
            setIsLoading(false);
        };
        loadClockwheel();
    }, [clockwheelId, toast]);

    const handleSave = async () => {
        setIsSaving(true);
        const finalItems = items.map((item, index) => ({
            ...item,
            position: index + 1, // Ensure position is always correct on save
        }));

        const data = { name, items: finalItems };
        try {
            if (clockwheelId) {
                await Clockwheel.update(clockwheelId, data);
            } else {
                await Clockwheel.create(data);
            }
            toast({ title: 'Success', description: 'Clockwheel saved successfully.' });
            onClose(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save clockwheel.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const addItem = () => {
        const newItem = {
            id: crypto.randomUUID(), // Ensure new items have a unique ID
            type: 'music',
            estimated_duration: 180, // Default to 3 minutes
            play_sweeper_before: false,
            position: items.length + 1
        };
        setItems([...items, newItem]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };
    
    // Drag and Drop handler
    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        // Update the state with the reordered list
        setItems(reorderedItems);
    };


    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-6xl h-[90vh] bg-slate-900/80 border-slate-700 overflow-hidden flex flex-col">
                <CardHeader className="flex-shrink-0 p-4 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-white">Clockwheel Editor</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={addItem}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                            <Button onClick={() => onClose(false)} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Clockwheel Name"
                            className="bg-slate-800 border-slate-600 text-white"
                        />
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                    <div className="grid grid-cols-12 gap-0 h-full">
                        {/* Left Column - Draggable Items List (Now Scrollable) */}
                        <div className="col-span-8 border-r border-slate-700 flex flex-col">
                            <div className="flex-shrink-0 p-4 bg-slate-800/30 border-b border-slate-700">
                                <h3 className="text-lg font-semibold text-white">Rotation Items ({items.length})</h3>
                                <p className="text-sm text-slate-400">Drag to reorder • {Math.round(items.reduce((sum, item) => sum + (item.estimated_duration || 0), 0) / 60)} minutes total</p>
                            </div>
                            
                            {/* Scrollable Items Container */}
                            <div className="flex-1 overflow-y-auto p-4" style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#64748b #1e293b'
                            }}>
                                <style jsx>{`
                                    div::-webkit-scrollbar {
                                        width: 8px;
                                    }
                                    div::-webkit-scrollbar-track {
                                        background: #1e293b;
                                        border-radius: 4px;
                                    }
                                    div::-webkit-scrollbar-thumb {
                                        background: #64748b;
                                        border-radius: 4px;
                                    }
                                    div::-webkit-scrollbar-thumb:hover {
                                        background: #94a3b8;
                                    }
                                `}</style>
                                
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <Music className="w-16 h-16 mb-4 text-slate-600" />
                                        <p className="text-lg font-medium">No items yet</p>
                                        <p className="text-sm">Click "Add Item" to start building your rotation</p>
                                    </div>
                                ) : (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="clockwheel-items">
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="space-y-3"
                                                >
                                                    {items.map((item, index) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700 transition-all ${
                                                                        snapshot.isDragging ? 'shadow-lg border-blue-500' : 'hover:bg-slate-800/70'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            {...provided.dragHandleProps}
                                                                            className="text-slate-400 hover:text-white cursor-grab active:cursor-grabbing"
                                                                        >
                                                                            <GripVertical className="w-5 h-5" />
                                                                        </div>
                                                                        
                                                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                                                                            {index + 1}
                                                                        </div>
                                                                        
                                                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                                                            <Select
                                                                                value={item.type}
                                                                                onValueChange={(value) => updateItem(index, 'type', value)}
                                                                            >
                                                                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                                                    <SelectValue>
                                                                                        <div className="flex items-center gap-2">
                                                                                            {CONTENT_TYPES.find(c => c.value === item.type)?.icon}
                                                                                            {CONTENT_TYPES.find(c => c.value === item.type)?.label}
                                                                                        </div>
                                                                                    </SelectValue>
                                                                                </SelectTrigger>
                                                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                                                    {CONTENT_TYPES.map(type => (
                                                                                        <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                                                                                            <div className="flex items-center gap-2">
                                                                                                {type.icon}
                                                                                                {type.label}
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            
                                                                            <div className="flex items-center gap-2">
                                                                                <Input
                                                                                    type="number"
                                                                                    value={item.estimated_duration || ''}
                                                                                    onChange={(e) => updateItem(index, 'estimated_duration', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Duration (sec)"
                                                                                    className="bg-slate-700 border-slate-600 text-white"
                                                                                />
                                                                                <span className="text-slate-400 text-sm whitespace-nowrap">
                                                                                    {Math.round((item.estimated_duration || 0) / 60)}m
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <Button
                                                                            onClick={() => removeItem(index)}
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
                                )}
                            </div>
                        </div>

                        {/* Right Column - Fixed Visualizer */}
                        <div className="col-span-4 flex flex-col">
                            <div className="flex-shrink-0 p-4 bg-slate-800/30 border-b border-slate-700">
                                <h3 className="text-lg font-semibold text-white text-center">Live Preview</h3>
                            </div>
                            <div className="flex-1 flex items-start justify-center pt-8 p-4">
                                <ClockwheelVisualizer items={items} />
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex-shrink-0 p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                    <Button onClick={() => onClose(false)} variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Clockwheel
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
