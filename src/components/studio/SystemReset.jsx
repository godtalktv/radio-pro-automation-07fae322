import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ScheduleCleanup from './ScheduleCleanup';
import MusicCategoryCreator from './MusicCategoryCreator';
import { RefreshCw, CheckCircle } from 'lucide-react';

export default function SystemReset({ onComplete }) {
  const [currentStep, setCurrentStep] = useState('cleanup'); // cleanup -> categories -> complete

  const handleCleanupComplete = () => {
    setCurrentStep('categories');
  };

  const handleCategoriesComplete = () => {
    setCurrentStep('complete');
  };

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (currentStep === 'complete') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg bg-slate-900 border-slate-700">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">System Reset Complete!</h2>
            <p className="text-slate-400 mb-6">
              Your system has been completely reset and new music categories have been created. 
              You can now start fresh with professional programming.
            </p>
            <Button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-700">
              Return to Studio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl">
        {currentStep === 'cleanup' && (
          <div className="flex flex-col items-center">
            <ScheduleCleanup onComplete={handleCleanupComplete} />
          </div>
        )}
        
        {currentStep === 'categories' && (
          <div className="flex flex-col items-center">
            <MusicCategoryCreator onComplete={handleCategoriesComplete} />
          </div>
        )}
      </div>
    </div>
  );
}