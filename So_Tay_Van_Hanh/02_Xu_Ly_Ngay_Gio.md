# 📘 02. Xử Lý Ngày, Giờ và Timezone Chênh Lệch

Căn bệnh kinh niên: Khách nhắn chiều hôm qua, CSDL hiển thị thành Sáng hôm nay!?
Nếu bạn thấy sự cố này, đó là do Lỗi Đồng Bộ Múi Giờ Giữa Các Hệ Thống (UTC vs Local).

## 1. Trật Tự Thời Gian Của Các Hệ Sinh Thái
- **Facebook Graph API (`+0000`):** Mọi thời gian mà Facebook trả qua lệnh gọi (Ví dụ `updated_time: '2026-03-31T17:03:00+0000'`) là Giờ **UTC (GMT+0)**.
- **Node.js (Server VPS):** Server được Setup bộ định tuyến môi trường chạy theo Giờ Của Trạm Đặt Máy Chủ hoặc Múi Giờ hệ điều hành `(Thường là +07:00 Indochina Time)`.
- **Database (PostgreSQL):** Các bảng của chúng ta (bảng `leads`) được khai báo cột Ngày Tháng dưới định dạng `timestamp without time zone`.

## 2. Quá Trình Nhầm Lẫn Bắt Đầu Thế Nào?
Khi Javascript tại NodeJS parse (phân tích) biến `{updated_time}` của Facebook, nó tạo ra một `Date` Object dựa trên chuẩn `UTC`. Ví dụ: `17:03 UTC`.
- Khi chèn con số này vào PostgreSQL (Do CSDL của ta **không quan tâm Timezone**), cái Trình điều khiển kết nối DB (Driver `pg`) sẽ ranh ma **cắt bỏ chữ Z đi** và "ép" thằng chuỗi thành `2026-04-01 00:03:00` (Tương đương 17h chiều UTC cộng thêm 7 tiếng).
- Lúc Cột CSDL tự thân tải lên ứng dụng React phía nhân viên, ReactJS hiểu ngầm định rằng đó là múi giờ Gốc của Máy Tính người dùng (Cũng cộng thêm vòng lặp +7 nữa). Vậy là Thời Gian sẽ bị lệch nghiêm trọng (Hiển thị Thành Sáng hôm nay).

## 3. Cách Khắc Phục:
1. **Lờ nó đi trong PostgreSQL:** Khi Query Database trên UI, hãy để nguyên! Ứng dụng Backend NodeJS bản chất sẽ tự trừ đi 1 lần trước khi gửi lên React - Và React sẽ Cộng Lại 1 Lần, bù trừ cho nhau, kết quả cuối cùng trên Web Của NV Sale hiển thị đúng 100% Khung Giờ lúc Khách Bấm Gửi Nhắn Trên Facebook Messenger App!
2. **Tuyệt đối Cấm Dùng Hàm Tự Tính bằng Interval trong SQL:** Mọi mưu đồ can thiệp vô Tầng Database bằng lệnh Cập Nhật (Kiểu như `- interval '7 hours'`) sẽ gây loạn nhịp toàn bộ chuỗi đồng hồ. Nếu dính trường hợp bạn Lỡ Chạy câu lệnh Trừ, hãy nhanh trí chạy một câu lệnh `+ interval '7 hours'` để đảo ngược Cỗ Máy Thời Gian Ngay Lập Tức!

*Chân Lý: Đừng đụng vào Múi Giờ bằng tay, hãy để các System Tự Đồng Bộ Toán Học cho nhau.*
