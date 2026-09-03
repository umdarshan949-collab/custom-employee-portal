'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ZohoAppCard from '@/components/ZohoAppCard';
import { UserProfile } from '@/lib/types';
import { ZohoServiceMeta } from '@/lib/zoho';
import { ShieldCheck, ShieldAlert, Sparkles, Activity, KeyRound, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<ZohoServiceMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
        setServices(data.authorizedServices);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Validating RBAC Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar user={user} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Custom Employee Portal</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                  Logged in as <span className="font-semibold text-white">{user?.email}</span> with assigned role <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-900 text-blue-200 border border-blue-700 text-xs font-bold">{user?.roleName}</span>.
                </p>
              </div>

              <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-4 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Authorized Zoho Services</div>
                  <div className="text-xl font-bold text-white">{services.length} Applications</div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Applications Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Your Authorized Zoho Applications
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Single Sign-On (SSO) Managed via Central Portal
              </span>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ZohoAppCard
                    key={service.code}
                    service={service}
                    userRole={user?.roleName || 'Employee'}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-amber-200 p-8 text-center shadow-sm">
                <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Zoho Services Assigned</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Your current role (<span className="font-semibold">{user?.roleName}</span>) does not have any authorized Zoho application permissions assigned yet. Contact your portal administrator.
                </p>
              </div>
            )}
          </div>

          {/* RBAC Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-3">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Assigned RBAC Security Permissions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-medium"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
