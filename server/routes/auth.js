import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { z } from 'zod'
import { config } from '../config.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Test endpoint to check DB connection
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users')
    res.json({
      message: 'Database connection successful',
      userCount: result.rows[0].count,
    })
  } catch (err) {
    console.error('Database test error:', err)
    res
      .status(500)
      .json({ error: 'Database connection failed', details: err.message })
  }
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body) // Debug log
    const { email, password } = loginSchema.parse(req.body)

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
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
    console.error('Login error:', err) // Debug log
    next(err)
  }
})

router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    )

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [
      req.user.id,
    ])

    const user = result.rows[0]

    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      newHashedPassword,
      req.user.id,
    ])

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
