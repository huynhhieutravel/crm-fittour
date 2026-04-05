const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // ═══ HOTELS ═══
        console.log('Creating group_hotels...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_hotels (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE,
                name VARCHAR(255) NOT NULL,
                tax_id VARCHAR(50),
                build_year VARCHAR(10),
                phone VARCHAR(50),
                email VARCHAR(100),
                country VARCHAR(100),
                province VARCHAR(100),
                address TEXT,
                notes TEXT,
                star_rate VARCHAR(20),
                website VARCHAR(255),
                hotel_class VARCHAR(100),
                project_name VARCHAR(255),
                bank_account_name VARCHAR(255),
                bank_account_number VARCHAR(100),
                bank_name VARCHAR(255),
                market VARCHAR(100),
                rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_hotel_contacts (
            id SERIAL PRIMARY KEY, hotel_id INT REFERENCES group_hotels(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_hotel_contracts (
            id SERIAL PRIMARY KEY, hotel_id INT REFERENCES group_hotels(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_hotel_room_types (
            id SERIAL PRIMARY KEY, hotel_id INT REFERENCES group_hotels(id) ON DELETE CASCADE,
            room_type VARCHAR(100), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_hotel_allotments (
            id SERIAL PRIMARY KEY, hotel_id INT REFERENCES group_hotels(id) ON DELETE CASCADE,
            room_type VARCHAR(100), date DATE, quantity INT DEFAULT 0, booked INT DEFAULT 0,
            status VARCHAR(50) DEFAULT 'available', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_hotel_notes (
            id SERIAL PRIMARY KEY, hotel_id INT REFERENCES group_hotels(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ RESTAURANTS ═══
        console.log('Creating group_restaurants...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_restaurants (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                cuisine_type VARCHAR(100), phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                restaurant_class VARCHAR(100), website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_restaurant_contacts (
            id SERIAL PRIMARY KEY, restaurant_id INT REFERENCES group_restaurants(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_restaurant_contracts (
            id SERIAL PRIMARY KEY, restaurant_id INT REFERENCES group_restaurants(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_restaurant_services (
            id SERIAL PRIMARY KEY, restaurant_id INT REFERENCES group_restaurants(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_restaurant_notes (
            id SERIAL PRIMARY KEY, restaurant_id INT REFERENCES group_restaurants(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ TRANSPORTS ═══
        console.log('Creating group_transports...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_transports (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                vehicle_type VARCHAR(100), phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                transport_class VARCHAR(100), website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_transport_contacts (
            id SERIAL PRIMARY KEY, transport_id INT REFERENCES group_transports(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_transport_contracts (
            id SERIAL PRIMARY KEY, transport_id INT REFERENCES group_transports(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_transport_services (
            id SERIAL PRIMARY KEY, transport_id INT REFERENCES group_transports(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_transport_notes (
            id SERIAL PRIMARY KEY, transport_id INT REFERENCES group_transports(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ TICKETS ═══
        console.log('Creating group_tickets...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_tickets (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                ticket_type VARCHAR(100), phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                ticket_class VARCHAR(100), website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_ticket_contacts (
            id SERIAL PRIMARY KEY, ticket_id INT REFERENCES group_tickets(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_ticket_contracts (
            id SERIAL PRIMARY KEY, ticket_id INT REFERENCES group_tickets(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_ticket_services (
            id SERIAL PRIMARY KEY, ticket_id INT REFERENCES group_tickets(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_ticket_notes (
            id SERIAL PRIMARY KEY, ticket_id INT REFERENCES group_tickets(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ AIRLINES ═══
        console.log('Creating group_airlines...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_airlines (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_airline_contacts (
            id SERIAL PRIMARY KEY, airline_id INT REFERENCES group_airlines(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_airline_contracts (
            id SERIAL PRIMARY KEY, airline_id INT REFERENCES group_airlines(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_airline_services (
            id SERIAL PRIMARY KEY, airline_id INT REFERENCES group_airlines(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_airline_notes (
            id SERIAL PRIMARY KEY, airline_id INT REFERENCES group_airlines(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ LANDTOURS ═══
        console.log('Creating group_landtours...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_landtours (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                landtour_class VARCHAR(100), website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_landtour_contacts (
            id SERIAL PRIMARY KEY, landtour_id INT REFERENCES group_landtours(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_landtour_contracts (
            id SERIAL PRIMARY KEY, landtour_id INT REFERENCES group_landtours(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_landtour_services (
            id SERIAL PRIMARY KEY, landtour_id INT REFERENCES group_landtours(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_landtour_notes (
            id SERIAL PRIMARY KEY, landtour_id INT REFERENCES group_landtours(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // ═══ INSURANCES ═══
        console.log('Creating group_insurances...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_insurances (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE, name VARCHAR(255) NOT NULL, tax_id VARCHAR(50),
                phone VARCHAR(50), email VARCHAR(100),
                country VARCHAR(100), province VARCHAR(100), address TEXT, notes TEXT,
                insurance_class VARCHAR(100), website VARCHAR(255),
                bank_account_name VARCHAR(255), bank_account_number VARCHAR(100), bank_name VARCHAR(255),
                market VARCHAR(100), rating NUMERIC(3,1) DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await client.query(`CREATE TABLE IF NOT EXISTS group_insurance_contacts (
            id SERIAL PRIMARY KEY, insurance_id INT REFERENCES group_insurances(id) ON DELETE CASCADE,
            contact_name VARCHAR(255), position VARCHAR(100), phone VARCHAR(50), email VARCHAR(100), notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_insurance_contracts (
            id SERIAL PRIMARY KEY, insurance_id INT REFERENCES group_insurances(id) ON DELETE CASCADE,
            contract_number VARCHAR(100), start_date DATE, end_date DATE, status VARCHAR(50) DEFAULT 'active',
            file_url TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_insurance_services (
            id SERIAL PRIMARY KEY, insurance_id INT REFERENCES group_insurances(id) ON DELETE CASCADE,
            service_name VARCHAR(255), cost_price NUMERIC(15,2) DEFAULT 0, net_price NUMERIC(15,2) DEFAULT 0,
            sale_price NUMERIC(15,2) DEFAULT 0, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await client.query(`CREATE TABLE IF NOT EXISTS group_insurance_notes (
            id SERIAL PRIMARY KEY, insurance_id INT REFERENCES group_insurances(id) ON DELETE CASCADE,
            note_text TEXT NOT NULL, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await client.query('COMMIT');
        console.log('\n✅ Migration completed: All group_* tables created!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
