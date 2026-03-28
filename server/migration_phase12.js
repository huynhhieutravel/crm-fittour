const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  await client.connect();
  try {
    console.log('Starting migration phase 12 (Guides Expansion)...');
    
    // Add rich profile columns to guides
    await client.query(`
      ALTER TABLE guides 
      ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS specialties TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS dob DATE,
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);
    
    console.log('Migration phase 12 completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
