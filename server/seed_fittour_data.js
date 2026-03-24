const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load .env from current directory
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('--- Cleaning old data (optional) ---');
    // Delete existing sample records to avoid clutter
    await client.query("DELETE FROM lead_notes WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE '%Sample%' OR name LIKE '%Nguyễn Văn Hùng%')");
    await client.query("DELETE FROM leads WHERE name LIKE '%Sample%' OR name LIKE '%Nguyễn Văn Hùng%'");
    await client.query("DELETE FROM bookings WHERE tour_id IN (SELECT id FROM tour_templates WHERE name LIKE '%Tour%')");
    await client.query("DELETE FROM tour_departures WHERE tour_template_id IN (SELECT id FROM tour_templates WHERE name LIKE '%Tour%')");
    await client.query("DELETE FROM tour_templates WHERE name LIKE '%Tour%'");

    console.log('--- Seeding Tour Templates ---');
    const templates = [
      ['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping', 'Nhật Bản', '6N5Đ', 'Premium', 'Sakura, No Shopping, Luxury', 35000000],
      ['Tour Bắc Kinh 5N4Đ trọn gói – KS 4-5 sao – Bay thẳng', 'Trung Quốc', '5N4Đ', 'Standard', 'Great Wall, Forbidden City', 18000000],
      ['Tour du lịch Ai Cập 12 ngày 11 đêm', 'Ai Cập', '12N11Đ', 'Premium', 'Pyramids, Nile Cruise', 65000000],
      ['Tour Maroc 12N11Đ trọn gói – KS 4 sao', 'Maroc', '12N11Đ', 'Standard', 'Sahara, Blue City', 75000000],
      ['Tour Giang Nam 5 ngày – Khách sạn 4 sao, NO SHOPPING', 'Trung Quốc', '5N4Đ', 'Standard', 'Water Towns, No Shopping', 15000000],
      ['Tour Bhutan 5N4Đ trọn gói – Bay thẳng từ TP.HCM', 'Bhutan', '5N4Đ', 'Premium', 'Happiness, Temple, Trekking', 55000000],
      ['Tour núi lửa Bromo 6 ngày 5 đêm – Hành trình Trekking', 'Indonesia', '6N5Đ', 'Budget', 'Trekking, Volcano, Nature', 22000000],
      ['Tour Thổ Nhĩ Kỳ 10N9Đ trọn gói – Khách sạn 4-5 sao', 'Thổ Nhĩ Kỳ', '10N9Đ', 'Standard', 'Balloons, History', 45000000],
      ['Tour Nam Mỹ 14N13Đ cao cấp đi qua Brazil, Peru, Argentina', 'Nam Mỹ', '14N13Đ', 'Premium', 'Amazon, Machu Picchu, Iguazu', 185000000],
      ['Tour Chuyến Tàu Thanh Tạng 10N9Đ – Trạm căn cứ EBC', 'Tây Tạng', '10N9Đ', 'Standard', 'Train, Everest, Culture', 58000000]
    ];

    const templateIds = {};
    for (const [name, dest, dur, type, tags, price] of templates) {
      const res = await client.query(
        "INSERT INTO tour_templates (name, destination, duration, tour_type, tags, base_price, itinerary, highlights, inclusions, exclusions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
        [name, dest, dur, type, tags, price, '{}', 'Hành trình tuyệt vời...', 'Bao gồm vé máy bay...', 'Không bao gồm tip...']
      );
      templateIds[name] = res.rows[0].id;
    }

    console.log('--- Seeding Tour Departures (2026) ---');
    const departures = [
      [templateIds['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping'], '2026-03-16', '2026-03-21', 'Open', 20, 35000000],
      [templateIds['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping'], '2026-03-18', '2026-03-23', 'Open', 20, 35000000],
      [templateIds['Tour Bắc Kinh 5N4Đ trọn gói – KS 4-5 sao – Bay thẳng'], '2026-03-17', '2026-03-21', 'Open', 25, 18000000],
      [templateIds['Tour du lịch Ai Cập 12 ngày 11 đêm'], '2026-03-20', '2026-03-31', 'Open', 15, 65000000],
      [templateIds['Tour Maroc 12N11Đ trọn gói – KS 4 sao'], '2026-03-20', '2026-03-31', 'Open', 15, 75000000],
      [templateIds['Tour Giang Nam 5 ngày – Khách sạn 4 sao, NO SHOPPING'], '2026-03-21', '2026-03-25', 'Open', 25, 15000000],
      [templateIds['Tour Bhutan 5N4Đ trọn gói – Bay thẳng từ TP.HCM'], '2026-03-25', '2026-03-29', 'Open', 15, 55000000],
      
      [templateIds['Tour núi lửa Bromo 6 ngày 5 đêm – Hành trình Trekking'], '2026-04-03', '2026-04-08', 'Open', 12, 22000000],
      [templateIds['Tour Thổ Nhĩ Kỳ 10N9Đ trọn gói – Khách sạn 4-5 sao'], '2026-04-05', '2026-04-14', 'Open', 20, 45000000],
      [templateIds['Tour Nam Mỹ 14N13Đ cao cấp đi qua Brazil, Peru, Argentina'], '2026-04-21', '2026-05-04', 'Open', 10, 185000000],
      [templateIds['Tour Chuyến Tàu Thanh Tạng 10N9Đ – Trạm căn cứ EBC'], '2026-04-23', '2026-05-02', 'Open', 15, 58000000]
    ];

    const departureIds = [];
    for (const [tid, start, end, status, max, price] of departures) {
      const res = await client.query(
        "INSERT INTO tour_departures (tour_template_id, start_date, end_date, status, max_participants, actual_price, discount_price, min_participants, break_even_pax) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
        [tid, start, end, status, max, price, 0, 10, 12]
      );
      departureIds.push(res.rows[0].id);
    }

    console.log('--- Seeding 10 Real Leads ---');
    const leads = [
      ['Nguyễn Văn Hùng', '0912345678', 'hung.nv@gmail.com', 'Hotline', 'Chốt đơn', 'BU1', 'Hồ sơ cá nhân'],
      ['Trần Thị Lan', '0987654321', 'lan.tran@yahoo.com', 'Messenger', 'Đã tư vấn', 'BU2', 'Thường xuyên đi Nhật'],
      ['Lê Minh Triết', '0903112233', 'triet.le@outlook.com', 'Zalo', 'Mới', 'BU3', 'Muốn đi Ai Cập'],
      ['Phạm Hoàng Nam', '0944556677', 'nam.pham@gmail.com', 'Khách giới thiệu', 'Tiềm năng', 'BU1', 'Quan tâm Nam Mỹ'],
      ['Vũ Minh Anh', '0123456000', 'minhanh.vu@gmail.com', 'Messenger', 'Chốt đơn', 'BU4', 'Thích trekking Bromo'],
      ['Đặng Thu Thảo', '0888999000', 'thao.dang@gmail.com', 'Messenger', 'Tư vấn lần 2', 'BU2', 'Hỏi về Bhutan'],
      ['Bùi Xuân Huấn', '0777666555', 'huan.rose@gmail.com', 'Hotline', 'Mới', 'BU3', 'Thích Tây Tạng'],
      ['Ngô Thanh Vân', '0999888777', 'van.ngo@gmail.com', 'Zalo', 'Tiền cọc', 'BU1', 'Gia đình 4 người đi Nhật'],
      ['Lý Hải', '0933221100', 'hai.ly@gmail.com', 'Messenger', 'Đã tư vấn', 'BU4', 'Tour cao cấp Maroc'],
      ['Trương Mỹ Lan', '0911222333', 'lan.truong@vtp.vn', 'Messenger', 'Mới', 'BU2', 'Đi Thổ Nhĩ Kỳ 10 ngày']
    ];

    for (const [name, phone, email, source, status, bu, note] of leads) {
      await client.query(
        "INSERT INTO leads (name, phone, email, source, status, bu_group, classification, consultation_note, tour_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [name, phone, email, source, status, bu, 'VIP', note, templateIds['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping']]
      );
    }

    console.log('--- Seeding Sample Customers & Bookings for Occupancy ---');
    // We need 1 customer to make bookings
    const custRes = await client.query(
      "INSERT INTO customers (name, phone, email, nationality, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['Khách Hàng Mẫu', '0900000000', 'mau@example.com', 'Việt Nam', 'Người đại diện']
    );
    const customerId = custRes.rows[0].id;

    // Add 15 pax to the first Japan tour
    await client.query(
      "INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      ['BK001', customerId, departureIds[0], templateIds['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping'], '2026-03-16', 15, 15 * 35000000, 'confirmed']
    );

    // Add 12 pax to second Japan tour
    await client.query(
      "INSERT INTO bookings (booking_code, customer_id, tour_departure_id, tour_id, start_date, pax_count, total_price, booking_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      ['BK002', customerId, departureIds[1], templateIds['Tour Nhật Bản Mùa Xuân 6N5Đ – Bay Vietnam Airlines – No Shopping'], '2026-03-18', 12, 12 * 35000000, 'confirmed']
    );

    console.log('--- Data Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
