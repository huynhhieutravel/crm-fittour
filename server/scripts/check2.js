const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await db.query(`SELECT tour_id, COUNT(*), SUM(qty) FROM op_tour_bookings GROUP BY tour_id LIMIT 10`);
        console.table(res.rows);
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
