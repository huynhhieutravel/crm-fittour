# Cẩm nang Trọn bộ FIT Tour CRM
## Tập 1: Module Quản lý Khách hàng & Bán hàng (Leads, Customers & Inbox)

### 1. Tổng quan vấn đề của ngành lữ hành
Trong mô hình đại lý du lịch truyền thống, dữ liệu khách hàng (Leads) thường bị phân mảnh. Khách hàng nhắn tin từ Fanpage Facebook, Zalo cá nhân của Sale, hoặc điền form từ Website. Đội ngũ Sale thường tự quản lý bằng sổ tay hoặc Excel cá nhân. Điều này dẫn đến 3 rủi ro cực lớn:
- **Thất thoát dữ liệu:** Khi nhân viên nghỉ việc, dữ liệu khách hàng mất theo.
- **Bỏ quên khách hàng:** Tỷ lệ chốt sale giảm vì Sale quên lịch hẹn gọi điện lại (Follow-up) cho khách.
- **Thiếu tính liền mạch:** Khách hàng phải lặp lại thông tin nhiều lần khi chuyển giao từ Sale này sang Sale khác, hoặc từ Sale qua Điều hành.

### 2. Giải pháp từ FIT Tour CRM: Module Lead Management
Hệ thống thiết kế một luồng quản trị phễu khách hàng (Sales Pipeline) hình ống, đảm bảo không có khách hàng nào bị "rơi" ra ngoài hệ thống.

#### 2.1. Quản lý trạng thái thông minh (Status Tracking)
Thay vì chỉ lưu tên và số điện thoại, mỗi khách hàng tiềm năng (Lead) được gán một vòng đời trạng thái cụ thể:
- **Mới (New):** Khách hàng vừa để lại thông tin, chưa ai xử lý.
- **Đang tư vấn (In Progress):** Sale đang nhắn tin, báo giá, hoặc thuyết phục.
- **Chốt đơn (Won - Chuyển đổi thành Booking):** Khách hàng đồng ý mua tour, đóng cọc.
- **Thất bại (Lost):** Khách hàng chưa nhu cầu, hệ thống sẽ lưu lý do rớt (Đắt, bận lịch, mua chỗ khác) để phân tích sau này!
- **Chương trình Chăm sóc lại (Retargeting):** Tập khách rớt nhưng có tiềm năng đi các tour mùa sau.

#### 2.2. Tương tác trực tiếp và Ghi chú (Inbox & Notes)
- Giao diện dạng **Inbox** giúp Sale chat, lưu lịch sử trao đổi qua điện thoại ngay trong hồ sơ khách hàng. 
- Mọi ghi chú nội bộ (Note) được lưu theo thời gian thực (Timestamp), giúp người Quản lý (Manager) nhảy vào xem hồ sơ là biết ngay tiến độ tư vấn đến đâu mà không cần đi hỏi Sale.

#### 2.3. Trợ lý nhắc nhở (Reminders)
Đây là "vũ khí bí mật" giúp tăng tỷ lệ chốt (Conversion Rate). 
- Sale có thể tạo một "Reminder" (Hẹn giờ gọi lại/Gửi báo giá).
- Đến đúng giờ, hệ thống sẽ nổ thông báo (Notification) nhắc Sale. Nếu Sale không xử lý, cảnh báo sẽ báo đỏ và Quản lý có thể nhìn thấy năng suất làm việc của Sale đó đang kém.

#### 2.4. Bản điều khiển số liệu Lead (Leads Dashboard)
Cung cấp cái nhìn bao quát dành cho cấp quản lý:
- **Pie Charts (Biểu đồ tròn):** Phân bổ Lead tỷ lệ trạng thái (Bao nhiêu % đã chốt, bao nhiêu % đang chờ).
- **Time-series Charts:** Báo cáo thời gian thực, đo đếm số lượng Lead đổ về theo từng ngày, từng tháng.
- Phân tích hiệu năng chuyển đổi theo Nguồn Marketing (Từ Facebook Ads tốt hơn hay từ nguồn giới thiệu tốt hơn).
- Tích hợp theo dõi hiệu suất của từng Phòng kinh doanh (BU - Business Unit) để xem đội nào đang mang lại nhiều doanh thu nhất.

### 3. Phân Hệ Quản lý Khách hàng Chức năng (Customers Management)
Khi Lead "Chốt đơn", dữ liệu lập tức chuyển hóa thành **Customer (Khách hàng thực tế)** với đầy đủ trường thông tin pháp lý phục vụ việc xin Visa và Điều hành Tour:
- Quản lý hộ chiếu (Passport), ngày hết hạn, hình ảnh hồ sơ trực tiếp tải lên CRM.
- Lưu trữ lịch sử tất cả các Tour mà khách hàng này đã từng đi. Nhờ đó, nếu khách quay lại vào năm sau, Sale chỉ cần gõ số điện thoại là ra ngay "Anh A năm ngoái đi Thái báo đậu Visa, năm nay tư vấn đi Nhật!". Tạo ra trải nghiệm cá nhân hóa cực kỳ đẳng cấp.
