import React, { useState, useEffect } from 'react';
import {
  IconUsers,
  IconPlus,
  IconTrash,
  IconShield,
  IconCheck,
  IconCalculator,
  IconEdit,
  IconDotsVertical,
  IconCopy
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function UsersPage({ users, onUpdateUsers, currentUser, onSelectUser, isAdmin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [actionMenuState, setActionMenuState] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const handleClose = (e) => {
      if (!e.target.closest('.user-action-dropdown') && !e.target.closest('.user-action-trigger')) {
        setActionMenuState(null);
      }
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  const totalPages = Math.ceil((users || []).length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = (users || []).slice(startIndex, startIndex + PAGE_SIZE);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    password: ''
  });

  const handleOpenAdd = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      role: 'User',
      password: 'password123'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || 'password123'
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const initials = formData.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    if (editingUserId) {
      const updated = users.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              name: formData.name.trim(),
              email: formData.email.trim(),
              role: formData.role,
              password: formData.password,
              avatar: initials || u.avatar
            }
          : u
      );
      onUpdateUsers(updated);
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        password: formData.password || 'password123',
        avatar: initials || 'ST'
      };
      onUpdateUsers([...users, newUser]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = (id) => {
    if (!isAdmin) {
      alert("Only administrators can remove staff members.");
      return;
    }
    if (users.length <= 1) {
      alert("Cannot delete the only remaining account.");
      return;
    }
    if (confirm("Are you sure you want to remove this account?")) {
      const updated = users.filter((u) => u.id !== id);
      onUpdateUsers(updated);
    }
  };

  const copyCredentials = (u) => {
    const text = `Invoices Login Credentials:\nRole: ${u.role}\nEmail: ${u.email}\nPassword: ${u.password || 'password123'}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Action Header */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create New User Login</span>
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto p-4 sm:p-5">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 border border-slate-200 w-16 text-center">SL NO</th>
                <th className="py-3 px-4 border border-slate-200">Staff Member</th>
                <th className="py-3 px-4 border border-slate-200">Email / Login ID</th>
                <th className="py-3 px-4 border border-slate-200 text-center">Role</th>
                <th className="py-3 px-4 border border-slate-200 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u, idx) => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/70 transition ${isCurrent ? 'bg-blue-50/20' : ''}`}>
                    <td className="py-3.5 px-4 border border-slate-200 text-slate-400 font-semibold text-center">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 ${
                          u.role === 'Admin'
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : u.role === 'Accountant'
                            ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          {u.avatar || 'ST'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 border border-slate-200 text-slate-700 font-medium">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 border border-slate-200 text-center whitespace-nowrap">
                      <span className={`text-xs font-semibold ${
                        u.role === 'Admin'
                          ? 'text-blue-600'
                          : u.role === 'Accountant'
                          ? 'text-indigo-600'
                          : 'text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 border border-slate-200 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actionMenuState?.id === u.id) {
                            setActionMenuState(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const openUp = window.innerHeight - rect.bottom < 170;
                            setActionMenuState({
                              id: u.id,
                              user: u,
                              top: openUp ? undefined : rect.bottom + 4,
                              bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
                              right: Math.max(12, window.innerWidth - rect.right)
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer user-action-trigger"
                        title="Actions"
                      >
                        <IconDotsVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION (LIMIT 10 PER PAGE) ── */}
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 3-dots Action Menu Dropdown */}
      {actionMenuState && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-48 text-xs font-semibold user-action-dropdown animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: actionMenuState.top !== undefined ? `${actionMenuState.top}px` : undefined,
            bottom: actionMenuState.bottom !== undefined ? `${actionMenuState.bottom}px` : undefined,
            right: `${actionMenuState.right}px`
          }}
        >
          <button
            type="button"
            onClick={() => {
              const u = actionMenuState.user;
              copyCredentials(u);
              setTimeout(() => setActionMenuState(null), 800);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-blue-600 transition cursor-pointer"
          >
            {copiedId === actionMenuState.user?.id ? (
              <>
                <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <IconCopy className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Copy Credentials</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                const u = actionMenuState.user;
                setActionMenuState(null);
                handleOpenEdit(u);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-blue-600 transition cursor-pointer border-t border-slate-100"
            >
              <IconEdit className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Edit User</span>
            </button>
          )}

          {isAdmin && users.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const u = actionMenuState.user;
                setActionMenuState(null);
                handleDeleteUser(u.id);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition cursor-pointer border-t border-slate-100"
            >
              <IconTrash className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Delete User</span>
            </button>
          )}
        </div>
      )}

      {/* Modal Dialog for Create / Edit User Credentials */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingUserId ? 'Edit User Credentials' : 'Create Staff / Accountant Login'}
            </h2>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@company.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Account Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="User">Staff User (Counter Billing & Invoices)</option>
                  <option value="Accountant">Accountant (Taxation & Ledger Desk)</option>
                  <option value="Admin">Admin (Full Business Setup & Users)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Login Password *
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="e.g. Pass123!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Staff member or accountant will use this password to sign in.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
                >
                  {editingUserId ? 'Save Changes' : 'Create Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
