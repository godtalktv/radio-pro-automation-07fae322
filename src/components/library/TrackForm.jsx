
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Save, XCircle } from "lucide-react";

const GENRES = [
  'rock', 'pop', 'jazz', 'classical', 'electronic', 'hip_hop', 
  'country', 'blues', 'folk', 'alternative', 'reggae', 'punk', 
  'metal', 'r_and_b', 'soul', 'funk', 'disco', 'house', 'techno', 
  'ambient', 'world', 'latin', 'soundtrack', 'spoken_word', 'news', 
  'commercial', 'jingle', 'station_id'
];

export default function TrackForm({ track, onSubmit, onCancel }) {
  const [currentTrack, setCurrentTrack] = useState(track || {
    title: "",
    artist: "",
    album: "",
    track_type: "music",
    duration: 0,
    genre: "pop",
    bpm: 0,
    energy_level: "medium",
    file_url: "", // This will now be a direct streaming URL
    intro_time: 0,
    vocal_start_time: 0,
    outro_time: 0,
    explicit: false,
    tags: []
  });

  const [newTag, setNewTag] = useState("");
  const [linkInputType, setLinkInputType] = useState("direct"); // "direct" or "google_drive"
  const [googleDriveLink, setGoogleDriveLink] = useState("");

  useEffect(() => {
    // When a new track is loaded for editing, determine the input type
    if (track?.file_url) {
        if (track.file_url.includes('drive.google.com/uc?export=download')) {
            // This is a converted link. We can't easily reverse it to a shareable link.
            // For simplicity, we'll keep it as a direct URL for editing.
            setLinkInputType('direct');
            setGoogleDriveLink('');
        } else {
            setLinkInputType('direct');
            setGoogleDriveLink('');
        }
    } else {
        // Default for new tracks
        setLinkInputType('direct');
        setGoogleDriveLink(''); // Ensure Google Drive link is cleared for new tracks
    }
    // Also, if editing an existing track, set the currentTrack state
    if (track) {
        setCurrentTrack(track);
    } else {
        // If adding a new track, ensure currentTrack is reset
        setCurrentTrack({
            title: "",
            artist: "",
            album: "",
            track_type: "music",
            duration: 0,
            genre: "pop",
            bpm: 0,
            energy_level: "medium",
            file_url: "",
            intro_time: 0,
            vocal_start_time: 0,
            outro_time: 0,
            explicit: false,
            tags: []
        });
    }
  }, [track]);

  const convertGoogleDriveLink = (link) => {
    // Convert Google Drive share link to direct download link
    try {
      const fileIdMatch = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      
      // If already a direct link (e.g., was previously converted) or different format, return as-is
      return link;
    } catch (error) {
      console.warn("Could not convert Google Drive link:", error);
      return link;
    }
  };

  const handleGoogleDriveLinkChange = (value) => {
    setGoogleDriveLink(value);
    // Do NOT update currentTrack.file_url here. It's handled at submission.
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalFileUrl = currentTrack.file_url;

    // If Google Drive mode is active, the final URL is the converted GDrive link
    if (linkInputType === "google_drive" && googleDriveLink) {
      finalFileUrl = convertGoogleDriveLink(googleDriveLink);
    }
    // If direct mode, currentTrack.file_url is already what the user typed in the direct input.

    onSubmit({
      ...currentTrack,
      file_url: finalFileUrl
    });
  };

  const addTag = () => {
    if (newTag.trim() && !currentTrack.tags?.includes(newTag.trim())) {
      setCurrentTrack(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setCurrentTrack(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-8">
      <CardHeader>
        <CardTitle className="text-white">
          {track ? 'Edit Track' : 'Add New Track'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Title *</Label>
              <Input
                value={currentTrack.title}
                onChange={(e) => setCurrentTrack({...currentTrack, title: e.target.value})}
                placeholder="Song title"
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Artist</Label>
              <Input
                value={currentTrack.artist}
                onChange={(e) => setCurrentTrack({...currentTrack, artist: e.target.value})}
                placeholder="Artist name"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Album</Label>
              <Input
                value={currentTrack.album}
                onChange={(e) => setCurrentTrack({...currentTrack, album: e.target.value})}
                placeholder="Album name"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Track Type *</Label>
              <Select
                value={currentTrack.track_type}
                onValueChange={(value) => setCurrentTrack({...currentTrack, track_type: value})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select track type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="station_id">Station ID</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-300">Audio Source *</Label>
            
            {/* Link Type Selector */}
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant={linkInputType === "direct" ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkInputType("direct")}
                className={linkInputType === "direct" ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"}
              >
                Direct URL
              </Button>
              <Button
                type="button"
                variant={linkInputType === "google_drive" ? "default" : "outline"}
                size="sm"
                onClick={() => setLinkInputType("google_drive")}
                className={linkInputType === "google_drive" ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"}
              >
                Google Drive Link
              </Button>
            </div>

            {linkInputType === "direct" ? (
              <>
                <Input
                  value={currentTrack.file_url || ''}
                  onChange={(e) => setCurrentTrack({...currentTrack, file_url: e.target.value})}
                  placeholder="https://your-storage.com/audio.mp3"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  required={linkInputType === 'direct'}
                />
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-300 text-xs mb-2">
                    <strong>✅ Best Options for Your Storage:</strong>
                  </p>
                  <div className="text-xs text-green-200/80 space-y-1">
                    <p><strong>Google Drive:</strong> Share link → Replace "view" with "uc"</p>
                    <p><strong>Dropbox:</strong> Share link → Change "dl=0" to "dl=1"</p>
                    <p><strong>Your Server:</strong> Direct link to MP3/MP4 file</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Input
                  value={googleDriveLink}
                  onChange={(e) => handleGoogleDriveLinkChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1ABC123DEF456/view?usp=sharing"
                  className="bg-slate-800/50 border-slate-700/50 text-white"
                  required={linkInputType === 'google_drive'}
                />
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-xs mb-2">
                    <strong>🔗 Google Drive Instructions:</strong>
                  </p>
                  <div className="text-xs text-blue-200/80 space-y-1">
                    <p>1. Upload your audio file to Google Drive</p>
                    <p>2. Right-click the file → "Get link"</p>
                    <p>3. Set to "Anyone with the link can view"</p>
                    <p>4. Paste the full Google Drive link here</p>
                  </div>
                </div>
                
                {googleDriveLink && (
                  <div className="p-2 bg-slate-800/50 rounded border border-slate-600">
                    <p className="text-xs text-slate-400 mb-1">Converted Direct URL (for submission):</p>
                    <p className="text-xs text-slate-300 font-mono break-all">{convertGoogleDriveLink(googleDriveLink)}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Duration (seconds) *</Label>
              <Input
                type="number"
                value={currentTrack.duration}
                onChange={(e) => setCurrentTrack({...currentTrack, duration: parseInt(e.target.value) || 0})}
                placeholder="240"
                className="bg-slate-800/50 border-slate-700/50 text-white"
                required
              />
              {currentTrack.duration > 0 && (
                <p className="text-xs text-slate-500">
                  {formatDuration(currentTrack.duration)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">BPM</Label>
              <Input
                type="number"
                value={currentTrack.bpm}
                onChange={(e) => setCurrentTrack({...currentTrack, bpm: parseInt(e.target.value) || 0})}
                placeholder="120"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Intro (seconds)</Label>
              <Input
                type="number"
                value={currentTrack.intro_time}
                onChange={(e) => setCurrentTrack({...currentTrack, intro_time: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Vocal Start (sec)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentTrack.vocal_start_time || ''}
                onChange={(e) => setCurrentTrack({...currentTrack, vocal_start_time: parseFloat(e.target.value) || 0})}
                placeholder="15.5"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Outro (seconds)</Label>
              <Input
                type="number"
                value={currentTrack.outro_time}
                onChange={(e) => setCurrentTrack({...currentTrack, outro_time: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="bg-slate-800/50 border-slate-700/50 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Genre *</Label>
              <Select 
                value={currentTrack.genre}
                onValueChange={(value) => setCurrentTrack({...currentTrack, genre: value})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Energy Level</Label>
              <Select 
                value={currentTrack.energy_level}
                onValueChange={(value) => setCurrentTrack({...currentTrack, energy_level: value})}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-300">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="bg-slate-800/50 border-slate-700/50 text-white"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentTrack.tags?.map(tag => (
                <Badge
                  key={tag}
                  className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="explicit"
              checked={currentTrack.explicit}
              onCheckedChange={(checked) => setCurrentTrack({...currentTrack, explicit: checked})}
            />
            <Label htmlFor="explicit" className="text-slate-300">
              Contains explicit content
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {track ? 'Update Track' : 'Add Track'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
