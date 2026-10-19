import React, { useState } from 'react';
import { storage } from './utils/storage';
import { getInvoicePaymentStatus, formatCurrency } from './utils/numberToWords';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { DashboardPage } from './pages/DashboardPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { NewInvoicePage } from './pages/NewInvoicePage';
import { InvoiceViewPage } from './pages/InvoiceViewPage';
import { QuotationViewPage } from './pages/QuotationViewPage';
import { ClientsPage } from './pages/ClientsPage';
import { ServicesPage } from './pages/ServicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { LoginPage } from './pages/LoginPage';
import { DocumentListPage } from './pages/DocumentListPage';

export default function App() {
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('invoicify_auth_v1');
    return auth !== null ? auth === 'true' : true;
  });

  // Application State backed by localStorage
  const [company, setCompany] = useState(storage.getCompany());
  const [bank, setBank] = useState(storage.getBank());
  const [settings, setSettings] = useState(storage.getSettings());
  const [services, setServices] = useState(storage.getServices());
  const [users, setUsers] = useState(storage.getUsers());
  const [invoices, setInvoices] = useState(storage.getInvoices());
  const [clients, setClients] = useState(storage.getClients());
  const [payments, setPayments] = useState(storage.getPayments());
  const [quotations, setQuotations] = useState(storage.getQuotations());
  const [auditLogs, setAuditLogs] = useState(storage.getAuditLogs());
  const [currentUser, setCurrentUser] = useState(storage.getCurrentUser());
  const [qrImage, setQrImage] = useState(storage.getQrImage());

  // UI Navigation state
  const [activeTab, setActiveTab] = useState(() => {
    const u = storage.getCurrentUser();
    return u?.role === 'Accountant' ? 'invoices' : 'dashboard';
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [preselectedClient, setPreselectedClient] = useState(null);
  const [currentDocType, setCurrentDocType] = useState('tax_invoice');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If Accountant is on dashboard or reports, default to invoices
  React.useEffect(() => {
    if (currentUser?.role === 'Accountant' && (activeTab === 'dashboard' || activeTab === 'reports')) {
      setActiveTab('invoices');
    }
  }, [currentUser, activeTab]);

  const handleViewQuotation = (quote) => {
    setSelectedQuotation(quote);
    setActiveTab('view-quotation');
  };

  // Authentication Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('invoicify_auth_v1', 'true');
    setActiveTab(user.role === 'Accountant' ? 'invoices' : 'dashboard');

    storage.addAuditLog({
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.email,
      performedBy: user.name,
      role: user.role,
      description: `${user.name} logged in with role ${user.role}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleLogout = () => {
    storage.addAuditLog({
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: currentUser.email,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `${currentUser.name} signed out of session.`
    });
    setAuditLogs(storage.getAuditLogs());

    setIsAuthenticated(false);
    localStorage.setItem('invoicify_auth_v1', 'false');
  };

  // Sync state changes to storage
  const handleUpdateCompany = (newCompany) => {
    setCompany(newCompany);
    storage.setCompany(newCompany);
    storage.addAuditLog({
      action: 'COMPANY_UPDATED',
      entityType: 'Company',
      entityId: newCompany.name,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Updated company details and tax registration.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateBank = (newBank) => {
    setBank(newBank);
    storage.setBank(newBank);
    storage.addAuditLog({
      action: 'BANK_UPDATED',
      entityType: 'Bank',
      entityId: newBank.bankName,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Updated banking remittance details & UPI ID ${newBank.upiId}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    storage.setSettings(newSettings);
    storage.addAuditLog({
      action: 'SETTINGS_UPDATED',
      entityType: 'Settings',
      entityId: newSettings.prefix,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Updated invoice series prefix and tax rules.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateServices = (newServices) => {
    setServices(newServices);
    storage.setServices(newServices);
    storage.addAuditLog({
      action: 'SERVICES_UPDATED',
      entityType: 'Catalog',
      entityId: `${newServices.length} Services`,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Updated services catalog and pricing definitions.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateUsers = (newUsers) => {
    setUsers(newUsers);
    storage.setUsers(newUsers);
    storage.addAuditLog({
      action: 'USERS_UPDATED',
      entityType: 'Users',
      entityId: `${newUsers.length} Users`,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Admin updated staff roster and access credentials.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateInvoices = (newInvoices) => {
    setInvoices(newInvoices);
    storage.setInvoices(newInvoices);
    if (selectedInvoice) {
      const refreshed = newInvoices.find((i) => i.id === selectedInvoice.id);
      if (refreshed) setSelectedInvoice(refreshed);
    }
  };

  const handleUpdateQrImage = (newQr) => {
    setQrImage(newQr);
    storage.setQrImage(newQr);
  };

  // Client Management Handlers
  const handleSaveClient = (clientData) => {
    const exists = clients.some((c) => c.id === clientData.id);
    let updated;
    if (exists) {
      updated = clients.map((c) => (c.id === clientData.id ? clientData : c));
    } else {
      updated = [clientData, ...clients];
    }
    setClients(updated);
    storage.setClients(updated);

    storage.addAuditLog({
      action: exists ? 'CLIENT_UPDATED' : 'CLIENT_CREATED',
      entityType: 'Client',
      entityId: clientData.name,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `${exists ? 'Updated' : 'Registered new'} client: ${clientData.name} (GSTIN: ${clientData.gstin || 'Unregistered'}).`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleCreateInvoiceForClient = (cli) => {
    setPreselectedClient(cli);
    setSelectedInvoice(null);
    setActiveTab('new-invoice');
  };

  // Payment Reconciliation Handlers
  const handleRecordPayment = (paymentPayload, targetInvoice) => {
    // 1. Append payment
    const updatedPayments = storage.addPayment(paymentPayload);
    setPayments(updatedPayments);

    // 2. Compute accurate payment status and cumulative paid amount for target invoice
    const { totalPaid, status: newStatus, percentage, remaining } = getInvoicePaymentStatus(
      targetInvoice,
      updatedPayments
    );

    // 3. Update invoice in storage and state
    const updatedInvoices = invoices.map((inv) =>
      inv.id === targetInvoice.id
        ? {
          ...inv,
          status: newStatus,
          paidAmount: totalPaid,
          paidDate: paymentPayload.date,
          paymentMode: paymentPayload.paymentMode
        }
        : inv
    );
    handleUpdateInvoices(updatedInvoices);

    // 4. Add audit log
    storage.addAuditLog({
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: paymentPayload.receiptNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Reconciled payment of ${formatCurrency(paymentPayload.amount)} for ${targetInvoice.invoiceNumber}. Invoice status is now ${newStatus} (${percentage}% paid: ${formatCurrency(totalPaid)} of ${formatCurrency(targetInvoice.grandTotal)}).`
    });
    setAuditLogs(storage.getAuditLogs());

    alert(`Payment recorded! Invoice ${targetInvoice.invoiceNumber} is now ${newStatus.toUpperCase()} (${formatCurrency(totalPaid)} / ${formatCurrency(targetInvoice.grandTotal)}). Receipt # ${paymentPayload.receiptNumber}`);
  };

  // Controlled Invoice Cancellation (Anti-Tamper Rule)
  const handleCancelInvoice = (invoiceId, reason) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId
        ? { ...inv, status: 'Cancelled', cancellationReason: reason }
        : inv
    );
    handleUpdateInvoices(updatedInvoices);

    storage.addAuditLog({
      action: 'INVOICE_CANCELLED',
      entityType: 'Invoice',
      entityId: target.invoiceNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Cancelled Invoice ${target.invoiceNumber} (${target.client?.name}). Reason: ${reason}`
    });
    setAuditLogs(storage.getAuditLogs());

    alert(`Invoice ${target.invoiceNumber} has been marked as Cancelled. Audit log entry recorded.`);
  };

  // Role Switcher
  const handleSwitchUserRole = (targetRole) => {
    const found = users.find((u) => u.role === targetRole) || {
      id: `usr-${targetRole.toLowerCase()}`,
      name:
        targetRole === 'Admin'
          ? 'Admin Manager'
          : targetRole === 'Accountant'
            ? 'Ananya Deshmukh (Accountant)'
            : 'Staff User',
      email: `${targetRole.toLowerCase()}@sb.in`,
      role: targetRole,
      avatar: targetRole === 'Admin' ? 'AM' : targetRole === 'Accountant' ? 'AD' : 'SU'
    };
    setCurrentUser(found);
    storage.setCurrentUser(found);
  };

  // Reload all data (e.g. after JSON backup restore or demo reset)
  const handleReloadAll = () => {
    setCompany(storage.getCompany());
    setBank(storage.getBank());
    setSettings(storage.getSettings());
    setServices(storage.getServices());
    setUsers(storage.getUsers());
    setInvoices(storage.getInvoices());
    setClients(storage.getClients());
    setPayments(storage.getPayments());
    setAuditLogs(storage.getAuditLogs());
    setCurrentUser(storage.getCurrentUser());
    setQrImage(storage.getQrImage());
    setActiveTab('dashboard');
  };

  // Invoice & Document Actions
  const handleCreateDocument = (type = 'tax_invoice', client = null) => {
    const safeType = typeof type === 'string' ? type : 'tax_invoice';
    const safeClient = client && typeof client === 'object' && !client.nativeEvent ? client : null;
    setCurrentDocType(safeType);
    setSelectedInvoice(null);
    setPreselectedClient(safeClient);
    setActiveTab('new-invoice');
  };

  const handleStartNewInvoice = (docType = 'tax_invoice') => {
    const safeType = typeof docType === 'string' ? docType : 'tax_invoice';
    handleCreateDocument(safeType, null);
  };

  const handleEditInvoice = (inv) => {
    setSelectedInvoice(inv);
    setActiveTab('edit-invoice');
  };

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv);
    setActiveTab('view-invoice');
  };

  const handleToggleStatus = (id) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return;
    const newStatus = target.status === 'Paid' ? 'Unpaid' : 'Paid';

    const updated = invoices.map((inv) =>
      inv.id === id ? { ...inv, status: newStatus } : inv
    );
    handleUpdateInvoices(updated);

    storage.addAuditLog({
      action: 'INVOICE_STATUS_CHANGED',
      entityType: 'Invoice',
      entityId: target.invoiceNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Toggled payment status of ${target.invoiceNumber} to ${newStatus}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleDeleteInvoice = (id) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return;

    if (confirm(`Are you sure you want to delete invoice ${target.invoiceNumber}? Note: For official tax audits, cancelling with a credit note is recommended.`)) {
      const updated = invoices.filter((inv) => inv.id !== id);
      handleUpdateInvoices(updated);

      storage.addAuditLog({
        action: 'INVOICE_DELETED',
        entityType: 'Invoice',
        entityId: target.invoiceNumber,
        performedBy: currentUser.name,
        role: currentUser.role,
        description: `Admin deleted invoice record ${target.invoiceNumber} (${target.client?.name}).`
      });
      setAuditLogs(storage.getAuditLogs());
    }
  };

  const handleSaveInvoice = (invoiceData, andPrint = false) => {
    if (!invoiceData || typeof invoiceData !== 'object') return;
    const cleanDocType = typeof invoiceData.docType === 'string' ? invoiceData.docType : 'tax_invoice';
    const cleanInvoiceData = {
      ...invoiceData,
      docType: cleanDocType
    };
    const exists = invoices.some((i) => i.id === cleanInvoiceData.id);
    let updated;
    if (exists) {
      updated = invoices.map((i) => (i.id === cleanInvoiceData.id ? cleanInvoiceData : i));
    } else {
      updated = [cleanInvoiceData, ...invoices];
      // Increment invoice counter in settings
      const newCounter = (settings.currentNumber || 1004) + 1;
      handleUpdateSettings({ ...settings, currentNumber: newCounter });
    }
    handleUpdateInvoices(updated);

    // Auto-save client to directory and record document type
    if (cleanInvoiceData.client && cleanInvoiceData.client.name) {
      const clientNameNorm = cleanInvoiceData.client.name.toLowerCase().trim();
      const existingClientIndex = clients.findIndex(
        (c) => (c.name || '').toLowerCase().trim() === clientNameNorm
      );
      const docTypeLabel =
        invoiceData.docType === 'quotation' ? 'Quotation' :
        invoiceData.docType === 'pre_invoice' ? 'Pre-Invoice' :
        invoiceData.docType === 'bill' ? 'Bill' :
        invoiceData.docType === 'receipt' ? 'Receipt' :
        invoiceData.docType === 'purchase_order' ? 'PO' : 'Tax Invoice';

      if (existingClientIndex === -1) {
        const newCli = {
          id: `cli-${Date.now()}`,
          ...invoiceData.client,
          creditDays: 15,
          createdWithDocType: docTypeLabel,
          docTypes: [docTypeLabel],
          notes: `Auto-saved upon creating ${docTypeLabel} (${invoiceData.invoiceNumber || ''}).`
        };
        const updatedClients = [newCli, ...clients];
        setClients(updatedClients);
        storage.setClients(updatedClients);
      } else {
        const currentCli = clients[existingClientIndex];
        const existingDocTypes = Array.isArray(currentCli.docTypes) ? currentCli.docTypes : [];
        const updatedDocTypes = existingDocTypes.includes(docTypeLabel)
          ? existingDocTypes
          : [...existingDocTypes, docTypeLabel];
        const updatedCli = {
          ...currentCli,
          phone: invoiceData.client.phone || currentCli.phone,
          email: invoiceData.client.email || currentCli.email,
          gstin: invoiceData.client.gstin || currentCli.gstin,
          address: invoiceData.client.address || currentCli.address,
          docTypes: updatedDocTypes
        };
        const updatedClients = [...clients];
        updatedClients[existingClientIndex] = updatedCli;
        setClients(updatedClients);
        storage.setClients(updatedClients);
      }
    }

    storage.addAuditLog({
      action: exists ? 'INVOICE_UPDATED' : 'INVOICE_CREATED',
      entityType: 'Invoice',
      entityId: invoiceData.invoiceNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `${exists ? 'Updated' : 'Generated'} ${invoiceData.docType || 'Tax Invoice'} ${invoiceData.invoiceNumber} for ${invoiceData.client?.name} (Grand Total: ₹${invoiceData.grandTotal?.toLocaleString('en-IN')}).`
    });
    setAuditLogs(storage.getAuditLogs());

    if (andPrint) {
      setSelectedInvoice(invoiceData);
      setActiveTab('view-invoice');
    } else if (invoiceData.docType === 'bill') {
      setActiveTab('billing');
    } else if (invoiceData.docType === 'receipt') {
      setActiveTab('receipts');
    } else if (invoiceData.docType === 'purchase_order') {
      setActiveTab('purchase-orders');
    } else {
      setActiveTab('invoices');
    }
  };

  // Quotation Management Handlers
  const handleSaveQuotation = (newQuotation) => {
    const updated = storage.addQuotation(newQuotation);
    setQuotations(updated);

    // Auto-save client to directory and record Quotation document type
    if (newQuotation.client && newQuotation.client.name) {
      const clientNameNorm = newQuotation.client.name.toLowerCase().trim();
      const existingClientIndex = clients.findIndex(
        (c) => (c.name || '').toLowerCase().trim() === clientNameNorm
      );
      if (existingClientIndex === -1) {
        const newCli = {
          id: `cli-${Date.now()}`,
          ...newQuotation.client,
          creditDays: 15,
          createdWithDocType: 'Quotation',
          docTypes: ['Quotation'],
          notes: `Auto-saved upon creating Quotation (${newQuotation.quotationNumber || ''}).`
        };
        const updatedClients = [newCli, ...clients];
        setClients(updatedClients);
        storage.setClients(updatedClients);
      } else {
        const currentCli = clients[existingClientIndex];
        const existingDocTypes = Array.isArray(currentCli.docTypes) ? currentCli.docTypes : [];
        const updatedDocTypes = existingDocTypes.includes('Quotation')
          ? existingDocTypes
          : [...existingDocTypes, 'Quotation'];
        const updatedCli = {
          ...currentCli,
          phone: newQuotation.client.phone || currentCli.phone,
          email: newQuotation.client.email || currentCli.email,
          gstin: newQuotation.client.gstin || currentCli.gstin,
          address: newQuotation.client.address || currentCli.address,
          docTypes: updatedDocTypes
        };
        const updatedClients = [...clients];
        updatedClients[existingClientIndex] = updatedCli;
        setClients(updatedClients);
        storage.setClients(updatedClients);
      }
    }

    storage.addAuditLog({
      action: 'QUOTATION_CREATED',
      entityType: 'Quotation',
      entityId: newQuotation.quotationNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Generated Quotation ${newQuotation.quotationNumber} for ${newQuotation.client?.name} for ₹${newQuotation.grandTotal?.toLocaleString('en-IN')}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleUpdateQuotationStatus = (id, newStatus) => {
    const target = quotations.find(q => q.id === id);
    if (!target) return;
    const updatedQuote = { ...target, status: newStatus };
    const updatedList = storage.updateQuotation(updatedQuote);
    setQuotations(updatedList);
    storage.addAuditLog({
      action: 'QUOTATION_UPDATED',
      entityType: 'Quotation',
      entityId: target.quotationNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Updated status of Quotation ${target.quotationNumber} to ${newStatus}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleDeleteQuotation = (id) => {
    const updated = storage.deleteQuotation(id);
    setQuotations(updated);
  };

  // Convert Quotation into Tax Invoice
  const handleConvertQuotationToTaxInvoice = (quote) => {
    const nextNum = (settings.startingNumber || 1001) + invoices.filter(i => !i.docType || i.docType === 'tax_invoice').length;
    const generatedInvNumber = `${settings.prefix || 'SB-INV-'}${nextNum}`;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      docType: 'tax_invoice',
      invoiceNumber: generatedInvNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: quote.client,
      items: quote.items || [],
      subtotal: quote.subtotal || quote.amount || 0,
      taxType: settings.defaultTaxType || 'intra',
      cgst: (quote.taxAmount || 0) / 2,
      sgst: (quote.taxAmount || 0) / 2,
      igst: 0,
      grandTotal: quote.grandTotal || quote.amount || 0,
      roundOff: 0,
      status: 'Unpaid',
      notes: quote.notes || `Generated from Approved Quotation ${quote.quotationNumber}.`,
      terms: settings.termsAndConditions || [],
      createdBy: currentUser.name,
      convertedFromQuotationId: quote.id,
      quotationNumber: quote.quotationNumber
    };

    // Mark quotation as Converted
    const updatedList = storage.updateQuotation({
      ...quote,
      status: 'Converted',
      convertedInvoiceId: newInvoice.id,
      convertedToInvoiceNumber: generatedInvNumber
    });
    setQuotations(updatedList);

    // Save newly created invoice
    handleSaveInvoice(newInvoice, false);
    setSelectedInvoice(newInvoice);
    setActiveTab('view-invoice');

    storage.addAuditLog({
      action: 'QUOTATION_CONVERTED_TAX_INVOICE',
      entityType: 'Invoice',
      entityId: generatedInvNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Converted Quotation ${quote.quotationNumber} into Tax Invoice ${generatedInvNumber} for ${quote.client?.name}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  // Convert Quotation into Pre-Invoice (Proforma)
  const handleConvertQuotationToPreInvoice = (quote) => {
    const nextNum = (settings.startingNumber || 1001) + invoices.filter(i => i.docType === 'pre_invoice').length;
    const generatedInvNumber = `SB-PI-${nextNum}`;

    const newInvoice = {
      id: `preinv-${Date.now()}`,
      docType: 'pre_invoice',
      invoiceNumber: generatedInvNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: quote.client,
      items: quote.items || [],
      subtotal: quote.subtotal || quote.amount || 0,
      taxType: settings.defaultTaxType || 'intra',
      cgst: (quote.taxAmount || 0) / 2,
      sgst: (quote.taxAmount || 0) / 2,
      igst: 0,
      grandTotal: quote.grandTotal || quote.amount || 0,
      roundOff: 0,
      status: 'Unpaid',
      notes: quote.notes || `Generated from Quotation ${quote.quotationNumber}.`,
      terms: settings.termsAndConditions || [],
      createdBy: currentUser.name,
      convertedFromQuotationId: quote.id,
      quotationNumber: quote.quotationNumber
    };

    // Mark quotation as Converted
    const updatedList = storage.updateQuotation({
      ...quote,
      status: 'Converted',
      convertedInvoiceId: newInvoice.id,
      convertedToPreInvoiceNumber: generatedInvNumber
    });
    setQuotations(updatedList);

    // Save newly created pre-invoice
    handleSaveInvoice(newInvoice, false);
    setSelectedInvoice(newInvoice);
    setActiveTab('view-invoice');

    storage.addAuditLog({
      action: 'QUOTATION_CONVERTED_PRE_INVOICE',
      entityType: 'Invoice',
      entityId: generatedInvNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Converted Quotation ${quote.quotationNumber} into Pre-Invoice ${generatedInvNumber} for ${quote.client?.name}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const handleConvertToInvoice = handleConvertQuotationToTaxInvoice;

  // Convert Pre-Invoice (Proforma) into Tax Invoice
  const handleConvertPreInvoiceToTaxInvoice = (preInv) => {
    const currentInvoices = storage.getInvoices();
    const nextNum = (settings.startingNumber || 1001) + currentInvoices.filter(i => !i.docType || i.docType === 'tax_invoice').length;
    const generatedInvNumber = `${settings.prefix || 'SB-INV-'}${nextNum}`;

    const newInvoice = {
      ...preInv,
      id: `inv-${Date.now()}`,
      invoiceNumber: generatedInvNumber,
      docType: 'tax_invoice',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: preInv.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Unpaid',
      notes: preInv.notes
        ? `${preInv.notes} (Converted from Pre-Invoice ${preInv.invoiceNumber})`
        : `Converted from Pre-Invoice ${preInv.invoiceNumber}.`,
      convertedFromPreInvoiceId: preInv.id,
      convertedFromPreInvoiceNumber: preInv.invoiceNumber,
      createdBy: currentUser.name
    };

    // Mark original pre-invoice as Converted
    const updatedPreInv = {
      ...preInv,
      status: 'Converted',
      convertedToInvoiceNumber: generatedInvNumber,
      convertedInvoiceId: newInvoice.id
    };

    // Atomically persist both new invoice and updated pre-invoice
    const updatedList = [
      newInvoice,
      ...currentInvoices.map((i) => (i.id === preInv.id ? updatedPreInv : i))
    ];
    handleUpdateInvoices(updatedList);

    // Increment invoice counter in settings
    const newCounter = (settings.currentNumber || 1004) + 1;
    handleUpdateSettings({ ...settings, currentNumber: newCounter });

    // Auto-save client to directory and record document type
    if (newInvoice.client && newInvoice.client.name) {
      const clientNameNorm = newInvoice.client.name.toLowerCase().trim();
      const existingClientIndex = clients.findIndex(
        (c) => (c.name || '').toLowerCase().trim() === clientNameNorm
      );
      const docTypeLabel = 'Tax Invoice';

      if (existingClientIndex === -1) {
        const newCli = {
          id: `cli-${Date.now()}`,
          ...newInvoice.client,
          creditDays: 15,
          createdWithDocType: docTypeLabel,
          docTypes: [docTypeLabel],
          notes: `Auto-saved upon converting Pre-Invoice to Tax Invoice (${newInvoice.invoiceNumber}).`
        };
        const updatedClients = [newCli, ...clients];
        setClients(updatedClients);
        storage.setClients(updatedClients);
      } else {
        const currentCli = clients[existingClientIndex];
        const existingDocTypes = Array.isArray(currentCli.docTypes) ? currentCli.docTypes : [];
        const updatedDocTypes = existingDocTypes.includes(docTypeLabel)
          ? existingDocTypes
          : [...existingDocTypes, docTypeLabel];
        const updatedCli = {
          ...currentCli,
          phone: newInvoice.client.phone || currentCli.phone,
          email: newInvoice.client.email || currentCli.email,
          gstin: newInvoice.client.gstin || currentCli.gstin,
          address: newInvoice.client.address || currentCli.address,
          docTypes: updatedDocTypes
        };
        const updatedClients = [...clients];
        updatedClients[existingClientIndex] = updatedCli;
        setClients(updatedClients);
        storage.setClients(updatedClients);
      }
    }

    setSelectedInvoice(newInvoice);
    setActiveTab('view-invoice');

    storage.addAuditLog({
      action: 'PRE_INVOICE_CONVERTED',
      entityType: 'Invoice',
      entityId: generatedInvNumber,
      performedBy: currentUser.name,
      role: currentUser.role,
      description: `Converted Pre-Invoice ${preInv.invoiceNumber} into Tax Invoice ${generatedInvNumber} for ${preInv.client?.name || 'Customer'}.`
    });
    setAuditLogs(storage.getAuditLogs());
  };

  const isAdmin = currentUser.role === 'Admin';
  const isSalesStaff = currentUser.role === 'User' || currentUser.role === 'Staff';

  // Dynamic Header Title & Breadcrumb (Section 3)
  const getHeaderInfo = () => {
    if (activeTab === 'dashboard') {
      return {
        title: isSalesStaff ? 'Sales Dashboard' : 'Dashboard',
        breadcrumb: isSalesStaff ? 'Home / Sales / Dashboard' : 'Home / Dashboard'
      };
    }
    if (activeTab === 'quotations' || activeTab.startsWith('quotations-')) {
      return {
        title: 'Quotations',
        breadcrumb: 'Quotations'
      };
    }
    if (activeTab === 'view-quotation') {
      return {
        title: `Quotation ${selectedQuotation?.quotationNumber || ''}`,
        breadcrumb: 'Home / Quotations / Preview'
      };
    }
    if (activeTab === 'invoices') {
      return {
        title: currentUser?.role === 'Accountant' ? 'Invoices & Reconciliation' : 'Invoices',
        breadcrumb: isSalesStaff ? 'Home / Sales / Invoices' : 'Home / Invoices'
      };
    }
    if (activeTab === 'billing') {
      return {
        title: 'Billing & Cash Slips',
        breadcrumb: isSalesStaff ? 'Home / Sales / Billing' : 'Home / Billing'
      };
    }
    if (activeTab === 'receipts') {
      return {
        title: 'Payment Receipts',
        breadcrumb: isSalesStaff ? 'Home / Sales / Receipts' : 'Home / Receipts'
      };
    }
    if (activeTab === 'purchase-orders') {
      return {
        title: 'Purchase Orders',
        breadcrumb: isSalesStaff ? 'Home / Sales / Purchase Orders' : 'Home / Purchase Orders'
      };
    }
    if (activeTab === 'clients') {
      return {
        title: 'Customers',
        breadcrumb: isSalesStaff ? 'Home / Sales / Customers' : 'Home / Customers'
      };
    }
    if (activeTab === 'services') {
      return {
        title: 'Services & Pricing',
        breadcrumb: 'Home / Services'
      };
    }
    if (activeTab === 'payments') {
      return {
        title: 'Payments Reconciliation',
        breadcrumb: 'Home / Finance / Payments'
      };
    }
    if (activeTab === 'reports') {
      return {
        title: 'Reports & Analytics',
        breadcrumb: 'Home / Finance / Reports'
      };
    }
    if (activeTab === 'users') {
      return {
        title: 'User Management',
        breadcrumb: 'Home / Administration / Users'
      };
    }
    if (activeTab === 'company') {
      return {
        title: 'Settings',
        breadcrumb: 'Home / System / Settings'
      };
    }
    if (activeTab === 'audit-logs') {
      return {
        title: 'Audit Logs',
        breadcrumb: 'Home / Administration / Audit Logs'
      };
    }
    return {
      title: 'SB Invoices',
      breadcrumb: 'Home'
    };
  };

  const headerInfo = getHeaderInfo();

  // If not logged in, show Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        company={company}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-[#F6F8FC] flex font-sans antialiased text-slate-800 overflow-hidden">

      {/* Full-screen SaaS Dashboard Workspace */}
      <div className="w-full h-full bg-[#F6F8FC] flex flex-col lg:flex-row items-stretch overflow-hidden">

        {/* Sticky Sidebar (260px wide) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        {/* Main Canvas & Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

          {/* Section 3: Top Header across main workspace */}
          {activeTab !== 'view-quotation' && activeTab !== 'view-invoice' && (
            <HeaderBar
              title={headerInfo.title}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          )}

          {/* Dynamic Scrollable Page Body */}
          <main className={`flex-1 min-w-0 overflow-y-auto ${(activeTab === 'view-quotation' || activeTab === 'view-invoice') ? 'p-0 bg-white' : 'p-4 sm:p-6 lg:p-8'
            }`}>

            {/* Section 1: Role-Specific Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <DashboardPage
                invoices={invoices}
                quotations={quotations}
                company={company}
                bank={bank}
                services={services}
                users={users}
                clients={clients}
                payments={payments}
                currentUser={currentUser}
                onNewInvoice={handleStartNewInvoice}
                onCreateDocument={handleCreateDocument}
                onViewInvoice={handleViewInvoice}
                onToggleStatus={handleToggleStatus}
                onNavigate={setActiveTab}
                onSaveQuotation={handleSaveQuotation}
                onUpdateQuotationStatus={handleUpdateQuotationStatus}
                onConvertToInvoice={handleConvertToInvoice}
              />
            )}

            {/* Quotations Management Module */}
            {(activeTab === 'quotations' || activeTab.startsWith('quotations-')) && (
              <QuotationsPage
                quotations={quotations}
                company={company}
                bank={bank}
                clients={clients}
                services={services}
                currentUser={currentUser}
                onSaveQuotation={handleSaveQuotation}
                onUpdateQuotationStatus={handleUpdateQuotationStatus}
                onDeleteQuotation={handleDeleteQuotation}
                onConvertToInvoice={handleConvertToInvoice}
                onConvertToTaxInvoice={handleConvertQuotationToTaxInvoice}
                onConvertToPreInvoice={handleConvertQuotationToPreInvoice}
                onViewQuotation={handleViewQuotation}
                onNavigateToCustomers={() => setActiveTab('clients')}
                initialStatusFilter={
                  activeTab === 'quotations-pending' ? 'Pending Approval' :
                    activeTab === 'quotations-approved' ? 'Approved' :
                      activeTab === 'quotations-converted' ? 'Converted' : ''
                }
              />
            )}

            {/* Section 2: Invoices List & Reconciliation */}
            {activeTab === 'invoices' && (
              <InvoicesPage
                invoices={invoices}
                payments={payments}
                currentUser={currentUser}
                onNewInvoice={handleStartNewInvoice}
                onViewInvoice={handleViewInvoice}
                onEditInvoice={handleEditInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onToggleStatus={handleToggleStatus}
                onCancelInvoice={handleCancelInvoice}
                onRecordPayment={handleRecordPayment}
                onViewPaymentLogs={() => setActiveTab('payments')}
                onConvertToTaxInvoice={handleConvertPreInvoiceToTaxInvoice}
              />
            )}

            {/* Dedicated Billing Page */}
            {activeTab === 'billing' && (
              <DocumentListPage
                docType="bill"
                invoices={invoices}
                currentUser={currentUser}
                onNewDocument={(type) => handleCreateDocument(type)}
                onViewDocument={handleViewInvoice}
                onEditDocument={handleEditInvoice}
                onDeleteDocument={handleDeleteInvoice}
              />
            )}

            {/* Dedicated Receipts Page */}
            {activeTab === 'receipts' && (
              <DocumentListPage
                docType="receipt"
                invoices={invoices}
                currentUser={currentUser}
                onNewDocument={(type) => handleCreateDocument(type)}
                onViewDocument={handleViewInvoice}
                onEditDocument={handleEditInvoice}
                onDeleteDocument={handleDeleteInvoice}
              />
            )}

            {/* Dedicated Purchase Orders Page */}
            {activeTab === 'purchase-orders' && (
              <DocumentListPage
                docType="purchase_order"
                invoices={invoices}
                currentUser={currentUser}
                onNewDocument={(type) => handleCreateDocument(type)}
                onViewDocument={handleViewInvoice}
                onEditDocument={handleEditInvoice}
                onDeleteDocument={handleDeleteInvoice}
              />
            )}

            {/* Section 3: Clients Directory */}
            {activeTab === 'clients' && (
              <ClientsPage
                clients={clients}
                invoices={invoices}
                quotations={quotations}
                payments={payments}
                currentUser={currentUser}
                onSaveClient={handleSaveClient}
                onCreateInvoiceForClient={handleCreateInvoiceForClient}
                onCreateDocument={handleCreateDocument}
                onViewInvoice={handleViewInvoice}
                onViewQuotation={handleViewQuotation}
                onEditInvoice={handleEditInvoice}
              />
            )}

            {/* Section 4: Services & Pricing */}
            {activeTab === 'services' && (
              <ServicesPage
                services={services}
                onUpdateServices={handleUpdateServices}
                isAdmin={isAdmin}
              />
            )}

            {/* Section 5: Payments Reconciliation (Dedicated Full Page) */}
            {activeTab === 'payments' && (
              <PaymentsPage
                payments={payments}
                invoices={invoices}
                currentUser={currentUser}
                onRecordPayment={handleRecordPayment}
                onViewInvoice={handleViewInvoice}
                onBack={() => setActiveTab('invoices')}
              />
            )}

            {/* Section 6: Reports & Analytics */}
            {activeTab === 'reports' && (
              <ReportsPage
                invoices={invoices}
                payments={payments}
                users={users}
                currentUser={currentUser}
              />
            )}

            {/* Section 7: User Management */}
            {activeTab === 'users' && (
              <UsersPage
                users={users}
                onUpdateUsers={handleUpdateUsers}
                currentUser={currentUser}
                onSelectUser={(u) => {
                  setCurrentUser(u);
                  storage.setCurrentUser(u);
                  if (u.role === 'Accountant' && activeTab === 'dashboard') {
                    setActiveTab('invoices');
                  }
                }}
                isAdmin={isAdmin}
              />
            )}

            {/* Section 8: Company Settings */}
            {activeTab === 'company' && (
              <CompanySettingsPage
                company={company}
                bank={bank}
                settings={settings}
                qrImage={qrImage}
                onSaveCompany={handleUpdateCompany}
                onSaveBank={handleUpdateBank}
                onSaveSettings={handleUpdateSettings}
                onSaveQrImage={handleUpdateQrImage}
              />
            )}

            {/* Section 9: System Settings (Tax, Prefix, Numbering) */}
            {(activeTab === 'invoice-settings' || activeTab === 'bank-qr') && (
              <CompanySettingsPage
                company={company}
                bank={bank}
                settings={settings}
                qrImage={qrImage}
                onSaveCompany={handleUpdateCompany}
                onSaveBank={handleUpdateBank}
                onSaveSettings={handleUpdateSettings}
                onSaveQrImage={handleUpdateQrImage}
              />
            )}

            {/* Section 10: Audit Logs */}
            {activeTab === 'audit-logs' && (
              <AuditLogsPage
                auditLogs={auditLogs}
                currentUser={currentUser}
              />
            )}

            {/* New / Edit Invoice Form */}
            {(activeTab === 'new-invoice' || activeTab === 'edit-invoice') && (
              <NewInvoicePage
                editingInvoice={activeTab === 'edit-invoice' ? selectedInvoice : null}
                initialDocType={activeTab === 'edit-invoice' ? (selectedInvoice?.docType || 'tax_invoice') : currentDocType}
                services={services}
                settings={settings}
                company={company}
                currentUser={currentUser}
                clients={clients}
                initialClient={preselectedClient}
                onSave={(data) => handleSaveInvoice(data, false)}
                onSaveAndPrint={(data) => handleSaveInvoice(data, true)}
                onCancel={() => {
                  if (currentDocType === 'bill') setActiveTab('billing');
                  else if (currentDocType === 'receipt') setActiveTab('receipts');
                  else if (currentDocType === 'purchase_order') setActiveTab('purchase-orders');
                  else if (currentDocType === 'quotation') setActiveTab('quotations');
                  else setActiveTab('invoices');
                }}
              />
            )}

            {/* Tax Invoice Print View */}
            {activeTab === 'view-invoice' && (
              <InvoiceViewPage
                invoice={selectedInvoice || invoices[0]}
                payments={payments}
                company={company}
                bank={bank}
                settings={settings}
                qrImage={qrImage}
                onBack={() => {
                  if (selectedInvoice?.docType === 'bill') setActiveTab('billing');
                  else if (selectedInvoice?.docType === 'receipt') setActiveTab('receipts');
                  else if (selectedInvoice?.docType === 'purchase_order') setActiveTab('purchase-orders');
                  else setActiveTab('invoices');
                }}
                onEdit={handleEditInvoice}
                onUpdateInvoice={(updatedInv) => {
                  const updated = invoices.map(i => i.id === updatedInv.id ? updatedInv : i);
                  handleUpdateInvoices(updated);
                  setSelectedInvoice(updatedInv);
                }}
                onConvertToTaxInvoice={handleConvertPreInvoiceToTaxInvoice}
              />
            )}

            {/* Quotation Full-Page View */}
            {activeTab === 'view-quotation' && (
              <QuotationViewPage
                quotation={selectedQuotation || quotations[0]}
                company={company}
                bank={bank}
                clients={clients}
                services={services}
                onBack={() => setActiveTab('quotations')}
                onConvertToInvoice={handleConvertToInvoice}
                onConvertToTaxInvoice={handleConvertQuotationToTaxInvoice}
                onConvertToPreInvoice={handleConvertQuotationToPreInvoice}
                onUpdateQuotation={(updatedQuote) => {
                  const updated = storage.updateQuotation(updatedQuote);
                  setQuotations(updated);
                  setSelectedQuotation(updatedQuote);
                }}
              />
            )}

            {/* Data Backup & Recovery */}
            {activeTab === 'backup' && (
              <BackupPage
                invoicesCount={invoices.length}
                servicesCount={services.length}
                onDataRestored={handleReloadAll}
              />
            )}

          </main>

        </div>

      </div>

    </div>
  );
}
