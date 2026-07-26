require('dotenv').config();
const pool = require('./server/db');
async function run() {
    const res = await pool.query(`
        SELECT 
            b.id,
            b.booking_code,
            td.code as tour_code,
            tt.bu_group,
            td.start_date,
            b.pax_count,
            b.total_price,
            b.paid
        FROM bookings b
        JOIN tour_departures td ON b.tour_departure_id = td.id
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE u.full_name = 'Trần Quốc Thịnh' 
        AND EXTRACT(MONTH FROM td.start_date) = 7
        AND EXTRACT(YEAR FROM td.start_date) = 2026
        AND b.booking_status NOT IN ('Huỷ', 'Mới')
    `);
    console.table(res.rows);
    process.exit();
}
run();
