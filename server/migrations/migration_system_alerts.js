require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          alert_type VARCHAR(50) NOT NULL, 
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          related_id INTEGER, 
          related_link VARCHAR(255),
          is_resolved BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_system_alerts_user_id ON system_alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(is_resolved);
    `);
    console.log("Migration system_alerts created successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
