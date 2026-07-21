require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function dropTable() {
  try {
    await pool.query('DROP TABLE IF EXISTS lead_activities CASCADE;');
    console.log('Table dropped');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dropTable();
