import React, { useState, useMemo } from 'react';
import { formatCurrency, getInvoicePaymentStatus } from '../utils/numberToWords';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPrint,
  IconInvoice,
  IconCreditNote,
  IconCheckCircle,
  IconCreditCard,
  IconClose,
  IconLock,
  IconDotsVertical,
  IconHistory
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function InvoicesPage({
  invoices = [],
  payments = [],
  currentUser,
  onNewInvoice,
  onViewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onToggleStatus,
  onCancelInvoice,
  onRecordPayment,
  onViewPaymentLogs,
  onConvertToTaxInvoice
}) {
  const isAdmin = currentUser?.role === 'Admin';
  const isAccountant = currentUser?.role === 'Accountant';
  const isSalesStaff = currentUser?.role === 'User' || currentUser?.role === 'Staff';
  const canModify = isAdmin || isAccountant;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [actionMenuState, setActionMenuState] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  React.useEffect(() => {
    if (!actionMenuState) return;
    const handleClose = (e) => {
      if (!e.target.closest('.invoice-action-menu-popup') && !e.target.closest('.invoice-action-trigger')) {
        setActionMenuState(null);
      }
    };
    const handleScroll = () => setActionMenuState(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [actionMenuState]);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / Net Banking');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Accountant Payment Logs Modal State
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsSearchTerm, setLogsSearchTerm] = useState('');
  const [filterLogsInvoiceId, setFilterLogsInvoiceId] = useState(null);

  const filteredPaymentLogs = useMemo(() => {
    let list = Array.isArray(payments) ? payments : [];
    if (filterLogsInvoiceId) {
      list = list.filter((p) => p.invoiceId === filterLogsInvoiceId);
    }
    if (!logsSearchTerm.trim()) return list;
    const q = logsSearchTerm.toLowerCase();
    return list.filter((p) => {
      const rec = (p.receiptNumber || '').toLowerCase();
      const invNum = (p.invoiceNumber || '').toLowerCase();
      const cli = (p.clientName || '').toLowerCase();
      const mode = (p.paymentMode || '').toLowerCase();
      const ref = (p.transactionRef || '').toLowerCase();
      const recBy = (p.recordedBy || '').toLowerCase();
      return rec.includes(q) || invNum.includes(q) || cli.includes(q) || mode.includes(q) || ref.includes(q) || recBy.includes(q);
    });
  }, [payments, filterLogsInvoiceId, logsSearchTerm]);

  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const s = getInvoicePaymentStatus(inv, payments);
      return s.status !== 'Paid' && inv.status !== 'Cancelled';
    });
  }, [invoices, payments]);


  // Cancel / Credit note modal state
  const [cancellingInvoice, setCancellingInvoice] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleOpenRecordPayment = (inv = null) => {
    if (inv) {
      setPaymentInvoiceId(inv.id);
      const s = getInvoicePaymentStatus(inv, payments);
      setPaymentAmount(s.remaining > 0 ? s.remaining : inv.grandTotal);
    } else {
      setPaymentInvoiceId('');
      setPaymentAmount('');
    }
    setPaymentMode('UPI / Net Banking');
    setTransactionRef('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const handleInvoiceSelectChange = (id) => {
    setPaymentInvoiceId(id);
    const target = invoices.find((inv) => inv.id === id);
    if (target) {
      const s = getInvoicePaymentStatus(target, payments);
      setPaymentAmount(s.remaining > 0 ? s.remaining : target.grandTotal);
    } else {
      setPaymentAmount('');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const targetInv = invoices.find((inv) => inv.id === paymentInvoiceId);
    if (!targetInv) return;

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
    const newPayment = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      invoiceId: targetInv.id,
      invoiceNumber: targetInv.invoiceNumber,
      clientName: targetInv.client?.name || 'Customer',
      amount: parseFloat(paymentAmount) || 0,
      paymentMode,
      transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      date: paymentDate,
      notes: paymentNotes,
      recordedBy: currentUser?.name || 'Accountant',
      recordedAt: new Date().toISOString()
    };

    if (onRecordPayment) {
      onRecordPayment(newPayment, targetInv);
    }
    setIsPaymentModalOpen(false);
  };

  const statusCounts = useMemo(() => {
    let all = 0;
    let paid = 0;
    let partial = 0;
    let unpaid = 0;
    let converted = 0;
    invoices.forEach((inv) => {
      if (inv.docType === 'bill' || inv.docType === 'receipt' || inv.docType === 'purchase_order') return;
      all++;
      if (inv.status === 'Converted') {
        converted++;
      } else {
        const s = getInvoicePaymentStatus(inv, payments).status;
        if (s === 'Paid') paid++;
        else if (s === 'Partial') partial++;
        else unpaid++;
      }
    });
    return { all, paid, partial, unpaid, converted };
  }, [invoices, payments]);

  const docTypeCounts = useMemo(() => {
    let taxInvoice = 0;
    let preInvoice = 0;
    invoices.forEach((inv) => {
      if (inv.docType === 'bill' || inv.docType === 'receipt' || inv.docType === 'purchase_order') return;
      if (inv.docType === 'pre_invoice') {
        preInvoice++;
      } else {
        taxInvoice++;
      }
    });
    return {
      all: taxInvoice + preInvoice,
      taxInvoice,
      preInvoice
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Exclude internal non-invoice types
        if (inv.docType === 'bill' || inv.docType === 'receipt' || inv.docType === 'purchase_order') return false;

        // Document Type Filter (Pre-Invoice vs Tax Invoice vs All)
        if (docTypeFilter === 'pre_invoice') {
          if (inv.docType !== 'pre_invoice') return false;
        } else if (docTypeFilter === 'tax_invoice') {
          if (inv.docType && inv.docType !== 'tax_invoice') return false;
        }

        const statusInfo = getInvoicePaymentStatus(inv, payments);
        if (statusFilter === 'PAID' && statusInfo.status !== 'Paid') return false;
        if (statusFilter === 'PARTIAL' && statusInfo.status !== 'Partial') return false;
        if (statusFilter === 'UNPAID' && (statusInfo.status !== 'Unpaid' || inv.status === 'Converted' || inv.status === 'Cancelled')) return false;
        if (statusFilter === 'CONVERTED' && inv.status !== 'Converted') return false;
        if (statusFilter === 'CANCELLED' && inv.status !== 'Cancelled') return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const num = (inv.invoiceNumber || '').toLowerCase();
        const client = (inv.client?.name || '').toLowerCase();
        const gstin = (inv.client?.gstin || '').toLowerCase();
        const items = (inv.items || [])
          .map((i) => (i.description || '').toLowerCase())
          .join(' ');

        return num.includes(q) || client.includes(q) || gstin.includes(q) || items.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'tax_first') {
          const isTaxA = !a.docType || a.docType === 'tax_invoice';
          const isTaxB = !b.docType || b.docType === 'tax_invoice';
          if (isTaxA && !isTaxB) return -1;
          if (!isTaxA && isTaxB) return 1;
        }
        if (sortBy === 'pre_first') {
          const isPreA = a.docType === 'pre_invoice';
          const isPreB = b.docType === 'pre_invoice';
          if (isPreA && !isPreB) return -1;
          if (!isPreA && isPreB) return 1;
        }
        if (sortBy === 'date-desc') return new Date(b.invoiceDate) - new Date(a.invoiceDate);
        if (sortBy === 'date-asc') return new Date(a.invoiceDate) - new Date(b.invoiceDate);
        if (sortBy === 'amount-high') return (b.grandTotal || 0) - (a.grandTotal || 0);
        if (sortBy === 'amount-low') return (a.grandTotal || 0) - (b.grandTotal || 0);
        return 0;
      });
  }, [invoices, payments, searchTerm, statusFilter, docTypeFilter, sortBy]);

  // Reset to page 1 when filtering or sorting changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, docTypeFilter, sortBy]);

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + PAGE_SIZE);

  const filteredTotal = filteredInvoices
    .filter((inv) => inv.status !== 'Cancelled')
    .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  const handleOpenCancelModal = (inv) => {
    setCancellingInvoice(inv);
    setCancelReason('Order cancelled by client before delivery');
  };

  const handleConfirmCancel = (e) => {
    e.preventDefault();
    if (!cancellingInvoice) return;
    onCancelInvoice(cancellingInvoice.id, cancelReason);
    setCancellingInvoice(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex justify-end">

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isAccountant && (
            <button
              type="button"
              onClick={() => onNewInvoice && onNewInvoice('tax_invoice')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <IconPlus className="w-4 h-4" />
              <span>New Invoice</span>
            </button>
          )}

          {canModify && (
            <button
              type="button"
              onClick={() => {
                if (onViewPaymentLogs) {
                  onViewPaymentLogs();
                } else {
                  setFilterLogsInvoiceId(null);
                  setLogsSearchTerm('');
                  setIsLogsModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
              title="Accountant Payment Logs"
            >
              <IconHistory className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Payment Logs</span>
            </button>
          )}

          {canModify && (
            <button
              onClick={() => handleOpenRecordPayment(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <IconCreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice #, client name, GSTIN, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Invoice Type Filter (All vs Tax Invoice vs Pre-Invoice) */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="font-bold text-slate-700">Type:</span>
              <select
                value={docTypeFilter}
                onChange={(e) => {
                  setDocTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-lg px-2.5 py-1.5 text-xs text-blue-900 font-bold focus:outline-hidden focus:border-blue-600 shadow-2xs cursor-pointer transition"
              >
                <option value="all">All Invoices ({docTypeCounts.all})</option>
                <option value="tax_invoice">Tax Invoices ({docTypeCounts.taxInvoice})</option>
                <option value="pre_invoice">Pre-Invoices ({docTypeCounts.preInvoice})</option>
              </select>
            </div>

            {/* Filter Selector */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Status ({statusCounts.all})</option>
                <option value="PAID">Paid ({statusCounts.paid})</option>
                <option value="PARTIAL">Partial ({statusCounts.partial})</option>
                <option value="UNPAID">Unpaid ({statusCounts.unpaid})</option>
                <option value="CONVERTED">Converted ({statusCounts.converted})</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="tax_first">Tax Invoices First</option>
                <option value="pre_first">Pre-Invoices First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / Laptop / 2XL Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <IconInvoice className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">No matching invoices</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your search criteria or create a brand new invoice.
            </p>
            {!isAccountant && (
              <button
                type="button"
                onClick={() => onNewInvoice && onNewInvoice('tax_invoice')}
                className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                + Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 border border-slate-200">Invoice Number</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Client Details</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Date</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Created By</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Grand Total</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Amount Paid</th>
                  <th className="py-2.5 px-3.5 border border-slate-200">Status</th>
                  <th className="py-2.5 px-3.5 border border-slate-200 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {paginatedInvoices.map((inv) => {
                  const statusInfo = getInvoicePaymentStatus(inv, payments);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition border-b border-slate-200 text-xs">
                      <td className="py-2.5 px-3.5 border border-slate-200 font-bold text-blue-600">
                        <button
                          type="button"
                          onClick={() => onViewInvoice && onViewInvoice(inv)}
                          className="hover:text-blue-800 hover:underline underline-offset-2 cursor-pointer transition-colors text-left font-mono font-bold text-xs"
                          title="Click to preview document"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 font-semibold text-slate-900 text-xs">
                        {inv.client?.name || "Unnamed Client"}
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 text-slate-700 text-xs">
                        {inv.invoiceDate}
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 text-slate-600 font-medium text-xs">
                        {inv.createdBy || "Staff"}
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 font-bold text-slate-900 font-mono text-xs">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200">
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {formatCurrency(statusInfo.totalPaid)}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 font-medium text-slate-800">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          inv.status === 'Converted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : statusInfo.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : statusInfo.status === 'Partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inv.status === 'Converted'
                            ? '✓ Converted'
                            : inv.status === 'Cancelled'
                            ? 'Cancelled'
                            : statusInfo.status === 'Paid'
                            ? 'Paid'
                            : statusInfo.status === 'Partial'
                            ? 'Partial'
                            : 'Unpaid'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 border border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (actionMenuState?.id === inv.id) {
                              setActionMenuState(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const openUp = spaceBelow < 220;
                              setActionMenuState({
                                id: inv.id,
                                invoice: inv,
                                top: openUp ? undefined : rect.bottom + 4,
                                bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
                                right: Math.max(12, window.innerWidth - rect.right)
                              });
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer invoice-action-trigger"
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
        )}

        {/* ── PAGINATION (LIMIT 10 PER PAGE) ── */}
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Fixed Action Menu Popup (Breaks out of overflow-hidden / overflow-x-auto) */}
      {actionMenuState && (
        <div
          style={{
            position: 'fixed',
            top: actionMenuState.top,
            bottom: actionMenuState.bottom,
            right: actionMenuState.right,
            zIndex: 9999
          }}
          className="w-52 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-xs font-medium text-slate-700 invoice-action-menu-popup"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const inv = actionMenuState.invoice;
              setActionMenuState(null);
              onViewInvoice(inv);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
          >
            <IconPrint className="w-4 h-4 text-slate-400" />
            <span>View &amp; Print</span>
          </button>

          {/* Edit Invoice (Always Available) */}
          {onEditInvoice && (
            <button
              type="button"
              onClick={() => {
                const inv = actionMenuState.invoice;
                setActionMenuState(null);
                onEditInvoice(inv);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
            >
              <IconEdit className="w-4 h-4 text-slate-400" />
              <span>Edit Invoice</span>
            </button>
          )}

          {/* Option to Convert Pre-Invoice into Tax Invoice */}
          {canModify && actionMenuState.invoice.docType === 'pre_invoice' && actionMenuState.invoice.status !== 'Converted' && (
            <button
              type="button"
              onClick={() => {
                const inv = actionMenuState.invoice;
                setActionMenuState(null);
                if (onConvertToTaxInvoice) {
                  onConvertToTaxInvoice(inv);
                }
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
            >
              <IconInvoice className="w-4 h-4 text-slate-400" />
              <span>Convert to Tax Invoice</span>
            </button>
          )}

          {canModify && actionMenuState.invoice.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => {
                const inv = actionMenuState.invoice;
                setActionMenuState(null);
                handleOpenRecordPayment(inv);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
            >
              <IconCreditCard className="w-4 h-4 text-slate-400" />
              <span>Record Payment</span>
            </button>
          )}

          {canModify && (
            <button
              type="button"
              onClick={() => {
                const inv = actionMenuState.invoice;
                setActionMenuState(null);
                if (onViewPaymentLogs) {
                  onViewPaymentLogs();
                } else {
                  setFilterLogsInvoiceId(inv.id);
                  setLogsSearchTerm('');
                  setIsLogsModalOpen(true);
                }
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
            >
              <IconHistory className="w-4 h-4 text-slate-400" />
              <span>Payment Logs</span>
            </button>
          )}

          {isAdmin && actionMenuState.invoice.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => {
                const inv = actionMenuState.invoice;
                setActionMenuState(null);
                handleOpenCancelModal(inv);
              }}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs font-medium"
            >
              <IconCreditNote className="w-4 h-4 text-slate-400" />
              <span>Cancel Invoice</span>
            </button>
          )}

          {isAdmin && (
            <div className="border-t border-slate-100 my-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  const inv = actionMenuState.invoice;
                  setActionMenuState(null);
                  if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
                    onDeleteInvoice(inv.id);
                  }
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 cursor-pointer text-xs font-medium"
              >
                <IconTrash className="w-4 h-4 text-rose-500" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Card Grid View */}
      <div className="md:hidden space-y-3">
        {paginatedInvoices.map((inv) => {
          const statusInfo = getInvoicePaymentStatus(inv, payments);
          return (
            <div
              key={inv.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 font-mono text-xs">
                      {inv.invoiceNumber}
                    </span>
                    {inv.docType === 'pre_invoice' ? (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Pre-Invoice
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Tax Invoice
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                    {inv.client?.name || "Unnamed Client"}
                  </h3>
                  <div className="text-slate-400">Date: {inv.invoiceDate} &bull; By: {inv.createdBy || 'Staff'}</div>
                </div>
                <span className="font-medium text-slate-800 text-xs">
                  {inv.status === 'Cancelled'
                    ? 'Cancelled'
                    : inv.status === 'Converted'
                    ? '✓ Converted'
                    : statusInfo.status === 'Paid'
                    ? 'Paid'
                    : statusInfo.status === 'Partial'
                    ? 'Partial'
                    : 'Unpaid'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Grand Total</div>
                  <div className="font-black text-slate-900 text-sm">{formatCurrency(inv.grandTotal)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Amount Paid</div>
                  <div className="font-bold text-slate-800 text-sm">{formatCurrency(statusInfo.totalPaid)}</div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <div className="flex items-center gap-1.5">
                  {canModify && inv.docType === 'pre_invoice' && inv.status !== 'Converted' && (
                    <button
                      onClick={() => onConvertToTaxInvoice && onConvertToTaxInvoice(inv)}
                      className="px-2.5 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer text-xs flex items-center gap-1"
                    >
                      <IconInvoice className="w-3.5 h-3.5" />
                      <span>Convert</span>
                    </button>
                  )}
                  {canModify && inv.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleOpenRecordPayment(inv)}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                    >
                      Record Pay
                    </button>
                  )}
                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition cursor-pointer"
                  >
                    View &amp; Print
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile Pagination */}
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="rounded-2xl border border-slate-200 card-shadow bg-white"
        />
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPaymentModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-10 sm:pt-16 p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconCreditCard className="w-5 h-5 text-emerald-600" />
                <span>Record Client Payment</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Select Unpaid Invoice *
                </label>
                <select
                  required
                  value={paymentInvoiceId}
                  onChange={(e) => handleInvoiceSelectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 font-medium"
                >
                  <option value="">-- Choose an invoice to reconcile --</option>
                  {unpaidInvoices.map((inv) => {
                    const s = getInvoicePaymentStatus(inv, payments);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.client?.name} (Due: {formatCurrency(s.remaining)})
                      </option>
                    );
                  })}
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
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
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
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Verified against bank statement"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Record &amp; Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Invoice / Issue Credit Note Modal */}
      {cancellingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <IconCreditNote className="w-5 h-5 text-rose-600" />
                <span>Cancel Invoice & Issue Credit Note</span>
              </h2>
              <button
                onClick={() => setCancellingInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 leading-relaxed">
                <strong>Audit Notice:</strong> Under anti-tamper accounting rules, cancelling invoice{' '}
                <strong className="font-mono">{cancellingInvoice.invoiceNumber}</strong> ({formatCurrency(cancellingInvoice.grandTotal)}) will preserve this record with status <em>Cancelled</em> and generate a permanent audit trail entry.
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">
                  Reason for Cancellation / Credit Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Scope revised by client, goods returned, or invoice replaced by mutual consent"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancellingInvoice(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Accountant Payment Logs Modal (Single Log Icon Entry) ── */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconHistory className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Accountant Payment Logs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official ledger of all payments logged by accountants
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLogsModalOpen(false);
                  setFilterLogsInvoiceId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* Filter / Search Bar inside Modal */}
            <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search receipt #, invoice, client, or ref..."
                  value={logsSearchTerm}
                  onChange={(e) => setLogsSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition"
                />
              </div>

              {filterLogsInvoiceId && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-200">
                    Filtered for single invoice
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilterLogsInvoiceId(null)}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Show All Logs
                  </button>
                </div>
              )}

              <div className="text-xs text-slate-500 self-end sm:self-auto">
                Total Logs: <strong className="text-slate-800">{filteredPaymentLogs.length}</strong>
              </div>
            </div>

            {/* Logs Table Area */}
            <div className="overflow-auto flex-1 p-4">
              {filteredPaymentLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No payment records found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Receipt #</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Reference / Txn</th>
                      <th className="py-2.5 px-3">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPaymentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">
                          {log.receiptNumber || 'REC-' + log.id?.slice(-4)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">
                          {log.invoiceNumber || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {log.clientName || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {log.paymentDate || log.date || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {formatCurrency(log.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {log.paymentMode || 'UPI'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {log.transactionRef || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {log.recordedBy || 'Accountant'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsLogsModalOpen(false);
                  setFilterLogsInvoiceId(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
