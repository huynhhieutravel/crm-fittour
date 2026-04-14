const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();
async function run() {
  const { rows } = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'travel_support_services'`);
  console.log('--- LOCAL DB SCHEMA ---');
  console.log(rows);
  const perms = await pool.query(`SELECT COUNT(*) FROM permissions_master WHERE module = 'travel_support'`);
  console.log('--- PERMISSIONS DB SYNC ---', perms.rows);
  process.exit(0);
}
run();
