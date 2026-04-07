require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres',
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS op_tours (
        id SERIAL PRIMARY KEY,
        tour_code VARCHAR(100),
        tour_name VARCHAR(500),
        start_date DATE,
        end_date DATE,
        market VARCHAR(200),
        status VARCHAR(50) DEFAULT 'Sắp chạy',
        
        -- Calculated numeric fields for quick sorting/display
        total_revenue NUMERIC DEFAULT 0,
        actual_revenue NUMERIC DEFAULT 0,
        total_expense NUMERIC DEFAULT 0,
        actual_expense NUMERIC DEFAULT 0,
        profit NUMERIC DEFAULT 0,
        
        -- JSONB storage for rapid flat architecture
        tour_info JSONB DEFAULT '{}'::jsonb,
        revenues JSONB DEFAULT '[]'::jsonb,
        expenses JSONB DEFAULT '[]'::jsonb,
        guides JSONB DEFAULT '[]'::jsonb,
        itinerary TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add module to permissions if not exists
    await pool.query(`
      INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
      SELECT id, 'op_tours', true, true, true, true FROM roles WHERE name = 'admin'
      ON CONFLICT DO NOTHING;
    `);

    // Insert a dummy record for UI testing
    await pool.query(`
      INSERT INTO op_tours (tour_code, tour_name, start_date, end_date, market, status, tour_info, revenues, expenses)
      VALUES (
        'TOURFIT_00435', 
        'HÀNG CHÂU - Ô TRẤN - TÔ CHÂU - THƯỢNG HẢI', 
        '2026-04-04', 
        '2026-04-08', 
        'GIANG NAM, TRUNG QUỐC', 
        'Sắp chạy',
        '{"vehicle": "Hàng không", "price_adult": 25490000, "total_seats": 15, "sold": 8, "reserved": 0, "pickup_point": "SGN", "dropoff_point": "SGN"}'::jsonb,
        '[{"id": 1, "customer_name": "PHAM VU NGOC TUYEN", "phone": "0773660873", "code": "PVAY09", "staff": "Nguyễn Quỳnh Phương", "adult_qty": 1, "total": 25490000, "paid": 10000000, "debt": 15490000, "status": "Đã đặt cọc"}]'::jsonb,
        '[]'::jsonb
      )
    `);

    console.log('Successfully created op_tours table and inserted dummy data on localhost.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await pool.end();
  }
}

run();
