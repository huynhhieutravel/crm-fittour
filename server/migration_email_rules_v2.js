const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('🚀 Starting Email Rules V2 Migration...');

    await client.query(`
      ALTER TABLE email_rules 
      ADD COLUMN IF NOT EXISTS cc_groups JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS cc_external_emails JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS bcc_groups JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS bcc_external_emails JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS subject_template VARCHAR(255),
      ADD COLUMN IF NOT EXISTS body_template TEXT;
    `);
    
    console.log('✅ Added cc_groups, cc_external_emails, bcc_groups, bcc_external_emails, subject_template, body_template to email_rules table');

    console.log('🎉 Migration V2 Complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
