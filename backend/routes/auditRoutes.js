import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200');
    const formatted = result.rows.map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      action: a.action,
      entityType: a.entity_type,
      entityId: a.entity_id,
      performedBy: a.performed_by,
      role: a.role,
      description: a.description
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/audit-logs
router.post('/', async (req, res) => {
  try {
    const a = req.body;
    const id = a.id || `log-${Date.now()}`;
    await query(`
      INSERT INTO audit_logs (id, timestamp, action, entity_type, entity_id, performed_by, role, description)
      VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `, [id, a.action, a.entityType || 'System', a.entityId || '-', a.performedBy || 'User', a.role || 'Staff', a.description]);
    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
