const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding rating column to hotels...');
        await client.query('ALTER TABLE hotels ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to restaurants...');
        await client.query('ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to transports...');
        await client.query('ALTER TABLE transports ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to tickets...');
        await client.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to airlines...');
        await client.query('ALTER TABLE airlines ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to landtours...');
        await client.query('ALTER TABLE landtours ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        console.log('Adding rating column to insurances...');
        await client.query('ALTER TABLE insurances ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT 0.0');

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
