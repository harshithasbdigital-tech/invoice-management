import React from 'react';
import { formatCurrency } from '../utils/numberToWords';
import { IconPrint, IconClose, IconInvoice, IconFileText } from './Icons';

export function QuotationDocument({
  quotation,
  company,
  bank,
  onClose,
  onConvertToInvoice,
  onConvertToTaxInvoice,
  onConvertToPreInvoice
}) {
  if (!quotation) return null;

  const handlePrint = () => window.print();

  const client = quotation.client || {};
  const items = quotation.items && quotation.items.length > 0
    ? quotation.items
    : [
        { description: quotation.service || 'Service Item', rate: quotation.amount || 0, qty: 1, gstRate: 18, amount: quotation.amount || 0 }
      ];

  const subtotalAmount = quotation.subtotal != null ? quotation.subtotal : items.reduce((acc, it) => {
    return acc + (Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0);
  }, 0);

  const taxAmount = quotation.taxAmount != null ? quotation.taxAmount : items.reduce((acc, it) => {
    const itAmt = Number(it.amount) || (Number(it.rate || 0) * Number(it.qty || 1)) || 0;
    const rate = Number(it.gstRate != null ? it.gstRate : 18);
    return acc + (itAmt * rate) / 100;
  }, 0);

  const totalAmount = quotation.grandTotal || (subtotalAmount + taxAmount);

  // UPI QR
  const upiId = bank?.upiId || 'sbdigital@upi';
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(company?.name || 'SB Digital Automation Pvt Ltd')}&am=${totalAmount}&tn=Quote-${encodeURIComponent(quotation.quotationNumber)}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiPayload)}`;

  const companyName = (company?.name && company.name !== 'SB') ? company.name : 'SB DIGITAL AUTOMATION PVT. LTD.';
  const quoteNumber = quotation.quotationNumber || 'SB-Q-999221';
  const quoteDate = quotation.date || '18 Sept 2026';
  const validUntil = quotation.validUntil || '03 Oct 2026';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs overflow-y-auto flex items-start justify-center p-2 sm:p-4 md:p-6">

      {/* Modal Card */}
      <div className="relative w-full max-w-[820px] bg-white rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-200">

        {/* ── Top Bar (Hidden during Print) ── */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quotation:</span>
            <span className="text-sm font-bold text-[#0B3C7B] font-mono">{quoteNumber}</span>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              quotation.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
              quotation.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {quotation.status || 'Draft'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(onConvertToPreInvoice || onConvertToInvoice) && (
              <button
                type="button"
                onClick={() => {
                  if (onConvertToPreInvoice) onConvertToPreInvoice(quotation);
                  else if (onConvertToInvoice) onConvertToInvoice(quotation);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <IconFileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Convert to Pre-Invoice</span>
              </button>
            )}
            {(onConvertToTaxInvoice || onConvertToInvoice) && (
              <button
                type="button"
                onClick={() => {
                  if (onConvertToTaxInvoice) onConvertToTaxInvoice(quotation);
                  else if (onConvertToInvoice) onConvertToInvoice(quotation);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#0B3C7B] hover:bg-[#072d5c] text-white font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <IconInvoice className="w-3.5 h-3.5" />
                <span>Convert to Tax Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
            >
              <IconPrint className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close"
              >
                <IconClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PRINTABLE QUOTATION SHEET (EXACT REFERENCE REPLICA)
        ══════════════════════════════════════════════════════════ */}
        <div
          id="quotation-print-sheet"
          className="quotation-print-sheet bg-white text-slate-900 font-sans select-text flex flex-col justify-between min-h-[270mm]"
          style={{ padding: '36px 42px 28px' }}
        >
          <div>
            {/* ── 1. HEADER ROW: BRAND IDENTITY & DETAILS ── */}
            <div className="flex items-center justify-between gap-6 mb-4">
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
            <div className="border-b border-slate-200 w-full mb-4" />

            {/* ── 2. TWO BOXES: BILLED TO & (QUOTATION TABLE + PAYMENT TERMS) ── */}
            <div className="grid grid-cols-2 gap-5 mb-5">

            {/* Box 1: QUOTE FOR (BILLED TO) */}
            <div className="border border-slate-200 p-3 text-[11px]">
              <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-2">
                QUOTE FOR (BILLED TO)
              </div>

              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">CLIENT NAME</span>
                  <span className="text-slate-900 font-bold text-[11px]">
                    {(typeof client === 'string' ? client : (client.name || client.clientName || 'Valued Customer'))}
                  </span>
                </div>
                {client.companyName && client.companyName !== 'Direct Billing' && client.companyName !== client.name && (
                  <div className="grid grid-cols-[80px_1fr]">
                    <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">COMPANY</span>
                    <span className="text-slate-800 text-[11px]">{client.companyName}</span>
                  </div>
                )}
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">PHONE</span>
                  <span className="text-slate-800 text-[11px]">{client.phone || '+91 98765 43210'}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">EMAIL</span>
                  <span className="text-slate-800 text-[11px]">{client.email || 'customer@example.com'}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="font-bold text-[#0B3C7B] uppercase text-[10px] tracking-wide">ADDRESS</span>
                  <span className="text-slate-800 text-[11px]">{client.address || `${company?.city || 'Bengaluru'}, Karnataka`}</span>
                </div>
              </div>
            </div>

            {/* Box 2: QUOTATION META TABLE (MOVED DOWN) ABOVE PAYMENT TERMS */}
            <div className="border border-slate-200 flex flex-col justify-between overflow-hidden">
              {/* Top: Quotation Details Table */}
              <div>
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-white">
                  <span className="text-[11px] font-black tracking-wider text-[#0B3C7B] uppercase">QUOTATION</span>
                  <span className="text-[11px] font-bold text-[#0B3C7B] font-mono">{quoteNumber}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 text-center border-b border-slate-200 bg-slate-50/50">
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">DATE</div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{quoteDate}</div>
                  </div>
                  <div className="px-1.5 py-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[8px] leading-tight">VALID UNTIL</div>
                    <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{validUntil}</div>
                  </div>
                </div>
              </div>

              {/* Bottom: PAYMENT TERMS */}
              <div className="p-2.5">
                <div className="font-bold text-[9px] uppercase tracking-wider text-[#0B3C7B] mb-1">
                  PAYMENT TERMS
                </div>

                {/* Segmented Switch/Pill container */}
                <div className="border border-slate-200 flex overflow-hidden mb-1 rounded-xs">
                  <div className="bg-[#0B3C7B] text-white text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase">
                    50% ADVANCE
                  </div>
                  <div className="bg-white text-[#0B3C7B] text-center py-1 px-2 flex-1 font-bold text-[9px] tracking-wider uppercase">
                    50% BALANCE
                  </div>
                </div>

                {/* Subtext below pill */}
                <div className="flex justify-between text-[9px] text-slate-500 px-0.5">
                  <span>Advance payment</span>
                  <span>After delivery</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── 3. ITEMS TABLE (WITH GST % BESIDE QTY & GST AMOUNT BELOW AMOUNT) ── */}
          <div className="mb-4">
            <table className="w-full text-left border-collapse table-fixed text-[12px] border border-slate-300">
              <thead>
                <tr className="bg-[#DCE8F8] text-[#0B3C7B] text-[11px] font-black uppercase tracking-wider border-b border-slate-300">
                  <th className="py-2 px-2.5 w-[8%] text-center border-r border-slate-300">SL NO.</th>
                  <th className="py-2 px-2.5 w-[36%] text-left border-r border-slate-300">DESCRIPTION</th>
                  <th className="py-2 px-2.5 text-center w-[8%] border-r border-slate-300">QTY</th>
                  <th className="py-2 px-2.5 text-right w-[16%] whitespace-nowrap border-r border-slate-300">RATE (₹)</th>
                  <th className="py-2 px-2.5 text-center w-[14%] whitespace-nowrap border-r border-slate-300">GST (%)</th>
                  <th className="py-2 px-2.5 text-right w-[18%] whitespace-nowrap">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemRate = Number(item.rate) || 0;
                  const itemQty = Number(item.qty) || 1;
                  const itemAmount = Number(item.amount) || (itemRate * itemQty);
                  const itemGstRate = Number(item.gstRate != null ? item.gstRate : 18);
                  const itemGstAmount = (itemAmount * itemGstRate) / 100;

                  return (
                    <tr key={idx} className="border-b border-slate-300 text-[11px] sm:text-xs">
                      <td className="py-2 px-2.5 text-center font-bold text-[#1A56DB] border-r border-slate-300">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2 px-2.5 text-slate-800 font-medium truncate border-r border-slate-300">
                        {item.description || item.name || 'Service Item'}
                      </td>
                      <td className="py-2 px-2.5 text-center text-slate-700 border-r border-slate-300">
                        {itemQty}
                      </td>
                      <td className="py-2 px-2.5 text-right text-slate-700 font-mono border-r border-slate-300">
                        {formatCurrency(itemRate)}
                      </td>
                      <td className="py-2 px-2.5 text-center text-slate-700 border-r border-slate-300">
                        {itemGstRate}%
                      </td>
                      <td className="py-2 px-2.5 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(itemAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Bottom Summary Bar below Amount */}
              <tfoot>
                {/* 1. GST */}
                <tr className="border-t border-slate-300 bg-slate-50/50">
                  <td colSpan={2} className="py-1.5 px-2.5 text-[10px] text-slate-500 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-1.5 px-4 text-right text-[10px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap border-r border-slate-300">
                    GST
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-[#0B3C7B] font-mono text-[11px] whitespace-nowrap">
                    {formatCurrency(taxAmount)}
                  </td>
                </tr>

                {/* 2. Grand Total */}
                <tr className="bg-[#DCE8F8] border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2 px-2.5 border-r border-slate-300"></td>
                  <td colSpan={3} className="py-2 px-4 text-right whitespace-nowrap text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0B3C7B] border-r border-slate-300">
                    TOTAL
                  </td>
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <span className="text-[13px] sm:text-[14px] font-bold text-[#0B3C7B] font-mono leading-none">
                      {formatCurrency(totalAmount)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── 4. TERMS & CONDITIONS ── */}
          <div className="mb-3">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] mb-1.5">
              TERMS &amp; CONDITIONS
            </div>
            <ol className="space-y-1 text-[10px] text-slate-600 list-none pl-0">
              {[
                'Validity: 15 days from the date of issue.',
                'Payment terms: Mutually agreed (50% advance, 50% after delivery).',
                'Work will commence after the confirmation of advance payment.',
                'Additional work outside agreed scope will be charged separately.',
                "Client's approval is required before final production or delivery."
              ].map((term, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="font-bold text-[#0B3C7B] shrink-0 w-3.5">{i + 1}.</span>
                  <span className="leading-tight">{term}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 5. PAYMENT DETAILS (BELOW TERMS & CONDITIONS) ── */}
          <div className="border border-slate-200 p-3 text-[10px] mb-3">
            <div className="font-bold text-[10px] uppercase tracking-wider text-[#0B3C7B] border-b border-slate-200 pb-1 mb-2">
              PAYMENT DETAILS
            </div>
            <div className="flex items-center justify-between gap-4">
              {/* Bank Fields as proper table columns with vertical divider borders */}
              <div className="grid grid-cols-4 divide-x divide-slate-200 flex-1">
                <div className="pr-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">ACCOUNT NAME</div>
                  <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{bank?.accountHolder || 'SB Digital Automation Pvt Ltd'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">ACCOUNT NUMBER</div>
                  <div className="font-bold text-slate-900 text-xs font-mono leading-tight">{bank?.accountNumber || '50200088991234'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">BANK / IFSC</div>
                  <div className="font-bold text-slate-900 text-[10px] leading-tight truncate">{bank?.bankName || 'HDFC Bank'} / {bank?.ifscCode || 'HDFC0001234'}</div>
                </div>
                <div className="px-3">
                  <div className="font-bold text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">UPI ID</div>
                  <div className="font-bold text-[#0B3C7B] text-[10px] leading-tight truncate">{bank?.upiId || 'sbdigital@upi'}</div>
                </div>
              </div>

              {/* Dashed QR Box */}
              <div className="flex flex-col items-center justify-center shrink-0 border-l border-slate-200 pl-4">
                <div className="w-[68px] h-[68px] border border-dashed border-slate-300 flex items-center justify-center p-1 bg-white">
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

          </div>
          {/* End top content */}

          {/* ── 5. FOOTER (ALIGNED TO BOTTOM OF PAGE NEATLY) ── */}
          <div className="mt-auto shrink-0 document-footer pt-3">
            {/* Full-width light divider line */}
            <div className="border-t border-slate-200 w-full mb-2" />

            <div className="flex items-start justify-between text-[10px] text-slate-500 leading-normal">
              <div>
                <div>{company?.address || '2nd Floor, 1064/442 RV Garden, NH 75'}</div>
                <div>Jayanagara, Kolar – 563101, Karnataka, India</div>
                <div className="mt-0.5 text-slate-400 text-[9px]">© 2026 SB Digital Automation. All rights reserved.</div>
              </div>
              <div className="text-right">
                <div>Phone {company?.phone || '+91 8217536889'}</div>
                <div>Tel +91 8152460320</div>
              </div>
            </div>
          </div>

        </div>
        {/* End sheet */}

      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .quotation-print-sheet, .quotation-print-sheet * {
            visibility: visible;
          }
          .quotation-print-sheet {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 6mm 8mm !important;
            margin: 0;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
