require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function updateBU2Keywords() {
    try {
        console.log("=== BẮT ĐẦU CẬP NHẬT TỪ KHÓA CHO BU2 (LOẠI BỎ TỪ ĐƠN NHẬT) ===");

        const buRes = await db.query("SELECT id, label, countries, keywords FROM business_units WHERE id = 'BU2'");
        if (buRes.rows.length === 0) {
            console.error("❌ Không tìm thấy BU2 trong DB!");
            process.exit(1);
        }

        const currentKeywords = buRes.rows[0].keywords || [];
        
        // 1. Loại bỏ triệt để từ đơn 'nhật' và 'nhat'
        const filteredKeywords = currentKeywords.filter(k => {
            const lower = (k || '').toLowerCase().trim();
            return lower !== 'nhật' && lower !== 'nhat';
        });

        // 2. Thêm các từ khóa ghép rõ ràng về Nhật Bản
        const safeJapanKeywords = [
            'nhật bản', 'nhat ban',
            'tour nhật', 'tour nhat',
            'đi nhật', 'di nhat',
            'du lịch nhật', 'du lich nhat',
            'japan',
            'tokyo', 'osaka', 'kyoto', 'hokkaido', 'fuji'
        ];

        const mergedKeywords = [...new Set([...filteredKeywords, ...safeJapanKeywords])].sort();

        await db.query(
            "UPDATE business_units SET keywords = $1, updated_at = NOW() WHERE id = 'BU2'",
            [mergedKeywords]
        );

        console.log(`✅ Đã cập nhật từ khóa cho BU2 (${mergedKeywords.length} từ khóa):`);
        console.log(JSON.stringify(mergedKeywords, null, 2));
        console.log("=== HOÀN TẤT ===");
        process.exit(0);
    } catch (e) {
        console.error("❌ Lỗi cập nhật BU2 keywords:", e);
        process.exit(1);
    }
}

updateBU2Keywords();
