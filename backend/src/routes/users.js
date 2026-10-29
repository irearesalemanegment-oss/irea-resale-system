const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const db = require('../database/pool');

router.get('/', authenticate, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.email, u.full_name, u.phone, u.team_id, u.is_active, u.created_at,
        r.name as role_name, r.id as role_id,
        t.name as team_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN teams t ON u.team_id = t.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/:id/role', authenticate, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const { role_id } = req.body;
    const result = await db.query('UPDATE users SET role_id = $1 WHERE id = $2 RETURNING *', [role_id, req.params.id]);
    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

router.put('/:id/team', authenticate, authorize(['owner', 'admin']), async (req, res) => {
  try {
    const { team_id } = req.body;
    const result = await db.query('UPDATE users SET team_id = $1 WHERE id = $2 RETURNING *', [team_id, req.params.id]);
    res.json({ message: 'Team updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

module.exports = router;
