import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

const InfoBox = ({ title, value }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };
  return (
    <div>
      <label className="text-sm font-medium text-slate-300">{title}</label>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-grow p-2 bg-slate-800 rounded-md font-mono text-xs text-slate-100 select-all">
          {value}
        </div>
        <Button size="icon" variant="ghost" onClick={copyToClipboard} className="flex-shrink-0">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function GoogleOauthPreflightCheck({ open, onClose, onProceed }) {
  const GCS_URL = "https://console.cloud.google.com/apis/credentials";
  const ORIGIN_URL = `https://${window.location.hostname}`;
  const REDIRECT_URL = `https://${window.location.hostname}/functions/googleOauthCallback`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-yellow-400" />
            Google Connection Pre-flight Check
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2">
            Google requires your project settings to be perfect. Please verify every item on this checklist in your Google Cloud Console before proceeding.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="bg-yellow-600/10 border-yellow-500/30">
            <AlertTitle className="text-yellow-300">Open Your Google Console</AlertTitle>
            <AlertDescription className="text-yellow-200/90">
              <a href={GCS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
                Click here to open your credentials page in a new tab <ExternalLink className="w-4 h-4" />
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 p-4 border border-slate-700 rounded-lg">
            <h3 className="font-semibold text-slate-100">Step 1: Verify URLs in Credentials</h3>
            <InfoBox title="Authorized JavaScript origins" value={ORIGIN_URL} />
            <InfoBox title="Authorized redirect URIs" value={REDIRECT_URL} />
          </div>

          <div className="space-y-3 p-4 border border-slate-700 rounded-lg">
            <h3 className="font-semibold text-slate-100">Step 2: Verify OAuth Consent Screen</h3>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
              <li>Ensure **Publishing status** is "In production".</li>
              <li>Under **Authorized domains**, ensure `base44.app` is listed.</li>
              <li>Ensure links for **Privacy Policy** and **Terms of Service** are filled out.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-300">Cancel</Button>
          <Button onClick={onProceed} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            I've Verified Everything, Connect Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}