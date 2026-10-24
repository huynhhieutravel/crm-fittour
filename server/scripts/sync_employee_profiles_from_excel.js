const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

function parseDob(val) {
    if (!val) return null;
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (typeof val === 'string') {
        val = val.trim();
        const parts = val.split('/');
        if (parts.length === 3) {
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2];
            return `${y}-${m}-${d}`;
        }
    }
    return null;
}

// Bảng ánh xạ thủ công chuẩn xác 100% giữa STT trong file Excel và ID trong bảng users
const EXCEL_STT_TO_USER_ID = {
    1: 14,  // Nguyễn Nhất Vũ (Max Vũ) -> hi2.sale
    2: 16,  // Trần Quốc Thịnh -> tq1.sale
    3: 18,  // Nguyễn Quỳnh Phương -> tq3.sale
    4: 17,  // Đoàn Thúy An -> tq2.sale
    5: 19,  // Lâm Mỹ Duyên -> tq4.sale
    6: 20,  // Nguyễn Hưng Thịnh -> tq5.sale
    7: 21,  // Lê Minh Tuấn -> gu1.sale
    8: 22,  // Bùi Ngọc Hiếu -> gu2.sale
    9: 33,  // Phan Hoàng Trúc Vy (Vy Phan) -> sv1.sale
    10: 36, // Nguyễn Huỳnh Hồng Trang -> sv4.sale
    11: 39, // Hầu Quang Hưng -> sv7.sale
    12: 37, // Lê Thị Trang -> sv5.sale
    13: 60, // Lê Văn Tâm -> tam.visa
    14: 13, // Võ Thị Hồng Trang -> hi1.sale
    15: 15, // Ngô Ngọc Đăng Huy -> hi3.sale
    16: 45, // Lê Thanh Hà -> ha.dh
    17: 23, // Dương Quỳnh Như -> gu3.sale
    18: 44, // Nguyễn Thị Hằng -> hang.dh
    19: 34, // Trần Đức Mẫn -> sv2.sale
    20: 40, // Nguyễn Hồ Đông Hải -> tq1.dh
    21: 46, // Trần Minh Dũng -> dung.dh
    22: 35, // Phạm Nguyễn Phương Thụy -> sv3.sale
    23: 41, // Nguyễn Thị Thu Xuân (Xuân (Kế Toán)) -> xuan.kt
    24: 42, // Đoàn Bảo Ngọc (Bảo Ngọc (Kế Toán)) -> bngoc.kt
    25: 43, // Trần Hiếu Thảo (Hiếu Thảo) -> hthao.kt
    26: 24, // Hồ Hải Long (Long) -> long.mkt
    27: 1,  // Huỳnh Trọng Hiếu -> admin
    28: 74, // Châu Quốc Kiệt (Châu Kiệt) -> kietchau.mkt
    29: 77, // Phan Trọng Trí -> gu1.visa
    30: 82, // Trương Huy Hoàng (Huy Hoàng) -> sv8.sale
    31: 81, // Lê Đoàn Khánh Giao -> hi5.sale
    32: 76  // Trần Gia Tuệ -> hi4.sale
};

async function syncProfiles(dryRun = true) {
    console.log(`=== SYNC EMPLOYEE PROFILES FROM EXCEL (DryRun: ${dryRun}) ===`);
    
    const excelPath = path.join(__dirname, '../../client/public/company_trip_2026.xlsx');
    const wb = xlsx.readFile(excelPath);
    const ws = wb.Sheets['DS LAO DONG'];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

    const results = [];

    for (let i = 7; i <= 38; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;
        const stt = row[0];
        const userId = EXCEL_STT_TO_USER_ID[stt];
        if (!userId) {
            console.warn(`Không tìm thấy userId cho STT ${stt}: ${row[1]}`);
            continue;
        }

        const fullName = row[1].trim();
        const gender = row[2] === 'Nam' ? 'male' : (row[2] === 'Nữ' ? 'female' : null);
        const birthDate = parseDob(row[3]);
        const idCard = row[4] ? String(row[4]).trim() : null;
        const phone = row[5] ? String(row[5]).replace(/[^0-9]/g, '') : null;
        const roleTitle = row[6] ? String(row[6]).trim() : null;

        // Fetch current user
        const uRes = await db.query('SELECT id, username, full_name, birth_date, id_card, phone, gender, position FROM users WHERE id = $1', [userId]);
        const current = uRes.rows[0];

        results.push({
            userId,
            username: current.username,
            oldName: current.full_name,
            newName: fullName,
            oldDob: current.birth_date ? current.birth_date.toISOString().slice(0, 10) : null,
            newDob: birthDate,
            oldCccd: current.id_card,
            newCccd: idCard,
            oldPhone: current.phone,
            newPhone: phone,
            gender,
            position: roleTitle
        });

        if (!dryRun) {
            await db.query(`
                UPDATE users SET
                    full_name = $1,
                    birth_date = COALESCE($2, birth_date),
                    id_card = COALESCE($3, id_card),
                    phone = COALESCE($4, phone),
                    gender = COALESCE($5, gender),
                    position = COALESCE($6, position),
                    updated_at = NOW()
                WHERE id = $7
            `, [fullName, birthDate, idCard, phone, gender, roleTitle, userId]);
        }
    }

    console.table(results.map(r => ({
        ID: r.userId,
        Username: r.username,
        'Old Name': r.oldName,
        'New Name': r.newName,
        'DOB': r.newDob || '-',
        'CCCD': r.newCccd || '-',
        'Phone': r.newPhone || '-',
        'Gender': r.gender
    })));

    console.log(`Đã xử lý ${results.length} nhân viên. DryRun: ${dryRun}`);
    process.exit(0);
}

const isDryRun = process.argv.includes('--execute') ? false : true;
syncProfiles(isDryRun).catch(e => {
    console.error(e);
    process.exit(1);
});
