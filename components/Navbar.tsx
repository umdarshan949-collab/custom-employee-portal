'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { LogOut, User, Shield, Layers } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 via-emerald-500 to-amber-500 flex items-center justify-center font-extrabold text-white shadow-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <Link href="/dashboard" className="text-lg font-bold tracking-tight hover:text-blue-400 transition-colors">
              BrainWave <span className="text-blue-400 text-sm font-normal">Employee Portal</span>
            </Link>
            <span className="hidden sm:inline-block ml-2 text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Zoho One RBAC
            </span>
          </div>
        </div>

        {/* User Status / Actions */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <span>{user.email}</span>
                <span>•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.roleName}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
          >
            <User className="w-3.5 h-3.5 mr-1.5" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
