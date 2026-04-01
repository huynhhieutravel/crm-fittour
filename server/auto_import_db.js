const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgres://localhost:5432/postgres'
});

async function autoImport() {
  let attempt = 0;
  const maxAttempts = 10;
  const sql = fs.readFileSync('../fittour_full_sync.sql', 'utf8');

  while (attempt < maxAttempts) {
    try {
      console.log(`[Attempt ${attempt + 1}] Importing...`);
      await pool.query(sql);
      console.log('✅ Import completed successfully!');
      process.exit(0);
    } catch (err) {
      if (err.code === '42703' && err.message.includes('column')) {
        // e.g., column "updated_at" of relation "users" does not exist
        const match = err.message.match(/column "([^"]+)" of relation "([^"]+)" does not exist/);
        if (match) {
          const col = match[1];
          const table = match[2];
          console.log(`⚠️ Missing column: ${col} in table: ${table}. Auto-fixing...`);
          try {
            await pool.query(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`);
            console.log(`✅ Added column ${col} to ${table}. Retrying import...`);
          } catch (alterErr) {
            console.error(`❌ Failed to add column:`, alterErr.message);
            process.exit(1);
          }
        } else {
          console.error('Unknown 42703 error:', err.message);
          process.exit(1);
        }
      } else {
        console.error('❌ Import failed with error:', err.message);
        process.exit(1);
      }
    }
    attempt++;
  }
  console.log('❌ Reached max attempts.');
  process.exit(1);
}

autoImport();
