import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import payrollRoutes from './routes/payroll.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: '*', // Temporarily allow all origins for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Payroll API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payroll', payrollRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});