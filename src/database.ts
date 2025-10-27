/**
 * Conection to Postgres
 */

import { Pool } from "pg";
import { config } from "./config";

// Create pool for connections and handle eficiently many requests
// Support both DATABASE_URL (Railway) and individual config values (local)

console.log('🔍 Database configuration:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('  Using DATABASE_URL:', !!process.env.DATABASE_URL ? 'Yes (Railway/Production)' : 'No (Local config)');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }
    : {
        user: config.database.user,
        password: config.database.password,
        host: config.database.host,
        port: config.database.port,
        database: config.database.database
      }
);

// Create tables con start, if have not been created
export const initializeDatabase = async () => {
  try {
    // table of users, sessions, index for frecuent queries (user_id and email)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tutoring_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para queries frecuentes
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON tutoring_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
};

// Export pool so can be use in the routes
export default pool;