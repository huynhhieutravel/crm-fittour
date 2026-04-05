require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING INSURANCES SCHEMA MIGRATION ===');
  
  try {
    // 1. insurances
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurances (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL NOT NULL,
            tax_id VARCHAR(50),
            insurance_class VARCHAR(100),
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
    console.log('✔ Table insurances verified/created.');

    // 2. insurance_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurance_contacts (
            id SERIAL PRIMARY KEY,
            insurance_id INTEGER NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table insurance_contacts verified/created.');

    // 3. insurance_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurance_services (
            id SERIAL PRIMARY KEY,
            insurance_id INTEGER NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
            sku VARCHAR(50),
            service_type VARCHAR(100),
            name VARCHAR(255) NOT NULL NOT NULL,
            description TEXT,
            notes TEXT,
            coverage_amount VARCHAR(100),
            duration_days INTEGER,
            cost_price NUMERIC(15,2),
            net_price NUMERIC(15,2),
            sale_price NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table insurance_services verified/created.');

    // 4. insurance_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurance_contracts (
            id SERIAL PRIMARY KEY,
            insurance_id INTEGER NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table insurance_contracts verified/created.');

    // 5. insurance_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurance_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES insurance_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES insurance_services(id) ON DELETE CASCADE,
            dummy_rate VARCHAR(1),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table insurance_contract_rates verified/created.');
    
    // 6. insurance_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS insurance_notes (
            id SERIAL PRIMARY KEY,
            insurance_id INTEGER NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table insurance_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
