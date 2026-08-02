require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, name FROM tour_templates WHERE keywords IS NULL OR keywords = ''").then(res => { 
    console.log(`Found ${res.rows.length} tours without keywords.`);
    console.log(res.rows.slice(0, 5));
    process.exit(0); 
});
