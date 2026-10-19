import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import {
  IconSearch,
  IconPlus,
  IconCreditCard,
  IconCheckCircle,
  IconClock,
  IconInvoice,
  IconClose,
  IconShield
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function PaymentsPage({
  payments = [],
  invoices = [],
  currentUser,
  onRecordPayment,
  onViewInvoice,
  initialInvoice = null,
  initialOpenModal = false,
  hideHeader = false,
  onBack
}) {
  const isAdmin = currentUser?.role === 'Admin';
  const isAccountant = currentUser?.role === 'Accountant';
  const isSalesStaff = currentUser?.role === 'User' || currentUser?.role === 'Staff';
  const canRecordPayment = isAdmin || isAccountant;

  if (isSalesStaff) {
    return null;
  }

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialOpenModal || initialInvoice));

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(initialInvoice?.id || '');
  const [amount, setAmount] = useState(initialInvoice?.grandTotal || '');
  const [paymentMode, setPaymentMode] = useState('UPI / Net Banking');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Sync initialInvoice / initialOpenModal
  React.useEffect(() => {
    if (initialInvoice) {
      setSelectedInvoiceId(initialInvoice.id);
      const remaining = Number(initialInvoice.grandTotal || 0) - (Number(initialInvoice.paidAmount) || 0);
      setAmount(remaining > 0 ? remaining : initialInvoice.grandTotal);
      setIsModalOpen(true);
    } else if (initialOpenModal) {
      openPaymentModal();
    }
  }, [initialInvoice, initialOpenModal]);

  // Unpaid Invoices available for payment
  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'Paid' && inv.status !== 'Cancelled');

  // Overdue Invoices: Unpaid and dueDate < today
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueInvoices = unpaidInvoices.filter(
    (inv) => inv.dueDate && inv.dueDate < todayStr
  );

  // Financial Stats
  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalOutstanding = unpaidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.grandTotal) || 0),
    0
  );

  const openPaymentModal = (invoice = null) => {
    if (invoice) {
      setSelectedInvoiceId(invoice.id);
      const remaining = Number(invoice.grandTotal || 0) - (Number(invoice.paidAmount) || 0);
      setAmount(remaining > 0 ? remaining : invoice.grandTotal);
    } else if (unpaidInvoices.length > 0) {
      setSelectedInvoiceId(unpaidInvoices[0].id);
      const target = unpaidInvoices[0];
      const remaining = Number(target.grandTotal || 0) - (Number(target.paidAmount) || 0);
      setAmount(remaining > 0 ? remaining : target.grandTotal);
    } else {
      setSelectedInvoiceId('');
      setAmount('');
    }
    setPaymentMode('UPI / Net Banking');
    setTransactionRef('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleInvoiceSelect = (invId) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i.id === invId);
    if (target) {
      const remaining = Number(target.grandTotal || 0) - (Number(target.paidAmount) || 0);
      setAmount(remaining > 0 ? remaining : target.grandTotal);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      alert('Please select an invoice to record payment for.');
      return;
    }

    const targetInvoice = invoices.find((i) => i.id === selectedInvoiceId);
    if (!targetInvoice) return;

    const receiptNum = `SB-REC-${1000 + payments.length + 1}`;
    const paymentPayload = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      clientName: targetInvoice.client?.name || 'Client',
      amount: Number(amount) || targetInvoice.grandTotal,
      paymentMode,
      transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: paymentDate,
      recordedBy: currentUser.name,
      notes
    };

    onRecordPayment(paymentPayload, targetInvoice);
    setIsModalOpen(false);
  };

  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.receiptNumber.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
      (p.paymentMode && p.paymentMode.toLowerCase().includes(q))
    );
  });

  // Reset to page 1 on search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredPayments.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition mb-1 cursor-pointer"
              >
                &larr; Back to Invoices
              </button>
            )}
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment Logs &amp; Reconciliation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified remittance logs and audit-reconciled transactions
            </p>
          </div>

          {canRecordPayment && (
            <button
              onClick={() => openPaymentModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <IconPlus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Recorded Payment Logs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified remittance logs and audit-reconciled transactions
            </p>
          </div>

          {canRecordPayment && (
            <button
              onClick={() => openPaymentModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <IconPlus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      )}

      {/* Summary KPI Cards - Plain & Clean */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <IconCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalReceived)}
          </div>
          <div className="text-xs text-slate-400">
            Across {payments.length} verified settlements
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-400">
            {unpaidInvoices.length} invoices awaiting payment
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Balance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {overdueInvoices.length} Invoices
          </div>
          <div className="text-xs text-slate-400">
            Past agreed credit payment term
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reconciliation Status</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <IconShield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">
            {Math.round((payments.length / (invoices.length || 1)) * 100)}%
          </div>
          <div className="text-xs text-slate-400">
            Audit-verified settlements
          </div>
        </div>
      </div>

      {/* Overdue Invoices Alert Banner (if any) */}
      {overdueInvoices.length > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-bold text-sm text-rose-900">
                Action Required: {overdueInvoices.length} Overdue Invoices
              </h3>
            </div>
            <span className="text-xs text-rose-700 font-medium">
              Past payment deadline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white p-3.5 rounded-xl border border-rose-200/80 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="font-mono font-bold text-xs text-blue-600">{inv.invoiceNumber}</div>
                  <div className="font-bold text-xs text-slate-800">{inv.client?.name}</div>
                  <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                    Due Date: {inv.dueDate}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="font-extrabold text-xs text-slate-900">
                    {formatCurrency(inv.grandTotal)}
                  </div>
                  {canRecordPayment && (
                    <button
                      onClick={() => openPaymentModal(inv)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                    >
                      Record Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow flex items-center gap-3">
        <IconSearch className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by receipt #, invoice #, client name, transaction reference, or mode..."
          className="w-full text-sm outline-none text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Recorded Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recorded Payments Log</h2>
            <p className="text-xs text-slate-500">Chronological history of settled remittances</p>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-3.5 border border-slate-200">Receipt Number</th>
                <th className="py-3 px-3.5 border border-slate-200">Invoice Number</th>
                <th className="py-3 px-3.5 border border-slate-200">Client Name</th>
                <th className="py-3 px-3.5 border border-slate-200">Amount</th>
                <th className="py-3 px-3.5 border border-slate-200">Payment Mode</th>
                <th className="py-3 px-3.5 border border-slate-200">Txn Reference</th>
                <th className="py-3 px-3.5 border border-slate-200">Date</th>
                <th className="py-3 px-3.5 border border-slate-200">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5 border border-slate-200 font-bold text-slate-800">
                    {p.receiptNumber}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 font-bold text-blue-600">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 font-semibold text-slate-800">
                    {p.clientName}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 font-extrabold text-slate-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {p.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 text-slate-600 text-[11px]">
                    {p.transactionRef}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 text-slate-600">
                    {p.date}
                  </td>
                  <td className="py-3 px-3.5 border border-slate-200 text-slate-700 font-medium">
                    {p.recordedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <IconCreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No payment records found.</p>
          </div>
        )}

        {/* ── PAGINATION (LIMIT 10 PER PAGE) ── */}
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-16 p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconCreditCard className="w-5 h-5 text-emerald-600" />
                <span>Record Client Payment</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Select Unpaid Invoice *
                </label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 font-medium"
                >
                  <option value="">-- Choose an unpaid invoice --</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.client?.name} ({formatCurrency(inv.grandTotal)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                  >
                    <option value="UPI / Net Banking">UPI / Net Banking</option>
                    <option value="IMPS / NEFT Transfer">IMPS / NEFT Transfer</option>
                    <option value="Cheque Deposit">Cheque Deposit</option>
                    <option value="Cash Settlement">Cash Settlement</option>
                    <option value="Debit / Credit Card">Debit / Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Transaction / UTR Reference ID
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UPI-9840291048 or CHQ-002145"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Internal Remittance Note
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Verified against HDFC Current A/C statement"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Record & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
