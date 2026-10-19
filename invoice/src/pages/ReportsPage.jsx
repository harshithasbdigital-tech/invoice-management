import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import {
  IconDownload,
  IconPrint
} from '../components/Icons';

export function ReportsPage({ invoices, payments, users, currentUser }) {
  const isAdmin = currentUser.role === 'Admin';
  const isAccountant = currentUser.role === 'Accountant';

  const [timeRange, setTimeRange] = useState('all'); // all, thisMonth, lastMonth

  // Financial calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  const totalCgst = invoices.reduce((sum, inv) => sum + (Number(inv.cgstTotal) || 0), 0);
  const totalSgst = invoices.reduce((sum, inv) => sum + (Number(inv.sgstTotal) || 0), 0);
  const totalIgst = invoices.reduce((sum, inv) => sum + (Number(inv.igstTotal) || 0), 0);
  const totalGstLiability = totalCgst + totalSgst + totalIgst;

  // Monthly breakdown mock/actual
  const monthsData = [
    { month: 'Jun 2026', billed: 42000, collected: 42000 },
    { month: 'Jul 2026', billed: 68000, collected: 65000 },
    { month: 'Aug 2026', billed: 85000, collected: 80000 },
    { month: 'Sep 2026', billed: 92000, collected: 88000 },
    { month: 'Oct 2026', billed: totalBilled, collected: totalReceived }
  ];
  const maxMonthVal = Math.max(...monthsData.map((m) => Math.max(m.billed, m.collected)), 100000);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      'Invoice Number',
      'Date',
      'Due Date',
      'Client Name',
      'Client GSTIN',
      'Place of Supply',
      'Taxable Subtotal',
      'CGST Amount',
      'SGST Amount',
      'IGST Amount',
      'Grand Total',
      'Status',
      'Created By'
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceDate,
      inv.dueDate || '',
      `"${inv.client?.name || ''}"`,
      inv.client?.gstin || 'Unregistered',
      `"${inv.client?.city || ''}, ${inv.client?.state || ''}"`,
      inv.subtotal || 0,
      inv.cgstTotal || 0,
      inv.sgstTotal || 0,
      inv.igstTotal || 0,
      inv.grandTotal || 0,
      inv.status,
      `"${inv.createdBy || ''}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SB_Invoices_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reports &amp; Financial Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <IconDownload className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <IconPrint className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Plain & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Invoiced</div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-xs text-slate-400">Total volume across {invoices.length} invoices</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Received</div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalReceived)}
          </div>
          <div className="text-xs text-slate-400">{Math.round((totalReceived / (totalBilled || 1)) * 100)}% realization rate</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Outstanding Receivables</div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-400">Awaiting reconciliation</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Tax Output</div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalGstLiability)}
          </div>
          <div className="text-xs text-slate-400">CGST + SGST + IGST liability</div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Revenue & Collection Trend</h2>
            <p className="text-xs text-slate-500">Monthly billing volume versus actual realized collections</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              Total Invoiced
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              Amount Collected
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-5 gap-3 sm:gap-6 items-end h-56 pt-8 pb-4 border-b border-slate-100">
          {monthsData.map((d, i) => {
            const billedHeight = Math.max(12, Math.round((d.billed / maxMonthVal) * 100));
            const collectedHeight = Math.max(12, Math.round((d.collected / maxMonthVal) * 100));

            return (
              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="flex items-end gap-1.5 w-full justify-center h-full">
                  {/* Billed Bar */}
                  <div
                    style={{ height: `${billedHeight}%` }}
                    className="w-5 sm:w-10 bg-blue-600 rounded-t-lg transition-all group-hover:bg-blue-700 relative"
                    title={`Invoiced: ${formatCurrency(d.billed)}`}
                  />
                  {/* Collected Bar */}
                  <div
                    style={{ height: `${collectedHeight}%` }}
                    className="w-5 sm:w-10 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600 relative"
                    title={`Collected: ${formatCurrency(d.collected)}`}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-600 text-center">
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
