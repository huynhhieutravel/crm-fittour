const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await db.query(`SELECT id, tour_id, qty, status FROM op_tour_bookings WHERE qty IS NULL OR qty = 0 LIMIT 10`);
        console.table(res.rows);
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
