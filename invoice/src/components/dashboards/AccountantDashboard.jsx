import React from 'react';
import { IconCreditCard } from '../Icons';

export function AccountantDashboard({ bank }) {
  return (
    <div className="space-y-6">
      {/* Bank Remittance Info for Verification */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <IconCreditCard className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Reconciliation Account</h2>
            <p className="text-xs text-slate-500">Bank account and UPI details on invoices</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5 font-medium">Bank Name</span>
            <span className="font-semibold text-slate-800 text-sm">{bank?.bankName || 'HDFC Bank'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5 font-medium">Account Number</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{bank?.accountNumber || '50200088991234'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5 font-medium">IFSC Code</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{bank?.ifscCode || 'HDFC0001234'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-0.5 font-medium">UPI VPA</span>
            <span className="font-mono font-bold text-indigo-600 text-sm">{bank?.upiId || 'sbdigital@upi'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
