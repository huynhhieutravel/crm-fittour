# Cẩm nang Trọn bộ FIT Tour CRM
## Tập 2: Module Lắp ráp Sản phẩm & Lịch khởi hành (Tours & Departures)

### 1. Bối cảnh
Điều hành Tour nước ngoài phức tạp hơn tour nội địa rất nhiều. Một công ty du lịch sẽ có các "Sản phẩm Tour" (Ví dụ: Tour Thái Lan 5N4Đ, Tour Châu Âu 9N8Đ). Tuy nhiên, mỗi Sản phẩm này lại được khởi hành ở nhiều ngày khác nhau, ví dụ: Thái Lan 5N4Đ bay ngày 10/10 và ngày 15/10. 
Hai chuyến đi này có giá vốn khác nhau, hướng dẫn viên khác nhau, hàng không khác nhau. Nếu chỉ quản lý bằng Excel, việc cập nhật "còn bao nhiêu chỗ trống" (Inventory) cho đội Sale là cực kỳ thủ công và chậm trễ, dẫn đến tình trạng "bán lố chỗ" (Oversell) phải đền bù cho khách hàng.

### 2. Giải pháp: Quản trị Phân cấp (Tours -> Departures)
FIT Tour CRM tách biệt rõ ràng giữa Sản phẩm Mẫu (Tour) và Chuyến khởi hành thực tế (Departure).

#### 2.1. Quản lý Sản phẩm Tour (Tours Management)
- **Tạo khung sản phẩm:** Khai báo thông tin mô tả chi tiết, hình ảnh nổi bật, số ngày số đêm, quốc gia điểm đến.
- Hệ thống hỗ trợ tích hợp dữ liệu linh hoạt, phân nhóm Tour theo dòng sản phẩm (Luxury, Tiêu chuẩn, Giá rẻ).
- Sale dễ dàng lấy thông tin (URL, Description) để gửi cho Khách hàng một cách nhanh chóng.

#### 2.2. Lịch Khởi hành Trực tuyến (Departures) - Kho báu của Điều hành
Đây là "trái tim" của khối Điều hành (Operators):
- **Quản lý Inventory chặt chẽ:** Khi tạo 1 Departure, điều hành sẽ nhập "Tổng số chỗ (Capacity)". Giả sử là 30 chỗ bay Vietnam Airlines ngày 10/10.
- **Real-time Availability (Số chỗ trống thời gian thực):** Bất cứ khi nào Sale tạo 1 Booking 5 khách gán vào Departure này, hệ thống sẽ **TỰ ĐỘNG** trừ đi 5 chỗ. Số chỗ trống lập tức nhảy xuống 25 trên màn hình của tất cả mọi người. Không cần phải gọi điện hỏi nhau nữa!
- Cảnh báo giới hạn: Hệ thống sẽ báo màu đỏ/cam khi Booking sắp vượt ngưỡng hoặc sắp hết chỗ.
- **Trạng thái Khởi hành:** 
  - *Sắp chạy (Upcoming)*: Bán bình thường.
  - *Full (Đầy chỗ)*: Khóa không cho Sale book thêm.
  - *Hoàn tất (Completed)*: Tour đã đi về xong, tiến hành quyết toán.

#### 2.3. Tính năng quản lý Hành lý & Chuyến bay
Đối với nghiệp vụ Outbound, FIT Tour cung cấp trường dữ liệu rành rọt về:
- Hãng hàng không, mã chuyến bay khứ hồi, giờ bay đi, giờ bay về.
- Số ký hành lý đi kèm.
Giúp Sale và Khách có thông tin ngay lập tức trước khi chốt đơn.

### 3. Đồng bộ hóa với Kế toán (Chốt sổ Tour)
Khi một chuyến đi (Departure) kết thúc, hệ thống cho phép "Đóng Tour" để kích hoạt quy trình quyết toán (Costing) ở phòng kế toán. Mọi người đều có một bức tranh chung và sử dụng dữ liệu từ 1 nguồn duy nhất (Single Source of Truth), đảm bảo tính chính xác tuyệt đối.
