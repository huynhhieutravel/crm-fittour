require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING MARKETING_BUDGET_PLANS SCHEMA MIGRATION ===');
  
  try {
    // 1. Create table marketing_budget_plans
    await db.query(`
      CREATE TABLE IF NOT EXISTS marketing_budget_plans (
        id SERIAL PRIMARY KEY,
        departure_id INTEGER,
        tour_template_id INTEGER,
        departure_code VARCHAR(100) NOT NULL UNIQUE,
        tuyen VARCHAR(255) NOT NULL,
        bu_id VARCHAR(50) NOT NULL DEFAULT 'BU1',
        departure_date DATE NOT NULL,
        target_pax INTEGER NOT NULL DEFAULT 20,
        break_even_pax INTEGER NOT NULL DEFAULT 14,
        price_per_pax NUMERIC(15, 2) NOT NULL DEFAULT 0,
        cost_per_pax NUMERIC(15, 2) NOT NULL DEFAULT 0,
        cpl_target NUMERIC(15, 2) NOT NULL DEFAULT 150000,
        cr_sale NUMERIC(5, 4) NOT NULL DEFAULT 0.10,
        status_text VARCHAR(100) DEFAULT 'Đang mở bán',
        notes TEXT,
        mkt_percentage NUMERIC(5, 4) NOT NULL DEFAULT 0.01,
        approval_status VARCHAR(50) DEFAULT 'Chờ BOD duyệt',
        drive_link TEXT DEFAULT 'https://drive.google.com/',
        year INTEGER,
        quarter INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✔ Table marketing_budget_plans created or verified.');

    // 2. Indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_mbp_bu_quarter ON marketing_budget_plans (bu_id, year, quarter);
      CREATE INDEX IF NOT EXISTS idx_mbp_dep_id ON marketing_budget_plans (departure_id);
    `);
    console.log('✔ Indexes verified.');

    // 3. Auto-populate from real ERP tour_departures if they don't already exist
    console.log('🔄 Syncing real departures from ERP tour_departures...');
    const syncQuery = `
      INSERT INTO marketing_budget_plans (
        departure_id, tour_template_id, departure_code, tuyen, bu_id,
        departure_date, target_pax, break_even_pax, price_per_pax, cost_per_pax,
        cpl_target, cr_sale, status_text, mkt_percentage, approval_status, drive_link,
        year, quarter
      )
      SELECT 
        td.id as departure_id,
        td.tour_template_id,
        COALESCE(NULLIF(TRIM(td.code), ''), CONCAT('DEP-', td.id)) as departure_code,
        COALESCE(tt.name, td.code, CONCAT('Đoàn khởi hành #', td.id)) as tuyen,
        CASE
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hàn Quốc%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 'BU2'
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Pháp%' OR tt.name ILIKE '%Thụy%' OR tt.name ILIKE '%Ý%' OR tt.name ILIKE '%Úc%' OR tt.name ILIKE '%Séc%' OR tt.name ILIKE '%Áo%' THEN 'BU3'
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' OR tt.name ILIKE '%Nepal%' OR tt.name ILIKE '%Himalaya%' THEN 'BU4'
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' OR tt.name ILIKE '%Tây Á%' OR tt.name ILIKE '%Nga%' OR tt.name ILIKE '%Murmansk%' THEN 'BU5'
          WHEN tt.bu_group IN ('BU1', 'BU2', 'BU3', 'BU4', 'BU5') THEN tt.bu_group
          ELSE 'BU1'
        END as bu_id,
        td.start_date as departure_date,
        COALESCE(
          NULLIF((td.tour_info->>'total_seats')::int, 0),
          NULLIF(td.max_participants, 0),
          NULLIF(tt.max_pax, 0),
          16
        ) as target_pax,
        COALESCE(
          NULLIF(td.break_even_pax, 0),
          ROUND(COALESCE(
            NULLIF((td.tour_info->>'total_seats')::int, 0),
            NULLIF(td.max_participants, 0),
            NULLIF(tt.max_pax, 0),
            16
          ) * 0.70)
        ) as break_even_pax,
        COALESCE(
          NULLIF((td.tour_info->>'price_adult')::numeric, 0),
          NULLIF((td.tour_info->>'price_tour')::numeric, 0),
          NULLIF(td.price_adult, 0),
          NULLIF(td.actual_price, 0),
          NULLIF(tt.base_price, 0),
          NULLIF(tt.price, 0),
          30000000
        ) as price_per_pax,
        COALESCE(
          NULLIF(tt.internal_cost, 0), 
          ROUND(COALESCE(
            NULLIF((td.tour_info->>'price_adult')::numeric, 0),
            NULLIF((td.tour_info->>'price_tour')::numeric, 0),
            NULLIF(td.price_adult, 0),
            NULLIF(td.actual_price, 0),
            NULLIF(tt.base_price, 0),
            NULLIF(tt.price, 0),
            30000000
          ) * 0.80)
        ) as cost_per_pax,
        CASE
          WHEN tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 200000
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Hàn Quốc%' THEN 130000
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Úc%' THEN 450000
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' OR tt.name ILIKE '%Nepal%' THEN 240000
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' OR tt.name ILIKE '%Nga%' THEN 260000
          ELSE 150000
        END as cpl_target,
        CASE
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Úc%' THEN 0.05
          WHEN tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Hokkaido%' OR tt.name ILIKE '%Cung Đường Vàng%' THEN 0.08
          WHEN tt.name ILIKE '%Đài Loan%' OR tt.name ILIKE '%Hàn Quốc%' THEN 0.10
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Sri Lanka%' THEN 0.07
          WHEN tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Ma Rốc%' OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Trung Á%' THEN 0.075
          ELSE 0.10
        END as cr_sale,
        COALESCE(NULLIF(td.status, ''), 'Đang mở bán') as status_text,
        0.01 as mkt_percentage,
        'Chờ BOD duyệt' as approval_status,
        COALESCE(
          NULLIF(td.tour_info->>'tour_itinerary_link', ''),
          NULLIF(td.tour_info->>'tour_itinerary_web_link', ''),
          NULLIF(tt.schedule_link, ''),
          'https://drive.google.com/'
        ) as drive_link,
        EXTRACT(YEAR FROM td.start_date)::int as year,
        EXTRACT(QUARTER FROM td.start_date)::int as quarter
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE td.is_deleted = false AND td.start_date IS NOT NULL
      ON CONFLICT (departure_code) DO UPDATE SET
        departure_id = EXCLUDED.departure_id,
        tour_template_id = EXCLUDED.tour_template_id,
        departure_date = EXCLUDED.departure_date,
        bu_id = EXCLUDED.bu_id,
        tuyen = EXCLUDED.tuyen,
        target_pax = EXCLUDED.target_pax,
        break_even_pax = EXCLUDED.break_even_pax,
        price_per_pax = EXCLUDED.price_per_pax,
        cost_per_pax = EXCLUDED.cost_per_pax,
        cpl_target = EXCLUDED.cpl_target,
        cr_sale = EXCLUDED.cr_sale,
        drive_link = EXCLUDED.drive_link,
        year = EXCLUDED.year,
        quarter = EXCLUDED.quarter;
    `;
    const syncRes = await db.query(syncQuery);
    console.log(`✔ Synced ERP departures into marketing_budget_plans (affected: ${syncRes.rowCount}).`);

    // Synchronize sequence to prevent Case 9 Duplicate Key violation
    await db.query(`
      SELECT setval('marketing_budget_plans_id_seq', COALESCE((SELECT MAX(id) FROM marketing_budget_plans), 1), true);
    `);
    console.log('✔ Sequence marketing_budget_plans_id_seq synchronized.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
