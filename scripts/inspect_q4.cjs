process.chdir('/var/www/fittour-crm/server');
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkQ4() {
  const res = await pool.query(`
    SELECT 
      td.id,
      td.code,
      td.start_date,
      tt.name as tour_name,
      tt.bu_group,
      td.tour_info->>'price_adult' as info_price,
      td.tour_info->>'total_seats' as info_seats,
      td.tour_info->>'tour_itinerary_link' as info_drive,
      td.tour_info->>'tour_itinerary_web_link' as info_web,
      tt.base_price,
      tt.price as tt_price,
      tt.schedule_link
    FROM tour_departures td
    LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
    WHERE td.is_deleted = false 
      AND td.start_date >= '2026-10-01' 
      AND td.start_date <= '2026-12-31'
    ORDER BY td.start_date ASC;
  `);

  console.log(`Q4/2026 departures count: ${res.rows.length}`);
  for (const r of res.rows) {
    const d = r.start_date.toISOString().slice(0, 10);
    console.log(`[${d}] (${r.code}) Tour: ${r.tour_name}`);
    console.log(`      BU: ${r.bu_group} | info_price: ${r.info_price} | tt.base_price: ${r.base_price} | seats: ${r.info_seats}`);
  }

  await pool.end();
}

checkQ4().catch(console.error);
