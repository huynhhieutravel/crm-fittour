const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration phase 14 (Meta CAPI fields on Leads)...');
    
    await client.query('BEGIN');

    // Add facebook_psid — Messenger PSID for CAPI matching
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_psid VARCHAR(50);
    `);

    // Add meta_lead_id — Lead ID from Meta Lead Ads
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS meta_lead_id VARCHAR(50);
    `);

    // Add fbclid — Facebook Click ID from URL tracking
    await client.query(`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255);
    `);

    // Backfill facebook_psid from existing conversations
    const backfillResult = await client.query(`
      UPDATE leads l
      SET facebook_psid = c.external_id
      FROM conversations c
      WHERE c.lead_id = l.id
        AND l.facebook_psid IS NULL
        AND c.external_id IS NOT NULL
    `);
    console.log(`Backfilled ${backfillResult.rowCount} leads with facebook_psid from conversations.`);

    await client.query('COMMIT');
    console.log('Migration phase 14 completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
