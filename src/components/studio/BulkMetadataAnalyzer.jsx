
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Track } from '@/api/entities';
import { InvokeLLM } from "@/api/integrations";
import { musicBeeApi } from '@/api/functions';
import { getCoverArt } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea import
import { useCustomization } from '../settings/CustomizationProvider'; // Added useCustomization import
import { 
  Sparkles,
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Play,
  Pause,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export default function BulkMetadataAnalyzer({ onClose }) {
  const [analysisType, setAnalysisType] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentArtUrl, setCurrentArtUrl] = useState(null);
  const [results, setResults] = useState({ success: 0, failed: 0, skipped: 0 });
  const [logs, setLogs] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [processedTracks, setProcessedTracks] = useState([]);
  const { toast } = useToast();
  const { settings } = useCustomization(); // Destructure settings from useCustomization
  const stationLogoUrl = settings?.logo_url; // Get stationLogoUrl

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{ message, type, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 99)]);
  };

  const loadTracksToProcess = async () => {
    try {
      addLog('Fetching all music tracks from the library...');
      const allTracks = await Track.list('-created_date', 10000);
      let tracksToProcess;

      if (analysisType === 'art') {
        tracksToProcess = allTracks.filter(t => t.track_type === 'music' && !t.album_art_url);
        addLog(`Found ${tracksToProcess.length} tracks needing album art.`);
      } else {
        tracksToProcess = allTracks.filter(t => t.track_type === 'music' && !t.ai_enhanced);
        addLog(`Found ${tracksToProcess.length} un-analyzed music tracks.`);
      }
      
      setTracks(tracksToProcess);
      return tracksToProcess;
    } catch (error) {
      addLog(`Failed to load tracks: ${error.message}`, 'error');
      return [];
    }
  };

  const validateImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  };

  const analyzeFullMetadata = async (track) => {
    const result = await InvokeLLM({
      prompt: `Analyze this audio track and provide comprehensive metadata for professional radio automation software.

Current Title: ${track.title}
Current Artist: ${track.artist}
Current Album: ${track.album || ''}

Please provide the most accurate and complete information for the following fields:
1. **bpm**: The track's beats per minute (BPM) as a number.
2. **energy_level**: The overall energy, one of ["low", "medium", "high"].
3. **category**: A single, most appropriate genre (e.g., "80s Rock", "Top 40", "Country").
4. **intro_time**: The length of the instrumental intro in seconds (number).
5. **outro_time**: The length of the instrumental outro in seconds (number).
6. **vocal_start_time**: The precise time in seconds when the main vocals begin (number).
7. **copyright_year**: The 4-digit year of release as a number.
8. **description**: A brief description suitable for radio programming.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          bpm: { type: "number" },
          energy_level: { type: "string", enum: ["low", "medium", "high"] },
          category: { type: "string" },
          intro_time: { type: "number" },
          outro_time: { type: "number" },
          vocal_start_time: { type: "number" },
          copyright_year: { type: "number" },
          description: { type: "string" }
        }
      }
    });
    return result;
  };

  const searchForAlbumArt = async (track) => {
    try {
      // First try MusicBee API
      try {
        const { data } = await musicBeeApi({ 
          artist: track.artist, 
          title: track.title, 
          album: track.album 
        });
        
        if (data?.found && data.metadata?.album_art_url) {
          const isValid = await validateImageUrl(data.metadata.album_art_url);
          if (isValid) {
            addLog(`✓ Found MusicBee art for "${track.title}"`, 'success');
            return data.metadata.album_art_url;
          }
        }
      } catch (error) {
        addLog(`MusicBee API failed for "${track.title}": ${error.message}`, 'warning');
      }

      // Try MusicBrainz if we have an ID
      if (track.musicbrainz_release_id) {
        try {
          const { data } = await getCoverArt({ mbid: track.musicbrainz_release_id });
          if (data?.images?.length > 0) {
            const frontImage = data.images.find(img => img.front);
            const imageUrl = frontImage?.thumbnails?.large || frontImage?.image || data.images[0]?.thumbnails?.large || data.images[0]?.image;
            if (imageUrl) {
              const isValid = await validateImageUrl(imageUrl);
              if (isValid) {
                addLog(`✓ Found MusicBrainz art for "${track.title}"`, 'success');
                return imageUrl;
              }
            }
          }
        } catch (error) {
          addLog(`MusicBrainz lookup failed for "${track.title}": ${error.message}`, 'warning');
        }
      }

      // Fallback to AI search
      const result = await InvokeLLM({
        prompt: `Find official album artwork for "${track.title}" by "${track.artist}"${track.album ? ` from album "${track.album}"` : ''}. Search for high-quality images from music databases, official sources, or streaming services. Return only direct image URLs.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            image_urls: {
              type: "array",
              items: { type: "string" },
              description: "Array of direct URLs to album art images"
            },
            primary_url: {
              type: "string",
              description: "The best/primary album art URL"
            }
          }
        }
      });

      if (result) {
        // Try primary URL first
        if (result.primary_url?.startsWith('http')) {
          const isValid = await validateImageUrl(result.primary_url);
          if (isValid) {
            addLog(`✓ Found AI art (primary) for "${track.title}"`, 'success');
            return result.primary_url;
          }
        }

        // Try other URLs
        if (result.image_urls?.length > 0) {
          for (const url of result.image_urls) {
            if (url?.startsWith('http')) {
              const isValid = await validateImageUrl(url);
              if (isValid) {
                addLog(`✓ Found AI art for "${track.title}"`, 'success');
                return url;
              }
            }
          }
        }
      }

      return null;
    } catch (error) {
      addLog(`Art search failed for "${track.title}": ${error.message}`, 'error');
      return null;
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setIsPaused(false);
    setProgress(0);
    setResults({ success: 0, failed: 0, skipped: 0 });
    setLogs([]);
    setProcessedTracks([]);

    const tracksToProcess = await loadTracksToProcess();
    if (tracksToProcess.length === 0) {
      addLog('No tracks match the criteria for analysis.', 'info');
      setIsAnalyzing(false);
      return;
    }

    for (let i = 0; i < tracksToProcess.length; i++) {
      if (!isAnalyzing || isPaused) break;

      const track = tracksToProcess[i];
      setCurrentTrack(track);
      setCurrentArtUrl(null);
      setProgress(Math.round(((i + 1) / tracksToProcess.length) * 100));
      
      let updates = {};
      let success = false;
      let foundArt = null;
      let trackStatus = 'failed'; // Default status for processed track

      try {
        if (analysisType === 'art' || analysisType === 'all') {
          addLog(`🎨 Searching for album art for "${track.title}"...`);
          foundArt = await searchForAlbumArt(track);
          if (foundArt) {
            updates.album_art_url = foundArt;
            setCurrentArtUrl(foundArt);
            success = true; // Mark as success if art found, or if metadata also succeeds
          }
        }

        if (analysisType === 'metadata' || analysisType === 'all') {
          addLog(`🔍 Analyzing metadata for "${track.title}"...`);
          const metadata = await analyzeFullMetadata(track);
          if (metadata) {
            updates = { ...updates, ...metadata, ai_enhanced: true };
            success = true; // Mark as success if metadata found, or if art also succeeds
          }
        }
        
        if (success) {
          await Track.update(track.id, updates);
          addLog(`✅ Successfully updated "${track.title}"`, 'success');
          setResults(prev => ({ ...prev, success: prev.success + 1 }));
          trackStatus = 'success';
        } else {
          addLog(`❌ Analysis failed for "${track.title}"`, 'error');
          setResults(prev => ({ ...prev, failed: prev.failed + 1 }));
          trackStatus = 'failed';
        }

      } catch (err) {
        addLog(`💥 Critical error on "${track.title}": ${err.message}`, 'error');
        setResults(prev => ({ ...prev, failed: prev.failed + 1 }));
        trackStatus = 'failed';
      }
      
      // Add to processed tracks for display with status
      setProcessedTracks(prev => [...prev, {
        ...track,
        ...updates,
        processed_at: new Date().toISOString(),
        status: trackStatus 
      }]);

      // Prevent overwhelming the APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if (!isPaused) {
      setIsAnalyzing(false);
      setCurrentTrack(null);
      setCurrentArtUrl(null);
      addLog('🎉 Bulk analysis complete!', 'success');
      toast({ title: "Analysis Complete", description: `Processed ${tracksToProcess.length} tracks. Success: ${results.success}, Failed: ${results.failed}` });
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    if (!isPaused) {
      addLog('⏸️ Analysis paused.', 'warning');
    } else {
      addLog('▶️ Resuming analysis...');
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setIsPaused(false);
    setCurrentTrack(null);
    setCurrentArtUrl(null);
    addLog('🛑 Analysis stopped by user.', 'warning');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-4xl h-[90vh] bg-slate-900/80 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-xl font-bold text-white">Bulk AI Metadata Analyzer</CardTitle>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-hidden">
          {/* Left Column: Controls & Progress */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Analysis Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={analysisType} onValueChange={setAnalysisType} disabled={isAnalyzing}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="r_all" />
                    <Label htmlFor="r_all" className="text-slate-300">Full Analysis (Art & Metadata)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metadata" id="r_meta" />
                    <Label htmlFor="r_meta" className="text-slate-300">Metadata Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="art" id="r_art" />
                    <Label htmlFor="r_art" className="text-slate-300">Album Art Only</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={startAnalysis} disabled={isAnalyzing} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                  <Play className="w-5 h-5 mr-2" /> Start Analysis
                </Button>
                <div className="flex gap-2">
                  <Button onClick={togglePause} disabled={!isAnalyzing} className="flex-1 h-10">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button onClick={stopAnalysis} disabled={!isAnalyzing} variant="destructive" className="flex-1 h-10">
                    <X className="w-4 h-4 mr-2" /> Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Currently Analyzing */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-white">Currently Analyzing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {currentTrack ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                      {currentArtUrl ? (
                        <img src={currentArtUrl} alt="Found Art" className="w-full h-full object-cover" />
                      ) : stationLogoUrl ? ( // Station logo fallback
                        <img src={stationLogoUrl} alt="Station Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-full h-full text-slate-600 p-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{currentTrack.title}</p>
                      <p className="text-slate-400 text-sm truncate">{currentTrack.artist}</p>
                      <Progress value={progress} className="w-full mt-2 h-2" />
                      <p className="text-slate-300 text-sm mt-1">{progress}% Complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6">
                    <p>Waiting to start analysis...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isAnalyzing && (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Results Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Badge className="bg-green-500/20 text-green-300 w-full justify-center">{results.success}</Badge>
                      <p className="text-xs text-slate-400 mt-1">Success</p>
                    </div>
                    <div>
                      <Badge className="bg-red-500/20 text-red-300 w-full justify-center">{results.failed}</Badge>
                      <p className="text-xs text-slate-400 mt-1">Failed</p>
                    </div>
                    <div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 w-full justify-center">{results.skipped}</Badge>
                      <p className="text-xs text-slate-400 mt-1">Skipped</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column: Logs & Processed Tracks */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <h3 className="text-lg font-semibold text-white">Analysis Log</h3>
            <div className="flex-1 bg-black/50 rounded-lg overflow-hidden"> {/* Changed overflow-y-auto to overflow-hidden for ScrollArea */}
              <ScrollArea className="h-full p-3">
                {logs.length === 0 && <p className="text-slate-500 text-center py-8">Log is empty.</p>}
                {logs.map((log, index) => (
                  <div key={index} className={`text-xs mb-2 flex gap-2 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    <span className="font-mono text-slate-500 flex-shrink-0">{log.timestamp}</span>
                    <span className="flex-1 break-words">{log.message}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
            
            <h3 className="text-lg font-semibold text-white">Processed Tracks</h3>
            <div className="flex-1 bg-black/50 rounded-lg overflow-hidden"> {/* Changed overflow-y-auto to overflow-hidden for ScrollArea */}
              <ScrollArea className="h-full p-3">
                 {processedTracks.length === 0 && <p className="text-slate-500 text-center py-8">No tracks processed yet.</p>}
                 {processedTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/50">
                    <div className="w-10 h-10 bg-slate-800 rounded-md flex-shrink-0 overflow-hidden">
                      {track.album_art_url ? (
                        <img src={track.album_art_url} alt="Art" className="w-full h-full object-cover" />
                      ) : stationLogoUrl ? ( // Station logo fallback
                        <img src={stationLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImageIcon className="w-full h-full text-slate-600 p-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{track.title}</p>
                      <p className="text-slate-400 text-xs truncate">{track.artist}</p>
                    </div>
                    {track.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    {track.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    {track.status === 'skipped' && <X className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  </div>
                 ))}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
