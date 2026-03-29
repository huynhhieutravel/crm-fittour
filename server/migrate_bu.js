const db = require('./db');

async function migrate() {
    console.log('--- BẮT ĐẦU MIGRATION BU & LOẠI TOUR ---');
    try {
        // 1. Thêm cột bu_group nếu chưa có
        await db.query(`
            ALTER TABLE tour_templates ADD COLUMN IF NOT EXISTS bu_group TEXT;
        `);
        console.log('✅ Đã thêm cột bu_group');

        // 2. Chuyển đổi Loại Tour sang nhãn mới (Aggressive)
        await db.query(`
            UPDATE tour_templates SET tour_type = 'Group Tour' WHERE UPPER(tour_type) IN ('STANDARD', 'GROUP', 'BASIC', 'G');
            UPDATE tour_templates SET tour_type = 'Luxury Tour' WHERE UPPER(tour_type) IN ('PREMIUM', 'LUXURY', 'L', 'SANG TRỌNG');
            UPDATE tour_templates SET tour_type = 'Private Tour' WHERE UPPER(tour_type) IN ('BUDGET', 'PRIVATE', 'P', 'RIÊNG');
            UPDATE tour_templates SET tour_type = 'MICE Tour' WHERE UPPER(tour_type) IN ('MICE', 'EVENT', 'SỰ KIỆN');
        `);
        console.log('✅ Đã cập nhật nhãn Loại Tour mới (Case-insensitive)');

        // 3. Gán BU mặc định dựa trên Điểm đến
        const bu1 = ['Nhật Bản', 'Hàn Quốc', 'Trung Quốc', 'Đài Loan', 'Tây Tạng'];
        const bu2 = ['Pháp', 'Ý', 'Thụy Sĩ', 'Mỹ', 'Úc', 'Nam Mỹ', 'Châu Âu', 'Nam Mỹ'];
        const bu3 = ['Thái Lan', 'Singapore', 'Malaysia', 'Indonesia', 'Bhutan', 'Nepal', 'Việt Nam'];
        const bu4 = ['Thổ Nhĩ Kỳ', 'Maroc', 'Ai Cập', 'MICE Tour', 'Sự kiện'];

        await db.query('UPDATE tour_templates SET bu_group = $1 WHERE destination = ANY($2)', ['BU1', bu1]);
        await db.query('UPDATE tour_templates SET bu_group = $2 WHERE destination = ANY($1)', [bu2, 'BU2']); // Ops typo fix in my head, let's do it clean
        
        await db.query('UPDATE tour_templates SET bu_group = $1 WHERE destination = ANY($2)', ['BU1', bu1]);
        await db.query('UPDATE tour_templates SET bu_group = $1 WHERE destination = ANY($2)', ['BU2', bu2]);
        await db.query('UPDATE tour_templates SET bu_group = $1 WHERE destination = ANY($2)', ['BU3', bu3]);
        await db.query('UPDATE tour_templates SET bu_group = $1 WHERE destination = ANY($2)', ['BU4', bu4]);

        // Gán BU4 cho những gì còn lại chưa có BU
        await db.query("UPDATE tour_templates SET bu_group = 'BU4' WHERE bu_group IS NULL OR bu_group = '';");

        console.log('✅ Đã gán BU cho các tour hiện có');
        console.log('--- HOÀN TẤT MIGRATION ---');
    } catch (err) {
        console.error('❌ Lỗi migration:', err);
    } finally {
        process.exit();
    }
}

migrate();
