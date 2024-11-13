import { pool } from '../db.js'

async function initDb() {
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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

      -- Create default admin user if it doesn't exist
      INSERT INTO users (email, password_hash, name)
      SELECT 
        'admin@example.com',
        '$2a$10$zPzOPaOxEZKwRz1PHrY1aOYrQWFBJ.ACkGyXv5ILYwkvdXA.iDqPi',
        'Admin User'
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@example.com'
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
