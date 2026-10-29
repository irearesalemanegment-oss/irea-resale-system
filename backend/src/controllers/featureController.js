const db = require('../database/pool');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `unit-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    const ok = allowed.test(path.extname(file.originalname)) || allowed.test(file.mimetype);
    cb(null, ok);
  },
});

// Upload images for a unit
const uploadUnitImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Verify unit exists
    const unitCheck = await db.query('SELECT id FROM units WHERE id = $1', [id]);
    if (unitCheck.rows.length === 0) {
      // Clean up uploaded files
      files.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Check if this is the first image (make it primary)
    const existing = await db.query('SELECT COUNT(*) FROM unit_images WHERE unit_id = $1', [id]);
    const isFirst = parseInt(existing.rows[0].count) === 0;

    const saved = [];
    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      const result = await db.query(
        `INSERT INTO unit_images (unit_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *`,
        [id, imageUrl, isFirst && saved.length === 0]
      );
      saved.push(result.rows[0]);
    }

    res.status(201).json({ message: 'Images uploaded', images: saved });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

// Get images for a unit
const getUnitImages = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM unit_images WHERE unit_id = $1 ORDER BY is_primary DESC, created_at ASC`,
      [id]
    );
    res.json({ images: result.rows });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

// Delete an image
const deleteUnitImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM unit_images WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const image = result.rows[0];
    // Delete file
    const filePath = path.join(__dirname, '..', image.image_url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await db.query('DELETE FROM unit_images WHERE id = $1', [id]);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};

// Request phone access for a unit
const requestPhoneAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    // Verify unit exists
    const unitCheck = await db.query('SELECT id FROM units WHERE id = $1', [id]);
    if (unitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Check existing request
    const existing = await db.query(
      `SELECT * FROM phone_access_requests WHERE unit_id = $1 AND requester_id = $2`,
      [id, requesterId]
    );

    if (existing.rows.length > 0) {
      const reqRow = existing.rows[0];
      if (reqRow.status === 'pending') {
        return res.status(400).json({ error: 'Request already pending' });
      }
      if (reqRow.status === 'approved') {
        return res.status(400).json({ error: 'Phone access already approved' });
      }
      // Rejected - allow re-request (update to pending)
      await db.query(
        `UPDATE phone_access_requests SET status = 'pending', approved_by = NULL, approved_at = NULL, created_at = NOW() WHERE id = $1`,
        [reqRow.id]
      );
      return res.status(201).json({ message: 'Phone access request submitted' });
    }

    await db.query(
      `INSERT INTO phone_access_requests (unit_id, requester_id, status) VALUES ($1, $2, 'pending')`,
      [id, requesterId]
    );

    // Notify admins and managers
    const admins = await db.query(
      `SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('admin', 'manager')`
    );
    const unit = await db.query('SELECT unit_number FROM units WHERE id = $1', [id]);
    const unitNumber = unit.rows[0]?.unit_number || id;
    for (const admin of admins.rows) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
        [admin.id, 'Phone Access Request', `Agent requested phone access for unit ${unitNumber}`, 'in_app']
      );
    }

    res.status(201).json({ message: 'Phone access request submitted' });
  } catch (error) {
    console.error('Request phone access error:', error);
    res.status(500).json({ error: 'Failed to request phone access' });
  }
};

// Get phone access requests (admin/manager)
const getPhoneAccessRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT par.*, 
        u.full_name as requester_name,
        u.email as requester_email,
        un.unit_number,
        un.owner_name,
        un.owner_phone
      FROM phone_access_requests par
      JOIN users u ON par.requester_id = u.id
      JOIN units un ON par.unit_id = un.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND par.status = $1`;
    }
    query += ` ORDER BY par.created_at DESC`;
    const result = await db.query(query, params);
    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Get phone requests error:', error);
    res.status(500).json({ error: 'Failed to fetch phone requests' });
  }
};

// Approve phone access
const approvePhoneAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE phone_access_requests SET status = 'approved', approved_by = $1, approved_at = NOW() WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    const request = result.rows[0];

    // Notify requester
    const unit = await db.query('SELECT unit_number FROM units WHERE id = $1', [request.unit_id]);
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
      [request.requester_id, 'Phone Access Approved', `Your request for unit ${unit.rows[0]?.unit_number || request.unit_id} was approved. You can now view the owner phone number.`, 'in_app']
    );

    res.json({ message: 'Phone access approved', request: result.rows[0] });
  } catch (error) {
    console.error('Approve phone access error:', error);
    res.status(500).json({ error: 'Failed to approve phone access' });
  }
};

// Reject phone access
const rejectPhoneAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE phone_access_requests SET status = 'rejected', approved_by = $1, approved_at = NOW() WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }
    const request = result.rows[0];

    // Notify requester
    const unit = await db.query('SELECT unit_number FROM units WHERE id = $1', [request.unit_id]);
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
      [request.requester_id, 'Phone Access Rejected', `Your request for unit ${unit.rows[0]?.unit_number || request.unit_id} was rejected.`, 'in_app']
    );

    res.json({ message: 'Phone access rejected', request: result.rows[0] });
  } catch (error) {
    console.error('Reject phone access error:', error);
    res.status(500).json({ error: 'Failed to reject phone access' });
  }
};

// Check if current user has approved access to a unit's phone
const hasPhoneAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM phone_access_requests WHERE unit_id = $1 AND requester_id = $2 AND status = 'approved'`,
      [id, req.user.id]
    );
    res.json({ hasAccess: result.rows.length > 0 });
  } catch (error) {
    console.error('Check phone access error:', error);
    res.status(500).json({ error: 'Failed to check phone access' });
  }
};

module.exports = {
  upload,
  uploadUnitImages,
  getUnitImages,
  deleteUnitImage,
  requestPhoneAccess,
  getPhoneAccessRequests,
  approvePhoneAccess,
  rejectPhoneAccess,
  hasPhoneAccess,
};
