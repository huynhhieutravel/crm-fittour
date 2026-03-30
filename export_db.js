const { Pool } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
});

const TABLES = [
  'users',
  'business_units',
  'tours',
  'departures',
  'guides',
  'bookings',
  'customers',
  'leads',
  'notes',
  'messages',
  'settings'
];

async function exportData() {
  let sql = "-- FIT Tour CRM - Data Sync Dump\n";
  sql += "BEGIN;\n";
  
  // Disable triggers to avoid foreign key issues during mass insert
  sql += "SET session_replication_role = 'replica';\n\n";

  for (const table of TABLES) {
    console.log(`Exporting table: ${table}...`);
    try {
      // Check if table exists
      const checkResult = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
      if (!checkResult.rows[0].exists) {
        console.warn(`Table ${table} does not exist, skipping.`);
        continue;
      }

      sql += `--- Data for ${table} ---\n`;
      sql += `TRUNCATE TABLE ${table} CASCADE;\n`;
      
      const res = await pool.query(`SELECT * FROM ${table}`);
      if (res.rows.length === 0) {
        sql += `-- No data for ${table}\n\n`;
        continue;
      }

      const columns = Object.keys(res.rows[0]);
      const columnNames = columns.join(', ');

      for (const row of res.rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        });
        sql += `INSERT INTO ${table} (${columnNames}) VALUES (${values.join(', ')});\n`;
      }
      sql += "\n";
    } catch (err) {
      console.error(`Error exporting ${table}:`, err.message);
    }
  }

  sql += "SET session_replication_role = 'origin';\n";
  sql += "COMMIT;\n";

  fs.writeFileSync('fittour_full_sync.sql', sql);
  console.log("✅ Export hoàn tất: fittour_full_sync.sql");
  process.exit(0);
}

exportData();
