const { Client } = require('pg');
const { PgBoss } = require('pg-boss');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    console.log('🚀 Starting Phase 2 Migration (pg-boss & suppression_list)...');

    // 1. Khởi tạo schema cho pg-boss (Job Queue)
    console.log('📦 Installing pg-boss schema...');
    const boss = new PgBoss(process.env.DATABASE_URL);
    await boss.start(); // boss.start() tự động chạy db migration cho pg-boss (tạo schema `pgboss` và các bảng job)
    await boss.stop();
    console.log('✅ pg-boss schema installed successfully.');

    // 2. Tạo bảng suppression_list
    console.log('🛡️ Creating suppression_list table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppression_list (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        reason VARCHAR(255) NOT NULL,            -- VD: 'hard_bounce', 'complaint'
        source_event VARCHAR(100),               -- VD: 'leave.approved', 'marketing'
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_suppression_email ON suppression_list(email)`);
    console.log('✅ suppression_list table created.');

    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log('🎉 Phase 2 Migration Complete!');
    console.log('══════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
