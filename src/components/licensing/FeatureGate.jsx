import React from 'react';
import { useLicense } from './LicenseManager';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from 'lucide-react';

export default function FeatureGate({ 
    feature, 
    children, 
    fallback = null,
    showUpgradePrompt = true 
}) {
    const { hasFeature, license } = useLicense();

    if (hasFeature(feature)) {
        return children;
    }

    if (fallback) {
        return fallback;
    }

    if (!showUpgradePrompt) {
        return null;
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700 p-6 text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Premium Feature</h3>
            <p className="text-slate-400 mb-4">
                This feature requires a {feature.includes('enterprise') ? 'Enterprise' : 'Professional'} license.
            </p>
            <div className="flex gap-2 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade License
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                    Learn More
                </Button>
            </div>
            <p className="text-xs text-slate-500 mt-4">
                Current License: {license?.license_type || 'None'}
            </p>
        </Card>
    );
}