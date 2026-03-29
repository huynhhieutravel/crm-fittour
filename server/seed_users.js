const db = require('./db');
const bcrypt = require('bcryptjs');

const usersToSeed = [
  // Admins
  { username: 'admin', full_name: 'Administrator', email: 'admin@fittour.com.vn', role_id: 1 },
  { username: 'luan.admin', full_name: 'Nguyễn Thành Luân', email: 'luan.admin@fittour.com.vn', role_id: 1 },
  
  // Managers
  { username: 'hieu.manager', full_name: 'Trọng Hiếu Manager', email: 'hieu.manager@fittour.com.vn', role_id: 2 },
  { username: 'vy.manager', full_name: 'Thảo Vy Manager', email: 'vy.manager@fittour.com.vn', role_id: 2 },
  
  // Staff
  { username: 'nhan.staff', full_name: 'Thành Nhân Staff', email: 'nhan.staff@fittour.com.vn', role_id: 3 },
  { username: 'phuong.staff', full_name: 'Minh Phương Staff', email: 'phuong.staff@fittour.com.vn', role_id: 3 },
  
  // Sales
  { username: 'linh.sale', full_name: 'Thùy Linh Sale', email: 'linh.sale@fittour.com.vn', role_id: 4 },
  { username: 'tung.sale', full_name: 'Thanh Tùng Sale', email: 'tung.sale@fittour.com.vn', role_id: 4 },
  { username: 'huyen.sale', full_name: 'Khánh Huyền Sale', email: 'huyen.sale@fittour.com.vn', role_id: 4 },
  { username: 'vinh.sale', full_name: 'Quang Vinh Sale', email: 'vinh.sale@fittour.com.vn', role_id: 4 },
  { username: 'mai.sale', full_name: 'Ngọc Mai Sale', email: 'mai.sale@fittour.com.vn', role_id: 4 },
  { username: 'nam.sale', full_name: 'Hoài Nam Sale', email: 'nam.sale@fittour.com.vn', role_id: 4 }
];

const DEFAULT_PASSWORD = 'admin123';

async function seedUsers() {
  console.log('--- Bắt đầu nạp dữ liệu nhân viên (Seed Users) ---');
  
  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    for (const user of usersToSeed) {
      // Kiểm tra xem username đã tồn tại chưa
      const checkRes = await db.query('SELECT id FROM users WHERE username = $1', [user.username]);
      
      if (checkRes.rows.length > 0) {
        console.log(`[!] Tài khoản "${user.username}" đã tồn tại. Cập nhật thông tin...`);
        await db.query(
          'UPDATE users SET full_name = $1, email = $2, role_id = $3, password = $4 WHERE username = $5',
          [user.full_name, user.email, user.role_id, hashedPassword, user.username]
        );
      } else {
        console.log(`[+] Đang tạo tài khoản mới: "${user.username}"...`);
        await db.query(
          'INSERT INTO users (username, password, full_name, email, role_id) VALUES ($1, $2, $3, $4, $5)',
          [user.username, hashedPassword, user.full_name, user.email, user.role_id]
        );
      }
    }
    
    console.log('--- ✅ Nạp dữ liệu hoàn tất! ---');
  } catch (err) {
    console.error('--- ❌ Lỗi khi nạp dữ liệu:', err.message);
  } finally {
    process.exit();
  }
}

seedUsers();
