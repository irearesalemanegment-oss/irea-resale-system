const bcrypt = require('bcryptjs');
const db = require('./pool');

const seedAdmin = async () => {
  try {
    // Check if admin user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    
    if (existing.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Get admin role
    const roleResult = await db.query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = roleResult.rows[0]?.id;

    if (!adminRoleId) {
      console.error('Admin role not found');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create admin user
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role_id, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      ['admin@example.com', passwordHash, 'System Administrator', '01000000000', adminRoleId]
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
};

seedAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
