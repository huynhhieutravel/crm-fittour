require('dotenv').config();
const db = require('./db');
async function fix() {
    await db.query("UPDATE tour_templates SET keywords = 'Bhutan' WHERE name ILIKE '%Bhutan%' AND (keywords IS NULL OR keywords = '')");
    await db.query("UPDATE tour_templates SET keywords = 'Thanh Tạng, Tây Tạng' WHERE name ILIKE '%Thanh Tạng%' AND (keywords IS NULL OR keywords = '')");
    console.log("Fixed keywords for Bhutan and Thanh Tang.");
    process.exit(0);
}
fix();
