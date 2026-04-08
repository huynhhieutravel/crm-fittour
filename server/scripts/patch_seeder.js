const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
});

async function run() {
    try {
        console.log("Fixing op_tours dates...");
        await db.query(`
            UPDATE op_tours 
            SET start_date = CAST(tour_info->>'departure_date' AS DATE),
                end_date = CAST(tour_info->>'return_date' AS DATE)
            WHERE start_date IS NULL AND tour_info->>'departure_date' IS NOT NULL;
        `);

        console.log("Fixing op_tour_bookings qty...");
        await db.query(`
            UPDATE op_tour_bookings
            SET qty = CAST(raw_details->>'qty_adult' AS INTEGER)
            WHERE qty IS NULL AND raw_details->>'qty_adult' IS NOT NULL;
        `);
        
        console.log("Setting default total seats for op_tours...");
        await db.query(`
            UPDATE op_tours
            SET tour_info = jsonb_set(tour_info, '{total_seats}', '20')
            WHERE NOT (tour_info ? 'total_seats');
        `);
        
        await db.query(`
            UPDATE op_tours
            SET tour_info = jsonb_set(tour_info, '{price_adult}', tour_info->'selling_price')
            WHERE tour_info ? 'selling_price' AND NOT (tour_info ? 'price_adult');
        `);

        console.log("Patch completed successfully.");
    } catch(e) {
        console.error(e);
    } finally {
        db.end();
    }
}
run();
