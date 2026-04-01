const db = require('./db');

async function migrate() {
  console.log('--- STARTING META CATALOG MIGRATION ---');
  try {
    // Thêm cột cho tour_templates
    console.log('Adding image_url and website_link to tour_templates...');
    await db.query(`
      ALTER TABLE tour_templates 
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS website_link TEXT
    `);

    // Thêm cột cho settings
    console.log('Adding meta_catalog_id and meta_system_user_token to settings...');
    await db.query(`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS meta_catalog_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS meta_system_user_token TEXT
    `);

    console.log('--- META CATALOG MIGRATION COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err);
    process.exit(1);
  }
}

migrate();
