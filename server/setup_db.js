const db = require('./db');

async function setup() {
  try {
    console.log('--- STARTING DB SETUP ---');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        source VARCHAR(50),
        status VARCHAR(50) DEFAULT 'new',
        tour_id INTEGER,
        assigned_to INTEGER REFERENCES users(id),
        bu_group VARCHAR(50),
        gender VARCHAR(20),
        birth_date DATE,
        consultation_note TEXT,
        last_contacted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id),
        external_id VARCHAR(255) UNIQUE,
        last_message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        sender_type VARCHAR(20),
        sender_id INTEGER,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        meta_app_id VARCHAR(255),
        meta_app_secret VARCHAR(255),
        meta_page_access_token TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('--- DB SETUP COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('DB SETUP FAILED:', err);
    process.exit(1);
  }
}

setup();
