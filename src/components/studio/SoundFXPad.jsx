import React from 'react';
import { useAudio } from '../audio/AudioPlayer';
import { Button } from '@/components/ui/button';

// Sample sound effects - in a real app, these would come from an entity or asset manager
const soundEffects = [
    { name: 'Air Horn', url: 'https://cdn.base44.com/samples/airhorn.mp3' },
    { name: 'Applause', url: 'https://cdn.base44.com/samples/applause.mp3' },
    { name: 'Record Scratch', url: 'https://cdn.base44.com/samples/record-scratch.mp3' },
    { name: 'Laser', url: 'https://cdn.base44.com/samples/laser.mp3' },
    { name: 'Buzzer', url: 'https://cdn.base44.com/samples/buzzer.mp3' },
    { name: 'Cash Register', url: 'https://cdn.base44.com/samples/cash-register.mp3' },
    { name: 'Explosion', url: 'https://cdn.base44.com/samples/explosion.mp3' },
    { name: 'Magic Wand', url: 'https://cdn.base44.com/samples/magic-wand.mp3' },
];

export default function SoundFXPad() {
    const { playSoundEffect } = useAudio();

    return (
        <div className="grid grid-cols-4 gap-3 p-2">
            {soundEffects.map((fx) => (
                <Button
                    key={fx.name}
                    variant="outline"
                    onClick={() => playSoundEffect(fx.url)}
                    className="h-16 bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                    {fx.name}
                </Button>
            ))}
        </div>
    );
}