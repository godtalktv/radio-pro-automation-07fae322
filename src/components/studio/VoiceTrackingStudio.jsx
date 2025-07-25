
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Track } from "@/api/entities";
import { User } from '@/api/entities';
import { useAudio } from '../audio/AudioPlayer';
import { UploadFile } from "@/api/integrations";
import { 
    Mic, 
    Play, 
    Pause, 
    Square, 
    Save, 
    Upload, 
    Volume2, 
    Music, 
    Radio,
    Clock,
    FileAudio,
    Settings,
    Headphones
} from 'lucide-react';

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VoiceTrackingStudio() {
    const { allTracks, isMicOn, toggleMic } = useAudio();
    const [isRecording, setIsRecording] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedBedTrack, setSelectedBedTrack] = useState(null);
    const [bedVolume, setBedVolume] = useState([30]);
    const [micLevel, setMicLevel] = useState([80]);
    const [voiceTrackTitle, setVoiceTrackTitle] = useState('');
    const [voiceTrackNotes, setVoiceTrackNotes] = useState('');
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [voiceTracks, setVoiceTracks] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const previewAudioRef = useRef(null);
    const bedAudioRef = useRef(null);

    useEffect(() => {
        loadVoiceTracks();
        return () => {
            // Cleanup
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    const loadVoiceTracks = async () => {
        try {
            const tracks = await Track.filter({ track_type: 'voice_track' });
            setVoiceTracks(tracks);
        } catch (error) {
            console.error('Failed to load voice tracks:', error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setRecordedBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start bed track if selected
            if (selectedBedTrack && bedAudioRef.current) {
                bedAudioRef.current.volume = bedVolume[0] / 100;
                bedAudioRef.current.play();
            }
            
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            
            // Stop bed track
            if (bedAudioRef.current) {
                bedAudioRef.current.pause();
                bedAudioRef.current.currentTime = 0;
            }
        }
    };

    const playPreview = () => {
        if (recordedBlob && !isPreviewing) {
            const audioUrl = URL.createObjectURL(recordedBlob);
            previewAudioRef.current.src = audioUrl;
            previewAudioRef.current.play();
            setIsPreviewing(true);
            
            previewAudioRef.current.onended = () => {
                setIsPreviewing(false);
                URL.revokeObjectURL(audioUrl);
            };
        } else if (isPreviewing) {
            previewAudioRef.current.pause();
            setIsPreviewing(false);
        }
    };

    const saveVoiceTrack = async () => {
        if (!recordedBlob || !voiceTrackTitle.trim()) {
            alert('Please record audio and enter a title');
            return;
        }

        setIsUploading(true);
        try {
            const user = await User.me();
            
            // Upload audio file
            const uploadResult = await UploadFile({ file: recordedBlob });
            
            // Create voice track record
            const voiceTrackData = {
                organization_id: user.organization_id,
                title: voiceTrackTitle.trim(),
                artist: 'Voice Track',
                track_type: 'voice_track',
                duration: recordingTime,
                file_url: uploadResult.file_url,
                category: 'Voice Tracks',
                description: voiceTrackNotes.trim() || 'Voice tracking segment',
                tags: ['voice_track', 'recorded']
            };

            await Track.create(voiceTrackData);
            
            // Reset form
            setVoiceTrackTitle('');
            setVoiceTrackNotes('');
            setRecordedBlob(null);
            setRecordingTime(0);
            
            // Reload voice tracks
            await loadVoiceTracks();
            
            alert('Voice track saved successfully!');
        } catch (error) {
            console.error('Failed to save voice track:', error);
            alert('Failed to save voice track. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const bedTracks = allTracks.filter(track => 
        track.track_type === 'music' && 
        (track.category?.toLowerCase().includes('bed') || 
         track.category?.toLowerCase().includes('instrumental') ||
         track.energy_level === 'low')
    );

    return (
        <div className="h-full grid grid-cols-12 gap-2">
            {/* Left Panel - Recording Controls */}
            <div className="col-span-4 space-y-2">
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Radio className="w-5 h-5 text-purple-400" />
                            Voice Recording Studio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Recording Status */}
                        <div className="text-center p-4 bg-black/30 rounded-lg">
                            <div className={`text-4xl font-mono ${isRecording ? 'text-red-400' : 'text-slate-500'}`}>
                                {formatTime(recordingTime)}
                            </div>
                            <div className={`text-sm mt-1 ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
                                {isRecording ? 'RECORDING' : 'READY'}
                            </div>
                        </div>

                        {/* Recording Controls */}
                        <div className="flex justify-center gap-2">
                            {!isRecording ? (
                                <Button 
                                    onClick={startRecording}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={!isMicOn}
                                >
                                    <Mic className="w-4 h-4 mr-2" />
                                    Start Recording
                                </Button>
                            ) : (
                                <Button 
                                    onClick={stopRecording}
                                    className="bg-slate-600 hover:bg-slate-700 text-white"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop Recording
                                </Button>
                            )}
                        </div>

                        {!isMicOn && (
                            <div className="text-center p-3 bg-yellow-900/50 border border-yellow-600/50 rounded-lg">
                                <p className="text-yellow-300 text-sm">
                                    Microphone is off. Turn it on from the top bar to record.
                                </p>
                            </div>
                        )}

                        {/* Preview Controls */}
                        {recordedBlob && (
                            <div className="space-y-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                                <div className="flex justify-center">
                                    <Button 
                                        onClick={playPreview}
                                        variant="outline"
                                        className="bg-blue-600/20 border-blue-500 text-blue-300"
                                    >
                                        {isPreviewing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                        {isPreviewing ? 'Pause Preview' : 'Preview Recording'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Mic Level */}
                        <div className="space-y-2">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <Mic className="w-4 h-4" />
                                Microphone Level
                            </Label>
                            <Slider
                                value={micLevel}
                                onValueChange={setMicLevel}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <div className="text-xs text-slate-400 text-center">{micLevel[0]}%</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Center Panel - Audio Bed & Settings */}
            <div className="col-span-4 space-y-2">
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Music className="w-5 h-5 text-green-400" />
                            Audio Bed Control
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Bed Track Selection */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Background Music Bed</Label>
                            <Select 
                                value={selectedBedTrack?.id || ''} 
                                onValueChange={(value) => {
                                    const track = bedTracks.find(t => t.id === value);
                                    setSelectedBedTrack(track);
                                }}
                            >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Select audio bed (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>No audio bed</SelectItem>
                                    {bedTracks.map(track => (
                                        <SelectItem key={track.id} value={track.id}>
                                            {track.title} - {track.artist}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bed Volume */}
                        {selectedBedTrack && (
                            <div className="space-y-2">
                                <Label className="text-slate-300 flex items-center gap-2">
                                    <Volume2 className="w-4 h-4" />
                                    Bed Volume
                                </Label>
                                <Slider
                                    value={bedVolume}
                                    onValueChange={setBedVolume}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-slate-400 text-center">{bedVolume[0]}%</div>
                            </div>
                        )}

                        {/* Track Info Form */}
                        <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Voice Track Title *</Label>
                                <Input
                                    value={voiceTrackTitle}
                                    onChange={(e) => setVoiceTrackTitle(e.target.value)}
                                    placeholder="e.g., Morning Show Intro, Weather Update"
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-slate-300">Notes (Optional)</Label>
                                <Textarea
                                    value={voiceTrackNotes}
                                    onChange={(e) => setVoiceTrackNotes(e.target.value)}
                                    placeholder="Additional notes about this voice track..."
                                    className="bg-slate-700 border-slate-600 text-white h-20"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <Button 
                            onClick={saveVoiceTrack}
                            disabled={!recordedBlob || !voiceTrackTitle.trim() || isUploading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isUploading ? (
                                <>
                                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Voice Track
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel - Voice Track Library */}
            <div className="col-span-4">
                <Card className="bg-slate-800/50 border-slate-700/50 h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-blue-400" />
                            Voice Track Library ({voiceTracks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto max-h-[calc(100vh-200px)]">
                        {voiceTracks.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <FileAudio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No voice tracks recorded yet</p>
                                <p className="text-sm mt-2">Start recording to build your library</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {voiceTracks.map(track => (
                                    <div key={track.id} className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-white truncate">{track.title}</h4>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Duration: {formatTime(track.duration)}
                                                </p>
                                                {track.description && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {track.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                Voice Track
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Hidden Audio Elements */}
            <audio ref={previewAudioRef} />
            <audio ref={bedAudioRef} src={selectedBedTrack?.file_url} loop />
        </div>
    );
}
