const db = require('../database/pool');

// Countries
const getCountries = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM countries WHERE is_active = TRUE ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

const createCountry = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await db.query(
      'INSERT INTO countries (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create country' });
  }
};

// Cities
const getCities = async (req, res) => {
  try {
    const { country_id } = req.query;
    let query = 'SELECT c.*, co.name as country_name FROM cities c LEFT JOIN countries co ON c.country_id = co.id WHERE c.is_active = TRUE';
    const params = [];
    if (country_id) {
      params.push(country_id);
      query += ` AND c.country_id = $1`;
    }
    query += ' ORDER BY c.name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
};

const createCity = async (req, res) => {
  try {
    const { name, country_id } = req.body;
    const result = await db.query(
      'INSERT INTO cities (name, country_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, country_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create city' });
  }
};

// Areas
const getAreas = async (req, res) => {
  try {
    const { city_id } = req.query;
    let query = 'SELECT a.*, ci.name as city_name FROM areas a LEFT JOIN cities ci ON a.city_id = ci.id WHERE a.is_active = TRUE';
    const params = [];
    if (city_id) {
      params.push(city_id);
      query += ` AND a.city_id = $1`;
    }
    query += ' ORDER BY a.name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
};

const createArea = async (req, res) => {
  try {
    const { name, city_id } = req.body;
    const result = await db.query(
      'INSERT INTO areas (name, city_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, city_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create area' });
  }
};

// Projects
const getProjects = async (req, res) => {
  try {
    const { developer_id } = req.query;
    let query = 'SELECT p.*, d.name as developer_name FROM projects p LEFT JOIN developers d ON p.developer_id = d.id WHERE p.is_active = TRUE';
    const params = [];
    if (developer_id) {
      params.push(developer_id);
      query += ` AND p.developer_id = $1`;
    }
    query += ' ORDER BY p.name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, developer_id } = req.body;
    const result = await db.query(
      'INSERT INTO projects (name, developer_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, developer_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Phases
const getPhases = async (req, res) => {
  try {
    const { project_id } = req.query;
    let query = 'SELECT ph.*, p.name as project_name FROM phases ph LEFT JOIN projects p ON ph.project_id = p.id WHERE ph.is_active = TRUE';
    const params = [];
    if (project_id) {
      params.push(project_id);
      query += ` AND ph.project_id = $1`;
    }
    query += ' ORDER BY ph.name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch phases' });
  }
};

const createPhase = async (req, res) => {
  try {
    const { name, project_id } = req.body;
    const result = await db.query(
      'INSERT INTO phases (name, project_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, project_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create phase' });
  }
};

// Unit Types
const getUnitTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM unit_types_list WHERE is_active = TRUE ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unit types' });
  }
};

const createUnitType = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await db.query(
      'INSERT INTO unit_types_list (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create unit type' });
  }
};

module.exports = {
  getCountries, createCountry,
  getCities, createCity,
  getAreas, createArea,
  getProjects, createProject,
  getPhases, createPhase,
  getUnitTypes, createUnitType
};
