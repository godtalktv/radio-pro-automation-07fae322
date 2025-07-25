import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useCustomization } from '../settings/CustomizationProvider';
import { postTweet } from '@/api/functions';
import { Twitter, X, Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TwitterPanel({ onClose }) {
  const { settings, updateSettings, getStationName } = useCustomization();
  const { toast } = useToast();

  const [manualTweet, setManualTweet] = useState('');
  const [isTweeting, setIsTweeting] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const [isAutoTweetEnabled, setIsAutoTweetEnabled] = useState(settings?.twitter_auto_post_enabled || false);
  const [template, setTemplate] = useState(settings?.twitter_now_playing_template || '');

  const handleManualTweet = async () => {
    if (!manualTweet.trim()) {
      setStatus({ type: 'error', message: 'Tweet content cannot be empty.' });
      return;
    }
    setIsTweeting(true);
    setStatus({ type: 'loading', message: 'Posting tweet...' });
    try {
      await postTweet({ status: manualTweet.trim() });
      setStatus({ type: 'success', message: 'Tweet posted successfully!' });
      setManualTweet('');
      toast({ title: "Success", description: "Your tweet has been posted." });
    } catch (error) {
      console.error("Failed to post tweet:", error);
      setStatus({ type: 'error', message: `Failed to post tweet: ${error.message}` });
      toast({ variant: "destructive", title: "Error", description: `Failed to post tweet. ${error.data?.error}` });
    } finally {
      setIsTweeting(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      await updateSettings({
        ...settings,
        twitter_auto_post_enabled: isAutoTweetEnabled,
        twitter_now_playing_template: template,
      });
      toast({ title: "Settings Saved", description: "Twitter settings have been updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save Twitter settings." });
    }
  };

  const charCount = manualTweet.length;
  const charColor = charCount > 280 ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Twitter className="w-5 h-5 text-sky-400" />
              Twitter Integration
            </CardTitle>
            <CardDescription className="text-slate-400">Post updates directly to your timeline.</CardDescription>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Manual Tweet Section */}
          <div className="space-y-2">
            <Label htmlFor="manual-tweet" className="text-slate-300 font-semibold">Compose Tweet</Label>
            <Textarea
              id="manual-tweet"
              value={manualTweet}
              onChange={(e) => setManualTweet(e.target.value)}
              placeholder={`What's happening on ${getStationName()}?`}
              className="bg-slate-800 border-slate-600 text-white h-24"
              maxLength="280"
            />
            <div className="flex justify-between items-center">
              <p className={`text-xs ${charColor}`}>{charCount} / 280</p>
              <Button onClick={handleManualTweet} disabled={isTweeting || charCount === 0 || charCount > 280}>
                {isTweeting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Post Tweet
              </Button>
            </div>
          </div>

          {/* Status Message */}
          {status.type !== 'idle' && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${
              status.type === 'success' ? 'bg-green-900/50 text-green-300' :
              status.type === 'error' ? 'bg-red-900/50 text-red-300' :
              'bg-blue-900/50 text-blue-300'
            }`}>
              {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {status.type === 'error' && <AlertTriangle className="w-4 h-4" />}
              {status.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Auto-Tweet Settings */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white">Automation Settings</h3>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <Label htmlFor="auto-tweet-enable" className="text-slate-300">
                Auto-Tweet "Now Playing"
              </Label>
              <Switch
                id="auto-tweet-enable"
                checked={isAutoTweetEnabled}
                onCheckedChange={setIsAutoTweetEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tweet-template" className="text-slate-300">Tweet Template</Label>
              <Input
                id="tweet-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Enter your tweet template"
                className="bg-slate-800 border-slate-600 text-white"
                disabled={!isAutoTweetEnabled}
              />
              <p className="text-xs text-slate-500">
                Use placeholders: `{"{title}"}`, `{"{artist}"}`, `{"{stationName}"}`
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSettingsSave} variant="outline">Save Settings</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}