const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres'
});

async function run() {
  try {
    const ts = new Date().toISOString().replace(/-/g, '').slice(0, 8);
    const rand = () => Math.floor(1000 + Math.random() * 9000);
    
    // Add 4 more customers
    const cRes = await pool.query(`
      INSERT INTO customers (name, phone, email, customer_segment, birth_date) VALUES 
      ('Lệnh Hồ Xung', '0911222333', 'xung@example.com', 'VIP', '1990-04-15'),
      ('Nhậm Doanh Doanh', '0922333444', 'doanh@example.com', 'Platinum', '1995-04-20'),
      ('Đoàn Dự', '0933444555', 'du@example.com', 'New Customer', '1998-05-10'),
      ('Vương Ngữ Yên', '0944555666', 'yen@example.com', 'Repeat Customer', '2000-06-01')
      RETURNING id, name;
    `);
    const customers = cRes.rows;

    let tours = await pool.query('SELECT id FROM tour_templates LIMIT 2');
    if (tours.rows.length === 0) {
      await pool.query("INSERT INTO tour_templates (name, duration_days, duration_nights) VALUES ('Tour VIP Châu Âu', 10, 9)");
      await pool.query("INSERT INTO tour_templates (name, duration_days, duration_nights) VALUES ('Tour Hàn Quốc Giá Rẻ', 4, 3)");
      tours = await pool.query('SELECT id FROM tour_templates LIMIT 2');
    }
    
    let deps = await pool.query('SELECT id, tour_template_id, start_date FROM tour_departures LIMIT 3');
    if (deps.rows.length < 2) {
      await pool.query(`INSERT INTO tour_departures (tour_template_id, start_date, status) VALUES (${tours.rows[0].id}, '2026-10-01', 'Scheduled')`);
      await pool.query(`INSERT INTO tour_departures (tour_template_id, start_date, status) VALUES (${tours.rows[1].id}, '2026-11-01', 'Scheduled')`);
      deps = await pool.query('SELECT id, tour_template_id, start_date FROM tour_departures LIMIT 2');
    }
    
    const d1 = deps.rows[0];
    const d2 = deps.rows[1] || deps.rows[0];

    // Lệnh Hồ Xung - 3 bookings
    await pool.query(`INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status) 
                      VALUES ('BK-${ts}-${rand()}', ${customers[0].id}, ${d1.tour_template_id}, ${d1.id}, '${d1.start_date.toISOString()}', 2, 80000000, 'paid', 'confirmed')`);
    await pool.query(`INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status) 
                      VALUES ('BK-${ts}-${rand()}', ${customers[0].id}, ${d2.tour_template_id}, ${d2.id}, '${d2.start_date.toISOString()}', 1, 15000000, 'paid', 'confirmed')`);

    // Nhậm Doanh Doanh - 1 booking
    await pool.query(`INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status) 
                      VALUES ('BK-${ts}-${rand()}', ${customers[1].id}, ${d1.tour_template_id}, ${d1.id}, '${d1.start_date.toISOString()}', 1, 40000000, 'paid', 'confirmed')`);

    // Đoàn Dự - 0 booking

    // Vương Ngữ Yên - 2 bookings
    await pool.query(`INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status) 
                      VALUES ('BK-${ts}-${rand()}', ${customers[3].id}, ${d2.tour_template_id}, ${d2.id}, '${d2.start_date.toISOString()}', 4, 60000000, 'partially_paid', 'confirmed')`);
    
    // Add some random interaction notes
    await pool.query(`INSERT INTO lead_notes (customer_id, content, created_by) VALUES (${customers[0].id}, 'Khách yêu cầu ở phòng Tổng thống', null)`);
    await pool.query(`INSERT INTO lead_notes (customer_id, content, created_by) VALUES (${customers[0].id}, 'Đã xin Visa thành công', null)`);
    await pool.query(`INSERT INTO lead_notes (customer_id, content, created_by) VALUES (${customers[1].id}, 'Quan tâm tour Bali tháng 12', null)`);

    console.log("Seed complete");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
