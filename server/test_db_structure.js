const db = require('./db');
console.log('DB keys:', Object.keys(db));
console.log('DB.pool type:', typeof db.pool);
if (db.pool) {
    console.log('DB.pool keys:', Object.keys(db.pool));
    console.log('Is DB.pool.connect a function?', typeof db.pool.connect === 'function');
}
process.exit(0);
