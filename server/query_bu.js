require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, label, countries FROM business_units WHERE id = 'BU1'").then(res => { console.log(res.rows); process.exit(0); });
