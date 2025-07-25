import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateImage } from "@/api/integrations";
import { Image as ImageIcon, Loader2, Sparkles, Download } from 'lucide-react';

export default function Branding() {
    const [logoUrl, setLogoUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [prompt] = useState(`Minimalist vector logo for a podcast or radio show called "Soul Talk On Air". The design should be modern, clean, and professional, combining a vintage-style radio microphone with subtle sound waves. Use a sophisticated color palette of deep indigo, warm gold, and off-white. The text 'Soul Talk On Air' should be in an elegant, modern sans-serif font, positioned below the icon.`);

    const generateLogo = async () => {
        setIsLoading(true);
        setLogoUrl(null);
        try {
            const { url } = await GenerateImage({ prompt });
            setLogoUrl(url);
        } catch (error) {
            console.error("Failed to generate logo:", error);
            alert("Sorry, there was an error generating the logo. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateLogo();
    }, []);

    const handleDownload = () => {
        if (!logoUrl) return;
        const link = document.createElement('a');
        link.href = logoUrl;
        link.download = 'soul_talk_on_air_logo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Branding &amp; Logo</h1>
                    <p className="text-slate-400">View and manage your station's visual identity.</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-400"/>
                                Station Logo
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={handleDownload} 
                                    disabled={!logoUrl || isLoading}
                                    variant="outline"
                                    className="bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                <Button onClick={generateLogo} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                    )}
                                    {isLoading ? 'Generating...' : 'Regenerate'}
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full aspect-square bg-slate-800/30 rounded-lg flex items-center justify-center p-8">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 text-slate-500 animate-spin" />
                                    <p className="text-slate-400">Generating your logo with AI...</p>
                                </div>
                            ) : logoUrl ? (
                                <img src={logoUrl} alt="Generated Soul Talk On Air Logo" className="max-w-full max-h-full object-contain rounded-md" />
                            ) : (
                                <p className="text-red-400">Failed to load logo.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}