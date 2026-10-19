import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/payments
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments ORDER BY payment_date DESC, created_at DESC');
    const formatted = result.rows.map(p => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      invoiceId: p.invoice_id,
      invoiceNumber: p.invoice_number,
      clientName: p.client_name,
      amount: parseFloat(p.amount),
      paymentMode: p.payment_mode,
      transactionRef: p.transaction_ref,
      date: p.payment_date,
      recordedBy: p.recorded_by,
      notes: p.notes
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments (Record payment and mark invoice as Paid)
router.post('/', async (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `pay-${Date.now()}`;
    const receiptNumber = p.receiptNumber || `SB-REC-${Date.now().toString().slice(-4)}`;

    // 1. Insert payment record
    await query(`
      INSERT INTO payments (id, receipt_number, invoice_id, invoice_number, client_name, amount, payment_mode, transaction_ref, payment_date, recorded_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, receiptNumber, p.invoiceId || null, p.invoiceNumber, p.clientName,
      p.amount, p.paymentMode, p.transactionRef || '', p.date || new Date(),
      p.recordedBy || 'Accountant', p.notes || ''
    ]);

    // 2. Mark invoice as Paid
    if (p.invoiceId) {
      await query(`
        UPDATE invoices 
        SET status = 'Paid', paid_date = ?, payment_mode = ?, updated_at = NOW() 
        WHERE id = ?
      `, [p.date || new Date(), p.paymentMode, p.invoiceId]);
    } else if (p.invoiceNumber) {
      await query(`
        UPDATE invoices 
        SET status = 'Paid', paid_date = ?, payment_mode = ?, updated_at = NOW() 
        WHERE invoice_number = ?
      `, [p.date || new Date(), p.paymentMode, p.invoiceNumber]);
    }

    // 3. Record audit log
    await query(`
      INSERT INTO audit_logs (id, timestamp, action, entity_type, entity_id, performed_by, role, description)
      VALUES (?, NOW(), 'PAYMENT_RECORDED', 'Payment', ?, ?, 'Accountant', ?)
    `, [
      `log-${Date.now()}`,
      receiptNumber,
      p.recordedBy || 'Accountant',
      `Reconciled payment of ₹${p.amount} for ${p.invoiceNumber} via ${p.paymentMode}.`
    ]);

    res.status(201).json({ success: true, id, receiptNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
