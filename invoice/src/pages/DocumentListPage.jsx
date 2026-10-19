import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency, formatDisplayDate } from '../utils/numberToWords';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconPrint,
  IconDotsVertical,
  IconFilter,
  IconBill,
  IconReceipt,
  IconPurchaseOrder
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function DocumentListPage({
  docType = 'bill', // 'bill' | 'receipt' | 'purchase_order'
  invoices = [],
  currentUser,
  onNewDocument,
  onViewDocument,
  onEditDocument,
  onDeleteDocument
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = all (no filter), 'PAID', 'UNPAID'
  const [dateFilterMode, setDateFilterMode] = useState('month'); // 'month' | 'day'
  const [dateFilter, setDateFilter] = useState(getCurrentMonth());
  const [sortBy, setSortBy] = useState('date-desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [actionMenuState, setActionMenuState] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Close menus on outside click or scroll
  useEffect(() => {
    const handleClose = (e) => {
      if (!e.target.closest('.doc-action-menu-popup') && !e.target.closest('.doc-action-trigger')) {
        setActionMenuState(null);
      }
      if (!e.target.closest('.doc-sort-popup') && !e.target.closest('.doc-sort-trigger')) {
        setIsSortOpen(false);
      }
      if (!e.target.closest('.doc-filter-popup') && !e.target.closest('.doc-filter-trigger')) {
        setIsFilterOpen(false);
      }
    };
    const handleScroll = () => {
      setActionMenuState(null);
      setIsSortOpen(false);
      setIsFilterOpen(false);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const config = useMemo(() => {
    switch (docType) {
      case 'bill':
        return {
          title: 'Billing & Cash Slips',
          buttonLabel: ' New Bill',
          icon: IconBill,
          docIdLabel: 'BILL NO.',
          filterDocType: 'bill',
          defaultPrefix: 'SB-B-',
          emptyText: 'No retail bills found.',
          amountHeader: 'BILL TOTAL (₹)'
        };
      case 'receipt':
        return {
          title: 'Payment Receipts',
          buttonLabel: 'New Receipt',
          icon: IconReceipt,
          docIdLabel: 'RECEIPT NO.',
          filterDocType: 'receipt',
          defaultPrefix: 'SB-R-',
          emptyText: 'No payment receipts found.',
          amountHeader: 'AMOUNT RECEIVED (₹)'
        };
      case 'purchase_order':
      default:
        return {
          title: 'Purchase Orders',
          buttonLabel: 'New Purchase Order',
          icon: IconPurchaseOrder,
          docIdLabel: 'PO NUMBER',
          filterDocType: 'purchase_order',
          defaultPrefix: 'SB-PO-',
          emptyText: 'No purchase orders found.',
          amountHeader: 'ORDER TOTAL (₹)'
        };
    }
  }, [docType]);

  // Filter documents strictly by docType
  const docsOfType = useMemo(() => {
    return invoices.filter((inv) => {
      if (docType === 'bill') return inv.docType === 'bill';
      if (docType === 'receipt') return inv.docType === 'receipt';
      if (docType === 'purchase_order') return inv.docType === 'purchase_order';
      return false;
    });
  }, [invoices, docType]);

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-high', label: 'Highest Amount' },
    { value: 'amount-low', label: 'Lowest Amount' },
  ];

  // Search & Filter
  const filteredDocs = useMemo(() => {
    return docsOfType
      .filter((doc) => {
        // Status filter (Paid or Pending via Filter Button)
        if (statusFilter === 'PAID') {
          const docStatus = (doc.status || 'Paid').toUpperCase();
          if (docStatus !== 'PAID') return false;
        } else if (statusFilter === 'UNPAID') {
          const docStatus = (doc.status || 'Paid').toUpperCase();
          if (docStatus === 'PAID') return false;
        }

        const docDateStr = doc.invoiceDate || doc.date || '';

        // Date / Month filter (defaults to current month YYYY-MM, or exact day YYYY-MM-DD)
        if (dateFilter) {
          if (dateFilter.length === 7) {
            // Month filter (YYYY-MM) -> matches any document in that month
            if (!docDateStr.startsWith(dateFilter)) {
              return false;
            }
          } else if (docDateStr !== dateFilter) {
            // Exact Day filter (YYYY-MM-DD)
            return false;
          }
        }

        // Search Query
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const num = (doc.invoiceNumber || doc.receiptNumber || doc.billNumber || doc.poNumber || '').toLowerCase();
        const clientName = (doc.client?.name || '').toLowerCase();
        const clientPhone = (doc.client?.phone || '').toLowerCase();
        const ref = (doc.transactionRef || doc.againstDoc || '').toLowerCase();
        const items = (doc.items || []).map((i) => (i.description || '').toLowerCase()).join(' ');

        return num.includes(q) || clientName.includes(q) || clientPhone.includes(q) || ref.includes(q) || items.includes(q);
      })
      .sort((a, b) => {
        const dateA = new Date(a.invoiceDate || a.date || 0);
        const dateB = new Date(b.invoiceDate || b.date || 0);
        if (sortBy === 'date-desc') return dateB - dateA;
        if (sortBy === 'date-asc') return dateA - dateB;
        if (sortBy === 'amount-high') return (Number(b.grandTotal || b.amount) || 0) - (Number(a.grandTotal || a.amount) || 0);
        if (sortBy === 'amount-low') return (Number(a.grandTotal || a.amount) || 0) - (Number(b.grandTotal || b.amount) || 0);
        return 0;
      });
  }, [docsOfType, searchTerm, statusFilter, dateFilter, sortBy]);

  // Reset to page 1 on filter or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, dateFilterMode, sortBy, docType]);

  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-3.5">
      {/* ── TOOLBAR: SEARCH, DATE FILTER, FILTER BUTTON (PAID/PENDING), SORT BUTTON & CREATE BUTTON ── */}
      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search + Date Filter + Filter Button (Paid / Pending) + Sort Button */}
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Date / Month Filter (Defaults to Current Month) */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setDateFilterMode('month');
                  setDateFilter(getCurrentMonth());
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                  dateFilterMode === 'month'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
                title="Filter by Month"
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFilterMode('day');
                  setDateFilter(new Date().toISOString().split('T')[0]);
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                  dateFilterMode === 'day'
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
                title="Filter by Specific Day"
              >
                Day
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={dateFilterMode === 'day' ? 'date' : 'month'}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              />
              {dateFilter ? (
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className="ml-1 text-slate-400 hover:text-rose-600 text-xs font-bold px-1 cursor-pointer"
                  title="Clear filter (Show all dates)"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilterMode('month');
                    setDateFilter(getCurrentMonth());
                  }}
                  className="ml-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  title="Reset to current month"
                >
                  This Month
                </button>
              )}
            </div>
          </div>

          {/* Filter Button: Houses Paid & Pending status filtering */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer doc-filter-trigger shadow-2xs ${
                statusFilter
                  ? 'bg-blue-50 text-[#0B3C7B] border-blue-200 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Filter by status"
            >
              <IconFilter className={`w-3.5 h-3.5 ${statusFilter ? 'text-[#0B3C7B]' : 'text-slate-500'}`} />
              <span>{statusFilter ? `Status: ${statusFilter === 'PAID' ? 'Paid' : 'Pending'}` : 'Filter'}</span>
              {statusFilter && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('');
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-600 font-bold text-xs"
                  title="Clear status filter"
                >
                  ✕
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div
                className="absolute left-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 doc-filter-popup"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(statusFilter === 'PAID' ? '' : 'PAID');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between cursor-pointer ${
                    statusFilter === 'PAID' ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>Paid</span>
                  {statusFilter === 'PAID' && <span className="text-emerald-700 font-bold">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(statusFilter === 'UNPAID' ? '' : 'UNPAID');
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between cursor-pointer ${
                    statusFilter === 'UNPAID' ? 'font-bold text-amber-700 bg-amber-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>Pending</span>
                  {statusFilter === 'UNPAID' && <span className="text-amber-700 font-bold">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Sort Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition cursor-pointer doc-sort-trigger shadow-2xs"
            >
              <span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
            </button>

            {isSortOpen && (
              <div
                className="absolute left-0 lg:left-auto lg:right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs font-medium text-slate-700 doc-sort-popup"
                onClick={(e) => e.stopPropagation()}
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left hover:bg-blue-50 flex items-center justify-between cursor-pointer ${
                      sortBy === opt.value ? 'font-bold text-[#0B3C7B] bg-blue-50/60' : ''
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <span className="text-[#0B3C7B] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Primary Create Button */}
        <button
          type="button"
          onClick={() => onNewDocument(docType)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#0B3C7B] hover:bg-[#072c5b] text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer shrink-0 self-start lg:self-auto"
        >
          <IconPlus className="w-4 h-4" />
          <span>{config.buttonLabel.trim()}</span>
        </button>
      </div>

      {/* ── DOCUMENTS TABLE WITH LIGHT BORDERS ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm font-bold text-slate-800 mb-1">
              {config.emptyText}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {statusFilter || dateFilter
                ? 'No documents match the active filters. Try clearing filters.'
                : 'Click below to create your first document.'}
            </p>
            <button
              type="button"
              onClick={() => onNewDocument(docType)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3C7B] hover:bg-[#072c5b] text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>{config.buttonLabel}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200/90 text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 w-36">{config.docIdLabel}</th>
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 w-28">DATE</th>
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 min-w-[180px]">
                    {docType === 'purchase_order' ? 'VENDOR / SUPPLIER' : 'CUSTOMER / CLIENT'}
                  </th>
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 min-w-[200px]">
                    {docType === 'purchase_order' ? 'PURCHASED ITEMS / MATERIALS' : 'ITEMS / PURPOSE'}
                  </th>
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 text-right w-36">{config.amountHeader}</th>
                  <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80 text-center w-24">STATUS</th>
                  <th className="py-2.5 px-3.5 border-b border-slate-200/80 text-center w-20">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {paginatedDocs.map((doc, idx) => {
                  const docNum = doc.invoiceNumber || doc.receiptNumber || doc.billNumber || doc.poNumber || 'N/A';
                  const docDate = formatDisplayDate(doc.invoiceDate || doc.date);
                  const clientName = doc.client?.name || (docType === 'purchase_order' ? 'Vendor / Supplier' : 'Customer');
                  const totalAmt = Number(doc.grandTotal != null ? doc.grandTotal : (doc.receiptAmountReceived || doc.amount || 0));
                  const isPaid = (doc.status || 'Paid').toLowerCase() === 'paid';
                  const itemsSummary = (doc.items || []).map((i) => i.description).filter(Boolean).slice(0, 2).join(', ') || (doc.paymentTowards || 'Services / Goods');

                  return (
                    <tr
                      key={doc.id || docNum}
                      className={`hover:bg-blue-50/30 transition-colors text-xs ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                    >
                      {/* Document Number */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 font-mono font-bold text-blue-600 text-xs">
                        <button
                          type="button"
                          onClick={() => onViewDocument && onViewDocument(doc)}
                          className="hover:text-blue-800 hover:underline underline-offset-2 cursor-pointer transition-colors text-left font-mono font-bold"
                          title="Click to open and view document"
                        >
                          {docNum}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 text-slate-700 whitespace-nowrap text-xs">
                        {docDate}
                      </td>

                      {/* Customer / Client or Vendor / Supplier */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 font-bold text-slate-900 text-xs">
                        {clientName}
                      </td>

                      {/* Items / Purpose */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 max-w-xs truncate text-slate-700 text-xs" title={itemsSummary}>
                        {itemsSummary}
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 text-right font-mono font-bold text-slate-950 whitespace-nowrap text-xs">
                        {formatCurrency(totalAmt)}
                      </td>

                      {/* Status (No dot, No pill padding - clean text) */}
                      <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70 text-center font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                        <span className={
                          docType === 'purchase_order'
                            ? (doc.status === 'Fulfilled / Received' ? 'text-emerald-700' : doc.status === 'Cancelled' ? 'text-rose-600' : doc.status === 'Pending Delivery' ? 'text-blue-700' : 'text-amber-600')
                            : (isPaid ? 'text-emerald-700' : 'text-amber-600')
                        }>
                          {doc.status || (docType === 'purchase_order' ? 'Issued to Vendor' : isPaid ? 'Paid' : 'Pending')}
                        </span>
                      </td>

                      {/* Actions: 3 Dots Menu */}
                      <td className="py-2.5 px-3.5 border-b border-slate-200/70 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            setActionMenuState({
                              doc,
                              top: spaceBelow < 150 ? undefined : rect.bottom + 4,
                              bottom: spaceBelow < 150 ? window.innerHeight - rect.top + 4 : undefined,
                              right: window.innerWidth - rect.right
                            });
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer doc-action-trigger"
                          title="Actions"
                        >
                          <IconDotsVertical className="w-3.5 h-3.5" />
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

      {/* ── FIXED ACTION MENU POPUP FOR 3 DOTS ── */}
      {actionMenuState && (
        <div
          style={{
            position: 'fixed',
            top: actionMenuState.top,
            bottom: actionMenuState.bottom,
            right: actionMenuState.right,
            zIndex: 9999
          }}
          className="w-44 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 text-xs font-medium text-slate-700 doc-action-menu-popup"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const doc = actionMenuState.doc;
              setActionMenuState(null);
              onViewDocument(doc);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 cursor-pointer text-slate-700 text-xs font-medium"
          >
            <IconPrint className="w-4 h-4 text-slate-400" />
            <span>View &amp; Print</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const doc = actionMenuState.doc;
              setActionMenuState(null);
              onEditDocument(doc);
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 cursor-pointer text-slate-700 text-xs font-medium"
          >
            <IconEdit className="w-4 h-4 text-slate-400" />
            <span>Edit</span>
          </button>

          <div className="border-t border-slate-100 my-1" />

          <button
            type="button"
            onClick={() => {
              const doc = actionMenuState.doc;
              setActionMenuState(null);
              const docNum = doc.invoiceNumber || doc.billNumber || doc.receiptNumber || doc.poNumber;
              if (confirm(`Are you sure you want to delete ${config.docIdLabel} ${docNum}?`)) {
                onDeleteDocument(doc.id);
              }
            }}
            className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 cursor-pointer text-xs font-medium"
          >
            <IconTrash className="w-4 h-4 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
