import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to={createPageUrl('Studio')}>
            <Button variant="outline" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
            </Button>
          </Link>
        </div>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p className="text-sm text-slate-400">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Information We Collect</h2>
                <p>
                  RadioPro Automation collects information necessary to provide radio automation services, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>Account information (name, email address)</li>
                  <li>Audio files and metadata you upload</li>
                  <li>Usage data to improve our services</li>
                  <li>Google Drive access (when you choose to connect)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>Provide radio automation services</li>
                  <li>Store and organize your audio content</li>
                  <li>Enable integrations with third-party services</li>
                  <li>Improve our platform and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Data Storage and Security</h2>
                <p>
                  Your data is stored securely using industry-standard encryption and security practices. 
                  We do not sell, trade, or transfer your personal information to third parties without your consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
                <p>
                  RadioPro may integrate with third-party services like Google Drive. When you connect these services, 
                  you are also subject to their respective privacy policies and terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Disconnect third-party integrations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-blue-400 mt-2">
                  support@radiopro.app
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}