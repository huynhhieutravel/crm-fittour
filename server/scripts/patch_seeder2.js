const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await db.query(`
            UPDATE op_tours
            SET tour_info = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            jsonb_set(tour_info, '{transport}', '"Đường hàng không"'),
                            '{dep_airline}', '"Air China"'
                        ),
                        '{departure_flight}', '"CA123 SA21MAR SGNHGH HK16 0200 0705"'
                    ),
                    '{ret_airline}', '"Air China"'
                ),
                '{return_flight}', '"CA281 WE25MAR PVGSGN HK16 2135 0110+1"'
            )
            WHERE NOT (tour_info ? 'return_flight');
        `);
        console.log("Patched flight info in tours!");
    } catch(e) { console.error(e); } finally { db.end(); }
}
run();
