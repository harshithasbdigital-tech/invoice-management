import React, { useState, useEffect } from 'react';
import { numberToWords, formatCurrency } from '../utils/numberToWords';
import {
  IconPlus,
  IconTrash,
  IconPrint,
  IconArrowLeft,
  IconBuilding,
  IconDocument,
  IconInvoice,
  IconBill,
  IconReceipt,
  IconFileText,
  IconCreditCard,
  IconCheck,
  IconPurchaseOrder,
  IconTruck
} from '../components/Icons';

export function NewInvoicePage({
  editingInvoice,
  services = [],
  settings = {},
  company = {},
  currentUser,
  clients = [],
  initialClient = null,
  initialDocType = 'tax_invoice',
  onSave,
  onSaveAndPrint,
  onCancel
}) {
  const isEditing = Boolean(editingInvoice && editingInvoice.id);

  // 5 Document Types: Quotation, Pre-Invoice, Tax Invoice, Bill, Receipt
  const [docType, setDocType] = useState(
    isEditing
      ? editingInvoice.docType || 'tax_invoice'
      : initialDocType || 'tax_invoice'
  );

  const getPrefixForDocType = (type) => {
    switch (type) {
      case 'quotation':
        return 'SB-QT-';
      case 'pre_invoice':
        return 'SB-PI-';
      case 'bill':
        return 'SB-B-';
      case 'receipt':
        return 'SB-R-';
      case 'purchase_order':
        return 'SB-PO-';
      case 'tax_invoice':
      default:
        return settings.prefix || 'SB-INV-';
    }
  };

  const getNextNumberForDocType = (type) => {
    const baseNum = settings.currentNumber || 1004;
    if (type === 'receipt') {
      return `SB-R-${String(baseNum > 999 ? baseNum - 703 : baseNum).padStart(6, '0')}`;
    }
    if (type === 'bill') {
      return `SB-B-${String(baseNum > 999 ? baseNum - 803 : baseNum).padStart(6, '0')}`;
    }
    return `${getPrefixForDocType(type)}${baseNum}`;
  };

  const [docNumber, setDocNumber] = useState(
    isEditing
      ? editingInvoice.invoiceNumber || editingInvoice.quotationNumber || editingInvoice.receiptNumber || ''
      : getNextNumberForDocType(initialDocType || 'tax_invoice')
  );

  useEffect(() => {
    if (!isEditing && initialDocType) {
      setDocType(initialDocType);
      setDocNumber(getNextNumberForDocType(initialDocType));
    }
  }, [initialDocType, isEditing]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [docDate, setDocDate] = useState(
    isEditing ? editingInvoice.invoiceDate || editingInvoice.date || todayStr : todayStr
  );

  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(
    isEditing ? editingInvoice.dueDate || defaultDueDate() : defaultDueDate()
  );

  const [validUntil, setValidUntil] = useState(
    isEditing && editingInvoice.validUntil
      ? editingInvoice.validUntil
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const isPurchaseOrder = docType === 'purchase_order';

  const defaultPoDeliveryAddress = `${company?.name || 'SB Digital Automation Pvt. Ltd.'}, ${company?.address || '2nd Floor, 1064/442 RV Garden, NH 75, Jayanagara'}, ${company?.city || 'Kolar'} - ${company?.pincode || '563101'}, Karnataka`;

  const [deliveryAddress, setDeliveryAddress] = useState(
    isEditing && editingInvoice.deliveryAddress
      ? editingInvoice.deliveryAddress
      : defaultPoDeliveryAddress
  );

  const [deliveryContact, setDeliveryContact] = useState(
    isEditing && editingInvoice.deliveryContact
      ? editingInvoice.deliveryContact
      : `${currentUser?.name || 'Store Incharge'} (${company?.phone || '+91 8217536889'})`
  );

  const [vendorQuoteRef, setVendorQuoteRef] = useState(
    isEditing ? editingInvoice.vendorQuoteRef || '' : ''
  );

  const [poPaymentTerms, setPoPaymentTerms] = useState(
    isEditing ? editingInvoice.paymentTerms || 'Net 30 Days after Delivery' : 'Net 30 Days after Delivery'
  );

  const defaultNotesForDoc = (type) => {
    if (type === 'purchase_order') {
      return '1. Goods must be delivered in sound condition as per specifications.\n2. Invoice and Delivery Challan must mention this PO number.\n3. Defective or damaged items will be rejected and returned at vendor cost.\n4. Payment will be released as per agreed purchase terms after inspection.';
    }
    return 'Thank you for your valued business. Please quote document reference upon settlement.';
  };

  const [status, setStatus] = useState(
    isEditing
      ? editingInvoice.status || (docType === 'purchase_order' ? 'Issued to Vendor' : 'Unpaid')
      : docType === 'bill' || docType === 'receipt'
        ? 'Paid'
        : docType === 'purchase_order'
          ? 'Issued to Vendor'
          : 'Unpaid'
  );

  const [paymentMode, setPaymentMode] = useState(
    isEditing ? editingInvoice.paymentMode || 'UPI / Net Banking' : 'UPI / Net Banking'
  );

  const [transactionRef, setTransactionRef] = useState(
    isEditing ? editingInvoice.transactionRef || '' : ''
  );

  const [taxType, setTaxType] = useState(
    isEditing
      ? editingInvoice.taxType || 'intra'
      : initialClient && initialClient.stateCode && initialClient.stateCode !== (company?.stateCode || '29')
        ? 'inter'
        : settings.defaultTaxType || 'intra'
  );

  const [client, setClient] = useState(
    isEditing && editingInvoice.client
      ? editingInvoice.client
      : initialClient || {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        city: company?.city || 'Bengaluru',
        state: company?.state || 'Karnataka',
        stateCode: company?.stateCode || '29',
        gstin: ''
      }
  );

  const [items, setItems] = useState(
    isEditing && editingInvoice.items && editingInvoice.items.length > 0
      ? editingInvoice.items
      : [
        {
          id: 'item-1',
          serviceId: services[0]?.id || '',
          description: services[0]?.name || (initialDocType === 'purchase_order' ? 'Raw Materials / Components' : 'Professional Services & Consulting'),
          hsnSac: services[0]?.hsnSac || '998314',
          qty: 1,
          unit: services[0]?.unit || 'Unit',
          rate: services[0]?.rate || 1000,
          gstRate: services[0]?.gstRate || 18,
          taxableAmount: services[0]?.rate || 1000,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          total: 0
        }
      ]
  );

  const [notes, setNotes] = useState(
    isEditing
      ? editingInvoice.notes || ''
      : defaultNotesForDoc(initialDocType || 'tax_invoice')
  );

  // Switch Document Type Handler
  const handleSelectDocType = (type) => {
    setDocType(type);
    if (!isEditing) {
      setDocNumber(getNextNumberForDocType(type));
    }
    if (type === 'bill' || type === 'receipt') {
      setStatus('Paid');
      setNotes(defaultNotesForDoc('tax_invoice'));
    } else if (type === 'quotation') {
      setStatus('Pending Approval');
      setNotes(defaultNotesForDoc('tax_invoice'));
    } else if (type === 'purchase_order') {
      setStatus('Issued to Vendor');
      setNotes(defaultNotesForDoc('purchase_order'));
    } else {
      setStatus('Unpaid');
      setNotes(defaultNotesForDoc('tax_invoice'));
    }
  };

  const computedItems = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const taxableAmount = Math.round(qty * rate * 100) / 100;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === 'intra') {
      const halfRate = gstRate / 2;
      cgstAmount = Math.round(((taxableAmount * halfRate) / 100) * 100) / 100;
      sgstAmount = Math.round(((taxableAmount * halfRate) / 100) * 100) / 100;
    } else {
      igstAmount = Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
    }

    const total = Math.round((taxableAmount + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

    return {
      ...item,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total
    };
  });

  const subtotal = computedItems.reduce((acc, curr) => acc + curr.taxableAmount, 0);
  const cgstTotal = computedItems.reduce((acc, curr) => acc + curr.cgstAmount, 0);
  const sgstTotal = computedItems.reduce((acc, curr) => acc + curr.sgstAmount, 0);
  const igstTotal = computedItems.reduce((acc, curr) => acc + curr.igstAmount, 0);
  const rawGrandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;
  const words = numberToWords(roundedGrandTotal);

  const handleAddItem = () => {
    const defaultSrv = services[0];
    const newItem = {
      id: `item-${Date.now()}`,
      serviceId: defaultSrv?.id || 'custom',
      description: (defaultSrv ? defaultSrv.name : 'New Line Item').slice(0, 30),
      hsnSac: defaultSrv?.hsnSac || '998314',
      qty: 1,
      unit: defaultSrv?.unit || 'Unit',
      rate: defaultSrv?.rate || 1000,
      gstRate: defaultSrv?.gstRate || 18,
      taxableAmount: defaultSrv?.rate || 1000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const handleServiceSelect = (index, serviceId) => {
    const updated = [...items];
    if (serviceId === 'custom') {
      updated[index] = {
        ...updated[index],
        serviceId: 'custom',
        description: 'Custom Service / Product',
        hsnSac: '',
        rate: 0,
        gstRate: 18,
        unit: 'Unit'
      };
    } else {
      const srv = services.find((s) => s.id === serviceId);
      if (srv) {
        updated[index] = {
          ...updated[index],
          serviceId: srv.id,
          description: (srv.name || '').slice(0, 30),
          hsnSac: srv.hsnSac || '',
          rate: srv.rate || 0,
          gstRate: srv.gstRate || 18,
          unit: srv.unit || 'Unit'
        };
      }
    }
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      alert("At least one service/item row is required.");
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const constructDocumentData = () => {
    const cleanDocType = typeof docType === 'string' ? docType : 'tax_invoice';
    const id = isEditing ? editingInvoice.id : `${cleanDocType}-${Date.now()}`;
    const cleanNumber = docNumber.trim() || `${getPrefixForDocType(cleanDocType)}${Date.now().toString().slice(-4)}`;

    return {
      id,
      docType: cleanDocType,
      invoiceNumber: cleanNumber,
      quotationNumber: cleanNumber,
      receiptNumber: cleanNumber,
      poNumber: cleanNumber,
      invoiceDate: docDate,
      date: docDate,
      dueDate,
      validUntil,
      status,
      paymentMode,
      transactionRef,
      taxType,
      createdBy: currentUser?.name || 'Staff User',
      deliveryAddress: isPurchaseOrder ? deliveryAddress : undefined,
      deliveryContact: isPurchaseOrder ? deliveryContact : undefined,
      vendorQuoteRef: isPurchaseOrder ? vendorQuoteRef : undefined,
      paymentTerms: isPurchaseOrder ? poPaymentTerms : (editingInvoice?.paymentTerms || undefined),
      client: {
        name: (client?.name || '').trim() || (isPurchaseOrder ? 'Vendor / Supplier' : 'Valued Client'),
        contactPerson: client?.contactPerson || '',
        phone: client?.phone || '',
        email: client?.email || '',
        address: client?.address || '',
        city: client?.city || '',
        state: client?.state || '',
        stateCode: client?.stateCode || '',
        gstin: client?.gstin || ''
      },
      items: (computedItems || []).map((it) => ({
        id: it.id,
        serviceId: it.serviceId || '',
        description: it.description || '',
        hsnSac: it.hsnSac || '',
        qty: Number(it.qty) || 1,
        unit: it.unit || 'Unit',
        rate: Number(it.rate) || 0,
        gstRate: Number(it.gstRate) || 0,
        taxableAmount: Number(it.taxableAmount) || 0,
        cgstAmount: Number(it.cgstAmount) || 0,
        sgstAmount: Number(it.sgstAmount) || 0,
        igstAmount: Number(it.igstAmount) || 0,
        total: Number(it.total) || 0
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      taxAmount: Math.round((cgstTotal + sgstTotal + igstTotal) * 100) / 100,
      roundOff,
      grandTotal: roundedGrandTotal,
      amount: roundedGrandTotal,
      amountInWords: words,
      notes
    };
  };

  const handleSave = (andPrint = false) => {
    if (!client.name.trim()) {
      alert(
        isPurchaseOrder
          ? "Please enter the Vendor / Supplier Name."
          : "Please enter the Customer / Client Name. It will be automatically saved in your Customers Directory!"
      );
      return;
    }
    const data = constructDocumentData();
    if (andPrint) {
      onSaveAndPrint(data);
    } else {
      onSave(data);
    }
  };

  const docTypeDetails = {
    quotation: {
      title: 'Quotation / Estimate',
      subtitle: 'Formal commercial price estimate with validity terms',
      badge: 'QUOTATION',
      themeColor: 'amber'
    },
    pre_invoice: {
      title: 'Pre-Invoice / Proforma',
      subtitle: 'Advance payment invoice prior to final goods/service delivery',
      badge: 'PROFORMA / PRE-INVOICE',
      themeColor: 'indigo'
    },
    tax_invoice: {
      title: 'Official Tax Invoice',
      subtitle: 'Full GST compliant legal tax invoice with CGST/SGST/IGST breakdown',
      badge: 'TAX INVOICE',
      themeColor: 'blue'
    },
    bill: {
      title: 'Retail / Cash Bill',
      subtitle: 'Instant counter retail cash bill / delivery receipt',
      badge: 'CASH / RETAIL BILL',
      themeColor: 'emerald'
    },
    receipt: {
      title: 'Payment Receipt',
      subtitle: 'Official money receipt acknowledging funds received from customer',
      badge: 'PAYMENT RECEIPT',
      themeColor: 'purple'
    },
    purchase_order: {
      title: 'Purchase Order (PO)',
      subtitle: 'Official procurement order to purchase goods, materials & supplies from vendors',
      badge: 'PURCHASE ORDER',
      themeColor: 'rose'
    }
  };

  const currentMeta = docTypeDetails[docType] || docTypeDetails.tax_invoice;

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition cursor-pointer"
            title="Back without saving"
          >
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? `Edit ${currentMeta.title} (${docNumber})` : `Create ${currentMeta.title}`}
            </h1>
            <p className="text-xs text-slate-500">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-xs transition cursor-pointer"
          >
            Save {isPurchaseOrder ? 'Purchase Order' : 'Document'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <IconPrint className="w-4 h-4" />
            <span>Save & Print {isPurchaseOrder ? 'PO' : ''}</span>
          </button>
        </div>
      </div>

      {/* Document Meta Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {isPurchaseOrder
                ? 'PO Number (Order #) *'
                : docType === 'quotation'
                  ? 'Quotation #'
                  : docType === 'receipt'
                    ? 'Receipt #'
                    : docType === 'bill'
                      ? 'Bill #'
                      : 'Invoice #'}
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              placeholder={isPurchaseOrder ? 'e.g. SB-PO-1004' : 'e.g. SB-INV-1004'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {isPurchaseOrder ? 'PO / Order Date *' : 'Date Issued *'}
            </label>
            <input
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              required
            />
          </div>

          {docType === 'quotation' ? (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                {isPurchaseOrder
                  ? 'Expected Delivery Date *'
                  : docType === 'receipt'
                    ? 'Settlement Date'
                    : 'Payment Due Date'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              {isPurchaseOrder ? 'PO Status' : 'Status'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
            >
              {isPurchaseOrder ? (
                <>
                  <option value="Issued to Vendor">Issued to Vendor</option>
                  <option value="Pending Delivery">Pending Delivery</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Fulfilled / Received">Fulfilled / Received</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              ) : docType === 'quotation' ? (
                <>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Converted">Converted to Invoice</option>
                  <option value="Rejected">Rejected</option>
                </>
              ) : docType === 'receipt' ? (
                <>
                  <option value="Paid">Received & Reconciled</option>
                  <option value="Pending">Pending Clearance</option>
                </>
              ) : (
                <>
                  <option value="Unpaid">Unpaid / Pending</option>
                  <option value="Paid">Paid / Settled</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Extra Fields for Purchase Order */}
        {isPurchaseOrder && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Vendor Quotation / Proforma Ref #
              </label>
              <input
                type="text"
                value={vendorQuoteRef}
                onChange={(e) => setVendorQuoteRef(e.target.value)}
                placeholder="e.g. VEND-QT-9921 or Email ref"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Agreed Payment Terms
              </label>
              <select
                value={poPaymentTerms}
                onChange={(e) => setPoPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="Net 30 Days after Delivery">Net 30 Days after Delivery</option>
                <option value="Net 15 Days after Delivery">Net 15 Days after Delivery</option>
                <option value="100% Payment Against Delivery">100% Payment Against Delivery</option>
                <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                <option value="Immediate / Advance Bank Transfer">Immediate / Advance Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Receiving Contact / In-Charge
              </label>
              <input
                type="text"
                value={deliveryContact}
                onChange={(e) => setDeliveryContact(e.target.value)}
                placeholder="Store / Warehouse Incharge (+91 8217536889)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Extra Fields for Receipt or Bill */}
        {(docType === 'receipt' || docType === 'bill') && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="UPI / Net Banking">UPI / Net Banking</option>
                <option value="Cash Settlement">Cash Settlement</option>
                <option value="IMPS / NEFT Transfer">IMPS / NEFT Transfer</option>
                <option value="Cheque Deposit">Cheque Deposit</option>
                <option value="Debit / Credit Card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Transaction / UTR Reference ID
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI-9840291048 or CASH"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Tax Toggle (For Invoices, Pre-Invoices, Bills, Quotations, POs) */}
        {docType !== 'receipt' && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {isPurchaseOrder ? 'Vendor Supply Tax Regime (For Input Tax Credit / ITC)' : 'Tax Regime / Supply Type'}
              </span>
              <p className="text-xs text-slate-400">
                {isPurchaseOrder
                  ? 'Intra-state calculates CGST + SGST (within state). Inter-state calculates IGST on purchased goods.'
                  : 'Intra-state calculates CGST + SGST (within state). Inter-state calculates IGST.'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
              <button
                type="button"
                onClick={() => setTaxType('intra')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${taxType === 'intra'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Intra-State (CGST + SGST)
              </button>
              <button
                type="button"
                onClick={() => setTaxType('inter')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${taxType === 'inter'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Inter-State (IGST)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Party Information: Vendor / Supplier (if PO) or Customer (if Sales Doc) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <IconBuilding className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {isPurchaseOrder ? 'Vendor / Supplier Details (Purchasing From)' : 'Customer Details (Bill To)'}
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            {isPurchaseOrder ? 'Procurement Supplier' : 'Auto-saves to Customer Directory'}
          </span>
        </div>

        {/* Quick Autofill from existing registered vendors / clients */}
        {clients.length > 0 && (
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="font-bold text-blue-900">
              {isPurchaseOrder ? 'Select from registered vendors & suppliers:' : 'Select existing customer (or type new name below):'}
            </span>
            <select
              onChange={(e) => {
                const found = clients.find((c) => c.id === e.target.value);
                if (found) {
                  setClient({
                    id: found.id,
                    name: found.name || '',
                    contactPerson: found.contactPerson || '',
                    phone: found.phone || '',
                    email: found.email || '',
                    address: found.address || '',
                    city: found.city || '',
                    state: found.state || '',
                    stateCode: found.stateCode || '29',
                    gstin: found.gstin || ''
                  });
                  if (found.stateCode && found.stateCode !== (company?.stateCode || '29')) {
                    setTaxType('inter');
                  } else {
                    setTaxType('intra');
                  }
                }
              }}
              className="bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-800 font-semibold focus:outline-none cursor-pointer max-w-sm truncate"
            >
              <option value="">{isPurchaseOrder ? '-- Choose from existing vendors / contacts --' : '-- Choose from existing customers --'}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor / Supplier Company Name *' : 'Customer / Company Name *'}
            </label>
            <input
              type="text"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              placeholder={isPurchaseOrder ? 'e.g. Horizon Hardware & Raw Materials' : 'e.g. Nexus Infotech Solutions LLP'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor GSTIN (For Input Tax Credit / ITC)' : 'Customer GSTIN (Optional)'}
            </label>
            <input
              type="text"
              value={client.gstin}
              onChange={(e) => setClient({ ...client, gstin: e.target.value.toUpperCase() })}
              placeholder={isPurchaseOrder ? 'e.g. 29AAACH4321P1Z5' : 'e.g. 29AAACN1234E1Z1'}
              maxLength={15}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-800 uppercase focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor Contact / Representative' : 'Contact Person'}
            </label>
            <input
              type="text"
              value={client.contactPerson}
              onChange={(e) => setClient({ ...client, contactPerson: e.target.value })}
              placeholder={isPurchaseOrder ? 'e.g. Dr. Sandeep Patel (Sales Mgr)' : 'e.g. Kavita Rao'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor Phone Number' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              placeholder="e.g. +91 98450 11223"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor Email Address' : 'Email Address'}
            </label>
            <input
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              placeholder={isPurchaseOrder ? 'e.g. sales@horizonmaterials.com' : 'e.g. accounts@nexusinfo.com'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {isPurchaseOrder ? 'Vendor Dispatch / Registered Address' : 'Billing Address'}
            </label>
            <input
              type="text"
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              placeholder={isPurchaseOrder ? 'e.g. Plot 42, Peenya Industrial Area 3rd Phase' : 'e.g. Tower B, 4th Floor, Electronic City Phase 1'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              City &amp; State
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={client.city}
                onChange={(e) => setClient({ ...client, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={client.state}
                onChange={(e) => setClient({ ...client, state: e.target.value })}
                placeholder="Karnataka"
                className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ship-To / Delivery Destination for Purchase Orders */}
      {isPurchaseOrder && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <IconTruck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Delivery Destination (Ship To / Deliver To)
              </h2>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              Our Receiving Facility / Site
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Deliver / Ship Materials To (Company Receiving Address) *
            </label>
            <textarea
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter exact delivery warehouse, factory or office address..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Vendor will be instructed to deliver all goods and materials to this address accompanied by Delivery Challan.
            </p>
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            {isPurchaseOrder
              ? 'Purchased Materials, Spare Parts & Supplies (Ordered from Vendor)'
              : docType === 'receipt'
                ? 'Receipt Payment Breakdown'
                : 'Goods & Services (Line Items)'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {items.length} {items.length === 1 ? 'item' : 'items'} listed
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const computed = computedItems[index];
            return (
              <div
                key={item.id}
                className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        {isPurchaseOrder ? 'Select Catalog Item / Raw Material' : 'Select Catalog Service'}
                      </label>
                      <select
                        value={item.serviceId}
                        onChange={(e) => handleServiceSelect(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                      >
                        <option value="custom">-- Custom Material / Spare Part --</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (₹{s.rate})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-6">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-500">
                          {isPurchaseOrder ? 'Item / Material Description & Specs *' : 'Description / Particulars *'}
                        </label>
                        <span className={`text-[10px] font-mono ${(item.description || '').length >= 30 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                          {(item.description || '').length}/30
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={30}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value.slice(0, 30))}
                        placeholder={isPurchaseOrder ? 'Material / Part Name (max 30)' : 'Description (max 30 chars)'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        HSN / SAC
                      </label>
                      <input
                        type="text"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                        placeholder="8471"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer mt-5"
                    title="Remove item"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-12 gap-3 pt-2 border-t border-slate-200/60">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      placeholder={isPurchaseOrder ? 'Pcs / Box / Sets / Kg' : 'Item / Hr / Card'}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isPurchaseOrder ? 'Purchase Unit Price (₹) *' : 'Rate (₹) *'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      GST %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={item.gstRate !== undefined && item.gstRate !== null ? item.gstRate : 18}
                        onChange={(e) => handleItemChange(index, 'gstRate', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="18"
                        className="w-full pl-2 pr-6 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Taxable: <strong className="text-slate-800">{formatCurrency(computed.taxableAmount)}</strong></span>
                    {taxType === 'intra' ? (
                      <span>Tax (CGST + SGST): <strong className="text-slate-800">{formatCurrency(computed.cgstAmount + computed.sgstAmount)}</strong></span>
                    ) : (
                      <span>Tax (IGST {item.gstRate}%): <strong className="text-slate-800">{formatCurrency(computed.igstAmount)}</strong></span>
                    )}
                  </div>
                  <div>
                    Row Total: <span className="font-bold text-blue-700">{formatCurrency(computed.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl text-blue-600 hover:text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer bg-blue-50/30 hover:bg-blue-50/70"
        >
          <IconPlus className="w-4 h-4" />
          <span>{isPurchaseOrder ? 'Add Another Purchased Material / Item' : 'Add Another Line Item'}</span>
        </button>
      </div>

      {/* Calculations & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            {isPurchaseOrder ? 'Vendor Delivery Terms & Purchase Instructions' : 'Document Notes & Payment Reminders'}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isPurchaseOrder ? 'Add delivery instructions, inspection criteria or vendor terms...' : 'Add payment reminders, PO references or delivery notes...'}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              {isPurchaseOrder ? 'Standard Procurement & Delivery Terms' : 'Standard Terms (From Settings)'}
            </span>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              {isPurchaseOrder ? (
                <>
                  <li className="truncate">Materials must conform strictly to agreed specifications.</li>
                  <li className="truncate">Delivery Challan and Tax Invoice must cite this PO number.</li>
                  <li className="truncate">Defective lots subject to rejection and return at vendor cost.</li>
                </>
              ) : (
                (settings.termsAndConditions || []).slice(0, 3).map((t, idx) => (
                  <li key={idx} className="truncate">{t}</li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-blue-200 card-shadow space-y-3">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b border-blue-100 pb-2">
            {isPurchaseOrder ? 'Procurement & Input Tax Breakdown' : 'Tax & Total Summary Breakdown'}
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Taxable Procurement Value):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            {taxType === 'intra' ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Input Central GST (CGST):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(cgstTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Input State GST (SGST):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(sgstTotal)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>Input Integrated GST (IGST):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(igstTotal)}</span>
              </div>
            )}

            {roundOff !== 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Round Off:</span>
                <span>{roundOff > 0 ? `+${roundOff}` : roundOff}</span>
              </div>
            )}

            <div className="pt-2 border-t border-blue-200 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-blue-950">
                {isPurchaseOrder ? 'Total Order Value (PO Total):' : 'Grand Total:'}
              </span>
              <span className="text-xl font-black text-blue-700">{formatCurrency(roundedGrandTotal)}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-100 mt-2">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block mb-0.5">
              Amount In Words (Indian Numbering)
            </span>
            <p className="text-xs font-semibold text-slate-800 italic leading-snug">
              {words}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-xs transition cursor-pointer"
        >
          Save {currentMeta.badge}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
        >
          <IconPrint className="w-4 h-4" />
          <span>Save &amp; Print {currentMeta.badge}</span>
        </button>
      </div>

    </div>
  );
}
