require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function updateBu5Keywords() {
    try {
        console.log("=== Bắt đầu chuẩn hoá từ khoá BU5 (Loại bỏ từ đơn 'Mỹ') ===");

        const buRes = await db.query("SELECT id, countries, keywords FROM business_units WHERE id = 'BU5'");
        if (buRes.rows.length === 0) {
            console.error("❌ Không tìm thấy BU5 trong bảng business_units!");
            process.exit(1);
        }

        let currentCountries = buRes.rows[0].countries || [];
        let currentKeywords = buRes.rows[0].keywords || [];

        // 1. Loại bỏ triệt để từ đơn 'Mỹ' / 'mỹ' / 'my' nằm riêng
        const newCountries = currentCountries.filter(c => {
            const trimmed = c.trim().toLowerCase();
            return trimmed !== 'mỹ' && trimmed !== 'my';
        });

        const newKeywords = currentKeywords.filter(k => {
            const trimmed = k.trim().toLowerCase();
            return trimmed !== 'mỹ' && trimmed !== 'my';
        });

        // 2. Bổ sung các cụm từ an toàn, tường minh cho thị trường Mỹ
        const safeUsKeywords = [
            'tour mỹ',
            'du lịch mỹ',
            'hoa kỳ',
            'đi mỹ',
            'nước mỹ',
            'bắc mỹ',
            'nam mỹ',
            'châu mỹ',
            'tour my',
            'du lich my',
            'hoa ky',
            'di my',
            'nuoc my'
        ];

        for (const kw of safeUsKeywords) {
            if (!newKeywords.map(k => k.toLowerCase()).includes(kw)) {
                newKeywords.push(kw);
            }
        }

        await db.query(
            "UPDATE business_units SET countries = $1, keywords = $2, updated_at = NOW() WHERE id = 'BU5'",
            [newCountries, newKeywords]
        );

        console.log("✅ Cập nhật thành công BU5!");
        console.log("Countries mới:", newCountries);
        console.log("Keywords mới:", newKeywords);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi updateBu5Keywords:", err);
        process.exit(1);
    }
}

updateBu5Keywords();
