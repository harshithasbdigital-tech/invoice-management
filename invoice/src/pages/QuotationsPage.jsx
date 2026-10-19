import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import { QuotationDocument } from '../components/QuotationDocument';
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconCheckCircle,
  IconClock,
  IconTrash,
  IconEdit,
  IconDownload,
  IconPrint,
  IconUserCheck,
  IconInvoice,
  IconDocument,
  IconFileText,
  IconClose,
  IconDotsVertical,
  IconFilter,
  IconChevronDown
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const toDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  return {
    start: toDateStr(first),
    end: toDateStr(last)
  };
};

export function QuotationsPage({
  quotations = [],
  company,
  bank,
  clients = [],
  services = [],
  currentUser,
  onSaveQuotation,
  onUpdateQuotationStatus,
  onDeleteQuotation,
  onConvertToInvoice,
  onConvertToTaxInvoice,
  onConvertToPreInvoice,
  onViewQuotation,
  onNavigateToCustomers,
  initialStatusFilter = ''
}) {
  const defaultMonth = getCurrentMonthRange();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    initialStatusFilter && initialStatusFilter !== 'All' ? initialStatusFilter : ''
  );
  const [startDate, setStartDate] = useState(defaultMonth.start);
  const [endDate, setEndDate] = useState(defaultMonth.end);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [actionMenuState, setActionMenuState] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.quotation-action-popup') && !e.target.closest('.quotation-action-trigger')) {
        setActionMenuState(null);
      }
      if (!e.target.closest('.quotation-filter-menu')) {
        setIsFilterDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleOutsideClick, true);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleOutsideClick, true);
    };
  }, []);

  React.useEffect(() => {
    if (initialStatusFilter && initialStatusFilter !== 'All') {
      setStatusFilter(initialStatusFilter);
    } else if (initialStatusFilter === 'All') {
      setStatusFilter('');
    }
  }, [initialStatusFilter]);

  // Form state for creating quotation
  const [formData, setFormData] = useState({
    quotationNumber: `SB-QT-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: clients[0] || { name: '', gstin: '', email: '', phone: '', address: '', state: 'Karnataka', stateCode: '29' },
    items: [
      {
        id: `item-${Date.now()}`,
        serviceId: services[0]?.id || '',
        description: services[0]?.name || 'Custom Software Development',
        hsnSac: services[0]?.hsnSac || '998314',
        qty: 1,
        rate: services[0]?.rate || 25000,
        gstRate: services[0]?.gstRate || 18,
        amount: services[0]?.rate || 25000
      }
    ],
    notes: 'Valid for 30 days from date of issue. 50% advance required upon confirmation.'
  });

  const handleOpenCreateModal = () => {
    setEditingQuoteId(null);
    setFormData({
      quotationNumber: `SB-QT-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: '50% advance, 50% on delivery',
      client: clients[0] || { name: '', gstin: '', email: '', phone: '', address: '', state: 'Karnataka', stateCode: '29' },
      items: [
        {
          id: `item-${Date.now()}`,
          serviceId: services[0]?.id || '',
          description: services[0]?.name || 'Custom Software Development',
          hsnSac: services[0]?.hsnSac || '998314',
          qty: 1,
          rate: services[0]?.rate || 25000,
          gstRate: services[0]?.gstRate || 18,
          amount: services[0]?.rate || 25000
        }
      ],
      notes: 'Valid for 30 days from date of issue. 50% advance required upon confirmation.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quote) => {
    setEditingQuoteId(quote.id);
    setFormData({
      quotationNumber: quote.quotationNumber,
      date: quote.date,
      validUntil: quote.validUntil,
      paymentTerms: quote.paymentTerms || '50% advance, 50% on delivery',
      client: quote.client || clients[0],
      items: (quote.items && quote.items.length > 0)
        ? JSON.parse(JSON.stringify(quote.items))
        : [{
            id: `item-${Date.now()}`,
            serviceId: services[0]?.id || '',
            description: quote.service || 'Service Item',
            hsnSac: '998314',
            qty: 1,
            rate: quote.amount || 10000,
            gstRate: 18,
            amount: quote.amount || 10000
          }],
      notes: quote.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleClientChange = (e) => {
    const selected = clients.find(c => c.name === e.target.value);
    if (selected) {
      setFormData(prev => ({ ...prev, client: selected }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };

    if (field === 'serviceId') {
      const srv = services.find(s => s.id === value);
      if (srv) {
        item.description = (srv.name || '').slice(0, 30);
        item.hsnSac = srv.hsnSac;
        item.rate = srv.rate;
        item.gstRate = srv.gstRate;
      }
    }

    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    item.amount = qty * rate;

    updatedItems[index] = item;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          serviceId: services[0]?.id || '',
          description: (services[0]?.name || 'Additional Service').slice(0, 30),
          hsnSac: '998314',
          qty: 1,
          rate: services[0]?.rate || 10000,
          gstRate: 18,
          amount: services[0]?.rate || 10000
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = formData.items.reduce((sum, item) => {
    const amt = Number(item.amount) || 0;
    const rate = Number(item.gstRate) || 18;
    return sum + (amt * rate) / 100;
  }, 0);
  const grandTotal = subtotal + taxAmount;

  const handleSave = (e) => {
    e.preventDefault();
    if (editingQuoteId) {
      const existing = quotations.find(q => q.id === editingQuoteId);
      const updatedQuote = {
        ...existing,
        quotationNumber: formData.quotationNumber,
        date: formData.date,
        validUntil: formData.validUntil,
        paymentTerms: formData.paymentTerms,
        client: formData.client,
        items: formData.items,
        subtotal,
        taxAmount,
        grandTotal,
        notes: formData.notes
      };
      if (onSaveQuotation) {
        onSaveQuotation(updatedQuote);
      }
      setEditingQuoteId(null);
    } else {
      const newQuote = {
        id: `qt-${Date.now()}`,
        quotationNumber: formData.quotationNumber,
        date: formData.date,
        validUntil: formData.validUntil,
        paymentTerms: formData.paymentTerms || '50% advance, 50% on delivery',
        client: formData.client,
        items: formData.items,
        subtotal,
        taxAmount,
        grandTotal,
        status: 'Draft',
        notes: formData.notes,
        createdBy: currentUser?.name || 'Sales Staff',
        convertedInvoiceId: null
      };
      if (onSaveQuotation) {
        onSaveQuotation(newQuote);
      }
    }
    setIsModalOpen(false);
  };

  // Filter list
  const filteredQuotes = quotations.filter(q => {
    const matchSearch =
      (q.quotationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || statusFilter === 'All' || q.status === statusFilter;
    const matchStartDate = !startDate || (q.date && q.date >= startDate);
    const matchEndDate = !endDate || (q.date && q.date <= endDate);
    return matchSearch && matchStatus && matchStartDate && matchEndDate;
  });

  // Reset to page 1 on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredQuotes.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + PAGE_SIZE);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Converted':
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending Approval':
      case 'Rejected':
      case 'Expired':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar with + Create Quotation Button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Dropdown Button */}
          <div className="relative quotation-filter-menu">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                statusFilter
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <IconFilter className={`w-4 h-4 ${statusFilter ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>
                {statusFilter ? (
                  <>Status: <strong className="text-blue-700 font-bold">{statusFilter}</strong></>
                ) : (
                  'Filter by Status'
                )}
              </span>
              {statusFilter && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter('');
                  }}
                  className="text-slate-400 hover:text-rose-600 font-bold text-xs px-0.5 cursor-pointer"
                  title="Clear status filter"
                >
                  ✕
                </span>
              )}
              <IconChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-sm font-normal animate-in fade-in duration-100">
                <div className="px-3.5 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Filter by Status
                </div>
                {['Draft', 'Sent', 'Pending Approval', 'Approved', 'Converted', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setStatusFilter(statusFilter === status ? '' : status);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition cursor-pointer text-sm ${
                      statusFilter === status
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{status}</span>
                    {statusFilter === status && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer"
            />
            <span className="font-semibold text-slate-500 ml-1">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer"
            />
            {startDate || endDate ? (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                title="Clear date filter (Show all)"
              >
                ✕
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const m = getCurrentMonthRange();
                  setStartDate(m.start);
                  setEndDate(m.end);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold ml-1 underline cursor-pointer"
                title="Reset to current month"
              >
                This Month
              </button>
            )}
          </div>
        </div>

        {/* Search & Create Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotation..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-sm transition cursor-pointer shrink-0"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Quotations Table with Grid Rows and Columns */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3.5 border-r border-slate-200">Quote Number</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Customer</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Date</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Valid Until</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Amount</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Status</th>
                <th className="py-2.5 px-3.5 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition border-b border-slate-200 text-xs">
                    {/* Quotation Number — click to open full-page preview */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 font-mono font-bold text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (onViewQuotation) {
                            onViewQuotation(q);
                          } else {
                            setSelectedQuote(q);
                            setIsPreviewOpen(true);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 cursor-pointer transition-colors"
                        title="Click to view quotation"
                      >
                        {q.quotationNumber}
                      </button>
                    </td>

                    {/* Customer Info */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 font-bold text-slate-900 text-xs">
                      {q.client?.name}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 text-slate-700 text-xs">
                      {q.date}
                    </td>

                    {/* Valid Until */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 text-slate-700 text-xs">
                      {q.validUntil}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 font-bold font-mono text-slate-900 text-xs">
                      {formatCurrency(q.grandTotal || q.amount || 0)}
                    </td>

                    {/* Approval Status — Unpadded text without dot */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200">
                      <span className={`text-[11px] font-bold uppercase tracking-wider p-0 ${
                        q.status === 'Approved' ? 'text-blue-700' : 'text-slate-600'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    {/* Actions: 3-dots Menu */}
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actionMenuState?.id === q.id) {
                            setActionMenuState(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUp = spaceBelow < 260;
                            setActionMenuState({
                              id: q.id,
                              quote: q,
                              top: openUp ? undefined : rect.bottom + 4,
                              bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
                              right: Math.max(12, window.innerWidth - rect.right)
                            });
                          }
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer quotation-action-trigger"
                        title="Actions"
                      >
                        <IconDotsVertical className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* Fixed Action Menu Popup (Smart flip upward, no card distortion) */}
      {actionMenuState && (
        <div
          style={{
            position: 'fixed',
            top: actionMenuState.top,
            bottom: actionMenuState.bottom,
            right: actionMenuState.right,
            zIndex: 9999
          }}
          className="w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-sm font-normal text-left quotation-action-popup"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const q = actionMenuState.quote;
              setActionMenuState(null);
              if (onViewQuotation) {
                onViewQuotation(q);
              } else {
                setSelectedQuote(q);
                setIsPreviewOpen(true);
              }
            }}
            className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer text-sm"
          >
            <IconEye className="w-4 h-4 text-blue-600" />
            <span>View Quotation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const q = actionMenuState.quote;
              setActionMenuState(null);
              handleOpenEditModal(q);
            }}
            className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer text-sm"
          >
            <IconEdit className="w-4 h-4 text-slate-500" />
            <span>Edit Quotation</span>
          </button>

          {/* Convert to Pre-Invoice */}
          {(onConvertToPreInvoice || onConvertToInvoice) && (
            <button
              type="button"
              onClick={() => {
                const q = actionMenuState.quote;
                setActionMenuState(null);
                if (onConvertToPreInvoice) {
                  onConvertToPreInvoice(q);
                } else if (onConvertToInvoice) {
                  onConvertToInvoice(q);
                }
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50 flex items-center gap-2.5 text-indigo-700 font-semibold cursor-pointer text-sm"
            >
              <IconFileText className="w-4 h-4 text-indigo-600" />
              <span>Convert to Pre-Invoice</span>
            </button>
          )}

          {/* Convert to Tax Invoice */}
          {(onConvertToTaxInvoice || onConvertToInvoice) && (
            <button
              type="button"
              onClick={() => {
                const q = actionMenuState.quote;
                setActionMenuState(null);
                if (onConvertToTaxInvoice) {
                  onConvertToTaxInvoice(q);
                } else if (onConvertToInvoice) {
                  onConvertToInvoice(q);
                }
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50 flex items-center gap-2.5 text-blue-700 font-semibold cursor-pointer text-sm"
            >
              <IconInvoice className="w-4 h-4 text-blue-600" />
              <span>Convert to Tax Invoice</span>
            </button>
          )}

          {actionMenuState.quote.status !== 'Approved' && (
            <button
              type="button"
              onClick={() => {
                const q = actionMenuState.quote;
                setActionMenuState(null);
                if (onUpdateQuotationStatus) onUpdateQuotationStatus(q.id, 'Approved');
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer text-sm"
            >
              <IconCheckCircle className="w-4 h-4 text-blue-600" />
              <span>Mark as Approved</span>
            </button>
          )}

          {actionMenuState.quote.status === 'Draft' && (
            <button
              type="button"
              onClick={() => {
                const q = actionMenuState.quote;
                setActionMenuState(null);
                if (onUpdateQuotationStatus) onUpdateQuotationStatus(q.id, 'Sent');
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer text-sm"
            >
              <IconClock className="w-4 h-4 text-slate-400" />
              <span>Mark as Sent</span>
            </button>
          )}

          {onDeleteQuotation && (
            <button
              type="button"
              onClick={() => {
                const q = actionMenuState.quote;
                setActionMenuState(null);
                if (window.confirm(`Delete quotation ${q.quotationNumber}?`)) {
                  onDeleteQuotation(q.id);
                }
              }}
              className="w-full px-3.5 py-2.5 text-left hover:bg-red-50 flex items-center gap-2.5 text-red-600 border-t border-slate-100 cursor-pointer text-sm"
            >
              <IconTrash className="w-4 h-4" />
              <span>Delete Quotation</span>
            </button>
          )}
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconDocument className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingQuoteId ? 'Edit Quotation' : 'Create New Quotation'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingQuoteId ? 'Update quotation items, rates, and terms' : 'Generate commercial estimate for customer proposal'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Number</label>
                  <input
                    type="text"
                    required
                    value={formData.quotationNumber}
                    onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Customer</label>
                <select
                  value={formData.client.name}
                  onChange={handleClientChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {clients.map((c, i) => (
                    <option key={i} value={c.name}>{c.name} ({c.city || 'Bengaluru'})</option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Service Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 items-center">
                      <div className="col-span-5">
                        <select
                          value={item.serviceId}
                          onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs text-center"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>

                      <div className="col-span-2 text-right flex items-center justify-end gap-1">
                        <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Totals */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated GST (18%):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
                  <span>Total Quotation Value:</span>
                  <span className="text-blue-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Commercial Notes & Terms</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  Save Quotation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EXACT OFFICIAL PRINTABLE QUOTATION DOCUMENT MODAL */}
      {isPreviewOpen && selectedQuote && (
        <QuotationDocument
          quotation={selectedQuote}
          company={company}
          bank={bank}
          onClose={() => setIsPreviewOpen(false)}
          onConvertToInvoice={(q) => {
            setIsPreviewOpen(false);
            if (onConvertToInvoice) onConvertToInvoice(q);
          }}
          onConvertToPreInvoice={(q) => {
            setIsPreviewOpen(false);
            if (onConvertToPreInvoice) onConvertToPreInvoice(q);
          }}
          onConvertToTaxInvoice={(q) => {
            setIsPreviewOpen(false);
            if (onConvertToTaxInvoice) onConvertToTaxInvoice(q);
          }}
        />
      )}

    </div>
  );
}
