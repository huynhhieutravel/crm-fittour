/**
 * Migration: Create customer_credits and customer_credit_transactions tables
 * Support Partial Cancellation, Split Booking, and Deposit Retention (Max 12 Months)
 */
const db = require('../db');

async function up() {
  console.log('[Migration] Bắt đầu tạo bảng customer_credits và customer_credit_transactions...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_credits (
        id SERIAL PRIMARY KEY,
        credit_code VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        original_booking_id INTEGER,
        original_booking_code VARCHAR(50),
        original_tour_id INTEGER,
        original_tour_code VARCHAR(100),
        original_tour_name VARCHAR(255),
        passenger_name VARCHAR(255) NOT NULL,
        passenger_phone VARCHAR(50),
        passenger_id_card VARCHAR(50),
        credited_to_customer_id INTEGER,
        credited_to_name VARCHAR(255) NOT NULL,
        credited_to_phone VARCHAR(50),
        original_deposit NUMERIC DEFAULT 0,
        deduction_fee NUMERIC DEFAULT 0,
        retention_amount NUMERIC NOT NULL,
        remaining_balance NUMERIC NOT NULL,
        currency VARCHAR(10) DEFAULT 'VND',
        status VARCHAR(50) DEFAULT 'ACTIVE',
        retention_date DATE NOT NULL DEFAULT CURRENT_DATE,
        expiry_date DATE NOT NULL,
        validity_months INTEGER DEFAULT 12,
        notes TEXT,
        created_by INTEGER,
        created_by_name VARCHAR(255),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_customer_credits_phone ON customer_credits(credited_to_phone);
      CREATE INDEX IF NOT EXISTS idx_customer_credits_status ON customer_credits(status);
      CREATE INDEX IF NOT EXISTS idx_customer_credits_customer_id ON customer_credits(credited_to_customer_id);
      CREATE INDEX IF NOT EXISTS idx_customer_credits_orig_booking ON customer_credits(original_booking_id);

      CREATE TABLE IF NOT EXISTS customer_credit_transactions (
        id SERIAL PRIMARY KEY,
        credit_id INTEGER REFERENCES customer_credits(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL,
        balance_before NUMERIC NOT NULL,
        balance_after NUMERIC NOT NULL,
        target_booking_id INTEGER,
        target_booking_code VARCHAR(50),
        target_tour_id INTEGER,
        target_tour_name VARCHAR(255),
        notes TEXT,
        created_by INTEGER,
        created_by_name VARCHAR(255),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_credit_trans_credit_id ON customer_credit_transactions(credit_id);
      CREATE INDEX IF NOT EXISTS idx_credit_trans_target_booking ON customer_credit_transactions(target_booking_id);
    `);

    console.log('✅ [Migration] Tạo bảng customer_credits & customer_credit_transactions thành công!');
  } catch (err) {
    console.error('❌ [Migration] Lỗi tạo bảng customer_credits:', err.message);
    throw err;
  } finally {
    if (db.pool) {
      await db.pool.end();
    }
  }
}

up().catch(console.error);
