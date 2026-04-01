require('dotenv').config();
const db = require('../db');

async function clearData() {
  console.log("Starting to wipe old sample data...");
  try {
    // Xóa tour_departures trước do có foreign key ràng buộc với tour_templates (nếu có)
    await db.query('TRUNCATE TABLE tour_departures CASCADE;');
    console.log("✅ Wiped tour_departures.");
    
    // Xóa tour_templates
    await db.query('TRUNCATE TABLE tour_templates CASCADE;');
    console.log("✅ Wiped tour_templates.");
    
    // Nếu có mappings hoặc category, cứ cascade là an toàn.
  } catch (err) {
    console.error("Lỗi khi xóa dữ liệu:", err);
  } finally {
    process.exit();
  }
}

clearData();
