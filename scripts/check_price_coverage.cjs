process.chdir('/var/www/fittour-crm/server');
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkCoverage() {
  const query = `
    WITH tour_avg_price AS (
      SELECT 
        tour_template_id,
        ROUND(AVG(NULLIF((tour_info->>'price_adult')::numeric, 0))) as avg_price,
        ROUND(AVG(NULLIF((tour_info->>'total_seats')::numeric, 0))) as avg_seats
      FROM tour_departures
      WHERE is_deleted = false AND tour_info->>'price_adult' IS NOT NULL AND (tour_info->>'price_adult')::numeric > 0
      GROUP BY tour_template_id
    )
    SELECT 
      td.id,
      td.code,
      td.start_date,
      tt.name as tour_name,
      COALESCE(
        NULLIF((td.tour_info->>'price_adult')::numeric, 0),
        NULLIF((td.tour_info->>'price_tour')::numeric, 0),
        NULLIF(td.price_adult, 0),
        NULLIF(td.actual_price, 0),
        NULLIF(tt.base_price, 0),
        NULLIF(tt.price, 0),
        tap.avg_price
      ) as resolved_price,
      COALESCE(
        NULLIF((td.tour_info->>'total_seats')::int, 0),
        NULLIF(td.max_participants, 0),
        NULLIF(tt.max_pax, 0),
        tap.avg_seats,
        16
      ) as resolved_pax
    FROM tour_departures td
    LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
    LEFT JOIN tour_avg_price tap ON td.tour_template_id = tap.tour_template_id
    WHERE td.is_deleted = false AND td.start_date IS NOT NULL;
  `;
  const res = await pool.query(query);
  const total = res.rows.length;
  const withPrice = res.rows.filter(r => r.resolved_price && Number(r.resolved_price) > 0);
  const withoutPrice = res.rows.filter(r => !r.resolved_price || Number(r.resolved_price) <= 0);

  console.log(`Total departures: ${total}`);
  console.log(`With resolved price: ${withPrice.length} (${(withPrice.length / total * 100).toFixed(1)}%)`);
  console.log(`Without resolved price: ${withoutPrice.length}`);

  if (withoutPrice.length > 0) {
    console.log('\nTours without price:');
    const uniqueMissing = {};
    for (const r of withoutPrice) {
      uniqueMissing[r.tour_name] = (uniqueMissing[r.tour_name] || 0) + 1;
    }
    console.log(uniqueMissing);
  }

  await pool.end();
}

checkCoverage().catch(console.error);
