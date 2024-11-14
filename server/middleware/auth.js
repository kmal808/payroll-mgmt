import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { pool } from '../db.js'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const checkPermission =
  (requiredPermission) => async (req, res, next) => {
    try {
      const result = await pool.query(
        `
      SELECT EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        JOIN users u ON u.role = rp.role
        WHERE u.id = $1 AND p.name = $2
      ) as has_permission
    `,
        [req.user.id, requiredPermission]
      )

      if (result.rows[0].has_permission) {
        next()
      } else {
        res.status(403).json({ error: 'Insufficient permissions' })
      }
    } catch (err) {
      console.error('Permission check error:', err)
      res.status(500).json({ error: 'Failed to verify permissions' })
    }
  }
