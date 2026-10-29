const db = require('../database/pool');

const getAllCompounds = async (req, res) => {
  try {
    const { developer_id, is_active } = req.query;
    let query = `
      SELECT c.*, d.name as developer_name 
      FROM compounds c
      LEFT JOIN developers d ON c.developer_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (developer_id) {
      params.push(developer_id);
      query += ` AND c.developer_id = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND c.is_active = $${params.length}`;
    }

    query += ' ORDER BY c.name ASC';

    const result = await db.query(query, params);
    res.json({ compounds: result.rows });
  } catch (error) {
    console.error('Get compounds error:', error);
    res.status(500).json({ error: 'Failed to fetch compounds' });
  }
};

const getCompoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT c.*, d.name as developer_name 
       FROM compounds c
       LEFT JOIN developers d ON c.developer_id = d.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    res.json({ compound: result.rows[0] });
  } catch (error) {
    console.error('Get compound error:', error);
    res.status(500).json({ error: 'Failed to fetch compound' });
  }
};

const createCompound = async (req, res) => {
  try {
    const { name, developer_id, location, is_active } = req.body;
    
    // Verify developer exists
    const devCheck = await db.query('SELECT id FROM developers WHERE id = $1', [developer_id]);
    if (devCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Developer not found' });
    }

    const result = await db.query(
      `INSERT INTO compounds (name, developer_id, location, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, developer_id, location, is_active !== false, req.user.id]
    );

    res.status(201).json({ 
      message: 'Compound created successfully',
      compound: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Compound name already exists' });
    }
    console.error('Create compound error:', error);
    res.status(500).json({ error: 'Failed to create compound' });
  }
};

const updateCompound = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, developer_id, location, is_active } = req.body;

    // Verify developer exists if provided
    if (developer_id) {
      const devCheck = await db.query('SELECT id FROM developers WHERE id = $1', [developer_id]);
      if (devCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Developer not found' });
      }
    }

    const result = await db.query(
      `UPDATE compounds 
       SET name = COALESCE($1, name),
           developer_id = COALESCE($2, developer_id),
           location = COALESCE($3, location),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, developer_id, location, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    res.json({ 
      message: 'Compound updated successfully',
      compound: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Compound name already exists' });
    }
    console.error('Update compound error:', error);
    res.status(500).json({ error: 'Failed to update compound' });
  }
};

const deleteCompound = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if compound is used in units
    const unitsCheck = await db.query('SELECT id FROM units WHERE compound_id = $1 LIMIT 1', [id]);

    if (unitsCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete compound. It is referenced by units.' 
      });
    }

    const result = await db.query('DELETE FROM compounds WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    res.json({ message: 'Compound deleted successfully' });
  } catch (error) {
    console.error('Delete compound error:', error);
    res.status(500).json({ error: 'Failed to delete compound' });
  }
};

module.exports = { 
  getAllCompounds, 
  getCompoundById, 
  createCompound, 
  updateCompound, 
  deleteCompound 
};