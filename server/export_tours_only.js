const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Chú ý: Ta sẽ không đưa bảng 'guides' vào đây
const TABLES_TO_EXPORT = [
  'tour_templates',
  'tour_departures'
];

async function exportData() {
  console.log("🚀 Bắt đầu trích xuất Tours & Departures (Bỏ liên kết HDV)...");

  let sql = "-- FIT Tour CRM - Tours & Departures Sync Dump\n";
  sql += "BEGIN;\n";
  sql += "SET session_replication_role = 'replica';\n\n";

  for (const table of TABLES_TO_EXPORT) {
    console.log(`📦 Đang trích xuất bảng: ${table}...`);
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
          // XÓA LIÊN KẾT KHÓA NGOẠI LIÊN QUAN ĐẾN HDV ĐỂ TRÁNH LỖI VPS
          if (table === 'tour_departures' && (col === 'guide_id' || col === 'co_guide_id')) {
            return 'NULL';
          }

          const val = row[col];
          // Force JSONB conversion for structured object arrays
          if (['price_rules', 'additional_services', 'itinerary'].includes(col)) {
            return `'${JSON.stringify(val || []).replace(/'/g, "''")}'`;
          }

          if (val === null) return 'NULL';
          if (Array.isArray(val)) {
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
      console.error(`❌ Lỗi khi xuất bảng ${table}:`, err.message);
    }
  }

  sql += "SET session_replication_role = 'origin';\n";
  sql += "COMMIT;\n";

  const outputPath = path.join(__dirname, '../sync_tours_no_guide.sql');
  fs.writeFileSync(outputPath, sql);
  console.log(`✅ Xuất dữ liệu hoàn tất. File được lưu tại: ${outputPath}`);
  process.exit(0);
}

exportData().catch(err => {
  console.error("💥 Lỗi nghiêm trọng:", err);
  process.exit(1);
});
