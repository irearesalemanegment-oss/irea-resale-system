const db = require('../database/pool');

const requestVisibility = async (req, res) => {
  try {
    const { unit_id, reason } = req.body;
    const requester_id = req.user.id;

    // Check if request already exists
    const existing = await db.query(
      'SELECT * FROM unit_visibility_requests WHERE unit_id = $1 AND requester_id = $2',
      [unit_id, requester_id]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'pending') {
        return res.status(400).json({ error: 'Request already pending' });
      }
      if (existing.rows[0].status === 'approved') {
        return res.status(400).json({ error: 'Already approved' });
      }
    }

    const result = await db.query(
      `INSERT INTO unit_visibility_requests (unit_id, requested_by, reason)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [unit_id, requester_id, reason]
    );

    res.status(201).json({ message: 'Request sent successfully', request: result.rows[0] });
  } catch (error) {
    console.error('Request visibility error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT vr.*, 
        u.unit_code, u.unit_number, u.owner_name,
        requester.full_name as requester_name,
        requester.role_id,
        r.name as requester_role
      FROM unit_visibility_requests vr
      LEFT JOIN units u ON vr.unit_id = u.id
      LEFT JOIN users requester ON vr.requested_by = requester.id
      LEFT JOIN roles r ON requester.role_id = r.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE unit_visibility_requests 
       SET status = 'approved', approved_by = $1, responded_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, id]
    );
    res.json({ message: 'Request approved', request: result.rows[0] });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE unit_visibility_requests 
       SET status = 'rejected', approved_by = $1, responded_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, id]
    );
    res.json({ message: 'Request rejected', request: result.rows[0] });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

const checkAccess = async (req, res) => {
  try {
    const { unit_id } = req.params;
    const result = await db.query(
      `SELECT * FROM unit_visibility_requests 
       WHERE unit_id = $1 AND requested_by = $2`,
      [unit_id, req.user.id]
    );
    res.json({ hasRequest: result.rows.length > 0, request: result.rows[0] || null });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
};

module.exports = { requestVisibility, getPendingRequests, approveRequest, rejectRequest, checkAccess };
