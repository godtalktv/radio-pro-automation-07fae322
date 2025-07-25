import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Terms() {
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
              <FileText className="w-6 h-6 text-blue-400" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p className="text-sm text-slate-400">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Acceptance of Terms</h2>
                <p>
                  By accessing and using RadioPro Automation, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Use License</h2>
                <p>
                  Permission is granted to temporarily use RadioPro Automation for radio broadcasting and 
                  automation purposes. This is the grant of a license, not a transfer of title, and under this license you may:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>Use the software for legitimate radio broadcasting</li>
                  <li>Upload and manage your audio content</li>
                  <li>Create playlists and automation schedules</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">User Responsibilities</h2>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>Ensuring you have rights to all audio content you upload</li>
                  <li>Complying with broadcasting regulations in your jurisdiction</li>
                  <li>Maintaining the confidentiality of your account</li>
                  <li>Reporting any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Content Restrictions</h2>
                <p>
                  You may not upload content that is illegal, infringes on copyrights, or violates 
                  broadcasting standards. We reserve the right to remove content that violates these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Service Availability</h2>
                <p>
                  We strive to provide continuous service but cannot guarantee 100% uptime. 
                  We recommend having backup systems in place for critical broadcasting operations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
                <p>
                  RadioPro Automation shall not be liable for any damages arising from the use or 
                  inability to use this service, including but not limited to lost broadcasts or revenue.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Contact Information</h2>
                <p>
                  If you have questions about these Terms of Service, please contact us at:
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