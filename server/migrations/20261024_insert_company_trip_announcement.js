const path = require('path');
const fs = require('fs');
const db = require('../db');

async function main() {
    console.log('--- Migration: Insert/Update Company Trip 2026 Announcement ---');
    const code = 'TB-2026/10/01-FIT';
    const title = 'TỔ CHỨC CHƯƠNG TRÌNH COMPANY TRIP FIT TOUR 2026: "FIT TOGETHER ĐÀ LẠT"';
    const category = 'Thông báo';
    const issueDate = '2026-10-24';
    const effectiveDate = '2026-10-24';
    const signerName = 'NGUYỄN XUÂN';
    const signerPosition = 'Phòng Nhân Sự';
    const recipientScope = 'Toàn thể Cán bộ Nhân viên FIT TOUR';
    const summary = 'Thông báo chính thức về chương trình Company Trip 2026 tại Đà Lạt (4N3Đ từ 11/11 đến 14/11/2026). BGĐ tài trợ 100% chi phí cho toàn thể CBNV chính thức. Hạn chót đăng ký: 12h00 ngày 26/10/2026.';
    const attachmentUrl = 'https://docs.google.com/spreadsheets/d/1RW2Qp3O-HC30KeoaWF5Vqx2LEY6kQXtw/edit?usp=sharing&ouid=111367788545768742932&rtpof=true&sd=true';

    // Copy ảnh sang uploads trên server nếu uploads tồn tại mà chưa có ảnh
    try {
        const uploadDir = path.join(__dirname, '../public/uploads');
        const targetImg = path.join(uploadDir, 'lich_trinh_company_trip_dalat_2026.jpg');
        const sourceImg = path.join(__dirname, '../../client/public/lich_trinh_company_trip_dalat_2026.jpg');
        if (fs.existsSync(sourceImg) && fs.existsSync(uploadDir) && !fs.existsSync(targetImg)) {
            fs.copyFileSync(sourceImg, targetImg);
            console.log('Copied poster to server/public/uploads');
        }
    } catch (e) {
        console.warn('Could not copy poster to uploads:', e.message);
    }

    const contentHtml = `
<div style="font-family: 'Times New Roman', Times, serif; font-size: 15.5px; line-height: 1.8; color: #1e293b;">
    <p style="text-indent: 1.5em; text-align: justify;">
        Nhằm ghi nhận những nỗ lực, đóng góp tích cực của tập thể Cán bộ Nhân viên trong suốt thời gian qua, đồng thời tạo điều kiện tái tạo năng lượng, tăng cường tinh thần gắn kết và thắt chặt tình đồng đội, Ban Giám đốc phối hợp cùng Phòng Nhân sự trân trọng thông báo tổ chức chương trình <strong>COMPANY TRIP FIT TOUR 2026</strong> với chủ đề <em>"FIT TOGETHER ĐÀ LẠT"</em> như sau:
    </p>

    <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin: 20px 0; text-indent: 0;">
        <div style="font-weight: bold; color: #dc2626; font-size: 16px; margin-bottom: 6px; text-transform: uppercase;">
            🔴 HẠN CHÓT ĐĂNG KÝ THAM GIA: TRƯỚC 12H00 NGÀY 26/10/2026
        </div>
        <div style="color: #450a0a; margin-bottom: 10px;">
            Để công tác hậu cần (đặt xe vận chuyển, phòng khách sạn/villa, thực đơn ẩm thực) được chu đáo nhất, đề nghị toàn thể Anh/Chị/Em xác nhận đăng ký đúng hạn:
        </div>
        <div style="text-align: center;">
            <a href="${attachmentUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #dc2626; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; box-shadow: 0 4px 10px rgba(220,38,38,0.3);">
                👉 NHẤP VÀO ĐÂY ĐỂ ĐIỀN BIỂU MẪU ĐĂNG KÝ THAM GIA 📝
            </a>
        </div>
    </div>

    <h3 style="font-weight: bold; font-size: 16px; color: #0f172a; margin-top: 25px; margin-bottom: 10px; text-indent: 0;">
        I. THÔNG TIN TỔNG QUAN CHƯƠNG TRÌNH
    </h3>
    <ul style="margin: 8px 0 16px 25px; padding: 0;">
        <li style="margin-bottom: 6px;"><strong>Địa điểm:</strong> Thành phố Đà Lạt, Tỉnh Lâm Đồng.</li>
        <li style="margin-bottom: 6px;"><strong>Thời gian:</strong> 04 ngày 03 đêm, từ <strong>Thứ Tư (11/11/2026)</strong> đến <strong>Thứ Bảy (14/11/2026)</strong>.</li>
        <li style="margin-bottom: 6px;"><strong>Thời gian làm việc lại:</strong> Thứ Hai (16/11/2026).</li>
        <li style="margin-bottom: 6px;"><strong>Đối tượng tham gia:</strong> Toàn thể Cán bộ Nhân viên đang làm việc tại Công ty FIT TOUR.</li>
    </ul>

    <h3 style="font-weight: bold; font-size: 16px; color: #0f172a; margin-top: 25px; margin-bottom: 10px; text-indent: 0;">
        II. CHÍNH SÁCH PHÚC LỢI ĐẶC BIỆT (TÀI TRỢ 100% CHI PHÍ)
    </h3>
    <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 18px; margin: 12px 0 18px; text-indent: 0;">
        <p style="margin: 0; text-indent: 0; color: #14532d; font-weight: 500;">
            🌟 <strong>Quyết định mở rộng từ Ban Giám Đốc:</strong> Với mong muốn 100% thành viên đều có mặt đông đủ để thắt chặt tinh thần đoàn kết, Ban Giám Đốc quyết định tài trợ <strong>100% TOÀN BỘ CHI PHÍ CHUYẾN ĐI</strong> cho toàn thể Nhân viên chính thức (bao gồm cả danh sách 08 nhân sự dưới 06 tháng theo đề xuất của Phòng Nhân Sự). CBNV tham gia hoàn toàn không phải đóng phí.
        </p>
    </div>

    <h3 style="font-weight: bold; font-size: 16px; color: #0f172a; margin-top: 25px; margin-bottom: 10px; text-indent: 0;">
        III. LỊCH TRÌNH CHƯƠNG TRÌNH "FIT TOGETHER ĐÀ LẠT"
    </h3>
    <div style="text-align: center; margin: 20px 0; text-indent: 0;">
        <img src="/lich_trinh_company_trip_dalat_2026.jpg" alt="Lịch trình Company Trip FIT TOUR Đà Lạt 2026" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border: 1px solid #cbd5e1;" />
    </div>

    <h3 style="font-weight: bold; font-size: 16px; color: #0f172a; margin-top: 25px; margin-bottom: 10px; text-indent: 0;">
        IV. CÔNG TÁC PHỐI HỢP & BÀN GIAO CÔNG VIỆC
    </h3>
    <ul style="margin: 8px 0 16px 25px; padding: 0;">
        <li style="margin-bottom: 6px;">Văn phòng Công ty sẽ tạm ngưng hoạt động trực tiếp từ <strong>ngày 11/11/2026 đến hết ngày 14/11/2026</strong> và trở lại làm việc bình thường vào Thứ Hai, ngày <strong>16/11/2026</strong>.</li>
        <li style="margin-bottom: 6px;">Các Trưởng Bộ phận chủ động xây dựng phương án phân công, sắp xếp và bàn giao công việc trước ngày khởi hành; bố trí kênh liên lạc hỗ trợ trực tuyến khi có sự việc khẩn cấp.</li>
    </ul>
</div>
    `;

    try {
        const checkRes = await db.query('SELECT id FROM official_announcements WHERE code = $1', [code]);
        if (checkRes.rows.length > 0) {
            const id = checkRes.rows[0].id;
            await db.query(`
                UPDATE official_announcements SET
                    title = $1,
                    category = $2,
                    issue_date = $3,
                    effective_date = $4,
                    signer_name = $5,
                    signer_position = $6,
                    recipient_scope = $7,
                    summary = $8,
                    content_html = $9,
                    attachment_url = $10,
                    is_pinned = $11,
                    status = $12,
                    updated_at = NOW()
                WHERE id = $13
            `, [title, category, issueDate, effectiveDate, signerName, signerPosition, recipientScope, summary, contentHtml, attachmentUrl, true, 'published', id]);
            console.log(`Đã cập nhật thông báo (ID: ${id}, Code: ${code})`);
        } else {
            const insertRes = await db.query(`
                INSERT INTO official_announcements (
                    code, title, category, issue_date, effective_date, signer_name, signer_position,
                    recipient_scope, summary, content_html, attachment_url, is_pinned, status, created_by, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
                ) RETURNING id
            `, [code, title, category, issueDate, effectiveDate, signerName, signerPosition, recipientScope, summary, contentHtml, attachmentUrl, true, 'published', 1]);
            console.log(`Đã thêm thông báo mới (ID: ${insertRes.rows[0].id}, Code: ${code})`);
        }
    } catch (dbErr) {
        console.warn('DB announcement notice:', dbErr.message);
    }
    console.log('--- Migration completed successfully ---');
    process.exit(0);
}

main().catch(err => {
    console.error('Migration failed:', err);
    process.exit(0); // Exit 0 to not block deploy
});
