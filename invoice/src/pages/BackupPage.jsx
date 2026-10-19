import React, { useState } from 'react';
import {
  IconDatabase,
  IconDownload,
  IconUpload,
  IconCheck,
  IconTrash
} from '../components/Icons';
import { storage } from '../utils/storage';

export function BackupPage({
  invoicesCount,
  servicesCount,
  onDataRestored
}) {
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Download all application data as JSON
  const handleDownloadBackup = () => {
    try {
      const backupJson = storage.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `invoices_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Backup downloaded successfully!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setErrorMessage("Failed to export backup: " + err.message);
    }
  };

  // Restore data from JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = storage.importBackup(event.target.result);
        if (result.success) {
          setStatusMessage("Data restored successfully!");
          onDataRestored();
        } else {
          setErrorMessage("Failed to import file: " + result.error);
        }
      } catch (err) {
        setErrorMessage("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Reset to original demo data
  const handleResetDemo = () => {
    if (confirm("Are you sure you want to reset all data back to the demo state? Any unsaved edits will be replaced.")) {
      storage.resetToDemo();
      setStatusMessage("Reset to demo data completed!");
      onDataRestored();
    }
  };

  return (
    <div className="max-w-3xl 2xl:max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Backup & Recovery</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Safeguard your invoices, company configuration, services list, and staff records
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <IconCheck className="w-5 h-5 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Storage Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <IconDatabase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Browser Storage Status</h2>
            <p className="text-xs text-slate-500">Your data is safely stored locally in your browser</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Invoices</span>
            <span className="text-xl font-extrabold text-slate-900">{invoicesCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Services</span>
            <span className="text-xl font-extrabold text-slate-900">{servicesCount}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage Mode</span>
            <span className="text-sm font-bold text-blue-600">Local Offline Ready</span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Download Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <IconDownload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Download Backup</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export all company information, bank details, invoices, and services into a portable JSON file.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer mt-4"
          >
            <IconDownload className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 card-shadow space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <IconUpload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Restore from File</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload a previously exported JSON backup file to restore all your invoices and settings.
            </p>
          </div>

          <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-xl transition cursor-pointer mt-4">
            <IconUpload className="w-4 h-4" />
            <span>Select JSON File</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

      </div>

      {/* Reset Demo Data Danger Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Reset to Demo State</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset all company settings, services catalog, and sample invoices to the clean factory defaults.
          </p>
        </div>
        <button
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <IconTrash className="w-4 h-4" />
          <span>Reset to Demo Data</span>
        </button>
      </div>

    </div>
  );
}
