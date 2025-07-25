
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAudio } from '../audio/AudioPlayer';
import { useCustomization } from '../settings/CustomizationProvider';

const formatTimeWithMs = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00.0";
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = Math.floor((seconds - totalSeconds) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

export default function CategoryBrowser({ category, onBack, onTrackSelect, onEditTrack }) {
    const { allTracks, addTrackToQueue, currentTrack } = useAudio();
    const { settings, isLoading: isSettingsLoading } = useCustomization();
    const [filteredTracks, setFilteredTracks] = useState([]);
    const [selectedTrackId, setSelectedTrackId] = useState(null);
    const [activeCategory, setActiveCategory] = useState(category);

    useEffect(() => {
        if (activeCategory && allTracks.length > 0) {
            filterTracksForCategory(activeCategory);
        }
    }, [allTracks, activeCategory]);

    const filterTracksForCategory = (categoryName) => {
        let categoryTracks = [];

        if (categoryName === 'Sweeper' || categoryName.toLowerCase().includes('sweeper')) {
            categoryTracks = allTracks.filter(track =>
                track.track_type === 'jingle' ||
                track.track_type === 'sweeper' ||
                (track.category && track.category.toLowerCase().includes('sweeper'))
            );
        } else if (categoryName.includes('ID') || categoryName.toLowerCase().includes('station')) {
            categoryTracks = allTracks.filter(track =>
                track.track_type === 'station_id' ||
                (track.category && track.category.toLowerCase().includes('station'))
            );
        } else {
            // Standard category matching
            categoryTracks = allTracks.filter(track =>
                track.category === categoryName ||
                (track.category && track.category.toLowerCase() === categoryName.toLowerCase())
            );
        }

        setFilteredTracks(categoryTracks);
        setSelectedTrackId(null);
    };

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        setSelectedTrackId(null);
    };

    const selectedTrackDetails = filteredTracks.find(t => t.id === selectedTrackId);
    const selectedTrackIndex = filteredTracks.findIndex(t => t.id === selectedTrackId);

    if (isSettingsLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <div className="text-slate-400">Loading categories...</div>
            </div>
        );
    }

    const availableCategories = settings?.custom_categories || [];

    return (
        <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
            {/* 1. Category Buttons */}
            <div className="flex-shrink-0 bg-black border-b-2 border-slate-700">
                <div className="flex items-center gap-1 p-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {availableCategories.map(cat => (
                        <div key={cat.id || cat.name} className="flex-shrink-0 flex flex-col items-center">
                            <div className="h-4 w-full bg-slate-700 text-white text-[10px] flex items-center justify-center rounded-t-sm border-b border-slate-600">M</div>
                            <Button
                                onClick={() => handleCategoryClick(cat.name)}
                                className={`h-8 px-3 text-xs font-medium transition-all flex items-center gap-1.5 rounded-t-none w-full justify-center ${activeCategory === cat.name ? 'bg-white text-black' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                                style={cat.color && activeCategory !== cat.name ? { backgroundColor: cat.color } : {}}
                            >
                                {cat.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Main content grid */}
            <div className="flex-1 grid grid-cols-12 gap-2 p-2 min-h-0">
                {/* Left Panel */}
                <div className="col-span-3 bg-slate-800 rounded-md flex items-center justify-center border border-slate-700">
                    <div className="text-center text-slate-400">
                        {selectedTrackDetails ? (
                            <>
                                <div className="text-4xl font-bold">{selectedTrackIndex + 1}</div>
                                <p className="text-sm text-white font-medium mt-2">{selectedTrackDetails.title}</p>
                                <p className="text-xs text-slate-400">{selectedTrackDetails.artist}</p>
                                <p
                                    className="text-sm cursor-pointer hover:underline mt-2 text-blue-400"
                                    onClick={() => onEditTrack && onEditTrack(selectedTrackDetails)}
                                >
                                    Click to edit
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{filteredTracks.length}</div>
                                <p className="text-sm">tracks in {activeCategory}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel - Track List */}
                <div className="col-span-9 bg-black rounded-md overflow-hidden flex flex-col border border-slate-700">
                    {/* Header */}
                    <div className="grid grid-cols-[auto_1.5fr_3fr_1fr_1fr_1.5fr] gap-4 p-2 bg-slate-700 text-slate-300 font-bold text-sm flex-shrink-0">
                        <div className="w-4"></div>
                        <div className="truncate">TimeOn-Preview</div>
                        <div className="truncate">Track Name</div>
                        <div className="truncate">Intro</div>
                        <div className="truncate">Length</div>
                        <div className="truncate">Category</div>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1">
                        {filteredTracks.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-4">🎵</div>
                                    <p>No tracks found in "{activeCategory}"</p>
                                    <p className="text-sm mt-2">Upload tracks and assign them to this category</p>
                                </div>
                            </div>
                        ) : (
                            filteredTracks.map((track, index) => {
                                const isSelected = track.id === selectedTrackId;
                                const isOnAir = track.id === currentTrack?.id;
                                const isSpecialType = track.track_type === 'station_id' || track.track_type === 'jingle' || track.track_type === 'sweeper';

                                return (
                                    <div
                                        key={track.id}
                                        onClick={() => setSelectedTrackId(track.id)}
                                        onDoubleClick={() => addTrackToQueue(track)}
                                        className={`grid grid-cols-[auto_1.5fr_3fr_1fr_1fr_1.5fr] gap-4 px-2 py-1 items-center cursor-pointer text-white border-b border-slate-800/50 ${
                                            isSelected ? 'bg-red-700/80' : ''
                                        } ${
                                            isOnAir ? 'bg-blue-600/80' : ''
                                        } hover:bg-slate-700/50`}
                                    >
                                        <input type="checkbox" className="ml-1 bg-transparent border-slate-500" checked={isSelected} readOnly />
                                        <div className={`font-mono text-sm ${isSpecialType ? 'text-green-400' : ''}`}>
                                            {new Date(Date.now() + index * 3 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="truncate">{track.artist} - {track.title}</div>
                                        <div className="font-mono text-sm">{formatTimeWithMs(track.intro_time || 0)}</div>
                                        <div className="font-mono text-sm">{formatTimeWithMs(track.duration)}</div>
                                        <div className="truncate text-slate-400">{track.category || track.track_type}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
