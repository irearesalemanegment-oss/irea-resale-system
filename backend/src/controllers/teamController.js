const db = require('../database/pool');

const getAllTeams = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, 
        creator.full_name as created_by_name,
        COUNT(u.id) as member_count
      FROM teams t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users u ON u.team_id = t.id
      GROUP BY t.id, creator.full_name
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, req.user.id]
    );
    res.status(201).json({ message: 'Team created successfully', team: result.rows[0] });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE teams SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [name, description, id]
    );
    res.json({ message: 'Team updated successfully', team: result.rows[0] });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
};

const transferEmployee = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { user_id, to_team_id, transfer_option, notes } = req.body;
    
    await client.query('BEGIN');
    
    // Get current team
    const userResult = await client.query(
      'SELECT team_id, full_name FROM users WHERE id = $1',
      [user_id]
    );
    const from_team_id = userResult.rows[0]?.team_id;
    
    // Update user team
    await client.query('UPDATE users SET team_id = $1 WHERE id = $2', [to_team_id, user_id]);
    
    let unitsAffected = 0;
    let affectedUnits = [];
    
    if (transfer_option === 'transfer_with_units') {
      const unitsResult = await client.query(
        'SELECT id, unit_code, unit_number FROM units WHERE added_by_user_id = $1',
        [user_id]
      );
      unitsAffected = unitsResult.rows.length;
      affectedUnits = unitsResult.rows;
    }
    
    // Log transfer
    await client.query(
      `INSERT INTO team_transfers (user_id, from_team_id, to_team_id, transferred_by, transfer_option, units_affected, affected_units, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user_id, from_team_id, to_team_id, req.user.id, transfer_option, unitsAffected, JSON.stringify(affectedUnits), notes]
    );
    
    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, details, new_values)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user.id,
        req.user.full_name || req.user.email,
        req.user.role_name,
        'transfer_employee',
        'user',
        user_id,
        `Transferred ${userResult.rows[0]?.full_name} from team ${from_team_id} to team ${to_team_id}. Option: ${transfer_option}, Units affected: ${unitsAffected}`,
        JSON.stringify({ to_team_id, transfer_option, unitsAffected })
      ]
    );
    
    await client.query('COMMIT');
    res.json({ 
      message: 'Employee transferred successfully',
      units_affected: unitsAffected
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Failed to transfer employee' });
  } finally {
    client.release();
  }
};

const getTransferLogs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT tt.*, 
        u.full_name as employee_name,
        t1.name as from_team_name,
        t2.name as to_team_name,
        trans.full_name as transferred_by_name
      FROM team_transfers tt
      LEFT JOIN users u ON tt.user_id = u.id
      LEFT JOIN teams t1 ON tt.from_team_id = t1.id
      LEFT JOIN teams t2 ON tt.to_team_id = t2.id
      LEFT JOIN users trans ON tt.transferred_by = trans.id
      ORDER BY tt.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transfer logs error:', error);
    res.status(500).json({ error: 'Failed to fetch transfer logs' });
  }
};

module.exports = { getAllTeams, createTeam, updateTeam, transferEmployee, getTransferLogs };
