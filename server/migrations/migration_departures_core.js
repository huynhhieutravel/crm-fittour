const db = require('../db');

/**
 * Migration: Đảm bảo các bảng core của Module Departures tồn tại
 * - tour_departures
 * - guides
 * - departure_reminders
 * 
 * Chạy IF NOT EXISTS nên an toàn khi bảng đã có sẵn trên Production.
 */

async function run() {
    console.log('[MIGRATION] Departures Core Tables: Bắt đầu...');

    // 1. GUIDES
    await db.query(`
        CREATE TABLE IF NOT EXISTS guides (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            email VARCHAR(255),
            languages VARCHAR(255),
            rating INTEGER DEFAULT 5,
            status VARCHAR(50) DEFAULT 'Available',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('  ✅ Bảng guides OK');

    // 2. TOUR_DEPARTURES
    await db.query(`
        CREATE TABLE IF NOT EXISTS tour_departures (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            tour_template_id INTEGER REFERENCES tour_templates(id),
            start_date DATE,
            end_date DATE,
            max_participants INTEGER DEFAULT 30,
            min_participants INTEGER DEFAULT 10,
            break_even_pax INTEGER,
            status VARCHAR(50) DEFAULT 'Open',
            actual_price NUMERIC(15,2) DEFAULT 0,
            discount_price NUMERIC(15,2) DEFAULT 0,
            single_room_supplement NUMERIC(15,2) DEFAULT 0,
            visa_fee NUMERIC(15,2) DEFAULT 0,
            tip_fee NUMERIC(15,2) DEFAULT 0,
            price_adult NUMERIC(15,2) DEFAULT 0,
            price_child_6_11 NUMERIC(15,2) DEFAULT 0,
            price_child_2_5 NUMERIC(15,2) DEFAULT 0,
            price_infant NUMERIC(15,2) DEFAULT 0,
            price_rules JSONB DEFAULT '[]'::jsonb,
            additional_services JSONB DEFAULT '[]'::jsonb,
            guide_id INTEGER REFERENCES guides(id),
            operator_id INTEGER REFERENCES users(id),
            supplier_info JSONB DEFAULT '{}'::jsonb,
            deadline_booking DATE,
            deadline_visa DATE,
            deadline_payment DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('  ✅ Bảng tour_departures OK');

    // 3. DEPARTURE_REMINDERS
    await db.query(`
        CREATE TABLE IF NOT EXISTS departure_reminders (
            id SERIAL PRIMARY KEY,
            tour_departure_id INTEGER REFERENCES tour_departures(id) ON DELETE CASCADE,
            type VARCHAR(100) NOT NULL,
            due_date DATE,
            assigned_to INTEGER REFERENCES users(id),
            custom_title TEXT,
            status VARCHAR(20) DEFAULT 'PENDING',
            resolved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tour_departure_id, type)
        );
    `);
    console.log('  ✅ Bảng departure_reminders OK');

    console.log('[MIGRATION] Departures Core Tables: Hoàn tất.');
}

module.exports = { run };
