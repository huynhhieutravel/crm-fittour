export const SOP_META_ADS_MARKDOWN = `
## Mục đích

Áp dụng thống nhất quy tắc đặt tên cho toàn bộ tài khoản Meta Ads của FIT TOUR nhằm:

- Dễ tìm kiếm chiến dịch.
- Dễ quản lý và bàn giao.
- Dễ đọc báo cáo.
- Dễ mở rộng khi số lượng Campaign tăng lên.

<div style="display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
  <a href="/tai-lieu/quy-tac-dat-ten-quang-cao-meta" style="background: linear-gradient(135deg, #f97316, #e55e20); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(249,115,22,0.3); display: inline-flex; align-items: center; gap: 8px;">
    <span>📊</span> Xem Infographic Trực Quan
  </a>
</div>

## Cấu trúc tổng thể
\`Campaign\` -> \`Ad Set\` -> \`Ads\`

Mỗi cấp chỉ chứa thông tin thuộc phạm vi của cấp đó.

| Cấp | Quản lý |
| :--- | :--- |
| **Campaign** | Mục tiêu kinh doanh |
| **Ad Set** | Chiến lược chạy quảng cáo |
| **Ads** | Nội dung quảng cáo (Creative) |

---

## 1. Campaign (Chiến dịch)
**Cấu trúc:** \`[BU] Objective | Product | Period | Ghi chú\`

### Thành phần
- **BU:** Đơn vị kinh doanh 
- **Objective:** Mục tiêu Campaign
- **Product:** Tour/Sản phẩm
- **Period:** Thời gian chạy
- **Ghi chú:** Thông tin bổ sung (không bắt buộc)

### Ví dụ
- \`[BU1] MSG | Trung Quốc | Q3-2026 | Evergreen\`
- \`[BU2] SALES | Bhutan | H2-2026 | Flash Sale\`
- \`[BU4] TRAFFIC | Ladakh | T08-2026 | Blog\`

---

## 2. Ad Set (Nhóm quảng cáo)
**Cấu trúc:** \`[BU] Tour | Loại chạy | Creative | Budget | Ghi chú\`

### Thành phần
- **BU:** Đơn vị kinh doanh
- **Tour:** Tour hoặc sản phẩm đang chạy
- **Loại chạy:** Đối tượng hoặc chiến lược phân phối
- **Creative:** Loại nội dung chính
- **Budget:** Ngân sách mỗi ngày
- **Ghi chú:** Thông tin bổ sung (không bắt buộc)

### Ví dụ
- \`[BU1] Trung Quốc | COLD | VID | 300K\`
- \`[BU1] Trung Quốc | RMKT | IMG | 200K\`
- \`[BU2] Ladakh | LLA1% | VID | 500K\`
- \`[BU4] Bhutan | BROAD | CAR | 300K | Test A\`

---

## 3. Ads (Quảng cáo)
**Cấu trúc:** \`[BU] Tên Creative | Format | Hook | Version\`

### Thành phần
- **BU:** Đơn vị kinh doanh
- **Tên Creative:** Tên nội dung quảng cáo
- **Format:** Định dạng quảng cáo
- **Hook:** Góc triển khai nội dung
- **Version:** Phiên bản

### Ví dụ
- \`[BU1] Lệ Giang - Sa Khê | VID | Story | V1\`
- \`[BU1] Chuyến tàu Thanh Tạng | VID | Review | V1\`
- \`[BU1] Ladakh | IMG | Offer | V2\`
- \`[BU4] Bhutan | CAR | Itinerary | V3\`

---

## Quy Ước

### BU
BU1, BU2, BU3, BU4

### Objective
- **MSG:** Tin nhắn
- **SALES:** Chuyển đổi/Bán hàng
- **LEAD:** Thu thập khách hàng
- **TRAFFIC:** Website
- **ENG:** Tương tác
- **VIDEO:** Lượt xem video

### Loại chạy
- **COLD:** Khách hàng mới
- **RMKT:** Remarketing
- **LLA1%:** Lookalike 1%
- **LLA3%:** Lookalike 3%
- **BROAD:** Tệp rộng

### Creative & Format
- **VID:** Video
- **IMG:** Hình ảnh
- **CAR:** Carousel
- **REEL:** Reel
- **UGC:** Nội dung từ khách hàng

### Hook
Story (Kể chuyện), Review (Đánh giá), Offer (Ưu đãi), Price (Giá bán), Experience (Trải nghiệm), Highlight (Nổi bật), Itinerary (Lịch trình), FAQ (Giải đáp), Testimonial (Chia sẻ), Seasonal (Theo mùa), Promo (Khuyến mãi).

### Version
\`V1, V2, V3...\`
*(Mỗi lần chỉnh sửa nội dung hoặc thay đổi đáng kể Creative, tạo Version mới thay vì đổi tên Version cũ).*

---

## Nguyên tắc đặt tên

### Nên
- Đặt tên theo đúng cấu trúc SOP.
- Viết ngắn gọn, dễ đọc.
- Sử dụng thống nhất các từ viết tắt.
- Chỉ viết hoa các mã quy ước (BU, MSG, VID...).
- Thêm Version khi chỉnh sửa Creative.

### Không nên
- Đặt tên quá dài.
- Viết nhiều kiểu khác nhau cho cùng một ý nghĩa.
- Thêm emoji hoặc ký tự đặc biệt.
- Ghi thông tin không liên quan vào tên.
- Đổi tên Version đã chạy để tránh sai lệch khi đối chiếu báo cáo.

> **Nguyên tắc vàng:** Chỉ cần nhìn tên là biết chiến dịch nào, đang bán tour gì, đang chạy theo chiến lược nào và đang sử dụng nội dung quảng cáo nào, mà không cần mở vào chi tiết. Đây là tiêu chuẩn đặt tên áp dụng thống nhất cho toàn bộ tài khoản Meta Ads của FIT TOUR.
`;
