'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import UserModal from '@/components/UserModal';
import { UserProfile } from '@/lib/types';
import { UserCog, Plus, Edit2, Trash2, Search, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

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

      // Check if admin
      if (!meData.user.permissions.includes('manage:users')) {
        router.push('/dashboard');
        return;
      }

      // Fetch users
      const usersRes = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      setUsersList(usersData);

      // Fetch roles
      const rolesRes = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rolesData = await rolesRes.json();
      setRolesList(rolesData.roles || []);
    } catch (err) {
      console.error('Failed to load admin users data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSaveUser = async (formData: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let res: Response;
    if (editingUser) {
      res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } else {
      res = await fetch('/api/users', {
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user '${userName}'?`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to delete user');
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

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                <UserCog className="w-4 h-4" />
                <span>Admin Administration</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
              <p className="text-xs text-slate-500 mt-1">
                Create, edit, assign RBAC roles, and manage employee portal accounts.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Employee User
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                Registered Portal Employees ({filteredUsers.length})
              </span>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter users..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200">Employee</th>
                    <th className="px-4 py-3 border-b border-slate-200">Corporate Email</th>
                    <th className="px-4 py-3 border-b border-slate-200">Department</th>
                    <th className="px-4 py-3 border-b border-slate-200">Assigned Role</th>
                    <th className="px-4 py-3 border-b border-slate-200">Created Date</th>
                    <th className="px-4 py-3 border-b border-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="px-4 py-3.5 font-medium">{u.department}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <ShieldCheck className="w-3 h-3 mr-1 text-amber-600" />
                          {u.role.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={u.id === user?.id}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <UserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveUser}
            roles={rolesList}
            initialData={editingUser}
          />
        </main>
      </div>
    </div>
  );
}
