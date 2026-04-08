// server/migrations/migration_vouchers.js
const db = require('../db');

async function migrate_vouchers() {
  const query = `
    CREATE TABLE IF NOT EXISTS payment_vouchers (
      id SERIAL PRIMARY KEY,
      voucher_code VARCHAR(100) UNIQUE,
      tour_id INT REFERENCES op_tours(id) ON DELETE CASCADE,
      booking_id VARCHAR(100) REFERENCES op_tour_bookings(id) ON DELETE CASCADE,
      
      title VARCHAR(255),
      amount NUMERIC DEFAULT 0,
      payment_method VARCHAR(50),
      payer_name VARCHAR(255),
      payer_phone VARCHAR(50),
      
      status VARCHAR(50) DEFAULT 'Đã duyệt',
      notes TEXT,
      
      created_by INT,
      created_by_name VARCHAR(100),
      
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_vouchers_booking ON payment_vouchers(booking_id);
    CREATE INDEX IF NOT EXISTS idx_vouchers_tour ON payment_vouchers(tour_id);
  `;
  try {
    await db.query(query);
    console.log("Migration successful: payment_vouchers table created.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate_vouchers();
