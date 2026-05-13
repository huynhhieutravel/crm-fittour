const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function fixDB() {
    console.log("Đang kiểm tra và tạo bảng meeting_bookings...");
    try {
        const sqlPath = path.join(__dirname, 'migrations', 'create_meeting_bookings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sql);
        console.log("✅ Đã tạo bảng meeting_bookings thành công!");
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi khi tạo bảng:", err);
        process.exit(1);
    }
}

fixDB();
