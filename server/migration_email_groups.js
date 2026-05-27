const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('🚀 Starting Email Groups Module Migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS email_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        users JSONB DEFAULT '[]'::jsonb,
        external_emails JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Table email_groups created');

    // Seed default groups
    const defaultGroups = [
      {
        code: 'LEAVE_APPROVERS',
        name: 'Nhóm Duyệt Nghỉ Phép',
        description: 'Tự động gửi thông báo email khi nhân sự gửi đơn xin nghỉ phép.',
        users: [],
        external_emails: []
      },
      {
        code: 'BU1',
        name: 'Nhóm Email BU1',
        description: 'Nhóm email dành cho Business Unit 1.',
        users: [],
        external_emails: []
      },
      {
        code: 'BU2',
        name: 'Nhóm Email BU2',
        description: 'Nhóm email dành cho Business Unit 2.',
        users: [],
        external_emails: []
      },
      {
        code: 'ALL_STAFF',
        name: 'Toàn bộ nhân viên',
        description: 'Gửi email cho tất cả nhân sự trong hệ thống.',
        users: [],
        external_emails: []
      },
      {
        code: 'BOARD_DIRECTORS',
        name: 'Ban lãnh đạo',
        description: 'Nhóm email gửi riêng cho Ban giám đốc và Ban lãnh đạo.',
        users: [],
        external_emails: []
      }
    ];

    for (const group of defaultGroups) {
      await client.query(`
        INSERT INTO email_groups (code, name, description, users, external_emails)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING
      `, [group.code, group.name, group.description, JSON.stringify(group.users), JSON.stringify(group.external_emails)]);
    }
    console.log('✅ Default email groups seeded (ON CONFLICT DO NOTHING)');

    console.log('🎉 Migration Complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
