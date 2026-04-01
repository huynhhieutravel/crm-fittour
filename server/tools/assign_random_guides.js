const db = require('../db');

async function assignRandomGuides() {
    try {
        console.log('🔄 Bắt đầu gán ngẫu nhiên Hướng dẫn viên vào Lịch khởi hành...');
        
        // Lấy danh sách guide ID
        const guidesRes = await db.query('SELECT id FROM guides');
        const guideIds = guidesRes.rows.map(row => row.id);
        
        if (guideIds.length === 0) {
            console.log('❌ Không có HDV nào trong CSDL để gán.');
            return;
        }

        // Lấy danh sách departure ID
        const departuresRes = await db.query('SELECT id FROM tour_departures');
        const departureIds = departuresRes.rows.map(row => row.id);
        
        let successCount = 0;

        for (const depId of departureIds) {
            // Random pick 1 guide
            const randomGuideId = guideIds[Math.floor(Math.random() * guideIds.length)];
            
            await db.query('UPDATE tour_departures SET guide_id = $1 WHERE id = $2', [randomGuideId, depId]);
            successCount++;
        }

        console.log(`✅ Đã gán ngẫu nhiên HDV cho ${successCount} Lịch khởi hành.`);
        
    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        process.exit();
    }
}

assignRandomGuides();
