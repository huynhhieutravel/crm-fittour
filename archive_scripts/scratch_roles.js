const db = require('./server/db');

async function checkUsersSchema() {
    try {
        const schema = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users schema:', schema.rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkUsersSchema();
