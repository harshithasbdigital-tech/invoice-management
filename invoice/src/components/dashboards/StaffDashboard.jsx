import React, { useState } from 'react';
import { formatCurrency, getInvoicePaymentStatus } from '../../utils/numberToWords';
import {
  IconInvoice,
  IconClock,
  IconCheckCircle,
  IconEye,
  IconSearch,
  IconPlus,
  IconUserCheck,
  IconDocument,
  IconFileText,
  IconBill,
  IconReceipt,
  IconPurchaseOrder
} from '../Icons';

export function StaffDashboard({
  invoices = [],
  quotations = [],
  currentUser,
  company,
  bank,
  services = [],
  clients = [],
  payments = [],
  onNewInvoice,
  onCreateDocument,
  onViewInvoice,
  onNavigate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleCreate = (type) => {
    if (onCreateDocument) {
      onCreateDocument(type);
    } else if (onNewInvoice) {
      onNewInvoice(type);
    }
  };

  // Filter invoices for staff and calculate payment metrics
  const staffInvoices = invoices;
  const totalInvoicesCount = staffInvoices.length;

  const invoiceStatuses = staffInvoices.map((inv) => ({
    inv,
    statusInfo: getInvoicePaymentStatus(inv, payments)
  }));

  const paidInvoices = invoiceStatuses.filter((item) => item.statusInfo.status === 'Paid');
  const partialInvoices = invoiceStatuses.filter((item) => item.statusInfo.status === 'Partial');
  const unpaidInvoices = invoiceStatuses.filter((item) => item.statusInfo.status === 'Unpaid' && item.inv.status !== 'Cancelled');

  // Filtered invoices for table
  const filteredInvoices = invoiceStatuses.filter(({ inv, statusInfo }) => {
    const matchSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.items?.[0]?.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter === 'All') return true;
    return statusInfo.status === statusFilter;
  });

  return (
    <div className="space-y-6">

      {/* ── 6 QUICK ACCESS BUTTONS: INSTANT CREATION (CLEAN WHITE BACKGROUND) ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="pb-1 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Quick Document Creation
          </h2>
        </div>

        {/* 6 Quick Access Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Button 1: Quotation */}
          <button
            type="button"
            onClick={() => handleCreate('quotation')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-amber-100">
              <IconDocument className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
              Quotation
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">Price Estimate</span>
          </button>

          {/* Button 2: Pre-Invoice */}
          <button
            type="button"
            onClick={() => handleCreate('pre_invoice')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-indigo-100">
              <IconFileText className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
              Pre-Invoice
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">Proforma Advance</span>
          </button>

          {/* Button 3: Tax Invoice */}
          <button
            type="button"
            onClick={() => handleCreate('tax_invoice')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-blue-100">
              <IconInvoice className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
              Tax Invoice
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">GST Tax Invoice</span>
          </button>

          {/* Button 4: Billing */}
          <button
            type="button"
            onClick={() => handleCreate('bill')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-emerald-100">
              <IconBill className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
              Billing
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">Cash / Retail Bill</span>
          </button>

          {/* Button 5: Receipts */}
          <button
            type="button"
            onClick={() => handleCreate('receipt')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-purple-50/40 border border-slate-200 hover:border-purple-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-purple-100">
              <IconReceipt className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
              Receipts
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">Money Receipt</span>
          </button>

          {/* Button 6: Purchase Orders */}
          <button
            type="button"
            onClick={() => handleCreate('purchase_order')}
            className="group flex flex-col items-center justify-center p-4 bg-white hover:bg-rose-50/40 border border-slate-200 hover:border-rose-400/80 rounded-2xl transition-all duration-200 cursor-pointer text-center shadow-xs hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2.5 border border-rose-100">
              <IconPurchaseOrder className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
              Purchase Orders
            </span>
            <span className="text-xs text-slate-400 mt-0.5 font-medium">Vendor Order</span>
          </button>
        </div>
      </div>



      {/* Recent Operations Table (Plain, Clean Card) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Operations</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search operations by number, client, or item..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Invoices Table with Reduced Compact Font Sizes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-2 px-3 border border-slate-200">Invoice Number</th>
                <th className="py-2 px-3 border border-slate-200">Customer Name</th>
                <th className="py-2 px-3 border border-slate-200">Date</th>
                <th className="py-2 px-3 border border-slate-200">Due Date</th>
                <th className="py-2 px-3 border border-slate-200">Amount &amp; Paid</th>
                <th className="py-2 px-3 border border-slate-200">Status</th>
                <th className="py-2 px-3 border border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs border border-slate-200">
                    No operations found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.slice(0, 5).map(({ inv, statusInfo }) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition border-b border-slate-200 text-[11px]">
                    <td className="py-2 px-3 border border-slate-200 font-bold font-mono text-slate-900">
                      <button
                        type="button"
                        onClick={() => onViewInvoice && onViewInvoice(inv)}
                        className="hover:underline hover:text-blue-600 transition cursor-pointer text-left"
                        title="Click to view invoice"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-800 font-semibold truncate max-w-[180px]">
                      {inv.client?.name}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-600">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-slate-600">
                      {inv.dueDate || '-'}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900 font-mono">
                      <div>{formatCurrency(inv.grandTotal || 0)}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Paid: {formatCurrency(statusInfo.totalPaid)}
                      </div>
                    </td>
                    <td className="py-2 px-3 border border-slate-200 font-bold uppercase tracking-wider text-[10.5px] text-slate-800">
                      {statusInfo.status === 'Paid'
                        ? 'Paid'
                        : statusInfo.status === 'Partial'
                          ? 'Partial'
                          : inv.status === 'Cancelled'
                            ? 'Cancelled'
                            : 'Unpaid'}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 text-right">
                      {onViewInvoice && (
                        <button
                          type="button"
                          onClick={() => onViewInvoice(inv)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="View Invoice"
                        >
                          <IconEye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
