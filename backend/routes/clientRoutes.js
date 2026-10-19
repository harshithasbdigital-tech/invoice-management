import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients ORDER BY name ASC');
    const formatted = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person,
      phone: r.phone,
      email: r.email,
      address: r.address,
      city: r.city,
      state: r.state,
      stateCode: r.state_code,
      gstin: r.gstin,
      creditDays: r.credit_days,
      notes: r.notes
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const c = req.body;
    const id = c.id || `cli-${Date.now()}`;

    await query(`
      INSERT INTO clients (id, name, contact_person, phone, email, address, city, state, state_code, gstin, credit_days, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        contact_person = VALUES(contact_person),
        phone = VALUES(phone),
        email = VALUES(email),
        address = VALUES(address),
        city = VALUES(city),
        state = VALUES(state),
        state_code = VALUES(state_code),
        gstin = VALUES(gstin),
        credit_days = VALUES(credit_days),
        notes = VALUES(notes)
    `, [
      id, c.name, c.contactPerson || '', c.phone || '', c.email || '',
      c.address || '', c.city || 'Bengaluru', c.state || 'Karnataka',
      c.stateCode || '29', c.gstin || '', c.creditDays || 15, c.notes || ''
    ]);

    res.status(201).json({ success: true, id, name: c.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
