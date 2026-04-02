const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

async function seedMassive() {
  try {
    const usersRes = await pool.query('SELECT id FROM users');
    if (usersRes.rows.length === 0) return process.exit(1);
    const userIds = usersRes.rows.map(u => u.id);

    // Create 3 new Tour Templates
    const tRes1 = await pool.query(`INSERT INTO tour_templates (name, destination, duration, tour_type, base_price, status, code, bu_group) VALUES ('Tour VIP Châu Âu', 'Châu Âu', '10N9D', 'VIP', 85000000, 'Active', 'EU001', 'FIT Nước Ngoài') RETURNING id;`);
    const tourEU = tRes1.rows[0].id;

    // Generate Departures randomly between today - 2 weeks and today + 2 weeks
    const depIds = [];
    for(let i = -10; i <= 15; i++) {
        // Skip some days randomly but insert enough to scatter
        if (Math.random() < 0.2) continue; 
        
        const dRes = await pool.query(`
            INSERT INTO tour_departures (tour_template_id, start_date, end_date, max_participants, status, actual_price, break_even_pax) 
            VALUES ($1, CURRENT_DATE + INTERVAL '${i} days', CURRENT_DATE + INTERVAL '${i + 5} days', 35, 'Open', 85000000, 15) 
            RETURNING id, start_date;
        `, [tourEU]);
        depIds.push(dRes.rows[0].id);
    }

    const timestamp = Date.now();
    for (let j = 0; j < 50; j++) {
        // Create customer
        const cRes = await pool.query(
            `INSERT INTO customers (name, phone, email, assigned_to) VALUES ($1, $2, $3, $4) RETURNING id;`, 
            [`Khách Hàng Ngẫu Nhiên ${j}`, `099${Math.floor(Math.random() * 9000000)}`, `khach_${timestamp}_${j}@test.com`, userIds[j % userIds.length]]
        );
        const customerId = cRes.rows[0].id;

        // Assign to a random departure
        const randomDepId = depIds[Math.floor(Math.random() * depIds.length)];
        const randomPax = Math.floor(Math.random() * 4) + 1;

        await pool.query(
            `INSERT INTO bookings (customer_id, tour_id, tour_departure_id, created_at, pax_count, total_price, payment_status, booking_status, booking_code) 
             VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '${Math.floor(Math.random()*10)} days', $4, $5, 'pending', 'Thành công', $6)`, 
            [customerId, tourEU, randomDepId, randomPax, 85000000 * randomPax, `BK-${j}-${Math.floor(Math.random()*100000)}`]
        );
    }
    
    // Also fix existing max_participants that are 0
    await pool.query(`UPDATE tour_departures SET max_participants = 30 WHERE max_participants = 0 OR max_participants IS NULL;`);

    console.log('Massive Mock Data Seeded Successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMassive();
