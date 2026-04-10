const db = require('./server/db');
(async () => {
    try {
        const res = await db.query('SELECT raw_details FROM bookings ORDER BY id DESC LIMIT 1');
        console.log(JSON.stringify(res.rows[0].raw_details, null, 2));
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
})();
