const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Starting migration of op_tours.revenues to op_tour_bookings...');

    const toursRes = await client.query('SELECT id, revenues FROM op_tours');
    const tours = toursRes.rows;
    let totalBookingsInserted = 0;

    for (const tour of tours) {
      let revenues = tour.revenues;
      if (typeof revenues === 'string') {
        try { revenues = JSON.parse(revenues); } catch(e) { revenues = []; }
      }
      if (!Array.isArray(revenues)) revenues = [];
      
      let revenuesChanged = false;

      for (const b of revenues) {
        if (!b.id) continue;
        
        // Ensure id is not already inside op_tour_bookings
        const ext = await client.query('SELECT id FROM op_tour_bookings WHERE id = $1', [b.id]);
        if (ext.rows.length === 0) {
            const raw = b.raw_details || {};
            await client.query(`
                INSERT INTO op_tour_bookings (
                    id, tour_id, customer_id, name, phone, cmnd,
                    qty, base_price, surcharge, discount, total, paid,
                    status, raw_details, created_by, created_by_name,
                    created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            `, [
                b.id,
                tour.id,
                b.customer_id || null,
                b.name || null,
                b.phone || null,
                b.cmnd || null,
                Number(b.qty) || 0,
                Number(b.base_price) || 0,
                Number(b.surcharge) || 0,
                Number(b.discount) || 0,
                Number(b.total) || 0,
                Number(b.paid) || 0,
                b.status || 'Giữ chỗ',
                JSON.stringify(raw),
                b.created_by || null,
                b.created_by_name || null,
                b.created_at || new Date().toISOString(),
                b.updated_at || new Date().toISOString()
            ]);
            totalBookingsInserted++;
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Migration completed successfully! Inserted ${totalBookingsInserted} bookings into op_tour_bookings.`);
  } catch(error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
