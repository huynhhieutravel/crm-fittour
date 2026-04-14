const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://localhost:5432/fittour_local'
});

async function run() {
  try {
    await pool.query('ALTER TABLE marketing_ads_reports ADD COLUMN is_locked BOOLEAN DEFAULT false');
    console.log("Column added");
  } catch(e) {
    if (e.message.includes('already exists')) {
       console.log('Column already exists');
    } else {
       console.error(e);
    }
  } finally {
    pool.end();
  }
}
run();
