import React from 'react';
import { Card } from "@/components/ui/card";
import LibraryPanel from './LibraryPanel';
import PlaylistPanel from './PlaylistPanel';
import TrackEditorPanel from './TrackEditorPanel';
import CartWall from './CartWall';
import PlaylistBuilder from './PlaylistBuilder';
import VoiceTrackPanel from './VoiceTrackPanel';
import AutomationControlsPanel from './AutomationControlsPanel';
import CategoryBrowser from './CategoryBrowser';
import VoiceTrackingStudio from './VoiceTrackingStudio';
import LiveAssistPanel from './LiveAssistPanel';
import AdminLoginPanel from './AdminLoginPanel'; // Add new import

export default function MainMusicDisplay({ 
    mode, 
    selectedTrack, 
    onTrackSelect, 
    onUpdateTrack, 
    onAnalyzeTrack,
    analyzingTrackId,
    browsingCategory,
    onEditTrack,
}) {
    const renderContent = () => {
        switch (mode) {
            case 'playlist_rotation':
                // Layout updated to match screenshot
                return (
                    <div className="grid grid-cols-12 gap-2 h-full">
                        <div className="col-span-8">
                            <PlaylistPanel />
                        </div>
                        <div className="col-span-4">
                            <AutomationControlsPanel />
                        </div>
                    </div>
                );
            
            case 'track_list':
                // NextKast Track List/Add Music: Quick access to entire audio library
                return (
                    <div className="grid grid-cols-12 gap-2 h-full">
                        <div className="col-span-8">
                            <LibraryPanel onTrackSelect={onTrackSelect} />
                        </div>
                        <div className="col-span-4">
                            <TrackEditorPanel 
                                track={selectedTrack}
                                onUpdate={onUpdateTrack}
                                onAnalyze={onAnalyzeTrack}
                                analyzingTrackId={analyzingTrackId}
                            />
                        </div>
                    </div>
                );
            
            case 'playlist_builder':
                // NextKast Playlist Builder: Create, modify, and manage playlists with drag-and-drop
                // This now renders the full-featured playlist builder component.
                return <PlaylistBuilder />;
            
            case 'live_assist':
                // NextKast Live Assist: Manual control mode for DJ operations with Voice Tracking
                return <LiveAssistPanel />;
            
            case 'voice_tracking':
                return <VoiceTrackingStudio />;

            case 'admin_login':
                // New admin login panel
                return <AdminLoginPanel />;

            case 'category_browser':
                // Render the category browser when this mode is active
                return (
                    <CategoryBrowser
                        category={browsingCategory}
                        onBack={() => { /* Navigation is handled by ModeSelection now */ }}
                        onTrackSelect={onTrackSelect}
                        onEditTrack={onEditTrack}
                    />
                );
            
            default:
                return (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Select a mode to begin</p>
                    </div>
                );
        }
    };

    return (
        <Card className="h-full bg-black border-slate-700/50 p-2">
            {renderContent()}
        </Card>
    );
}