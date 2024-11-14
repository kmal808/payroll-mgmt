import { pool } from '../db.js'
import bcrypt from 'bcryptjs'

async function initDb() {
  const client = await pool.connect()

  try {
    await client.query(`
      -- Roles enum type
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'user');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Users table with role
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
      );

      -- Permissions table
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );

      -- Role permissions junction table
      CREATE TABLE IF NOT EXISTS role_permissions (
        role user_role NOT NULL,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role, permission_id)
      );

      -- Insert default permissions
      INSERT INTO permissions (id, name, description) VALUES
        (gen_random_uuid(), 'manage_users', 'Can create and manage users'),
        (gen_random_uuid(), 'manage_roles', 'Can assign roles to users'),
        (gen_random_uuid(), 'view_reports', 'Can view payroll reports'),
        (gen_random_uuid(), 'manage_payroll', 'Can create and edit payroll entries'),
        (gen_random_uuid(), 'upload_files', 'Can upload and manage files'),
        (gen_random_uuid(), 'manage_tasks', 'Can create and manage tasks')
      ON CONFLICT (name) DO NOTHING;

      -- Assign permissions to roles
      INSERT INTO role_permissions (role, permission_id)
      SELECT 'admin', id FROM permissions
      ON CONFLICT DO NOTHING;

      INSERT INTO role_permissions (role, permission_id)
      SELECT 'supervisor', id FROM permissions 
      WHERE name IN ('view_reports', 'manage_payroll', 'upload_files', 'manage_tasks')
      ON CONFLICT DO NOTHING;

      INSERT INTO role_permissions (role, permission_id)
      SELECT 'user', id FROM permissions 
      WHERE name IN ('upload_files', 'manage_tasks')
      ON CONFLICT DO NOTHING;

      -- Create default admin user if it doesn't exist
      INSERT INTO users (email, password_hash, name, role)
      SELECT 
        'admin@example.com',
        '${await bcrypt.hash('admin123', 10)}',
        'Admin User',
        'admin'
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@example.com'
      );

      -- Rest of the tables...
      CREATE TABLE IF NOT EXISTS payroll_weeks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        week_ending DATE NOT NULL,
        manager_signature VARCHAR(255),
        signature_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS crews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        payroll_week_id UUID REFERENCES payroll_weeks(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS crew_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        crew_id UUID REFERENCES crews(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS daily_pay (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
        day_of_week VARCHAR(3) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        UNIQUE(crew_member_id, day_of_week)
      );

      CREATE TABLE IF NOT EXISTS reimbursements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL
      );
    `)

    console.log('Database initialized successfully')
  } catch (err) {
    console.error('Error initializing database:', err)
    throw err
  } finally {
    client.release()
  }
}

initDb().catch(console.error)
