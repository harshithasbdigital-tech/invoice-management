import {
  INITIAL_COMPANY,
  INITIAL_BANK,
  INITIAL_INVOICE_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_USERS,
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_QUOTATIONS
} from '../constants/initialData';

const STORAGE_KEYS = {
  COMPANY: 'invoicify_company_v1',
  BANK: 'invoicify_bank_v1',
  SETTINGS: 'invoicify_settings_v1',
  SERVICES: 'invoicify_services_v1',
  USERS: 'invoicify_users_v1',
  INVOICES: 'invoicify_invoices_v1',
  CURRENT_USER: 'invoicify_current_user_v1',
  QR_IMAGE: 'invoicify_qr_image_v1',
  CLIENTS: 'invoicify_clients_v1',
  PAYMENTS: 'invoicify_payments_v1',
  AUDIT_LOGS: 'invoicify_audit_logs_v1',
  QUOTATIONS: 'invoicify_quotations_v1'
};

export const storage = {
  getCompany: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.name && parsed.name.includes("Apex")) {
          parsed.name = "SB";
          parsed.logoUrl = "/logo.png";
          localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(parsed));
        } else if (!parsed.logoUrl) {
          parsed.logoUrl = "/logo.png";
          localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(parsed));
        }
        if (!parsed.gstin || parsed.gstin === "29ABCDE1234F1Z5") {
          parsed.gstin = "29ABMCS2397E1ZU";
          parsed.pan = "ABMCS2397E";
          localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  },
  setCompany: (data) => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(data));
  },

  getBank: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANK);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.accountHolder && parsed.accountHolder.includes("Apex")) {
          parsed.accountHolder = "SB";
          if (parsed.upiId && parsed.upiId.includes("apex")) {
            parsed.upiId = "sb@okhdfcbank";
          }
          localStorage.setItem(STORAGE_KEYS.BANK, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_BANK;
    } catch {
      return INITIAL_BANK;
    }
  },
  setBank: (data) => {
    localStorage.setItem(STORAGE_KEYS.BANK, JSON.stringify(data));
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        let modified = false;
        if (parsed.prefix && parsed.prefix.includes("APX")) {
          parsed.prefix = "SB-INV-";
          modified = true;
        }
        if (Array.isArray(parsed.termsAndConditions)) {
          parsed.termsAndConditions = parsed.termsAndConditions.map((t) => {
            if (t.includes("Apex")) {
              modified = true;
              return t.replace(/Apex Solutions|Apex/g, "SB");
            }
            return t;
          });
        }
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_INVOICE_SETTINGS;
    } catch {
      return INITIAL_INVOICE_SETTINGS;
    }
  },
  setSettings: (data) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  },

  getServices: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  },
  setServices: (data) => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data));
  },

  getUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      let list = data ? JSON.parse(data) : INITIAL_USERS;
      let modified = false;
      list = list.map((u) => {
        if (u.email && u.email.includes("apexsolutions.in")) {
          modified = true;
          return { ...u, email: u.email.replace("apexsolutions.in", "sb.in") };
        }
        return u;
      });
      if (!list.some((u) => u.role === 'Accountant')) {
        const defaultAcct = INITIAL_USERS.find((u) => u.role === 'Accountant');
        if (defaultAcct) {
          list = [list[0], defaultAcct, ...list.slice(1)];
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
      }
      return list;
    } catch {
      return INITIAL_USERS;
    }
  },
  setUsers: (data) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
  },

  getInvoices: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (data) {
        let parsed = JSON.parse(data);
        let modified = false;
        parsed.forEach((inv) => {
          if (inv.invoiceNumber && inv.invoiceNumber.startsWith("APX-")) {
            inv.invoiceNumber = inv.invoiceNumber.replace("APX-", "SB-");
            modified = true;
          }
          if (inv.notes && inv.notes.includes("Apex")) {
            inv.notes = inv.notes.replace(/Apex Solutions|Apex/g, "SB");
            modified = true;
          }
        });

        // Ensure default Bill, Receipt, and PO exist in the list
        INITIAL_INVOICES.forEach((initInv) => {
          if (initInv.docType && !parsed.some((p) => p.id === initInv.id || (p.docType === initInv.docType && p.invoiceNumber === initInv.invoiceNumber))) {
            parsed.push(initInv);
            modified = true;
          }
        });

        if (modified) {
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(parsed));
        }
        return parsed;
      }
      return INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  },
  setInvoices: (data) => {
    try {
      const seen = new WeakSet();
      const safeJson = JSON.stringify(data, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (value instanceof Event || value?.constructor?.name === 'Window' || value?.constructor?.name === 'SyntheticBaseEvent') {
            return typeof value?.type === 'string' ? value.type : undefined;
          }
          if (seen.has(value)) {
            return undefined;
          }
          seen.add(value);
        }
        return value;
      });
      localStorage.setItem(STORAGE_KEYS.INVOICES, safeJson);
    } catch (err) {
      console.error('Storage setInvoices serialization error:', err);
    }
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setCurrentUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getQrImage: () => {
    return localStorage.getItem(STORAGE_KEYS.QR_IMAGE) || '';
  },
  setQrImage: (base64) => {
    if (base64) {
      localStorage.setItem(STORAGE_KEYS.QR_IMAGE, base64);
    } else {
      localStorage.removeItem(STORAGE_KEYS.QR_IMAGE);
    }
  },

  getClients: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  },
  setClients: (data) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data));
  },

  getPayments: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  },
  setPayments: (data) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data));
  },
  addPayment: (payment) => {
    const list = storage.getPayments();
    const updated = [payment, ...list];
    storage.setPayments(updated);
    return updated;
  },

  getQuotations: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return data ? JSON.parse(data) : INITIAL_QUOTATIONS;
    } catch {
      return INITIAL_QUOTATIONS;
    }
  },
  setQuotations: (data) => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
  },
  addQuotation: (quotation) => {
    const list = storage.getQuotations();
    const updated = [quotation, ...list];
    storage.setQuotations(updated);
    return updated;
  },
  updateQuotation: (updatedQuotation) => {
    const list = storage.getQuotations();
    const updated = list.map(q => q.id === updatedQuotation.id ? updatedQuotation : q);
    storage.setQuotations(updated);
    return updated;
  },
  deleteQuotation: (id) => {
    const list = storage.getQuotations();
    const updated = list.filter(q => q.id !== id);
    storage.setQuotations(updated);
    return updated;
  },

  getAuditLogs: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },
  setAuditLogs: (data) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data));
  },
  addAuditLog: ({ action, entityType, entityId, performedBy, role, description }) => {
    const logs = storage.getAuditLogs();
    const newEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action: action || 'ACTION',
      entityType: entityType || 'System',
      entityId: entityId || '-',
      performedBy: performedBy || 'User',
      role: role || 'Staff',
      description: description || ''
    };
    const updated = [newEntry, ...logs];
    storage.setAuditLogs(updated);
    return updated;
  },

  exportBackup: () => {
    const backup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      company: storage.getCompany(),
      bank: storage.getBank(),
      settings: storage.getSettings(),
      services: storage.getServices(),
      users: storage.getUsers(),
      invoices: storage.getInvoices(),
      clients: storage.getClients(),
      payments: storage.getPayments(),
      auditLogs: storage.getAuditLogs(),
      qrImage: storage.getQrImage()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.company) storage.setCompany(data.company);
      if (data.bank) storage.setBank(data.bank);
      if (data.settings) storage.setSettings(data.settings);
      if (data.services && Array.isArray(data.services)) storage.setServices(data.services);
      if (data.users && Array.isArray(data.users)) storage.setUsers(data.users);
      if (data.invoices && Array.isArray(data.invoices)) storage.setInvoices(data.invoices);
      if (data.clients && Array.isArray(data.clients)) storage.setClients(data.clients);
      if (data.payments && Array.isArray(data.payments)) storage.setPayments(data.payments);
      if (data.auditLogs && Array.isArray(data.auditLogs)) storage.setAuditLogs(data.auditLogs);
      if (data.qrImage) storage.setQrImage(data.qrImage);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetToDemo: () => {
    localStorage.removeItem(STORAGE_KEYS.COMPANY);
    localStorage.removeItem(STORAGE_KEYS.BANK);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.QR_IMAGE);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  }
};
