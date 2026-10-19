import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberToWords';
import {
  IconPrint,
  IconEdit,
  IconInvoice,
  IconFileText,
  IconClose,
  IconPlus,
  IconTrash
} from '../components/Icons';

export function QuotationViewPage({
  quotation,
  company,
  bank,
  clients = [],
  services = [],
  onBack,
  onEdit,
  onConvertToInvoice,
  onConvertToTaxInvoice,
  onConvertToPreInvoice,
  onUpdateQuotation
}) {
  const [currentQuote, setCurrentQuote] = useState(quotation);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState(null);

  if (!currentQuote) return null;

  const handlePrint = () => {
    window.print();
  };

  const client = currentQuote.client || {};
  const items = currentQuote.items && currentQuote.items.length > 0
    ? currentQuote.items
    : [
        { description: currentQuote.service || 'Service Item', rate: currentQuote.amount || 0, qty: 1, gstRate: 18, amount: currentQuote.amount || 0 }
      ];

  const subtotalAmount = currentQuote.subtotal != null ? currentQuote.subtotal : items.reduce((acc, it) => {
    return acc + (Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0);
  }, 0);

  const taxAmount = currentQuote.taxAmount != null ? currentQuote.taxAmount : items.reduce((acc, it) => {
    const itAmt = Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0;
    const rate = Number(it.gstRate != null ? it.gstRate : 18);
    return acc + (itAmt * rate) / 100;
  }, 0);

  const totalAmount = currentQuote.grandTotal || (subtotalAmount + taxAmount);

  // Dynamic UPI payload & QR
  const upiId = bank?.upiId || 'sbdigital@upi';
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(company?.name || 'SB Digital Automation Pvt Ltd')}&am=${totalAmount}&tn=Quote-${encodeURIComponent(currentQuote.quotationNumber)}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiPayload)}`;

  // Display rows — minimum 4 to match reference layout
  const displayItems = items.length >= 4 ? items : [
    ...items,
    ...Array.from({ length: 4 - items.length }, () => ({
      description: 'Service Item',
      rate: 0,
      qty: 1,
      amount: 0,
      _isPlaceholder: true
    }))
  ];

  const companyName = (company?.name && company.name !== 'SB') ? company.name : 'SB DIGITAL AUTOMATION PVT. LTD.';
  const quoteNumber = currentQuote.quotationNumber || 'SB-Q-999221';
  const quoteDate = currentQuote.date || '18 Sept 2026';
  const validUntil = currentQuote.validUntil || '03 Oct 2026';

  // Open edit modal
  const handleOpenEdit = () => {
    setEditFormData({
      quotationNumber: currentQuote.quotationNumber,
      date: currentQuote.date || new Date().toISOString().split('T')[0],
      validUntil: currentQuote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: currentQuote.paymentTerms || '50% advance, 50% on delivery',
      client: currentQuote.client || clients[0] || { name: '', gstin: '', email: '', phone: '', address: '' },
      items: (currentQuote.items && currentQuote.items.length > 0)
        ? currentQuote.items.map(it => {
            const amt = Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1));
            const gRate = Number(it.gstRate != null ? it.gstRate : 18);
            const gAmt = it.gstAmount != null ? Number(it.gstAmount) : (amt * gRate) / 100;
            return {
              ...it,
              rate: it.rate || 0,
              qty: it.qty || 1,
              amount: amt,
              gstRate: gRate,
              gstAmount: gAmt
            };
          })
        : [{
            id: `item-${Date.now()}`,
            description: currentQuote.service || 'Service Item',
            rate: currentQuote.amount || 10000,
            qty: 1,
            gstRate: 18,
            gstAmount: ((currentQuote.amount || 10000) * 18) / 100,
            amount: currentQuote.amount || 10000
          }],
      notes: currentQuote.notes || 'Valid for 15 days from date of issue. 50% advance required upon confirmation.'
    });
    setIsEditModalOpen(true);
  };

  const handleEditItemChange = (index, field, value) => {
    if (!editFormData) return;
    const updated = [...editFormData.items];
    const item = { ...updated[index], [field]: value };

    if (field === 'serviceId') {
      const srv = services.find(s => s.id === value);
      if (srv) {
        item.description = srv.name;
        item.hsnSac = srv.hsnSac || '998314';
        item.rate = srv.rate;
        item.gstRate = srv.gstRate || 18;
      }
    }

    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    item.amount = qty * rate;

    if (field === 'gstAmount') {
      const gAmt = Number(value) || 0;
      item.gstAmount = gAmt;
      if (item.amount > 0) {
        item.gstRate = Number(((gAmt / item.amount) * 100).toFixed(2));
      }
    } else if (field === 'gstRate') {
      const gRate = Number(value) || 0;
      item.gstRate = gRate;
      item.gstAmount = (item.amount * gRate) / 100;
    } else {
      const gRate = Number(item.gstRate != null ? item.gstRate : 18);
      item.gstAmount = (item.amount * gRate) / 100;
    }

    updated[index] = item;
    setEditFormData({ ...editFormData, items: updated });
  };

  const handleAddEditItem = () => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      items: [
        ...editFormData.items,
        {
          id: `item-${Date.now()}`,
          serviceId: services[0]?.id || '',
          description: services[0]?.name || 'Additional Service',
          hsnSac: '998314',
          qty: 1,
          rate: services[0]?.rate || 10000,
          gstRate: 18,
          gstAmount: ((services[0]?.rate || 10000) * 18) / 100,
          amount: services[0]?.rate || 10000
        }
      ]
    });
  };

  const handleRemoveEditItem = (index) => {
    if (!editFormData || editFormData.items.length === 1) return;
    setEditFormData({
      ...editFormData,
      items: editFormData.items.filter((_, i) => i !== index)
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const subtotal = editFormData.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    const taxAmount = editFormData.items.reduce((sum, it) => {
      if (it.gstAmount != null && !isNaN(it.gstAmount)) return sum + Number(it.gstAmount);
      const amt = Number(it.amount) || 0;
      const rate = Number(it.gstRate != null ? it.gstRate : 18);
      return sum + (amt * rate) / 100;
    }, 0);
    const grandTotal = subtotal + taxAmount;

    const updated = {
      ...currentQuote,
      quotationNumber: editFormData.quotationNumber,
      date: editFormData.date,
      validUntil: editFormData.validUntil,
      paymentTerms: editFormData.paymentTerms,
      client: editFormData.client,
      items: editFormData.items,
      subtotal,
      taxAmount,
      grandTotal,
      notes: editFormData.notes
    };

    setCurrentQuote(updated);
    if (onUpdateQuotation) {
      onUpdateQuotation(updated);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full min-h-full bg-white">

      {/* ── Integrated Top Action Bar with Breadcrumb (Hidden on print) ── */}
      <div className="no-print px-4 sm:px-8 lg:px-10 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3 sticky top-0 z-10 flex-nowrap overflow-x-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shrink-0" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            Quotations
          </button>
          <span className="text-slate-300 font-light select-none">/</span>
          <span className="text-[#0B3C7B] font-bold font-mono whitespace-nowrap">
            {quoteNumber}
          </span>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          {/* Edit Button */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <IconEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <span>Edit Quotation</span>
          </button>

          {/* Convert to Pre-Invoice Button */}
          {(onConvertToPreInvoice || onConvertToInvoice) && (
            <button
              type="button"
              onClick={() => {
                if (onConvertToPreInvoice) onConvertToPreInvoice(currentQuote);
                else if (onConvertToInvoice) onConvertToInvoice(currentQuote);
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-indigo-700 hover:bg-indigo-50 rounded-xl border border-indigo-200 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <IconFileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span>Convert to Pre-Invoice</span>
            </button>
          )}

          {/* Convert to Tax Invoice Button */}
          {(onConvertToTaxInvoice || onConvertToInvoice) && (
            <button
              type="button"
              onClick={() => {
                if (onConvertToTaxInvoice) onConvertToTaxInvoice(currentQuote);
                else if (onConvertToInvoice) onConvertToInvoice(currentQuote);
              }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-blue-700 hover:bg-blue-50 rounded-xl border border-blue-200 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <IconInvoice className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>Convert to Tax Invoice</span>
            </button>
          )}

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#0B3C7B] hover:bg-[#072c5b] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <IconPrint className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Print or Save as PDF</span>
          </button>
        </div>
      </div>

        {/* ── Quotation Page Content (Fills sides seamlessly) ── */}
        <div
          id="quotation-print-sheet"
          className="quotation-print-sheet p-3 sm:p-5 max-w-4xl mx-auto text-slate-900 font-sans select-text flex flex-col justify-between min-h-[250mm]"
        >
          <div>
            {/* ── 1. HEADER ROW: BRAND IDENTITY & DETAILS ── */}
            <div className="flex items-center justify-between gap-6 mb-3">
              {/* Left: Brand Identity with Logo in left corner */}
              <div className="shrink-0 flex items-center">
                <img
                  src="/sb_digital_logo.png"
                  alt="SB DIGITAL - Let's make things possible"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>

              {/* Right: Company Name & Contact Info */}
              <div className="text-right flex-1">
                <div className="text-sm sm:text-base font-black text-[#0B3C7B] uppercase tracking-wide leading-tight">
                  {companyName}
                </div>
                <div className="text-[10.5px] text-slate-600 mt-0.5 flex items-center justify-end flex-wrap gap-x-2.5">
                  <span>{company?.phone || '+91 98765 43210'}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-800">GST: {company?.gstin || '29ABMCS2397E1ZU'}</span>
                  <span className="text-slate-300">•</span>
                  <span>{company?.email || 'info@sbdat.com'}</span>
                  <span className="text-slate-300">•</span>
                  <span>{company?.website || 'www.in.sbdat.com'}</span>
                </div>
              </div>
            </div>

            {/* Light horizontal divider line after header and contact details */}
            <div className="border-b border-slate-200 w-full mb-3.5" />

          {/* ── 2. TWO BOXES: BILLED TO & (QUOTATION TABLE + PAYMENT TERMS) ── */}
          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* Box 1: QUOTE FOR (BILLED TO) */}
            <div className="border border-slate-200 p-3">
              <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                QUOTE FOR (BILLED TO)
              </div>

              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">CLIENT NAME</span>
                  <span className="text-slate-900 font-bold text-[11px]">
                    {(typeof client === 'string' ? client : (client.name || client.clientName || currentQuote.clientName || client.companyName || 'Valued Customer'))}
                  </span>
                </div>
                {client.companyName && client.companyName !== 'Direct Billing' && client.companyName !== client.name && (
                  <div className="grid grid-cols-[80px_1fr]">
                    <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">COMPANY</span>
                    <span className="text-slate-800 text-[11px]">{client.companyName}</span>
                  </div>
                )}
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PHONE</span>
                  <span className="text-slate-800 text-[11px]">{client.phone || '+91 98765 43210'}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">EMAIL</span>
                  <span className="text-slate-800 text-[11px]">{client.email || 'customer@example.com'}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">ADDRESS</span>
                  <span className="text-slate-800 text-[11px]">{client.address || `${company?.city || 'Bengaluru'}, Karnataka`}</span>
                </div>
              </div>
            </div>

            {/* Box 2: QUOTATION META TABLE (MOVED DOWN) ABOVE PAYMENT TERMS */}
            <div className="border border-slate-200 flex flex-col justify-between overflow-hidden">
              {/* Top: Quotation Details Table */}
              <div>
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-white">
                  <span className="text-[11px] font-black tracking-wider text-[#0B3C7B] uppercase">QUOTATION</span>
                  <span className="text-[11px] font-bold text-[#0B3C7B] font-mono">{quoteNumber}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center border-b border-slate-200 bg-slate-50/50">
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">DATE</div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{quoteDate}</div>
                  </div>
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">VALID UNTIL</div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{validUntil}</div>
                  </div>
                </div>
              </div>

              {/* Bottom: PAYMENT TERMS */}
              <div className="p-2.5">
                <div className="font-bold text-[9px] uppercase tracking-wider text-[#0B3C7B] mb-1">
                  PAYMENT TERMS
                </div>

                {/* Segmented Switch/Pill container */}
                <div className="border border-slate-200 flex overflow-hidden mb-1 rounded-xs">
                  <div className="bg-[#0B3C7B] text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase">
                    50% ADVANCE
                  </div>
                  <div className="bg-white text-[#0B3C7B] text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase">
                    50% BALANCE
                  </div>
                </div>

                {/* Subtext below pill */}
                <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
                  <span>Advance payment</span>
                  <span>After delivery</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── 3. ITEMS TABLE (WITH GST % BESIDE QTY & GST AMOUNT BELOW AMOUNT) ── */}
          <div className="mb-4">
            <table className="w-full text-left border-collapse table-fixed border border-slate-300">
              <thead>
                <tr className="bg-[#DCE8F8] text-[#0B3C7B] text-[11px] font-black uppercase tracking-wider border-b border-slate-300">
                  <th className="py-2 px-2.5 w-[8%] text-center border-r border-slate-300">SL NO.</th>
                  <th className="py-2 px-2.5 w-[36%] text-left border-r border-slate-300">DESCRIPTION</th>
                  <th className="py-2 px-2.5 w-[8%] text-center border-r border-slate-300">QTY</th>
                  <th className="py-2 px-2.5 w-[16%] text-right whitespace-nowrap border-r border-slate-300">RATE (₹)</th>
                  <th className="py-2 px-2.5 w-[14%] text-center whitespace-nowrap border-r border-slate-300">GST (%)</th>
                  <th className="py-2 px-2.5 w-[18%] text-right whitespace-nowrap">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemRate = Number(item.rate) || 0;
                  const itemQty = Number(item.qty) || 1;
                  const itemAmount = Number(item.amount) || (itemRate * itemQty);
                  const itemGstRate = Number(item.gstRate != null ? item.gstRate : 18);
                  const itemGstAmount = (itemAmount * itemGstRate) / 100;

                  return (
                    <tr key={idx} className="border-b border-slate-300 text-xs">
                      <td className="py-2 px-2.5 text-center font-bold text-[#1A56DB] border-r border-slate-300">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-2.5 text-slate-800 font-medium truncate border-r border-slate-300">
                        {item.description || item.name || 'Service Item'}
                      </td>
                      <td className="py-2 px-2.5 text-center text-slate-700 font-medium border-r border-slate-300">
                        {itemQty}
                      </td>
                      <td className="py-2 px-2.5 text-right text-slate-700 font-mono border-r border-slate-300">
                        {formatCurrency(itemRate)}
                      </td>
                      <td className="py-2 px-2.5 text-center text-slate-700 font-medium border-r border-slate-300">
                        {itemGstRate}%
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(itemAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Bottom Summary Breakdown below Amount */}
              <tfoot>
                {/* 1. GST */}
                <tr className="border-t border-slate-300 bg-slate-50/50">
                  <td colSpan={2} className="py-1.5 px-2.5 text-xs text-slate-500 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-1.5 px-4 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-r border-slate-300">
                    GST
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-[#0B3C7B] font-mono text-xs whitespace-nowrap">
                    {formatCurrency(taxAmount)}
                  </td>
                </tr>

                {/* 2. Grand Total */}
                <tr className="bg-[#DCE8F8] border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2 px-2.5 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-2 px-4 text-right whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#0B3C7B] border-r border-slate-300">
                    TOTAL
                  </td>
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <span className="text-sm sm:text-[15px] font-black text-[#0B3C7B] font-mono leading-none">
                      {formatCurrency(totalAmount)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── 4. TERMS & CONDITIONS ── */}
          <div className="mb-3">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-1.5">
              TERMS &amp; CONDITIONS
            </div>
            <ol className="space-y-1 text-[10px] sm:text-[11px] text-slate-600 list-none pl-0">
              {[
                'Validity: 15 days from the date of issue.',
                'Payment terms: Mutually agreed (50% advance, 50% after delivery).',
                'Work will commence after the confirmation of advance payment.',
                'Additional work outside agreed scope will be charged separately.',
                "Client's approval is required before final production or delivery."
              ].map((term, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-[#0B3C7B] shrink-0 w-3.5">{i + 1}.</span>
                  <span className="leading-tight">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 5. PAYMENT DETAILS (BELOW TERMS & CONDITIONS) ── */}
          <div className="border border-slate-200 p-3 text-xs mb-3">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] border-b border-slate-200 pb-1 mb-2">
              PAYMENT DETAILS
            </div>
            <div className="flex items-center justify-between gap-4">
              {/* Bank Fields as proper table columns with vertical divider borders */}
              <div className="grid grid-cols-4 divide-x divide-slate-200 flex-1">
                <div className="pr-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">ACCOUNT NAME</div>
                  <div className="font-bold text-slate-900 text-[11px] leading-tight truncate">{bank?.accountHolder || 'SB Digital Automation Pvt Ltd'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">ACCOUNT NUMBER</div>
                  <div className="font-bold text-slate-900 text-xs font-mono leading-tight">{bank?.accountNumber || '50200088991234'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">BANK / IFSC</div>
                  <div className="font-bold text-slate-900 text-[11px] leading-tight truncate">{bank?.bankName || 'HDFC Bank'} / {bank?.ifscCode || 'HDFC0001234'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">UPI ID</div>
                  <div className="font-bold text-[#0B3C7B] text-[11px] leading-tight truncate">{bank?.upiId || 'sbdigital@upi'}</div>
                </div>
              </div>

              {/* Dashed QR Box */}
              <div className="flex flex-col items-center justify-center shrink-0 border-l border-slate-200 pl-4">
                <div className="w-[68px] h-[68px] border border-dashed border-slate-300 flex items-center justify-center p-1 bg-white rounded-xs">
                  <img
                    src={qrUrl}
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<span class="text-[9px] font-bold text-[#0B3C7B]">Payment QR</span>';
                    }}
                  />
                </div>
                <div className="text-[8px] font-black uppercase tracking-wider text-[#0B3C7B] text-center mt-0.5">
                  SCAN TO PAY
                </div>
              </div>
            </div>
          </div>

          </div>
          {/* End top content */}

          {/* ── 5. FOOTER (ALIGNED TO BOTTOM OF PAGE NEATLY) ── */}
          <div className="mt-auto shrink-0 document-footer pt-3">
            {/* Full-width light divider line */}
            <div className="border-t border-slate-200 w-full mb-2" />

            <div className="flex items-start justify-between text-[10px] text-slate-500 leading-normal">
              <div>
                <div>{company?.address || '2nd Floor, 1064/442 RV Garden, NH 75'}</div>
                <div>Jayanagara, Kolar – 563101, Karnataka, India</div>
                <div className="mt-0.5 text-slate-400 text-[9px]">© 2026 SB Digital Automation. All rights reserved.</div>
              </div>
              <div className="text-right">
                <div>Phone {company?.phone || '+91 8217536889'}</div>
                <div>Tel {company?.telephone || '+91 8152460320'}</div>
              </div>
            </div>
          </div>

        </div>

      {/* ── EDIT QUOTATION MODAL (ATTACHED TO WINDOW TOP, SLIDES DOWN FROM ABOVE) ── */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer z-40"
            onClick={() => setIsEditModalOpen(false)}
          />

          {/* Top Attached Container */}
          <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-4xl bg-white border-b-2 border-slate-300 shadow-2xl flex flex-col max-h-[88vh] rounded-b-2xl sm:rounded-b-3xl overflow-hidden"
              style={{
                animation: 'slideDownTopWindow 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <IconEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Edit Quotation</h3>
                    <p className="text-xs text-slate-500">Modify quotation details, line items, and GST taxes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <IconClose className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Number</label>
                    <input
                      type="text"
                      required
                      value={editFormData.quotationNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, quotationNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Valid Until</label>
                    <input
                      type="date"
                      required
                      value={editFormData.validUntil}
                      onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Customer</label>
                    <select
                      value={editFormData.client?.name || ''}
                      onChange={(e) => {
                        const sel = clients.find(c => c.name === e.target.value);
                        if (sel) setEditFormData({ ...editFormData, client: sel });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 bg-white"
                    >
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={editFormData.paymentTerms}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 bg-white"
                      placeholder="e.g. 50% advance, 50% on delivery"
                    />
                  </div>
                </div>

                {/* Line Items with Editable GST % and GST Amount */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Items &amp; GST Details</span>
                    <button
                      type="button"
                      onClick={handleAddEditItem}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Header Row for Items Grid */}
                  <div className="grid grid-cols-[1fr_80px_55px_65px_85px_85px_28px] gap-2 px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div>Description</div>
                    <div className="text-right">Rate (₹)</div>
                    <div className="text-center">Qty</div>
                    <div className="text-center">GST %</div>
                    <div className="text-right">GST (₹)</div>
                    <div className="text-right">Total (₹)</div>
                    <div></div>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {editFormData.items.map((it, idx) => {
                      const baseAmt = Number(it.rate || 0) * Number(it.qty || 1);
                      const gRate = Number(it.gstRate != null ? it.gstRate : 18);
                      const gAmt = it.gstAmount != null ? Number(it.gstAmount) : (baseAmt * gRate) / 100;
                      const lineTotal = baseAmt + gAmt;

                      return (
                        <div key={idx} className="grid grid-cols-[1fr_80px_55px_65px_85px_85px_28px] items-center gap-2 bg-slate-50 p-2 border border-slate-200">
                          <div>
                            <input
                              type="text"
                              value={it.description}
                              onChange={(e) => handleEditItemChange(idx, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white text-xs font-medium"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={it.rate}
                              onChange={(e) => handleEditItemChange(idx, 'rate', e.target.value)}
                              placeholder="Rate"
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white text-xs text-right font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={it.qty}
                              onChange={(e) => handleEditItemChange(idx, 'qty', e.target.value)}
                              placeholder="Qty"
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white text-xs text-center font-mono"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={it.gstRate != null ? it.gstRate : 18}
                              onChange={(e) => handleEditItemChange(idx, 'gstRate', e.target.value)}
                              placeholder="GST %"
                              title="Edit GST Percentage"
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white text-xs text-center font-mono text-blue-700 font-bold"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="any"
                              value={Math.round(gAmt * 100) / 100}
                              onChange={(e) => handleEditItemChange(idx, 'gstAmount', e.target.value)}
                              placeholder="GST Amount"
                              title="Edit GST Amount"
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white text-xs text-right font-mono font-semibold"
                            />
                          </div>
                          <div className="text-right font-mono font-bold text-slate-900 text-xs">
                            {formatCurrency(lineTotal)}
                          </div>
                          {editFormData.items.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveEditItem(idx)}
                              className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Remove item"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Summary Preview */}
                <div className="bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Items Count: <span className="font-bold text-slate-800">{editFormData.items.length}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px] mr-1.5">Taxable:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(editFormData.items.reduce((s, it) => s + (Number(it.rate || 0) * Number(it.qty || 1)), 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px] mr-1.5">GST Tax:</span>
                      <span className="font-mono font-bold text-[#0B3C7B]">
                        {formatCurrency(editFormData.items.reduce((s, it) => {
                          const amt = Number(it.rate || 0) * Number(it.qty || 1);
                          const gRate = Number(it.gstRate != null ? it.gstRate : 18);
                          const gAmt = it.gstAmount != null && !isNaN(it.gstAmount) ? Number(it.gstAmount) : (amt * gRate) / 100;
                          return s + gAmt;
                        }, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#0B3C7B] uppercase font-black text-[11px] mr-1.5">Total:</span>
                      <span className="font-mono font-black text-sm text-[#0B3C7B]">
                        {formatCurrency(
                          editFormData.items.reduce((s, it) => s + (Number(it.rate || 0) * Number(it.qty || 1)), 0) +
                          editFormData.items.reduce((s, it) => {
                            const amt = Number(it.rate || 0) * Number(it.qty || 1);
                            const gRate = Number(it.gstRate != null ? it.gstRate : 18);
                            const gAmt = it.gstAmount != null && !isNaN(it.gstAmount) ? Number(it.gstAmount) : (amt * gRate) / 100;
                            return s + gAmt;
                          }, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Commercial Notes &amp; Terms</label>
                  <textarea
                    rows="2"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B3C7B] hover:bg-[#072c5b] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation & Print Stylesheet */}
      <style>{`
        @keyframes slideDownTopWindow {
          from {
            transform: translateY(-100%);
            opacity: 0.5;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .quotation-print-sheet, .quotation-print-sheet * {
            visibility: visible;
          }
          .quotation-print-sheet {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 6mm 8mm !important;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
