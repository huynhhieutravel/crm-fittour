const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[1/1] Creating customer_reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_reviews (
        id SERIAL PRIMARY KEY,
        reviewer_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        review_date DATE,
        source VARCHAR(50) DEFAULT 'other',
        guide_name VARCHAR(255),
        bu_id TEXT REFERENCES business_units(id) ON DELETE SET NULL,
        proof_url TEXT,
        approval_status VARCHAR(50) DEFAULT 'pending',
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // Indexes for fast filtering
    await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(approval_status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_reviews_source ON customer_reviews(source)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_customer_reviews_date ON customer_reviews(review_date)`);
    
    console.log('  ✅ customer_reviews table created successfully!');

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
