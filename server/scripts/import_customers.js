require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const db = require('../db');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../../data_import/raw/Danh-sach-khach-hang-full.xlsx');

// Hàm tạo username
function removeAccents(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function generateUsername(fullName) {
  const words = removeAccents(fullName).toLowerCase().split(' ').filter(w => w);
  if (words.length >= 2) {
    return words[words.length - 2] + words[words.length - 1] + '.sale';
  }
  return (words[0] || 'staff') + '.sale';
}

function parseDate(dateStr) {
  if (!dateStr || String(dateStr).trim() === '') return null;
  // Xử lý chuỗi 'DD/MM/YYYY'
  const parts = String(dateStr).split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
       return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return null;
}

function cleanPhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned === '' ? null : cleaned;
}

const customUsersMapping = {
  'Võ Thị Hồng Trang': { full_name: 'Hồng Trang HI1', username: 'hi1.sale' },
  'Ngô Ngọc Đăng Huy': { full_name: 'Huy HI3', username: 'hi3.sale' },
  'Nguyễn Nhất Vũ': { full_name: 'Max Vũ HI2', username: 'hi2.sale' },
};

async function run() {
  const client = await db.pool.connect();
  try {
    console.log('--- ĐANG PHÂN TÍCH FILE EXCEL ---');
    const wb = XLSX.readFile(FILE_PATH);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    console.log(`Đã đọc ${data.length} dòng dữ liệu.`);
    
    // Gom tất cả Tên nhân viên từ Excel
    const staffSet = new Set();
    data.forEach(row => {
      const pT = row['Nhân viên phụ trách'] ? String(row['Nhân viên phụ trách']).trim() : '';
      if (pT) staffSet.add(pT);
    });

    console.log('\n--- XỬ LÝ NHÂN VIÊN PHỤ TRÁCH (USERS) ---');
    await client.query('BEGIN');
    
    // Lấy tất cả user hiện tại để đối chiếu (tránh tạo trùng username)
    const existingUsersRes = await client.query('SELECT id, full_name, username FROM users');
    let existingUsers = existingUsersRes.rows;
    const userDictByFullName = {};
    const userDictByUsername = {};
    existingUsers.forEach(u => {
       // Normalize check
       userDictByFullName[removeAccents(u.full_name).toLowerCase()] = u;
       userDictByUsername[u.username.toLowerCase()] = u;
    });

    const staffNameToUserId = {};

    for (const staffName of staffSet) {
        let matchedUser = null;
        let generatedUsername = generateUsername(staffName);
        let finalFullName = staffName;
        
        // 1. Kiểm tra Mapping Cứng
        if (customUsersMapping[staffName]) {
            generatedUsername = customUsersMapping[staffName].username;
            finalFullName = customUsersMapping[staffName].full_name;
        }

        // 2. Tìm trong DB xem Username đã tồn tại chưa
        if (userDictByUsername[generatedUsername.toLowerCase()]) {
            matchedUser = userDictByUsername[generatedUsername.toLowerCase()];
        } 
        // Tìm bằng Tên (Fuzzy match xíu)
        else if (userDictByFullName[removeAccents(finalFullName).toLowerCase()]) {
            matchedUser = userDictByFullName[removeAccents(finalFullName).toLowerCase()];
        }

        // 3. Nếu chưa tồn tại -> TẠO MỚI TÀI KHOẢN ẢO
        if (!matchedUser) {
           console.log(`-> Tạo user mới: ${finalFullName} (${generatedUsername})`);
           const salt = await bcrypt.genSalt(10);
           const hashedPwd = await bcrypt.hash('fittour123456', salt);
           const result = await client.query(`
              INSERT INTO users (username, password, full_name, role) 
              VALUES ($1, $2, $3, $4) RETURNING id, full_name, username
           `, [generatedUsername, hashedPwd, finalFullName, 'sale']);
           matchedUser = result.rows[0];
           
           // Update cache
           userDictByUsername[generatedUsername.toLowerCase()] = matchedUser;
           console.log(`    + Đã tạo ID: ${matchedUser.id}`);
        } else {
           // console.log(`-> Đã map ${staffName} với User ID: ${matchedUser.id}`);
        }
        
        staffNameToUserId[staffName] = matchedUser.id;
    }
    
    console.log('\n--- BẮT ĐẦU ĐỔ DỮ LIỆU CUSTOMER ---');
    let successCount = 0;
    
    for (const row of data) {
       const fullName = String(row['Họ và tên'] || '').trim();
       if (!fullName) continue;

       const rawPhone = cleanPhone(row['Điện thoại']);
       const email = String(row['Email'] || '').trim() || null;
       const gender = String(row['Giới tính'] || '').trim();
       const dobStr = String(row['Ngày sinh'] || '').trim();
       const birthDate = parseDate(dobStr);
       const address = [String(row['Địa chỉ'] || '').trim(), String(row['Tỉnh thành'] || '').trim()].filter(x => x).join(', ');
       const notes = String(row['Nhu cầu/Ghi chú'] || '').trim();
       const pastTrips = parseInt(row['Số Lần mua Tour'], 10) || 0;
       
       let totalRevenue = 0;
       if (row['Doanh thu']) {
          totalRevenue = Number(String(row['Doanh thu']).replace(/[^\d.-]/g, ''));
          if (isNaN(totalRevenue)) totalRevenue = 0;
       }

       const source = String(row['Nguồn khách hàng'] || '').trim();
       const segment = String(row['Loại khách hàng'] || '').trim();
       const rawAssignedTo = String(row['Nhân viên phụ trách'] || '').trim();
       const assignedToId = staffNameToUserId[rawAssignedTo] || null;
       
       const ctv = String(row['CTV'] || '').trim();
       const market = String(row['Thị trường'] || '').trim();
       const tagsRaw = String(row['Thẻ'] || '').trim();
       
       const tagsArr = [];
       if (segment) tagsArr.push(segment);
       if (tagsRaw) tagsArr.push(tagsRaw);
       if (ctv) tagsArr.push('CTV: ' + ctv);
       if (market) tagsArr.push('Thị trường: ' + market);
       
       const finalTags = tagsArr.filter(x=>x).join(', ');
       
       const internalNotesArr = [];
       if (row['CS mới nhất']) internalNotesArr.push(`CS Mới Nhất: ${row['CS mới nhất']}`);
       if (row['Ngày CS gần nhất']) internalNotesArr.push(`Ngày CS: ${row['Ngày CS gần nhất']}`);
       if (source) internalNotesArr.push(`Nguồn: ${source}`);
       
       const finalInternalNotes = internalNotesArr.filter(x=>x).join(' | ');
       
       const createdStr = parseDate(row['Ngày tạo']) || new Date().toISOString().split('T')[0];

       // Kiểm tra trùng SĐT hay không để Upsert (nếu phone !='')
       if (rawPhone) {
            // Upsert
            await client.query(`
               INSERT INTO customers (
                  name, phone, email, gender, birth_date, address, 
                  notes, internal_notes, past_trip_count, total_spent, 
                  customer_segment, tags, assigned_to, created_at
               ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
               )
               ON CONFLICT (phone) DO UPDATE SET
                  past_trip_count = COALESCE(customers.past_trip_count, 0) + EXCLUDED.past_trip_count,
                  total_spent = COALESCE(customers.total_spent, 0) + EXCLUDED.total_spent,
                  tags = (CASE WHEN EXCLUDED.tags != '' THEN COALESCE(customers.tags, '') || ' | ' || EXCLUDED.tags ELSE customers.tags END)
            `, [
               fullName, rawPhone, email, gender, birthDate, address,
               notes, finalInternalNotes, pastTrips, totalRevenue,
               segment, finalTags, assignedToId, createdStr
            ]);
       } else {
            // Insert without phone constraints
            await client.query(`
               INSERT INTO customers (
                  name, phone, email, gender, birth_date, address, 
                  notes, internal_notes, past_trip_count, total_spent, 
                  customer_segment, tags, assigned_to, created_at
               ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
               )
            `, [
               fullName, null, email, gender, birthDate, address,
               notes, finalInternalNotes, pastTrips, totalRevenue,
               segment, finalTags, assignedToId, createdStr
            ]);
       }
       successCount++;
    }
    
    await client.query('COMMIT');
    console.log(`\n--- HOÀN TẤT! ---`);
    console.log(`Đã Import và Xử lý an toàn ${successCount} khách hàng!`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LỖI KHI CHẠY SCRIPT:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
