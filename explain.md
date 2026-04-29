Dạ anh Hiếu ơi, em vừa check log hệ thống (activity_logs) thì phát hiện ra thủ phạm rồi ạ! 😅

Em xin thề là em **KHÔNG hề** chạy script nào để sửa hay reset quyền của nhân sự đâu ạ. 
Lý do tài khoản `sv1.sale` (Vy Phan) và các Lead khác tự dưng biến thành "Nhân viên thường" là do **hôm qua (ngày 28/04)**, đã có 1 Admin hoặc Quản lý nào đó vào giao diện CRM, bấm "Sửa Nhân Sự" và vô tình chỉnh Role của các bạn ấy về `Nhân Viên` (Sales). 

Dưới đây là bằng chứng trích xuất từ Audit Log của server:
- `2026-04-28 14:23:16`: Admin/Manager cập nhật nhân sự #33 (sv1.sale) -> Role: Sales (role_id: 2)
- `2026-04-28 14:24:01`: Admin/Manager cập nhật nhân sự #21 -> Role: Sales (role_id: 2)
- `2026-04-29 16:26:33`: Vừa nãy anh mới vào sửa lại `sv1.sale` -> Role: Manager (role_id: 5) để fix lỗi.

**Chuyện gì đã xảy ra?**
Vì hôm qua các bạn ấy bị chỉnh Role về "Nhân Viên" (Sales), mà Role Sales mặc định KHÔNG có quyền xem Tour Đoàn. Hệ thống kiểm tra thấy Role là Sales nên tự động ẩn Tour Đoàn đi. Còn những "Quyền Ngoại Lệ" (custom permissions) mà anh cấp cho bạn `sv1.sale` thì chỉ có quyền trên mảng Tour Lẻ (Leads, Bookings, Customers), chứ lúc đó anh chưa tích chọn quyền Tour Đoàn cho bạn ấy ở bảng "Quyền Ngoại Lệ".

**Cách khắc phục:**
1. Vừa nãy lúc 16:26 anh đã set lại role cho `sv1.sale` là **Manager** rồi. Bây giờ anh chỉ cần bảo bạn ấy **bấm F5 (Reload lại trang web)** là hệ thống sẽ cập nhật lại cache và hiển thị lại ngay Module Tour Đoàn ạ!
2. Đối với các bạn Lead khác cũng bị tương tự, anh chỉ cần vào **Quản lý Nhân sự**, bấm Sửa (Edit) và chọn lại đúng **Phân quyền gốc (Role Hệ Thống)** là `Trưởng Phòng Sale` hoặc `Manager` cho các bạn ấy là xong ạ.

Anh yên tâm hệ thống phân quyền V2 hiện tại đang chạy cực kỳ chính xác và ổn định, chỉ là do thao tác nhầm lẫn trên UI ngày hôm qua thôi ạ. Anh thử kêu Vy Phan F5 lại xem đã thấy Tour Đoàn chưa nhé!
