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

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

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

router.post('/login', async (req, res, next) => {
  try {
    console.log('Login attempt:', { email: req.body.email }) // Log email only, not password

    const { email, password } = loginSchema.parse(req.body)

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])

    console.log('User found:', result.rows.length > 0) // Log if user was found

    const user = result.rows[0]

    if (!user) {
      console.log('No user found with email:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    console.log('Password valid:', validPassword)

    if (!validPassword) {
      console.log('Invalid password for user:', email)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('Login successful for:', email)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    next(err)
  }
})

router.post('/register', async (req, res, next) => {
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
      // Unique violation
      return res.status(400).json({ error: 'Email already registered' })
    }
    next(err)
  }
})

router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    )

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [
      req.user.id,
    ])

    if (!user.rows[0]) {
      return res.status(404).json({ error: 'User not found' })
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.rows[0].password_hash
    )
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPassword,
      req.user.id,
    ])

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
})

export default router
