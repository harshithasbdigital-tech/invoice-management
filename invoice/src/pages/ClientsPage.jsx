import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import {
  IconSearch,
  IconPlus,
  IconBuilding,
  IconInvoice,
  IconCheck,
  IconClose,
  IconEdit,
  IconDotsVertical,
  IconDocument,
  IconFileText,
  IconBill,
  IconReceipt,
  IconEye,
  IconCreditCard
} from '../components/Icons';
import { Pagination } from '../components/Pagination';

export function ClientsPage({
  clients = [],
  invoices = [],
  quotations = [],
  payments = [],
  currentUser,
  onSaveClient,
  onCreateDocument,
  onViewInvoice,
  onViewQuotation,
  onEditInvoice
}) {
  const isAdmin = currentUser?.role === 'Admin';
  const isAccountant = currentUser?.role === 'Accountant';
  const canManageClients = true;

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [actionMenuState, setActionMenuState] = useState(null);
  const [selectedClientForView, setSelectedClientForView] = useState(null);
  const [customerDocFilter, setCustomerDocFilter] = useState('all');
  const [modalDocPage, setModalDocPage] = useState(1);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.client-action-popup') && !e.target.closest('.client-action-trigger')) {
        setActionMenuState(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleOutsideClick, true);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('scroll', handleOutsideClick, true);
    };
  }, []);

  // Form State for Manual Add/Edit (Optional)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    stateCode: '',
    gstin: '',
    creditDays: 15,
    notes: ''
  });

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      stateCode: '',
      gstin: '',
      creditDays: 15,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cli) => {
    setEditingClient(cli);
    setFormData({
      name: cli.name || '',
      contactPerson: cli.contactPerson || '',
      phone: cli.phone || '',
      email: cli.email || '',
      address: cli.address || '',
      city: cli.city || '',
      state: cli.state || '',
      stateCode: cli.stateCode || '',
      gstin: cli.gstin || '',
      creditDays: cli.creditDays || 15,
      notes: cli.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter customer business or entity name.');
      return;
    }

    const payload = {
      ...formData,
      id: editingClient ? editingClient.id : `cli-${Date.now()}`
    };

    onSaveClient(payload);
    setIsModalOpen(false);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Helper function to match document to client across name, company, gstin, phone, id
  const matchClient = (cli, docClient, docClientId) => {
    if (cli.id && docClientId && String(docClientId) === String(cli.id)) return true;
    if (!docClient) return false;
    const clientNameNorm = (cli.name || '').toLowerCase().trim();
    const clientCompanyNorm = (cli.companyName || '').toLowerCase().trim();
    const clientGstinNorm = (cli.gstin || '').toLowerCase().trim();

    const docName = (typeof docClient === 'string' ? docClient : (docClient.name || docClient.clientName || '')).toLowerCase().trim();
    const docCompany = (docClient.companyName || '').toLowerCase().trim();
    const docGstin = (docClient.gstin || '').toLowerCase().trim();

    if (clientGstinNorm && docGstin && clientGstinNorm === docGstin) return true;
    if (clientNameNorm && (docName === clientNameNorm || docCompany === clientNameNorm)) return true;
    if (clientCompanyNorm && (docName === clientCompanyNorm || docCompany === clientCompanyNorm)) return true;
    return false;
  };

  // Compute Client Financial Metrics & Document Counts
  const clientsWithMetrics = clients.map((cli) => {
    // Invoices / Bills / Pre-Invoices / POs for this client
    const clientInvoices = invoices.filter((inv) =>
      matchClient(cli, inv.client || inv.clientName, inv.clientId)
    );

    // Quotations for this client
    const clientQuotations = quotations.filter((q) =>
      matchClient(cli, q.client || q.clientName, q.clientId)
    );

    // Payments / Receipts for this client
    const clientPayments = payments.filter((p) =>
      matchClient(cli, p.client || p.clientName, p.clientId)
    );

    const totalBilled = clientInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const totalPaid = clientInvoices
      .filter((inv) => inv.status === 'Paid')
      .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const outstanding = Math.max(0, totalBilled - totalPaid);

    // Compute distinct document types created for this client
    const docTypesFound = new Set();
    let convertedCount = 0;

    clientInvoices.forEach((inv) => {
      const type = inv.docType;
      if (type === 'pre_invoice') docTypesFound.add('Pre-Invoice');
      else if (type === 'bill') docTypesFound.add('Bill');
      else if (type === 'receipt') docTypesFound.add('Receipt');
      else if (type === 'purchase_order') docTypesFound.add('PO');
      else docTypesFound.add('Tax Invoice');

      if (inv.convertedFromQuotationId || inv.status === 'Converted') {
        convertedCount += 1;
        docTypesFound.add('Converted');
      }
    });

    clientQuotations.forEach((q) => {
      docTypesFound.add('Quotation');
      if (q.status === 'Converted' || q.convertedInvoiceId) {
        convertedCount += 1;
        docTypesFound.add('Converted');
      }
    });

    if (clientPayments.length > 0) docTypesFound.add('Receipt');
    if (Array.isArray(cli.docTypes)) {
      cli.docTypes.forEach((t) => docTypesFound.add(t));
    }
    if (cli.createdWithDocType) docTypesFound.add(cli.createdWithDocType);

    const activeDocTypes = Array.from(docTypesFound);

    return {
      ...cli,
      invoiceCount: clientInvoices.length,
      quotationCount: clientQuotations.length,
      paymentCount: clientPayments.length,
      convertedCount,
      activeDocTypes,
      totalBilled,
      totalPaid,
      outstanding,
      clientInvoices,
      clientQuotations,
      clientPayments
    };
  });

  const filtered = clientsWithMetrics.filter((cli) => {
    const q = search.toLowerCase();
    return (
      (cli.name && cli.name.toLowerCase().includes(q)) ||
      (cli.contactPerson && cli.contactPerson.toLowerCase().includes(q)) ||
      (cli.phone && cli.phone.toLowerCase().includes(q)) ||
      (cli.email && cli.email.toLowerCase().includes(q)) ||
      (cli.gstin && cli.gstin.toLowerCase().includes(q)) ||
      (cli.city && cli.city.toLowerCase().includes(q))
    );
  });

  // 12 items per page pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const paginatedClients = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Helper to open document creator with pre-selected docType and client
  const handleLaunchDoc = (docType, client = null) => {
    if (onCreateDocument) {
      onCreateDocument(docType, client);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── SEARCH BAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, phone, email, GSTIN, or city..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ── CUSTOMER TABLE (12 PER PAGE) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200/90 text-xs">
            <thead>
              <tr className="bg-slate-50/90 text-[11px] font-bold uppercase text-slate-700 tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80">Customer / Entity</th>
                <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80">GSTIN</th>
                <th className="py-2.5 px-3.5 border-r border-b border-slate-200/80">Phone / Contact</th>
                <th className="py-2.5 px-3.5 border-b border-slate-200/80">Total Billed</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <IconBuilding className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <div>No customers found matching your search.</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Tip: Create any Quotation, Pre-Invoice, Tax Invoice, Bill, or Receipt from Dashboard to automatically add customers!
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((cli, idx) => (
                  <tr
                    key={cli.id}
                    className={`hover:bg-blue-50/40 transition cursor-pointer text-xs ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                    onClick={() => setSelectedClientForView(cli)}
                  >
                    {/* Customer Name Clickable */}
                    <td className="py-2.5 px-3.5 border-r border-b border-slate-200/70">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientForView(cli);
                        }}
                        className="text-left font-bold text-blue-700 hover:text-blue-900 hover:underline transition-colors cursor-pointer"
                        title="Click to view all Quotations, Converted Invoices, Bills & details"
                      >
                        {cli.name}
                      </button>
                    </td>

                    {/* GSTIN */}
                    <td className="py-2.5 px-3.5 font-mono text-xs text-slate-700 border-r border-b border-slate-200/70">
                      {cli.gstin || <span className="text-slate-400 italic">Unregistered</span>}
                    </td>

                    {/* Phone / Contact */}
                    <td className="py-2.5 px-3.5 text-slate-700 font-mono text-xs border-r border-b border-slate-200/70">
                      {cli.phone || '-'}
                    </td>

                    {/* Total Billed */}
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 font-mono text-xs border-b border-slate-200/70">
                      {formatCurrency(cli.totalBilled)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS (LIMIT 10 PER PAGE) ── */}
        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ── CUSTOMER PROFILE & SAVED DOCUMENTS DRAWER/MODAL (SLIDES FROM UP TO DOWN) ── */}
      {selectedClientForView && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer z-40"
            onClick={() => setSelectedClientForView(null)}
          />

          {/* Top Attached Container with Slide Down */}
          <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none p-3 sm:p-5">
            <div
              className="pointer-events-auto bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4"
              style={{
                animation: 'slideDownTopWindow 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {selectedClientForView.name}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    Saved Customer
                  </span>
                  {selectedClientForView.convertedCount > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      ✓ {selectedClientForView.convertedCount} Converted
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>GSTIN: <strong className="text-slate-800 font-mono">{selectedClientForView.gstin || 'Unregistered'}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong className="text-slate-800 font-mono">{selectedClientForView.phone || '-'}</strong></span>
                  <span>•</span>
                  <span>Email: <strong className="text-slate-800">{selectedClientForView.email || '-'}</strong></span>
                  <span>•</span>
                  <span>Location: <strong className="text-slate-800">{selectedClientForView.city || 'Bengaluru'}, {selectedClientForView.state || 'Karnataka'}</strong></span>
                </div>
                {selectedClientForView.address && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Address: <span className="text-slate-700">{selectedClientForView.address}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cli = selectedClientForView;
                    setSelectedClientForView(null);
                    openEditModal(cli);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Edit Customer Info"
                >
                  <IconEdit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClientForView(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Financial & Document Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">
                  Total Billed
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {formatCurrency(selectedClientForView.totalBilled)}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">
                  Across all invoices
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
                  Total Paid
                </div>
                <div className="text-lg font-black text-emerald-800 font-mono">
                  {formatCurrency(selectedClientForView.totalPaid)}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">
                  Payment settled
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">
                  Quotations
                </div>
                <div className="text-lg font-black text-amber-900 font-mono">
                  {selectedClientForView.clientQuotations?.length || 0}
                </div>
                <div className="text-[10.5px] text-amber-700 mt-0.5 font-medium">
                  {selectedClientForView.convertedCount || 0} converted to invoice
                </div>
              </div>

              <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-0.5">
                  Outstanding
                </div>
                <div className="text-lg font-black text-purple-900 font-mono">
                  {formatCurrency(selectedClientForView.outstanding)}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5">
                  Balance due
                </div>
              </div>
            </div>



            {/* Document History Filter Tabs */}
            {(() => {
              const clientInvoices = selectedClientForView.clientInvoices || [];
              const clientQuotations = selectedClientForView.clientQuotations || [];
              const clientPayments = selectedClientForView.clientPayments || [];

              const allDocs = [
                ...clientInvoices.map((i) => {
                  const isConverted = Boolean(i.convertedFromQuotationId || i.status === 'Converted');
                  return {
                    id: i.id,
                    docType: i.docType || 'tax_invoice',
                    number: i.invoiceNumber,
                    date: i.invoiceDate || i.date,
                    amount: i.grandTotal,
                    status: i.status,
                    isConverted,
                    convertedFromQuoteNumber: i.quotationNumber || i.convertedFromQuoteNumber,
                    raw: i,
                    isInvoice: true
                  };
                }),
                ...clientQuotations.map((q) => {
                  const isConverted = Boolean(q.status === 'Converted' || q.convertedInvoiceId);
                  return {
                    id: q.id,
                    docType: 'quotation',
                    number: q.quotationNumber,
                    date: q.date,
                    amount: q.grandTotal,
                    status: q.status,
                    isConverted,
                    convertedInvoiceId: q.convertedInvoiceId,
                    raw: q,
                    isQuotation: true
                  };
                }),
                ...clientPayments.map((p) => ({
                  id: p.id,
                  docType: 'receipt',
                  number: p.receiptNumber,
                  date: p.date,
                  amount: p.amount,
                  status: 'Settled',
                  isConverted: false,
                  raw: p,
                  isPayment: true
                }))
              ].sort((a, b) => (b.date > a.date ? 1 : -1));

              const quotationsCount = allDocs.filter((d) => d.docType === 'quotation').length;
              const convertedCount = allDocs.filter((d) => d.isConverted).length;
              const taxInvoiceCount = allDocs.filter((d) => d.docType === 'tax_invoice').length;
              const preInvoiceCount = allDocs.filter((d) => d.docType === 'pre_invoice').length;
              const billCount = allDocs.filter((d) => d.docType === 'bill').length;
              const receiptCount = allDocs.filter((d) => d.docType === 'receipt').length;
              const poCount = allDocs.filter((d) => d.docType === 'purchase_order').length;

              const tabs = [
                { key: 'all', label: 'All', count: allDocs.length },
                { key: 'quotation', label: 'Quotations', count: quotationsCount },
                { key: 'converted', label: 'Converted', count: convertedCount },
                { key: 'tax_invoice', label: 'Tax Invoices', count: taxInvoiceCount },
                { key: 'pre_invoice', label: 'Pre-Invoices', count: preInvoiceCount },
                { key: 'bill', label: 'Bills', count: billCount },
                { key: 'receipt', label: 'Receipts', count: receiptCount },
                { key: 'purchase_order', label: 'POs', count: poCount }
              ].filter((t) => t.key === 'all' || t.count > 0 || t.key === 'quotation' || t.key === 'converted');

              const displayedDocs =
                customerDocFilter === 'all'
                  ? allDocs
                  : customerDocFilter === 'converted'
                    ? allDocs.filter((d) => d.isConverted)
                    : allDocs.filter((d) => d.docType === customerDocFilter);

              const modalDocPageSize = 10;
              const modalTotalPages = Math.ceil(displayedDocs.length / modalDocPageSize) || 1;
              const validModalPage = Math.min(Math.max(1, modalDocPage), modalTotalPages);
              const paginatedModalDocs = displayedDocs.slice(
                (validModalPage - 1) * modalDocPageSize,
                validModalPage * modalDocPageSize
              );

              return (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Customer Documents ({displayedDocs.length})
                    </h3>
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                      {tabs.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => {
                            setCustomerDocFilter(tab.key);
                            setModalDocPage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                            customerDocFilter === tab.key
                              ? 'bg-white text-blue-700 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              customerDocFilter === tab.key
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document List */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {displayedDocs.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        No {customerDocFilter === 'converted' ? 'converted documents' : customerDocFilter.replace('_', ' ')} found for {selectedClientForView.name}.
                      </div>
                    ) : (
                      paginatedModalDocs.map((doc) => {
                        const isQuotation = doc.isQuotation;
                        const isConvertedQuote = isQuotation && doc.isConverted;
                        const isConvertedInvoice = doc.isInvoice && doc.isConverted;

                        return (
                          <div
                            key={doc.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                          >
                            <div className="flex items-center gap-3">
                              {/* Doc Type Badge */}
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                  doc.docType === 'quotation'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : doc.docType === 'pre_invoice'
                                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                      : doc.docType === 'bill'
                                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                        : doc.docType === 'receipt'
                                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                          : doc.docType === 'purchase_order'
                                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}
                              >
                                {doc.docType.replace('_', ' ')}
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                    {doc.number}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    {doc.date}
                                  </span>
                                </div>

                                {/* Converted Indicator Details */}
                                {isConvertedQuote && (
                                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    <span>Converted to Tax Invoice</span>
                                    {doc.convertedInvoiceId && (
                                      <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                                        #{doc.convertedInvoiceId}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {isConvertedInvoice && (
                                  <div className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    <span>Generated from Approved Quotation</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono">
                                {formatCurrency(doc.amount)}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  doc.status === 'Paid' || doc.status === 'Settled'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : doc.status === 'Approved'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : doc.status === 'Converted'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                                        : doc.status === 'Pending' || doc.status === 'Pending Approval'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {doc.status === 'Converted' ? '✓ Converted' : doc.status}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {/* Edit Action Button */}
                                {onEditInvoice && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onEditInvoice(doc.raw);
                                      setSelectedClientForView(null);
                                    }}
                                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition cursor-pointer flex items-center gap-1 border border-slate-200"
                                    title="Edit Document"
                                  >
                                    <IconEdit className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit</span>
                                  </button>
                                )}

                                {/* View Action Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (doc.isQuotation && onViewQuotation) {
                                      onViewQuotation(doc.raw);
                                    } else if (onViewInvoice) {
                                      onViewInvoice(doc.raw);
                                    }
                                    setSelectedClientForView(null);
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition cursor-pointer flex items-center gap-1 border border-slate-200"
                                >
                                  <IconEye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Pagination for customer modal documents */}
                    <Pagination
                      currentPage={validModalPage}
                      totalPages={modalTotalPages}
                      onPageChange={setModalDocPage}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedClientForView(null)}
                className="px-5 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── MANUAL ADD / EDIT CUSTOMER MODAL (TOP ATTACHED CONTAINER) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer z-40"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Top Attached Container with Slide Down */}
          <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none p-3 sm:p-5">
            <div
              className="pointer-events-auto bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4"
              style={{
                animation: 'slideDownTopWindow 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingClient ? 'Edit Customer Details' : 'Add New Customer'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingClient ? 'Update customer billing address and contact information' : 'Register new client profile into directory'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    Business / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Corporation Pvt Ltd"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="billing@apexcorp.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, locality, area"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">
                    GSTIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="29ABCDE1234F1Z5 (Optional)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800 font-mono uppercase"
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
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

