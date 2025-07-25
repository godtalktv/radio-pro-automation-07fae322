import React from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, ListMusic, Mic, CheckCircle } from 'lucide-react';

export default function RecommendationsWidget() {
    const { queue, isPlaying, isAutoDJ, currentTrack } = useAudio();

    const getRecommendations = () => {
        let recs = [];

        // Scenario: Queue is empty and not in AutoDJ mode
        if (queue.length === 0 && !isAutoDJ && isPlaying) {
            recs.push({
                level: 'warning',
                icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
                title: "Queue is Empty",
                message: "Dead air is imminent! Add tracks to the queue or enable AutoDJ to continue the broadcast."
            });
        }
        
        // Scenario: Queue has few items left
        if (queue.length > 0 && queue.length <= 3 && !isAutoDJ) {
            recs.push({
                level: 'info',
                icon: <ListMusic className="w-5 h-5 text-blue-400" />,
                title: "Queue is Running Low",
                message: `Only ${queue.length} track(s) remaining. Plan your next segment or add more music.`
            });
        }

        // Scenario: Opportunity for a voice track
        const nextTrack = queue[0];
        if (currentTrack?.track_type === 'music' && nextTrack?.track_type === 'music') {
             recs.push({
                level: 'info',
                icon: <Mic className="w-5 h-5 text-cyan-400" />,
                title: "Voice Track Opportunity",
                message: "You have two music tracks back-to-back. Consider recording a voice track to place between them."
            });
        }
        
        // Scenario: Everything is running smoothly
        if (recs.length === 0) {
            if (isAutoDJ && isPlaying) {
                 recs.push({
                    level: 'success',
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                    title: "System is Automated",
                    message: "AutoDJ is active and managing the playlist. The system is running smoothly."
                });
            } else if (isPlaying) {
                 recs.push({
                    level: 'success',
                    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                    title: "System looks good!",
                    message: "Your queue is populated and the broadcast is live. Keep up the great work!"
                });
            }
        }
        
        // Default message if nothing is happening
        if (!isPlaying) {
             recs.push({
                level: 'info',
                icon: <Lightbulb className="w-5 h-5 text-slate-400" />,
                title: "Ready to Start",
                message: "Load up your queue and hit the Start button in the Studio to go live."
            });
        }

        return recs.slice(0, 2); // Show max 2 recommendations
    };

    const recommendations = getRecommendations();

    const levelColors = {
        warning: 'bg-yellow-500/10 border-yellow-500/30',
        info: 'bg-blue-500/10 border-blue-500/30',
        success: 'bg-green-500/10 border-green-500/30',
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-300" />
                    Live Recommendations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${levelColors[rec.level]}`}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">{rec.icon}</div>
                            <div>
                                <h4 className="font-semibold text-white">{rec.title}</h4>
                                <p className="text-sm text-slate-400">{rec.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}