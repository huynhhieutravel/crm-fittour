const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  try {
    const res = await pool.query("UPDATE licenses SET name = 'UỶ QUYỀN PHÓ GIÁM ĐỐC MS. TRÚC VY' WHERE id = 2 RETURNING *");
    console.log("Updated rows:", res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
main();
