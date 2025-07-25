import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Save, Trash2, Loader2, AlertTriangle, Music, Play, RefreshCw, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Track } from '@/api/entities';
import { UploadFile } from "@/api/integrations";
import { useAudio } from '../audio/AudioPlayer';

const AudioVisualizer = ({ volume }) => {
    return (
        <div className="w-full h-16 bg-black/30 rounded-lg flex items-center justify-center overflow-hidden">
            <div 
                className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-full transition-all duration-75"
                style={{ width: `${Math.min(volume * 150, 100)}%` }}
            />
        </div>
    );
};

const TrackContextCard = ({ position, track }) => {
    if (!track) {
        return (
             <Card className="bg-slate-800/50 p-3 border-slate-700/50 text-center">
                <p className="text-slate-500 text-sm">No {position} track available.</p>
            </Card>
        );
    }
    return (
        <Card className="bg-slate-800/50 p-3 border-slate-700/50">
            <div className="flex justify-between items-center">
                <div className='min-w-0'>
                    <Badge variant="secondary" className="mb-2">{position}</Badge>
                    <h4 className="text-white font-semibold truncate">{track.title}</h4>
                    <p className="text-slate-400 text-sm truncate">{track.artist}</p>
                </div>
                 {position === "Previous Track" ? 
                    <ChevronsRight className="w-8 h-8 text-slate-600 flex-shrink-0" /> : 
                    <ChevronsLeft className="w-8 h-8 text-slate-600 flex-shrink-0" />}
            </div>
        </Card>
    )
};

export default function VoiceTrackPanel() {
    const { queue, playHistory, currentTrack, addTrackToQueue, reloadTracks } = useAudio();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [micPermission, setMicPermission] = useState('prompt');
    const [error, setError] = useState(null);
    const [volume, setVolume] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);

    const previousTrack = playHistory[0] || currentTrack;
    const nextTrack = queue[0];

    const startRecording = async () => {
        setError(null);
        if (micPermission === 'denied') {
            setError("Microphone access was denied. Please enable it in your browser settings and refresh the page.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission('granted');
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            mediaRecorderRef.current.ondataavailable = event => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                audioChunksRef.current = [];
            };

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            
            const visualize = () => {
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
                setVolume(avg / 128);
                animationFrameRef.current = requestAnimationFrame(visualize);
            };
            visualize();

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check your browser permissions.");
            setMicPermission('denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setVolume(0);
            if (sourceRef.current) sourceRef.current.disconnect();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };
    
    const reset = () => {
        setAudioBlob(null);
        setError(null);
    };

    const handleSaveAndInsert = async () => {
        if (!audioBlob) return;
        setIsUploading(true);
        const now = new Date();
        const fileName = `VoiceTrack_${now.toISOString()}.webm`;
        const file = new File([audioBlob], fileName, { type: 'audio/webm' });

        try {
            const { file_url } = await UploadFile({ file });
            const audio = new Audio(file_url);
            audio.onloadedmetadata = async () => {
                const newTrackData = {
                    title: `Voice Track - ${now.toLocaleTimeString()}`,
                    artist: 'Live DJ',
                    duration: audio.duration,
                    file_url: file_url,
                    track_type: 'voice_track',
                    category: 'Voice Tracks'
                };
                const newTrack = await Track.create(newTrackData);
                addTrackToQueue(newTrack, 0); // Insert at the start of the queue
                await reloadTracks();
                reset();
                setIsUploading(false);
            };
        } catch (err) {
            console.error("Failed to save voice track:", err);
            setError("Failed to upload or save the voice track.");
            setIsUploading(false);
        }
    };

    return (
        <Card className="h-full bg-slate-900/50 border-slate-700/50 flex flex-col p-4 space-y-4">
            <h3 className="text-white font-bold text-lg text-center">Voice Tracking Studio</h3>
            
            <TrackContextCard position="Previous Track" track={previousTrack} />

            <Card className="flex-1 flex flex-col justify-center items-center p-4 bg-slate-800/30 border-slate-700/30 space-y-4">
                <h4 className="text-slate-300 font-semibold">Record Your Segment</h4>
                
                <AudioVisualizer volume={volume} />

                {error && (
                    <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
                
                <div className="flex items-center justify-center gap-4">
                     {!isRecording ? (
                        <Button onClick={startRecording} disabled={!!audioBlob} className="w-24 h-16 bg-red-600 hover:bg-red-700 flex-col gap-1">
                            <Mic className="w-6 h-6" />
                            <span>Record</span>
                        </Button>
                    ) : (
                        <Button onClick={stopRecording} className="w-24 h-16 bg-blue-600 hover:bg-blue-700 flex-col gap-1">
                            <Square className="w-6 h-6" />
                            <span>Stop</span>
                        </Button>
                    )}

                    {audioBlob && !isRecording && (
                        <>
                             <Button onClick={handleSaveAndInsert} disabled={isUploading} className="w-24 h-16 bg-green-600 hover:bg-green-700 flex-col gap-1">
                                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                <span>{isUploading ? 'Saving...' : 'Save'}</span>
                            </Button>
                            <Button onClick={reset} variant="destructive" className="w-24 h-16 flex-col gap-1">
                                <Trash2 className="w-6 h-6" />
                                <span>Discard</span>
                            </Button>
                        </>
                    )}
                </div>
                {audioBlob && <p className="text-xs text-slate-400">Recording complete. Save to insert into queue or discard.</p>}
            </Card>
            
            <TrackContextCard position="Next Track" track={nextTrack} />
        </Card>
    );
}