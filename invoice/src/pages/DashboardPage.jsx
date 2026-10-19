import React from 'react';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { AccountantDashboard } from '../components/dashboards/AccountantDashboard';
import { StaffDashboard } from '../components/dashboards/StaffDashboard';

export function DashboardPage({
  invoices,
  quotations = [],
  company,
  bank,
  services,
  users,
  clients = [],
  payments = [],
  currentUser,
  onNewInvoice,
  onCreateDocument,
  onViewInvoice,
  onToggleStatus,
  onNavigate,
  onSaveQuotation,
  onUpdateQuotationStatus,
  onConvertToInvoice
}) {
  const role = currentUser?.role || 'Admin';

  if (role === 'Accountant') {
    return (
      <AccountantDashboard
        invoices={invoices}
        company={company}
        bank={bank}
        onViewInvoice={onViewInvoice}
        onToggleStatus={onToggleStatus}
        onNavigate={onNavigate}
      />
    );
  }

  if (role === 'User' || role === 'Staff' || role === 'Sales') {
    return (
      <StaffDashboard
        invoices={invoices}
        quotations={quotations}
        currentUser={currentUser}
        company={company}
        bank={bank}
        services={services}
        clients={clients}
        payments={payments}
        onNewInvoice={onNewInvoice}
        onCreateDocument={onCreateDocument}
        onViewInvoice={onViewInvoice}
        onNavigate={onNavigate}
        onSaveQuotation={onSaveQuotation}
        onUpdateQuotationStatus={onUpdateQuotationStatus}
        onConvertToInvoice={onConvertToInvoice}
      />
    );
  }

  // Default: Admin Dashboard
  return (
    <AdminDashboard
      invoices={invoices}
      company={company}
      bank={bank}
      services={services}
      users={users}
      payments={payments}
      onNewInvoice={onNewInvoice}
      onCreateDocument={onCreateDocument}
      onViewInvoice={onViewInvoice}
      onToggleStatus={onToggleStatus}
      onNavigate={onNavigate}
    />
  );
}
