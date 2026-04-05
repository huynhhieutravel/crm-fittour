const db = require('./server/db');

async function check() {
    try {
        const res = await db.query('SELECT code, name, rating FROM hotels WHERE id = 6 OR code = \'HOTEL-006\'');
        console.log('Hotel data:', res.rows[0]);
    } catch (e) {
        console.log('DB error:', e);
    } finally {
        process.exit(0);
    }
}
check();
