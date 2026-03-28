const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Migration: Tour Enhancements ---');

    // 1. Add schedule_link to tour_templates
    console.log('Adding schedule_link to tour_templates...');
    await client.query(`
      ALTER TABLE tour_templates 
      ADD COLUMN IF NOT EXISTS schedule_link TEXT;
    `);

    // 2. Create tour_notes table
    console.log('Creating tour_notes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tour_notes (
        id SERIAL PRIMARY KEY,
        tour_id INTEGER REFERENCES tour_templates(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
