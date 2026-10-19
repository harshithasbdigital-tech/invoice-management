import React, { useState } from 'react';
import {
  IconHistory,
  IconSearch,
  IconShield,
  IconInvoice,
  IconCreditCard,
  IconUsers,
  IconSettings
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function AuditLogsPage({ auditLogs = [], currentUser }) {
  const [filterAction, setFilterAction] = useState('INVOICES');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const counts = React.useMemo(() => {
    let invoices = 0;
    let payments = 0;
    (auditLogs || []).forEach((log) => {
      if (log.action?.includes('INVOICE') || log.entityType === 'Invoice') invoices++;
      if (log.action?.includes('PAYMENT') || log.entityType === 'Payment') payments++;
    });
    return { invoices, payments };
  }, [auditLogs]);

  const filteredLogs = React.useMemo(() => {
    return (auditLogs || [])
      .filter((log) => {
        const matchesFilter =
          filterAction === 'ALL' ||
          (filterAction === 'INVOICES' && (log.action?.includes('INVOICE') || log.entityType === 'Invoice')) ||
          (filterAction === 'PAYMENTS' && (log.action?.includes('PAYMENT') || log.entityType === 'Payment'));

        const q = search.toLowerCase();
        const matchesSearch =
          (log.description || '').toLowerCase().includes(q) ||
          (log.performedBy || '').toLowerCase().includes(q) ||
          (log.entityId || '').toLowerCase().includes(q) ||
          (log.action || '').toLowerCase().includes(q);

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
      });
  }, [auditLogs, filterAction, search, sortBy]);

  // Reset to page 1 on filter/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterAction, search, sortBy]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);

  const getActionBadge = (action) => {
    if (action.includes('PAYMENT')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('USER')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (action.includes('CONFIG') || action.includes('SETTINGS')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') return 'bg-blue-600 text-white';
    if (role === 'Accountant') return 'bg-sky-100 text-sky-800';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by description, entity ID, or user..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter & Sort Dropdowns beside search bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Filter:</span>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-2 font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="INVOICES">Invoices</option>
                <option value="PAYMENTS">Payments</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-2 font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Audit Trail Ledger</h2>
          <span className="text-xs font-semibold text-slate-500">Showing {filteredLogs.length} events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center w-16">SL NO</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Action</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Entity ID</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">Description</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">Performed By</th>
                <th className="border border-slate-200 px-3 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap text-center">Role</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, index) => {
                const dateObj = new Date(log.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="border border-slate-200 px-3 py-2.5 text-center font-mono text-slate-400 font-semibold">
                      {startIndex + index + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{dateStr}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{timeStr}</div>
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-xs">
                        {log.entityId}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 text-slate-700 leading-relaxed min-w-[280px]">
                      {log.description}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap font-bold text-slate-800">
                      {log.performedBy}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5 whitespace-nowrap text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleBadge(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="border border-slate-200 p-10 text-center text-slate-400">
                    <IconHistory className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No audit logs match your filter criteria.</p>
                  </td>
                </tr>
              )}
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

    </div>
  );
}
