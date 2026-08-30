require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function updateKeywords() {
    try {
        console.log("=== BẮT ĐẦU CẬP NHẬT KEYWORD CHO TOUR CÁP NHĨ TÂN & BU1 ===");

        // 0. Đảm bảo cột keywords tồn tại trong tour_templates
        await db.query("ALTER TABLE tour_templates ADD COLUMN IF NOT EXISTS keywords TEXT;");

        const tourKeywords = 'cáp nhĩ tân, cap nhi tan, harbin, haerbin, hắc long giang, hac long giang, làng tuyết, lang tuyet, làng tuyết hương, lang tuyet huong, tuyết hương, tuyet huong, băng đăng, bang dang, lễ hội băng đăng, thế giới băng tuyết, trang viên volga, volga manor';

        // 1. Cập nhật bảng tour_templates cho Tour Cáp Nhĩ Tân mới
        const tourRes = await db.query(
            "UPDATE tour_templates SET keywords = $1, bu_group = 'BU1' WHERE code = 'CAPNHITAN7N6Đ' OR (name ILIKE '%Cáp Nhĩ Tân%' AND is_active = true) RETURNING id, code, name, bu_group, keywords",
            [tourKeywords]
        );
        
        if (tourRes.rowCount > 0) {
            console.log(`✅ Đã cập nhật keywords cho ${tourRes.rowCount} tour template:`);
            tourRes.rows.forEach(t => console.log(`   - ID ${t.id} [${t.code}]: ${t.name} (BU: ${t.bu_group})\n     -> Keywords: ${t.keywords}`));
        } else {
            console.log("ℹ️ Không tìm thấy tour Cáp Nhĩ Tân active để cập nhật.");
        }

        // Xoá keywords ở tour cũ inactive để tránh xung đột
        await db.query("UPDATE tour_templates SET keywords = '' WHERE is_active = false AND id IN (96, 154)");

        // 2. Cập nhật bảng business_units (BU1)
        const buRes = await db.query("SELECT id, label, keywords FROM business_units WHERE id = 'BU1'");
        if (buRes.rows.length > 0) {
            const currentKeywords = buRes.rows[0].keywords || [];
            const newBUKeywords = [
                'cáp nhĩ tân', 'cap nhi tan', 
                'harbin', 'haerbin',
                'hắc long giang', 'hac long giang',
                'làng tuyết', 'lang tuyet', 
                'làng tuyết hương', 'lang tuyet huong',
                'tuyết hương', 'tuyet huong', 
                'băng đăng', 'bang dang',
                'trang viên volga', 'volga manor'
            ];
            
            // Merge không trùng lặp và sắp xếp a-z
            const mergedKeywords = [...new Set([...currentKeywords, ...newBUKeywords])].sort();

            await db.query(
                "UPDATE business_units SET keywords = $1 WHERE id = 'BU1'",
                [mergedKeywords]
            );
            console.log(`✅ Đã cập nhật keywords cho BU1 thành công (${mergedKeywords.length} từ khóa):`);
            console.log(`   - BU1 Keywords:`, JSON.stringify(mergedKeywords));
        } else {
            console.log("⚠️ Không tìm thấy BU1 trong DB!");
        }

        console.log("=== HOÀN TẤT CẬP NHẬT KEYWORDS ===");
        process.exit(0);
    } catch (e) {
        console.error("❌ Lỗi cập nhật:", e);
        process.exit(1);
    }
}

updateKeywords();
