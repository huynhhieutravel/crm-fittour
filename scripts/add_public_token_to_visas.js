const db = require('../server/db');
const crypto = require('crypto');

async function run() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding public_token to visas...');
        await client.query(`
            ALTER TABLE visas ADD COLUMN IF NOT EXISTS public_token VARCHAR(100);
        `);

        // Generate tokens for existing visas that don't have one
        const visas = await client.query('SELECT id FROM visas WHERE public_token IS NULL');
        for (const visa of visas.rows) {
            const token = crypto.randomBytes(16).toString('hex');
            await client.query('UPDATE visas SET public_token = $1 WHERE id = $2', [token, visa.id]);
        }
        
        // Try to Add UNIQUE constraint, ignore if already exists
        try {
            await client.query(`
                ALTER TABLE visas ADD CONSTRAINT visas_public_token_key UNIQUE (public_token);
            `);
        } catch(e) {
            console.log('Constraint may already exist.');
        }

        await client.query('COMMIT');
        console.log(`Success! Added public_token and updated ${visas.rows.length} existing records.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating schema:', err);
    } finally {
        client.release();
        process.exit();
    }
}

run();
