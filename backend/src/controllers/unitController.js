const db = require('../database/pool');
const { logAudit } = require('../utils/auditLog');

// Generate unique unit code
const generateUnitCode = async () => {
  const result = await db.query('SELECT COUNT(*) FROM units');
  const count = parseInt(result.rows[0].count) + 1;
  return `IREA-${String(count).padStart(6, '0')}`;
};

// Check visibility access
const hasVisibilityAccess = async (userId, unitId, userRole, addedBy) => {
  // Owner and Admin see everything
  if (userRole === 'owner' || userRole === 'admin') return true;
  // Employee sees only their own units
  if (userRole === 'employee') return addedBy === userId;
  // Manager/Supervisor need approval for others' units
  if (userRole === 'manager' || userRole === 'supervisor') {
    if (addedBy === userId) return true;
    const result = await db.query(
      `SELECT * FROM unit_visibility_requests WHERE unit_id = $1 AND requested_by = $2 AND status = 'approved'`,
      [unitId, userId]
    );
    return result.rows.length > 0;
  }
  return false;
};

const getAllUnits = async (req, res) => {
  try {
    const {
      developer_id, compound_id, project_id, country_id, city_id, area_id,
      unit_type, payment_type, status, min_price, max_price, search,
      added_by, team_id, page = 1, limit = 20, show_all = 'true'
    } = req.query;

    const role = req.user.role_name;
    const isPrivileged = role === 'owner' || role === 'admin';

    let query = `
      SELECT u.*, 
        d.name as developer_name,
        c.name as compound_name,
        p.name as project_name,
        ph.name as phase_name,
        co.name as country_name,
        ci.name as city_name,
        ar.name as area_name,
        creator.full_name as created_by_name,
        creator.id as added_by_user_id
      FROM units u
      LEFT JOIN developers d ON u.developer_id = d.id
      LEFT JOIN compounds c ON u.compound_id = c.id
      LEFT JOIN projects p ON u.project_id = p.id
      LEFT JOIN phases ph ON u.phase_id = ph.id
      LEFT JOIN countries co ON u.country_id = co.id
      LEFT JOIN cities ci ON u.city_id = ci.id
      LEFT JOIN areas ar ON u.area_id = ar.id
      LEFT JOIN users creator ON u.added_by_user_id = creator.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 0;

    // If not privileged and not showing all with hidden data, apply restrictions
    if (!isPrivileged && role === 'employee') {
      params.push(req.user.id);
      query += ` AND u.added_by_user_id = $${++paramIndex}`;
    }

    if (developer_id) { params.push(developer_id); query += ` AND u.developer_id = $${++paramIndex}`; }
    if (compound_id) { params.push(compound_id); query += ` AND u.compound_id = $${++paramIndex}`; }
    if (project_id) { params.push(project_id); query += ` AND u.project_id = $${++paramIndex}`; }
    if (country_id) { params.push(country_id); query += ` AND u.country_id = $${++paramIndex}`; }
    if (city_id) { params.push(city_id); query += ` AND u.city_id = $${++paramIndex}`; }
    if (area_id) { params.push(area_id); query += ` AND u.area_id = $${++paramIndex}`; }
    if (unit_type) { params.push(unit_type); query += ` AND u.unit_type = $${++paramIndex}`; }
    if (payment_type) { params.push(payment_type); query += ` AND u.payment_type = $${++paramIndex}`; }
    if (status) { params.push(status); query += ` AND u.status = $${++paramIndex}`; }
    if (added_by) { params.push(added_by); query += ` AND u.added_by_user_id = $${++paramIndex}`; }
    if (min_price) { params.push(min_price); query += ` AND u.total_price >= $${++paramIndex}`; }
    if (max_price) { params.push(max_price); query += ` AND u.total_price <= $${++paramIndex}`; }

    if (search) {
      params.push(`%${search}%`);
      const s = ++paramIndex;
      query += ` AND (
        u.unit_code ILIKE $${s} OR
        u.unit_number ILIKE $${s} OR
        u.unit_type ILIKE $${s} OR
        p.name ILIKE $${s} OR
        d.name ILIKE $${s}
      )`;
    }

    const countQuery = query.replace(/SELECT[\s\S]*?FROM units u/, 'SELECT COUNT(*) FROM units u');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    params.push(limit);
    query += ` ORDER BY u.created_at DESC LIMIT $${++paramIndex}`;
    params.push(offset);
    query += ` OFFSET $${++paramIndex}`;

    const result = await db.query(query, params);
    let units = result.rows;

    // Apply visibility rules
    units = await Promise.all(units.map(async (unit) => {
      const canSeeFull = await hasVisibilityAccess(req.user.id, unit.id, role, unit.added_by_user_id);
      if (!canSeeFull) {
        // Hide sensitive data
        const { owner_name, owner_phone, owner_email, owner_phones, ...rest } = unit;
        return { ...rest, data_hidden: true, needs_approval: true };
      }
      return { ...unit, data_hidden: false };
    }));

    res.json({
      units,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
};

const getPublicUnits = async (req, res) => {
  try {
    const { developer_id, project_id, unit_type, payment_type, min_price, max_price, search, page = 1, limit = 24 } = req.query;

    let query = `
      SELECT u.id, u.unit_code, u.unit_number, u.unit_type, u.payment_type,
        u.total_price, u.price, u.bua, u.land_area, u.garden_area, u.terrace_area, u.external_area,
        u.floor, u.address, u.status, u.created_at,
        d.name as developer_name,
        p.name as project_name,
        co.name as country_name,
        ci.name as city_name,
        ar.name as area_name
      FROM units u
      LEFT JOIN developers d ON u.developer_id = d.id
      LEFT JOIN projects p ON u.project_id = p.id
      LEFT JOIN countries co ON u.country_id = co.id
      LEFT JOIN cities ci ON u.city_id = ci.id
      LEFT JOIN areas ar ON u.area_id = ar.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 0;

    if (developer_id) { params.push(developer_id); query += ` AND u.developer_id = $${++paramIndex}`; }
    if (project_id) { params.push(project_id); query += ` AND u.project_id = $${++paramIndex}`; }
    if (unit_type) { params.push(unit_type); query += ` AND u.unit_type = $${++paramIndex}`; }
    if (payment_type) { params.push(payment_type); query += ` AND u.payment_type = $${++paramIndex}`; }
    if (min_price) { params.push(min_price); query += ` AND COALESCE(u.total_price, u.price) >= $${++paramIndex}`; }
    if (max_price) { params.push(max_price); query += ` AND COALESCE(u.total_price, u.price) <= $${++paramIndex}`; }
    if (search) {
      params.push(`%${search}%`);
      const s = ++paramIndex;
      query += ` AND (u.unit_code ILIKE $${s} OR u.unit_type ILIKE $${s} OR p.name ILIKE $${s} OR d.name ILIKE $${s})`;
    }

    const countQuery = query.replace(/SELECT[\s\S]*?FROM units u/, 'SELECT COUNT(*) FROM units u');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    params.push(limit);
    query += ` ORDER BY u.created_at DESC LIMIT $${++paramIndex}`;
    params.push(offset);
    query += ` OFFSET $${++paramIndex}`;

    const result = await db.query(query, params);
    res.json({
      units: result.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get public units error:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
};

const getPublicUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT u.id, u.unit_code, u.unit_number, u.unit_type, u.payment_type,
        u.total_price, u.price, u.bua, u.land_area, u.garden_area, u.terrace_area, u.external_area,
        u.floor, u.address, u.description, u.status, u.created_at,
        d.name as developer_name, d.id as developer_id,
        p.name as project_name, p.id as project_id,
        c.name as compound_name,
        co.name as country_name, ci.name as city_name, ar.name as area_name
       FROM units u
       LEFT JOIN developers d ON u.developer_id = d.id
       LEFT JOIN compounds c ON u.compound_id = c.id
       LEFT JOIN projects p ON u.project_id = p.id
       LEFT JOIN countries co ON u.country_id = co.id
       LEFT JOIN cities ci ON u.city_id = ci.id
       LEFT JOIN areas ar ON u.area_id = ar.id
       WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Unit not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get public unit error:', error);
    res.status(500).json({ error: 'Failed to fetch unit' });
  }
};

const createUnit = async (req, res) => {
  try {
    const unitCode = await generateUnitCode();
    
    const {
      unit_number, developer_id, compound_id, project_id, phase_id,
      country_id, city_id, area_id, unit_type, address, floor,
      land_area, bua, garden_area, terrace_area, external_area,
      payment_type, total_price, paid_amount, required_offer, installment_amount, number_of_installments,
      description, status, owner_name, owner_phone, owner_phones, owner_email
    } = req.body;

    const result = await db.query(
      `INSERT INTO units (
        unit_code, unit_number, developer_id, compound_id, project_id, phase_id,
        country_id, city_id, area_id, unit_type, address, floor,
        land_area, bua, garden_area, terrace_area, external_area,
        payment_type, total_price, price, paid_amount, required_offer, installment_amount, number_of_installments,
        description, status, owner_name, owner_phone, owner_phones, owner_email, 
        added_by_user_id, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
      RETURNING *`,
      [
        unitCode, unit_number, developer_id || null, compound_id || null, project_id || null, phase_id || null,
        country_id || null, city_id || null, area_id || null, unit_type, address, floor,
        land_area || null, bua || null, garden_area || null, terrace_area || null, external_area || null,
        payment_type, total_price || null, total_price || null, paid_amount || null, required_offer || null, installment_amount || null, number_of_installments || null,
        description, status || 'available', owner_name, owner_phone, JSON.stringify(owner_phones || []), owner_email,
        req.user.id, req.user.id
      ]
    );

    await logAudit(req, 'create_unit', 'unit', result.rows[0].id, unitCode, null, result.rows[0], `Created unit ${unitCode}`);
    
    res.status(201).json({ message: 'Unit created successfully', unit: result.rows[0] });
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ error: 'Failed to create unit' });
  }
};

module.exports = { 
  getAllUnits, getPublicUnits, getPublicUnitById, createUnit,
  generateUnitCode, hasVisibilityAccess
};
