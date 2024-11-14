import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { pool } from '../db.js'
import { authenticateToken, checkPermission } from '../middleware/auth.js'

const router = express.Router()

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'supervisor', 'user']),
})

// Get all users (admin only)
router.get(
  '/',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `)

      res.json(result.rows)
    } catch (err) {
      console.error('Error fetching users:', err)
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  }
)

// Create new user (admin only)
router.post(
  '/',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { email, password, name, role } = userSchema.parse(req.body)

      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await pool.query(
        `
      INSERT INTO users (email, password_hash, name, role, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role
    `,
        [email, hashedPassword, name, role, req.user.id]
      )

      res.status(201).json(result.rows[0])
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input' })
      }
      if (err.code === '23505') {
        // Unique violation
        return res.status(409).json({ error: 'Email already exists' })
      }
      console.error('Error creating user:', err)
      res.status(500).json({ error: 'Failed to create user' })
    }
  }
)

// Update user role (admin only)
router.patch(
  '/:id/role',
  authenticateToken,
  checkPermission('manage_roles'),
  async (req, res) => {
    try {
      const { role } = z
        .object({ role: z.enum(['admin', 'supervisor', 'user']) })
        .parse(req.body)

      const result = await pool.query(
        `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, email, name, role
    `,
        [role, req.params.id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json(result.rows[0])
    } catch (err) {
      console.error('Error updating user role:', err)
      res.status(500).json({ error: 'Failed to update user role' })
    }
  }
)

// Delete user (admin only)
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [
        req.params.id,
      ])

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.status(204).send()
    } catch (err) {
      console.error('Error deleting user:', err)
      res.status(500).json({ error: 'Failed to delete user' })
    }
  }
)

export default router
