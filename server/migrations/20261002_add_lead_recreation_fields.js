const db = require('../db');

async function up() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log("Adding columns to leads table...");
        await client.query(`
            ALTER TABLE leads 
              ADD COLUMN IF NOT EXISTS is_superseded BOOLEAN DEFAULT FALSE,
              ADD COLUMN IF NOT EXISTS replaced_by_lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
              ADD COLUMN IF NOT EXISTS origin_lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL;

            CREATE INDEX IF NOT EXISTS idx_leads_superseded ON leads(is_superseded);
            CREATE INDEX IF NOT EXISTS idx_leads_origin_lead_id ON leads(origin_lead_id);
            CREATE INDEX IF NOT EXISTS idx_leads_replaced_by_lead_id ON leads(replaced_by_lead_id);
        `);

        await client.query('COMMIT');
        console.log("Migration UP successful: is_superseded, replaced_by_lead_id, origin_lead_id added to leads.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration UP failed: ", e);
        throw e;
    } finally {
        client.release();
    }
}

up().then(() => process.exit(0)).catch((err) => {
    console.error("Migration script error:", err);
    process.exit(1);
});
