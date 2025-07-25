import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
    X, 
    Search, 
    HardDrive, 
    FileAudio, 
    Loader2, 
    CheckCircle, 
    AlertTriangle,
    Download
} from 'lucide-react';
import { googleDriveListFiles } from '@/api/functions';
import { Track } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function GoogleDriveBrowser({ onClose, onImportComplete, category }) {
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importingFiles, setImportingFiles] = useState({}); // { fileId: { status, message } }

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async (search = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: apiError } = await googleDriveListFiles({ search });
            if (apiError) throw new Error(apiError.message);
            setFiles(data);
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFiles(searchTerm);
    };

    const handleImport = async (file) => {
        setImportingFiles(prev => ({ ...prev, [file.id]: { status: 'processing', message: 'Analyzing...' } }));

        try {
            const trackType = category ?
                (category.toLowerCase().includes('commercial') ? 'commercial' :
                 category.toLowerCase().includes('promo') ? 'promo' :
                 category.toLowerCase().includes('jingle') || category.toLowerCase().includes('id') ? 'station_id' :
                 'music')
               : 'music';

            const prompt = `Analyze the following filename and determine the most likely artist and title. Filename: "${file.name}". Provide only the most probable artist and title.`;
            
            const aiMetadata = await InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: { artist: { type: "string" }, title: { type: "string" } }
                }
            });

            setImportingFiles(prev => ({ ...prev, [file.id]: { status: 'processing', message: 'Saving...' } }));

            const fileUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;

            const newTrackData = {
              title: aiMetadata.title || file.name.split('.').slice(0, -1).join('.'),
              artist: aiMetadata.artist || 'Unknown Artist',
              file_url: fileUrl,
              track_type: trackType,
              category: category || 'Uncategorized',
              duration: 0,
              ai_enhanced: true
            };

            await Track.create(newTrackData);
            setImportingFiles(prev => ({ ...prev, [file.id]: { status: 'success', message: 'Imported!' } }));

        } catch (err) {
            setImportingFiles(prev => ({ ...prev, [file.id]: { status: 'error', message: err.message } }));
        }
    };

    const renderFileState = (file) => {
        const importState = importingFiles[file.id];
        if (!importState) {
            return (
                <Button size="sm" onClick={() => handleImport(file)}>
                    <Download className="w-4 h-4 mr-2" /> Import
                </Button>
            );
        }

        switch(importState.status) {
            case 'processing':
                return <div className="flex items-center gap-2 text-sm text-blue-400"><Loader2 className="w-4 h-4 animate-spin" /> {importState.message}</div>;
            case 'success':
                return <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle className="w-4 h-4" /> {importState.message}</div>;
            case 'error':
                return <div className="flex items-center gap-2 text-sm text-red-400" title={importState.message}><AlertTriangle className="w-4 h-4" /> Error</div>;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl h-[80vh] flex flex-col bg-slate-900 border-slate-700 text-white">
                <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <HardDrive className="w-6 h-6 text-blue-400" />
                        <CardTitle>Browse Google Drive</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search your Drive for audio..."
                            className="pl-10 bg-slate-800/50 border-slate-700/50"
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </form>

                    <div className="flex-grow border border-slate-700/50 rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full text-red-400">{error}</div>
                        ) : files.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-slate-500">No audio files found.</div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="p-2 space-y-1">
                                {files.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-2 bg-slate-800/40 rounded-md">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <img src={file.iconLink} alt="file icon" className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm truncate">{file.name}</span>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {renderFileState(file)}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                    <Button onClick={onImportComplete} className="mt-2">Done</Button>
                </CardContent>
            </Card>
        </div>
    );
}