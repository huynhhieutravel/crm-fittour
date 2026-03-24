const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Starting Phase 12 Migration: Tour Restructuring & Guides');

    // 1. Rename tours to tour_templates
    await client.query('ALTER TABLE tours RENAME TO tour_templates');
    console.log('Renamed tours to tour_templates');

    // 2. Add product-related columns to tour_templates
    await client.query(`
      ALTER TABLE tour_templates 
      ADD COLUMN IF NOT EXISTS tour_type TEXT,
      ADD COLUMN IF NOT EXISTS tags TEXT,
      ADD COLUMN IF NOT EXISTS itinerary JSONB,
      ADD COLUMN IF NOT EXISTS highlights TEXT,
      ADD COLUMN IF NOT EXISTS inclusions TEXT,
      ADD COLUMN IF NOT EXISTS exclusions TEXT,
      ADD COLUMN IF NOT EXISTS base_price NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS internal_cost NUMERIC(12, 2),
      ADD COLUMN IF NOT EXISTS expected_margin NUMERIC(12, 2)
    `);
    console.log('Updated tour_templates with product fields');

    // 3. Create guides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guides (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        languages TEXT,
        rating NUMERIC(3, 2),
        status VARCHAR(20) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created guides table');

    // 4. Create tour_departures table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tour_departures (
        id SERIAL PRIMARY KEY,
        tour_template_id INTEGER REFERENCES tour_templates(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE,
        max_participants INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Open', -- Open, Guaranteed, Full, Cancelled
        actual_price NUMERIC(12, 2),
        discount_price NUMERIC(12, 2),
        single_room_supplement NUMERIC(12, 2) DEFAULT 0,
        visa_fee NUMERIC(12, 2) DEFAULT 0,
        tip_fee NUMERIC(12, 2) DEFAULT 0,
        guide_id INTEGER REFERENCES guides(id) ON DELETE SET NULL,
        operator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        supplier_info JSONB,
        min_participants INTEGER DEFAULT 0,
        break_even_pax INTEGER DEFAULT 0,
        deadline_booking DATE,
        deadline_visa DATE,
        deadline_payment DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created tour_departures table');

    // 5. Update bookings table
    // Add tour_departure_id
    await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tour_departure_id INTEGER REFERENCES tour_departures(id) ON DELETE SET NULL');
    console.log('Added tour_departure_id to bookings');

    // 6. Data Migration: Create initial departures for each existing template
    const templates = await client.query('SELECT id, start_date, max_pax, price FROM tour_templates');
    for (const row of templates.rows) {
      if (row.start_date) {
        // Create a departure for each template that had a start_date
        const departure = await client.query(
          'INSERT INTO tour_departures (tour_template_id, start_date, max_participants, actual_price) VALUES ($1, $2, $3, $4) RETURNING id',
          [row.id, row.start_date, row.max_pax, row.price]
        );
        const depId = departure.rows[0].id;
        // Update existing bookings that were linked to this tour
        await client.query('UPDATE bookings SET tour_departure_id = $1 WHERE tour_id = $2', [depId, row.id]);
        console.log(`Migrated bookings for template ID ${row.id} to new departure ID ${depId}`);
      }
    }

    console.log('Phase 12 Migration Successful!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
