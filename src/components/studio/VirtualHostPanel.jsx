import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VirtualHost } from "@/api/entities";
import { User } from '@/api/entities';
import { Mic, User as UserIcon, Volume2, Settings, Plus, Edit, Trash2, Play } from 'lucide-react';
import { generateVoiceIntro } from '@/api/functions';

const PERSONALITY_TEMPLATES = {
    professional: {
        name: "Professional DJ",
        phrases: {
            track_intro: [
                "Coming up next, we have {title} by {artist}",
                "Here's {title} from {artist}",
                "Now playing {title} by {artist}",
                "This is {title} by {artist}"
            ],
            time_check: [
                "It's {time} here on {stationName}",
                "The time now is {time}",
                "Coming up on {time}"
            ],
            weather: [
                "Current temperature is {temp} degrees",
                "Weather update: {temp} degrees and {condition}"
            ]
        }
    },
    energetic: {
        name: "High Energy Host",
        phrases: {
            track_intro: [
                "Pump up the volume! Here's {title} by {artist}!",
                "Get ready to rock with {title} from {artist}!",
                "Turn it up! This is {title} by the amazing {artist}!",
                "Energy time! {title} by {artist} coming at you!"
            ],
            time_check: [
                "It's {time} and we're keeping the party going!",
                "The energy continues at {time}!",
                "Time check - {time} and the hits keep coming!"
            ]
        }
    },
    smooth: {
        name: "Smooth Jazz Host",
        phrases: {
            track_intro: [
                "Settling in with some smooth sounds from {artist} - {title}",
                "Let's slow it down with {title} by {artist}",
                "Here's something smooth - {title} from {artist}",
                "Keeping it mellow with {artist} and {title}"
            ],
            time_check: [
                "It's a smooth {time} here with us",
                "Time flows by... it's {time}",
                "Relaxing into {time}"
            ]
        }
    }
};

export default function VirtualHostPanel({ onClose }) {
    const [hosts, setHosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingHost, setEditingHost] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [testingAudio, setTestingAudio] = useState(false);

    useEffect(() => {
        loadHosts();
    }, []);

    const loadHosts = async () => {
        try {
            const user = await User.me();
            if (user?.organization_id) {
                const fetchedHosts = await VirtualHost.filter({ organization_id: user.organization_id });
                setHosts(fetchedHosts);
            }
        } catch (error) {
            console.error('Failed to load virtual hosts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateHost = () => {
        setEditingHost(null);
        setShowEditor(true);
    };

    const handleEditHost = (host) => {
        setEditingHost(host);
        setShowEditor(true);
    };

    const handleDeleteHost = async (hostId) => {
        if (window.confirm("Are you sure you want to delete this virtual host?")) {
            try {
                await VirtualHost.delete(hostId);
                await loadHosts();
            } catch (error) {
                console.error('Failed to delete host:', error);
            }
        }
    };

    const handleTestVoice = async (host) => {
        setTestingAudio(true);
        try {
            const testScript = `Hello, this is ${host.name} testing the voice system. Here's a sample track introduction: Coming up next, we have a great song for you.`;
            await generateVoiceIntro({ script: testScript, personality: host.personality_type });
        } catch (error) {
            console.error('Voice test failed:', error);
        } finally {
            setTestingAudio(false);
        }
    };

    if (showEditor) {
        return <VirtualHostEditor host={editingHost} onSave={() => { setShowEditor(false); loadHosts(); }} onCancel={() => setShowEditor(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-800 border-b border-slate-700">
                    <CardTitle className="text-white flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-400" />
                        Virtual Radio Hosts
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleCreateHost} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Host
                        </Button>
                        <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            ✕
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="text-slate-400">Loading virtual hosts...</div>
                        </div>
                    ) : hosts.length === 0 ? (
                        <div className="text-center py-12">
                            <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Virtual Hosts</h3>
                            <p className="text-slate-400 mb-6">Create your first virtual host to add personality to your radio station</p>
                            <Button onClick={handleCreateHost} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Host
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hosts.map(host => (
                                <Card key={host.id} className="bg-slate-800/50 border-slate-700/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${host.is_active ? 'bg-green-400' : 'bg-slate-500'}`} />
                                                <div>
                                                    <CardTitle className="text-white text-lg">{host.name}</CardTitle>
                                                    <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                                                        {host.personality_type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleTestVoice(host)}
                                                    disabled={testingAudio}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleEditHost(host)}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteHost(host.id)}
                                                    className="text-red-500/80 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Voice Gender:</span>
                                                <span className="text-white capitalize">{host.voice_gender}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Frequency:</span>
                                                <span className="text-white capitalize">{host.announcement_frequency}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {host.announce_track_intro && <Badge variant="outline" className="text-xs">Track Intros</Badge>}
                                                {host.announce_time && <Badge variant="outline" className="text-xs">Time</Badge>}
                                                {host.announce_weather && <Badge variant="outline" className="text-xs">Weather</Badge>}
                                                {host.announce_station_id && <Badge variant="outline" className="text-xs">Station ID</Badge>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function VirtualHostEditor({ host, onSave, onCancel }) {
    const [formData, setFormData] = useState(host || {
        name: '',
        personality_type: 'professional',
        voice_gender: 'neutral',
        is_active: true,
        announcement_frequency: 'medium',
        announce_track_intro: true,
        announce_time: true,
        announce_weather: true,
        announce_station_id: true,
        time_announcements: ['09:00', '12:00', '15:00', '18:00'],
        custom_phrases: []
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            if (!user?.organization_id) {
                throw new Error('User organization not found');
            }

            const hostData = {
                ...formData,
                organization_id: user.organization_id
            };

            if (host?.id) {
                await VirtualHost.update(host.id, hostData);
            } else {
                await VirtualHost.create(hostData);
            }

            onSave();
        } catch (error) {
            console.error('Failed to save virtual host:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTemplate = (templateKey) => {
        const template = PERSONALITY_TEMPLATES[templateKey];
        if (template) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || template.name,
                custom_phrases: Object.entries(template.phrases).map(([trigger, phrases]) => ({
                    trigger,
                    phrases
                }))
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                    <CardTitle className="text-white">
                        {host ? 'Edit Virtual Host' : 'Create Virtual Host'}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300">Host Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="DJ Mike, Sarah Morning Show..."
                                className="bg-slate-800 border-slate-600 text-white"
                            />
                        </div>
                        
                        <div>
                            <Label className="text-slate-300">Personality Type</Label>
                            <Select 
                                value={formData.personality_type} 
                                onValueChange={(value) => {
                                    setFormData({...formData, personality_type: value});
                                    loadTemplate(value);
                                }}
                            >
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="energetic">High Energy</SelectItem>
                                    <SelectItem value="smooth">Smooth Jazz</SelectItem>
                                    <SelectItem value="alternative">Alternative</SelectItem>
                                    <SelectItem value="country">Country</SelectItem>
                                    <SelectItem value="rock">Rock</SelectItem>
                                    <SelectItem value="pop">Pop</SelectItem>
                                    <SelectItem value="jazz">Jazz</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label className="text-slate-300">Voice Gender</Label>
                            <Select value={formData.voice_gender} onValueChange={(value) => setFormData({...formData, voice_gender: value})}>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-slate-300">Frequency</Label>
                            <Select value={formData.announcement_frequency} onValueChange={(value) => setFormData({...formData, announcement_frequency: value})}>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2 mt-6">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                            />
                            <Label className="text-slate-300">Active</Label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-slate-300">Announcement Types</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'announce_track_intro', label: 'Track Introductions' },
                                { key: 'announce_time', label: 'Time Checks' },
                                { key: 'announce_weather', label: 'Weather Updates' },
                                { key: 'announce_station_id', label: 'Station ID' }
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Switch
                                        checked={formData[key]}
                                        onCheckedChange={(checked) => setFormData({...formData, [key]: checked})}
                                    />
                                    <Label className="text-slate-300 text-sm">{label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-slate-300">Time Announcements (HH:MM)</Label>
                        <Input
                            value={formData.time_announcements?.join(', ') || ''}
                            onChange={(e) => setFormData({...formData, time_announcements: e.target.value.split(',').map(t => t.trim())})}
                            placeholder="09:00, 12:00, 15:00, 18:00"
                            className="bg-slate-800 border-slate-600 text-white"
                        />
                    </div>
                </CardContent>

                <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
                    <Button onClick={onCancel} variant="outline" className="bg-slate-700 border-slate-600 text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? 'Saving...' : 'Save Host'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}