import React, { useState } from 'react';
import {
  IconDashboard,
  IconDocument,
  IconInvoice,
  IconUserCheck,
  IconBriefcase,
  IconSettings,
  IconClose,
  IconLogOut,
  IconClock,
  IconCheckCircle,
  IconCreditCard,
  IconUsers,
  IconShield,
  IconHistory,
  IconBill,
  IconReceipt,
  IconPurchaseOrder
} from './Icons';

export function Sidebar({
  activeTab,
  onSelectTab,
  currentUser,
  isMobileOpen,
  onCloseMobile,
  onLogout
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isSalesStaff = currentUser.role === 'User' || currentUser.role === 'Staff' || currentUser.role === 'Sales';
  const isAdmin = currentUser.role === 'Admin';
  const isAccountant = currentUser.role === 'Accountant';

  // Navigation Groups for Sales / Staff
  const mainNavItems = [
    { id: 'dashboard', label: isSalesStaff ? 'Sales Dashboard' : 'Dashboard', icon: IconDashboard },
    { id: 'quotations', label: 'Quotations', icon: IconDocument },
    { id: 'invoices', label: 'Invoices', icon: IconInvoice },
    { id: 'billing', label: 'Billing', icon: IconBill },
    { id: 'receipts', label: 'Receipts', icon: IconReceipt },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: IconPurchaseOrder },
    { id: 'clients', label: 'Customers', icon: IconUserCheck },
  ];

  // Accountant navigation
  const accountantNav = [
    { id: 'invoices', label: 'Invoices & Reconciliation', icon: IconInvoice },
    { id: 'billing', label: 'Billing', icon: IconBill },
    { id: 'receipts', label: 'Receipts', icon: IconReceipt },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: IconPurchaseOrder },
  ];

  // Admin additional sections
  const adminSystemItems = [
    { id: 'services', label: 'Services & Pricing', icon: IconBriefcase },
    { id: 'users', label: 'User Management', icon: IconUsers },
    { id: 'audit-logs', label: 'Audit Logs', icon: IconHistory },
    { id: 'company', label: 'Settings', icon: IconSettings },
  ];

  const handleItemClick = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item.id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] transition-all cursor-pointer ${isActive
            ? 'bg-white text-blue-600 shadow-sm font-bold'
            : 'text-blue-100 hover:text-white hover:bg-blue-700/60 font-semibold'
          }`}
      >
        <div className="flex items-center gap-3.5">
          <Icon className={`w-5.5 h-5.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-blue-200'}`} />
          <span className="truncate">{item.label}</span>
        </div>
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col flex-1 h-screen max-h-screen bg-blue-600 text-white w-[260px] p-4 select-none border-r border-blue-700/60 overflow-hidden">

      {/* Brand Area: Company Logo & Company Name */}
      <div className="flex items-center justify-between pb-4 border-b border-blue-500/40 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
            <img src="/logo.png" alt="SB Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-lg tracking-tight text-white truncate font-bold">
              SB Invoices
            </div>
            <div className="text-xs text-blue-100 truncate font-semibold">
              {isSalesStaff ? 'Sales Workspace' : isAdmin ? 'Admin Control' : 'Accounting'}
            </div>
          </div>
        </div>

        {/* Mobile drawer close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-blue-700/60 cursor-pointer"
        >
          <IconClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* If Sales/Staff (or Admin) */}
        {(!isAccountant || isAdmin) && (
          <>
            {/* GROUP 1: MAIN */}
            <div>
              <div className="space-y-1.5">
                {mainNavItems.map(item => renderNavButton(item))}
              </div>
            </div>
          </>
        )}

        {/* If Accountant */}
        {isAccountant && (
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-blue-200">
              ACCOUNTING &amp; FINANCE
            </div>
            <div className="space-y-1.5">
              {accountantNav.map(item => renderNavButton(item))}
            </div>
          </div>
        )}

        {/* If Admin, render Admin System items */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center justify-between">
              <span>ADMINISTRATION</span>
              <IconShield className="w-4 h-4 text-blue-200" />
            </div>
            <div className="space-y-1.5">
              {adminSystemItems.map(item => renderNavButton(item))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Profile & Logout */}
      <div className="mt-auto pt-3.5 border-t border-blue-500/40">
        <div className="p-3 rounded-2xl bg-blue-700/60 border border-blue-500/40 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold truncate text-white leading-tight">{currentUser.name}</div>
              <div className="text-xs text-blue-200 capitalize font-medium mt-0.5">{currentUser.role}</div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800/60 transition cursor-pointer"
              title="Sign Out"
            >
              <IconLogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Sticky vertical sidebar on desktop (260px wide, sticky to top, 100vh) */}
      <aside className="hidden lg:flex flex-col shrink-0 w-[260px] h-screen max-h-screen sticky top-0 z-30 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full max-h-screen">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 z-10">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
              <IconLogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              Confirm Logout
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to sign out of your account? You will need to log back in to access the system.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm hover:shadow transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
