const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await db.query(`
            UPDATE op_tour_bookings
            SET qty = CAST(raw_details->>'qty_adult' AS INTEGER)
            WHERE qty = 0 AND raw_details->>'qty_adult' IS NOT NULL;
        `);
        console.log("Fixed qty = 0");
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
