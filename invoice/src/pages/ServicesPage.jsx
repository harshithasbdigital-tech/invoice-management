import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconSearch,
  IconBriefcase,
  IconDotsVertical
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function ServicesPage({ services, onUpdateServices, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [actionMenuState, setActionMenuState] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const handleClose = (e) => {
      if (!e.target.closest('.service-action-dropdown') && !e.target.closest('.service-action-trigger')) {
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

  const [formData, setFormData] = useState({
    name: '',
    hsnSac: '',
    description: '',
    rate: '',
    unit: 'Unit',
    gstRate: 18
  });

  const filteredServices = services.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.hsnSac || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  });

  // Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredServices.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + PAGE_SIZE);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      hsnSac: '998314',
      description: '',
      rate: '',
      unit: 'Unit',
      gstRate: 18
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      hsnSac: srv.hsnSac || '',
      description: srv.description || '',
      rate: srv.rate,
      unit: srv.unit || 'Unit',
      gstRate: srv.gstRate || 18
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!isAdmin) {
      alert("Only an Administrator can delete services from the catalog.");
      return;
    }
    if (confirm("Are you sure you want to delete this service?")) {
      const updated = services.filter((s) => s.id !== id);
      onUpdateServices(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const parsedGstRate = formData.gstRate === '' || isNaN(Number(formData.gstRate))
      ? 18
      : Number(formData.gstRate);

    if (editingService) {
      const updated = services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              ...formData,
              rate: Number(formData.rate) || 0,
              gstRate: parsedGstRate
            }
          : s
      );
      onUpdateServices(updated);
    } else {
      const newService = {
        id: `srv-${Date.now()}`,
        ...formData,
        rate: Number(formData.rate) || 0,
        gstRate: parsedGstRate
      };
      onUpdateServices([...services, newService]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <IconPlus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow">
        <div className="relative">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by name, HSN/SAC code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4 border border-slate-200 w-16 text-center">SL NO</th>
                <th className="py-3 px-4 border border-slate-200">Service Name &amp; Description</th>
                <th className="py-3 px-4 border border-slate-200">HSN / SAC</th>
                <th className="py-3 px-4 border border-slate-200">GST Rate</th>
                <th className="py-3 px-4 border border-slate-200">Unit</th>
                <th className="py-3 px-4 border border-slate-200">Default Rate</th>
                {isAdmin && (
                  <th className="py-3 px-4 border border-slate-200 text-center w-16">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((srv, idx) => (
                <tr key={srv.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 border border-slate-200 text-slate-400 font-semibold text-center">
                    {startIndex + idx + 1}
                  </td>
                  <td className="py-3.5 px-4 border border-slate-200">
                    <div className="font-bold text-slate-900 text-sm">{srv.name}</div>
                    {srv.description && (
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{srv.description}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 border border-slate-200 font-mono text-slate-700 font-semibold whitespace-nowrap">
                    {srv.hsnSac || '998314'}
                  </td>
                  <td className="py-3.5 px-4 border border-slate-200 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {srv.gstRate !== undefined && srv.gstRate !== null && srv.gstRate !== '' ? srv.gstRate : 18}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 border border-slate-200 text-slate-600 whitespace-nowrap">
                    {srv.unit || 'Unit'}
                  </td>
                  <td className="py-3.5 px-4 border border-slate-200 font-extrabold text-slate-900 font-mono text-sm whitespace-nowrap">
                    {formatCurrency(srv.rate)}
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4 border border-slate-200 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actionMenuState?.id === srv.id) {
                            setActionMenuState(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUp = spaceBelow < 120;
                            setActionMenuState({
                              id: srv.id,
                              service: srv,
                              top: openUp ? undefined : rect.bottom + 4,
                              bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
                              right: Math.max(12, window.innerWidth - rect.right)
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer service-action-trigger"
                        title="Actions"
                      >
                        <IconDotsVertical className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredServices.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <IconBriefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No services found matching your search.</p>
          </div>
        )}

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
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-40 text-xs font-semibold service-action-dropdown animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: actionMenuState.top !== undefined ? `${actionMenuState.top}px` : undefined,
            bottom: actionMenuState.bottom !== undefined ? `${actionMenuState.bottom}px` : undefined,
            right: `${actionMenuState.right}px`
          }}
        >
          <button
            onClick={() => {
              const srv = actionMenuState.service;
              setActionMenuState(null);
              handleOpenEdit(srv);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-blue-600 transition cursor-pointer"
          >
            <IconEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Service</span>
          </button>
          <button
            onClick={() => {
              const srv = actionMenuState.service;
              setActionMenuState(null);
              handleDelete(srv.id);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition cursor-pointer"
          >
            <IconTrash className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete Service</span>
          </button>
        </div>
      )}

      {/* Modal Dialog for Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Custom Software Development"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsnSac}
                    onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
                    placeholder="e.g. 998314"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Hour, Month, Piece, Card"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Default Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">
                      GST Rate (%) *
                    </label>
                    <span className="text-[10px] text-slate-400">Type any %</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      required
                      value={formData.gstRate}
                      onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                  {/* Quick-select preset buttons */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                    {[0, 5, 12, 18, 28].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFormData({ ...formData, gstRate: pct })}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          Number(formData.gstRate) === pct
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Description / Deliverables Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this service provides..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
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
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
