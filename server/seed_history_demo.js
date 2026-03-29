const db = require('./db');

async function seed() {
    console.log('--- SEEDING CUSTOMER TOUR HISTORY DEMO ---');
    try {
        // 1. Check if customer exists
        const checkCust = await db.query("SELECT id FROM customers WHERE name = 'KHÁCH HÀNG MẪU' LIMIT 1");
        let customerId;
        if (checkCust.rows.length > 0) {
            customerId = checkCust.rows[0].id;
        } else {
            const custRes = await db.query(`
                INSERT INTO customers (name, phone, email, nationality, role, customer_segment)
                VALUES ('KHÁCH HÀNG MẪU', '0900000012', 'mau@fittour.com', 'Việt Nam', 'booker', 'VIP')
                RETURNING id
            `);
            customerId = custRes.rows[0].id;
        }
        console.log(`- Customer ID: ${customerId}`);

        // 2. Ensure we have a tour template
        const checkTour = await db.query("SELECT id FROM tour_templates WHERE name = 'Tour Nhật Bản Mùa Xuân 6N5Đ' LIMIT 1");
        let tourId;
        if (checkTour.rows.length > 0) {
            tourId = checkTour.rows[0].id;
        } else {
            const tourRes = await db.query(`
                INSERT INTO tour_templates (name, destination, duration, tour_type, base_price)
                VALUES ('Tour Nhật Bản Mùa Xuân 6N5Đ', 'Nhật Bản', '6N5Đ', 'Standard', 35000000)
                RETURNING id
            `);
            tourId = tourRes.rows[0].id;
        }

        // 3. Ensure we have a departure
        const checkDep = await db.query("SELECT id FROM tour_departures WHERE tour_template_id = $1 LIMIT 1", [tourId]);
        let departureId;
        if (checkDep.rows.length > 0) {
            departureId = checkDep.rows[0].id;
        } else {
            const depRes = await db.query(`
                INSERT INTO tour_departures (tour_template_id, start_date, end_date, status, actual_price)
                VALUES ($1, '2026-03-16', '2026-03-21', 'Open', 35000000)
                RETURNING id
            `, [tourId]);
            departureId = depRes.rows[0].id;
        }

        // 4. Create bookings
        await db.query(`
            INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status)
            VALUES ('BK_DEMO_01', $1, $2, $3, '2026-03-16', 2, 70000000, 'confirmed')
            ON CONFLICT DO NOTHING
        `, [customerId, departureId, tourId]);

        await db.query(`
            INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status)
            VALUES ('BK_DEMO_02', $1, $2, $3, '2026-05-20', 1, 35000000, 'confirmed')
            ON CONFLICT DO NOTHING
        `, [customerId, departureId, tourId]);

        console.log('✅ Demo data seeded successfully.');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        process.exit();
    }
}

seed();
