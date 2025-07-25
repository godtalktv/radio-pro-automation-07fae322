
import React, { useState, useEffect } from "react";
import { Track } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Plus, Search, Upload, Info, HardDrive } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { useAudio } from "../components/audio/AudioPlayer";
import { googleOauthStart } from '@/api/functions';
import GoogleOauthPreflightCheck from '../components/library/GoogleOauthPreflightCheck'; // Import the new component

import TrackList from "../components/library/TrackList";
import TrackForm from "../components/library/TrackForm";
import FileUploader from "../components/library/FileUploader";
import GoogleDriveBrowser from "../components/library/GoogleDriveBrowser";

export default function Library() {
  // Use the global state from AudioService instead of local state
  const { allTracks, isLoading, reloadTracks, deleteTrack } = useAudio();

  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showDriveBrowser, setShowDriveBrowser] = useState(false);
  const [showPreflightCheck, setShowPreflightCheck] = useState(false); // New state for the modal
  const [editingTrack, setEditingTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [analyzingTrackId, setAnalyzingTrackId] = useState(null);

  const expectedRedirectUri = "https://preview--radio-pro-automation-07fae322.base44.app/functions/googleOauthCallback";

  // The useEffect and loadTracks functions are no longer needed here.
  // The AudioService handles the initial data load.

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
        } catch (e) {
            console.error("User not logged in or error fetching user:", e);
        }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (trackData) => {
    if (editingTrack) {
      await Track.update(editingTrack.id, trackData);
    } else {
      await Track.create(trackData);
    }
    setShowForm(false);
    setEditingTrack(null);
    await reloadTracks(); // Use the service to reload data globally
  };

  const handleEdit = (track) => {
    setEditingTrack(track);
    setShowForm(true);
  };

  const handleDelete = async (trackId) => {
    await deleteTrack(trackId); // Use the service to delete the track
  };
  
  const handleConnectGoogleDrive = async () => {
    // This function now just opens the pre-flight check modal
    setShowPreflightCheck(true);
  };
  
  const proceedWithGoogleConnection = async () => {
    // The actual connection logic is moved here
    setShowPreflightCheck(false); // Close the modal
    try {
        const { data } = await googleOauthStart();
        if (data.url) {
            window.location.href = data.url;
        } else {
             alert(`Could not get OAuth URL. Error: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        alert("Could not start Google Drive connection process.");
        console.error(error);
    }
  };

  const handleUploadComplete = async () => {
    setShowUploader(false);
    setShowDriveBrowser(false); // Close GoogleDriveBrowser as well
    await reloadTracks();
  };

  const handleAnalyzeTrack = async (track) => {
    setAnalyzingTrackId(track.id);
    try {
      const rawMetadata = await InvokeLLM({
        prompt: `Re-analyze this audio track and provide comprehensive, updated metadata:

Current Title: ${track.title}
Current Artist: ${track.artist}
Album: ${track.album}
Duration: ${track.duration} seconds

Please search online and provide the most accurate and complete information for the following:
1. Complete and accurate artist name
2. Full song title (corrected if needed)
3. Album name and release year
4. Accurate genre classification from the available list
5. BPM (beats per minute) estimate
6. Energy level (low/medium/high)
7. A brief, engaging description for radio programming (2-3 sentences)
8. A list of 3-5 relevant tags for categorization
9. Whether the content might be explicit
10. Intro and outro timing estimates in seconds

If this is a jingle, station ID, or commercial, please classify the genre appropriately.
Use your knowledge to fill in missing information and correct any errors. Your goal is to provide production-ready metadata.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Complete song title" },
            artist: { type: "string", description: "Artist or creator name" },
            album: { type: "string", description: "Album name" },
            genre: { 
              type: "string", 
              enum: ["rock", "pop", "jazz", "classical", "electronic", "hip_hop", "country", "blues", "folk", "alternative", "reggae", "punk", "metal", "r_and_b", "soul", "funk", "disco", "house", "techno", "ambient", "world", "latin", "soundtrack", "spoken_word", "news", "commercial", "jingle", "station_id"],
              description: "Music genre or content type"
            },
            bpm: { type: "number", description: "Beats per minute estimate" },
            energy_level: { 
              type: "string", 
              enum: ["low", "medium", "high"],
              description: "Energy level for radio programming"
            },
            year: { type: "number", description: "Release year" },
            description: { type: "string", description: "Brief description for radio use" },
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Relevant tags for categorization"
            },
            explicit: { type: "boolean", description: "Contains explicit content" },
            intro_time: { type: "number", description: "Intro length in seconds estimate" },
            outro_time: { type: "number", description: "Outro length in seconds estimate" },
            confidence: { type: "string", description: "How confident you are in this metadata (high/medium/low)" }
          }
        }
      });

      // --- FIX: Sanitize AI output to prevent validation errors ---
      const enhancedMetadata = {
          ...rawMetadata,
          bpm: Array.isArray(rawMetadata.bpm) ? rawMetadata.bpm[0] : rawMetadata.bpm,
          year: Array.isArray(rawMetadata.year) ? rawMetadata.year[0] : rawMetadata.year,
          intro_time: Array.isArray(rawMetadata.intro_time) ? rawMetadata.intro_time[0] : rawMetadata.intro_time,
          outro_time: Array.isArray(rawMetadata.outro_time) ? rawMetadata.outro_time[0] : rawMetadata.outro_time,
      };

      const trackData = {
        ...track, // Keep existing data
        ...enhancedMetadata, // Overwrite with new AI data
        ai_enhanced: true,
        ai_confidence: enhancedMetadata.confidence || "high"
      };

      await Track.update(track.id, trackData);
      await reloadTracks(); // Use the service to reload data globally

    } catch (error) {
      console.error("AI metadata analysis failed:", error);
      alert("Failed to analyze track. Please check the console for more details.");
    } finally {
      setAnalyzingTrackId(null);
    }
  };

  const filteredTracks = (allTracks || []).filter(track => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = track.title?.toLowerCase().includes(searchLower);
    const artistMatch = track.artist?.toLowerCase().includes(searchLower);
    const matchesSearch = titleMatch || artistMatch;
    const matchesGenre = selectedGenre === "all" || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <GoogleOauthPreflightCheck
        open={showPreflightCheck}
        onClose={() => setShowPreflightCheck(false)}
        onProceed={proceedWithGoogleConnection}
        expectedRedirectUri={expectedRedirectUri} // Pass the redirect URI to the modal
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Music Library</h1>
            <p className="text-slate-400">Manage your audio content and tracks</p>
          </div>
          <div className="flex gap-3">
            {user?.google_drive_connected ? (
                 <Button 
                    onClick={() => setShowDriveBrowser(true)}
                    variant="outline"
                    className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
                 >
                    <HardDrive className="w-5 h-5 mr-2" />
                    Browse Drive
                 </Button>
            ) : (
                <Button onClick={handleConnectGoogleDrive} variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-600/40">
                    <HardDrive className="w-5 h-5 mr-2" />
                    Connect Google Drive
                </Button>
            )}
            <Button 
              onClick={() => setShowUploader(!showUploader)}
              variant="outline"
              className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Audio
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Track
            </Button>
          </div>
        </div>
        
        {/* The Google Drive Setup info box is now ideally handled by GoogleOauthPreflightCheck component directly, 
            but keeping it here for now as per "keep existing code" until explicitly told to remove.
            If the PreflightCheck component displays this, this section below can be removed. */}
        {!user?.google_drive_connected && (
            <div className="flex items-start gap-3 text-sm text-yellow-300 mb-6 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
              <Info className="w-5 h-5 mt-0.5 text-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Google Drive Setup</h4>
                <p className="text-yellow-200/90">
                  To connect, ensure this exact URL is in your Google Cloud "Authorized redirect URIs" list.
                </p>
                <div className="mt-2 p-2 bg-slate-900/50 rounded-md font-mono text-xs text-slate-100 select-all">
                  {expectedRedirectUri}
                </div>
              </div>
            </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 p-3 bg-slate-900/50 border border-slate-800/50 rounded-lg">
          <Info className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span>
            <strong>💾 Your Storage = Best Results:</strong> Upload your music to Google Drive, Dropbox, or your own server for reliable playback. 
            The system works best with direct links to your own audio files where you control access and quality.
          </span>
        </div>

        {showUploader && (
          <FileUploader
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploader(false)}
            category="Music"
          />
        )}

        {showDriveBrowser && user?.google_drive_connected && (
            <GoogleDriveBrowser 
                onClose={() => setShowDriveBrowser(false)}
                onImportComplete={handleUploadComplete}
                category="Music"
            />
        )}

        {showForm && (
          <TrackForm
            track={editingTrack}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTrack(null);
            }}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tracks, artists..."
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-white"
          >
            <option value="all">All Genres</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
            <option value="electronic">Electronic</option>
            <option value="hip_hop">Hip Hop</option>
            <option value="classical">Classical</option>
          </select>
        </div>

        <TrackList 
          tracks={filteredTracks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          onAnalyze={handleAnalyzeTrack}
          analyzingTrackId={analyzingTrackId}
        />
      </div>
    </div>
  );
}
