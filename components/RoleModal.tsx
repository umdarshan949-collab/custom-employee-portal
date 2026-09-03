'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck } from 'lucide-react';

interface PermissionItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  allPermissions: PermissionItem[];
  initialData?: any;
}

export default function RoleModal({ isOpen, onClose, onSave, allPermissions, initialData }: RoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      const existingPermIds = initialData.permissions?.map((p: any) => p.permission.id) || [];
      setSelectedPermissions(existingPermIds);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (pId: string) => {
    if (selectedPermissions.includes(pId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== pId));
    } else {
      setSelectedPermissions([...selectedPermissions, pId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave({
        name,
        description,
        permissionIds: selectedPermissions,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by category
  const categories = Array.from(new Set(allPermissions.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              {initialData ? 'Edit Role & Permission Matrix' : 'Create New RBAC Role'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
              placeholder="e.g. Regional Support Manager"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Describe authorized duties and scope..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Assigned Application & Access Permissions ({selectedPermissions.length} selected)
            </label>

            <div className="space-y-4 border border-slate-200 rounded-lg p-3 bg-slate-50">
              {categories.map((cat) => {
                const catPermissions = allPermissions.filter((p) => p.category === cat);
                return (
                  <div key={cat} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {cat} Permissions
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {catPermissions.map((p) => {
                        const isChecked = selectedPermissions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-start p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.id)}
                              className="mt-0.5 mr-2.5 rounded text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                              <span className="font-semibold block text-slate-800">{p.name}</span>
                              <span className="text-[11px] text-slate-500 block">{p.description}</span>
                              <span className="font-mono text-[10px] text-slate-400 mt-0.5 block">{p.code}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Saving...' : 'Save Role Matrix'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
