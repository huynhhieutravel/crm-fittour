require('dotenv').config();
const db = require('./db');

async function fix() {
    console.log("Fixing UK keywords...");
    // 1. Update keywords for UK tour
    await db.query("UPDATE tour_templates SET keywords = 'UK, Scotland, Vương quốc Anh, Nước Anh' WHERE id = 197");
    
    // 2. Set tour_id = NULL for all leads assigned to 197 so they can be re-evaluated
    const res = await db.query("UPDATE leads SET tour_id = NULL WHERE tour_id = 197 RETURNING id");
    console.log(`Cleared tour_id for ${res.rowCount} leads that were incorrectly assigned to UK.`);
    
    process.exit(0);
}
fix();
