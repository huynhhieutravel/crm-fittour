-- Migration: Create op_tour_bookings table for Relational Bookings
-- Date: 2026-04-08

CREATE TABLE IF NOT EXISTS op_tour_bookings (
  id VARCHAR(100) PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES op_tours(id) ON DELETE CASCADE,
  customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
  
  name VARCHAR(255),
  phone VARCHAR(50),
  cmnd VARCHAR(50),
  
  qty INT DEFAULT 0,
  base_price NUMERIC DEFAULT 0,
  surcharge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  
  status VARCHAR(50) DEFAULT 'Giữ chỗ',
  
  raw_details JSONB DEFAULT '{}'::jsonb,
  
  created_by INT,
  created_by_name VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_op_tour_bookings_tour_id ON op_tour_bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_op_tour_bookings_customer_id ON op_tour_bookings(customer_id);
