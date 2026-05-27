const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('🚀 Starting Email Rules Migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS email_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_code VARCHAR(100) UNIQUE NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        description TEXT,
        email_groups JSONB DEFAULT '[]'::jsonb,
        external_emails JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_rules created');

    // Seed default rules
    const defaultRules = [
      {
        event_code: 'LEAVE_REQUEST',
        event_name: 'Nhân sự tạo đơn xin nghỉ phép',
        description: 'Tự động gửi thông báo email đến nhóm duyệt phép khi có nhân sự tạo đơn xin nghỉ mới.',
        email_groups: ['LEAVE_APPROVERS'],
        external_emails: []
      },
      {
        event_code: 'LEAVE_STATUS',
        event_name: 'Duyệt / Từ chối đơn nghỉ phép',
        description: 'Tự động gửi thông báo email đến người xin nghỉ phép và nhóm duyệt phép khi đơn được phê duyệt hoặc từ chối.',
        email_groups: ['LEAVE_APPROVERS'],
        external_emails: []
      }
    ];

    for (const rule of defaultRules) {
      await client.query(`
        INSERT INTO email_rules (event_code, event_name, description, email_groups, external_emails)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (event_code) DO NOTHING
      `, [rule.event_code, rule.event_name, rule.description, JSON.stringify(rule.email_groups), JSON.stringify(rule.external_emails)]);
    }
    console.log('✅ Default email rules seeded (ON CONFLICT DO NOTHING)');

    console.log('🎉 Migration Complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
