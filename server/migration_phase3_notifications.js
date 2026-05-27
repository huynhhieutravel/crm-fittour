require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log('🚀 Starting Phase 3 Migration (user_notifications)...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Table user_notifications created successfully.');
    
    // Create indexes for fast lookup
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
    `);
    console.log('✅ Indexes created successfully.');

    console.log('🎉 Phase 3 Migration Complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
