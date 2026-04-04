require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const XLSX = require('xlsx');
const db = require('../db');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../../data_import/raw/Danh-sach-khach-hang-full.xlsx');

function cleanPhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned === '' ? null : cleaned;
}

function parsePax(notes) {
  if (!notes) return 1; // Default
  const match = String(notes).toLowerCase().match(/(\d+)\s*(pax|người|khách)/);
  if (match) {
    return parseInt(match[1], 10) || 1;
  }
  return 1;
}

async function run() {
  const client = await db.pool.connect();
  try {
    console.log('--- ĐANG ĐỌC LẠI FILE EXCEL ---');
    const wb = XLSX.readFile(FILE_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    console.log('--- TẢI KHÁCH HÀNG TỪ DATABASE ---');
    const custRes = await client.query('SELECT id, phone, name FROM customers');
    const custByPhone = {};
    const custByName = {};
    custRes.rows.forEach(c => {
       if (c.phone) custByPhone[c.phone] = c.id;
       custByName[c.name.trim().toLowerCase()] = c.id;
    });

    const marketMap = {}; // name -> departureId

    async function getOrCreateDeparture(marketName) {
       let mName = (marketName || '').trim().replace(/,$/, '').trim();
       if (!mName) mName = 'Khác (Chưa xác định)';

       const templateName = `[Tour Cũ] ${mName}`;

       if (marketMap[templateName]) return marketMap[templateName];

       // Find template
       let tmplRes = await client.query('SELECT id FROM tour_templates WHERE name = $1 LIMIT 1', [templateName]);
       let templateId;
       if (tmplRes.rows.length === 0) {
           const ins = await client.query(`
              INSERT INTO tour_templates (name, duration, description, is_active)
              VALUES ($1, $2, $3, $4) RETURNING id
           `, [templateName, 'Lịch sử', 'Dữ liệu quá khứ từ tệp Excel', false]);
           templateId = ins.rows[0].id;
           console.log(`+ Đã tạo Template Sản Phẩm: ${templateName}`);
       } else {
           templateId = tmplRes.rows[0].id;
       }

       // Find departure for this template on 2025-01-01
       let depRes = await client.query(`
          SELECT id FROM tour_departures 
          WHERE tour_template_id = $1 AND start_date = '2025-01-01' LIMIT 1
       `, [templateId]);
       let departureId;
       if (depRes.rows.length === 0) {
           const pins = await client.query(`
              INSERT INTO tour_departures (
                 tour_template_id, start_date, end_date, max_participants, status, notes
              ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
           `, [templateId, '2025-01-01', '2025-01-05', 999, 'Completed', 'Booking từ File Nhập Tự động']);
           departureId = pins.rows[0].id;
           console.log(`  -> Đã tạo Lịch Khởi Hành cho: ${templateName}`);
       } else {
           departureId = depRes.rows[0].id;
       }

       marketMap[templateName] = departureId;
       return departureId;
    }

    await client.query('BEGIN');
    let updatedNotes = 0;
    let createdBookings = 0;

    console.log('--- ĐANG QUÉT NOTES & TẠO BOOKINGS ---');
    
    for (const row of data) {
       const fullName = String(row['Họ và tên'] || '').trim();
       const rawPhone = cleanPhone(row['Điện thoại']);
       let customerId = null;

       if (rawPhone && custByPhone[rawPhone]) {
          customerId = custByPhone[rawPhone];
       } else if (fullName && custByName[fullName.toLowerCase()]) {
          customerId = custByName[fullName.toLowerCase()];
       }

       if (!customerId) continue;

       const notes = String(row['Nhu cầu/Ghi chú'] || '').trim();
       const market = String(row['Thị trường'] || '').replace(/,$/, '').trim();
       
       let totalRevenue = 0;
       if (row['Doanh thu']) {
          totalRevenue = Number(String(row['Doanh thu']).replace(/[^\d.-]/g, ''));
          if (isNaN(totalRevenue)) totalRevenue = 0;
       }

       // 1. Cập nhật Note nếu sót
       if (notes) {
          await client.query(`
             UPDATE customers 
             SET notes = (CASE WHEN notes NOT LIKE '%' || $1 || '%' THEN COALESCE(notes, '') || '\n[Ghi chú cũ]: ' || $1 ELSE notes END)
             WHERE id = $2
          `, [notes, customerId]);
          updatedNotes++;
       }

       // 2. Tạo Booking
       let usedMarket = market;
       if (!usedMarket && notes) {
           const words = ['TAIWAN', 'HÀN QUỐC', 'NHẬT BẢN', 'CHÂU ÂU', 'MỸ', 'ÚC', 'SINGAPORE', 'THÁI LAN', 'BALI', 'TRUNG QUỐC', 'MOROCCO', 'LỆ GIANG', 'CỬU TRẠI', 'TÂY TẠNG'];
           for (const w of words) {
               if (notes.toUpperCase().includes(w)) { usedMarket = w; break; }
           }
       }
       
       const depId = await getOrCreateDeparture(usedMarket);
       const paxCount = parsePax(notes);
       const bookingCode = 'EXCEL-' + customerId + '-' + Math.floor(Math.random()*1000);

       // Check if booking already exists for this customer in this departure to avoid dupes
       const bExists = await client.query('SELECT id FROM bookings WHERE customer_id = $1 AND tour_departure_id = $2', [customerId, depId]);
       
       if (bExists.rows.length === 0) {
           const query = `
              INSERT INTO bookings (
                 booking_code,
                 customer_id,
                 tour_departure_id,
                 booking_status,
                 payment_status,
                 pax_count,
                 total_price,
                 notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           `;
           await client.query(query, [bookingCode, customerId, depId, 'completed', 'paid', paxCount, totalRevenue, notes]);
           createdBookings++;
       }
    }

    await client.query('COMMIT');
    console.log('\n--- HOÀN TẤT ---');
    console.log(`Đã Cập nhật lại Ghi chú cho: ${updatedNotes} khách hàng`);
    console.log(`Đã Tự động tạo: ${createdBookings} Đơn Booking cũ!`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LỖI KHI CẬP NHẬT:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
