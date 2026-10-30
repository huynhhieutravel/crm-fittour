/**
 * Migration: Add 'nickname' column to users table and backfill from Outing 2026 Sheet
 * ADR: docs/adr/0013-employee-nickname-profile-integration.md
 */
const db = require('../db');

const EXCEL_STT_TO_USER_ID = {
    1: 14,  // Nguyễn Nhất Vũ -> Max Vu
    2: 16,  // Trần Quốc Thịnh -> Darius Tran
    3: 18,  // Nguyễn Quỳnh Phương -> Phunnie
    4: 17,  // Đoàn Thúy An -> An April
    5: 19,  // Lâm Mỹ Duyên -> Grace Lam
    6: 20,  // Nguyễn Hưng Thịnh -> Hung Thinh
    7: 21,  // Lê Minh Tuấn -> Meishun
    8: 22,  // Bùi Ngọc Hiếu -> BÙI NGỌC HIÊU
    9: 33,  // Phan Hoàng Trúc Vy -> Vy Phan
    10: 36, // Nguyễn Huỳnh Hồng Trang -> Pinkchan
    11: 39, // Hầu Quang Hưng -> Joseph Hau
    12: 37, // Lê Thị Trang -> Trang Lê
    13: 60, // Lê Văn Tâm -> Vantanx
    14: 13, // Võ Thị Hồng Trang -> Katie Vo
    15: 15, // Ngô Ngọc Đăng Huy -> HUY NGO
    16: 45, // Lê Thanh Hà -> Thanh Ha
    17: 23, // Dương Quỳnh Như -> JO
    18: 44, // Nguyễn Thị Hằng -> Hana
    19: 34, // Trần Đức Mẫn -> Mẫn Nhi
    20: 40, // Nguyễn Hồ Đông Hải -> Hani
    21: 46, // Trần Minh Dũng -> MIDU
    22: 35, // Phạm Nguyễn Phương Thụy -> Joyce Phạm
    23: 41, // Nguyễn Thị Thu Xuân -> Nguyễn Xuân
    24: 42, // Đoàn Bảo Ngọc -> Ngọc Đoàn
    25: 43, // Trần Hiếu Thảo -> HIEU THAO
    26: 24, // Hồ Hải Long -> long Rey
    27: 1,  // Huỳnh Trọng Hiếu -> Loki
    28: 74, // Châu Quốc Kiệt -> Châu Kiệt
    29: 77, // Phan Trọng Trí -> Tri Phan
    30: 82, // Trương Huy Hoàng -> Huy Hoàng
    31: 81, // Lê Đoàn Khánh Giao -> Khánh Giao
    32: 76  // Trần Gia Tuệ -> Gia Tuệ
};

const STT_NICKNAMES = {
    1: 'Max Vu',
    2: 'Darius Tran',
    3: 'Phunnie',
    4: 'An April',
    5: 'Grace Lam',
    6: 'Hung Thinh',
    7: 'Meishun',
    8: 'BÙI NGỌC HIÊU',
    9: 'Vy Phan',
    10: 'Pinkchan',
    11: 'Joseph Hau',
    12: 'Trang Lê',
    13: 'Vantanx',
    14: 'Katie Vo',
    15: 'HUY NGO',
    16: 'Thanh Ha',
    17: 'JO',
    18: 'Hana',
    19: 'Mẫn Nhi',
    20: 'Hani',
    21: 'MIDU',
    22: 'Joyce Phạm',
    23: 'Nguyễn Xuân',
    24: 'Ngọc Đoàn',
    25: 'HIEU THAO',
    26: 'long Rey',
    27: 'Loki',
    28: 'Châu Kiệt',
    29: 'Tri Phan',
    30: 'Huy Hoàng',
    31: 'Khánh Giao',
    32: 'Gia Tuệ'
};

async function up() {
    console.log('--- Migration: Add nickname column to users table ---');
    try {
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);
            CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
        `);
        console.log('✅ Đã thêm cột nickname và index idx_users_nickname vào bảng users.');

        console.log('--- Backfill: Đồng bộ 32 Nickname từ Google Sheet vào bảng users ---');
        let updatedCount = 0;
        for (const [sttStr, userId] of Object.entries(EXCEL_STT_TO_USER_ID)) {
            const stt = parseInt(sttStr, 10);
            const nickname = STT_NICKNAMES[stt];
            if (!nickname) continue;

            const res = await db.query(`
                UPDATE users 
                SET nickname = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND (nickname IS NULL OR nickname = '')
            `, [nickname, userId]);

            if (res.rowCount > 0) {
                updatedCount++;
                console.log(`   [STT ${stt}] UID ${userId} -> Nickname: "${nickname}" (Updated)`);
            }
        }

        console.log(`🎉 Hoàn tất migration! Đã cập nhật ${updatedCount} nhân sự.`);
    } catch (err) {
        console.error('❌ Lỗi migration nickname:', err);
        throw err;
    }
}

if (require.main === module) {
    up()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { up, EXCEL_STT_TO_USER_ID, STT_NICKNAMES };

