const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'resale_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password_here',
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Developers table (dropdown managed by admins/managers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS developers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Compounds table (dropdown managed by admins/managers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS compounds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
        location TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Units table (main entity)
    await client.query(`
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        unit_number VARCHAR(100) NOT NULL,
        developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
        compound_id INTEGER REFERENCES compounds(id) ON DELETE SET NULL,
        unit_type VARCHAR(100),
        offering_type VARCHAR(100),
        land_area DECIMAL(10,2),
        bua DECIMAL(10,2),
        description TEXT,
        price DECIMAL(15,2),
        state VARCHAR(100),
        materials TEXT,
        material_link TEXT,
        owner_name VARCHAR(255),
        owner_phone VARCHAR(20),
        owner_email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'available',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_units_developer ON units(developer_id);
      CREATE INDEX IF NOT EXISTS idx_units_compound ON units(compound_id);
      CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
      CREATE INDEX IF NOT EXISTS idx_units_unit_number ON units(unit_number);
      CREATE INDEX IF NOT EXISTS idx_units_owner_phone ON units(owner_phone);
      CREATE INDEX IF NOT EXISTS idx_compounds_developer ON compounds(developer_id);
    `);


    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        type VARCHAR(50) DEFAULT 'in_app',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create index for notifications
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    `);
    // Insert default roles
    await client.query(`
      INSERT INTO roles (name, description) VALUES 
        ('admin', 'Full system access including user management'),
        ('manager', 'Can manage units, developers, compounds, and view all data'),
        ('agent', 'Can add/edit units and view assigned data')
      ON CONFLICT (name) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
