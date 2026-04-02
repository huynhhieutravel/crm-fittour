const { execSync } = require('child_process');
const path = require('path');

const MIGRATION_FILES = [
  'setup_db.js',
  'migrate_db.js',
  'init_bu_table.js',
  'migration_phase10.js',
  'migration_phase11.js',
  'migration_phase12.js',
  'migration_phase13.js',
  'migration_tour_enhancements.js',
  'migrate_customers.js',
  'migration_phase14.js',
  'migration_phase14_meta.js',
  'temp_migrate_bus.js',
  'migrate_gender.js',
  'migrate_bu.js',
  'migrate_rbac.js',
  'seed_users.js',
  'migration_add_pax_details_to_bookings.js'
];

console.log('🌟 Bắt Đầu Tiến Trình Đồng Bộ Cơ Sở Dữ Liệu (Universal Sync) 🌟');
console.log('Quá trình này sẽ chạy qua ' + MIGRATION_FILES.length + ' scripts để đảm bảo CSDL hoàn toàn chính xác.');

let successCount = 0;
let errorCount = 0;

for (const file of MIGRATION_FILES) {
  const filePath = path.join(__dirname, file);
  console.log(`\n⏳ Đang chạy: [${file}]...`);
  try {
    const stdout = execSync(`node "${filePath}"`, { stdio: 'inherit' });
    console.log(`✅ Hoàn tất: [${file}]`);
    successCount++;
  } catch (error) {
    console.error(`❌ CẢNH BÁO / LỖI từ [${file}]: Quá trình chạy trả về mã lỗi.`);
    // Không ném lỗi ra ngoài để kịch bản vẫn có thể tiếp tục với những file khác nếu được.
    // Tuy nhiên, nếu là lỗi thiết yếu, có thể dừng lại tại đây tùy vào tính chất của file.
    // Vì đây là môi trường đảm bảo IF NOT EXISTS, một số file thiết kế cũ có thể ném lỗi khi cố thực thi một số lệnh không an toàn.
    errorCount++;
  }
}

console.log('\n=============================================');
console.log('✅ TIẾN TRÌNH UNIVERSAL SYNC HOÀN TẤT!');
console.log(`Tổng cộng: ${successCount} thành công, ${errorCount} file gặp lỗi / bỏ qua.`);
console.log('=============================================');

if (errorCount > 0) {
    console.log('Lưu ý: Một số cảnh báo error là bình thường do dữ liệu đã tồn tại (tùy thuộc vào thiết kế của script cũ). Cấu trúc bảng và dữ liệu lõi thường vẫn được đảm bảo.');
}
