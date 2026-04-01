# 📘 03. Cứu Hộ Lịch Sử: Đồng Bộ Messenger Leads Facebook

Sổ tay này ghi lại Quy trình vận hành và Sửa chữa Hậu Cấp Cứu khi hệ thống lỡ mất toàn bộ Data Leads (Do vô tình Truncate hoặc Dọn dẹp máy chủ lỗi).

## 1. Bản chất của Đồng Bộ FB Messenger
Mặc định hệ thống chia thành 2 loại Luồng:
- **Thời gian thực (Real-time):** Hook từ Facebook đẩy thẳng về `/api/facebook/webhook` cho mỗi cái Ping nhắn mới nhất.
- **Chu kỳ Bù đắp (Polling):** Cronjob `syncRecentConversations` âm thầm gọi qua API 1 phút 1 lần, hút sạch các tin chưa đồng bộ.

## 2. Làm Sao Để Kéo Toàn Bộ Khách Hàng Nửa Năm Trước?
Hệ thống KHÔNG THỂ VÀ KHÔNG ĐƯỢC PHÉP tự ý tải Toàn bộ lịch sử hàng chục ngàn tin nhắn 1 lần - Trừ khi có biến cố.
Nếu rơi vào khủng hoảng cần Tái tạo Dữ liệu (Như ngày 01/04/2026), chúng ta kích hoạt Kịch Bản Giải Cứu (Script): `server/scripts/sync_all_messenger_leads.js`.

### Cách Sử Dụng Script Cứu Hộ:
1. SSH vào Máy Chủ bằng Lệnh:
```bash
cd /var/www/fittour-crm/server
```
2. Mở file Script `scripts/sync_all_messenger_leads.js` lên và SỬA 2 dòng Mã Quan Trọng:
```javascript
const START_DATE_MS = new Date('2026-03-01T00:00:00+07:00').getTime(); // Ngày bắt đầu lục kho
const END_DATE_MS = new Date('2026-03-31T23:59:59+07:00').getTime();   // Cột mốc chấm dứt
```
3. Khởi Chạy Lệnh Rà Quét:
```bash
node scripts/sync_all_messenger_leads.js
```
Hệ thống sẽ chạy cuốn chiếu (Pagination `/messages`) liên tục lật trang các cuộc Hội Thoại, tách lọc Khách Mới và chèn lại CSDL dựa trên Ngày Giờ Khách PM theo LocalTime chính xác. Những tài khoản ĐÃ TỒN TẠI TRONG CSDL sẽ Tự Động Được Bỏ Qua để chống Spam Trùng lặp.

> **Lưu ý Về Ghi Chú Content:** Trong lúc Cứu hộ, có vài loại dạng Tin Nhắn gửi Bằng Sticker Mặt Cuời, Chuyển Tiếp Tin Nhắn, Hình Ảnh không có Text `message.message == null`. Phải chèn cơ chế "Bắc Bờ" Gán Tên: `[Bạn Đã Nhận Được Hình Ảnh / Sticker...]` để CSDL Postgresql không ném Lệnh Đứt Gãy Do Violating Constraint Không Thể Trống.
