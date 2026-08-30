const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function insertAnnouncement() {
    const client = await pool.connect();
    try {
        console.log('Inserting official announcement on DB...');

        const code = 'TB-2026/08/03-FIT';
        const title = 'CHỦ ĐỘNG ĐIỀU PHỐI DÒNG TIỀN & TIẾN ĐỘ VẬN HÀNH';
        const category = 'Thông báo';
        const issue_date = '2026-08-21';
        const effective_date = '2026-08-21';
        const signer_name = 'Nguyễn Nhất Vũ';
        const signer_position = 'Tổng Giám Đốc';
        const recipient_scope = 'Điều hành Tuyến điểm, Tất cả các BU, Kế toán';
        const summary = 'Yêu cầu các bộ phận chuyển sang trạng thái chủ động dự báo – chủ động phối hợp – chủ động dòng tiền trong giai đoạn cao điểm các đoàn khởi hành và đấu thầu quy mô lớn.';
        const is_pinned = true;
        const status = 'published';

        const content_html = `<p>Trong thời gian sắp tới, <strong>FIT TOUR</strong> bước vào giai đoạn cao điểm với nhiều đoàn khởi hành cùng thời điểm, đồng thời triển khai một số đoàn đấu thầu quy mô lớn với Nhà nước và các tập đoàn lớn.</p>
<p>Bên cạnh đó, một số khoản công nợ chưa thu về kịp theo tiến độ dự kiến. Vì vậy, Ban Giám Đốc yêu cầu tất cả các bộ phận chuyển sang trạng thái <strong>CHỦ ĐỘNG DỰ BÁO – CHỦ ĐỘNG PHỐI HỢP – CHỦ ĐỘNG DÒNG TIỀN</strong>, tuyệt đối không xử lý theo kiểu phát sinh đến đâu giải quyết đến đó.</p>

<h3 style="color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px;">1. BỘ PHẬN ĐIỀU HÀNH TUYẾN ĐIỂM – TẤT CẢ CÁC BU</h3>
<ul>
    <li>Chủ động rà soát toàn bộ các đoàn đang triển khai của tất cả BU.</li>
    <li>Chủ động đẩy nhanh tiến độ Visa, đặc biệt đối với các đoàn cần có Visa để kích hoạt các đợt thanh toán tiếp theo của khách hàng/đối tác.</li>
    <li>Cập nhật sớm và chính xác tình trạng Visa, booking, dịch vụ và các mốc thanh toán của từng đoàn.</li>
    <li><strong>Bắt buộc lập và gửi Kế toán kế hoạch thanh toán dự kiến tối thiểu 14 ngày trước ngày thanh toán</strong>, đặc biệt đối với các khoản có giá trị lớn.</li>
    <li>Chủ động gửi đầy đủ <em>Invoice / số tiền / thời hạn thanh toán / nhà cung cấp</em> để Kế toán chủ động kế hoạch dòng tiền.</li>
    <li>Chủ động làm việc với đối tác để giãn tiến độ thanh toán trong phạm vi có thể, nhưng phải đảm bảo không ảnh hưởng đến việc giữ dịch vụ và chất lượng đoàn.</li>
    <li>Đối với các khoản thanh toán lớn hoặc phát sinh bất thường, <strong>phải cảnh báo sớm cho Kế toán và BOD</strong>, tuyệt đối không chờ đến ngày thanh toán mới báo.</li>
</ul>

<h3 style="color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px;">2. CÁC QUẢN LÝ KHỐI KINH DOANH (BUM)</h3>
<ul>
    <li>Chủ động đôn đốc Điều hành về tiến độ Visa của toàn bộ đoàn thuộc BU phụ trách.</li>
    <li>Phối hợp Sales/Kinh doanh đôn đốc khách hàng hoàn tất các khoản thanh toán ngay khi đủ điều kiện thu, đặc biệt sau khi có Visa.</li>
    <li>Rà soát các đoàn có khoản thu lớn trong thời gian tới và chủ động cập nhật cho Kế toán / BOD.</li>
    <li>Đối với các đoàn đấu thầu hoặc đoàn có giá trị lớn, BUM phải chủ động theo dõi sát sao dòng tiền và tiến độ thanh toán, không chờ nhắc.</li>
</ul>

<h3 style="color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px;">3. PHÒNG KẾ TOÁN</h3>
<ul>
    <li>Chủ động lập <strong>Bảng dự báo dòng tiền (Cash-flow forecast)</strong> theo tuần và theo từng đoàn.</li>
    <li>Tổng hợp toàn bộ khoản phải thu – phải trả, đặc biệt các khoản có giá trị lớn.</li>
    <li>Chủ động phối hợp với BUM / Sales để đẩy nhanh tiến độ thu hồi công nợ.</li>
    <li>Cảnh báo sớm cho BOD khi có thời điểm nhiều khoản thanh toán lớn tập trung cùng lúc.</li>
    <li>Phối hợp Điều hành để ưu tiên và sắp xếp lịch thanh toán, đảm bảo hoạt động vận hành không bị gián đoạn.</li>
</ul>

<h3 style="color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px;">4. NGUYÊN TẮC CHUNG VÀ MỤC TIÊU HÀNH ĐỘNG</h3>
<p>Từ thời điểm này, yêu cầu tất cả các bộ phận thực hiện nghiêm túc theo chu trình nguyên tắc cốt lõi:</p>
<div style="background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 14px 18px; margin: 16px 0; text-align: center; font-weight: bold; color: #1d4ed8; font-size: 15px; letter-spacing: 0.3px;">
    VISA SỚM → THU TIỀN SỚM → DỰ BÁO DÒNG TIỀN → CHỦ ĐỘNG THANH TOÁN → ĐẢM BẢO VẬN HÀNH
</div>
<ul>
    <li><strong>Điều hành:</strong> Chủ động Visa & kế hoạch thanh toán.</li>
    <li><strong>BUM:</strong> Chủ động đôn đốc và phối hợp thu tiền.</li>
    <li><strong>Kế toán:</strong> Chủ động dự báo và điều phối dòng tiền.</li>
</ul>
<p style="color: #b91c1c; font-weight: bold; margin-top: 14px;">⛔ Tuyệt đối không để xảy ra tình trạng: Đến hạn thanh toán mới báo – Đến lúc cần tiền mới xử lý.</p>
<p>Đề nghị tất cả các BU và các bộ phận liên quan nghiêm túc quán triệt và triển khai thực hiện ngay kể từ ngày ban hành thông báo này.</p>`;

        // Check if exists by code
        const existing = await client.query('SELECT id FROM official_announcements WHERE code = $1', [code]);
        if (existing.rows.length > 0) {
            await client.query(`
                UPDATE official_announcements SET
                    title = $1, category = $2, issue_date = $3, effective_date = $4,
                    signer_name = $5, signer_position = $6, recipient_scope = $7,
                    summary = $8, content_html = $9, is_pinned = $10, status = $11, updated_at = CURRENT_TIMESTAMP
                WHERE code = $12
            `, [
                title, category, issue_date, effective_date,
                signer_name, signer_position, recipient_scope,
                summary, content_html, is_pinned, status, code
            ]);
            console.log(`✅ Updated existing announcement ${code} (ID: ${existing.rows[0].id})`);
        } else {
            const insertRes = await client.query(`
                INSERT INTO official_announcements (
                    code, title, category, issue_date, effective_date,
                    signer_name, signer_position, recipient_scope,
                    summary, content_html, is_pinned, status
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                ) RETURNING id
            `, [
                code, title, category, issue_date, effective_date,
                signer_name, signer_position, recipient_scope,
                summary, content_html, is_pinned, status
            ]);
            console.log(`✅ Created new announcement ${code} (ID: ${insertRes.rows[0].id})`);
        }
    } catch (err) {
        console.error('Error inserting announcement:', err);
    } finally {
        client.release();
        pool.end();
    }
}

insertAnnouncement();
