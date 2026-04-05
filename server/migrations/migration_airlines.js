require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
  console.log('=== STARTING AIRLINES SCHEMA MIGRATION ===');
  
  try {
    // 1. airlines
    await db.query(`
        CREATE TABLE IF NOT EXISTS airlines (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL,
            tax_id VARCHAR(50),
            airline_class VARCHAR(100),
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
    console.log('✔ Table airlines verified/created.');

    // 2. airline_contacts
    await db.query(`
        CREATE TABLE IF NOT EXISTS airline_contacts (
            id SERIAL PRIMARY KEY,
            airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            phone VARCHAR(50),
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table airline_contacts verified/created.');

    // 3. airline_services
    await db.query(`
        CREATE TABLE IF NOT EXISTS airline_services (
            id SERIAL PRIMARY KEY,
            airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
            sku VARCHAR(100),
            service_type VARCHAR(100),
            name VARCHAR(255) NOT NULL,
            routing VARCHAR(255),
            flight_number_outbound VARCHAR(100),
            departure_date DATE,
            departure_time VARCHAR(50),
            flight_number_inbound VARCHAR(100),
            return_date DATE,
            return_time VARCHAR(50),
            deposit_deadline DATE,
            full_pay_deadline DATE,
            naming_deadline DATE,
            baggage VARCHAR(100),
            payment_status VARCHAR(255),
            capacity NUMERIC,
            cost_price NUMERIC(15,2),
            net_price NUMERIC(15,2),
            sale_price NUMERIC(15,2),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table airline_services verified/created.');

    // 4. airline_contracts
    await db.query(`
        CREATE TABLE IF NOT EXISTS airline_contracts (
            id SERIAL PRIMARY KEY,
            airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            valid_from DATE,
            valid_to DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table airline_contracts verified/created.');

    // 5. airline_contract_rates
    await db.query(`
        CREATE TABLE IF NOT EXISTS airline_contract_rates (
            id SERIAL PRIMARY KEY,
            contract_id INTEGER NOT NULL REFERENCES airline_contracts(id) ON DELETE CASCADE,
            service_id INTEGER NOT NULL REFERENCES airline_services(id) ON DELETE CASCADE,
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
    console.log('✔ Table airline_contract_rates verified/created.');
    
    // 6. airline_notes
    await db.query(`
        CREATE TABLE IF NOT EXISTS airline_notes (
            id SERIAL PRIMARY KEY,
            airline_id INTEGER NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✔ Table airline_notes verified/created.');

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
