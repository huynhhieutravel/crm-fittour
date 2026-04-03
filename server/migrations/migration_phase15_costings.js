require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING TOUR COSTING SCHEMA MIGRATION ===');
  
  try {
    await db.query(`
        CREATE TABLE IF NOT EXISTS tour_costings (
            id SERIAL PRIMARY KEY,
            tour_departure_id INTEGER NOT NULL REFERENCES tour_departures(id) ON DELETE CASCADE,
            total_revenue NUMERIC(15, 2) DEFAULT 0,
            total_estimated_cost NUMERIC(15, 2) DEFAULT 0,
            total_actual_cost NUMERIC(15, 2) DEFAULT 0,
            total_deposit NUMERIC(15, 2) DEFAULT 0,
            costs JSONB DEFAULT '[]'::jsonb,
            status VARCHAR(50) DEFAULT 'Draft',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tour_departure_id)
        );
    `);
    console.log('✔ Table tour_costings verified/created.');

    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_tour_costings_departure_id 
        ON tour_costings(tour_departure_id);
    `);
    console.log('✔ Index idx_tour_costings_departure_id verified.');

    // We also need to add these fields to schema.sql
    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
