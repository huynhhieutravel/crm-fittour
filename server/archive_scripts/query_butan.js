require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, name, keywords, bu_group FROM tour_templates WHERE name ILIKE '%Bhutan%'").then(res => { console.log(res.rows); process.exit(0); });
