const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  await client.connect();
  try {
    console.log('Starting migration phase 11...');
    
    // Add location_city and travel_season to customers
    await client.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS location_city TEXT,
      ADD COLUMN IF NOT EXISTS travel_season TEXT;
    `);
    
    console.log('Migration phase 11 completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
