const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Starting Phase 14 Migration: Group Booking & Pax Management');

    // 1. Create booking_passengers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_passengers (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        pax_type VARCHAR(50), -- Adult, Child 6-11, Child 2-5, Infant
        price NUMERIC(12, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created booking_passengers table');

    // 2. Add group-related columns to bookings
    await client.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS group_name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS room_info TEXT
    `);
    console.log('Updated bookings with group fields');

    // 3. Optional: Move existing booking links to booking_passengers for consistency
    const existingBookings = await client.query('SELECT id, customer_id, total_price, pax_count FROM bookings');
    for (const b of existingBookings.rows) {
      // Check if already has passengers
      const paxCount = await client.query('SELECT count(*) FROM booking_passengers WHERE booking_id = $1', [b.id]);
      if (parseInt(paxCount.rows[0].count) === 0 && b.customer_id) {
         // Add the main customer as the first passenger
         await client.query(
           'INSERT INTO booking_passengers (booking_id, customer_id, pax_type, price) VALUES ($1, $2, $3, $4)',
           [b.id, b.customer_id, 'Adult', b.total_price] // Simplified for migration
         );
         console.log(`Migrated main customer for booking ID ${b.id} to booking_passengers`);
      }
    }

    console.log('Phase 14 Migration Successful!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
