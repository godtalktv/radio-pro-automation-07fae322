import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, CheckCircle, Crown } from 'lucide-react';

export default function MasterLicenseInfo() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader className="text-center border-b border-amber-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="w-8 h-8 text-amber-600" />
                        <CardTitle className="text-2xl text-amber-800">Master Owner License</CardTitle>
                    </div>
                    <Badge className="bg-amber-600 text-white px-4 py-1">
                        Soul Talk On Air - Enterprise License
                    </Badge>
                </CardHeader>
                
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-600" />
                                License Details
                            </h3>
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="space-y-2 text-sm">
                                    <div><strong>Station Name:</strong> Soul Talk On Air</div>
                                    <div><strong>Owner:</strong> Derrick Raybon</div>
                                    <div><strong>Email:</strong> derrickraybon1981@gmail.com</div>
                                    <div className="pt-2 border-t border-gray-200">
                                        <strong>Master Activation Key:</strong>
                                        <div className="bg-gray-100 p-2 rounded font-mono text-xs mt-1 select-all">
                                            RPRO-SOUL-TALK-MAST-2024
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-600" />
                                License Status
                            </h3>
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span><strong>Type:</strong> Enterprise (Master)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span><strong>Status:</strong> Active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span><strong>Expiration:</strong> Never expires</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span><strong>Max Users:</strong> Unlimited</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Enabled Features</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {[
                                'All Playback Features',
                                'Library Management', 
                                'Playlist & Scheduling',
                                'Voice Tracking',
                                'Cart Wall',
                                'Live Streaming',
                                'Weather Integration',
                                'Multi-User Support',
                                'API Access',
                                'Compliance Reporting',
                                'Auto DJ & Clockwheels',
                                'Audio Compressor',
                                'Analytics & Reporting',
                                'All Future Features'
                            ].map(feature => (
                                <div key={feature} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-semibold text-amber-800 mb-2">Important Security Notes</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• This is your master owner license - keep it secure</li>
                            <li>• No hardware restrictions applied to this license</li>
                            <li>• Grants access to all current and future software features</li>
                            <li>• Can be used to activate the software on any system</li>
                            <li>• Contact support if you need additional licenses for staff</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}