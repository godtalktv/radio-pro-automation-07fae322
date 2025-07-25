import React, { useState, useEffect } from 'react';
import { HelpVideo } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Film, Upload, Info } from 'lucide-react';
import VideoUploader from '../components/guide/VideoUploader';

export default function TutorialsPage() {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const fetchedVideos = await HelpVideo.list('-created_date');
            setVideos(fetchedVideos);
            if (fetchedVideos.length > 0) {
                setSelectedVideo(fetchedVideos[0]);
            }
        } catch (error) {
            console.error("Failed to load help videos:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchVideos();
    }, []);
    
    const handleUploadComplete = () => {
        setShowUploader(false);
        fetchVideos();
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                Loading Tutorials...
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-6 lg:p-8 text-slate-200 font-sans h-full flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Film className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Help & Tutorials</h1>
                            <p className="text-slate-400">Your video guide to RadioPro.</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowUploader(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                    </Button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                    {/* Video Player & Info */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Card className="flex-1 bg-black border-slate-700/50 flex items-center justify-center">
                            {selectedVideo ? (
                                <video key={selectedVideo.id} src={selectedVideo.file_url} controls className="w-full h-full object-contain" autoPlay>
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="text-slate-500 text-center">
                                    <Film className="w-24 h-24 mx-auto text-slate-600 mb-4" />
                                    <p className="font-semibold">No video selected</p>
                                    <p className="text-sm">Select a video from the list to play it.</p>
                                </div>
                            )}
                        </Card>
                        {selectedVideo && (
                            <Card className="flex-shrink-0 bg-slate-800/50 border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white">{selectedVideo.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-300">{selectedVideo.description}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Video List */}
                    <div className="lg:col-span-1">
                        <Card className="h-full bg-slate-800/50 border-slate-700/50 flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Tutorials Playlist</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto px-2">
                                {videos.length > 0 ? (
                                    <ul className="space-y-2">
                                        {videos.map(video => (
                                            <li
                                                key={video.id}
                                                onClick={() => setSelectedVideo(video)}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-start gap-3 ${selectedVideo?.id === video.id ? 'bg-purple-600/30' : 'hover:bg-slate-700/50'}`}
                                            >
                                                <div className="flex-shrink-0 bg-slate-700 w-8 h-8 flex items-center justify-center rounded-md mt-1">
                                                    <Film className="w-4 h-4 text-purple-400"/>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-white truncate">{video.title}</p>
                                                    <p className="text-sm text-slate-400">{video.category}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                                        <Info className="w-10 h-10 mb-4" />
                                        <p className="font-semibold">No tutorials uploaded yet.</p>
                                        <p className="text-sm">Click "Upload Video" to get started.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {showUploader && (
                <VideoUploader 
                    onClose={() => setShowUploader(false)}
                    onUploadComplete={handleUploadComplete}
                />
            )}
        </>
    );
}