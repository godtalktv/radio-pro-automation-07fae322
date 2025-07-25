import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudio } from '../audio/AudioPlayer';
import { Cart, Track } from '@/api/entities';
import { Loader2, Music, AppWindow } from 'lucide-react';

export default function CartWall() {
    const { playSoundEffect } = useAudio();
    const [carts, setCarts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackMap, setTrackMap] = useState({});

    useEffect(() => {
        const loadCartsAndTracks = async () => {
            setIsLoading(true);
            try {
                const [cartData, trackData] = await Promise.all([
                    Cart.list(),
                    Track.list()
                ]);

                // Create a map for quick track lookup by ID
                const newTrackMap = trackData.reduce((acc, track) => {
                    acc[track.id] = track;
                    return acc;
                }, {});

                setTrackMap(newTrackMap);
                
                // Sort carts by position for consistent display
                const sortedCarts = cartData.sort((a, b) => (a.position || 0) - (b.position || 0));
                setCarts(sortedCarts);
            } catch (error) {
                console.error("Failed to load cart wall data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCartsAndTracks();
    }, []);

    const handleCartClick = (cart) => {
        const track = trackMap[cart.track_id];
        if (track && track.file_url) {
            playSoundEffect(track.file_url);
        } else {
            console.warn(`Cart "${cart.label}" clicked, but no valid track found.`);
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full bg-slate-900/50 border-slate-700/50 flex items-center justify-center">
                <div className="text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading Cart Wall...</p>
                </div>
            </Card>
        );
    }
    
    if (carts.length === 0) {
        return (
            <Card className="h-full bg-slate-900/50 border-slate-700/50 flex items-center justify-center">
                <div className="text-center text-slate-500 p-4">
                    <AppWindow className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                    <p className="font-semibold">No Carts Configured</p>
                    <p className="text-sm">Create Carts and assign Tracks to them to use the Cart Wall.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-full bg-slate-900/50 border-slate-700/50 p-2">
            <div className="grid grid-cols-6 grid-rows-6 gap-1 h-full">
                {carts.map((cart) => (
                    <Button
                        key={cart.id}
                        onClick={() => handleCartClick(cart)}
                        className="aspect-square text-white text-xs font-bold flex items-center justify-center text-center p-1 break-words leading-tight min-h-0 h-full"
                        style={{
                            backgroundColor: cart.color || '#334155',
                            '--hover-color': `${cart.color}CC` // Opacity for hover
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = e.currentTarget.style.getPropertyValue('--hover-color')}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = cart.color || '#334155'}
                    >
                        {cart.label}
                    </Button>
                ))}
            </div>
        </Card>
    );
}