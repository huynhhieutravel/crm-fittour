const db = require('../db');
(async () => {
    try {
        await db.query("ALTER TABLE markets ADD COLUMN sort_order INTEGER DEFAULT 0;").catch(e => console.log('sort_order already exists or error:', e.message));
        await db.query("ALTER TABLE markets ADD COLUMN is_active BOOLEAN DEFAULT true;").catch(e => console.log('is_active already exists or error:', e.message));
        // UPDATE all existing records to be active and have default sort order
        await db.query("UPDATE markets SET is_active = true WHERE is_active IS NULL;");
        await db.query("UPDATE markets SET sort_order = 0 WHERE sort_order IS NULL;");
        console.log("MARKETS SCHEMA PATCHED SUCCESSFULLY");
    } catch(err) {
        console.error("FATAL ERROR: ", err.message);
    }
    process.exit();
})();
