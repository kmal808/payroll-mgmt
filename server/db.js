import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});