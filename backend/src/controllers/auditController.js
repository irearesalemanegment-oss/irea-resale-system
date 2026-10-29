const db = require('../database/pool');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, user_id } = req.query;
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];
    let paramIndex = 0;

    if (action) {
      params.push(action);
      query += ` AND action = $${++paramIndex}`;
    }
    if (user_id) {
      params.push(user_id);
      query += ` AND user_id = $${++paramIndex}`;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    params.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${++paramIndex}`;
    params.push(offset);
    query += ` OFFSET $${++paramIndex}`;

    const result = await db.query(query, params);
    res.json({
      logs: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = { getAuditLogs };
