import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAudio } from '../audio/AudioPlayer';
import { Track } from "@/api/entities";
import { 
  Play, 
  Pause, 
  Square,
  RefreshCw, 
  TestTube,
  CheckCircle,
  AlertTriangle,
  Music,
  Clock,
  Radio,
  Settings
} from 'lucide-react';

export default function AutoDJTester({ onClose }) {
  const { 
    deckA, 
    deckB, 
    activeDeck,
    isAutoDJ, 
    handleAutoDJToggle,
    loadToDeckA,
    loadToDeckB,
    playDeckA,
    playDeckB,
    pauseDeckA,
    pauseDeckB,
    ejectDeckA,
    ejectDeckB,
    tracks,
    queue,
    addTrackToQueue,
    handlePlayNow
  } = useAudio();

  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: Date.now() }]);
  };

  const runAutoDJTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if we have tracks to work with
      setCurrentTest('Checking music library...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (tracks.length === 0) {
        addTestResult('Library Check', 'error', 'No tracks found in library. Please upload music first.');
        setIsRunningTests(false);
        return;
      }
      
      const musicTracks = tracks.filter(t => t.track_type === 'music');
      if (musicTracks.length < 2) {
        addTestResult('Library Check', 'warning', `Only ${musicTracks.length} music tracks found. Need at least 2 for proper AutoDJ testing.`);
      } else {
        addTestResult('Library Check', 'success', `Found ${musicTracks.length} music tracks ready for AutoDJ.`);
      }

      // Test 2: Test deck loading
      setCurrentTest('Testing deck loading...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (musicTracks.length > 0) {
        try {
          await loadToDeckA(musicTracks[0]);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (deckA.track && deckA.track.id === musicTracks[0].id) {
            addTestResult('Deck Loading', 'success', 'Successfully loaded track to Deck A.');
          } else {
            addTestResult('Deck Loading', 'error', 'Failed to load track to Deck A.');
          }
        } catch (error) {
          addTestResult('Deck Loading', 'error', `Deck loading failed: ${error.message}`);
        }
      }

      // Test 3: Test playback
      setCurrentTest('Testing playback...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (deckA.track) {
        try {
          await playDeckA();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (deckA.isPlaying) {
            addTestResult('Playback Test', 'success', 'Track is playing successfully on Deck A.');
          } else {
            addTestResult('Playback Test', 'error', 'Track failed to start playing.');
          }
        } catch (error) {
          addTestResult('Playback Test', 'error', `Playback failed: ${error.message}`);
        }
      }

      // Test 4: Test AutoDJ activation
      setCurrentTest('Testing AutoDJ activation...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        handleAutoDJToggle(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (isAutoDJ) {
          addTestResult('AutoDJ Activation', 'success', 'AutoDJ mode activated successfully.');
        } else {
          addTestResult('AutoDJ Activation', 'error', 'Failed to activate AutoDJ mode.');
        }
      } catch (error) {
        addTestResult('AutoDJ Activation', 'error', `AutoDJ activation failed: ${error.message}`);
      }

      // Test 5: Test preloading to second deck
      setCurrentTest('Testing automatic preloading...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (musicTracks.length > 1 && isAutoDJ) {
        try {
          await loadToDeckB(musicTracks[1]);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (deckB.track) {
            addTestResult('Preloading Test', 'success', 'Successfully preloaded next track to Deck B.');
          } else {
            addTestResult('Preloading Test', 'warning', 'Preloading may not be working automatically.');
          }
        } catch (error) {
          addTestResult('Preloading Test', 'error', `Preloading failed: ${error.message}`);
        }
      }

      // Test 6: Test Play Now functionality
      setCurrentTest('Testing Play Now feature...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (musicTracks.length > 2 && handlePlayNow) {
        try {
          await handlePlayNow(musicTracks[2]);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addTestResult('Play Now Test', 'success', 'Play Now feature executed without errors.');
        } catch (error) {
          addTestResult('Play Now Test', 'error', `Play Now failed: ${error.message}`);
        }
      } else if (!handlePlayNow) {
        addTestResult('Play Now Test', 'error', 'handlePlayNow function is not available.');
      }

      // Test 7: Test queue functionality
      setCurrentTest('Testing queue system...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (musicTracks.length > 3) {
        try {
          await addTrackToQueue(musicTracks[3]);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (queue.some(t => t.id === musicTracks[3].id)) {
            addTestResult('Queue Test', 'success', 'Successfully added track to queue.');
          } else {
            addTestResult('Queue Test', 'error', 'Failed to add track to queue.');
          }
        } catch (error) {
          addTestResult('Queue Test', 'error', `Queue system failed: ${error.message}`);
        }
      }

      setCurrentTest('Tests completed!');
      
    } catch (error) {
      addTestResult('Test Suite', 'error', `Test suite failed: ${error.message}`);
    }
    
    setIsRunningTests(false);
    setCurrentTest('');
  };

  const stopAllPlayback = () => {
    if (deckA.isPlaying) pauseDeckA();
    if (deckB.isPlaying) pauseDeckB();
    if (isAutoDJ) handleAutoDJToggle(false);
  };

  const clearDecks = () => {
    stopAllPlayback();
    setTimeout(() => {
      ejectDeckA();
      ejectDeckB();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="w-5 h-5 text-green-400" />
              AutoDJ System Tester
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Comprehensive testing of AutoDJ functionality and deck operations
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400">
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Panel - Current Status */}
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Current System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">AutoDJ Status:</span>
                    <Badge className={isAutoDJ ? 'bg-green-500' : 'bg-red-500'}>
                      {isAutoDJ ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Active Deck:</span>
                    <Badge className="bg-blue-500">{activeDeck}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Deck A:</span>
                    <div className="flex items-center gap-2">
                      {deckA.track && <Music className="w-4 h-4 text-green-400" />}
                      <Badge className={deckA.isPlaying ? 'bg-green-500' : 'bg-slate-600'}>
                        {deckA.isPlaying ? 'PLAYING' : deckA.track ? 'LOADED' : 'EMPTY'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Deck B:</span>
                    <div className="flex items-center gap-2">
                      {deckB.track && <Music className="w-4 h-4 text-green-400" />}
                      <Badge className={deckB.isPlaying ? 'bg-green-500' : 'bg-slate-600'}>
                        {deckB.isPlaying ? 'PLAYING' : deckB.track ? 'LOADED' : 'EMPTY'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Queue Length:</span>
                    <Badge className="bg-purple-500">{queue.length} tracks</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Library Size:</span>
                    <Badge className="bg-yellow-500">{tracks.length} tracks</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Control Buttons */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Test Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={runAutoDJTests}
                    disabled={isRunningTests}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isRunningTests ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Running Tests...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Run Full AutoDJ Test Suite
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={stopAllPlayback}
                    variant="outline"
                    className="w-full bg-red-600/20 text-red-400 border-red-600/50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop All Playback
                  </Button>
                  
                  <Button
                    onClick={clearDecks}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Both Decks
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Test Results */}
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700/50 flex-1">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    Test Results
                    {isRunningTests && (
                      <Badge className="bg-blue-500">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        {currentTest}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.length === 0 && !isRunningTests && (
                    <div className="text-center py-8 text-slate-500">
                      <TestTube className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p>Click "Run Full AutoDJ Test Suite" to begin testing</p>
                    </div>
                  )}
                  
                  {testResults.map((result, index) => (
                    <Alert 
                      key={index} 
                      className={`${
                        result.status === 'success' ? 'bg-green-900/50 border-green-500/50' :
                        result.status === 'warning' ? 'bg-yellow-900/50 border-yellow-500/50' :
                        'bg-red-900/50 border-red-500/50'
                      }`}
                    >
                      {result.status === 'success' && <CheckCircle className="h-4 w-4" />}
                      {result.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {result.status === 'error' && <AlertTriangle className="h-4 w-4" />}
                      <AlertDescription className="text-sm">
                        <strong>{result.test}:</strong> {result.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}