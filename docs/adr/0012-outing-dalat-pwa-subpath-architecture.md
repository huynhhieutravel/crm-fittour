# 12. FIT Together Đà Lạt 2026 — Kiến Trúc Cẩm Nang Du Lịch PWA Dạng Subpath

- **Status**: Accepted
- **Deciders**: Huỳnh Trọng Hiếu (MKT Lead), Ban Tổ Chức Company Trip FIT TOUR
- **Date**: 2026-10-30

## Context & Problem Statement
FIT TOUR tổ chức chuyến đi Outing thường niên tại Đà Lạt từ ngày 11/11 đến 14/11/2026 cho 32 thành viên công ty. Đoàn sẽ trải qua các hoạt động kết hợp: trekking rừng thông, cắm trại qua đêm tại lều, chèo thuyền SUP trên hồ Tuyền Lâm, thưởng thức đêm nhạc Bình Minh Ơi và tiệc BBQ tại Villa.

Yêu cầu kỹ thuật:
1. Giao diện Apple Minimalist, trực quan, hỗ trợ xem tốt trên điện thoại (Safari iOS / Android) và máy tính.
2. Cần hoạt động ngoại tuyến (Offline) vì khu vực rừng và hồ Tuyền Lâm sóng di động 4G chập chờn.
3. Bảo mật thông tin định danh cá nhân (PII), không để lộ số thẻ CCCD và ngày sinh nhật trên trang công cộng của đoàn.
4. Triển khai theo dạng đường dẫn đơn (Single Subpath `/...`) trên domain hiện hữu, không dùng subdomain để tránh phát sinh cấu hình bản ghi DNS và cấp chứng chỉ SSL độc lập.

## Decision Drivers
- **Tính tiện lợi khi chia sẻ link**: Nhân viên công ty nhận link qua Zalo nhóm công ty và bấm vào xem ngay lập tức mà không cần đăng nhập phức tạp.
- **Khả năng hoạt động khi mất mạng**: Cần lưu trữ cục bộ lịch trình, thực đơn, checklist đồ dùng và danh bạ để tra cứu giữa rừng sâu.
- **Tiêu chuẩn dữ liệu an toàn**: Tuân thủ quy định bảo mật PII theo GLOSSARY của FIT TOUR.

## Considered Options
1. **Trang động React SPA tích hợp vào trong `client` CRM**:
   - *Ưu điểm*: Tận dụng hạ tầng hiện có.
   - *Nhược điểm*: Nặng nề, yêu cầu build toàn bộ dự án Vite lớn, dễ vướng xác thực phiên đăng nhập (Auth Token) khiến nhân viên không mở nhanh được từ Zalo di động.
2. **Subdomain riêng biệt (`outing2026.fittour.com.vn`)**:
   - *Ưu điểm*: Tách biệt hoàn toàn.
   - *Nhược điểm*: Phải thêm bản ghi DNS A/CNAME, sinh chứng chỉ SSL mới, tốn thời gian cấu hình.
3. **PWA Tĩnh siêu nhẹ chạy dưới dạng Subpath (`/chuyen-di-da-lat` hoặc `/outing-dalat-2026`)** (ĐƯỢC CHỌN):
   - Tự chứa (Self-contained) trong thư mục `outing-dalat-2026/`, tương thích 100% với Nginx `location /outing-dalat-2026 { alias ...; }` hoặc Cloudflare Pages.
   - Tích hợp Service Worker (`sw.js`) và `manifest.json` theo chuẩn PWA.
   - Sử dụng đường dẫn tương đối (`./assets/...`) đảm bảo chạy chuẩn ở bất kỳ cấp thư mục nào.

## Decision Outcome
Đã chọn **Phương án 3**.

### Triển khai chi tiết:
1. **Port thử nghiệm Localhost**: Chạy trên cổng `7788` (`http://localhost:7788/`) để tránh xung đột Service Worker lưu tạm từ các dự án game/app khác từng chạy trên cổng `3300`.
2. **Bảo mật PII**: Giữ ẩn trường `Số thẻ CCCD` và `Ngày, tháng, năm sinh` trên giao diện người dùng. Chỉ hiển thị Tên, Nickname, BU, Chức vụ, Số điện thoại (kèm nút gọi nhanh `tel:`) và Ghi chú di chuyển.
3. **Cơ chế Team Game tương lai**: Danh sách 32 thành viên tạm thời giữ nguyên theo phòng ban/BU. Trong giai đoạn kế tiếp, hệ thống sẽ mở rộng tính năng phân chia thành **3 Team thi đấu Teambuilding** khi có kịch bản trò chơi chính thức từ ban tổ chức.
4. **PWA Offline**: Tự động cache `index.html`, `members.json`, `lich-trinh.png` và tài nguyên hiển thị. Hỗ trợ "Add to Home Screen" trên iPhone và Android như một ứng dụng native.

