const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'resale_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password_here',
});

const migrate = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Clear and recreate roles with new hierarchy
    await client.query('DELETE FROM users WHERE role_id IS NOT NULL');
    await client.query('DELETE FROM roles');
    
    await client.query(`
      INSERT INTO roles (name, description) VALUES 
        ('owner', 'System owner - full access'),
        ('admin', 'Administrator - nearly full access'),
        ('manager', 'Manager - manage team and units'),
        ('supervisor', 'Supervisor - supervise team members'),
        ('employee', 'Employee - add and manage own units')
      ON CONFLICT (name) DO NOTHING
    `);

    // Teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Add team_id to users
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL
    `);

    // Team transfers log
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_transfers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        from_team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        to_team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        transferred_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        transfer_option VARCHAR(50) NOT NULL,
        units_affected INTEGER DEFAULT 0,
        affected_units JSONB,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Geographical lists
    await client.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, country_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, city_id)
      )
    `);

    // Projects, phases, unit types
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, developer_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS phases (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(name, project_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS unit_types_list (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Update units table
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_code VARCHAR(50) UNIQUE
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS phase_id INTEGER REFERENCES phases(id) ON DELETE SET NULL
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS address TEXT
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS floor VARCHAR(50)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS garden_area DECIMAL(10,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS terrace_area DECIMAL(10,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS external_area DECIMAL(10,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS total_price DECIMAL(15,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS required_offer DECIMAL(15,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS installment_amount DECIMAL(15,2)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS number_of_installments INTEGER
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_code_auto VARCHAR(50)
    `);
    await client.query(`
      ALTER TABLE units ADD COLUMN IF NOT EXISTS added_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);

    // Update existing units to have added_by_user_id
    await client.query(`
      UPDATE units SET added_by_user_id = created_by WHERE added_by_user_id IS NULL
    `);

    // Unit visibility requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS unit_visibility_requests (
        id SERIAL PRIMARY KEY,
        unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
        requested_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'pending',
        request_type VARCHAR(50) DEFAULT 'full_data',
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        responded_at TIMESTAMPTZ,
        UNIQUE(unit_id, requested_by)
      )
    `);

    // Unit comments
    await client.query(`
      CREATE TABLE IF NOT EXISTS unit_comments (
        id SERIAL PRIMARY KEY,
        unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Unit media
    await client.query(`
      CREATE TABLE IF NOT EXISTS unit_media (
        id SERIAL PRIMARY KEY,
        unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(20) NOT NULL,
        file_name VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Audit logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        entity_name VARCHAR(255),
        old_values JSONB,
        new_values JSONB,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Update notifications
    await client.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE
    `);

    // Add indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_units_unit_code ON units(unit_code);
      CREATE INDEX IF NOT EXISTS idx_units_added_by ON units(added_by_user_id);
      CREATE INDEX IF NOT EXISTS idx_units_country ON units(country_id);
      CREATE INDEX IF NOT EXISTS idx_units_city ON units(city_id);
      CREATE INDEX IF NOT EXISTS idx_units_area ON units(area_id);
      CREATE INDEX IF NOT EXISTS idx_units_project ON units(project_id);
      CREATE INDEX IF NOT EXISTS idx_visibility_requests_unit ON unit_visibility_requests(unit_id);
      CREATE INDEX IF NOT EXISTS idx_visibility_requests_requester ON unit_visibility_requests(requested_by);
      CREATE INDEX IF NOT EXISTS idx_visibility_requests_status ON unit_visibility_requests(status);
      CREATE INDEX IF NOT EXISTS idx_team_transfers_user ON team_transfers(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    `);

    await client.query('COMMIT');
    console.log('IREA migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();