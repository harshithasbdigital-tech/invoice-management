-- SB Invoices Hostinger MySQL / MariaDB Database Schema

-- 1. Users & Roles (Admin, Accountant, User/Staff)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar VARCHAR(10) DEFAULT 'US',
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Company Profile
CREATE TABLE IF NOT EXISTS company_settings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    tagline VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    state_code VARCHAR(10),
    pincode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(150),
    website VARCHAR(150),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    logo_url LONGTEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bank Remittance Details
CREATE TABLE IF NOT EXISTS bank_details (
    id VARCHAR(50) PRIMARY KEY,
    account_holder VARCHAR(150) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(50) NOT NULL,
    branch VARCHAR(150),
    account_type VARCHAR(50) DEFAULT 'Current Account',
    upi_id VARCHAR(100),
    qr_image LONGTEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Invoice Numbering & Tax Rules
CREATE TABLE IF NOT EXISTS invoice_settings (
    id VARCHAR(50) PRIMARY KEY,
    prefix VARCHAR(50) DEFAULT 'SB-INV-',
    starting_number INT DEFAULT 1001,
    current_number INT DEFAULT 1004,
    default_tax_type VARCHAR(20) DEFAULT 'intra',
    default_gst_rate DECIMAL(5,2) DEFAULT 18.00,
    terms_and_conditions JSON,
    authorized_signatory_name VARCHAR(150),
    designation VARCHAR(150),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Services & Pricing Catalog
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    hsn_sac VARCHAR(50),
    description TEXT,
    rate DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50) DEFAULT 'Item',
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Clients Directory
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    state_code VARCHAR(10),
    gstin VARCHAR(50),
    credit_days INT DEFAULT 15,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Invoices (Tax Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    created_by VARCHAR(150) NOT NULL,
    doc_type VARCHAR(50) NOT NULL DEFAULT 'tax_invoice',
    status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
    paid_date DATE,
    payment_mode VARCHAR(100),
    client_data JSON NOT NULL,
    tax_type VARCHAR(20) NOT NULL DEFAULT 'intra',
    items_data JSON NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cgst_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    sgst_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    igst_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    round_off DECIMAL(8,2) DEFAULT 0.00,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount_in_words TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Payments Tracking & Reconciliation
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_id VARCHAR(50),
    invoice_number VARCHAR(100) NOT NULL,
    client_name VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_mode VARCHAR(100) NOT NULL,
    transaction_ref VARCHAR(100),
    payment_date DATE NOT NULL,
    recorded_by VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payments_invoice (invoice_id),
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs (Anti-Tamper Chronological Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    INDEX idx_audit_logs_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
