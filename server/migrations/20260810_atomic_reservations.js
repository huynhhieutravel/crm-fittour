const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  console.log('🔄 Đang khởi chạy Kế hoạch nâng cấp Cấu trúc CSDL Bản Atomic Reservations V2...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('1. Bổ sung các cột mới cho bảng bookings...');
    await client.query(`
      ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
      ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS reservation_id UUID UNIQUE;
      ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE;
      ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS request_hash VARCHAR(255);
    `);

    console.log('1.5. Cập nhật lại View bookings...');
    await client.query(`
      CREATE OR REPLACE VIEW bookings AS
      SELECT id, booking_code, customer_id, tour_id, start_date, pax_count, total_price, payment_status, booking_status, notes, created_at, tour_departure_id, is_group, group_name, room_info, updated_at, pax_details, service_details, discount, is_new_customer, new_customer_info, raw_details, created_by, created_by_name, surcharge, base_price, paid, name_norm, is_deleted,
      expires_at, reservation_id, idempotency_key, request_hash
      FROM bookings_raw
      WHERE (COALESCE(is_deleted, false) = false);
    `);

    console.log('2. Bỏ qua việc Migrate trạng thái cũ (tuân thủ Data Modification Guardrails)...');
    // We do NOT update historical bookings status to English Enum to preserve history.

    // Tạo Index để tăng tốc độ truy vấn inventory
    console.log('4. Tạo Index cho Inventory Query...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_departure_inventory 
      ON bookings_raw(tour_departure_id, booking_status, expires_at);
    `);

    await client.query('COMMIT');
    console.log('✅ Chuyển đổi thành công!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi migration, đã rollback:', err);
  } finally {
    client.release();
    pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
