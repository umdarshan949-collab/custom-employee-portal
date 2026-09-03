'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import RoleModal from '@/components/RoleModal';
import { UserProfile } from '@/lib/types';
import { ShieldCheck, Plus, Edit2, Trash2, Key, Users } from 'lucide-react';

export default function AdminRolesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const loadData = async () => {
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

      if (!meData.user.permissions.includes('manage:roles')) {
        router.push('/dashboard');
        return;
      }

      // Fetch roles & permissions
      const rolesRes = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await rolesRes.json();
      setRolesList(data.roles || []);
      setAllPermissions(data.allPermissions || []);
    } catch (err) {
      console.error('Failed to load roles data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSaveRole = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let res: Response;
    if (editingRole) {
      res = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } else {
      res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Operation failed');
    }

    loadData();
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role '${roleName}'?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to delete role');
      return;
    }

    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                <ShieldCheck className="w-4 h-4" />
                <span>RBAC Security Matrix</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Roles & Permissions Management</h1>
              <p className="text-xs text-slate-500 mt-1">
                Define role hierarchy, assign granular Zoho API permissions, and manage user authorizations.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRole(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Custom Role
            </button>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rolesList.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                        <Key className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{role.name}</h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">{role.description || 'No description provided.'}</p>

                  <div className="mb-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Assigned Permissions ({role.permissions?.length || 0})
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((rp: any) => (
                          <span
                            key={rp.permission.id}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]"
                          >
                            {rp.permission.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {role._count?.users || 0} Assigned Users
                  </span>
                  <span>Created {new Date(role.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          <RoleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveRole}
            allPermissions={allPermissions}
            initialData={editingRole}
          />
        </main>
      </div>
    </div>
  );
}
