'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { UserProfile } from '@/lib/types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Database,
  Layers,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceCode = params.service as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [isLiveConfigured, setIsLiveConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'raw' | 'embedded'>('records');

  const fetchServiceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 1. Fetch user auth info
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      // 2. Fetch Zoho service data from backend proxy
      const zohoRes = await fetch(`/api/zoho/${serviceCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const zohoData = await zohoRes.json();

      if (!zohoRes.ok) {
        setError(zohoData);
        return;
      }

      setData(zohoData.data);
      setMeta(zohoData.meta);
      setIsLiveConfigured(zohoData.isLiveConfigured);
    } catch (err: any) {
      setError({ error: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [serviceCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Communicating with Zoho One API...</p>
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
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>

            <button
              onClick={fetchServiceData}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Re-Sync API
            </button>
          </div>

          {/* Access Denied Error */}
          {error ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-xl">
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <ShieldAlert className="w-8 h-8" />
                <h2 className="text-xl font-bold">RBAC Access Control Violation</h2>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 text-sm mb-6">
                <p className="font-semibold">{error.error || 'Access Denied'}</p>
                {error.userRole && (
                  <p className="text-xs mt-1 text-red-700">
                    Your assigned role is <span className="font-bold underline">{error.userRole}</span>. This feature requires the <span className="font-mono bg-red-100 px-1 py-0.5 rounded">{error.requiredPermission}</span> permission code.
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Service Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl ${meta?.color || 'bg-blue-600'} text-white flex items-center justify-center shadow-lg font-bold text-xl`}>
                      <Layers className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-extrabold text-slate-900">{meta?.name}</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Authorized Access
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{meta?.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      isLiveConfigured
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isLiveConfigured ? '🟢 Live OAuth Mode' : '🟡 Sandbox / Mock Mode'}
                    </span>

                    <a
                      href={meta?.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                    >
                      Open Zoho Portal
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                </div>

                {/* Summary Metrics */}
                {data?.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                    {Object.entries(data.summary).map(([key, val]: [string, any]) => (
                      <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data View Tabs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 pt-4 flex items-center justify-between bg-slate-50/50">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab('records')}
                      className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
                        activeTab === 'records'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Application Records ({data?.records?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
                        activeTab === 'raw'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Backend JSON Response
                    </button>
                    <button
                      onClick={() => setActiveTab('embedded')}
                      className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
                        activeTab === 'embedded'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Embedded Frame Integration
                    </button>
                  </div>

                  {activeTab === 'records' && (
                    <div className="relative pb-2">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search records..."
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {activeTab === 'records' && (
                    <div>
                      {data?.records && data.records.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                              <tr>
                                {Object.keys(data.records[0]).map((key) => (
                                  <th key={key} className="px-4 py-3 border-b border-slate-200">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {data.records
                                .filter((rec: any) =>
                                  JSON.stringify(rec).toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((rec: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                    {Object.entries(rec).map(([k, val]: [string, any], cIdx: number) => (
                                      <td key={cIdx} className="px-4 py-3 whitespace-nowrap font-medium">
                                        {k === 'status' || k === 'stage' ? (
                                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                            {String(val)}
                                          </span>
                                        ) : (
                                          String(val)
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No tabular records returned for this service.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'raw' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          JSON Response Payload from Backend Integration API:
                        </span>
                      </div>
                      <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'embedded' && (
                    <div className="bg-slate-900 text-white rounded-xl p-8 text-center">
                      <Database className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <h3 className="text-base font-bold">Single Sign-On (SSO) Portal Frame</h3>
                      <p className="text-xs text-slate-400 max-w-lg mx-auto mt-2">
                        Employees are authenticated seamlessly using token-based RBAC. Direct iframe integration to <span className="font-semibold text-blue-300">{meta?.name}</span> is ready for deployment.
                      </p>
                      <a
                        href={meta?.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-sm"
                      >
                        Launch Interactive Session
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
