const db = require('../database/pool');

const getAllDevelopers = async (req, res) => {
  try {
    const { is_active } = req.query;
    let query = 'SELECT * FROM developers WHERE 1=1';
    const params = [];

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY name ASC';

    const result = await db.query(query, params);
    res.json({ developers: result.rows });
  } catch (error) {
    console.error('Get developers error:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
};

const getDeveloperById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM developers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({ developer: result.rows[0] });
  } catch (error) {
    console.error('Get developer error:', error);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
};

const createDeveloper = async (req, res) => {
  try {
    const { name, is_active } = req.body;
    
    const result = await db.query(
      `INSERT INTO developers (name, is_active, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, is_active !== false, req.user.id]
    );

    res.status(201).json({ 
      message: 'Developer created successfully',
      developer: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Developer name already exists' });
    }
    console.error('Create developer error:', error);
    res.status(500).json({ error: 'Failed to create developer' });
  }
};

const updateDeveloper = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const result = await db.query(
      `UPDATE developers 
       SET name = COALESCE($1, name), 
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({ 
      message: 'Developer updated successfully',
      developer: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Developer name already exists' });
    }
    console.error('Update developer error:', error);
    res.status(500).json({ error: 'Failed to update developer' });
  }
};

const deleteDeveloper = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if developer is used in compounds or units
    const compoundsCheck = await db.query('SELECT id FROM compounds WHERE developer_id = $1 LIMIT 1', [id]);
    const unitsCheck = await db.query('SELECT id FROM units WHERE developer_id = $1 LIMIT 1', [id]);

    if (compoundsCheck.rows.length > 0 || unitsCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete developer. It is referenced by compounds or units.' 
      });
    }

    const result = await db.query('DELETE FROM developers WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    console.error('Delete developer error:', error);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
};

module.exports = { 
  getAllDevelopers, 
  getDeveloperById, 
  createDeveloper, 
  updateDeveloper, 
  deleteDeveloper 
};