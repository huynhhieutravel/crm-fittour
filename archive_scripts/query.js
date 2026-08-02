const { Pool } = require('pg');
require('dotenv').config({ path: 'server/.env' });
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
async function run() {
  const res = await pool.query("SELECT id, name, dispatched_at, CURRENT_DATE, CURRENT_TIMESTAMP, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS vn_date FROM leads WHERE dispatched_at IS NOT NULL ORDER BY dispatched_at DESC LIMIT 3");
  console.log(res.rows);
  pool.end();
}
run();
