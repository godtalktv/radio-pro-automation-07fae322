import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudio } from '../audio/AudioPlayer';
import { Loader2, Music, AlertCircle } from 'lucide-react';

const formatTime = (seconds, withDecimal = false) => {
  if (isNaN(seconds) || seconds < 0) return withDecimal ? "00:00.0" : "00:00";
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const dec = Math.floor((seconds - totalSeconds) * 10);
  const time = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return withDecimal ? `${time}.${dec}` : time;
};

const CustomProgressBar = ({ progress }) => (
  <div className="w-full h-3 bg-black/50 rounded-sm overflow-hidden border border-slate-600">
    <div className="h-full bg-gradient-to-r from-blue-400 to-sky-300 transition-all duration-150" style={{ width: `${progress}%` }}></div>
  </div>
);

export default function Deck({ deckId }) {
  const { 
    deckA, 
    deckB, 
    playDeckA,
    playDeckB,
    activeDeck
  } = useAudio();

  const deck = deckId === 'A' ? deckA : deckB;
  const play = deckId === 'A' ? playDeckA : playDeckB;
  const isActive = activeDeck === deckId;

  const currentTime = deck.duration ? (deck.progress / 100) * deck.duration : 0;
  const remainingTime = deck.duration ? deck.duration - currentTime : 0;

  return (
    <Card className={`h-full bg-slate-800/60 border border-slate-700/50 p-1 flex flex-col justify-between transition-all duration-300 ${isActive ? 'shadow-lg shadow-blue-500/10' : ''}`}>
      
      {/* Top Section: Track Info */}
      <div className="bg-black/40 p-2 rounded-t-md text-center">
        {deck.track ? (
          <>
            <div className="text-sm font-semibold text-white truncate" title={deck.track.artist}>
              {deck.track.artist || 'Unknown Artist'}
            </div>
            <div className="text-lg font-bold text-sky-300 truncate" title={deck.track.title}>
              {deck.track.title || 'Unknown Title'}
            </div>
          </>
        ) : (
          <div className="min-h-[44px] flex items-center justify-center text-slate-500">
            <Music className="w-5 h-5 mr-2" /> No Track
          </div>
        )}
      </div>

      {/* Middle Section: Progress and Time */}
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="flex items-center justify-between gap-2">
          {/* Main Timer */}
          <div className="font-mono text-5xl text-white tracking-tighter">
            {formatTime(remainingTime, true).slice(0, -2)}<span className="text-3xl">.{formatTime(remainingTime, true).slice(-1)}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <Button onClick={play} disabled={!deck.track} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8">
              Start
            </Button>
            <Button disabled={!deck.track} variant="outline" className="bg-slate-600/50 border-slate-500/50 hover:bg-slate-500/50 h-6 text-xs">
              Next
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-1">
          <CustomProgressBar progress={deck.progress || 0} />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{deck.track?.category || '---'}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Section: Cue Points & Extra Info */}
      <div className="bg-black/20 p-1 rounded-b-md text-xs text-slate-400 flex justify-between items-center font-mono">
        <div>
          <span>Intro: {formatTime(deck.track?.intro_time || 0)}</span>
        </div>
        <div>
          <span>Outro: {formatTime(deck.track?.outro_time || 0)}</span>
        </div>
        <div>
          {deck.isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
          {deck.error && <AlertCircle className="w-4 h-4 text-red-400" />}
        </div>
      </div>
    </Card>
  );
}