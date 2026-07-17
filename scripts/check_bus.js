const db = require('../server/db');

async function check() {
    try {
        const res = await db.query('SELECT * FROM business_units');
        console.log(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
