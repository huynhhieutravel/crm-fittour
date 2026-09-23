const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Add is_bu_locked to leads
        await client.query(`
            ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_bu_locked BOOLEAN DEFAULT FALSE;
        `);

        // 2. Refine BU3 keywords (remove broad generic words: công ty, cong ty, tổ chức, to chuc)
        await client.query(`
            UPDATE business_units 
            SET keywords = ARRAY['mice', 'team building', 'su kien', 'company trip', 'sự kiện', 'gala', 'hoi nghi', 'hội nghị', 'tour công ty', 'tour cong ty', 'du lịch công ty', 'du lich cong ty', 'tour đoàn', 'tour doan']::text[]
            WHERE id = 'BU3';
        `);

        // 3. For Thu Huong lead (id = 15372 on prod if exists), lock it and clear BU3
        await client.query(`
            UPDATE leads 
            SET is_bu_locked = true, bu_group = NULL 
            WHERE name ILIKE '%Thư Hương Thư%' OR name ILIKE '%Thu Hương%';
        `);

        await client.query('COMMIT');
        console.log("Migration UP successful: is_bu_locked added and BU3 keywords cleaned.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration UP failed: ", e);
        throw e;
    } finally {
        client.release();
    }
}

up().then(() => process.exit(0)).catch(() => process.exit(1));
