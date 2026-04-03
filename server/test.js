const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(`
            SELECT 
                td.id as tour_departure_id,
                td.code as departure_code,
                td.start_date,
                tt.name as template_name,
                td.status as departure_status,
                COALESCE((SELECT SUM(pax_count) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status != 'cancelled'), 0) as sold_pax,
                COALESCE((SELECT SUM(total_price) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status != 'cancelled'), 0) as expected_revenue,
                tc.id as costing_id,
                tc.costs,
                tc.total_revenue as saved_revenue,
                tc.total_estimated_cost,
                tc.total_actual_cost,
                tc.total_deposit,
                tc.status as costing_status,
                tc.updated_at
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN tour_costings tc ON td.id = tc.tour_departure_id
            WHERE td.status != 'Cancelled'
            ORDER BY td.start_date DESC
        `).then(res => console.log('OK, rows:', res.rows.length)).catch(err => console.error('BIG ERROR:', err.message)).finally(() => pool.end());
