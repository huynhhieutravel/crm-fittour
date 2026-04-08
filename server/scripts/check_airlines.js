const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await db.query(`SELECT id, code, name, logo_url FROM airlines LIMIT 5`);
        console.table(res.rows);
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
