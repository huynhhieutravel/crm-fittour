const db = require('../db');

async function run() {
    console.log('[MIGRATION] Starting lead_reminders migration...');

    await db.query(`
        CREATE TABLE IF NOT EXISTS lead_reminders (
            id SERIAL PRIMARY KEY,
            lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
            assigned_to INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title TEXT,
            due_date TIMESTAMP NOT NULL,
            status VARCHAR(20) DEFAULT 'PENDING',
            notified_bell BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        );
    `);
    
    // Add an index for faster cron job lookups
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_lead_reminders_cron
        ON lead_reminders (due_date, notified_bell, status);
    `);

    console.log('[MIGRATION] Bảng lead_reminders OK');
}

module.exports = { run };
