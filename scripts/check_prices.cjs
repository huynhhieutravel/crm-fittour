process.chdir('/var/www/fittour-crm/server');
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const query = `
    SELECT 
      td.id,
      td.code,
      td.start_date,
      tt.name as tour_name,
      td.price_adult as td_price_adult,
      td.actual_price as td_actual_price,
      td.tour_info->>'price_adult' as info_price_adult,
      td.tour_info->>'total_seats' as info_seats,
      tt.price as tt_price,
      tt.base_price as tt_base_price,
      tt.internal_cost as tt_internal_cost
    FROM tour_departures td
    LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
    WHERE td.is_deleted = false AND td.start_date IS NOT NULL
    ORDER BY td.start_date DESC
    LIMIT 30;
  `;
  const res = await pool.query(query);
  console.log('Total checked:', res.rows.length);
  for (const r of res.rows) {
    const rawPrice = r.info_price_adult || r.td_price_adult || r.td_actual_price || r.tt_base_price || r.tt_price;
    console.log(`[${r.start_date?.toISOString().slice(0,10)}] ${r.code} | Tour: ${r.tour_name}`);
    console.log(`   -> info.price_adult: ${r.info_price_adult} | td.price_adult: ${r.td_price_adult} | tt.base_price: ${r.tt_base_price} | tt.price: ${r.tt_price}`);
  }

  // Count how many departures have prices in tour_info->>'price_adult'
  const countStats = await pool.query(`
    SELECT 
      count(*) as total_departures,
      count(NULLIF((td.tour_info->>'price_adult')::numeric, 0)) as has_info_price,
      count(NULLIF(td.price_adult, 0)) as has_td_price,
      count(NULLIF(td.actual_price, 0)) as has_td_actual,
      count(NULLIF(tt.base_price, 0)) as has_tt_base,
      count(NULLIF(tt.price, 0)) as has_tt_price
    FROM tour_departures td
    LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
    WHERE td.is_deleted = false AND td.start_date IS NOT NULL;
  `);
  console.log('\n=== STATS ===');
  console.log(countStats.rows[0]);

  await pool.end();
}
check().catch(console.error);
