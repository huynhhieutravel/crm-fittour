# Cẩm nang Trọn bộ FIT Tour CRM
## Tập 3: Module Giao dịch & Quản lý Tài chính (Bookings & Costings)

### 1. Module Bookings: Chốt Deal và Quản lý Giao dịch
Nếu "Lead" là giai đoạn tán tỉnh, thì "Booking" chính là lúc lên xe hoa. Booking là bản ghi nhận giao dịch tài chính chính thức giữa Công ty và Khách hàng.

#### 1.1 Khởi tạo Booking cực nhanh
Khi Sale nhấn nút "Tạo Booking" từ một Lead thành công, toàn bộ dữ liệu (Khách hàng, Tour đang tư vấn) được kế thừa sang. Sale chỉ cần nhập:
- Số lượng khách (người lớn, trẻ em, em bé).
- Đơn giá cho mỗi đối tượng.
- Hệ thống **tự động nhân số và tính tổng giá trị Booking**.

#### 1.2 Theo dõi tình trạng thanh toán
Quản lý dòng tiền là vấn đề sống còn. Hệ thống cho phép cập nhật:
- **Tiền cọc (Deposit):** Đã thu bao nhiêu ròng tiền mặt/chuyển khoản.
- **Tiền còn lại (Balance):** Tự động tính toán số tiền khách còn nợ (Outstanding).
- Cảnh báo trực quan cho Kế toán và Sale biết đơn nào chưa thu đủ tiền trước khi khách bay. Tuyệt đối không để xảy ra tình trạng "khách bay rồi nhưng công ty chưa thu đủ tiền".

### 2. Module Costings: Cốt lõi Tài chính / Dự toán Tour
Đây là Module phức tạp nhất, được xem là "Vũ khí hạn nặng" của ứng dụng CRM này. Nó giải quyết triệt để vấn đề mà 99% các doanh nghiệp lữ hành gặp phải: **Tính sai giá vốn -> Bán lỗ.**

#### 2.1 Ma trận Chi phí (Cost Structure)
Một tour Thái Lan đi 5 ngày, Điều hành phải làm thủ tục thu/chi cả trăm khoản. FIT Tour Costing bóc tách thành các loại chi phí rõ ràng:
- **Estimated (Dự toán):** Số tiền phòng điều hành xin ngân sách để chạy.
- **Actual (Thực tế):** Số tiền thực sự phải trả sau khi hóa đơn về hoặc chuyến đi kết thúc. Thường do Kế toán nhập.

#### 2.2 Các Khúc Chi Phí Cụ Thể
Phần mềm mô phỏng theo đúng tư duy kế toán lữ hành:
1. **Expenses (Chi phí vận hành của Công ty):** Tiền vé máy bay, Tiền Landtour, Tiền bảo hiểm, Tiền Visa. (Phải thanh toán cho các đối tác/Suppliers).
2. **Revenues (Doanh thu của Công ty):** Tiền thu từ khách qua các Booking đã ký. (Dữ liệu này được tự động kéo tổng từ tab Bookings đổ qua. Không cần nhập tay lại).
3. **Thu Hộ (Collected on behalf):** Các khoản như Tiền Tips thu hộ cho Hướng dẫn viên, tiền thu hộ mua Sim card.
4. **Chi Hộ (Paid on behalf):** Trả tiền công tác phí, tiền bồi dưỡng HDV, hoặc HDV ứng tiền trước để chi trong quá trình đi tour.

#### 2.3 Phân Tích Lợi Nhuận Trực Tiếp (Profit Margin)
- Nếu như trước đây, 1 tháng sau khi khách đi về Kế toán mới báo cáo là "Tour này lỗ", thì bây giờ, ngay bước làm Dự toán (Estimated Costing), người Quản lý đã **nhìn thấy Biên Lợi Nhuận Dự Kiến (Expected Profit & Profit Margin %)**. 
- Nếu biên lợi nhuận thấp hơn mức quy định của công ty, Giám đốc có quyền phong tỏa không cho phép khởi hành hoặc báo Sale bán cao lên.
- **Duyệt một trạm (Approval Workflow):** Khi Điều hành chốt số với Kế toán, sẽ có nút "Khóa Costing". Khi đó không ai được phép thay đổi số liệu nhằm chống gian lận tài chính.
