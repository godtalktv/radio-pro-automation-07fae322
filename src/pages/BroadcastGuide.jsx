import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Radio, Music, ListMusic, Mic, Wand2 } from 'lucide-react';
import SystemStatusWidget from '../components/guide/SystemStatusWidget';
import RecommendationsWidget from '../components/guide/RecommendationsWidget';

export default function BroadcastGuide() {
  return (
    <div className="p-4 md:p-6 lg:p-8 text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Broadcast Guide</h1>
            <p className="text-slate-400">Your live assistant for running a smooth broadcast.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Live Status & Recommendations */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SystemStatusWidget />
            <RecommendationsWidget />
          </div>

          {/* Right Column: Quick Start & Feature Guide */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quick-Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">1</div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2"><Music className="w-4 h-4"/>Add Your Media</h3>
                    <p className="text-slate-400 text-sm">
                      Go to the <span className="font-bold text-slate-300">Media Library</span> to upload your music, commercials, and station IDs. The system will analyze them and make them available in the Studio.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">2</div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2"><ListMusic className="w-4 h-4"/>Build Your Queue</h3>
                    <p className="text-slate-400 text-sm">
                      In the <span className="font-bold text-slate-300">Studio</span>, find your tracks in the Library Panel and drag them into the Playlist Panel to build your upcoming queue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">3</div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2"><Mic className="w-4 h-4"/>Record Voice Tracks (Optional)</h3>
                    <p className="text-slate-400 text-sm">
                      Switch to <span className="font-bold text-slate-300">Live Assist</span> mode in the Studio. Use the Voice Track panel to record intros and outros between songs for a professional touch.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">4</div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2"><Wand2 className="w-4 h-4"/>Automate with Clockwheels</h3>
                    <p className="text-slate-400 text-sm">
                      For automated programming, visit the <span className="font-bold text-slate-300">Clockwheels</span> and <span className="font-bold text-slate-300">Schedule</span> pages to define your station's format and let the AutoDJ run the show.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-blue-400">5</div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2"><Radio className="w-4 h-4"/>Go Live!</h3>
                    <p className="text-slate-400 text-sm">
                      Configure your streaming servers in the <span className="font-bold text-slate-300">Stream Settings</span> (accessible from the Studio top bar). Once configured, press the main <span className="font-bold text-green-400">Start</span> button to begin your broadcast.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}