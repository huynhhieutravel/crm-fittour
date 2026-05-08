require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log("Starting migration: Add created_by column to tables");
    try {
        const tables = [
            'tour_templates',
            'hotels',
            'restaurants',
            'transports',
            'tickets',
            'airlines',
            'landtours',
            'insurances',
            'b2b_companies',
            'group_leaders'
        ];

        for (const table of tables) {
            console.log(`Adding created_by to ${table}...`);
            await db.query(`
                ALTER TABLE ${table} 
                ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log(`✅ Added to ${table}`);
        }

        console.log("🎉 Migration completed successfully.");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await db.end();
    }
}

migrate();
