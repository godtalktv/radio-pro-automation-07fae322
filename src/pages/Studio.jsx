
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, Track } from '@/api/entities';
import LoginForm from '../components/auth/LoginForm';
import { Loader2, Radio } from 'lucide-react';
import { InvokeLLM } from "@/api/integrations";
import { useAudio } from '../components/audio/AudioPlayer';

import TopBar from '../components/studio/TopBar';
import DecksPanel from '../components/studio/DecksPanel';
import CategoryDisplay from '../components/studio/CategoryDisplay';
import ModeSelection from '../components/studio/ModeSelection';
import MainMusicDisplay from '../components/studio/MainMusicDisplay';
import CategoryBrowser from '../components/studio/CategoryBrowser';
import CompressorPanel from '../components/audio/CompressorPanel';
import AutoSchedulerPanel from '../components/studio/AutoSchedulerPanel';
import StreamingPanel from '../components/studio/StreamingPanel';

export default function Studio() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // UI State
  const [currentView, setCurrentView] = useState('main'); // main, scheduler, streaming, etc.

  const [selectedMode, _setSelectedMode] = useState('admin_login');
  const [categoryBrowserOpen, setCategoryBrowserOpen] = useState(null); // Holds the name of the category being browsed

  const [showCompressorPanel, setShowCompressorPanel] = useState(false);

  // Data State for Editing
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [analyzingTrackId, setAnalyzingTrackId] = useState(null);

  const { reloadTracks, deckA, deckB } = useAudio();

  // Custom setSelectedMode wrapper to clear category browsing state
  const setSelectedMode = (mode) => {
    if (mode !== 'category_browser') {
        setCategoryBrowserOpen(null);
    }
    _setSelectedMode(mode);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsAuthLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setAuthError(false);
    } catch (error) {
      console.log('User not authenticated for Studio:', error);
      setAuthError(true);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuthStatus();
  };

  // Handler for updating a track from the editor
  const handleUpdateTrack = async (trackData) => {
    if (!trackData || !trackData.id) return;
    await Track.update(trackData.id, trackData);
    await reloadTracks();
    // Refresh the selected track data to show the latest updates
    const updatedTrack = await Track.get(trackData.id);
    setSelectedTrack(updatedTrack);
  };

  // Handler for AI analysis
  const handleAnalyzeTrack = async (track) => {
    if (!track || !track.id) return;
    setAnalyzingTrackId(track.id);
    try {
      const rawMetadata = await InvokeLLM({
        prompt: `Re-analyze this audio track and provide comprehensive, updated metadata for professional radio automation software.

Current Title: ${track.title}
Current Artist: ${track.artist}

Please provide the most accurate and complete information for the following fields:
1. **artist**: The primary artist's full, correct name.
2. **title**: The full, correct song title, including any featured artists if applicable.
3. **album**: The official album name.
4. **category**: A single, most appropriate category or genre (e.g., "80s Rock", "Top 40", "Station ID").
5. **copyright_year**: The 4-digit year the track's released.
6. **bpm**: The track's beats per minute (BPM).
7. **energy_level**: The overall energy, one of ["low", "medium", "high"].
8. **vocal_start_time**: The precise time in seconds when the main vocals begin (crucial for voice tracking).
9. **intro_time**: The length of the instrumental intro in seconds.
10. **outro_time**: The length of the instrumental outro in seconds.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            artist: { type: "string" },
            title: { type: "string" },
            album: { type: "string" },
            category: { type: "string" },
            copyright_year: { type: "number" },
            bpm: { type: "number" },
            energy_level: { type: "string" },
            vocal_start_time: { type: "number" },
            intro_time: { type: "number" },
            outro_time: { type: "number" },
          }
        }
      });

      const updatedTrackData = { ...track, ...rawMetadata, ai_enhanced: true };
      await handleUpdateTrack(updatedTrackData);

    } catch (error) {
      console.error("AI metadata analysis failed:", error);
      alert("Failed to analyze track. Please check the console for more details.");
    } finally {
      setAnalyzingTrackId(null);
    }
  };

  const handleCategoryBrowse = (categoryName) => {
    setCategoryBrowserOpen(categoryName);
    setSelectedMode('category_browser');
  };

  const handleEditFromCategoryBrowser = (track) => {
    setSelectedTrack(track);
    setSelectedMode('track_list'); // Switch to the track editor view
  };

  // Set selected track based on which deck is playing
  useEffect(() => {
    if (deckA.isPlaying) {
        setSelectedTrack(deckA.track);
    } else if (deckB.isPlaying) {
        setSelectedTrack(deckB.track);
    }
  }, [deckA.isPlaying, deckA.track, deckB.isPlaying, deckB.track]);


  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Radio className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="mb-4">
            <h1 className="2xl font-bold text-white mb-2">RadioPro Studio</h1>
            <p className="text-blue-400 font-semibold">Developed by a Radio Broadcaster</p>
            <p className="text-slate-300">Makes it Easy to Create the BEST possible Online Radio Station!</p>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
          <p className="text-slate-400">Loading Professional Broadcasting Suite...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // The categoryBrowserOpen conditional render block is removed from here.
  // The CategoryBrowser component will now be managed by MainMusicDisplay.

  if (currentView !== 'main') {
    if (currentView === 'scheduler') {
      return (
          <div className="h-screen w-full bg-slate-900 text-slate-200 flex flex-col font-sans relative">
              <div className="absolute inset-0 z-10 p-4 flex items-center justify-center">
                   <AutoSchedulerPanel onBack={() => setCurrentView('main')} />
              </div>
              <div className="blur-sm pointer-events-none">
                   <TopBar onViewChange={() => {}} currentView={'main'} />
                    <div className="flex-shrink-0 p-2"> <DecksPanel /> </div>
                    <div className="flex-1 grid grid-cols-12 gap-2 p-2 pt-0 min-h-0">
                      <div className="col-span-7"><div className="h-full bg-slate-800/50 rounded-lg" /></div>
                      <div className="col-span-5"><div className="h-full bg-slate-800/50 rounded-lg" /></div>
                   </div>
              </div>
          </div>
      );
    }
    if (currentView === 'streaming') {
      return (
          <div className="h-screen w-full bg-slate-900 text-slate-200 flex flex-col font-sans relative">
              <div className="absolute inset-0 z-10">
                   <StreamingPanel onClose={() => setCurrentView('main')} />
              </div>
              <div className="blur-sm pointer-events-none">
                   <TopBar onViewChange={() => {}} currentView={'main'} />
                    <div className="flex-shrink-0 p-2"> <DecksPanel /> </div>
                    <div className="flex-1 grid grid-cols-12 gap-2 p-2 pt-0 min-h-0">
                      <div className="col-span-7"><div className="h-full bg-slate-800/50 rounded-lg" /></div>
                      <div className="col-span-5"><div className="h-full bg-slate-800/50 rounded-lg" /></div>
                   </div>
              </div>
          </div>
      );
    }
    return <div>Unhandled view: {currentView}</div>;
  }

  return (
    <div className="h-screen w-full bg-slate-900 text-slate-200 flex flex-col font-sans overflow-hidden">
      {/* Section 1: Top Section - Main program setup and control buttons */}
      <div className="flex-shrink-0">
        <TopBar
            onViewChange={setCurrentView}
            currentView={currentView}
            onCompressorClick={() => setShowCompressorPanel(true)}
            user={user}
            onLoginSuccess={handleLoginSuccess}
        />
      </div>

      {/* Section 2: Virtual CD Players - Much larger height to show all controls */}
      <div className="flex-shrink-0 p-2">
        <div className="h-40">
          <DecksPanel />
        </div>
      </div>

      {/* Section 3: Category Display Area - Now positioned well below players */}
      {selectedMode !== 'category_browser' && (
        <div className="flex-shrink-0 px-2 pb-2">
          <div className="h-12">
            <CategoryDisplay
              onCategoryBrowse={handleCategoryBrowse}
            />
          </div>
        </div>
      )}

      {/* Section 4: Main Music Display Area - Adjusts to remaining space */}
      <div className="flex-1 px-2 pb-2 min-h-0">
        <MainMusicDisplay
          mode={selectedMode}
          selectedTrack={selectedTrack}
          onTrackSelect={setSelectedTrack}
          onUpdateTrack={handleUpdateTrack}
          onAnalyzeTrack={handleAnalyzeTrack}
          analyzingTrackId={analyzingTrackId}
          browsingCategory={categoryBrowserOpen}
          onEditTrack={handleEditFromCategoryBrowser}
        />
      </div>

      {/* Section 5: Mode Selection Bars - BOTTOM position like NextKast */}
      <div className="flex-shrink-0 p-2 pt-0">
        <div className="h-10">
          <ModeSelection selectedMode={selectedMode} onModeChange={setSelectedMode} />
        </div>
      </div>

      {/* Render Compressor Panel when toggled */}
      {showCompressorPanel && (
        <CompressorPanel onClose={() => setShowCompressorPanel(false)} />
      )}
    </div>
  );
}
