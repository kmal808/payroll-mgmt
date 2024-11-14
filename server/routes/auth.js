import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { config } from '../config.js'
import { z } from 'zod'

const router = express.Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

// Debug endpoint to test database connection
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users')
    const adminResult = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      ['admin@example.com']
    )

    res.json({
      message: 'Database connection successful',
      userCount: result.rows[0].count,
      adminExists: adminResult.rows.length > 0,
      adminUser: adminResult.rows[0],
    })
  } catch (err) {
    console.error('Database test error:', err)
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
    })
  }
})

// Debug endpoint to test login process
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    const user = result.rows[0]
    const userFound = !!user
    let passwordValid = false

    if (user) {
      passwordValid = await bcrypt.compare(password, user.password_hash)
    }

    res.json({
      userFound,
      passwordValid,
      storedHash: user?.password_hash,
    })
  } catch (err) {
    console.error('Login test error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Reset admin password endpoint
router.post('/reset-admin', async (req, res) => {
  try {
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, name',
      [hashedPassword, 'admin@example.com']
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' })
    }

    res.json({
      message: 'Admin password reset successfully',
      credentials: {
        email: 'admin@example.com',
        password: password,
      },
    })
  } catch (err) {
    console.error('Reset admin error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      // unique_violation
      return res.status(409).json({ error: 'Email already exists' })
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Get user from token
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, config.jwtSecret)

    // Get user from database
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [
      decoded.id,
    ])

    const user = result.rows[0]
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    )
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      user.id,
    ])

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

export default router
