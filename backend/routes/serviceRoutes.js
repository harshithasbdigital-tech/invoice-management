import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/services
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY created_at ASC');
    const formatted = result.rows.map(s => ({
      id: s.id,
      name: s.name,
      hsnSac: s.hsn_sac,
      description: s.description,
      rate: parseFloat(s.rate),
      unit: s.unit,
      gstRate: parseFloat(s.gst_rate)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/services
router.post('/', async (req, res) => {
  try {
    const s = req.body;
    const id = s.id || `srv-${Date.now()}`;

    await query(`
      INSERT INTO services (id, name, hsn_sac, description, rate, unit, gst_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        hsn_sac = VALUES(hsn_sac),
        description = VALUES(description),
        rate = VALUES(rate),
        unit = VALUES(unit),
        gst_rate = VALUES(gst_rate)
    `, [id, s.name, s.hsnSac || '', s.description || '', s.rate || 0, s.unit || 'Item', s.gstRate || 18]);

    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM services WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
