import React, { useState, useEffect } from 'react';
import { useAudio } from '../audio/AudioPlayer';

const SingleMeter = ({ label, isActive }) => {
    const [level, setLevel] = useState(0);

    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(() => {
                setLevel(Math.random() * 100);
            }, 150);
        } else {
            setLevel(0);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <div className="w-8 h-2 bg-black/50 rounded-sm overflow-hidden border border-slate-600/50">
                <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-150"
                    style={{ width: `${level}%` }}
                />
            </div>
        </div>
    );
};

export default function VoiceMeters() {
    const { deckA, deckB } = useAudio();

    return (
        <div className="flex flex-col gap-0.5">
            <SingleMeter label="A" isActive={deckA.isPlaying} />
            <SingleMeter label="B" isActive={deckB.isPlaying} />
        </div>
    );
}