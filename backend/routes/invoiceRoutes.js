import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/invoices
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM invoices ORDER BY invoice_date DESC, created_at DESC');
    // Transform column names to match frontend object structure
    const formatted = result.rows.map(row => {
      let client = row.client_data;
      if (typeof client === 'string') {
        try { client = JSON.parse(client); } catch { client = {}; }
      }

      let items = row.items_data;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }

      return {
        id: row.id,
        invoiceNumber: row.invoice_number,
        docType: row.doc_type || 'tax_invoice',
        invoiceDate: row.invoice_date,
        dueDate: row.due_date,
        createdBy: row.created_by,
        status: row.status,
        paidDate: row.paid_date,
        paymentMode: row.payment_mode,
        client: client || {},
        taxType: row.tax_type,
        items: items || [],
        subtotal: parseFloat(row.subtotal),
        cgstTotal: parseFloat(row.cgst_total),
        sgstTotal: parseFloat(row.sgst_total),
        igstTotal: parseFloat(row.igst_total),
        roundOff: parseFloat(row.round_off),
        grandTotal: parseFloat(row.grand_total),
        amountInWords: row.amount_in_words,
        notes: row.notes,
        cancellationReason: row.cancellation_reason
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/invoices
router.post('/', async (req, res) => {
  try {
    const inv = req.body;
    const id = inv.id || `inv-${Date.now()}`;
    const docType = inv.docType || 'tax_invoice';

    await query(`
      INSERT INTO invoices (
        id, invoice_number, doc_type, invoice_date, due_date, created_by, status, paid_date, payment_mode,
        client_data, tax_type, items_data, subtotal, cgst_total, sgst_total, igst_total,
        round_off, grand_total, amount_in_words, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      inv.invoiceNumber,
      docType,
      inv.invoiceDate,
      inv.dueDate || null,
      inv.createdBy || 'Staff',
      inv.status || 'Unpaid',
      inv.paidDate || null,
      inv.paymentMode || null,
      JSON.stringify(inv.client || {}),
      inv.taxType || 'intra',
      JSON.stringify(inv.items || []),
      inv.subtotal || 0,
      inv.cgstTotal || 0,
      inv.sgstTotal || 0,
      inv.igstTotal || 0,
      inv.roundOff || 0,
      inv.grandTotal || 0,
      inv.amountInWords || '',
      inv.notes || ''
    ]);

    // Increment current invoice number in settings
    await query(`
      UPDATE invoice_settings 
      SET current_number = current_number + 1 
      WHERE id = 'primary_settings'
    `);

    // Record audit log
    await query(`
      INSERT INTO audit_logs (id, timestamp, action, entity_type, entity_id, performed_by, role, description)
      VALUES (?, NOW(), 'INVOICE_CREATED', 'Invoice', ?, ?, 'Staff', ?)
    `, [
      `log-${Date.now()}`,
      inv.invoiceNumber,
      inv.createdBy || 'Staff',
      `Generated Tax Invoice ${inv.invoiceNumber} for ${inv.client?.name || 'Client'} (₹${inv.grandTotal}).`
    ]);

    res.status(201).json({ success: true, id, invoiceNumber: inv.invoiceNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/invoices/:id/cancel (Anti-tamper cancellation & credit note)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, performedBy } = req.body;

    const check = await query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const inv = check.rows[0];
    await query(`
      UPDATE invoices 
      SET status = 'Cancelled', cancellation_reason = ?, updated_at = NOW() 
      WHERE id = ?
    `, [reason || 'Cancelled by authorized user', id]);

    // Record audit log
    await query(`
      INSERT INTO audit_logs (id, timestamp, action, entity_type, entity_id, performed_by, role, description)
      VALUES (?, NOW(), 'INVOICE_CANCELLED', 'Invoice', ?, ?, 'Admin', ?)
    `, [
      `log-${Date.now()}`,
      inv.invoice_number,
      performedBy || 'Admin',
      `Cancelled Tax Invoice ${inv.invoice_number}. Reason: ${reason}`
    ]);

    res.json({ success: true, message: `Invoice ${inv.invoice_number} cancelled.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM invoices WHERE id = ?', [id]);
    res.json({ success: true, message: 'Invoice record removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
