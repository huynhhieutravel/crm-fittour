const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('🚀 Starting Notification Module Migration...');

    // ══════════════════════════════════════════════
    // 1. NOTIFICATION LOGS — Dành cho các event hệ thống (In-app, System Email)
    // ══════════════════════════════════════════════
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,        
        channel VARCHAR(20) NOT NULL,            
        recipient_user_id INTEGER REFERENCES users(id),
        recipient_email VARCHAR(255),
        subject TEXT,
        template_slug VARCHAR(100),
        template_version INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending',    
        error_message TEXT,
        error_type VARCHAR(20),                  
        idempotency_key VARCHAR(150) UNIQUE,
        correlation_id VARCHAR(50),
        retry_count INTEGER DEFAULT 0,
        next_retry_at TIMESTAMPTZ,
        metadata JSONB,                          
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table notification_logs created');

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_logs_event ON notification_logs(event_name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON notification_logs(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(recipient_user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notif_logs_idempotency ON notification_logs(idempotency_key)`);

    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log('🎉 Notification Module Migration Complete!');
    console.log('══════════════════════════════════════════════');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
