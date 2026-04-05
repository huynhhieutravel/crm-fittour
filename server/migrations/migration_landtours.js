require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING LANDTOURS SCHEMA MIGRATION ===');
  
  try {
    // 1. landtours
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtours (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL,
            tax_id VARCHAR(50),
            landtour_class VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            country VARCHAR(100),
            province VARCHAR(100),
            address TEXT,
            notes TEXT,
            website VARCHAR(255),
            bank_account_name VARCHAR(255),
            bank_account_number VARCHAR(100),
            bank_name VARCHAR(255),
            market VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtours verified/created.');

    // 2. landtour_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtour_contacts (
            id SERIAL PRIMARY KEY,
            landtour_id INTEGER NOT NULL REFERENCES landtours(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtour_contacts verified/created.');

    // 3. landtour_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtour_services (
            id SERIAL PRIMARY KEY,
            landtour_id INTEGER NOT NULL REFERENCES landtours(id) ON DELETE CASCADE,
            sku VARCHAR(50),
            service_type VARCHAR(100),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            notes TEXT,
            capacity INTEGER,
            cost_price NUMERIC(15,2),
            net_price NUMERIC(15,2),
            sale_price NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtour_services verified/created.');

    // 4. landtour_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtour_contracts (
            id SERIAL PRIMARY KEY,
            landtour_id INTEGER NOT NULL REFERENCES landtours(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtour_contracts verified/created.');

    // 5. landtour_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtour_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES landtour_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES landtour_services(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtour_contract_rates verified/created.');
    
    // 6. landtour_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS landtour_notes (
            id SERIAL PRIMARY KEY,
            landtour_id INTEGER NOT NULL REFERENCES landtours(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table landtour_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
