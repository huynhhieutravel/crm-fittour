const db = require('../db');

async function migrate_public_token() {
    const query = `
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();
        CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_public_token ON bookings(public_token);
        
        -- Cập nhật uuid cho các dòng cũ
        UPDATE bookings SET public_token = gen_random_uuid() WHERE public_token IS NULL;
    `;
    try {
        await db.query(query);
        console.log("Migration successful: Added public_token to op_tour_bookings");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate_public_token();
