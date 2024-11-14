import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import payrollRoutes from './routes/payroll.js'
import userRoutes from './routes/users.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const port = config.port

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
  next()
})

// Configure CORS
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Payroll API is running' })
})

// Routes
app.use('/auth', authRoutes)
app.use('/payroll', payrollRoutes)
app.use('/users', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

// Error handling
app.use(errorHandler)

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
})
