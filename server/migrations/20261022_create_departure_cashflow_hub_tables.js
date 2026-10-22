const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Step 1: Creating departure_quick_logistics table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS departure_quick_logistics (
                id SERIAL PRIMARY KEY,
                tour_departure_id INT UNIQUE NOT NULL REFERENCES tour_departures_raw(id) ON DELETE CASCADE,
                sim_counts JSONB DEFAULT '{"physical": 0, "esim": 0, "none": 0}'::jsonb,
                room_counts JSONB DEFAULT '{"dbl": 0, "twin": 0, "trip": 0, "sgl": 0, "odd": 0}'::jsonb,
                demographics JSONB DEFAULT '{"adult": 0, "child": 0}'::jsonb,
                surcharges JSONB DEFAULT '[]'::jsonb,
                booking_overrides JSONB DEFAULT '{}'::jsonb,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by INT REFERENCES users(id)
            );
        `);
        console.log('✅ departure_quick_logistics table created or verified');

        console.log('=== Step 2: Creating departure_share_links table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS departure_share_links (
                id SERIAL PRIMARY KEY,
                tour_departure_id INT NOT NULL REFERENCES tour_departures_raw(id) ON DELETE CASCADE,
                token VARCHAR(64) UNIQUE NOT NULL,
                title VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                view_count INT DEFAULT 0,
                created_by INT REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_accessed_at TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_departure_share_links_token ON departure_share_links(token);
            CREATE INDEX IF NOT EXISTS idx_departure_share_links_departure_id ON departure_share_links(tour_departure_id);
        `);
        console.log('✅ departure_share_links table created');

        console.log('=== Step 3: Inserting permission into permissions_master ===');
        await client.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
            VALUES ('departures', 'view_cashflow', 'Xem Sổ Tay Khởi Hành & Dòng Tiền', 'Điều Hành & Doanh Số', 250)
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ permission registered');

        await client.query('COMMIT');
        console.log('🎉 Migration finished successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        await db.pool.end();
    }
}

if (require.main === module) {
    migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrate;
