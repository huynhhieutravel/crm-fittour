# Cẩm Nang Sống Còn (System Guidelines)
*Tài liệu này ghi chú lại tất cả những bài học xương máu và các quy tắc vận hành sống còn của hệ thống FIT Tour CRM được rút ra từ sự cố sập Webhook & Mất dữ liệu ngày 01/04/2026. Bất kỳ Developer (hoặc AI) nào khi chạm vào Codebase này ĐỀU PHẢI ĐỌC kỹ.*

---

## 1. Múi Giờ và Timestamp (Đặc biệt quan trọng)
*Lỗi lệch 7 tiếng là một lỗi kinh điển khi xử lý dữ liệu Graph API của Facebook và PostgreSQL.*

- **Quy tắc về Facebook Graph API:** Tất cả các luồng API lấy tin nhắn từ Facebook (ví dụ `updated_time` của Conversation/Message) **luôn luôn trả về giờ chuẩn UTC** (ví dụ: `2026-03-31T17:03:00+0000`).
- **Quy tắc về Node.js & Database:** Máy chủ (VPS) đang chạy múi giờ `GMT+07:00` (Vietnam Time). Cột `created_at` và `last_contacted_at` thiết kế trong CSDL là kiểu `timestamp WITHOUT time zone`.
- **Triệu chứng & Giải pháp:** Khi bạn chèn một đối tượng `Date` của Node.js vào CSDL PostgreSQL, Driver `pg` sẽ **tự động cắt bỏ Timezone** và chèn đoạn chuỗi theo Giờ Địa Phương (Local Time - `+07:00`) của NodeJS. 
  👉 **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý CỘNG/TRỪ 7 TIẾNG** bằng các câu lệnh SQL như `created_at - interval '7 hours'` vì hệ thống Frontend (React) khi nhận dữ liệu sẽ tự động cộng múi giờ lại, làm hiển thị hoàn toàn chính xác giờ Việt Nam. Can thiệp thủ công sẽ khiến thời gian bị lùi/tiến gấp đôi!

## 2. Meta Access Token & Webhook
*Lỗi Token hết hạn là nguyên nhân chính khiến Webhook chết và Poller bị chặn.*

- **KHÔNG SỬ DỤNG USER ACCESS TOKEN:** Token nằm trong file `.env` (Biến `FB_PAGE_TOKEN`) KHÔNG ĐƯỢC PHÉP là Token của người dùng (Token lấy từ các Tool như Graph API Explorer). Nó sẽ tự động chết / hết hạn khi Admin đổi mật khẩu Facebook hoặc sau 60 ngày.
- **BẮT BUỘC DÙNG SYSTEM USER TOKEN:** Để hệ thống chạy nền vĩnh viễn, phải truy cập `business.facebook.com/settings` > System Users > Tạo một con AI (System User) > Sinh Token ở đó. Mã này có tuổi thọ vô hạn.
- **Lưu ý Code đối với System User:** Bọn System User này là "thực thể ma", nếu bạn gọi `/me/accounts` để lấy danh sách Fanpage, nó sẽ trả về **mảng rỗng `[]`**. Thay vào đó, mã Code tự động đồng bộ phải gọi `/me` và lấy trực tiếp `PAGE_ID` cụ thể hoặc đọc thẳng từ Settings Database.

## 3. Quản lý Database & Cấm kỵ
- **Script `auto_import_db.js`:** Đây là script CẤM KỴ trên môi trường Production (`crm.tournuocngoai.com`). Kịch bản này chứa lệnh `TRUNCATE TABLE` xóa trạch dữ liệu bảng `settings` và các bảng khác. Việc lỡ tay kích hoạt kịch bản này sẽ **Xóa sạch Token đồ thị Hệ thống** và làm sập toàn bộ đường dây vận chuyển Lead.
- Việc Backup / Khôi phục Data giữa Local (`localhost`) và Production (`VPS`) chỉ được thao tác thông qua cơ chế Append (Thêm mới) hoặc Update chọn lọc. 

## 4. Biên Dịch Môi Trường React (Frontend Build)
- Dự án CRM phân chia rạch ròi: React (Vite) ở thư mục `/client` và Node.js Express ở `/server`.
- **Sự cố phổ biến:** Developer (hoặc AI) sửa mã `.jsx` xong (Ví dụ sửa `LeadsTab.jsx`) nhưng Sếp ấn F5 ở Web Production không thấy thay đổi.
- **Quy tắc Vàng:** Sau khi sửa bất kì file UI nào, BẮT BUỘC phải dùng luồng **Compile**.
  - Truy cập VPS
  - Chuyển vào thư mục `cd /var/www/fittour-crm/client`
  - Chạy lệnh `npm run build`
  - Đợi khoảng 60s để Vite nén lại ruột thư mục `/dist`. Khi đó code mới mới chính thức có hiệu lực trên Internet.

---
*Ngày soạn thảo: 01/04/2026 - Sự cố: Thất thoát & Khôi phục thành công 2500 Leads Messenger*
