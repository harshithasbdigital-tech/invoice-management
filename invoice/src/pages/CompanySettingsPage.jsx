import React, { useState } from 'react';
import {
  IconBuilding,
  IconCreditCard,
  IconQrCode,
  IconSettings,
  IconCheck,
  IconUpload,
  IconTrash,
  IconPlus
} from '../components/Icons';

export function CompanySettingsPage({
  company,
  bank,
  settings,
  qrImage,
  onSaveCompany,
  onSaveBank,
  onSaveSettings,
  onSaveQrImage
}) {
  const [activeTab, setActiveTab] = useState('company');
  const [savedNotice, setSavedNotice] = useState(false);

  // Local form states
  const [companyForm, setCompanyForm] = useState(company);
  const [bankForm, setBankForm] = useState(bank);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [qrPreview, setQrPreview] = useState(qrImage);

  // Logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompanyForm({ ...companyForm, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // QR Code file upload
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setQrPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Terms and conditions handling
  const handleAddTerm = () => {
    setSettingsForm({
      ...settingsForm,
      termsAndConditions: [
        ...(settingsForm.termsAndConditions || []),
        `${(settingsForm.termsAndConditions || []).length + 1}. New business term`
      ]
    });
  };

  const handleUpdateTerm = (index, value) => {
    const updated = [...(settingsForm.termsAndConditions || [])];
    updated[index] = value;
    setSettingsForm({ ...settingsForm, termsAndConditions: updated });
  };

  const handleRemoveTerm = (index) => {
    const updated = (settingsForm.termsAndConditions || []).filter((_, i) => i !== index);
    setSettingsForm({ ...settingsForm, termsAndConditions: updated });
  };

  const handleSaveAll = () => {
    onSaveCompany(companyForm);
    onSaveBank(bankForm);
    onSaveSettings(settingsForm);
    onSaveQrImage(qrPreview);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl 2xl:max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Action Header */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <IconCheck className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 transition animate-fade-in">
          <IconCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All business and banking details saved successfully!</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconBuilding className="w-4 h-4" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconCreditCard className="w-4 h-4" />
          <span>Bank & UPI</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconQrCode className="w-4 h-4" />
          <span>Payment QR Code</span>
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'invoice'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconSettings className="w-4 h-4" />
          <span>Invoice Rules & Terms</span>
        </button>
      </div>

      {/* Tab 1: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Company & Tax Identification</h2>
            <p className="text-xs text-slate-500">This information will be printed on the header of every tax invoice</p>
          </div>

          {/* Logo Upload Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-2 overflow-hidden shrink-0">
              {companyForm.logoUrl ? (
                <img src={companyForm.logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-slate-400 text-center">No Logo</span>
              )}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-700 block">Company Logo</span>
              <p className="text-xs text-slate-500">Upload your brand logo (PNG, JPG, or SVG recommended)</p>
              <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer">
                  <IconUpload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {companyForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setCompanyForm({ ...companyForm, logoUrl: '' })}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Company Legal Name *</label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tagline / Subheading</label>
              <input
                type="text"
                value={companyForm.tagline}
                onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Address Line 1</label>
              <input
                type="text"
                value={companyForm.addressLine1}
                onChange={(e) => setCompanyForm({ ...companyForm, addressLine1: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Address Line 2</label>
              <input
                type="text"
                value={companyForm.addressLine2}
                onChange={(e) => setCompanyForm({ ...companyForm, addressLine2: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">City</label>
              <input
                type="text"
                value={companyForm.city}
                onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">State & PIN Code</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={companyForm.state}
                  onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })}
                  placeholder="State"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={companyForm.pincode}
                  onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })}
                  placeholder="PIN"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">GSTIN (15 Digits) *</label>
              <input
                type="text"
                maxLength={15}
                value={companyForm.gstin}
                onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">State Code (2 Digits)</label>
              <input
                type="text"
                maxLength={2}
                value={companyForm.stateCode}
                onChange={(e) => setCompanyForm({ ...companyForm, stateCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bank & UPI */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Bank Remittance & UPI Details</h2>
            <p className="text-xs text-slate-500">
              Clients use these bank details to pay your invoices directly via IMPS/NEFT/RTGS/UPI
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Holder Name *</label>
              <input
                type="text"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Bank Name *</label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Number *</label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">IFSC Code *</label>
              <input
                type="text"
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Branch Name</label>
              <input
                type="text"
                value={bankForm.branch}
                onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">UPI ID (VPA) *</label>
              <input
                type="text"
                value={bankForm.upiId}
                onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                placeholder="e.g. company@okhdfcbank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-emerald-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment QR Code */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Payment QR Code</h2>
            <p className="text-xs text-slate-500">
              Upload your official payment QR code image or let the app generate a live dynamic UPI QR code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Invoice QR Code Preview
              </span>
              <div className="w-44 h-44 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center">
                {qrPreview ? (
                  <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=${bankForm.upiId}&pn=${encodeURIComponent(companyForm.name)}&cu=INR`
                    )}`}
                    alt="Auto Generated QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-3">
                {qrPreview ? 'Custom Uploaded QR' : 'Auto-generated UPI QR from UPI ID'}
              </p>
              <p className="text-[11px] text-slate-400">
                {bankForm.upiId || 'No UPI ID configured'}
              </p>
            </div>

            {/* Upload & Controls */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
                <span className="text-xs font-bold text-blue-900 block">How Payment QR Works</span>
                <p className="text-xs text-blue-800 leading-relaxed">
                  If you upload a custom QR image (e.g., from PhonePe Business, Google Pay Business, or your bank), that exact image will be printed on every invoice. If left blank, the app will dynamically generate a live UPI QR for the customer to scan and pay!
                </p>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
                  <IconUpload className="w-4 h-4" />
                  <span>Upload QR Image (PNG/JPG)</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
              </div>

              {qrPreview && (
                <button
                  type="button"
                  onClick={() => setQrPreview('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <IconTrash className="w-4 h-4" />
                  <span>Remove Custom QR (Revert to auto-generated)</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Invoice Rules & Terms */}
      {activeTab === 'invoice' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Invoice Numbering & Default Terms</h2>
            <p className="text-xs text-slate-500">Configure numbering format, tax type, and standard terms</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Invoice Prefix *</label>
              <input
                type="text"
                value={settingsForm.prefix}
                onChange={(e) => setSettingsForm({ ...settingsForm, prefix: e.target.value })}
                placeholder="e.g. INV- or APX-"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Current Number Counter *</label>
              <input
                type="number"
                value={settingsForm.currentNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, currentNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Default Tax Regime</label>
              <select
                value={settingsForm.defaultTaxType}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultTaxType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="intra">Intra-State (CGST + SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                value={settingsForm.authorizedSignatoryName}
                onChange={(e) => setSettingsForm({ ...settingsForm, authorizedSignatoryName: e.target.value })}
                placeholder="e.g. Harshitha M."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Signatory Designation</label>
              <input
                type="text"
                value={settingsForm.designation}
                onChange={(e) => setSettingsForm({ ...settingsForm, designation: e.target.value })}
                placeholder="e.g. Authorized Signatory / Director"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Terms and Conditions List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Terms and Conditions (Printed on Invoice)
              </label>
              <button
                type="button"
                onClick={handleAddTerm}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <IconPlus className="w-3.5 h-3.5" />
                <span>Add Term</span>
              </button>
            </div>

            <div className="space-y-2">
              {(settingsForm.termsAndConditions || []).map((term, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleUpdateTerm(index, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer"
        >
          <IconCheck className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

    </div>
  );
}
