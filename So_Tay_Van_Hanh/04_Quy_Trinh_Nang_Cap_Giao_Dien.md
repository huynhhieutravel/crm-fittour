# 📘 04. Quy Trình Phẫu Thuật Sản Phẩm: Deploy Frontend ReactJS

Dành cho Lập Trình Viên: Tại sao Code Sửa Trên Máy Xong Nhưng Gửi Link Khách Kêu Lỗi Cũ!? (ReactJS Caching And Building System)

## Vấn Đề
Dự án CRM này phân chia tách rời `Client` (Bán Hàng Trên React) và `Server` (Nhà Máy Phân Phối Cảng Cửa Bằng Express Node).
Mỗi một Lần Thay Đổi Code Cốt Lõi Trên Thư Mục `.jsx` ở Máy Tính Nhà, Bạn Đang Thay Đổi "Bản Ghost Của Bạn". 
Giao Diện Hosting Của Bạn Đang Hiển Thị Trang Chủ Đóng Mạng Được Nén Từ Thuở Khai Thiên Lập Địa (Sẽ Rất Lạc Hậu).

## Giải Quyết (Build Lên Tiền Tuyến Production)

Khi Vừa Thêm Tính Năng Đỉnh Cao (Ví dụ Thêm Mục Sửa SĐT Inline Thay Cho Modal):
1. **Dùng Chuẩn SFTP/SCP Bắn Mã Nguồn Lê VPS.**
Đừng đẩy lung tung, chỉ Bắn thư mục `src/tabs` (Hoặc các Component Đã Sửa) lên đường dẫn `/var/www/fittour-crm/client/src/...` tại VPS.

2. **Truy Cập Server Hô Biến Cốt Lõi (Build Vite):**
Vào Terminal SSH:
```bash
cd /var/www/fittour-crm/client
npm run build 
```
3. **Phân Tích Quá Trình:**
Tiến Trình Chạy Mất Khoảng Vài chục Giây, Nó Quét Rác, Tối Ưu Tốc Độ, Gói Bộ Khung Khuyên Thành Các Gói Code JavaScript Đóng Gọi Trong Thư Mục Nén: `/client/dist`. 
Và Express Của Bạn Sẽ Tự Động Định Tuyến Mọi Truy Cập Bốc Folder `/dist` làm Web Mặc Định. 

4. **Kích Thích Phía Người Dùng Rửa Cache:**
Người dùng ở Vị Công Ty Sẽ Nói Code Chưa Dính. Thú Cứ Kệ Họ! Bảo Mọi Ngồi Trong Phòng Đồng Loạt Bấm Combo Phím Giết Chết Khuyết Cục:
```text
Windows: Ctrl + F5
Mac OS: Command + Shift + R
```
Đột Nhiên Website Vội Lột Xác Giao Diện Mới Có Đầy Đủ Các Tính Năng 100% Cập Nhật Thực Tế!
