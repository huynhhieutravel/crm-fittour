/**
 * Migration: Create travel_support_services table + add op_id column
 * Date: 2026-04-19
 * Purpose: Tạo bảng Travel Support (nếu chưa có) và thêm cột NHÂN SỰ ĐIỀU HÀNH (op_id)
 */
const db = require('../db');

async function up() {
  try {
    // Step 1: Create table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS travel_support_services (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES users(id),
        service_type VARCHAR(100),
        group_name VARCHAR(255) DEFAULT '',
        service_name VARCHAR(500),
        usage_date DATE,
        departure_date DATE,
        return_date DATE,
        route VARCHAR(255) DEFAULT '',
        quantity NUMERIC(10,2) DEFAULT 0,
        unit_cost NUMERIC(15,2) DEFAULT 0,
        total_cost NUMERIC(15,2) DEFAULT 0,
        unit_price NUMERIC(15,2) DEFAULT 0,
        total_income NUMERIC(15,2) DEFAULT 0,
        collected_amount NUMERIC(15,2) DEFAULT 0,
        tax NUMERIC(15,2) DEFAULT 0,
        profit NUMERIC(15,2) DEFAULT 0,
        notes TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table travel_support_services created (or already exists)');

    // Step 2: Add op_id column if not exists
    const check = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'travel_support_services' AND column_name = 'op_id'
    `);
    
    if (check.rows.length > 0) {
      console.log('✅ Column op_id already exists — skipping.');
    } else {
      await db.query(`
        ALTER TABLE travel_support_services 
        ADD COLUMN op_id INTEGER REFERENCES users(id)
      `);
      console.log('✅ Added op_id column to travel_support_services');
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up };
