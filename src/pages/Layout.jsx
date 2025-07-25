
import React from 'react';
import { AudioProvider } from './components/audio/AudioPlayer';
import { VirtualAudioProvider } from './components/audio/VirtualAudioDriver';
import { CustomizationProvider } from './components/settings/CustomizationProvider';
import { LicenseProvider } from './components/licensing/LicenseManager';
import { Toaster } from './components/ui/toaster';

export default function Layout({ children, currentPageName }) {
  return (
    <LicenseProvider>
      <CustomizationProvider>
        <VirtualAudioProvider>
          <AudioProvider>
            <div className="min-h-screen bg-slate-950 text-white">
              {children}
              <Toaster />
            </div>
          </AudioProvider>
        </VirtualAudioProvider>
      </CustomizationProvider>
    </LicenseProvider>
  );
}
