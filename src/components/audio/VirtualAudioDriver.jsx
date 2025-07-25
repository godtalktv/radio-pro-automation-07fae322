import React, { createContext, useContext } from 'react';

// Simplified virtual audio context that just provides basic state
const VirtualAudioContext = createContext({
  isInitializing: false,
  audioContext: null,
  mainMixer: { current: null }
});

export const useVirtualAudio = () => {
  const context = useContext(VirtualAudioContext);
  if (!context) {
    throw new Error('useVirtualAudio must be used within a VirtualAudioProvider');
  }
  return context;
};

export const VirtualAudioProvider = ({ children }) => {
  // Simplified provider - no complex audio routing
  const contextValue = {
    isInitializing: false,
    audioContext: null,
    mainMixer: { current: null }
  };

  return (
    <VirtualAudioContext.Provider value={contextValue}>
      {children}
    </VirtualAudioContext.Provider>
  );
};