require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function fix() {
    try {
        console.log("Starting to update Sri Lanka keywords...");

        // 1. Update Tour Template: SriLanka8N8Đ
        // If it doesn't exist locally, it won't fail, just updates 0 rows
        const tourRes = await db.query(
            "UPDATE tour_templates SET keywords = 'sri lanka, srilanka, tích lan' WHERE code = 'SriLanka8N8Đ' OR name ILIKE '%sri lanka%'"
        );
        console.log(`Updated keywords for ${tourRes.rowCount} tour templates.`);

        // 2. Update BU4
        // Check current keywords
        const buRes = await db.query("SELECT keywords FROM business_units WHERE id = 'BU4'");
        if (buRes.rows.length > 0) {
            let currentKeywords = buRes.rows[0].keywords || [];
            const newKeywords = ['sri lanka', 'srilanka', 'tích lan'];
            
            // Merge without duplicates
            const mergedKeywords = [...new Set([...currentKeywords, ...newKeywords])];
            
            await db.query(
                "UPDATE business_units SET keywords = $1 WHERE id = 'BU4'",
                [mergedKeywords]
            );
            console.log("Updated keywords for BU4 successfully.");
        } else {
            console.log("BU4 not found!");
        }

        console.log("Done updating Sri Lanka keywords.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

fix();
