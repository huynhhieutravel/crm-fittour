require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING RESTAURANTS SCHEMA MIGRATION ===');
  
  try {
    // 1. restaurants
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL,
            tax_id VARCHAR(50),
            cuisine_type VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            country VARCHAR(100),
            province VARCHAR(100),
            address TEXT,
            notes TEXT,
            restaurant_class VARCHAR(100),
            website VARCHAR(255),
            bank_account_name VARCHAR(255),
            bank_account_number VARCHAR(100),
            bank_name VARCHAR(255),
            market VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurants verified/created.');

    // 2. restaurant_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_contacts (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            zalo VARCHAR(50),
            skype VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurant_contacts verified/created.');

    // 3. restaurant_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_services (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            capacity INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurant_services verified/created.');

    // 4. restaurant_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_contracts (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurant_contracts verified/created.');

    // 5. restaurant_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES restaurant_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES restaurant_services(id) ON DELETE CASCADE,
            fita_net NUMERIC(15, 2),
            fita_sale NUMERIC(15, 2),
            fita_commission NUMERIC(15, 2),
            fite_net NUMERIC(15, 2),
            fite_sale NUMERIC(15, 2),
            fite_commission NUMERIC(15, 2),
            series_net NUMERIC(15, 2),
            series_sale NUMERIC(15, 2),
            series_commission NUMERIC(15, 2),
            charter_net NUMERIC(15, 2),
            charter_sale NUMERIC(15, 2),
            charter_commission NUMERIC(15, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurant_contract_rates verified/created.');
    
    // 6. restaurant_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_notes (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table restaurant_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
