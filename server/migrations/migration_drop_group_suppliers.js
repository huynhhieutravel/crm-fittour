const pool = require('../config/db');

async function dropGroupSuppliers() {
  try {
    console.log('Bắt đầu xóa các bảng Nhà Cung Cấp Đoàn (Group Suppliers)...');
    
    // Disable foreign key checks for dropping tables if needed (though dropping dependent tables first is better, or CASCADE)
    const tablesToDrop = [
      'group_hotel_contacts', 'group_hotels',
      'group_restaurant_contacts', 'group_restaurants',
      'group_transport_contacts', 'group_transports',
      'group_ticket_contacts', 'group_tickets',
      'group_airline_contacts', 'group_airlines',
      'group_landtour_contacts', 'group_landtours',
      'group_insurance_contacts', 'group_insurances'
    ];

    for (const table of tablesToDrop) {
      console.log(`Đang xóa bảng ${table}...`);
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`Đã xóa bảng ${table}`);
    }

    console.log('Quá trình dọn dẹp Database hoàn tất!');
  } catch (error) {
    console.error('Lỗi khi xóa bảng:', error);
  } finally {
    process.exit(0);
  }
}

dropGroupSuppliers();
