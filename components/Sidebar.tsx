'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  HelpCircle, 
  CreditCard, 
  ShieldCheck, 
  UserCog, 
  FileText, 
  Settings,
  Lock
} from 'lucide-react';

interface SidebarProps {
  user: UserProfile | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  if (!user) return null;

  const permissions = user.permissions || [];
  const isAdmin = permissions.includes('manage:users');

  const zohoApps = [
    {
      code: 'zoho_people',
      name: 'Zoho People',
      href: '/services/zoho_people',
      icon: Users,
      permission: 'access:zoho_people',
      badge: 'HR',
    },
    {
      code: 'zoho_crm',
      name: 'Zoho CRM',
      href: '/services/zoho_crm',
      icon: Target,
      permission: 'access:zoho_crm',
      badge: 'Sales',
    },
    {
      code: 'zoho_desk',
      name: 'Zoho Desk',
      href: '/services/zoho_desk',
      icon: HelpCircle,
      permission: 'access:zoho_desk',
      badge: 'Support',
    },
    {
      code: 'zoho_books',
      name: 'Zoho Books',
      href: '/services/zoho_books',
      icon: CreditCard,
      permission: 'access:zoho_books',
      badge: 'Finance',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 text-slate-300">
      {/* Navigation Groups */}
      <div className="space-y-6">
        {/* Core Portal */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Overview
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Authorized Services */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Authorized Zoho Services
          </h3>
          <nav className="space-y-1">
            {zohoApps.map((app) => {
              const Icon = app.icon;
              const isAuthorized = isAdmin || permissions.includes(app.permission);
              const isActive = pathname === app.href;

              if (!isAuthorized) {
                return (
                  <div
                    key={app.code}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 cursor-not-allowed opacity-60 bg-slate-900/40"
                    title={`Access restricted for ${user.roleName}`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-3 text-slate-600" />
                      <span>{app.name}</span>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                );
              }

              return (
                <Link
                  key={app.code}
                  href={app.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    <span>{app.name}</span>
                  </div>
                  <span className="text-xs bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                    {app.badge}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              RBAC & Administration
            </h3>
            <nav className="space-y-1">
              <Link
                href="/admin/users"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/admin/users'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserCog className="w-4 h-4 mr-3" />
                User Management
              </Link>
              <Link
                href="/admin/roles"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/admin/roles'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mr-3" />
                Roles & Permissions
              </Link>
              <Link
                href="/admin/audit-logs"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/admin/audit-logs'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                Audit Logs
              </Link>
              <Link
                href="/admin/zoho-config"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/admin/zoho-config'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 mr-3" />
                Zoho Integration Config
              </Link>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
