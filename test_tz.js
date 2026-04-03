const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:password_cua_ban@127.0.0.1:5432/fittour_crm' });
async function test() {
  const d = new Date();
  console.log("Node current time:", d);
  const res = await pool.query("INSERT INTO customers (name, phone) VALUES ('TZ Test', '9999') RETURNING created_at");
  console.log("DB CURRENT_TIMESTAMP via PG:", res.rows[0].created_at);
  const q2 = await pool.query("INSERT INTO customers (name, phone, created_at) VALUES ('TZ Test 2', '8888', $1) RETURNING created_at", [d]);
  console.log("DB inserted via Node Date:", q2.rows[0].created_at);
  await pool.query("DELETE FROM customers WHERE name LIKE 'TZ Test%'");
  pool.end();
}
test();
