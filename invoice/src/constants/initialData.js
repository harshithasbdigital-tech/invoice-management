export const INITIAL_COMPANY = {
  name: "SB",
  tagline: "High Precision Print Works & Digital Tech Solutions",
  addressLine1: "Plot No. 42, 3rd Floor, Tech Park Road",
  addressLine2: "HSR Layout Sector 2, Bengaluru",
  city: "Bengaluru",
  state: "Karnataka",
  stateCode: "29",
  pincode: "560102",
  phone: "+91 98765 43210",
  email: "billing@sb.in",
  website: "www.sb.in",
  gstin: "29ABMCS2397E1ZU",
  pan: "ABMCS2397E",
  logoUrl: "/logo.png"
};

export const INITIAL_BANK = {
  accountHolder: "SB",
  bankName: "HDFC Bank",
  accountNumber: "50200088994432",
  ifscCode: "HDFC0001234",
  branch: "HSR Layout Sector 2, Bengaluru",
  accountType: "Current Account",
  upiId: "sb@okhdfcbank"
};

export const INITIAL_INVOICE_SETTINGS = {
  prefix: "SB-INV-",
  startingNumber: 1001,
  currentNumber: 1004,
  defaultTaxType: "intra",
  defaultGstRate: 18,
  termsAndConditions: [
    "1. Payment is due within 15 days of invoice date.",
    "2. Interest @ 18% per annum will be charged on late payments.",
    "3. All payments should be made in favour of SB.",
    "4. Goods/Services once delivered or rendered are not refundable.",
    "5. Subject to Bengaluru jurisdiction only."
  ],
  authorizedSignatoryName: "Harshitha M.",
  designation: "Authorized Signatory"
};

export const INITIAL_SERVICES = [
  {
    id: "srv-1",
    name: "Custom Software Development",
    hsnSac: "998314",
    description: "Full stack web/mobile application architecture, backend APIs & frontend UI/UX engineering",
    rate: 45000,
    unit: "Milestone",
    gstRate: 18
  },
  {
    id: "srv-2",
    name: "Social Media Marketing & Management",
    hsnSac: "998363",
    description: "Monthly retainer: Content creation, graphic design, ad campaigns & community engagement",
    rate: 18000,
    unit: "Month",
    gstRate: 18
  },
  {
    id: "srv-3",
    name: "Precision Laser Engraving",
    hsnSac: "998813",
    description: "Industrial grade acrylic/wood/metal custom laser engraving and cutting services",
    rate: 350,
    unit: "Piece",
    gstRate: 18
  },
  {
    id: "srv-4",
    name: "Corporate RFID ID Card Printing",
    hsnSac: "998912",
    description: "High definition PVC thermal transfer smart identity card printing with lanyard & holder",
    rate: 65,
    unit: "Card",
    gstRate: 18
  },
  {
    id: "srv-5",
    name: "Cloud Infrastructure Setup & Maintenance",
    hsnSac: "998315",
    description: "AWS / Google Cloud deployment, container orchestration, SSL & automated daily backups",
    rate: 15000,
    unit: "Service",
    gstRate: 18
  }
];

export const INITIAL_USERS = [
  {
    id: "usr-admin",
    name: "Admin Manager",
    email: "admin@sb.in",
    role: "Admin",
    avatar: "AM",
    password: "admin"
  },
  {
    id: "usr-acct1",
    name: "Ananya Deshmukh",
    email: "ananya.accounts@sb.in",
    role: "Accountant",
    avatar: "AD",
    password: "acct123"
  },
  {
    id: "usr-staff1",
    name: "Rohan Verma",
    email: "rohan@sb.in",
    role: "User",
    avatar: "RV",
    password: "user123"
  },
  {
    id: "usr-staff2",
    name: "Priya Sharma",
    email: "priya@sb.in",
    role: "User",
    avatar: "PS",
    password: "user123"
  }
];

export const INITIAL_INVOICES = [
  {
    id: "inv-1001",
    invoiceNumber: "SB-INV-1001",
    invoiceDate: "2026-10-02",
    dueDate: "2026-10-17",
    createdBy: "Rohan Verma",
    status: "Paid",
    paidDate: "2026-10-10",
    paymentMode: "UPI / Net Banking",
    client: {
      name: "Nexus Infotech Solutions LLP",
      contactPerson: "Kavita Rao",
      phone: "+91 91234 56789",
      email: "accounts@nexusinfo.com",
      address: "Tower B, 4th Floor, Electronic City Phase 1",
      city: "Bengaluru",
      state: "Karnataka",
      stateCode: "29",
      gstin: "29AAACN1234E1Z1"
    },
    taxType: "intra",
    items: [
      {
        id: "item-1",
        serviceId: "srv-1",
        description: "Custom Software Development - Milestone 1 Core Dashboard & Authentication",
        hsnSac: "998314",
        qty: 1,
        unit: "Milestone",
        rate: 45000,
        gstRate: 18,
        taxableAmount: 45000,
        cgstAmount: 4050,
        sgstAmount: 4050,
        igstAmount: 0,
        total: 53100
      },
      {
        id: "item-2",
        serviceId: "srv-4",
        description: "Corporate RFID ID Card Printing with dual-sided full color imprint",
        hsnSac: "998912",
        qty: 50,
        unit: "Card",
        rate: 65,
        gstRate: 18,
        taxableAmount: 3250,
        cgstAmount: 292.5,
        sgstAmount: 292.5,
        igstAmount: 0,
        total: 3835
      }
    ],
    subtotal: 48250,
    cgstTotal: 4342.5,
    sgstTotal: 4342.5,
    igstTotal: 0,
    roundOff: 0,
    grandTotal: 56935,
    amountInWords: "Rupees Fifty Six Thousand Nine Hundred Thirty Five Only",
    notes: "Thank you for partnering with SB."
  },
  {
    id: "inv-1002",
    invoiceNumber: "SB-INV-1002",
    invoiceDate: "2026-10-08",
    dueDate: "2026-10-23",
    createdBy: "Priya Sharma",
    status: "Unpaid",
    paidDate: null,
    paymentMode: null,
    client: {
      name: "Zenith Retail & Hospitality Group",
      contactPerson: "Arjun Nair",
      phone: "+91 99887 76655",
      email: "finance@zenithgroup.in",
      address: "14/A Marine Drive, Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      stateCode: "27",
      gstin: "27AAACZ5678K1Z9"
    },
    taxType: "inter",
    items: [
      {
        id: "item-1",
        serviceId: "srv-2",
        description: "Social Media Marketing & Management - October 2026 Retainer",
        hsnSac: "998363",
        qty: 1,
        unit: "Month",
        rate: 18000,
        gstRate: 18,
        taxableAmount: 18000,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 3240,
        total: 21240
      },
      {
        id: "item-2",
        serviceId: "srv-3",
        description: "Precision Laser Engraving - Custom Acrylic Table Signs & Name Badges",
        hsnSac: "998813",
        qty: 25,
        unit: "Piece",
        rate: 350,
        gstRate: 18,
        taxableAmount: 8750,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 1575,
        total: 10325
      }
    ],
    subtotal: 26750,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 4815,
    roundOff: 0,
    grandTotal: 31565,
    amountInWords: "Rupees Thirty One Thousand Five Hundred Sixty Five Only",
    notes: "Inter-state supply to Maharashtra subject to IGST 18%."
  },
  {
    id: "inv-1003",
    invoiceNumber: "SB-INV-1003",
    invoiceDate: "2026-10-12",
    dueDate: "2026-10-27",
    createdBy: "Rohan Verma",
    status: "Unpaid",
    paidDate: null,
    paymentMode: null,
    client: {
      name: "Vanguard Event Management",
      contactPerson: "Divya Krishnan",
      phone: "+91 94455 66778",
      email: "divya@vanguardevents.co",
      address: "No. 88, Brigade Road, Ashok Nagar",
      city: "Bengaluru",
      state: "Karnataka",
      stateCode: "29",
      gstin: "29AACCV9876Q1Z3"
    },
    taxType: "intra",
    items: [
      {
        id: "item-1",
        serviceId: "srv-4",
        description: "Corporate RFID ID Card Printing for Tech Conclave 2026",
        hsnSac: "998912",
        qty: 200,
        unit: "Card",
        rate: 65,
        gstRate: 18,
        taxableAmount: 13000,
        cgstAmount: 1170,
        sgstAmount: 1170,
        igstAmount: 0,
        total: 15340
      }
    ],
    subtotal: 13000,
    cgstTotal: 1170,
    sgstTotal: 1170,
    igstTotal: 0,
    roundOff: 0,
    grandTotal: 15340,
    amountInWords: "Rupees Fifteen Thousand Three Hundred Forty Only",
    notes: "Delivered on 12-Oct-2026 with lanyards."
  },
  {
    id: "bill-000201",
    docType: "bill",
    invoiceNumber: "SB-B-000201",
    billNumber: "SB-B-000201",
    invoiceDate: "2026-10-19",
    date: "2026-10-19",
    dueDate: "2026-10-19",
    createdBy: "Priya Sharma",
    status: "Paid",
    paidDate: "2026-10-19",
    paymentMode: "UPI",
    transactionRef: "UPI/2026/891234",
    client: {
      name: "speed",
      contactPerson: "speed",
      phone: "+91 56656565",
      email: "demo@speed.com",
      address: "xyz",
      city: "Bengaluru",
      state: "Karnataka",
      stateCode: "29",
      gstin: ""
    },
    taxType: "intra",
    items: [
      {
        id: "item-b1",
        description: "ID card printing (per card)",
        qty: 20,
        rate: 60,
        taxableAmount: 1200,
        total: 1200
      },
      {
        id: "item-b2",
        description: "Engraving, name plates",
        qty: 2,
        rate: 500,
        taxableAmount: 1000,
        total: 1000
      }
    ],
    subtotal: 2200,
    discount: 200,
    taxAmount: 0,
    grandTotal: 2000,
    amount: 2000,
    amountInWords: "Rupees Two Thousand Only",
    notes: "Please keep this bill for your records."
  },
  {
    id: "rec-000301",
    docType: "receipt",
    invoiceNumber: "SB-R-000301",
    receiptNumber: "SB-R-000301",
    invoiceDate: "2026-09-25",
    date: "2026-09-25",
    dueDate: "2026-09-25",
    createdBy: "Priya Sharma",
    status: "Paid",
    paidDate: "2026-09-25",
    paymentMode: "UPI",
    transactionRef: "[UTR / TXN NO.]",
    againstDoc: "SB-Q-999221",
    paymentTowards: "50% advance",
    receiptAmountReceived: 24190,
    receiptProjectTotal: 48380,
    receiptBalanceDue: 24190,
    client: {
      name: "speed",
      companyName: "Demo",
      phone: "+91 5665656565",
      email: "demo@gmail.com",
      address: "xyz",
      city: "Bengaluru",
      state: "Karnataka",
      stateCode: "29",
      gstin: ""
    },
    taxType: "intra",
    items: [
      {
        id: "item-r1",
        description: "50% Advance against Quotation SB-Q-999221",
        qty: 1,
        rate: 24190,
        taxableAmount: 24190,
        total: 24190
      }
    ],
    subtotal: 24190,
    grandTotal: 24190,
    amount: 24190,
    amountInWords: "Rupees Twenty-Four Thousand One Hundred Ninety Only",
    notes: "Advance confirmation receipt."
  },
  {
    id: "po-1004",
    docType: "purchase_order",
    invoiceNumber: "SB-PO-1004",
    poNumber: "SB-PO-1004",
    invoiceDate: "2026-10-15",
    date: "2026-10-15",
    dueDate: "2026-10-30",
    createdBy: "Rohan Verma",
    status: "Active",
    paymentMode: "Bank Transfer",
    client: {
      name: "Horizon Hardware & Raw Materials",
      contactPerson: "Dr. Sandeep Patel",
      phone: "+91 98450 11223",
      email: "procurement@horizonhealth.in",
      address: "Plot 42, Peenya Industrial Area 3rd Phase",
      city: "Bengaluru",
      state: "Karnataka",
      stateCode: "29",
      gstin: "29AAACH4321P1Z5"
    },
    taxType: "intra",
    items: [
      {
        id: "item-po1",
        description: "RFID Smart Cards (Pack of 500) & Thermal Ribbons",
        qty: 4,
        rate: 4500,
        taxableAmount: 18000,
        cgstAmount: 1620,
        sgstAmount: 1620,
        igstAmount: 0,
        total: 21240
      }
    ],
    subtotal: 18000,
    cgstTotal: 1620,
    sgstTotal: 1620,
    taxAmount: 3240,
    grandTotal: 21240,
    amount: 21240,
    amountInWords: "Rupees Twenty One Thousand Two Hundred Forty Only",
    notes: "Delivery expected within 10 days to warehouse."
  }
];

export const INITIAL_CLIENTS = [
  {
    id: "cli-1",
    name: "Nexus Infotech Solutions LLP",
    contactPerson: "Kavita Rao",
    phone: "+91 91234 56789",
    email: "accounts@nexusinfo.com",
    address: "Tower B, 4th Floor, Electronic City Phase 1",
    city: "Bengaluru",
    state: "Karnataka",
    stateCode: "29",
    gstin: "29AAACN1234E1Z1",
    creditDays: 15,
    notes: "Enterprise software development client. Prompt payer."
  },
  {
    id: "cli-2",
    name: "Zenith Retail & Hospitality Group",
    contactPerson: "Arjun Nair",
    phone: "+91 99887 76655",
    email: "finance@zenithgroup.in",
    address: "14/A Marine Drive, Nariman Point",
    city: "Mumbai",
    state: "Maharashtra",
    stateCode: "27",
    gstin: "27AAACZ5678K1Z9",
    creditDays: 30,
    notes: "Inter-state client for monthly marketing retainer & signs."
  },
  {
    id: "cli-3",
    name: "Vanguard Event Management",
    contactPerson: "Divya Krishnan",
    phone: "+91 94455 66778",
    email: "divya@vanguardevents.co",
    address: "No. 88, Brigade Road, Ashok Nagar",
    city: "Bengaluru",
    state: "Karnataka",
    stateCode: "29",
    gstin: "29AACCV9876Q1Z3",
    creditDays: 15,
    notes: "Bulk corporate event ID badge printing partner."
  },
  {
    id: "cli-4",
    name: "Horizon Healthcare Systems",
    contactPerson: "Dr. Sandeep Patel",
    phone: "+91 98450 11223",
    email: "procurement@horizonhealth.in",
    address: "Plot 12, Whitefield Main Road",
    city: "Bengaluru",
    state: "Karnataka",
    stateCode: "29",
    gstin: "29AABCH3344J1Z8",
    creditDays: 30,
    notes: "Hospital chain with quarterly laser engraving and printing requirements."
  }
];

export const INITIAL_PAYMENTS = [
  {
    id: "pay-101",
    receiptNumber: "SB-REC-1001",
    invoiceId: "inv-1001",
    invoiceNumber: "SB-INV-1001",
    clientName: "Nexus Infotech Solutions LLP",
    amount: 56935,
    paymentMode: "UPI / Net Banking",
    transactionRef: "UPI-8492049102",
    date: "2026-10-10",
    recordedBy: "Ananya Deshmukh",
    notes: "Full settlement received and verified in HDFC Current A/C"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: "log-1",
    timestamp: "2026-10-01T10:15:00Z",
    action: "SYSTEM_CONFIG",
    entityType: "Company",
    entityId: "SB",
    performedBy: "Admin Manager",
    role: "Admin",
    description: "Configured business GSTIN, banking remittance details, and invoice series prefix SB-INV-."
  },
  {
    id: "log-2",
    timestamp: "2026-10-01T11:30:00Z",
    action: "USER_CREATED",
    entityType: "User",
    entityId: "usr-acct1",
    performedBy: "Admin Manager",
    role: "Admin",
    description: "Created credentials for Accountant Ananya Deshmukh (ananya.accounts@sb.in)."
  },
  {
    id: "log-3",
    timestamp: "2026-10-01T11:45:00Z",
    action: "USER_CREATED",
    entityType: "User",
    entityId: "usr-staff1",
    performedBy: "Admin Manager",
    role: "Admin",
    description: "Created credentials for Staff User Rohan Verma (rohan@sb.in)."
  },
  {
    id: "log-4",
    timestamp: "2026-10-02T14:20:00Z",
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: "SB-INV-1001",
    performedBy: "Rohan Verma",
    role: "User",
    description: "Generated Tax Invoice SB-INV-1001 for Nexus Infotech Solutions LLP for ₹56,935.00."
  },
  {
    id: "log-5",
    timestamp: "2026-10-08T16:05:00Z",
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: "SB-INV-1002",
    performedBy: "Priya Sharma",
    role: "User",
    description: "Generated Tax Invoice SB-INV-1002 for Zenith Retail & Hospitality Group for ₹31,565.00."
  },
  {
    id: "log-6",
    timestamp: "2026-10-10T11:22:00Z",
    action: "PAYMENT_RECORDED",
    entityType: "Payment",
    entityId: "SB-REC-1001",
    performedBy: "Ananya Deshmukh",
    role: "Accountant",
    description: "Reconciled full payment of ₹56,935.00 for Invoice SB-INV-1001 via UPI (Ref: UPI-8492049102)."
  },
  {
    id: "log-7",
    timestamp: "2026-10-12T17:40:00Z",
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: "SB-INV-1003",
    performedBy: "Rohan Verma",
    role: "User",
    description: "Generated Tax Invoice SB-INV-1003 for Vanguard Event Management for ₹15,340.00."
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: "qt-1001",
    quotationNumber: "SB-QT-1001",
    date: "2026-10-10",
    validUntil: "2026-11-10",
    client: {
      name: "Nexus Infotech Solutions LLP",
      gstin: "29AABCN1234L1Z2",
      email: "billing@nexusinfotech.com",
      phone: "+91 98765 43210",
      address: "Tower B, Cyber Park, Electronic City, Bengaluru",
      state: "Karnataka",
      stateCode: "29"
    },
    service: "Custom Software Development",
    items: [
      {
        id: "item-1",
        serviceId: "srv-1",
        description: "Custom Software Development - Phase 2 Cloud Sync",
        hsnSac: "998314",
        qty: 1,
        rate: 65000,
        gstRate: 18,
        amount: 65000
      }
    ],
    subtotal: 65000,
    taxAmount: 11700,
    grandTotal: 76700,
    amount: 76700,
    status: "Approved",
    notes: "Includes 60 days warranty and SLA support. Valid for 30 days.",
    createdBy: "Rohan Verma",
    convertedInvoiceId: null
  },
  {
    id: "qt-1002",
    quotationNumber: "SB-QT-1002",
    date: "2026-10-12",
    validUntil: "2026-11-12",
    client: {
      name: "Zenith Retail & Hospitality Group",
      gstin: "29BBBCZ5678K1Z9",
      email: "finance@zenithgroup.in",
      phone: "+91 99887 76655",
      address: "12th Floor, Prestige Trade Towers, Palace Road, Bengaluru",
      state: "Karnataka",
      stateCode: "29"
    },
    service: "Smart RFID Keycards & Dual-Frequency Tags",
    items: [
      {
        id: "item-1",
        serviceId: "srv-4",
        description: "Smart RFID Keycards & Dual-Frequency NFC Tags",
        hsnSac: "852352",
        qty: 500,
        rate: 85,
        gstRate: 18,
        amount: 42500
      }
    ],
    subtotal: 42500,
    taxAmount: 7650,
    grandTotal: 50150,
    amount: 50150,
    status: "Sent",
    notes: "Lead time 5-7 business days from PO. Samples verified.",
    createdBy: "Priya Sharma",
    convertedInvoiceId: null
  },
  {
    id: "qt-1003",
    quotationNumber: "SB-QT-1003",
    date: "2026-10-13",
    validUntil: "2026-11-13",
    client: {
      name: "Vanguard Event Management",
      gstin: "29CCCCV9101J1Z3",
      email: "accounts@vanguardevents.com",
      phone: "+91 91234 56789",
      address: "4th Block, Koramangala, Bengaluru",
      state: "Karnataka",
      stateCode: "29"
    },
    service: "Industrial Laser Engraved Plates",
    items: [
      {
        id: "item-1",
        serviceId: "srv-3",
        description: "Industrial Laser Engraved Stainless Steel Nameplates",
        hsnSac: "831000",
        qty: 150,
        rate: 350,
        gstRate: 18,
        amount: 52500
      }
    ],
    subtotal: 52500,
    taxAmount: 9450,
    grandTotal: 61950,
    amount: 61950,
    status: "Pending Approval",
    notes: "Material grade 304 SS with 3M adhesive backing.",
    createdBy: "Rohan Verma",
    convertedInvoiceId: null
  },
  {
    id: "qt-1004",
    quotationNumber: "SB-QT-1004",
    date: "2026-10-08",
    validUntil: "2026-11-08",
    client: {
      name: "Horizon Cloud Networks",
      gstin: "29DDDDH1212P1Z4",
      email: "contact@horizoncloud.in",
      phone: "+91 98450 11223",
      address: "Tech Park, Whitefield, Bengaluru",
      state: "Karnataka",
      stateCode: "29"
    },
    service: "Annual Maintenance Retainer",
    items: [
      {
        id: "item-1",
        serviceId: "srv-2",
        description: "Server Maintenance & SLA Retainer",
        hsnSac: "998314",
        qty: 1,
        rate: 24000,
        gstRate: 18,
        amount: 24000
      }
    ],
    subtotal: 24000,
    taxAmount: 4320,
    grandTotal: 28320,
    amount: 28320,
    status: "Converted",
    notes: "Monthly service SLA with 4-hour response time.",
    createdBy: "Rohan Verma",
    convertedInvoiceId: "inv-demo-1"
  },
  {
    id: "qt-1005",
    quotationNumber: "SB-QT-1005",
    date: "2026-10-14",
    validUntil: "2026-11-14",
    client: {
      name: "Aura Design Studios",
      gstin: "29EEEEA9876M1Z8",
      email: "hello@auradesign.com",
      phone: "+91 97400 99887",
      address: "100ft Road, Indiranagar, Bengaluru",
      state: "Karnataka",
      stateCode: "29"
    },
    service: "Visual Identity & Branding Package",
    items: [
      {
        id: "item-1",
        serviceId: "srv-2",
        description: "Corporate Visual Identity Guidelines",
        hsnSac: "998314",
        qty: 1,
        rate: 30000,
        gstRate: 18,
        amount: 30000
      }
    ],
    subtotal: 30000,
    taxAmount: 5400,
    grandTotal: 35400,
    amount: 35400,
    status: "Draft",
    notes: "Includes vector brand kit, typography system, stationery.",
    createdBy: "Priya Sharma",
    convertedInvoiceId: null
  }
];
