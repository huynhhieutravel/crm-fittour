-- Migration: Add drive_link column to ALL supplier tables
-- This column stores Google Drive link for each supplier's documents/contracts
-- Date: 2026-05-08

ALTER TABLE hotels ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE transports ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE airlines ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE landtours ADD COLUMN IF NOT EXISTS drive_link TEXT;
ALTER TABLE insurances ADD COLUMN IF NOT EXISTS drive_link TEXT;
