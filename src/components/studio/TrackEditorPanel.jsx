import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Save, Loader2, Music, Info, Album, User as UserIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useCustomization } from '../settings/CustomizationProvider'; // Import customization hook

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function TrackEditorPanel({ track, onUpdate, onAnalyze, analyzingTrackId }) {
    const [editableTrack, setEditableTrack] = useState(null);
    const { toast } = useToast();
    const { settings, isLoading: isSettingsLoading } = useCustomization(); // Get settings and loading state

    useEffect(() => {
        if (track) {
            setEditableTrack({ ...track });
        } else {
            setEditableTrack(null);
        }
    }, [track]);

    const handleInputChange = (field, value) => {
        setEditableTrack(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveChanges = () => {
        if (!editableTrack) return;
        onUpdate(editableTrack);
        toast({
            title: "Track Saved",
            description: `Changes to "${editableTrack.title}" have been saved.`,
            className: "bg-green-900 border-green-600 text-white"
        });
    };

    if (!editableTrack) {
        return (
            <Card className="h-full bg-slate-800/30 border-slate-700/50 flex flex-col items-center justify-center text-slate-500">
                <Music className="w-16 h-16 mb-4" />
                <p className="font-semibold">No Track Selected</p>
                <p className="text-sm text-center px-4">Select a track from the library to view or edit its details here.</p>
            </Card>
        );
    }
    
    const isAnalyzing = analyzingTrackId === editableTrack.id;

    return (
        <Card className="h-full bg-slate-800/30 border-slate-700/50 flex flex-col">
            <CardHeader className="p-4 border-b border-slate-700/50">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>Track Editor</span>
                    {editableTrack.ai_enhanced && <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">AI Enhanced</Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
                <div className="flex items-start gap-4">
                    <img src={editableTrack.album_art_url || 'https://placehold.co/100x100/0f172a/94a3b8?text=Art'} alt="Album Art" className="w-24 h-24 rounded-md object-cover" />
                    <div className="flex-1">
                        <Label htmlFor="title" className="text-slate-400">Title</Label>
                        <Input id="title" value={editableTrack.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="artist" className="text-slate-400">Artist</Label>
                        <Input id="artist" value={editableTrack.artist || ''} onChange={(e) => handleInputChange('artist', e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="album" className="text-slate-400">Album</Label>
                        <Input id="album" value={editableTrack.album || ''} onChange={(e) => handleInputChange('album', e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="category" className="text-slate-400">Category</Label>
                    <Select
                        value={editableTrack.category || ''}
                        onValueChange={(value) => handleInputChange('category', value)}
                        disabled={isSettingsLoading}
                    >
                        <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>-- Uncategorized --</SelectItem>
                            {settings?.custom_categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    <span className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                                        {cat.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="bpm" className="text-slate-400">BPM</Label>
                        <Input id="bpm" type="number" value={editableTrack.bpm || ''} onChange={(e) => handleInputChange('bpm', e.target.value)} className="bg-slate-900/50 border-slate-700 text-white" />
                    </div>
                    <div>
                        <Label htmlFor="duration" className="text-slate-400">Duration</Label>
                        <Input id="duration" value={formatTime(editableTrack.duration)} readOnly className="bg-slate-900/50 border-slate-700 text-white" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description" className="text-slate-400">Notes / Description</Label>
                    <Textarea id="description" value={editableTrack.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} className="bg-slate-900/50 border-slate-700 text-white h-24" />
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <Button onClick={() => onAnalyze(editableTrack)} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isAnalyzing}>
                        {isAnalyzing ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Wand2 className="w-5 h-5 mr-2" />
                        )}
                        {isAnalyzing ? 'Analyzing Metadata...' : 'AI Metadata Analysis'}
                    </Button>

                    <Button onClick={handleSaveChanges} className="w-full bg-green-600 hover:bg-green-700">
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}