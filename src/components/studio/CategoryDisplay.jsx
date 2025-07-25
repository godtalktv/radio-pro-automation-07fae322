import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Music, Zap, Radio, PlusCircle } from 'lucide-react';
import { useAudio } from '../audio/AudioPlayer';
import { useCustomization } from '../settings/CustomizationProvider';
import CategoryCreator from './CategoryCreator';

// Map icon names from settings to Lucide components
const iconMap = {
    Music: Music,
    Zap: Zap,
    Radio: Radio,
    Mic: Music, // Fallback for Mic icon
    default: Folder
};

export default function CategoryDisplay({ onCategoryBrowse }) {
    const { allTracks } = useAudio();
    const { settings, isLoading: isSettingsLoading, loadSettings } = useCustomization(); // Add loadSettings
    const [categoryStats, setCategoryStats] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [showCreator, setShowCreator] = useState(false);

    useEffect(() => {
        if (settings?.custom_categories && allTracks) {
            updateCategoryStats();
        }
    }, [allTracks, settings?.custom_categories]);

    const updateCategoryStats = () => {
        if (!settings?.custom_categories) return;

        const updatedCategories = settings.custom_categories.map(category => {
            const matchingTracks = allTracks.filter(track =>
                (track.category && track.category.toLowerCase() === category.name.toLowerCase()) ||
                (category.name.toLowerCase().includes('sweeper') && (track.track_type === 'jingle' || track.track_type === 'sweeper')) ||
                (category.name.toLowerCase().includes('id') && track.track_type === 'station_id')
            );

            return {
                ...category,
                count: matchingTracks.length,
            };
        });

        setCategoryStats(updatedCategories);
    };

    const handleCategoryClick = (categoryName) => {
        if (onCategoryBrowse) {
            onCategoryBrowse(categoryName);
        }
        setActiveCategory(categoryName);
    };
    
    // Updated function to reload settings after category creation
    const handleCategoryCreated = async () => {
        setShowCreator(false);
        // Reload settings to get the new category
        await loadSettings();
    };

    if (isSettingsLoading) {
        return (
            <Card className="h-full bg-black border-slate-700/50 p-2 flex items-center">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400">Loading categories...</div>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="h-full bg-black border-slate-700/50 p-2 flex items-center">
                <div className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {categoryStats.map(category => (
                        <div key={category.id || category.name} className="flex-shrink-0 flex flex-col items-center">
                            <div className="h-4 w-12 bg-slate-700 text-white text-xs flex items-center justify-center rounded-t-sm border-b border-slate-600">
                               M
                            </div>
                            <Button
                                onClick={() => handleCategoryClick(category.name)}
                                className={`h-8 px-3 text-xs font-medium transition-all flex items-center gap-1.5 text-white rounded-t-none w-full justify-center ${
                                    activeCategory === category.name ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                                title={`${category.name}: ${category.count} tracks`}
                                style={category.color && activeCategory !== category.name ? { backgroundColor: category.color } : {}}
                            >
                                <span className="truncate max-w-20">{category.name}</span>
                                {category.count > 0 && (
                                    <span className="text-xs bg-white/20 px-1 rounded">
                                        {category.count}
                                    </span>
                                )}
                            </Button>
                        </div>
                    ))}
                    <div className="flex-shrink-0 flex flex-col items-center">
                         <div className="h-4 w-12 bg-slate-700 text-white text-xs flex items-center justify-center rounded-t-sm border-b border-slate-600">
                           +
                        </div>
                        <Button
                            onClick={() => setShowCreator(true)}
                            className="h-8 px-3 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-t-none"
                            title="Create New Category"
                        >
                           New
                        </Button>
                    </div>
                </div>
            </Card>
            {showCreator && (
                <CategoryCreator 
                    onClose={() => setShowCreator(false)} 
                    onCategoryCreated={handleCategoryCreated} 
                />
            )}
        </>
    );
}