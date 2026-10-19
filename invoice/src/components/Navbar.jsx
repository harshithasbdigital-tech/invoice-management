import React from 'react';
import { IconMenu, IconShield, IconUsers, IconPlus, IconCalculator, IconLogOut } from './Icons';

export function Navbar({ currentUser, onSwitchUser, onNewInvoice, onToggleMobileMenu, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const isAdmin = currentUser.role === 'Admin';
  const isAccountant = currentUser.role === 'Accountant';
  const isStaff = currentUser.role === 'User';

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Menu & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              <IconMenu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-blue-100 p-1 flex items-center justify-center shadow-xs">
                <img src="/logo.png" alt="SB Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-900">Invoices</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    GST Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Smart Tax Invoice Management</p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Role Switcher & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quick New Invoice Button */}
            <button
              type="button"
              onClick={() => onNewInvoice && onNewInvoice('tax_invoice')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
            >
              <IconPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className={`w-9 h-9 rounded-full border font-bold text-xs flex items-center justify-center ${
                isAdmin
                  ? 'bg-blue-100 border-blue-200 text-blue-700'
                  : isAccountant
                  ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                {currentUser.avatar || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className={`text-[10px] font-medium leading-tight ${
                  isAdmin ? 'text-blue-600' : isAccountant ? 'text-indigo-600' : 'text-slate-500'
                }`}>{currentUser.role}</div>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Log Out of Session"
              >
                <IconLogOut className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
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
    </header>
  );
}
