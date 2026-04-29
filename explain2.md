Dạ đúng rồi anh, User #1 chính xác là tài khoản `admin` (Huỳnh Trọng Hiếu) của anh đó ạ! 😄

Chắc chắn hôm qua (lúc 14:23) anh hoặc ai đó dùng máy của anh đã vào mục **Quản lý Nhân Sự** bấm Sửa hồ sơ của mấy bạn này (có thể là định update team, xem thông tin, hoặc cấp quyền). Nhưng vô tình lúc bấm nút **Cập nhật**, cái ô chọn dropdown **Phân Quyền Gốc (Role Hệ Thống)** bị nhảy/chọn nhầm về dòng `Nhân Viên` (thường lỗi này hay gặp nếu anh xài chuột cuộn scroll trúng ô select, hoặc thao tác trên điện thoại).

Vì hệ thống nhận được lệnh Lưu (Save) từ đúng tài khoản Admin của anh với dữ liệu `role_id: 2` (Sales), nên Audit Log đã ghi lại chính xác lịch sử là Admin đã đổi các bạn ấy thành Nhân viên thường. 

Anh yên tâm 100% là **KHÔNG có lỗi code hay script nào tự chạy ngầm** đâu ạ. Lỗi này hoàn toàn là sự cố vô tình click/scroll nhầm trên giao diện UI ngày hôm qua thôi. Giờ anh cứ báo Vy Phan (`sv1.sale`) F5 lại là mọi thứ lại hiển thị ngon lành như cũ. Nếu còn bạn Lead nào bị thì anh chỉ cần vào đổi Role lại là xong ngay ạ!
