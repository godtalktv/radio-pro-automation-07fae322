import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';
import { InvokeLLM } from "@/api/integrations";

export default function AlbumArtSearchModal({ track, onClose, onSelect }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageResults, setImageResults] = useState([]);

  useEffect(() => {
    const searchForArt = async () => {
      if (!track || !track.title || !track.artist) {
        setError("Track title and artist are required to search for album art.");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await InvokeLLM({
          prompt: `Find 12 high-quality square album art images for the song "${track.title}" by "${track.artist}". Provide direct image URLs only.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              image_urls: {
                type: "array",
                items: { type: "string" },
                description: "A list of direct URLs to album art images."
              }
            },
            required: ["image_urls"]
          }
        });

        if (result && result.image_urls && result.image_urls.length > 0) {
          setImageResults(result.image_urls);
        } else {
          setError("No album art found. Please try a different track or add the URL manually.");
        }
      } catch (err) {
        console.error("Album art search failed:", err);
        setError("An error occurred while searching for album art. Please check the console.");
      } finally {
        setIsLoading(false);
      }
    };

    searchForArt();
  }, [track]);

  const handleSelectImage = (url) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-4xl h-[80vh] bg-slate-900/80 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
          <CardTitle className="text-white">
            Find Album Art for: <span className="text-blue-400">{track.title}</span>
          </CardTitle>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Searching for album art...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
              <AlertTriangle className="w-8 h-8 mb-4" />
              <p className="font-semibold">Search Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageResults.map((url, index) => (
                <button
                  key={index}
                  className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden group focus:outline-none focus:ring-4 focus:ring-blue-500"
                  onClick={() => handleSelectImage(url)}
                >
                  <img
                    src={url}
                    alt={`Album art result ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Hides broken images
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold">Select</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}