const db = require('../db');

async function removeAllAssignedGuides() {
    try {
        console.log('🔄 Đang gỡ tất cả Hướng dẫn viên ảo khỏi Lịch khởi hành...');
        
        const res = await db.query('UPDATE tour_departures SET guide_id = NULL WHERE guide_id IS NOT NULL RETURNING id');
        
        console.log(`✅ Đã thu hồi / gỡ bỏ HDV thành công trên ${res.rowCount} Lịch khởi hành.`);
        console.log('👉 Lịch khởi hành đã trở lại trạng thái sạch như ban đầu!');
    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        process.exit();
    }
}

removeAllAssignedGuides();
