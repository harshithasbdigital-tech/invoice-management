import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/settings/company
router.get('/company', async (req, res) => {
  try {
    const result = await query('SELECT * FROM company_settings WHERE id = ?', ['primary_company']);
    if (result.rows.length === 0) return res.json({});
    const r = result.rows[0];
    res.json({
      name: r.name,
      tagline: r.tagline,
      addressLine1: r.address_line1,
      addressLine2: r.address_line2,
      city: r.city,
      state: r.state,
      stateCode: r.state_code,
      pincode: r.pincode,
      phone: r.phone,
      email: r.email,
      website: r.website,
      gstin: r.gstin,
      pan: r.pan,
      logoUrl: r.logo_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/company
router.put('/company', async (req, res) => {
  try {
    const c = req.body;
    await query(`
      INSERT INTO company_settings (id, name, tagline, address_line1, address_line2, city, state, state_code, pincode, phone, email, website, gstin, pan, logo_url, updated_at)
      VALUES ('primary_company', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        tagline = VALUES(tagline),
        address_line1 = VALUES(address_line1),
        address_line2 = VALUES(address_line2),
        city = VALUES(city),
        state = VALUES(state),
        state_code = VALUES(state_code),
        pincode = VALUES(pincode),
        phone = VALUES(phone),
        email = VALUES(email),
        website = VALUES(website),
        gstin = VALUES(gstin),
        pan = VALUES(pan),
        logo_url = VALUES(logo_url),
        updated_at = NOW()
    `, [
      c.name, c.tagline || '', c.addressLine1 || '', c.addressLine2 || '',
      c.city || '', c.state || '', c.stateCode || '', c.pincode || '',
      c.phone || '', c.email || '', c.website || '', c.gstin || '', c.pan || '',
      c.logoUrl || '/logo.png'
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/settings/bank
router.get('/bank', async (req, res) => {
  try {
    const result = await query('SELECT * FROM bank_details WHERE id = ?', ['primary_bank']);
    if (result.rows.length === 0) return res.json({});
    const r = result.rows[0];
    res.json({
      accountHolder: r.account_holder,
      bankName: r.bank_name,
      accountNumber: r.account_number,
      ifscCode: r.ifsc_code,
      branch: r.branch,
      accountType: r.account_type,
      upiId: r.upi_id,
      qrImage: r.qr_image
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/bank
router.put('/bank', async (req, res) => {
  try {
    const b = req.body;
    await query(`
      INSERT INTO bank_details (id, account_holder, bank_name, account_number, ifsc_code, branch, account_type, upi_id, qr_image, updated_at)
      VALUES ('primary_bank', ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        account_holder = VALUES(account_holder),
        bank_name = VALUES(bank_name),
        account_number = VALUES(account_number),
        ifsc_code = VALUES(ifsc_code),
        branch = VALUES(branch),
        account_type = VALUES(account_type),
        upi_id = VALUES(upi_id),
        qr_image = VALUES(qr_image),
        updated_at = NOW()
    `, [
      b.accountHolder, b.bankName, b.accountNumber, b.ifscCode,
      b.branch || '', b.accountType || 'Current Account', b.upiId || '', b.qrImage || null
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/settings/invoices
router.get('/invoices', async (req, res) => {
  try {
    const result = await query('SELECT * FROM invoice_settings WHERE id = ?', ['primary_settings']);
    if (result.rows.length === 0) return res.json({});
    const r = result.rows[0];
    
    let parsedTerms = [];
    if (r.terms_and_conditions) {
      parsedTerms = typeof r.terms_and_conditions === 'string'
        ? JSON.parse(r.terms_and_conditions)
        : r.terms_and_conditions;
    }

    res.json({
      prefix: r.prefix,
      startingNumber: r.starting_number,
      currentNumber: r.current_number,
      defaultTaxType: r.default_tax_type,
      defaultGstRate: parseFloat(r.default_gst_rate),
      termsAndConditions: parsedTerms,
      authorizedSignatoryName: r.authorized_signatory_name,
      designation: r.designation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings/invoices
router.put('/invoices', async (req, res) => {
  try {
    const s = req.body;
    await query(`
      INSERT INTO invoice_settings (id, prefix, starting_number, current_number, default_tax_type, default_gst_rate, terms_and_conditions, authorized_signatory_name, designation, updated_at)
      VALUES ('primary_settings', ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        prefix = VALUES(prefix),
        starting_number = VALUES(starting_number),
        current_number = VALUES(current_number),
        default_tax_type = VALUES(default_tax_type),
        default_gst_rate = VALUES(default_gst_rate),
        terms_and_conditions = VALUES(terms_and_conditions),
        authorized_signatory_name = VALUES(authorized_signatory_name),
        designation = VALUES(designation),
        updated_at = NOW()
    `, [
      s.prefix || 'SB-INV-', s.startingNumber || 1001, s.currentNumber || 1004,
      s.defaultTaxType || 'intra', s.defaultGstRate || 18,
      JSON.stringify(s.termsAndConditions || []), s.authorizedSignatoryName || '', s.designation || ''
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
