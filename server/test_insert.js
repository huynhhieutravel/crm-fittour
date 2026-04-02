const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const mockEvent = {
  customer_id: 45,
  title: 'test event frontend',
  event_type: 'CALL',
  event_date: '2026-04-03',
  description: 'this is a test desc'
};
(async () => {
    try {
        const result = await pool.query(
            `INSERT INTO customer_events (customer_id, title, event_type, event_date, description, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [mockEvent.customer_id, mockEvent.title, mockEvent.event_type, mockEvent.event_date, mockEvent.description, 1]
        );
        console.log("SUCCESS:", result.rows[0]);
    } catch (e) {
        console.error("ERROR:", e);
    } finally {
        pool.end();
    }
})();
