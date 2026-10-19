import express from 'express';
import { query } from '../db/db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No user account found with this email.' });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password entered.' });
    }

    // Return user without password
    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, avatar, password, created_at FROM users ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/users (Admin creates staff or accountant)
router.post('/users', async (req, res) => {
  try {
    const { name, email, role, password, avatar } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Name, email, role, and password are required.' });
    }

    const id = `usr-${Date.now()}`;
    const initials = avatar || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    await query(
      'INSERT INTO users (id, name, email, role, avatar, password) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email.trim(), role, initials, password]
    );

    const check = await query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [id]);
    res.status(201).json(check.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
