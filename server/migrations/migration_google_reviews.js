const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Dropping existing tables to apply V6 Schema...');
    await client.query('DROP TABLE IF EXISTS google_reviews CASCADE');
    await client.query('DROP TABLE IF EXISTS google_auth CASCADE');
    await client.query('DROP TABLE IF EXISTS google_sync_logs CASCADE');

    console.log('Creating google_auth table...');
    await client.query(`
      CREATE TABLE google_auth (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255),
        location_id VARCHAR(255),
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expiry_date BIGINT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        overlap_hours INTEGER DEFAULT 24,
        is_syncing BOOLEAN DEFAULT FALSE,
        sync_started_at TIMESTAMP
      );
    `);

    console.log('Creating google_reviews table...');
    await client.query(`
      CREATE TABLE google_reviews (
        review_id VARCHAR(255) PRIMARY KEY,
        location_id VARCHAR(255),
        account_id VARCHAR(255),
        location_name VARCHAR(255),
        account_name VARCHAR(255),
        reviewer_id VARCHAR(255),
        reviewer_name VARCHAR(255),
        reviewer_profile_photo_url TEXT,
        rating INTEGER,
        comment TEXT,
        create_time TIMESTAMP,
        updated_time TIMESTAMP,
        is_edited BOOLEAN DEFAULT FALSE,
        reply_comment TEXT,
        reply_updated_time TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'new',
        assigned_to INTEGER,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating google_sync_logs table...');
    await client.query(`
      CREATE TABLE google_sync_logs (
        id SERIAL PRIMARY KEY,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        total_reviews_synced INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'running',
        errors TEXT
      );
    `);

    console.log('Adding indexes...');
    await client.query(`
      CREATE INDEX idx_google_reviews_rating ON google_reviews(rating);
      CREATE INDEX idx_google_reviews_create_time ON google_reviews(create_time);
      CREATE INDEX idx_google_reviews_status ON google_reviews(status);
    `);

    await client.query('COMMIT');
    console.log('Migration V6 completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
