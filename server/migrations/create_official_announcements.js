const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[1/2] Creating official_announcements table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS official_announcements (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Thông báo',
        issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
        effective_date DATE,
        signer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        signer_name VARCHAR(150),
        signer_position VARCHAR(150),
        recipient_scope VARCHAR(255),
        summary TEXT,
        content_html TEXT NOT NULL,
        attachment_url VARCHAR(500),
        is_pinned BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'published',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[2/2] Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_code ON official_announcements(code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_issue_date ON official_announcements(issue_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_status ON official_announcements(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON official_announcements(is_pinned)`);

    console.log('  ✅ official_announcements table and indexes created successfully!');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
