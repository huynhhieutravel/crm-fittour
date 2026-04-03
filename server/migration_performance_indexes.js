const { pool } = require('./db');

async function migrate() {
    console.log("=== STARTING PERFORMANCE INDEX MIGRATION ===");
    console.log("This migration adds database indexes for massive scalability on Dashboard Date Filters.");
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Bảng Leads: Index cho created_at
        console.log("Adding index idx_leads_created_at...");
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_leads_created_at 
            ON leads(created_at);
        `);
        console.log("✔ Index 'idx_leads_created_at' verified.");

        // Bảng Bookings: Index cho created_at
        console.log("Adding index idx_bookings_created_at...");
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
            ON bookings(created_at);
        `);
        console.log("✔ Index 'idx_bookings_created_at' verified.");

        // Bảng Tour Departures: Index cho start_date
        console.log("Adding index idx_departures_start_date...");
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_departures_start_date 
            ON tour_departures(start_date);
        `);
        console.log("✔ Index 'idx_departures_start_date' verified.");

        await client.query('COMMIT');
        console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ MIGRATION FAILED:", err);
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
