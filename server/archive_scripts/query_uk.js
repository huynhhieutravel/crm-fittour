require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, name, keywords FROM tour_templates WHERE name ILIKE '%UK%' OR keywords ILIKE '%Anh%'").then(res => { console.log(res.rows); process.exit(0); });
