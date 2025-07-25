import React from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Music, Zap, Mic, Play, Pause } from 'lucide-react';

export default function SystemStatusWidget() {
    const { 
        isPlaying, 
        isAutoDJ, 
        isGapKillerActive, 
        currentTrack, 
        activeDeck,
        deckA,
        deckB,
    } = useAudio();

    const getStatusInfo = () => {
        if (isGapKillerActive) {
            return { 
                label: 'GAP KILLER ACTIVE', 
                icon: <Zap className="w-5 h-5 text-orange-400" />,
                color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
                message: 'Preventing dead air with a filler track.'
            };
        }
        if (isAutoDJ) {
            return { 
                label: 'AUTO DJ ACTIVE', 
                icon: <Radio className="w-5 h-5 text-purple-400" />,
                color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
                message: 'System is in automated broadcast mode.'
            };
        }
        return { 
            label: 'LIVE ASSIST MODE', 
            icon: <Mic className="w-5 h-5 text-blue-400" />,
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            message: 'Manual control is enabled.'
        };
    };

    const { label, icon, color, message } = getStatusInfo();
    const currentDeckData = activeDeck === 'A' ? deckA : deckB;

    return (
        <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-3">
                    {icon}
                    Live System Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Badge className={`w-full text-center justify-center py-2 text-sm font-bold ${color}`}>
                    {label}
                </Badge>

                <div className="text-sm text-slate-400 text-center">{message}</div>

                <div className="bg-black/30 p-3 rounded-lg border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Broadcast</span>
                        {isPlaying ? (
                            <Badge variant="outline" className="text-green-400 border-green-500/50">ON AIR</Badge>
                        ) : (
                            <Badge variant="outline" className="text-red-400 border-red-500/50">OFF AIR</Badge>
                        )}
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Active Deck</span>
                        <Badge variant="secondary" className="font-mono">DECK {activeDeck}</Badge>
                    </div>
                </div>

                {currentTrack ? (
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Now Playing</p>
                        <div className="bg-slate-700/30 p-3 rounded-lg flex items-center gap-3">
                            {isPlaying ? 
                                <Play className="w-5 h-5 text-green-400 flex-shrink-0 animate-pulse" /> :
                                <Pause className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            }
                            <div className="min-w-0">
                                <p className="font-semibold text-white truncate">{currentTrack.title}</p>
                                <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                     <div className="text-center text-sm text-slate-500 py-4">
                        No track is currently playing.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}