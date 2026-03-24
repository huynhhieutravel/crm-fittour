const db = require('./db');

async function migrate() {
  try {
    console.log('--- STARTING DATABASE MIGRATION ---');

    // Ensure users table has full_name and role
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
          ALTER TABLE users ADD COLUMN full_name VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'staff';
        END IF;
      END $$;
    `);

    // Ensure leads table has bu_group and assigned_to
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='bu_group') THEN
          ALTER TABLE leads ADD COLUMN bu_group VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='assigned_to') THEN
          ALTER TABLE leads ADD COLUMN assigned_to INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='gender') THEN
          ALTER TABLE leads ADD COLUMN gender VARCHAR(20);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='birth_date') THEN
          ALTER TABLE leads ADD COLUMN birth_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='classification') THEN
          ALTER TABLE leads ADD COLUMN classification VARCHAR(50) DEFAULT 'Mới';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='last_contacted_at') THEN
          ALTER TABLE leads ADD COLUMN last_contacted_at TIMESTAMP;
        END IF;
      END $$;
    `);

    // Seed a user if empty
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Seed: Creating default admin user...');
      await db.query(
        "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)",
        ['admin', 'admin123', 'Quản trị viên', 'admin']
      );
    }

    console.log('--- DATABASE MIGRATION COMPLETED ---');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err);
    process.exit(1);
  }
}

migrate();
