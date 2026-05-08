const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ═══ 1. Fix users table — thêm cột bị thiếu ═══
    console.log('[1/8] Fixing users table...');
    const userCols = [
      { name: 'birth_date', type: 'DATE' },
      { name: 'gender', type: 'VARCHAR(20)' },
      { name: 'id_card', type: 'VARCHAR(50)' },
      { name: 'passport_url', type: 'TEXT' },
      { name: 'id_expiry', type: 'DATE' },
      { name: 'address', type: 'TEXT' },
      { name: 'facebook_url', type: 'TEXT' },
      { name: 'position', type: 'VARCHAR(100)' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'department', type: 'VARCHAR(100)' },
      { name: 'permissions', type: 'JSONB' },
    ];
    for (const col of userCols) {
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }
    console.log('  ✅ users: added missing columns');

    // ═══ 2. Fix leads table — thêm customer_id ═══
    console.log('[2/8] Fixing leads table...');
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS customer_id INTEGER`);
    console.log('  ✅ leads: added customer_id');

    // ═══ 3. Create permissions_master table ═══
    console.log('[3/8] Creating permissions_master...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions_master (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        module VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ permissions_master created');

    // ═══ 4. Create booking_transactions table ═══
    console.log('[4/8] Creating booking_transactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_transactions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        amount NUMERIC(15,2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(100),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        note TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ booking_transactions created');

    // ═══ 5. Create group_projects table ═══
    console.log('[5/8] Creating group_projects...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id INTEGER,
        leader_id INTEGER,
        status VARCHAR(50) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        budget NUMERIC(15,2),
        pax INTEGER,
        destination VARCHAR(255),
        notes TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ group_projects created');

    // ═══ 6. Create teams & team_members tables ═══
    console.log('[6/8] Creating teams & team_members...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        leader_id INTEGER,
        bu_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
      )
    `);
    console.log('  ✅ teams & team_members created');

    // ═══ 7. Fix bookings — thêm cột thiếu ═══
    console.log('[7/8] Fixing bookings table...');
    const bookingCols = [
      { name: 'booking_status', type: "VARCHAR(50) DEFAULT 'Mới'" },
      { name: 'payment_status', type: "VARCHAR(50) DEFAULT 'Chưa thanh toán'" },
      { name: 'customer_id', type: 'INTEGER' },
      { name: 'booking_code', type: 'VARCHAR(50)' },
    ];
    for (const col of bookingCols) {
      await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }
    console.log('  ✅ bookings: added missing columns');

    // ═══ 8. Fix guides — thêm cột thiếu ═══
    console.log('[8/8] Fixing guides table...');
    const guideCols = [
      { name: 'status', type: "VARCHAR(50) DEFAULT 'active'" },
      { name: 'language', type: 'VARCHAR(100)' },
      { name: 'rating', type: 'NUMERIC(3,1)' },
      { name: 'notes', type: 'TEXT' },
    ];
    for (const col of guideCols) {
      await client.query(`ALTER TABLE guides ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
    }
    console.log('  ✅ guides: added missing columns');

    await client.query('COMMIT');
    console.log('\n🎉 All local schema fixes applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

run();
