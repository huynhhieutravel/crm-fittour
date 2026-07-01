const db = require('./server/db');

async function check() {
    try {
        const res = await db.query(`
            SELECT b.id, b.booking_code, td.id as tour_id, td.is_deleted as tour_deleted, b.is_deleted as booking_deleted
            FROM bookings_raw b
            JOIN tour_departures_raw td ON b.tour_departure_id = td.id
            WHERE td.is_deleted = true AND (b.is_deleted = false OR b.is_deleted IS NULL);
        `);
        console.log("Orphan bookings (tour deleted, booking active):", res.rows.length);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
check();
