import React from 'react';
import { Button } from "@/components/ui/button";
import { 
    ListMusic, 
    Music, 
    Settings, 
    Mic,
    PlayCircle,
    Radio, // Add Radio icon for Voice Tracking
    Shield // Add Shield icon for Admin
} from 'lucide-react';

const MODES = [
    {
        id: 'playlist_rotation',
        name: 'Playlist/Rotation Screen',
        description: 'Displays currently playing track, upcoming tracks, and current rotation or playlist'
    },
    {
        id: 'live_assist',
        name: 'Live Assist/PlayOut Only',
        description: 'Manual control mode for DJ operations and voice tracking'
    },
    {
        id: 'track_list',
        name: 'Track List/Add Music',
        description: 'Quick access to entire audio library with filtering and sorting'
    },
    {
        id: 'playlist_builder',
        name: 'Playlist Builder/Voice Tracking',
        description: 'Create, modify, and manage playlists with drag and drop'
    },
    {
        id: 'voice_tracking',
        name: 'Voice Tracking Studio',
        description: 'Professional voice tracking with preview and audio bed management'
    },
    {
        id: 'admin_login', // New admin mode
        name: 'Admin Login',
        description: 'Administrative access and system settings'
    }
];

export default function ModeSelection({ selectedMode, onModeChange }) {
    return (
        <div className="h-full bg-slate-900/80 border-t border-slate-700/50 flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
                {MODES.map(mode => {
                    const isSelected = selectedMode === mode.id;
                    const isAdmin = mode.id === 'admin_login';
                    
                    return (
                        <Button
                            key={mode.id}
                            onClick={() => onModeChange(mode.id)}
                            className={`h-8 text-xs transition-all rounded-sm ${
                                isSelected
                                    ? isAdmin 
                                        ? 'bg-red-600 text-white shadow-md' 
                                        : 'bg-blue-600 text-white shadow-md'
                                    : isAdmin
                                        ? 'bg-slate-700/50 text-red-400 hover:bg-red-600/20 border border-red-600/30'
                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                            }`}
                            variant="default"
                            title={mode.description}
                        >
                           {mode.id === 'live_assist' && <PlayCircle className="w-4 h-4 mr-2 text-green-400" />}
                           {mode.id === 'voice_tracking' && <Radio className="w-4 h-4 mr-2 text-purple-400" />}
                           {mode.id === 'admin_login' && <Shield className="w-4 h-4 mr-2 text-red-400" />}
                           {mode.name}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}