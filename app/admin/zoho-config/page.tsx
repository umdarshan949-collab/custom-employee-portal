'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { UserProfile } from '@/lib/types';
import { Settings, ShieldCheck, Key, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function AdminZohoConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLiveConfigured, setIsLiveConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setUser(data.user);

        // Test zoho integration status
        const zohoTestRes = await fetch('/api/zoho/zoho_people', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const zohoData = await zohoTestRes.json();
        setIsLiveConfigured(zohoData.isLiveConfigured || false);
      } catch (err) {
        console.error('Failed to load zoho config:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar user={user} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Settings className="w-4 h-4" />
              <span>Zoho One Integration Settings</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Zoho OAuth & API Configuration</h1>
            <p className="text-xs text-slate-500 mt-1">
              Single Service Account OAuth token management for backend API communication with Zoho One applications.
            </p>
          </div>

          {/* Integration Status Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Key className="w-4 h-4 mr-2 text-blue-600" />
                Integration Status
              </h3>

              <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between ${
                isLiveConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center space-x-3">
                  {isLiveConfigured ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  )}
                  <div>
                    <span className="font-bold text-sm block">
                      {isLiveConfigured ? 'Live Zoho OAuth Active' : 'Sandbox / Mock Mode Active'}
                    </span>
                    <span className="text-xs text-slate-600">
                      {isLiveConfigured
                        ? 'Connected to live Zoho REST APIs with automatic refresh token rotation.'
                        : 'Using built-in sandbox mock data engine for zero-setup demo testing.'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold">Supported Applications:</span>
                  <span className="font-mono text-slate-800">Zoho People, CRM, Desk, Books</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold">Authentication Model:</span>
                  <span className="font-mono text-slate-800">OAuth 2.0 Refresh Token</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-semibold">RBAC Validation:</span>
                  <span className="font-mono text-emerald-600 font-bold">Enforced on Backend API</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" />
                  How to Connect Live Zoho One Account
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  To connect your organization's real Zoho One APIs, open the project's <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">.env</code> file and configure your credentials from the Zoho API Console:
                </p>

                <pre className="bg-slate-950 p-3 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
{`ZOHO_ACCOUNTS_URL="https://accounts.zoho.com"
ZOHO_CLIENT_ID="1000.XXXXXX"
ZOHO_CLIENT_SECRET="XXXXXXXXXXXX"
ZOHO_REFRESH_TOKEN="1000.XXXXXX.XXXXXX"
ZOHO_ORG_ID="123456789"`}
                </pre>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                <a
                  href="https://api-console.zoho.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                >
                  Open Zoho API Console
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
