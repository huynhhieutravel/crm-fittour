const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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
  console.log("🚀 Starting Database Export...");
  
  // Get all tables in public schema
  const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  const tables = tableRes.rows.map(r => r.table_name);
  console.log(`📋 Found ${tables.length} tables to export: ${tables.join(', ')}`);

  let sql = "-- FIT Tour CRM - Data Sync Dump\n";
  sql += "BEGIN;\n";
  sql += "SET session_replication_role = 'replica';\n\n";

  for (const table of tables) {
    console.log(`📦 Exporting table: ${table}...`);
    try {
      sql += `--- Data for ${table} ---\n`;
      sql += `TRUNCATE TABLE "${table}" CASCADE;\n`;
      
      const res = await pool.query(`SELECT * FROM "${table}"`);
      if (res.rows.length === 0) {
        sql += `-- No data for ${table}\n\n`;
        continue;
      }

      const columns = Object.keys(res.rows[0]);
      const columnNames = columns.map(c => `"${c}"`).join(', ');

      for (const row of res.rows) {
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (Array.isArray(val)) {
            // Postgres array literal format: '{val1,val2}'
            const escapedVals = val.map(v => {
              if (v === null) return 'NULL';
              return `"${String(v).replace(/"/g, '\\"')}"`;
            }).join(',');
            return `'{${escapedVals}}'`;
          }
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        });
        sql += `INSERT INTO "${table}" (${columnNames}) VALUES (${values.join(', ')});\n`;
      }
      sql += "\n";
    } catch (err) {
      console.error(`❌ Error exporting ${table}:`, err.message);
    }
  }

  sql += "SET session_replication_role = 'origin';\n";
  sql += "COMMIT;\n";

  const outputPath = path.join(__dirname, '../fittour_full_sync.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Export completed: ${outputPath}`);
  process.exit(0);
}

exportData().catch(err => {
  console.error("💥 Fatal Error:", err);
  process.exit(1);
});
