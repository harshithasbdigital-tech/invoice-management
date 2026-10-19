import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let mysql = null;
try {
  const mysqlModule = await import('mysql2/promise');
  mysql = mysqlModule.default || mysqlModule;
} catch (err) {
  console.warn('\n⚠️  [Hostinger MySQL] Notice: "mysql2" package is not installed in backend/node_modules.');
  console.warn('👉 To connect to MySQL, run: npm install mysql2 (in backend folder)\n');
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to build MySQL Connection Pool for Hostinger
function createPool() {
  if (!mysql) {
    return null;
  }
  const isSslEnabled = process.env.DB_SSL === 'true';

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'invoices_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: '+00:00',
    ...(isSslEnabled ? { ssl: { rejectUnauthorized: false } } : {})
  };

  return mysql.createPool(config);
}

export const pool = createPool();

/**
 * Universal query function compatible with both PostgreSQL & MySQL parameter conventions.
 * Converts '$1, $2' and '::jsonb' to standard MySQL '?' placeholders and returns { rows }.
 */
export async function query(sqlText, params = []) {
  if (!pool) {
    console.warn('[Hostinger MySQL] Query skipped: Database pool is not initialized (install mysql2).');
    return { rows: [], affectedRows: 0, insertId: 0, raw: [] };
  }
  // Convert $1, $2, $3 to ? placeholders and strip postgres cast syntax like ::jsonb / ::json
  let normalizedSql = sqlText
    .replace(/\$[0-9]+::jsonb/gi, '?')
    .replace(/\$[0-9]+::json/gi, '?')
    .replace(/\$[0-9]+/g, '?');

  // Convert array parameters (if any) or object parameters
  const [rows, fields] = await pool.query(normalizedSql, params);

  // Return structure matching { rows: [...] } for full backward compatibility
  return {
    rows: Array.isArray(rows) ? rows : [],
    affectedRows: rows?.affectedRows || 0,
    insertId: rows?.insertId || 0,
    raw: rows,
    fields
  };
}

// Initialize Tables and Initial Seeds in Hostinger MySQL
export async function initDatabase() {
  if (!pool) {
    console.warn('\n[Hostinger MySQL] Skipped DB initialization: "mysql2" is not installed.');
    console.warn('👉 Run "npm install mysql2" in the backend directory to enable MySQL.\n');
    return;
  }
  try {
    console.log('[Hostinger MySQL] Connecting to database...');
    console.log(`[Hostinger MySQL] Host: ${process.env.DB_HOST || 'localhost'}, Database: ${process.env.DB_NAME || 'invoices_db'}`);

    // Test connection
    const connection = await pool.getConnection();
    console.log('[Hostinger MySQL] Connection established successfully.');
    connection.release();

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[Hostinger MySQL] Schema verified & tables ready.');
    }

    // Seed default Company if empty
    const [compCheck] = await pool.query('SELECT COUNT(*) AS count FROM company_settings');
    if (compCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO company_settings (id, name, tagline, address_line1, address_line2, city, state, state_code, pincode, phone, email, website, gstin, pan, logo_url)
        VALUES (
          'primary_company', 'SB', 'High Precision Print Works & Digital Tech Solutions',
          'Plot No. 42, 3rd Floor, Tech Park Road', 'HSR Layout Sector 2, Bengaluru',
          'Bengaluru', 'Karnataka', '29', '560102', '+91 98765 43210', 'billing@sb.in',
          'www.sb.in', '29ABMCS2397E1ZU', 'ABMCS2397E', '/logo.png'
        )
      `);
      console.log('[Hostinger MySQL] Seeded default company SB.');
    }

    // Seed default Bank if empty
    const [bankCheck] = await pool.query('SELECT COUNT(*) AS count FROM bank_details');
    if (bankCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO bank_details (id, account_holder, bank_name, account_number, ifsc_code, branch, account_type, upi_id)
        VALUES (
          'primary_bank', 'SB', 'HDFC Bank', '50200088994432', 'HDFC0001234',
          'HSR Layout Sector 2, Bengaluru', 'Current Account', 'sb@okhdfcbank'
        )
      `);
      console.log('[Hostinger MySQL] Seeded bank details for SB.');
    }

    // Seed default Settings if empty
    const [setCheck] = await pool.query('SELECT COUNT(*) AS count FROM invoice_settings');
    if (setCheck[0].count === 0) {
      const terms = JSON.stringify([
        "1. Payment is due within 15 days of invoice date.",
        "2. Interest @ 18% per annum will be charged on late payments.",
        "3. All payments should be made in favour of SB.",
        "4. Goods/Services once delivered or rendered are not refundable.",
        "5. Subject to Bengaluru jurisdiction only."
      ]);
      await pool.query(`
        INSERT INTO invoice_settings (id, prefix, starting_number, current_number, default_tax_type, default_gst_rate, terms_and_conditions, authorized_signatory_name, designation)
        VALUES (
          'primary_settings', 'SB-INV-', 1001, 1004, 'intra', 18.00,
          ?, 'Harshitha M.', 'Authorized Signatory'
        )
      `, [terms]);
      console.log('[Hostinger MySQL] Seeded invoice numbering settings.');
    }

    // Seed default Users if empty
    const [userCheck] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (userCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO users (id, name, email, role, avatar, password) VALUES
        ('usr-admin', 'Admin Manager', 'admin@sb.in', 'Admin', 'AM', 'admin'),
        ('usr-acct1', 'Ananya Deshmukh', 'ananya.accounts@sb.in', 'Accountant', 'AD', 'acct123'),
        ('usr-staff1', 'Rohan Verma', 'rohan@sb.in', 'User', 'RV', 'user123'),
        ('usr-staff2', 'Priya Sharma', 'priya@sb.in', 'User', 'PS', 'user123')
      `);
      console.log('[Hostinger MySQL] Seeded initial users (Admin, Accountant, Staff).');
    }

    // Seed default Services if empty
    const [srvCheck] = await pool.query('SELECT COUNT(*) AS count FROM services');
    if (srvCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO services (id, name, hsn_sac, description, rate, unit, gst_rate) VALUES
        ('srv-1', 'Custom Software Development', '998314', 'Full stack web & mobile application architecture', 45000, 'Milestone', 18),
        ('srv-2', 'Social Media Marketing & Management', '998363', 'Monthly retainer: Content creation & ads', 18000, 'Month', 18),
        ('srv-3', 'Precision Laser Engraving', '998813', 'Industrial grade acrylic & metal custom laser engraving', 350, 'Piece', 18),
        ('srv-4', 'Corporate RFID ID Card Printing', '998912', 'HD PVC thermal transfer smart identity card printing', 65, 'Card', 18),
        ('srv-5', 'Cloud Infrastructure Setup & Maintenance', '998315', 'AWS / Google Cloud container setup & backups', 15000, 'Service', 18)
      `);
      console.log('[Hostinger MySQL] Seeded services catalog.');
    }

    // Seed default Clients if empty
    const [cliCheck] = await pool.query('SELECT COUNT(*) AS count FROM clients');
    if (cliCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO clients (id, name, contact_person, phone, email, address, city, state, state_code, gstin, credit_days, notes) VALUES
        ('cli-1', 'Nexus Infotech Solutions LLP', 'Kavita Rao', '+91 91234 56789', 'accounts@nexusinfo.com', 'Tower B, 4th Floor, Electronic City Phase 1', 'Bengaluru', 'Karnataka', '29', '29AAACN1234E1Z1', 15, 'Enterprise software client.'),
        ('cli-2', 'Zenith Retail & Hospitality Group', 'Arjun Nair', '+91 99887 76655', 'finance@zenithgroup.in', '14/A Marine Drive, Nariman Point', 'Mumbai', 'Maharashtra', '27', '27AAACZ5678K1Z9', 30, 'Inter-state marketing retainer.'),
        ('cli-3', 'Vanguard Event Management', 'Divya Krishnan', '+91 94455 66778', 'divya@vanguardevents.co', 'No. 88, Brigade Road, Ashok Nagar', 'Bengaluru', 'Karnataka', '29', '29AACCV9876Q1Z3', 15, 'Event ID badge partner.')
      `);
      console.log('[Hostinger MySQL] Seeded clients directory.');
    }

    // Seed default Invoices if empty
    const [invCheck] = await pool.query('SELECT COUNT(*) AS count FROM invoices');
    if (invCheck[0].count === 0) {
      const client1 = JSON.stringify({ name: 'Nexus Infotech Solutions LLP', city: 'Bengaluru', state: 'Karnataka', stateCode: '29', gstin: '29AAACN1234E1Z1' });
      const items1 = JSON.stringify([{ description: 'Custom Software Development', hsnSac: '998314', qty: 1, rate: 45000, total: 53100 }]);

      const client2 = JSON.stringify({ name: 'Zenith Retail & Hospitality Group', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', gstin: '27AAACZ5678K1Z9' });
      const items2 = JSON.stringify([{ description: 'Social Media Retainer', hsnSac: '998363', qty: 1, rate: 18000, total: 21240 }]);

      const client3 = JSON.stringify({ name: 'Vanguard Event Management', city: 'Bengaluru', state: 'Karnataka', stateCode: '29', gstin: '29AACCV9876Q1Z3' });
      const items3 = JSON.stringify([{ description: 'RFID ID Card Printing', hsnSac: '998912', qty: 200, rate: 65, total: 15340 }]);

      await pool.query(`
        INSERT INTO invoices (
          id, invoice_number, invoice_date, due_date, created_by, status, paid_date, payment_mode,
          client_data, tax_type, items_data, subtotal, cgst_total, sgst_total, igst_total,
          round_off, grand_total, amount_in_words, notes
        ) VALUES 
        (
          'inv-1001', 'SB-INV-1001', '2026-10-02', '2026-10-17', 'Rohan Verma', 'Paid', '2026-10-10', 'UPI / Net Banking',
          ?, 'intra', ?, 48250, 4342.50, 4342.50, 0, 0, 56935,
          'Rupees Fifty Six Thousand Nine Hundred Thirty Five Only', 'Thank you for partnering with SB.'
        ),
        (
          'inv-1002', 'SB-INV-1002', '2026-10-08', '2026-10-23', 'Priya Sharma', 'Unpaid', NULL, NULL,
          ?, 'inter', ?, 26750, 0, 0, 4815, 0, 31565,
          'Rupees Thirty One Thousand Five Hundred Sixty Five Only', 'Inter-state supply to Maharashtra.'
        ),
        (
          'inv-1003', 'SB-INV-1003', '2026-10-12', '2026-10-27', 'Rohan Verma', 'Unpaid', NULL, NULL,
          ?, 'intra', ?, 13000, 1170, 1170, 0, 0, 15340,
          'Rupees Fifteen Thousand Three Hundred Forty Only', 'Delivered with lanyards.'
        )
      `, [client1, items1, client2, items2, client3, items3]);
      console.log('[Hostinger MySQL] Seeded initial invoices.');
    }

    // Seed default Payment if empty
    const [payCheck] = await pool.query('SELECT COUNT(*) AS count FROM payments');
    if (payCheck[0].count === 0) {
      await pool.query(`
        INSERT INTO payments (id, receipt_number, invoice_id, invoice_number, client_name, amount, payment_mode, transaction_ref, payment_date, recorded_by, notes)
        VALUES (
          'pay-101', 'SB-REC-1001', 'inv-1001', 'SB-INV-1001', 'Nexus Infotech Solutions LLP',
          56935, 'UPI / Net Banking', 'UPI-8492049102', '2026-10-10', 'Ananya Deshmukh',
          'Full settlement verified in HDFC Current A/C'
        )
      `);
      console.log('[Hostinger MySQL] Seeded payments log.');
    }

    console.log('[Hostinger MySQL] Database ready and operational.');
  } catch (error) {
    console.error('[Hostinger MySQL] Connection warning: Could not connect to Hostinger MySQL database.');
    console.error('[Hostinger MySQL] Details:', error.message);
    console.log('[Hostinger MySQL] Tip: Ensure credentials in backend/.env are correct and Hostinger Remote MySQL is enabled.');
  }
}
