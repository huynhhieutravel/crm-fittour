# 📘 01. Hướng Dẫn: Facebook System User Token & Webhook

Đây là tài liệu cực kỳ quan trọng giúp duy trì kết nối Sinh tử giữa CRM và Facebook Fanpage mà không bị đứt đoạn sau 60 ngày.

## 1. Sự khác biệt giữa Token Thuờng và Token Hệ Thống
- **User Access Token (Sai lầm phổ biến):** Sinh ra khi Đăng nhập Facebook bằng tài khoản cá nhân qua tính năng "Login with Facebook" hoặc Tools. Mã này có đuôi `expires_in`, thường sống được 60 ngày hoặc **CHẾT NGAY LẬP TỨC** nếu tài khoản đó Đổi Mật Khẩu Facebook. Nếu bạn nhúng mã này vào file `.env` của CRM, một ngày đẹp trời hệ thống bắt Lead sẽ sụp đổ hoàn toàn.
- **System User Access Token (Chân ái):** Được sinh ra trong màn hình Cài đặt Doanh Nghiệp (Business Settings). Con Token này là vĩnh viễn (Không bao giờ chết), trừ khi bạn tự tay Bấm Thu Hồi Giấy Phép.

## 2. Cách Tạo System User Token
1. Truy cập [Meta Business Settings](https://business.facebook.com/settings).
2. Vào thẻ **Người dùng** > **Người Dùng Hệ Thống** (System Users).
3. Thêm mới 1 tài khoản System User (Phân quyền Quản trị viên - Admin).
4. Cấp Tài Sản cho con System User đó: Phải Gán (Assign) nó vào CÁI FANPAGE cần hút Lead, và Phân cho nó Quyền Quản Trị Fanpage (Full Control).
5. Nhấn **Tạo Token (Generate Token)**. Tích vào các quyền: 
   - `pages_show_list`
   - `pages_messaging`
   - `pages_read_engagement`
   - `pages_manage_metadata`
6. Bấm Lưu và Copy cái Token dài ngoằng đó.

## 3. Cách Bơm Token "Thuốc Hồi Sinh" Cho Hệ Thống
*Trong trường hợp VPS đang báo lỗi không kéo được tin nhắn mới.*
- Tuyệt đối không lưu Token mới lên biến `FB_PAGE_TOKEN` ở file `.env`. (Biến này đã trở nên lạc hậu và không tin cậy).
- Cập nhật Token mới cắm thẳng vào **Settings Table** trong CSDL PostgreSQL. CRM FIT Tour hiện thiết kế luồng tự động tìm đọc biến thẻ cài đặt `meta_page_access_token` để chạy Background Worker.
- Do System User không có đặc điểm `accounts` thông thường, bạn KHÔNG ĐƯỢC dùng API truy vấn `me/accounts` để tìm Page ID. File Code (`facebookService.js` / `sync_all_messenger_leads.js`) đã được thiết kế lại để bốc đúng cái PAGE_ID có sẵn trong Database ra mà dò (endpoint `PAGE_ID/messages`).

## 4. Webhook Thất Thủ?
Nếu Webhook hoàn toàn im lặng khi khách Nhắn, có thể Facebook đã tạm ngừng bắn do Server VPS từng bị sập trước đó (Lỗi 400). Khi đó:
- Kiểm tra lại Token sống hay chết.
- Nếu Token sống mà Webhook vẫn im, cứ giữ yên máy chủ. Trình Poller quét tự động (Chạy mỗi phút 1 lần) của `facebookService.js` sẽ tự động cào những tin nhắn bị rớt rớt để kéo thả vào CRM, như một Lớp Bảo Vệ Số 2 an toàn tuyệt đối.
