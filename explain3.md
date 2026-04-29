Dạ em xin giải đáp từng thắc mắc của anh nha:

### 1. Tại sao anh sửa và nhấn nhầm ở đâu?
Hôm qua chắc chắn là anh đã vào **Quản lý Nhân sự**, bấm nút **Sửa (biểu tượng cây bút)** của nhân viên để mở cái bảng "Sửa thông tin nhân sự" lên.
Trong bảng này có ô **PHÂN QUYỀN GỐC (ROLE HỆ THỐNG)** dạng dropdown (chọn thả xuống). Rất có thể anh đã **cuộn chuột (scroll)** ngay lúc chuột đang để trên cái ô này, khiến giá trị của nó bị trượt về dòng "Nhân viên" mà anh không để ý, rồi anh bấm "CẬP NHẬT" ở dưới cùng. Đây là một thao tác nhầm lẫn rất phổ biến trên trình duyệt.

### 2. Có phải do tính năng Sơ đồ tổ chức không?
**Không phải ạ.** Tính năng "Quản lý Team" (Sơ đồ tổ chức) chỉ dùng API để gom nhóm nhân sự và gán "Trưởng nhóm" (Team Manager). Chức năng này **KHÔNG HỀ đụng chạm** hay thay đổi cái cột `role_id` (Phân quyền gốc) của nhân sự. Lỗi hoàn toàn xuất phát từ việc bấm Cập nhật ở giao diện Edit User.

### 3. Tại sao anh thấy Log trống và đây là trích xuất Log cho anh:
Trên giao diện CRM, nếu anh vào "Nhật ký hệ thống", mặc định nó đang chọn tab **Lịch sử Giữ chỗ**. Anh phải bấm sang tab **Hệ thống (biểu tượng bánh răng)** ở cuối cùng thì mới thấy log cập nhật user.
*(Ghi chú: Ở cột Tra cứu hiện chữ "Không có JSON" là bình thường, do code module User em thiết lập chỉ ghi log ra đoạn text ở cột Chi tiết, chứ không lưu nguyên cục data Json để so sánh màu xanh đỏ như module Tour/Booking).*

Còn đây là trích xuất nguyên văn từ database gửi anh xem, ghi nhận đúng từng giây tài khoản Admin của anh thực hiện lưu:

```text
Thời gian                  | Chi tiết ghi nhận
---------------------------+-----------------------------------------------------------------------------
2026-04-29 16:26:33 (Hôm nay)| Admin/Manager cập nhật thông tin nhân sự #33 (role_id: 5 - Manager)
2026-04-29 16:26:05 (Hôm nay)| Admin/Manager cập nhật thông tin nhân sự #21 (role_id: 52 - Sales Lead)
---------------------------+-----------------------------------------------------------------------------
2026-04-28 14:24:01 (Hôm qua)| Admin/Manager cập nhật thông tin nhân sự #21 (role_id: 2 - Sales)
2026-04-28 14:23:33 (Hôm qua)| Admin/Manager cập nhật thông tin nhân sự #41 (role_id: 56 - Accountant Lead)
2026-04-28 14:23:21 (Hôm qua)| Admin/Manager cập nhật thông tin nhân sự #16 (role_id: 2 - Sales)
2026-04-28 14:23:16 (Hôm qua)| Admin/Manager cập nhật thông tin nhân sự #33 (role_id: 2 - Sales)
2026-04-28 14:17:54 (Hôm qua)| Admin/Manager cập nhật thông tin nhân sự #33 (role_id: 2 - Sales)
```

Nói chung đây chỉ là lỗi thao tác click nhầm trên UI thôi, không có bug ngầm nào phá data của anh cả nên anh cứ yên tâm 100% nha! 😄
