const { Client } = require('pg');
require('dotenv').config();

async function verify() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Verifying columns in customers table...');
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND column_name IN ('location_city', 'travel_season')");
    console.log('Columns found:', res.rows.map(r => r.column_name));
    
    if (res.rows.length === 2) {
      console.log('SUCCESS: All fields are present in the database.');
    } else {
      console.log('FAILURE: Missing fields.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

verify();
