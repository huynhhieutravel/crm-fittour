const db = require('./db');

async function migrate() {
  try {
    console.log('Migrating database: Adding CODE column to tour_departures...');
    // Check if column exists first
    const checkRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='tour_departures' AND column_name='code';
    `);

    if (checkRes.rows.length === 0) {
      await db.query(`ALTER TABLE tour_departures ADD COLUMN code VARCHAR(50) UNIQUE;`);
      console.log('✅ Column "code" added successfully.');
      
      // Update any existing rows with a random code just to avoid nulls
      await db.query(`
        UPDATE tour_departures 
        SET code = 'DEP-' || SUBSTRING(MD5(id::text) FROM 1 FOR 6)
        WHERE code IS NULL;
      `);
      console.log('✅ Updated existing rows with random codes.');
    } else {
      console.log('ℹ️ Column "code" already exists.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
