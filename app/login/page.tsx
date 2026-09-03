'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ShieldCheck, Lock, Mail, Key, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { role: 'Admin', email: 'admin@company.com', pass: 'admin123', color: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Full Access + All Apps' },
    { role: 'HR', email: 'hr@company.com', pass: 'hr123', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Zoho People Only' },
    { role: 'Sales', email: 'sales@company.com', pass: 'sales123', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Zoho CRM Only' },
    { role: 'Support', email: 'support@company.com', pass: 'support123', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Zoho Desk Only' },
    { role: 'Finance', email: 'finance@company.com', pass: 'finance123', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', desc: 'Zoho Books Only' },
    { role: 'Manager', email: 'manager@company.com', pass: 'manager123', color: 'bg-slate-100 text-slate-800 border-slate-300', desc: 'People + CRM' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 shadow-xl mb-4">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          BrainWave Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Custom Employee SSO & Role-Based Access Control (RBAC)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-medium flex items-center">
                <Lock className="w-4 h-4 mr-2 flex-shrink-0 text-red-400" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="employee@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Authenticating JWT...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Quick Demo Role Presets
              </span>
              <span className="text-[11px] text-slate-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                    email === acc.email
                      ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${acc.color}`}>
                      {acc.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1 truncate font-mono">
                    {acc.email}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {acc.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Integrated with <span className="font-semibold text-slate-400">Zoho One REST APIs</span> • Custom Auth Token Handling
        </p>
      </div>
    </div>
  );
}
