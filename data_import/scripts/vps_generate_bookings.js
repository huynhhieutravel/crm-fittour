require('dotenv').config();
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

const customers = [
  {
    "name": "Bùi Kim Thư",
    "birth_date": "1968-04-21",
    "gender": "Nữ",
    "phone": "0912398010",
    "destinations": [
      "Á Đinh",
      "Iceland",
      "Cửu Trại",
      "Tây Tạng",
      "Kailash",
      "Nepal",
      "Bhutan",
      "Nhật",
      "Giang Tây",
      "Phúc Kiến"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Lê Thị Bích Thường",
    "birth_date": "1973-12-10",
    "gender": "Nữ",
    "phone": null,
    "destinations": [
      "Á Đinh",
      "Sơn tây",
      "Cam Túc",
      "Thanh Hải",
      "Thiểm Tây",
      "Ladakh",
      "Giang Tây",
      "Phúc Kiến"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đoàn Hồng Minh",
    "birth_date": "1990-04-12",
    "gender": "Nữ",
    "phone": "0932343654",
    "destinations": [
      "Ladakh",
      "Ai Cập",
      "Cáp Nhĩ Tân",
      "Cửu Trại"
    ],
    "notes": "khách đoàn",
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thi Thuý",
    "birth_date": "1964-06-04",
    "gender": "Nữ",
    "phone": null,
    "destinations": [
      "Á Đinh",
      "Iceland",
      "Tây Tạng",
      "Kailash",
      "Cáp Nhĩ Tân",
      "..."
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Trần Thục Hiền",
    "birth_date": "1978-12-20",
    "gender": "Nữ",
    "phone": "0918226658",
    "destinations": [
      "Tân Cương",
      "tây Tạng",
      "Giang Tây",
      "Phúc Kiến"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Hồng Huệ (andy)",
    "birth_date": "1980-09-27",
    "gender": "Nữ",
    "phone": "0908161366",
    "destinations": [
      "Iceland",
      "Giang Tây",
      "Phúc Kiến",
      "Bắc Kinh"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Phước Ái Vy",
    "birth_date": "1978-04-18",
    "gender": "Nữ",
    "phone": null,
    "destinations": [
      "Cáp Nhĩ Tân",
      "Ladakh",
      "Bromo"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thị Xuân Lộc",
    "birth_date": "1971-12-27",
    "gender": "Nữ",
    "phone": null,
    "destinations": [
      "Cáp Nhĩ Tân",
      "Ladakh",
      "Á Đinh",
      "Bromo"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Từ Thị Thảo",
    "birth_date": "1972-04-06",
    "gender": "Nữ",
    "phone": "0909962445",
    "destinations": [
      "Cáp Nhĩ Tân",
      "Ladakh",
      "Ai Cập",
      "Bromo"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thị Hằng",
    "birth_date": "1971-07-20",
    "gender": "Nữ",
    "phone": "0903125282",
    "destinations": [
      "ladakh",
      "Ai Cập",
      "Kailash",
      "Cửu Trại",
      "Nhật"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Châu Thanh Phương",
    "birth_date": "1989-01-21",
    "gender": "Nữ",
    "phone": "0906981299",
    "destinations": [
      "ladakh",
      "Bắc Kinh",
      "Thượng Hải",
      "Kailash",
      "Tây Trạng"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Lê Thị Vân Anh",
    "birth_date": "1963-06-02",
    "gender": "Nữ",
    "phone": "0903720704",
    "destinations": [
      "Nam Mỹ",
      "Á Đinh",
      "Kailash",
      "Cáp Nhĩ Tân",
      "Nhật",
      "Tân Cương"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Ngân Trần",
    "birth_date": "1969-08-13",
    "gender": "Nữ",
    "phone": "0907737332",
    "destinations": [
      "GIANG NAM 22/11",
      "15Pax series"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thị Tuyết Ngân",
    "birth_date": "1990-04-28",
    "gender": "nữ",
    "phone": "0913799427",
    "destinations": [
      "Đi 2 tour bên FIT và làm visa TQ nhiều lần"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Võ Minh Anh",
    "birth_date": "1998-05-18",
    "gender": "nữ",
    "phone": "0938679678",
    "destinations": [
      "Tân Cương 10/1",
      "chuẩn bị đi tour tiếp theo"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đinh Nguyễn Thảo Vy",
    "birth_date": "1994-11-02",
    "gender": "Nữ",
    "phone": "0906908311",
    "destinations": [
      "Đi 3 tour bên FIT"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Trần Tuấn Anh",
    "birth_date": "1993-05-14",
    "gender": "Nam",
    "phone": "0839997777",
    "destinations": [
      "Đi 2 tour bên FIT",
      "làm visa Dubai",
      "TQ",
      "chuẩn bị đi các tour tiếp theo"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Diệu Linh",
    "birth_date": null,
    "gender": "Nữ",
    "phone": "0917416468",
    "destinations": [
      "Trưởng nhóm cho tour Giang Nam 6pax",
      "đi NB..."
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thu Trang",
    "birth_date": "1998-02-07",
    "gender": "Nữ",
    "phone": "0981917679",
    "destinations": [
      "Trưởng nhóm cho tour Giang Nam",
      "đang xem các tour 2026"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Phan Thị Kiều Oanh",
    "birth_date": "1970-08-06",
    "gender": "Nữ",
    "phone": "0936913619",
    "destinations": [
      "Trưởng nhóm cho tour Giang Nam 22/11",
      "nhóm GĐ"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đặng Khánh Mai",
    "birth_date": "2002-01-31",
    "gender": "Nữ",
    "phone": "0918034294",
    "destinations": [
      "Đi tour Private",
      "nhóm GĐ",
      "muốn đi Châu Âu"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đặng Thị Mai Hoa",
    "birth_date": "1994-04-27",
    "gender": "Nữ",
    "phone": "0937798766",
    "destinations": [
      "Đi tour Private",
      "nhóm GĐ",
      "muốn đi Châu Âu"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Dương Thị Diễm Sương",
    "birth_date": "1999-10-05",
    "gender": "Nữ",
    "phone": "0899489948",
    "destinations": [
      "Đi tour nhiều lần",
      "làm visa TQ nhiều lần"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đinh Thị Tuyết Mai",
    "birth_date": "1977-07-22",
    "gender": "Nữ",
    "phone": "0979368666",
    "destinations": [
      "Trưởng nhóm GĐ",
      "đi bên FIT 2lần"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Duy Hoàng",
    "birth_date": "1988-07-08",
    "gender": "Nam",
    "phone": "0903 220078",
    "destinations": [
      "NHẬT BẢN 2023",
      "GIANG NAM PRIAVTE T3"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Hồ Nguyễn Quỳnh Phương",
    "birth_date": "1989-11-05",
    "gender": "Nữ",
    "phone": "0908 01 8889",
    "destinations": [
      "CỬU TRẠI CÂU (20/3/2025). NHẬT (03/04/2026)"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Lâm Trần Tuyết Vi",
    "birth_date": "1989-06-19",
    "gender": "Nữ",
    "phone": "0909005058",
    "destinations": [
      "LE GIANG 21/2/2026"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thị Bích Phương",
    "birth_date": "1992-12-21",
    "gender": "Nữ",
    "phone": "0978988216",
    "destinations": [
      "GIANG NAM 21/3/2026"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Cao Công Danh",
    "birth_date": "1992-10-21",
    "gender": "Nam",
    "phone": "0987336355",
    "destinations": [
      "GIANG NAM 21/3",
      "LADAKH 13/9"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thuý Anh",
    "birth_date": "1990-04-05",
    "gender": "Nữ",
    "phone": "0919904088",
    "destinations": [
      "TÂY AN 9 KHÁCH 13/4"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đặng Tố Trinh",
    "birth_date": "1964-01-18",
    "gender": "Nữ",
    "phone": "0912388436",
    "destinations": [
      "Á DINH 14/6",
      "BHUTAN 26/9"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Phạm Ngọc Thạch",
    "birth_date": "1980-10-15",
    "gender": "Nam",
    "phone": "0908295383",
    "destinations": [
      "GIANG TÂY 6/11",
      "VÕ ĐANG 26/3"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Cao Minh Thuý Vy",
    "birth_date": "1995-10-08",
    "gender": "Nữ",
    "phone": "0773557958",
    "destinations": [
      "GIANG NAM",
      "NHẬT BẢN"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Thị Nhương",
    "birth_date": "1995-09-08",
    "gender": "Nữ",
    "phone": "0396979811",
    "destinations": [
      "CNT 27/12"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Nguyễn Phước Ngọc",
    "birth_date": "1983-11-16",
    "gender": "Nữ",
    "phone": "0936291977",
    "destinations": [
      "CNT 27/13"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Đặng Thị Thu Hương",
    "birth_date": "1979-09-23",
    "gender": "Nữ",
    "phone": "0904134564",
    "destinations": [
      "CNT 27/14"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  },
  {
    "name": "Trần Thế Minh",
    "birth_date": "1983-05-30",
    "gender": "Nữ",
    "phone": "0918705252",
    "destinations": [
      "LADAKH13/9"
    ],
    "notes": null,
    "tags": "BU1, VIP",
    "past_trip_count": 0
  }
];
const destinations = [
  "Á Đinh",
  "Iceland",
  "Cửu Trại",
  "Tây Tạng",
  "Kailash",
  "Nepal",
  "Bhutan",
  "Nhật",
  "Giang Tây",
  "Phúc Kiến",
  "Sơn tây",
  "Cam Túc",
  "Thanh Hải",
  "Thiểm Tây",
  "Ladakh",
  "Ai Cập",
  "Cáp Nhĩ Tân",
  "...",
  "Tân Cương",
  "tây Tạng",
  "Bắc Kinh",
  "Bromo",
  "ladakh",
  "Thượng Hải",
  "Tây Trạng",
  "Nam Mỹ",
  "GIANG NAM 22/11",
  "15Pax series",
  "Đi 2 tour bên FIT và làm visa TQ nhiều lần",
  "Tân Cương 10/1",
  "chuẩn bị đi tour tiếp theo",
  "Đi 3 tour bên FIT",
  "Đi 2 tour bên FIT",
  "làm visa Dubai",
  "TQ",
  "chuẩn bị đi các tour tiếp theo",
  "Trưởng nhóm cho tour Giang Nam 6pax",
  "đi NB...",
  "Trưởng nhóm cho tour Giang Nam",
  "đang xem các tour 2026",
  "Trưởng nhóm cho tour Giang Nam 22/11",
  "nhóm GĐ",
  "Đi tour Private",
  "muốn đi Châu Âu",
  "Đi tour nhiều lần",
  "làm visa TQ nhiều lần",
  "Trưởng nhóm GĐ",
  "đi bên FIT 2lần",
  "NHẬT BẢN 2023",
  "GIANG NAM PRIAVTE T3",
  "CỬU TRẠI CÂU (20/3/2025). NHẬT (03/04/2026)",
  "LE GIANG 21/2/2026",
  "GIANG NAM 21/3/2026",
  "GIANG NAM 21/3",
  "LADAKH 13/9",
  "TÂY AN 9 KHÁCH 13/4",
  "Á DINH 14/6",
  "BHUTAN 26/9",
  "GIANG TÂY 6/11",
  "VÕ ĐANG 26/3",
  "GIANG NAM",
  "NHẬT BẢN",
  "CNT 27/12",
  "CNT 27/13",
  "CNT 27/14",
  "LADAKH13/9"
];

async function run() {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        let destMap = {}; // name -> departure_id

        // 1. Create Templates & Departures for all unique destinations
        console.log('Tạo Lịch trình và Lịch khởi hành...');
        for (const dest of destinations) {
            // Find existing or create template
            const templateName = `[Tour Cũ] ${dest}`;
            let res = await client.query('SELECT id FROM tour_templates WHERE name = $1 LIMIT 1', [templateName]);
            let tplId;
            if (res.rows.length === 0) {
                const insRes = await client.query(
                    `INSERT INTO tour_templates (name, status, is_active, description) VALUES ($1, 'archived', false, 'Tour cũ map từ dữ liệu lịch sử') RETURNING id`,
                    [templateName]
                );
                tplId = insRes.rows[0].id;
            } else {
                tplId = res.rows[0].id;
            }

            // Create departure (2025-01-01)
            let depRes = await client.query('SELECT id FROM tour_departures WHERE tour_template_id = $1 AND start_date = \'2025-01-01\' LIMIT 1', [tplId]);
            let depId;
            if (depRes.rows.length === 0) {
                const insDep = await client.query(
                    `INSERT INTO tour_departures (tour_template_id, start_date, end_date, status, code, price_adult) 
                     VALUES ($1, '2025-01-01', '2025-01-05', 'Completed', $2, 0) RETURNING id`,
                    [tplId, 'LEGACY-' + tplId]
                );
                depId = insDep.rows[0].id;
            } else {
                depId = depRes.rows[0].id;
            }

            destMap[dest] = depId;
        }

        let insertedCustomers = 0;
        let insertedBookings = 0;

        // 2. Insert Customers & Bookings
        console.log('Chèn thông tin Khách hàng và Lịch sử Booking...');
        for (const c of customers) {
            // Check if customer exists by phone or create new string
            let custId;
            if (c.phone) {
                let existing = await client.query('SELECT id FROM customers WHERE phone = $1', [c.phone]);
                if (existing.rows.length > 0) {
                    custId = existing.rows[0].id; // update? Or just use existing
                }
            }
            if (!custId) {
                const insCust = await client.query(
                    `INSERT INTO customers (name, birth_date, gender, phone, past_trip_count, notes, tags) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id`,
                    [c.name, c.birth_date, c.gender, c.phone, c.past_trip_count, c.notes, c.tags]
                );
                custId = insCust.rows[0].id;
                insertedCustomers++;
            }
            
            // 3. Create Bookings
            if (c.destinations && c.destinations.length > 0) {
                for (const destName of c.destinations) {
                    const depId = destMap[destName];
                    const bookingCode = 'LEGACY-' + custId + '-' + depId;
                    
                    // Check if already booked
                    const bkRes = await client.query('SELECT id FROM bookings WHERE booking_code = $1', [bookingCode]);
                    if (bkRes.rows.length === 0) {
                        const tplRes = await client.query('SELECT tour_template_id FROM tour_departures WHERE id = $1', [depId]);
                        const tplId = tplRes.rows[0].tour_template_id;
                        await client.query(
                            `INSERT INTO bookings (customer_id, tour_id, tour_departure_id, booking_code, booking_status, payment_status, pax_count, total_price)
                             VALUES ($1, $2, $3, $4, 'confirmed', 'paid', 1, 0)`,
                            [custId, tplId, depId, bookingCode]
                        );
                        insertedBookings++;
                    }
                }
            }
        }

        await client.query('COMMIT');
        console.log(`Đã hoàn thành! Nạp ${insertedCustomers} Khách hàng mới và tạo ${insertedBookings} Lịch sử Đặt Tour.`);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Lỗi nghiêm trọng, đã Rollback:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}
run();
