const units = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(num) {
  let str = '';
  if (num >= 100) {
    str += units[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += units[num] + ' ';
  }
  return str.trim();
}

export function numberToWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.round(Number(amount) * 100) / 100;
  if (rounded === 0) return 'Rupees Zero Only';

  const parts = rounded.toString().split('.');
  let rupees = parseInt(parts[0], 10);
  const paise = parts[1] ? parseInt(parts[1].padEnd(2, '0').slice(0, 2), 10) : 0;

  let words = '';

  const crores = Math.floor(rupees / 10000000);
  rupees %= 10000000;

  const lakhs = Math.floor(rupees / 100000);
  rupees %= 100000;

  const thousands = Math.floor(rupees / 1000);
  rupees %= 1000;

  const remaining = rupees;

  if (crores > 0) {
    words += convertBelowThousand(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertBelowThousand(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertBelowThousand(thousands) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertBelowThousand(remaining) + ' ';
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : 'Rupees Zero';

  if (paise > 0) {
    const paiseWords = convertBelowThousand(paise);
    result += ` and ${paiseWords} Paise`;
  }

  return `${result} Only`;
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount));
}

export function getInvoicePaymentStatus(inv, payments = []) {
  if (!inv) return { totalPaid: 0, status: 'Unpaid', percentage: 0, remaining: 0 };

  const invPayments = Array.isArray(payments) ? payments.filter((p) => p.invoiceId === inv.id) : [];
  const calculatedPaid = invPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPaid = invPayments.length > 0
    ? calculatedPaid
    : (Number(inv.paidAmount) || (inv.status === 'Paid' ? Number(inv.grandTotal) : 0));

  const grandTotal = Number(inv.grandTotal) || 0;
  const remaining = Math.max(0, grandTotal - totalPaid);
  const percentage = grandTotal > 0 ? Math.min(100, Math.round((totalPaid / grandTotal) * 100)) : 0;

  let status = inv.status || 'Unpaid';
  if (status !== 'Cancelled' && status !== 'Converted') {
    if (totalPaid >= grandTotal && grandTotal > 0) {
      status = 'Paid';
    } else if (totalPaid >= (grandTotal * 0.5) && grandTotal > 0) {
      status = 'Partial';
    } else {
      status = 'Unpaid';
    }
  }

  return {
    totalPaid,
    remaining,
    percentage,
    status
  };
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
