import React, { useState } from 'react';
import { HelpVideo } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Film, X, AlertTriangle } from 'lucide-react';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function VideoUploader({ onClose, onUploadComplete }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Getting Started');
    const [videoFile, setVideoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setVideoFile(null);
            return;
        }

        if (!file.type.startsWith('video/')) {
            setVideoFile(null);
            setError('Please select a valid video file.');
            return;
        }
        
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setVideoFile(null);
            setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        
        setVideoFile(file);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !title) {
            setError('Please provide a video file and a title.');
            return;
        }

        setIsUploading(true);
        setError('');
        setProgress(50);

        try {
            const { file_url } = await UploadFile({ file: videoFile });
            setProgress(75);

            if (file_url) {
                await HelpVideo.create({
                    title,
                    description,
                    category,
                    file_url,
                });
                setProgress(100);
                onUploadComplete();
            } else {
                throw new Error("File upload did not return a URL.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed. The file may be too large or there's a temporary server issue. Please try again with a smaller file.");
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg border border-slate-700 relative">
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-slate-400 hover:text-white" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>

                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <Film className="w-5 h-5 text-purple-400" />
                    Upload New Tutorial
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
                        <Input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="bg-slate-900 border-slate-600 text-white file:text-purple-400"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">Maximum file size: {MAX_FILE_SIZE_MB}MB.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., How to Use the Studio Decks"
                            className="bg-slate-900 border-slate-600 text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A short summary of what this video covers..."
                            className="bg-slate-900 border-slate-600 text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="Getting Started">Getting Started</SelectItem>
                                <SelectItem value="Studio Features">Studio Features</SelectItem>
                                <SelectItem value="Scheduling">Scheduling</SelectItem>
                                <SelectItem value="Troubleshooting">Troubleshooting</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                           <span>{error}</span>
                        </div>
                    )}
                    
                    {isUploading && (
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isUploading} className="bg-slate-700 border-slate-600">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUploading || !videoFile || !title} className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}