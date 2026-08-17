-- Migration: Add zalo_uid to leads and customers tables
ALTER TABLE leads ADD COLUMN IF NOT EXISTS zalo_uid VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zalo_uid VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_leads_zalo_uid ON leads(zalo_uid);
CREATE INDEX IF NOT EXISTS idx_customers_zalo_uid ON customers(zalo_uid);
