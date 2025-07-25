import React from 'react';
import Deck from './Deck';
import CenterControlPanel from './CenterControlPanel';
import { useAudio } from '../audio/AudioPlayer';

export default function DecksPanel() {
  const {
    deckA,
    deckB,
  } = useAudio();

  return (
    <div className="h-full grid grid-cols-12 gap-1">
      <div className="col-span-5 h-full">
        <Deck deckId="A" />
      </div>
      
      <div className="col-span-2 flex items-center justify-center">
        <CenterControlPanel />
      </div>

      <div className="col-span-5 h-full">
        <Deck deckId="B" />
      </div>
    </div>
  );
}