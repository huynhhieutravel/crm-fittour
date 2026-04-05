require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING TICKETS SCHEMA MIGRATION ===');
  
  try {
    // 1. tickets
    await db.query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL,
            tax_id VARCHAR(50),
            ticket_type VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            country VARCHAR(100),
            province VARCHAR(100),
            address TEXT,
            notes TEXT,
            ticket_class VARCHAR(100),
            website VARCHAR(255),
            bank_account_name VARCHAR(255),
            bank_account_number VARCHAR(100),
            bank_name VARCHAR(255),
            market VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table tickets verified/created.');

    // 2. ticket_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_contacts (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table ticket_contacts verified/created.');

    // 3. ticket_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_services (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            capacity INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table ticket_services verified/created.');

    // 4. ticket_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_contracts (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table ticket_contracts verified/created.');

    // 5. ticket_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES ticket_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES ticket_services(id) ON DELETE CASCADE,
            fita_net NUMERIC(15,2),
            fita_sale NUMERIC(15,2),
            fita_commission NUMERIC(15,2),
            fite_net NUMERIC(15,2),
            fite_sale NUMERIC(15,2),
            fite_commission NUMERIC(15,2),
            series_net NUMERIC(15,2),
            series_sale NUMERIC(15,2),
            series_commission NUMERIC(15,2),
            charter_net NUMERIC(15,2),
            charter_sale NUMERIC(15,2),
            charter_commission NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table ticket_contract_rates verified/created.');
    
    // 6. ticket_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS ticket_notes (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table ticket_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
