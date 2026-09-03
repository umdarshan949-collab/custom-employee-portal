'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { UserProfile, AuditLogItem } from '@/lib/types';
import { FileText, Search, RefreshCw, Activity } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Check current user
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      if (!meData.user.permissions.includes('view:audit_logs')) {
        router.push('/dashboard');
        return;
      }

      // Fetch logs
      const logsRes = await fetch('/api/audit-logs?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logsData = await logsRes.json();
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [router]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.userEmail && l.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <div className="flex flex-1">
        <Sidebar user={user} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                <FileText className="w-4 h-4" />
                <span>Security & Access Auditing</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Audit Logs & Activity Tracking</h1>
              <p className="text-xs text-slate-500 mt-1">
                Monitor system logins, RBAC policy enforcement, user modifications, and Zoho API accesses.
              </p>
            </div>

            <button
              onClick={loadLogs}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Refresh Logs
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                Logged Security Events ({filteredLogs.length})
              </span>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200">Timestamp</th>
                    <th className="px-4 py-3 border-b border-slate-200">Event Action</th>
                    <th className="px-4 py-3 border-b border-slate-200">User Email</th>
                    <th className="px-4 py-3 border-b border-slate-200">Event Details</th>
                    <th className="px-4 py-3 border-b border-slate-200">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-sans">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            log.action.includes('SUCCESS') || log.action.includes('CREATE')
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : log.action.includes('FAILED') || log.action.includes('DENIED')
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{log.userEmail || 'System'}</td>
                      <td className="px-4 py-3 font-sans text-slate-600">{log.details || '-'}</td>
                      <td className="px-4 py-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
