const db = require('./db');

async function cleanAndSeed() {
    console.log('--- CLEANING AND RESETTING DEMO DATA ---');
    try {
        // 1. Delete all bookings linked to these names to avoid FK violation
        await db.query(`
            DELETE FROM bookings WHERE customer_id IN (
                SELECT id FROM customers WHERE name = 'KHÁCH HÀNG MẪU' OR name = 'Khách Hàng Mẫu'
            )
        `);
        // Also delete from other linked tables if any (notes, etc)
        await db.query(`
            DELETE FROM lead_notes WHERE customer_id IN (
                SELECT id FROM customers WHERE name = 'KHÁCH HÀNG MẪU' OR name = 'Khách Hàng Mẫu'
            )
        `);
        await db.query("DELETE FROM customers WHERE name = 'KHÁCH HÀNG MẪU' OR name = 'Khách Hàng Mẫu'");
        
        // 2. Create one fresh customer
        const custRes = await db.query(`
            INSERT INTO customers (name, phone, email, nationality, role, customer_segment, first_deal_date)
            VALUES ('KHÁCH HÀNG MẪU', '0900000999', 'mau@demo.com', 'Việt Nam', 'booker', 'VIP', '2026-01-01')
            RETURNING id
        `);
        const customerId = custRes.rows[0].id;
        console.log(`- New Customer ID: ${customerId}`);

        // 3. Ensure tour and departure exist (Check first instead of ON CONFLICT)
        const checkTour = await db.query("SELECT id FROM tour_templates WHERE name = 'Premium Japan Tour' LIMIT 1");
        let tourId;
        if (checkTour.rows.length > 0) {
            tourId = checkTour.rows[0].id;
        } else {
            const tourRes = await db.query(`
                INSERT INTO tour_templates (name, destination, duration, tour_type, base_price)
                VALUES ('Premium Japan Tour', 'Japan', '7N6Đ', 'Premium', 45000000)
                RETURNING id
            `);
            tourId = tourRes.rows[0].id;
        }

        const depRes = await db.query(`
            INSERT INTO tour_departures (tour_template_id, start_date, end_date, status, actual_price, price_adult)
            VALUES ($1, '2026-04-15', '2026-04-22', 'Guaranteed', 45000000, 45000000)
            RETURNING id
        `, [tourId]);
        const departureId = depRes.rows[0].id;

        // 4. Insert 2 Confirmed Bookings
        await db.query(`
            INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status)
            VALUES ('BK_DEMO_A1', $1, $2, $3, '2026-04-15', 2, 90000000, 'confirmed')
        `, [customerId, departureId, tourId]);

        await db.query(`
            INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status)
            VALUES ('BK_DEMO_A2', $1, $2, $3, '2026-06-10', 1, 45000000, 'confirmed')
        `, [customerId, departureId, tourId]);

        console.log('✅ Demo reset and seeding successful.');
        console.log(`- Expected LTV: 135,000,000 VND`);
    } catch (err) {
        console.error('❌ Reset failed:', err.message);
    } finally {
        process.exit();
    }
}

cleanAndSeed();
