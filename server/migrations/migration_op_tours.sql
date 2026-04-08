-- Migration: Create op_tours table on VPS production
-- Date: 2026-04-07
-- SAFE: Only CREATE TABLE IF NOT EXISTS, no data insertion

CREATE TABLE IF NOT EXISTS op_tours (
  id SERIAL PRIMARY KEY,
  tour_code VARCHAR(100),
  tour_name VARCHAR(500),
  start_date DATE,
  end_date DATE,
  market VARCHAR(200),
  status VARCHAR(50) DEFAULT 'Sắp chạy',
  
  total_revenue NUMERIC DEFAULT 0,
  actual_revenue NUMERIC DEFAULT 0,
  total_expense NUMERIC DEFAULT 0,
  actual_expense NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  
  tour_info JSONB DEFAULT '{}'::jsonb,
  revenues JSONB DEFAULT '[]'::jsonb,
  expenses JSONB DEFAULT '[]'::jsonb,
  guides JSONB DEFAULT '[]'::jsonb,
  itinerary TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
