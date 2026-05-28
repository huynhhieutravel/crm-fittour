require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  // Search in tour_templates
  const r1 = await pool.query(`SELECT id, code, name, destination, tour_type, is_active, bu_group FROM tour_templates WHERE LOWER(name) LIKE '%đạo thành%' OR LOWER(name) LIKE '%dao thanh%' OR LOWER(code) LIKE '%daothanh%'`);
  console.log('=== TOUR TEMPLATES (đạo thành) ===');
  r1.rows.forEach(r => console.log(`  [${r.id}] ${r.code} | ${r.name} | dest=${r.destination} | type=${r.tour_type} | active=${r.is_active} | bu=${r.bu_group}`));
  if (r1.rows.length === 0) console.log('  (không tìm thấy)');

  // Broader search
  const r2 = await pool.query(`SELECT id, code, name, destination, tour_type, is_active, bu_group FROM tour_templates WHERE LOWER(name) LIKE '%á đ%' OR LOWER(code) LIKE '%adinh%'`);
  console.log('=== BROADER SEARCH (á đ / adinh) ===');
  r2.rows.forEach(r => console.log(`  [${r.id}] ${r.code} | ${r.name} | dest=${r.destination} | type=${r.tour_type} | active=${r.is_active} | bu=${r.bu_group}`));
  if (r2.rows.length === 0) console.log('  (không tìm thấy)');

  // Check op-tours too
  const r3 = await pool.query(`SELECT id, tour_code, tour_name, market, status FROM op_tours WHERE LOWER(tour_name) LIKE '%đạo thành%' OR LOWER(tour_code) LIKE '%daothanh%'`);
  console.log('=== OP TOURS (đạo thành) ===');
  r3.rows.forEach(r => console.log(`  [${r.id}] ${r.tour_code} | ${r.tour_name} | market=${r.market} | status=${r.status}`));
  if (r3.rows.length === 0) console.log('  (không tìm thấy)');

  // Check if it's in [Tour Cũ] filtered list
  const r4 = await pool.query(`SELECT id, code, name FROM tour_templates WHERE LOWER(name) LIKE '%đạo thành%' OR LOWER(name) LIKE '%[tour cũ]%đạo%'`);
  console.log('=== INCLUDING [Tour Cũ] ===');
  r4.rows.forEach(r => console.log(`  [${r.id}] ${r.code} | ${r.name}`));
  if (r4.rows.length === 0) console.log('  (không tìm thấy)');

  // Total count for reference
  const r5 = await pool.query(`SELECT COUNT(*) as total FROM tour_templates`);
  console.log(`\nTổng số tour templates: ${r5.rows[0].total}`);

  pool.end();
})();
