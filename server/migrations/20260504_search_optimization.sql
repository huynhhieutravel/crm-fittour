-- CRM Navigation Optimization Migration (Refined)
-- Date: 2026-05-04

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create Immutable Wrapper for unaccent
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text AS
$func$
SELECT public.unaccent('public.unaccent', $1)
$func$  LANGUAGE sql IMMUTABLE;

-- 3. Add Generated Columns (Normalized Names)
DO $$
BEGIN
    -- Leads
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='name_norm') THEN
        ALTER TABLE leads ADD COLUMN name_norm TEXT GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED;
    END IF;

    -- Customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='name_norm') THEN
        ALTER TABLE customers ADD COLUMN name_norm TEXT GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED;
    END IF;

    -- Tour Templates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tour_templates' AND column_name='name_norm') THEN
        ALTER TABLE tour_templates ADD COLUMN name_norm TEXT GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED;
    END IF;

    -- Customer Reviews
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_reviews' AND column_name='name_norm') THEN
        ALTER TABLE customer_reviews ADD COLUMN name_norm TEXT GENERATED ALWAYS AS (immutable_unaccent(lower(reviewer_name))) STORED;
    END IF;
    
    -- Guides
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guides' AND column_name='name_norm') THEN
        ALTER TABLE guides ADD COLUMN name_norm TEXT GENERATED ALWAYS AS (immutable_unaccent(lower(name))) STORED;
    END IF;
END $$;

-- 4. Create Indexes

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_name_norm_trgm ON leads USING gin (name_norm gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_name_norm_btree ON leads (name_norm);
CREATE INDEX IF NOT EXISTS idx_leads_phone_search ON leads (phone);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_name_norm_trgm ON customers USING gin (name_norm gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_name_norm_btree ON customers (name_norm);
CREATE INDEX IF NOT EXISTS idx_customers_phone_search ON customers (phone);

-- Tour Templates
CREATE INDEX IF NOT EXISTS idx_tour_templates_name_norm_trgm ON tour_templates USING gin (name_norm gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tour_templates_name_norm_btree ON tour_templates (name_norm);

-- Customer Reviews
CREATE INDEX IF NOT EXISTS idx_customer_reviews_name_norm_trgm ON customer_reviews USING gin (name_norm gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_name_norm_btree ON customer_reviews (name_norm);

-- Guides
CREATE INDEX IF NOT EXISTS idx_guides_name_norm_trgm ON guides USING gin (name_norm gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_guides_name_norm_btree ON guides (name_norm);
