require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function fix() {
    try {
        console.log("Starting to remove Himalaya keywords from BU4 and tours...");

        // 1. Update BU4: Remove 'Himalaya' / 'Himalayas' from countries and keywords
        const buRes = await db.query("SELECT countries, keywords FROM business_units WHERE id = 'BU4'");
        if (buRes.rows.length > 0) {
            let currentCountries = buRes.rows[0].countries || [];
            let currentKeywords = buRes.rows[0].keywords || [];

            const newCountries = currentCountries.filter(c => !c.toLowerCase().includes('himalaya'));
            const newKeywords = currentKeywords.filter(k => !k.toLowerCase().includes('himalaya'));

            await db.query(
                "UPDATE business_units SET countries = $1, keywords = $2, updated_at = NOW() WHERE id = 'BU4'",
                [newCountries, newKeywords]
            );
            console.log("✅ Removed Himalaya from BU4 countries and keywords.");
            console.log("BU4 countries:", newCountries);
            console.log("BU4 keywords:", newKeywords);
        } else {
            console.log("BU4 not found!");
        }

        // 2. Update Tour Templates: remove Himalaya from keywords
        // Tour 312: Ladakh Roadtrip 8N7Đ
        const t312 = await db.query("UPDATE tour_templates SET keywords = 'Ladakh', updated_at = NOW() WHERE id = 312");
        console.log(`✅ Updated Tour 312: ${t312.rowCount} row(s)`);

        // Tour 176: [Tour Cũ] LADAKH, HIMALAYAS
        const t176 = await db.query("UPDATE tour_templates SET keywords = 'Ladakh', updated_at = NOW() WHERE id = 176");
        console.log(`✅ Updated Tour 176: ${t176.rowCount} row(s)`);

        // Tour 177: [Tour Cũ] HIMALAYAS
        const t177 = await db.query("UPDATE tour_templates SET keywords = '', is_active = false, updated_at = NOW() WHERE id = 177");
        console.log(`✅ Updated Tour 177: ${t177.rowCount} row(s)`);

        // Also any other tour template with himalaya in keywords
        const otherTours = await db.query(
            "SELECT id, name, keywords FROM tour_templates WHERE keywords ILIKE '%himalaya%' AND id NOT IN (176, 177, 312)"
        );
        for (const t of otherTours.rows) {
            const cleanedKw = (t.keywords || '')
                .split(',')
                .map(s => s.trim())
                .filter(s => !s.toLowerCase().includes('himalaya'))
                .join(', ');
            await db.query("UPDATE tour_templates SET keywords = $1, updated_at = NOW() WHERE id = $2", [cleanedKw, t.id]);
            console.log(`✅ Cleaned Tour ${t.id} (${t.name}): '${t.keywords}' -> '${cleanedKw}'`);
        }

        console.log("🎉 Done removing Himalaya keywords successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

fix();
