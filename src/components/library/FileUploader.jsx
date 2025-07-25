
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, Music, Loader2, CheckCircle, AlertTriangle, Wand2 } from 'lucide-react';
import { Track } from '@/api/entities';
import { User } from '@/api/entities';
import { UploadFile } from "@/api/integrations";
import { useToast } from "@/components/ui/use-toast";
import { extractTagsFromFile } from '@/api/functions';
import { useCustomization } from '../settings/CustomizationProvider'; // Added import for customization context

const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
};

export default function FileUploader({ category, onClose, onUploadComplete }) {
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef(null);
    const { settings } = useCustomization(); // Get customization settings
    const stationLogoUrl = settings?.logo_url; // Extract station logo URL for fallback

    const updateFileProperty = (id, field, value) => {
        setFilesToUpload(prev => prev.map(f => 
            f.id === id 
            ? { ...f, [field]: value } 
            : f
        ));
    };

    const removeFile = (id) => {
        setFilesToUpload(prev => prev.filter(f => f.id !== id));
    };
    
    const processFiles = (newFiles) => {
      const uniqueFiles = newFiles.filter(
        (file) => !filesToUpload.some((existing) => existing.id === `${file.name}-${file.lastModified}`)
      );

      const fileObjects = uniqueFiles.map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '',
        album: '',
        album_art_url: null,
        year: null, // New field for copyright year
        isrc: '',    // New field for ISRC
        label: '',   // New field for label
        category: category || 'Music',
        progress: 0,
        status: 'analyzing', // 'analyzing', 'ready', 'uploading', 'done', 'error'
        error: null,
      }));

      setFilesToUpload((prev) => [...prev, ...fileObjects]);

      // Analyze files for metadata asynchronously
      fileObjects.forEach(async (fo) => {
          try {
              const formData = new FormData();
              formData.append('file', fo.file);
              const { data, error } = await extractTagsFromFile(formData);

              if (error || !data) {
                  console.warn(`Failed to extract tags for ${fo.file.name}:`, error?.message);
                  setFilesToUpload(prevFiles =>
                      prevFiles.map(f =>
                          f.id === fo.id ? { ...f, status: 'ready' } : f // Still ready, but without extracted tags
                      )
                  );
                  return;
              }
              
              setFilesToUpload(prevFiles =>
                  prevFiles.map(f =>
                      f.id === fo.id 
                          ? {
                              ...f,
                              title: data.title || f.title,
                              artist: data.artist || f.artist,
                              album: data.album || f.album,
                              album_art_url: data.picture || f.album_art_url,
                              year: data.year || f.year,
                              isrc: data.isrc || f.isrc,
                              label: data.label || f.label,
                              status: 'ready', // Set to ready after analysis
                            }
                          : f
                  )
              );
          } catch (err) {
              console.error('Tag extraction error (non-critical):', err);
              setFilesToUpload(prevFiles =>
                  prevFiles.map(f =>
                      f.id === fo.id ? { ...f, status: 'ready' } : f // Still ready, but without extracted tags due to error
                  )
              );
          }
      });
    };

    const handleUploadAll = async () => {
        setUploading(true);
        const user = await User.me();

        for (let i = 0; i < filesToUpload.length; i++) {
            const fileData = filesToUpload[i];
            // Only upload files that are ready or errored from a previous attempt
            if (fileData.status === 'done' || fileData.status === 'uploading' || fileData.status === 'analyzing') continue;
            
            setFilesToUpload(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'uploading', progress: 0 } : f));
            
            try {
                // 1. Upload audio file
                const { file_url: audioUrl } = await UploadFile({ file: fileData.file });
                setFilesToUpload(prev => prev.map(f => f.id === fileData.id ? { ...f, progress: 33 } : f));

                let albumArtUrl = null;
                // 2. Upload album art if it exists
                if (fileData.album_art_url) {
                    try {
                        const artBlob = dataURLtoBlob(fileData.album_art_url);
                        const artFile = new File([artBlob], `${fileData.title || 'cover'}.jpg`, { type: 'image/jpeg' });
                        const { file_url } = await UploadFile({ file: artFile });
                        albumArtUrl = file_url;
                    } catch (artError) {
                        console.error("Album art upload failed:", artError);
                        toast({ variant: "destructive", title: "Art Upload Failed", description: `Could not upload album art for ${fileData.title}.` });
                    }
                } else if (stationLogoUrl) { // Use station logo as default if no album art found
                    albumArtUrl = stationLogoUrl;
                }
                setFilesToUpload(prev => prev.map(f => f.id === fileData.id ? { ...f, progress: 66 } : f));

                // 3. Get audio duration
                const audio = document.createElement('audio');
                audio.src = URL.createObjectURL(fileData.file);
                const duration = await new Promise((resolve) => {
                    audio.addEventListener('loadedmetadata', () => {
                        resolve(audio.duration);
                        URL.revokeObjectURL(audio.src);
                    });
                    audio.addEventListener('error', () => {
                        console.error('Error loading audio for duration calculation');
                        resolve(0); // Resolve with 0 on error
                    });
                });

                // 4. Create Track entity
                const trackData = {
                    organization_id: user.organization_id,
                    title: fileData.title,
                    artist: fileData.artist,
                    album: fileData.album,
                    category: fileData.category,
                    track_type: category === 'Music' ? 'music' : 'station_id',
                    duration: duration,
                    file_url: audioUrl,
                    album_art_url: albumArtUrl,
                    copyright_year: fileData.year ? parseInt(fileData.year) : null,
                    isrc: fileData.isrc,
                    label: fileData.label,
                    id_tag: `${category.substring(0,4).toUpperCase()}${Date.now()}`
                };
                await Track.create(trackData);
                setFilesToUpload(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'done', progress: 100 } : f));

            } catch (err) {
                console.error('Upload failed for', fileData.file.name, err);
                setFilesToUpload(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'error', error: err.message } : f));
            }
        }
        
        setUploading(false);
        onUploadComplete();
        toast({ title: "Upload Complete", description: "All files have been processed." });
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };
    
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
            e.target.value = ''; // Clear input to allow selecting the same file again
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-4xl h-[90vh] bg-slate-900/80 border-slate-700 overflow-hidden flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-3">
                            <Upload className="w-6 h-6 text-blue-400" />
                            Upload Files to "{category}"
                        </CardTitle>
                        <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-6">
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`flex-shrink-0 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/50'
                        }`}
                    >
                        <input
                           ref={inputRef}
                           type="file"
                           multiple
                           accept="audio/*"
                           className="hidden"
                           onChange={handleFileSelect}
                        />
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Upload className="w-12 h-12 mb-4" />
                            <p className="font-semibold text-lg">
                                {isDragActive ? 'Drop files here' : 'Drag & drop audio files or click to browse'}
                            </p>
                            <p className="text-sm">MP3, WAV, FLAC, OGG, M4A supported</p>
                        </div>
                    </div>

                    {filesToUpload.length > 0 ? (
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            <h3 className="text-lg font-semibold text-white">Upload Queue ({filesToUpload.length})</h3>
                            <ScrollArea className="flex-1 -mr-3">
                                <div className="space-y-3 pr-3">
                                    {filesToUpload.map(f => (
                                        <Card key={f.id} className="bg-slate-800/50 border-slate-700/50 flex items-center p-3 gap-3">
                                            <div className="w-16 h-16 bg-slate-800 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {f.album_art_url ? (
                                                    <img src={f.album_art_url} alt={f.title || 'album art'} className="w-full h-full object-cover"/>
                                                ) : stationLogoUrl ? (
                                                    <img src={stationLogoUrl} alt="Station Logo" className="w-full h-full object-contain p-1"/>
                                                ) : (
                                                    <Music className="w-8 h-8 text-slate-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 grid grid-cols-3 gap-3">
                                                <Input placeholder="Title" value={f.title} onChange={(e) => updateFileProperty(f.id, 'title', e.target.value)} className="bg-slate-700 border-slate-600"/>
                                                <Input placeholder="Artist" value={f.artist} onChange={(e) => updateFileProperty(f.id, 'artist', e.target.value)} className="bg-slate-700 border-slate-600"/>
                                                <Input placeholder="Album" value={f.album} onChange={(e) => updateFileProperty(f.id, 'album', e.target.value)} className="bg-slate-700 border-slate-600"/>
                                                <Input placeholder="Year" value={f.year || ''} onChange={(e) => updateFileProperty(f.id, 'year', e.target.value)} className="bg-slate-700 border-slate-600" type="number"/>
                                                <Input placeholder="ISRC" value={f.isrc} onChange={(e) => updateFileProperty(f.id, 'isrc', e.target.value)} className="bg-slate-700 border-slate-600"/>
                                                <Input placeholder="Label" value={f.label} onChange={(e) => updateFileProperty(f.id, 'label', e.target.value)} className="bg-slate-700 border-slate-600"/>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-full flex justify-center">
                                                    {f.status === 'analyzing' && <Badge variant="outline" className="text-yellow-400 border-yellow-400/50"><Loader2 className="w-3 h-3 mr-1 animate-spin"/>Analyzing</Badge>}
                                                    {f.status === 'ready' && <Badge variant="outline" className="text-green-400 border-green-400/50"><CheckCircle className="w-3 h-3 mr-1"/>Ready</Badge>}
                                                    {f.status === 'uploading' && <Progress value={f.progress} className="w-24 h-2" />}
                                                    {f.status === 'done' && <Badge variant="outline" className="text-blue-400 border-blue-400/50"><CheckCircle className="w-3 h-3 mr-1"/>Done</Badge>}
                                                    {f.status === 'error' && <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1"/>Error</Badge>}
                                                </div>
                                                <Button onClick={() => removeFile(f.id)} variant="ghost" size="icon" className="text-slate-500 hover:text-red-500"><X className="w-4 h-4"/></Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1 bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <p>No files selected</p>
                            </div>
                        </ScrollArea>
                    )}

                    <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t border-slate-700/50">
                        <Button variant="outline" onClick={onClose} className="border-slate-600">Cancel</Button>
                        <Button 
                            onClick={handleUploadAll} 
                            disabled={uploading || filesToUpload.length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                            Upload All
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
