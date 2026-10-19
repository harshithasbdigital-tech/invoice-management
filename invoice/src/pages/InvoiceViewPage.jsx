import React, { useState, useEffect } from 'react';
import { formatCurrency, getInvoicePaymentStatus, numberToWords, formatDisplayDate } from '../utils/numberToWords';
import {
  IconPrint,
  IconEdit,
  IconClose,
  IconPlus,
  IconTrash,
  IconInvoice
} from '../components/Icons';

export function InvoiceViewPage({
  invoice,
  payments = [],
  company,
  bank,
  settings,
  qrImage,
  onBack,
  onEdit,
  onUpdateInvoice,
  onConvertToTaxInvoice
}) {
  if (!invoice) return null;

  const [currentInvoice, setCurrentInvoice] = useState(invoice);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    setCurrentInvoice(invoice);
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const client = currentInvoice.client || {};
  const items = currentInvoice.items && currentInvoice.items.length > 0
    ? currentInvoice.items
    : [
      { description: currentInvoice.service || 'Consulting & Services', rate: currentInvoice.amount || 0, qty: 1, gstRate: 18, total: currentInvoice.amount || 0 }
    ];

  const subtotalAmount = currentInvoice.subtotal != null ? currentInvoice.subtotal : items.reduce((acc, it) => {
    return acc + (Number(it.total) || Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0);
  }, 0);

  const taxAmount = currentInvoice.taxAmount != null
    ? currentInvoice.taxAmount
    : ((Number(currentInvoice.cgstTotal || 0) + Number(currentInvoice.sgstTotal || 0) + Number(currentInvoice.igstTotal || 0)) ||
      items.reduce((acc, it) => {
        if (it.gstAmount != null && !isNaN(it.gstAmount)) return acc + Number(it.gstAmount);
        const itAmt = Number(it.total) || Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0;
        const rate = Number(it.gstRate != null ? it.gstRate : 18);
        return acc + (itAmt * rate) / 100;
      }, 0));

  const grandTotal = currentInvoice.grandTotal || (subtotalAmount + taxAmount);

  // Compute accurate payment status & settled amounts
  const paymentStatusInfo = getInvoicePaymentStatus(currentInvoice, payments);
  const isPaid = paymentStatusInfo.status === 'Paid';
  const isPartial = paymentStatusInfo.status === 'Partial';
  const isUnpaid = paymentStatusInfo.status === 'Unpaid';

  // Total amount settled / paid so far
  const totalAmountPaid = isPaid ? grandTotal : paymentStatusInfo.totalPaid;
  const balanceDue = isPaid ? 0 : Math.max(0, grandTotal - totalAmountPaid);
  const advanceAmount = isPaid ? grandTotal : (totalAmountPaid > 0 ? totalAmountPaid : Math.round((grandTotal * 0.5) * 100) / 100);

  const companyName = (company?.name && company.name !== 'SB') ? company.name : 'SB DIGITAL AUTOMATION PVT. LTD.';
  const invoiceNumber = currentInvoice.invoiceNumber || 'SB-INV-1001';
  const invoiceDate = currentInvoice.invoiceDate || currentInvoice.date || new Date().toISOString().split('T')[0];
  const dueDate = currentInvoice.dueDate || 'On Receipt';

  // Dynamic UPI payload & QR: Request balance due if pending, or grand total
  const payableAmount = balanceDue > 0 ? balanceDue : grandTotal;
  const upiId = bank?.upiId || 'sbdigital@upi';
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(companyName)}&am=${payableAmount}&tn=Invoice-${encodeURIComponent(invoiceNumber)}&cu=INR`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayload)}`;
  const qrUrl = qrImage || dynamicQrUrl;

  const docType = currentInvoice.docType || 'tax_invoice';
  const isReceipt = docType === 'receipt';
  const isBill = docType === 'bill';
  const isPurchaseOrder = docType === 'purchase_order';

  const poNumber = currentInvoice.poNumber || currentInvoice.invoiceNumber || 'SB-PO-1004';
  const poDate = formatDisplayDate(invoiceDate) || '19 Oct 2026';
  const poDeliveryDate = formatDisplayDate(currentInvoice.dueDate) || '30 Oct 2026';
  const poStatus = currentInvoice.status || 'Issued to Vendor';
  const poDeliveryAddress = currentInvoice.deliveryAddress || `${companyName}, 2nd Floor, 1064/442 RV Garden, NH 75, Jayanagara, Kolar – 563101, Karnataka`;
  const poDeliveryContact = currentInvoice.deliveryContact || `${company?.phone || '+91 8217536889'}`;
  const poPaymentTerms = currentInvoice.paymentTerms || 'Net 30 Days after Delivery';
  const poVendorQuoteRef = currentInvoice.vendorQuoteRef || '';

  const receiptNumber = currentInvoice.invoiceNumber || currentInvoice.receiptNumber || 'SB-R-000301';
  const receiptDateFormatted = formatDisplayDate(invoiceDate) || '25 Sep 2026';
  const receiptPaidBy = currentInvoice.paymentMode || 'UPI';
  const receiptAgainst = currentInvoice.againstDoc || currentInvoice.quotationNumber || 'SB-Q-999221';
  const receiptTowards = currentInvoice.paymentTowards || '50% advance';
  const receiptRef = currentInvoice.transactionRef || '[UTR / TXN NO.]';

  const amountReceivedValue = Number(currentInvoice.receiptAmountReceived != null ? currentInvoice.receiptAmountReceived : (currentInvoice.grandTotal || grandTotal));
  const projectTotalValue = Number(currentInvoice.receiptProjectTotal != null ? currentInvoice.receiptProjectTotal : (currentInvoice.projectTotal || amountReceivedValue * 2));
  const balanceDueValue = Number(currentInvoice.receiptBalanceDue != null ? currentInvoice.receiptBalanceDue : Math.max(0, projectTotalValue - amountReceivedValue));
  const amountInWords = currentInvoice.amountInWords || numberToWords(amountReceivedValue);

  // Bill-specific calculations & defaults
  const billNumber = currentInvoice.invoiceNumber || currentInvoice.billNumber || 'SB-B-000201';
  const billDateFormatted = formatDisplayDate(invoiceDate) || '19 Oct 2026';
  const billPaidBy = currentInvoice.paymentMode || 'UPI';
  const billStatus = currentInvoice.status || (isPaid ? 'Paid' : isPartial ? 'Partial' : 'Paid');
  const billDiscount = Number(currentInvoice.discount != null ? currentInvoice.discount : (subtotalAmount > grandTotal ? subtotalAmount - grandTotal : 0));
  const billGrandTotalInWords = currentInvoice.amountInWords || numberToWords(grandTotal);

  const paddedBillItems = [...items];
  while (paddedBillItems.length < 4) {
    paddedBillItems.push({ description: '', qty: '', rate: '', amount: '' });
  }

  const getDocTitle = () => {
    switch (docType) {
      case 'quotation':
        return 'QUOTATION / ESTIMATE';
      case 'pre_invoice':
        return 'PROFORMA INVOICE (PRE-INVOICE)';
      case 'bill':
        return 'RETAIL / CASH BILL';
      case 'receipt':
        return 'OFFICIAL PAYMENT RECEIPT';
      case 'purchase_order':
        return 'PURCHASE ORDER';
      case 'tax_invoice':
      default:
        return 'TAX INVOICE';
    }
  };

  // Drawer Edit Handlers
  const handleOpenEdit = () => {
    setEditFormData({
      invoiceNumber: currentInvoice.invoiceNumber || '',
      invoiceDate: currentInvoice.invoiceDate || currentInvoice.date || '',
      dueDate: currentInvoice.dueDate || '',
      status: currentInvoice.status || 'Unpaid',
      paymentTerms: currentInvoice.paymentTerms || '50% advance received, balance on delivery',
      advancePaid: advanceAmount,
      client: {
        name: client.name || '',
        companyName: client.companyName || client.company || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || ''
      },
      items: items.map(it => {
        const rate = Number(it.rate) || 0;
        const qty = Number(it.qty) || 1;
        const amount = Number(it.amount != null ? it.amount : (it.total || rate * qty));
        const gstRate = Number(it.gstRate != null ? it.gstRate : 18);
        const gstAmount = Number(it.gstAmount != null ? it.gstAmount : (amount * gstRate) / 100);
        return {
          description: it.description || it.name || '',
          rate,
          qty,
          amount,
          gstRate,
          gstAmount
        };
      }),
      notes: currentInvoice.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditItemChange = (index, field, value) => {
    if (!editFormData) return;
    const newItems = [...editFormData.items];
    const item = { ...newItems[index] };

    if (field === 'rate' || field === 'qty') {
      item[field] = Number(value) || 0;
      item.amount = (Number(item.rate) || 0) * (Number(item.qty) || 0);
      const rateGst = Number(item.gstRate != null ? item.gstRate : 18);
      item.gstAmount = (item.amount * rateGst) / 100;
    } else if (field === 'gstRate') {
      const gRate = Number(value) || 0;
      item.gstRate = gRate;
      item.gstAmount = ((Number(item.amount) || 0) * gRate) / 100;
    } else if (field === 'gstAmount') {
      const gAmt = Number(value) || 0;
      item.gstAmount = gAmt;
      const baseAmt = Number(item.amount) || 0;
      item.gstRate = baseAmt > 0 ? Math.round(((gAmt / baseAmt) * 100) * 100) / 100 : 0;
    } else {
      item[field] = value;
    }

    newItems[index] = item;
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleAddEditItem = () => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      items: [
        ...editFormData.items,
        { description: 'New Service / Item', rate: 1000, qty: 1, amount: 1000, gstRate: 18, gstAmount: 180 }
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
    const calculatedTax = editFormData.items.reduce((sum, it) => {
      if (it.gstAmount != null && !isNaN(it.gstAmount)) return sum + Number(it.gstAmount);
      const amt = Number(it.amount) || 0;
      const rate = Number(it.gstRate != null ? it.gstRate : 18);
      return sum + (amt * rate) / 100;
    }, 0);
    const calculatedGrandTotal = subtotal + calculatedTax;
    const updatedAdvancePaid = Number(editFormData.advancePaid) || 0;

    const updated = {
      ...currentInvoice,
      invoiceNumber: editFormData.invoiceNumber,
      invoiceDate: editFormData.invoiceDate,
      date: editFormData.invoiceDate,
      dueDate: editFormData.dueDate,
      status: editFormData.status,
      paymentTerms: editFormData.paymentTerms,
      advancePaid: updatedAdvancePaid,
      client: editFormData.client,
      items: editFormData.items,
      subtotal,
      taxAmount: calculatedTax,
      grandTotal: calculatedGrandTotal,
      notes: editFormData.notes
    };

    setCurrentInvoice(updated);
    if (onUpdateInvoice) {
      onUpdateInvoice(updated);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full min-h-full bg-white">

      {/* ── Integrated Top Action Bar with Breadcrumb (Hidden on print) ── */}
      <div className="no-print px-4 sm:px-8 lg:px-10 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-3 sticky top-0 z-10 shadow-2xs flex-nowrap overflow-x-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shrink-0" aria-label="Breadcrumb">
          <button
            type="button"
            onClick={onBack}
            className="text-slate-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
          >
            Invoices
          </button>
          <span className="text-slate-300 font-light select-none">/</span>
          <span className="text-[#0B3C7B] font-bold font-mono whitespace-nowrap">
            {invoiceNumber}
          </span>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          {currentInvoice.docType === 'pre_invoice' && currentInvoice.status !== 'Converted' && onConvertToTaxInvoice && (
            <button
              type="button"
              onClick={() => onConvertToTaxInvoice(currentInvoice)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <IconInvoice className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Convert to Tax Invoice</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <IconEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <span>Edit Invoice</span>
          </button>

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

      {/* ── Invoice / Receipt Printable Content ── */}
      <div
        id="invoice-print-sheet"
        className="invoice-print-sheet p-3 sm:p-5 max-w-4xl mx-auto text-slate-900 font-sans select-text flex flex-col justify-between min-h-[250mm]"
      >
        {isReceipt ? (
          /* ── EXACT RECEIPT FORMAT MATCHING USER REFERENCE ── */
          <div className="flex flex-col justify-between min-h-[240mm] text-slate-900 font-sans">
            <div>
              {/* 1. Header Row */}
              <div className="flex items-start justify-between gap-4 mb-3.5">
                <div>
                  <img
                    src="/sb_digital_logo.png"
                    alt="SB DIGITAL"
                    className="h-9 sm:h-11 w-auto object-contain mb-1.5"
                  />
                  <div className="text-xs font-bold text-slate-900 tracking-wide mb-0.5">
                    {companyName}
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-2.5">
                    <span>{company?.phone || '+91 98765 43210'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-800">GST: {company?.gstin || '29ABMCS2397E1ZU'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{company?.email || 'info@sbdat.com'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{company?.website || 'www.in.sbdat.com'}</span>
                  </div>
                </div>

                {/* Right: Bordered Receipt Box */}
                <div className="border border-slate-200 w-64 sm:w-72">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-white">
                    <span className="text-[11px] font-black tracking-wider uppercase text-[#0B3C7B]">
                      RECEIPT
                    </span>
                    <span className="text-[11px] font-bold text-[#0B3C7B] font-mono">
                      {receiptNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-center divide-x divide-slate-200 bg-slate-50/50">
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">DATE</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{receiptDateFormatted}</div>
                    </div>
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">PAID BY</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{receiptPaidBy}</div>
                    </div>
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">AGAINST</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{receiptAgainst}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Two Light-Bordered Boxes Side-by-Side */}
              <div className="grid grid-cols-2 gap-4 mb-3.5">
                {/* Box 1: RECEIVED FROM */}
                <div className="border border-slate-200 p-3">
                  <div>
                    <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                      RECEIVED FROM
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#0B3C7B] leading-tight mb-1.5">
                      {client.name || 'Valued Customer'}
                    </div>
                    {client.companyName && client.companyName !== client.name && (
                      <div className="text-slate-600 text-xs mb-2">
                        {client.companyName}
                      </div>
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="grid grid-cols-[65px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PHONE</span>
                        <span className="text-slate-800 text-[11px] font-mono">{client.phone || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[65px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">EMAIL</span>
                        <span className="text-slate-800 text-[11px] truncate">{client.email || '-'}</span>
                      </div>
                      <div className="grid grid-cols-[65px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">ADDRESS</span>
                        <span className="text-slate-800 text-[11px]">{client.address || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Box 2: PAYMENT DETAILS */}
                <div className="border border-slate-200 p-3">
                  <div>
                    <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                      PAYMENT DETAILS
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">MODE</span>
                        <span className="text-slate-900 font-bold text-[11px]">{receiptPaidBy}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">REFERENCE</span>
                        <span className="text-slate-900 font-mono font-bold text-[11px]">{receiptRef}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PAID ON</span>
                        <span className="text-slate-900 font-bold text-[11px]">{receiptDateFormatted}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr]">
                        <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">TOWARDS</span>
                        <span className="text-slate-900 font-bold text-[11px]">{receiptTowards}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Hero Amount Box */}
              <div className="bg-[#DCE8F8] border border-slate-300 p-3 sm:p-3.5 mb-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B3C7B] mb-1">
                    AMOUNT RECEIVED
                  </div>
                  <div className="text-xs text-slate-800 font-medium">
                    <strong className="font-bold text-[#0B3C7B] uppercase tracking-wider mr-1.5 text-[10px]">IN WORDS:</strong>
                    <span>{amountInWords}</span>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">
                  {formatCurrency(amountReceivedValue)}
                </div>
              </div>

              {/* 4. Payment Summary Table */}
              <div className="mb-3.5">
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#DCE8F8] border-b border-slate-300 text-[10.5px] font-black uppercase text-[#0B3C7B] tracking-wider">
                      <th className="py-2 px-3.5 border-r border-slate-300">PAYMENT SUMMARY</th>
                      <th className="py-2 px-3.5 text-right">AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    <tr>
                      <td className="py-2 px-3.5 font-bold text-slate-900 border-r border-slate-300">Project total</td>
                      <td className="py-2 px-3.5 text-right font-mono text-slate-800">
                        {projectTotalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3.5 font-bold text-slate-900 border-r border-slate-300">Received now ({receiptTowards})</td>
                      <td className="py-2 px-3.5 text-right font-mono font-bold text-slate-900">
                        {amountReceivedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-300 bg-slate-50/50">
                      <td className="py-2 px-3.5 font-black text-slate-900 text-xs border-r border-slate-300">Balance due on delivery</td>
                      <td className="py-2 px-3.5 text-right font-mono font-black text-slate-900 text-xs">
                        {balanceDueValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. Notes */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 bg-[#0B3C7B]" />
                  <span>NOTES</span>
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900">1</span>
                    <span>This receipt confirms the payment received against quotation {receiptAgainst}.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900">2</span>
                    <span>Work will commence after the confirmation of advance payment.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-900">3</span>
                    <span>The balance of 50% is payable on delivery.</span>
                  </div>
                </div>
              </div>
            </div>


            {/* 7. Document Footer */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-start text-[10px] text-slate-600">
              <div>
                <div>2nd Floor, 1064/442 RV Garden, NH 75</div>
                <div>Jayanagara, Kolar – 563101, Karnataka, India</div>
                <div className="mt-0.5 text-slate-500">© 2026 SB Digital Automation. All rights reserved.</div>
              </div>
              <div className="text-center">
                <div>Phone +91 8217536889</div>
                <div>Tel +91 8152460320</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">{receiptNumber}</div>
                <div>Page 1 of 1</div>
              </div>
            </div>
          </div>
        ) : isBill ? (
          /* ── EXACT BILL FORMAT MATCHING USER REFERENCE ── */
          <div className="flex flex-col justify-between min-h-[260mm] text-slate-900 font-sans">
            <div>
              {/* 1. Header Row */}
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <img
                    src="/sb_digital_logo.png"
                    alt="SB DIGITAL"
                    className="h-10 sm:h-12 w-auto object-contain mb-2"
                  />
                  <div className="text-xs font-bold text-slate-900 tracking-wide mb-0.5">
                    {companyName}
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-3">
                    <span>{company?.phone || '+91 98765 43210'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-800">GST: {company?.gstin || '29ABMCS2397E1ZU'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{company?.email || 'info@sbdat.com'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{company?.website || 'www.in.sbdat.com'}</span>
                  </div>
                </div>

                {/* Right: Bordered Bill Box */}
                <div className="border border-slate-200 w-72 sm:w-80">
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-200 bg-white">
                    <span className="text-[11px] font-black tracking-wider uppercase text-[#0B3C7B]">
                      BILL
                    </span>
                    <span className="text-[11px] font-bold text-[#0B3C7B] font-mono">
                      {billNumber}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 text-center divide-x divide-slate-200 bg-slate-50/50">
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">DATE</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{billDateFormatted}</div>
                    </div>
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">PAID BY</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{billPaidBy}</div>
                    </div>
                    <div className="px-1.5 py-1">
                      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">STATUS</div>
                      <div className="text-[10px] font-bold text-slate-900 truncate">{billStatus}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Two Light-Bordered Boxes Side-by-Side */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Box 1: BILL TO */}
                <div className="border border-slate-200 p-3">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                    BILL TO
                  </div>
                  <div className="text-sm sm:text-base font-bold text-[#0B3C7B] leading-tight mb-1.5">
                    {client.name || 'Valued Customer'}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="grid grid-cols-[65px_1fr]">
                      <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PHONE</span>
                      <span className="text-slate-800 text-[11px] font-mono">{client.phone || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[65px_1fr]">
                      <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">ADDRESS</span>
                      <span className="text-slate-800 text-[11px]">{client.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: PAYMENT */}
                <div className="border border-slate-200 p-3 flex flex-col justify-between">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-1">
                    PAYMENT
                  </div>
                  <div className="flex items-center gap-3 my-1">
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">
                      {formatCurrency(grandTotal)}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-slate-300 bg-blue-50 text-[#0B3C7B]">
                      {isPaid ? 'PAID IN FULL' : isPartial ? 'PARTIAL' : 'PENDING'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {isPaid ? `Received on ${billDateFormatted} by ${billPaidBy}` : `Due date: ${formatDisplayDate(dueDate)}`}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    Balance due {formatCurrency(balanceDue)}
                  </div>
                </div>
              </div>

              {/* 3. Items Table */}
              <div className="mb-4">
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-[#DCE8F8] border-b border-slate-300 text-[11px] font-black uppercase text-[#0B3C7B] tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">NO.</th>
                      <th className="py-2.5 px-4 border-r border-slate-300">ITEM</th>
                      <th className="py-2.5 px-4 text-center w-20 border-r border-slate-300">QTY</th>
                      <th className="py-2.5 px-4 text-right w-28 border-r border-slate-300">RATE (₹)</th>
                      <th className="py-2.5 px-4 text-right w-32">AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {paddedBillItems.map((item, idx) => (
                      <tr key={idx} className="min-h-[36px]">
                        <td className="py-2 px-3 text-center font-bold text-slate-900 border-r border-slate-300">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-300">
                          {item.description || item.name || ''}
                        </td>
                        <td className="py-2 px-4 text-center font-bold text-slate-900 border-r border-slate-300">
                          {item.qty || (item.description ? '1' : '')}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-slate-900 border-r border-slate-300">
                          {item.rate != null && item.rate !== '' && item.description
                            ? Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : ''}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                          {item.amount != null && item.amount !== '' && item.description
                            ? Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : item.rate && item.qty
                              ? (Number(item.rate) * Number(item.qty)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : ''}
                        </td>
                      </tr>
                    ))}
                    {/* Subtotal */}
                    <tr className="border-t border-slate-300">
                      <td colSpan="4" className="py-2 px-4 text-right font-bold text-slate-900 border-r border-slate-300">Subtotal</td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                        {subtotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {/* Discount if applicable */}
                    {billDiscount > 0 && (
                      <tr className="border-t border-slate-200">
                        <td colSpan="4" className="py-2 px-4 text-right font-bold text-slate-900 border-r border-slate-300">Discount</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                          - {billDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Highlight Bottom Total Bar */}
                <div className="bg-[#DCE8F8] border-x border-b border-slate-300 py-2.5 px-4 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">
                    Thank you for your business.
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">TOTAL</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono tracking-tight">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. In Words */}
              <div className="text-xs text-slate-900 mb-6">
                <span className="font-bold uppercase tracking-wider mr-2">IN WORDS</span>
                <span className="font-medium">{billGrandTotalInWords}</span>
              </div>

              {/* 5. Notes & Payment Details */}
              <div className="grid grid-cols-2 gap-6 mb-8 items-start">
                {/* Notes */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 bg-[#0B3C7B]" />
                    <span>NOTES</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-900">1</span>
                      <span>Additional work outside agreed scope will be charged separately.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-900">2</span>
                      <span>Client's approval is required before final production or delivery.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-900">3</span>
                      <span>Please keep this bill for your records.</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details Box */}
                <div className="border border-[#1A365D] p-3.5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                    PAYMENT DETAILS
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase">ACCOUNT NAME</div>
                        <div className="font-bold text-slate-900">{bank?.accountName || companyName}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase">ACCOUNT NUMBER</div>
                        <div className="font-mono font-bold text-slate-950 text-sm">{bank?.accountNumber || '50200088991234'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase">BANK / IFSC</div>
                        <div className="font-bold text-slate-900">{(bank?.bankName || 'HDFC Bank')} {(bank?.ifsc || 'HDFC0001234')}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-600 uppercase">UPI ID</div>
                        <div className="font-bold text-slate-900">{bank?.upiId || 'sbdigital@upi'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div className="border border-dashed border-[#1A365D] w-24 h-24 flex items-center justify-center p-1 bg-white">
                        <img src={qrUrl} alt="Payment QR" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-900 mt-1">
                        SCAN TO PAY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* 7. Document Footer */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-start text-[10px] text-slate-600">
              <div>
                <div>2nd Floor, 1064/442 RV Garden, NH 75</div>
                <div>Jayanagara, Kolar – 563101, Karnataka, India</div>
                <div className="mt-0.5 text-slate-500">© 2026 SB Digital Automation. All rights reserved.</div>
              </div>
              <div className="text-center">
                <div>Phone +91 8217536889</div>
                <div>Tel +91 8152460320</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-800">{billNumber}</div>
                <div>Page 1 of 1</div>
              </div>
            </div>
          </div>
        ) : (
          <>
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

          {/* ── 2. TWO BOXES: BILLED TO / VENDOR & (INVOICE / PO DETAILS) ── */}
          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* Box 1: BILLED TO or VENDOR / SUPPLIER */}
            <div className="border border-slate-200 p-3">
              <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                {isPurchaseOrder ? 'VENDOR / SUPPLIER (PURCHASING FROM)' : 'BILLED TO'}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B3C7B] leading-tight mb-1.5">
                {client.name || (isPurchaseOrder ? 'Vendor / Supplier' : 'Valued Customer')}
              </div>
              {client.companyName && client.companyName !== 'Direct Billing' && (
                <div className="text-slate-600 text-xs mb-2">
                  {client.companyName}
                </div>
              )}

              <div className="space-y-1 text-xs">
                {client.gstin && (
                  <div className="grid grid-cols-[65px_1fr]">
                    <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">GSTIN</span>
                    <span className="text-slate-800 text-[11px] font-mono font-semibold">{client.gstin}</span>
                  </div>
                )}
                <div className="grid grid-cols-[65px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PHONE</span>
                  <span className="text-slate-800 text-[11px]">{client.phone || '+91 98765 43210'}</span>
                </div>
                <div className="grid grid-cols-[65px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">EMAIL</span>
                  <span className="text-slate-800 text-[11px]">{client.email || 'vendor@example.com'}</span>
                </div>
                <div className="grid grid-cols-[65px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">ADDRESS</span>
                  <span className="text-slate-800 text-[11px]">{client.address || `${company?.city || 'Bengaluru'}, Karnataka`}</span>
                </div>
              </div>
            </div>

            {/* Box 2: INVOICE / PO META TABLE */}
            <div className="border border-slate-200 flex flex-col justify-between overflow-hidden">
              {/* Top: Document Details Table */}
              <div>
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-white">
                  <span className="text-[11px] font-black tracking-wider text-[#0B3C7B] uppercase">{getDocTitle()}</span>
                  <span className="text-[11px] font-bold text-[#0B3C7B] font-mono">{isPurchaseOrder ? poNumber : invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center border-b border-slate-200 bg-slate-50/50">
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">
                      {isPurchaseOrder ? 'PO DATE' : 'INVOICE DATE'}
                    </div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{invoiceDate}</div>
                  </div>
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">
                      {isPurchaseOrder ? 'EXPECTED DELIVERY' : 'DUE DATE'}
                    </div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Bottom: PO Shipping & Terms or Invoice Settlement */}
              {isPurchaseOrder ? (
                <div className="p-2.5 space-y-1.5 text-xs bg-slate-50/40">
                  <div>
                    <span className="font-bold text-[#0B3C7B] uppercase text-[8px] tracking-wider block mb-0.5">
                      SHIP TO / DELIVERY DESTINATION:
                    </span>
                    <span className="text-slate-800 text-[10px] font-medium leading-snug line-clamp-2" title={poDeliveryAddress}>
                      {poDeliveryAddress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[9px]">
                    <span className="text-slate-500 font-bold uppercase">PAYMENT TERMS:</span>
                    <span className="font-bold text-blue-900">{poPaymentTerms}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-slate-500 font-bold uppercase">ORDER STATUS:</span>
                    <span className="font-bold text-amber-700 uppercase">{poStatus}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-[#0B3C7B] mb-1">
                    PAYMENT TERMS
                  </div>

                  {/* Segmented Switch/Pill container */}
                  <div className="border border-slate-200 flex overflow-hidden mb-1 rounded-xs">
                    {isPaid ? (
                      <>
                        <div className="bg-[#0B3C7B] text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          TOTAL PAID: {formatCurrency(totalAmountPaid)}
                        </div>
                        <div className="bg-emerald-600 text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          PAID IN FULL (100%)
                        </div>
                      </>
                    ) : isPartial ? (
                      <>
                        <div className="bg-[#0B3C7B] text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          ADVANCE PAID: {formatCurrency(totalAmountPaid)}
                        </div>
                        <div className="bg-amber-600 text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          BALANCE DUE: {formatCurrency(balanceDue)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-slate-700 text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          ADVANCE DUE (50%): {formatCurrency(grandTotal * 0.5)}
                        </div>
                        <div className="bg-slate-100 text-slate-700 text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase truncate">
                          BALANCE: {formatCurrency(grandTotal)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Subtext below pill */}
                  <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
                    <span>{isPaid ? '100% Payment Reconciled' : isPartial ? '50% Advance Settled' : 'Payment Awaiting Settlement'}</span>
                    <span>{isPaid ? 'Invoice Settled' : isPartial ? 'Balance Payable on Delivery' : 'Payable on Receipt'}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── 3. ITEMS TABLE (WITH GST % BESIDE QTY & DEDUCTION IN FOOTER) ── */}
          <div className="mb-4">
            <table className="w-full text-left border-collapse table-fixed border border-slate-300">
              <thead>
                <tr className="bg-[#DCE8F8] text-[#0B3C7B] text-[11px] font-black uppercase tracking-wider border-b border-slate-300">
                  <th className="py-2 px-2.5 w-[8%] text-center border-r border-slate-300">SL NO.</th>
                  <th className="py-2 px-2.5 w-[36%] text-left border-r border-slate-300">
                    {isPurchaseOrder ? 'PURCHASED ITEM / MATERIAL' : 'DESCRIPTION'}
                  </th>
                  <th className="py-2 px-2.5 w-[8%] text-center border-r border-slate-300">QTY</th>
                  <th className="py-2 px-2.5 w-[16%] text-right whitespace-nowrap border-r border-slate-300">
                    {isPurchaseOrder ? 'PURCHASE RATE (₹)' : 'RATE (₹)'}
                  </th>
                  <th className="py-2 px-2.5 w-[14%] text-center whitespace-nowrap border-r border-slate-300">
                    {isPurchaseOrder ? 'INPUT GST (%)' : 'GST (%)'}
                  </th>
                  <th className="py-2 px-2.5 w-[18%] text-right whitespace-nowrap">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemRate = Number(item.rate) || 0;
                  const itemQty = Number(item.qty) || 1;
                  const itemAmount = Number(item.amount != null ? item.amount : (item.total != null ? item.total : itemRate * itemQty));
                  const itemGstRate = Number(item.gstRate != null ? item.gstRate : 18);

                  return (
                    <tr key={item.id || idx} className="border-b border-slate-300 text-xs">
                      <td className="py-2 px-2.5 text-center font-bold text-[#1A56DB] border-r border-slate-300">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-2.5 text-slate-800 font-medium truncate border-r border-slate-300">
                        {item.description || item.name || (isPurchaseOrder ? 'Procured Item' : 'Service Item')}
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

              {/* Bottom Summary Breakdown */}
              <tfoot>
                {/* 1. GST */}
                <tr className="border-t border-slate-300 bg-slate-50/50">
                  <td colSpan={2} className="py-1.5 px-2.5 text-xs text-slate-500 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-1.5 px-4 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-r border-slate-300">
                    {isPurchaseOrder ? 'Input Tax (CGST + SGST / IGST)' : 'GST'}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-[#0B3C7B] font-mono text-xs whitespace-nowrap">
                    {formatCurrency(taxAmount)}
                  </td>
                </tr>

                {/* 2. Total Invoice / Order Value */}
                <tr className="border-t border-slate-300 bg-white">
                  <td colSpan={2} className="py-1.5 px-2.5 text-xs text-slate-500 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-1.5 px-4 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-r border-slate-300">
                    {isPurchaseOrder ? 'Total Order Value (PO Total)' : 'Total Invoice'}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-slate-800 font-mono text-xs whitespace-nowrap">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>

                {/* 3. Less: Advance Paid (Only for Sales Invoices) */}
                {!isPurchaseOrder && totalAmountPaid > 0 && (
                  <tr className="border-t border-slate-300 bg-white">
                    <td colSpan={2} className="py-1.5 px-2.5 text-xs text-slate-500 border-r border-slate-300"></td>
                    <td colSpan={3} className="py-1.5 px-4 text-right text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-r border-slate-300">
                      {isPaid ? 'Less: Total Amount Paid' : 'Less: Advance Paid'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700 font-mono text-xs whitespace-nowrap">
                      - {formatCurrency(totalAmountPaid)}
                    </td>
                  </tr>
                )}

                {/* 4. Grand Total Bar / Balance Payable (or Order Total for PO) */}
                <tr className="bg-[#DCE8F8] border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2 px-2.5 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-2 px-4 text-right whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#0B3C7B] border-r border-slate-300">
                    {isPurchaseOrder ? 'TOTAL ORDER VALUE (₹)' : 'BALANCE PAYABLE'}
                  </td>
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <span className="text-sm sm:text-[15px] font-black text-[#0B3C7B] font-mono leading-none">
                      {formatCurrency(isPurchaseOrder ? grandTotal : balanceDue)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── 4. TERMS & CONDITIONS ── */}
          <div className="mb-3">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-1.5">
              {isPurchaseOrder ? 'PROCUREMENT & QUALITY TERMS' : 'TERMS & CONDITIONS'}
            </div>
            <ol className="space-y-1 text-[10px] sm:text-[11px] text-slate-600 list-none pl-0">
              {(isPurchaseOrder ? [
                'All goods must strictly conform to technical specifications and quality standards.',
                'Deliveries must be accompanied by Delivery Challan and Tax Invoice citing this PO number.',
                'Materials are subject to inspection at our warehouse; rejected goods returned at vendor cost.',
                'Payment will be released per agreed credit terms after inspection and stock inwarding.'
              ] : [
                'Payment is due upon receipt unless otherwise specified.',
                'Interest at 18% per annum will be applicable on overdue invoices.',
                'All payments must be made in favor of SB Digital Automation Pvt Ltd.',
                'Goods or services once delivered/rendered cannot be returned.',
                'This is a digitally generated tax invoice and is legally valid.'
              ]).map((term, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-[#0B3C7B] shrink-0 w-3.5">{i + 1}.</span>
                  <span className="leading-tight">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 5. PAYMENT DETAILS (OR VENDOR DELIVERY INSTRUCTIONS) ── */}
          {isPurchaseOrder ? (
            <div className="border border-slate-200 p-3 text-xs mb-3 bg-slate-50/40">
              <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] border-b border-slate-200 pb-1 mb-2">
                VENDOR DELIVERY &amp; DISPATCH INSTRUCTIONS
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-700">
                <div className="space-y-1">
                  <div><strong className="text-slate-900">Ship To / Deliver To:</strong> {poDeliveryAddress}</div>
                  <div><strong className="text-slate-900">Receiving Contact:</strong> {poDeliveryContact}</div>
                  <div><strong className="text-slate-900">Expected Delivery:</strong> On or before {poDeliveryDate}</div>
                </div>
                <div className="space-y-1">
                  <div><strong className="text-slate-900">Agreed Payment Terms:</strong> {poPaymentTerms}</div>
                  <div><strong className="text-slate-900">Invoice Reference:</strong> Vendor Tax Invoice must reference {poNumber}</div>
                  {poVendorQuoteRef && <div><strong className="text-slate-900">Quotation Ref:</strong> {poVendorQuoteRef}</div>}
                  <div><strong className="text-slate-900">Authorized Buyer:</strong> {companyName}</div>
                </div>
              </div>
            </div>
          ) : (
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
          )}

        </div>
        {/* End top content */}

        {/* ── 5. FOOTER (ALIGNED TO BOTTOM OF PAGE NEATLY) ── */}
        <div className="mt-auto shrink-0 document-footer pt-3">
          {/* Full-width divider line */}
          <div className="border-t border-slate-200 w-full mb-2" />

          <div className="flex items-start justify-between text-[10px] text-slate-500 leading-normal">
            <div>
              <div>{company?.address || company?.addressLine1 || '2nd Floor, 1064/442 RV Garden, NH 75'}</div>
              <div>Jayanagara, Kolar – 563101, Karnataka, India</div>
              <div className="mt-0.5 text-slate-400 text-[9px]">© 2026 SB Digital Automation. All rights reserved.</div>
            </div>
            <div className="text-right">
              <div>Phone {company?.phone || '+91 8217536889'}</div>
              <div>Tel {company?.telephone || '+91 8152460320'}</div>
            </div>
          </div>
        </div>

          </>
        )}

      </div>

      {/* ── EDIT INVOICE MODAL (ATTACHED TO WINDOW TOP, SLIDES DOWN FROM ABOVE) ── */}
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
                    <h3 className="font-extrabold text-slate-900 text-base">Edit Invoice</h3>
                    <p className="text-xs text-slate-500">Update invoice details, line items, GST rate/amount, and advance paid</p>
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

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Section A: Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={editFormData.invoiceNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Invoice Date</label>
                    <input
                      type="date"
                      value={editFormData.invoiceDate}
                      onChange={(e) => setEditFormData({ ...editFormData, invoiceDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Payment Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Section B: Client Details & Payment Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={editFormData.paymentTerms}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentTerms: e.target.value })}
                      placeholder="e.g. 50% advance received, balance on delivery"
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Advance Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editFormData.advancePaid}
                      onChange={(e) => setEditFormData({ ...editFormData, advancePaid: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden font-mono font-bold text-emerald-700 bg-emerald-50/30"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                  <div className="text-xs font-bold text-[#0B3C7B] uppercase tracking-wider">Client Information</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Client Contact Name</label>
                      <input
                        type="text"
                        value={editFormData.client.name}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          client: { ...editFormData.client, name: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
                      <input
                        type="text"
                        value={editFormData.client.companyName}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          client: { ...editFormData.client, companyName: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        value={editFormData.client.phone}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          client: { ...editFormData.client, phone: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.client.email}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          client: { ...editFormData.client, email: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Address</label>
                      <input
                        type="text"
                        value={editFormData.client.address}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          client: { ...editFormData.client, address: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 bg-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Line Items Table with GST % and GST Amount editing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-[#0B3C7B] uppercase tracking-wider">
                      Line Items &amp; GST Configuration
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEditItem}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                    >
                      <IconPlus className="w-3.5 h-3.5" />
                      Add Item
                    </button>
                  </div>

                  <div className="border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                          <th className="p-2.5 w-14 text-center">SL NO</th>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5 w-24 text-right">Rate (₹)</th>
                          <th className="p-2.5 w-16 text-center">Qty</th>
                          <th className="p-2.5 w-20 text-center">GST %</th>
                          <th className="p-2.5 w-24 text-right">GST (₹)</th>
                          <th className="p-2.5 w-28 text-right">Amount (₹)</th>
                          <th className="p-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.items.map((it, idx) => (
                          <tr key={idx} className="border-b border-slate-200">
                            <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={it.description}
                                onChange={(e) => handleEditItemChange(idx, 'description', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={it.rate}
                                onChange={(e) => handleEditItemChange(idx, 'rate', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 text-right font-mono focus:border-blue-600 focus:outline-hidden"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="1"
                                value={it.qty}
                                onChange={(e) => handleEditItemChange(idx, 'qty', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 text-center font-mono focus:border-blue-600 focus:outline-hidden"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                value={it.gstRate}
                                onChange={(e) => handleEditItemChange(idx, 'gstRate', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-blue-300 bg-blue-50/40 text-center font-mono font-bold text-blue-900 focus:border-blue-600 focus:outline-hidden"
                                required
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={Math.round((it.gstAmount || 0) * 100) / 100}
                                onChange={(e) => handleEditItemChange(idx, 'gstAmount', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-indigo-200 bg-indigo-50/30 text-right font-mono font-bold text-indigo-900 focus:border-blue-600 focus:outline-hidden"
                              />
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-800">
                              {formatCurrency(it.amount)}
                            </td>
                            <td className="p-2 text-center">
                              {editFormData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditItem(idx)}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                >
                                  <IconTrash className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Real-time recalculated totals banner */}
                  <div className="bg-[#DCE8F8]/60 border border-slate-200 p-3 mt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-600">Items Subtotal: </span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatCurrency(editFormData.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total GST Amount: </span>
                      <span className="font-bold font-mono text-blue-900">
                        {formatCurrency(editFormData.items.reduce((sum, it) => {
                          if (it.gstAmount != null && !isNaN(it.gstAmount)) return sum + Number(it.gstAmount);
                          const amt = Number(it.amount) || 0;
                          const r = Number(it.gstRate != null ? it.gstRate : 18);
                          return sum + (amt * r) / 100;
                        }, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total Invoice: </span>
                      <span className="font-bold font-mono text-[#0B3C7B] text-sm">
                        {formatCurrency(
                          editFormData.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0) +
                          editFormData.items.reduce((sum, it) => {
                            if (it.gstAmount != null && !isNaN(it.gstAmount)) return sum + Number(it.gstAmount);
                            const amt = Number(it.amount) || 0;
                            const r = Number(it.gstRate != null ? it.gstRate : 18);
                            return sum + (amt * r) / 100;
                          }, 0)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-bold">Advance Paid: </span>
                      <span className="font-bold font-mono text-emerald-700 text-sm">
                        - {formatCurrency(Number(editFormData.advancePaid) || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#0B3C7B] font-black uppercase">Balance Payable: </span>
                      <span className="font-black font-mono text-base text-[#0B3C7B]">
                        {formatCurrency(
                          Math.max(0,
                            (editFormData.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0) +
                              editFormData.items.reduce((sum, it) => {
                                if (it.gstAmount != null && !isNaN(it.gstAmount)) return sum + Number(it.gstAmount);
                                const amt = Number(it.amount) || 0;
                                const r = Number(it.gstRate != null ? it.gstRate : 18);
                                return sum + (amt * r) / 100;
                              }, 0)) -
                            (Number(editFormData.advancePaid) || 0)
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section D: Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes / Instructions</label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Footer Actions inside Drawer */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
          .invoice-print-sheet, .invoice-print-sheet * {
            visibility: visible;
          }
          .invoice-print-sheet {
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
