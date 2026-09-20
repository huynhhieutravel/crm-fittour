require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function updateKeywords() {
    try {
        console.log("=== BẮT ĐẦU CẬP NHẬT KEYWORD CHO TOUR TÂN CƯƠNG & BU1 ===");

        // 1. Cập nhật bảng tour_templates cho Tour Bắc Tân Cương (ID 337 hoặc code BACTANCUONG9N8D)
        const tourBacRes = await db.query(
            `UPDATE tour_templates 
             SET keywords = 'Bắc Tân Cương, Bắc Cương, Tân Cương, bac tan cuong, bac cuong, tan cuong, bactancuong', 
                 bu_group = 'BU1',
                 updated_at = NOW()
             WHERE code = 'BACTANCUONG9N8D' OR id = 337 OR (name ILIKE '%Bắc Cương%' AND is_active = true)
             RETURNING id, code, name, bu_group, keywords`
        );
        if (tourBacRes.rowCount > 0) {
            console.log(`✅ Đã cập nhật keywords cho ${tourBacRes.rowCount} tour Bắc Tân Cương:`);
            tourBacRes.rows.forEach(t => console.log(`   - ID ${t.id} [${t.code}]: ${t.name} (BU: ${t.bu_group})\n     -> Keywords: ${t.keywords}`));
        }

        // Cập nhật Tour Tân Cương chung (ID 187, 292 hoặc tên có Tân Cương)
        const tourTcRes = await db.query(
            `UPDATE tour_templates 
             SET keywords = 'Tân Cương, tan cuong, tour tân cương, tour tan cuong',
                 bu_group = 'BU1',
                 updated_at = NOW()
             WHERE (id IN (187, 292) OR code = 'TÂN CƯƠNG' OR (name ILIKE '%Tân Cương%' AND name NOT ILIKE '%Bắc%' AND name NOT ILIKE '%Nam%')) AND is_active = true
             RETURNING id, code, name, bu_group, keywords`
        );
        if (tourTcRes.rowCount > 0) {
            console.log(`✅ Đã cập nhật keywords cho ${tourTcRes.rowCount} tour Tân Cương chung:`);
            tourTcRes.rows.forEach(t => console.log(`   - ID ${t.id} [${t.code}]: ${t.name} (BU: ${t.bu_group})\n     -> Keywords: ${t.keywords}`));
        }

        // Cập nhật Tour Nam Tân Cương (ID 316)
        const tourNamRes = await db.query(
            `UPDATE tour_templates 
             SET keywords = 'Nam Tân Cương, Tân Cương, Nam Cương, nam tan cuong, nam cuong',
                 bu_group = 'BU1',
                 updated_at = NOW()
             WHERE id = 316 OR (name ILIKE '%Nam Tân Cương%' AND is_active = true)
             RETURNING id, code, name, bu_group, keywords`
        );
        if (tourNamRes.rowCount > 0) {
            console.log(`✅ Đã cập nhật keywords cho ${tourNamRes.rowCount} tour Nam Tân Cương:`);
            tourNamRes.rows.forEach(t => console.log(`   - ID ${t.id} [${t.code}]: ${t.name} (BU: ${t.bu_group})\n     -> Keywords: ${t.keywords}`));
        }

        // 2. Cập nhật bảng business_units (BU1)
        const buRes = await db.query("SELECT id, label, countries, keywords FROM business_units WHERE id = 'BU1'");
        if (buRes.rows.length > 0) {
            const currentKeywords = buRes.rows[0].keywords || [];
            const currentCountries = buRes.rows[0].countries || [];

            const newBUKeywords = [
                'tân cương', 'tan cuong',
                'bắc tân cương', 'bac tan cuong',
                'nam tân cương', 'nam tan cuong',
                'bắc cương', 'bac cuong',
                'nam cương', 'nam cuong',
                'tour tân cương', 'tour tan cuong'
            ];
            const newCountries = ['Tân Cương', 'Bắc Tân Cương', 'Nam Tân Cương'];

            const mergedKeywords = [...new Set([...currentKeywords, ...newBUKeywords])].sort();
            const mergedCountries = [...new Set([...currentCountries, ...newCountries])];

            await db.query(
                "UPDATE business_units SET keywords = $1, countries = $2, updated_at = NOW() WHERE id = 'BU1'",
                [mergedKeywords, mergedCountries]
            );
            console.log(`✅ Đã cập nhật keywords & countries cho BU1 thành công:`);
            console.log(`   - Countries:`, mergedCountries);
            console.log(`   - Keywords count:`, mergedKeywords.length);
        } else {
            console.log("⚠️ Không tìm thấy BU1 trong DB!");
        }

        // 3. Cập nhật Lead #15081 (nếu có trong DB)
        const leadRes = await db.query(
            `UPDATE leads 
             SET bu_group = 'BU1', 
                 tour_id = COALESCE(tour_id, (SELECT id FROM tour_templates WHERE code = 'BACTANCUONG9N8D' OR id = 337 LIMIT 1)),
                 updated_at = NOW() 
             WHERE id = 15081 AND (bu_group IS NULL OR bu_group = '')
             RETURNING id, name, phone, bu_group, tour_id`
        );
        if (leadRes.rowCount > 0) {
            console.log(`✅ Đã cập nhật Lead #15081:`, leadRes.rows[0]);
        } else {
            console.log(`ℹ️ Không có Lead #15081 cần cập nhật trong DB này.`);
        }

        console.log("=== HOÀN TẤT CẬP NHẬT KEYWORDS ===");
        process.exit(0);
    } catch (e) {
        console.error("❌ Lỗi cập nhật:", e);
        process.exit(1);
    }
}

updateKeywords();
