const db = require('./db');

async function testInsert() {
    let client;
    try {
        console.log("Connecting to DB...");
        client = await db.pool.connect();
        console.log("Connected.");
        
        await client.query('BEGIN');
        
        const title = "Test Booking";
        const description = "Test";
        const start_time = "2026-05-12T20:00:00";
        const end_time = "2026-05-12T21:00:00";
        const organizer_id = 1; // Assuming user 1 exists, usually admin
        const attendeesJson = "[]";

        console.log("Executing insert...");
        const result = await client.query(
            `INSERT INTO meeting_bookings (title, description, start_time, end_time, organizer_id, attendees, status) 
             VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'approved') RETURNING *`,
            [title, description, start_time, end_time, organizer_id, attendeesJson]
        );
        
        console.log("Insert successful. ID:", result.rows[0].id);

        console.log("Logging activity...");
        const details = JSON.stringify({ action: "Test" });
        const q = `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, 'MEETING_ROOM', $3, $4)`;
        await client.query(q, [organizer_id, 'CREATE', result.rows[0].id, details]);
        console.log("Activity logged.");

        await client.query('ROLLBACK');
        console.log("Rolled back successfully. No permanent changes made.");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        if (client) client.release();
        process.exit(0);
    }
}

testInsert();
