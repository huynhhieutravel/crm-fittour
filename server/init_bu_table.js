const db = require('./db');

async function migrate() {
    console.log('--- KHỞI TẠO BẢNG BUSINESS UNITS ---');
    try {
        // 1. Tạo bảng business_units
        await db.query(`
            CREATE TABLE IF NOT EXISTS business_units (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                countries TEXT[] DEFAULT '{}',
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Đã tạo bảng business_units');

        // 2. Châm dữ liệu mặc định (Seed) nếu bảng trống
        const check = await db.query('SELECT COUNT(*) FROM business_units');
        if (parseInt(check.rows[0].count) === 0) {
            const initialBUs = [
                { id: 'BU1', label: 'BU1 (Đông Bắc Á)', countries: ['Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Đài Loan', 'Tây Tạng'] },
                { id: 'BU2', label: 'BU2 (Âu - Mỹ - Úc)', countries: ['Pháp', 'Ý', 'Thụy Sĩ', 'Mỹ', 'Úc', 'Nam Mỹ', 'Châu Âu'] },
                { id: 'BU3', label: 'BU3 (Đông Nam Á)', countries: ['Thái Lan', 'Singapore', 'Malaysia', 'Indonesia', 'Bhutan', 'Nepal', 'Việt Nam', 'Ấn Độ'] },
                { id: 'BU4', label: 'BU4 (Thị trường Khác)', countries: ['Thổ Nhĩ Kỳ', 'Maroc', 'Ai Cập', 'Dubai', 'MICE Tour', 'Sự kiện'] }
            ];

            for (const bu of initialBUs) {
                await db.query(
                    'INSERT INTO business_units (id, label, countries) VALUES ($1, $2, $3)',
                    [bu.id, bu.label, bu.countries]
                );
            }
            console.log('✅ Đã châm dữ liệu BU mặc định');
        } else {
            console.log('ℹ️ Bảng business_units đã có dữ liệu.');
        }

        console.log('--- HOÀN TẤT MIGRATION BU ---');
    } catch (err) {
        console.error('❌ Lỗi migration BU:', err);
    } finally {
        process.exit();
    }
}

migrate();
