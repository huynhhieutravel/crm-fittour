const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Creating customer_events table if not exists...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_events (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        event_type VARCHAR(100),
        event_date TIMESTAMP WITH TIME ZONE,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_customer_events_customer_id ON customer_events(customer_id);
    `);
    
    await client.query('COMMIT');
    console.log('✅ Created customer_events table successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
