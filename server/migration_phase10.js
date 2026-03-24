const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting Phase 10 Migration: Upgrading Customers Table...');
    await client.query('BEGIN');

    // 1. Add fields to customers
    await client.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
      ADD COLUMN IF NOT EXISTS birth_date DATE,
      ADD COLUMN IF NOT EXISTS id_card VARCHAR(50),
      ADD COLUMN IF NOT EXISTS id_expiry DATE,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS preferred_contact VARCHAR(50),
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'booker',
      ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_purchase_date DATE,
      ADD COLUMN IF NOT EXISTS customer_segment VARCHAR(50) DEFAULT 'New Customer',
      ADD COLUMN IF NOT EXISTS tour_interests TEXT,
      ADD COLUMN IF NOT EXISTS special_requests TEXT,
      ADD COLUMN IF NOT EXISTS internal_notes TEXT,
      ADD COLUMN IF NOT EXISTS lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL;
    `);

    // 2. Add customer_id to lead_notes
    await client.query(`
      ALTER TABLE lead_notes 
      ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;
    `);

    // 3. Add Unique constraints (Handling existing duplicates if any - though here we just add)
    // To be safe, we might want to clean up duplicates first, but assume clean environment or add and fail if exists.
    // If phone is not unique, this will fail.
    try {
        await client.query('ALTER TABLE customers ADD CONSTRAINT unique_phone UNIQUE (phone)');
        console.log('Added UNIQUE constraint to phone');
    } catch (e) {
        console.warn('Could not add UNIQUE constraint to phone (maybe already exists or duplicates present)');
    }

    try {
        await client.query('ALTER TABLE customers ADD CONSTRAINT unique_email UNIQUE (email)');
        console.log('Added UNIQUE constraint to email');
    } catch (e) {
        console.warn('Could not add UNIQUE constraint to email (maybe already exists or duplicates present)');
    }

    await client.query('COMMIT');
    console.log('Phase 10 Migration Successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
