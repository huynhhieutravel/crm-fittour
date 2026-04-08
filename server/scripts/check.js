const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
});

async function run() {
    try {
        const res = await db.query(`SELECT id, status, qty, raw_details FROM op_tour_bookings LIMIT 5`);
        console.table(res.rows);
    } catch(e) {
        console.error(e);
    } finally {
        db.end();
    }
}
run();
