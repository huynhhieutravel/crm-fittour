const db = require('./db');

async function migrate() {
    try {
        console.log('--- STARTING FB MESSAGES MIGRATION ---');

        // Check if fb_message_id column exists
        const checkColumn = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='messages' AND column_name='fb_message_id'
        `);

        if (checkColumn.rows.length === 0) {
            console.log('Adding fb_message_id to messages table...');
            await db.query(`
                ALTER TABLE messages 
                ADD COLUMN fb_message_id VARCHAR(255) UNIQUE;
            `);
            console.log('✅ Column fb_message_id added successfully.');
        } else {
            console.log('✅ Column fb_message_id already exists.');
        }

        console.log('--- MIGRATION COMPLETED SUCCESSFULY ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err);
        process.exit(1);
    }
}

migrate();
