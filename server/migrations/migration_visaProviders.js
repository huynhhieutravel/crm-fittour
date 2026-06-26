require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING VISA_PROVIDERS SCHEMA MIGRATION ===');
  
  try {
    // 1. visa_providers
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_providers (
            id SERIAL PRIMARY KEY,
            country VARCHAR(255),
            processing_time VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table visa_providers verified/created.');

    // 2. visa_provider_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_provider_contacts (
            id SERIAL PRIMARY KEY,
            visa_provider_id INTEGER NOT NULL REFERENCES visa_providers(id) ON DELETE CASCADE,
            name VARCHAR(255),
            position VARCHAR(255),
            phone VARCHAR(255),
            email VARCHAR(255),
            dob DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table visa_provider_contacts verified/created.');

    // 3. visa_provider_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_provider_services (
            id SERIAL PRIMARY KEY,
            visa_provider_id INTEGER NOT NULL REFERENCES visa_providers(id) ON DELETE CASCADE,
            visa_type VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table visa_provider_services verified/created.');

    // 4. visa_provider_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_provider_contracts (
            id SERIAL PRIMARY KEY,
            visa_provider_id INTEGER NOT NULL REFERENCES visa_providers(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table visa_provider_contracts verified/created.');

    // 5. visa_provider_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_provider_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES visa_provider_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES visa_provider_services(id) ON DELETE CASCADE,
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
    console.log('✔ Table visa_provider_contract_rates verified/created.');
    
    // 6. visa_provider_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS visa_provider_notes (
            id SERIAL PRIMARY KEY,
            visa_provider_id INTEGER NOT NULL REFERENCES visa_providers(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table visa_provider_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
