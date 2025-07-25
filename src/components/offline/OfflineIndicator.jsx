import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, Download, RotateCw } from 'lucide-react'; // Changed Sync to RotateCw
import offlineManager from '../utils/OfflineManager';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe((event) => {
      if (event.type === 'offline') {
        setIsOnline(false);
        setShowOfflineAlert(true);
      } else if (event.type === 'online') {
        setIsOnline(true);
        setShowOfflineAlert(false);
      }
    });

    return unsubscribe;
  }, []);

  const handlePreloadContent = async () => {
    setIsPreloading(true);
    try {
      // Get tracks from local storage or current state
      const tracks = await offlineManager.getOfflineData('tracks');
      await offlineManager.preloadAudioFiles(tracks || []);
    } catch (error) {
      console.error('Failed to preload content:', error);
    }
    setIsPreloading(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Connection Status Badge */}
      <Badge className={`${
        isOnline 
          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
          : 'bg-red-500/20 text-red-400 border-red-500/30'
      } animate-pulse`}>
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            ONLINE
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            OFFLINE
          </>
        )}
      </Badge>

      {/* Offline Alert */}
      {showOfflineAlert && (
        <Alert className="bg-red-500/10 border-red-500/20 text-red-300 w-80">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">You're now offline</p>
              <p className="text-xs">Using cached data. Changes will sync when connection returns.</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreloadContent}
                  disabled={isPreloading}
                  className="text-xs bg-red-900/20 border-red-500/30 text-red-300"
                >
                  {isPreloading ? (
                    <>
                      <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                      Preloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Preload Audio
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOfflineAlert(false)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}