const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgres://localhost:5432/postgres'
});

async function importData() {
  try {
    const sql = fs.readFileSync('../fittour_full_sync.sql', 'utf8');
    console.log('Importing...');
    await pool.query(sql);
    console.log('Import done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

importData();
