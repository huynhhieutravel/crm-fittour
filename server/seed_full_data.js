const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const guideData = [
    ['Nguyễn Văn An', '0912345678', 'an.nguyen@example.com', 'Tiếng Anh, Tiếng Nhật', 'Kinh nghiệm 5 năm dẫn tour nội địa và quốc tế.'],
    ['Trần Thị Bình', '0987654321', 'binh.tran@example.com', 'Tiếng Anh, Tiếng Pháp', 'Chuyên tour văn hóa, lịch sử Châu Âu.'],
    ['Lê Văn Cường', '0903112233', 'cuong.le@example.com', 'Tiếng Trung, Tiếng Anh', 'Am hiểu sâu sắc về các địa điểm tại Trung Quốc và Đài Loan.'],
    ['Phạm Thùy Dương', '0944556677', 'duong.pham@example.com', 'Tiếng Anh', 'Năng động, nhiệt tình, chuyên tour trekking và mạo hiểm.'],
    ['Hoàng Minh Hải', '0123456000', 'hai.hoang@example.com', 'Tiếng Hàn, Tiếng Anh', 'Chuyên gia tour mua sắm và làm đẹp tại Hàn Quốc.'],
    ['Vũ Lan Hương', '0888999000', 'huong.vu@example.com', 'Tiếng Nhật', 'Dẫn tour Nhật Bản chuyên nghiệp, am hiểu trà đạo.'],
    ['Đặng Quốc Khánh', '0777666555', 'khanh.dang@example.com', 'Tiếng Anh, Tiếng Đức', 'Kinh nghiệm dẫn khách đoàn lớn, team building.'],
    ['Bùi Thị Liên', '0999888777', 'lien.bui@example.com', 'Tiếng Anh, Tiếng Ý', 'Yêu nghệ thuật, chuyên tour khảo cổ học.'],
    ['Ngô Minh Quân', '0933221100', 'quan.ngo@example.com', 'Tiếng Anh, Tiếng Tây Ban Nha', 'Chuyên tour Nam Mỹ và Mexico.'],
    ['Trương Quốc Việt', '0911222333', 'viet.truong@example.com', 'Tiếng Anh, Tiếng Thái', 'Am hiểu ẩm thực và văn hóa Đông Nam Á.'],
    ['Lý Mỹ Linh', '0901234567', 'linh.ly@example.com', 'Tiếng Trung, Tiếng Nhật', 'Chuyên tour Đông Á cao cấp.'],
    ['Đỗ Anh Tuấn', '0907654321', 'tuan.do@example.com', 'Tiếng Anh', 'Chuyên tour mice và sự kiện.']
];

const tourThemes = [
    { name: 'Khám phá Nhật Bản Mùa Hoa Anh Đào', destination: 'Nhật Bản', duration: '6N5Đ', price: 35000000 },
    { name: 'Hành trình Ai Cập Huyền Bí', destination: 'Ai Cập', duration: '12N11Đ', price: 65000000 },
    { name: 'Vẻ đẹp Thổ Nhĩ Kỳ từ Khinh Khí Cầu', destination: 'Thổ Nhĩ Kỳ', duration: '10N9Đ', price: 45000000 },
    { name: 'Nam Mỹ: Brazil - Peru - Argentina', destination: 'Nam Mỹ', duration: '14N13Đ', price: 185000000 },
    { name: 'Maroc: Những Thành Phố Màu Sắc', destination: 'Maroc', duration: '12N11Đ', price: 75000000 },
    { name: 'Bhutan: Vương Quốc Hạnh Phúc', destination: 'Bhutan', duration: '5N4Đ', price: 55000000 },
    { name: 'Tây Tạng: Chuyến Tàu Lên Đỉnh Thế Giới', destination: 'Tây Tạng', duration: '10N9Đ', price: 58000000 },
    { name: 'Trung Quốc: Cửu Trại Câu - Thành Đô', destination: 'Trung Quốc', duration: '6N5Đ', price: 25000000 }
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('--- Cleaning old departures/guides ---');
        await client.query('DELETE FROM tour_departures');
        await client.query('DELETE FROM guides');

        console.log('--- Seeding Guides ---');
        const guideIds = [];
        for (const [name, phone, email, lang, bio] of guideData) {
            const res = await client.query(
                "INSERT INTO guides (name, phone, email, languages, bio, status) VALUES ($1, $2, $3, $4, $5, 'Active') RETURNING id",
                [name, phone, email, lang, bio]
            );
            guideIds.push({ id: res.rows[0].id, name, schedule: [] });
        }

        console.log('--- Getting Tour Templates ---');
        const templatesRes = await client.query('SELECT id, name FROM tour_templates');
        const templates = templatesRes.rows;
        if (templates.length === 0) {
            console.error('No tour templates found. Please seed templates first.');
            return;
        }

        console.log('--- Seeding 30+ Tour Departures across 2026 ---');
        const months = [3, 4, 5, 6, 7, 8, 9, 10]; // March to Oct
        let departureCount = 0;

        for (const month of months) {
            for (let i = 0; i < 4; i++) { // 4 tours per month
                const day = 5 + (i * 7); // 5th, 12th, 19th, 26th
                const start = new Date(2026, month, day);
                const durationDays = 5 + Math.floor(Math.random() * 8); // 5 to 12 days
                const end = new Date(start);
                end.setDate(start.getDate() + durationDays);

                const template = templates[Math.floor(Math.random() * templates.length)];
                
                // Try to assign a guide who is NOT free
                let assignedGuideId = null;
                const shuffledGuides = [...guideIds].sort(() => Math.random() - 0.5);
                
                for (const g of shuffledGuides) {
                    const hasOverlap = g.schedule.some(s => (s.start <= end && s.end >= start));
                    if (!hasOverlap) {
                        assignedGuideId = g.id;
                        g.schedule.push({ start, end });
                        break;
                    }
                }

                await client.query(
                    `INSERT INTO tour_departures (
                        tour_template_id, start_date, end_date, max_participants, status, 
                        actual_price, price_adult, guide_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        template.id, 
                        start.toISOString().split('T')[0], 
                        end.toISOString().split('T')[0], 
                        20, 
                        Math.random() > 0.3 ? 'Open' : 'Guaranteed',
                        30000000 + Math.floor(Math.random() * 20000000),
                        30000000 + Math.floor(Math.random() * 20000000),
                        assignedGuideId
                    ]
                );
                departureCount++;
            }
        }

        console.log(`--- Seeding Completed: ${departureCount} departures created ---`);
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
