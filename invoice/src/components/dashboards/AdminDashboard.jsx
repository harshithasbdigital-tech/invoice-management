import React from 'react';
import { formatCurrency, getInvoicePaymentStatus } from '../../utils/numberToWords';
import {
  IconInvoice,
  IconPlus,
  IconCheckCircle,
  IconClock,
  IconEye,
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconCreditCard,
  IconShield,
  IconChartBar,
  IconHistory,
  IconDocument,
  IconFileText,
  IconBill,
  IconReceipt,
  IconPurchaseOrder
} from '../Icons';

export function AdminDashboard({
  invoices,
  company,
  bank,
  services,
  users,
  payments = [],
  onNewInvoice,
  onCreateDocument,
  onViewInvoice,
  onToggleStatus,
  onNavigate
}) {
  const handleCreate = (type) => {
    if (onCreateDocument) {
      onCreateDocument(type);
    } else if (onNewInvoice) {
      onNewInvoice(type);
    }
  };

  // Top 4 Metrics
  const totalInvoicesCount = invoices.length;
  const totalInvoiced = invoices
    .filter((inv) => inv.status !== 'Cancelled')
    .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const amountReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ||
    invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || (i.status === 'Paid' ? Number(i.grandTotal) : 0)), 0);
  const outstanding = invoices
    .filter((inv) => inv.status !== 'Cancelled')
    .reduce((sum, inv) => {
      const s = getInvoicePaymentStatus(inv, payments);
      return sum + s.remaining;
    }, 0);

  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Monthly Revenue Data for Chart
  const monthlyData = [
    { month: 'Jun', billed: 45000, received: 45000 },
    { month: 'Jul', billed: 65000, received: 62000 },
    { month: 'Aug', billed: 82000, received: 78000 },
    { month: 'Sep', billed: 95000, received: 90000 },
    { month: 'Oct (Current)', billed: totalInvoiced, received: amountReceived }
  ];
  const maxMonth = Math.max(...monthlyData.map((m) => Math.max(m.billed, m.received)), 100000);

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

      {/* 2. Top Key Business Metrics (4 KPI Cards - Normal Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* 1. Total Invoices */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <IconInvoice className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-normal text-slate-900">
            {totalInvoicesCount}
          </div>
        </div>

        {/* 2. Total Invoiced */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Invoiced</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <IconChartBar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-normal text-slate-900">
            {formatCurrency(totalInvoiced)}
          </div>
        </div>

        {/* 3. Amount Received */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Amount Received</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <IconCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-normal text-slate-900">
            {formatCurrency(amountReceived)}
          </div>
        </div>

        {/* 4. Outstanding */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Outstanding</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <IconClock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-normal text-slate-900">
            {formatCurrency(outstanding)}
          </div>
        </div>
      </div>
    </div>
  );
}

