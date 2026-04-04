# Cẩm nang Trọn bộ FIT Tour CRM
## Tập 4: Module Vận hành, Quản trị Nhân sự & Phân tích Dữ liệu

### 1. Phân hệ Quản lý Hướng Dẫn Viên (Guides Management)
Hướng dẫn viên (HDV) đôi khi không phải là nhân viên chính thức của công ty lữ hành (Freelancers), nên việc quản lý họ rất lỏng lẻo. Hệ thống FIT Tour CRM đóng gói tính năng này lại thành một phân hệ nhân sự thu nhỏ:
- **Hồ sơ thông tin:** Lưu trữ ID, ngày sinh, ngôn ngữ chuyên môn (Ví dụ: Chuyên tiếng Anh, tiếng Thái).
- **Lưu trữ Giấy tờ pháp lý:** Hỗ trợ Upload thẻ HDV, đánh dấu ngày hết hạn visa/thẻ. Khi sắp hết hạn, hệ thống bật cảnh báo để phòng điều hành không book nhầm người.
- **Tính năng Đánh giá (Rating & Reviews):** Sau mỗi chuyến đi, phòng CSKH lấy ý kiến khách và chấm điểm (Từ 1-5 sao) và ghi Note trực tiếp vào Profile của HDV. Nếu HDV nào bị đánh giá 1 sao (thái độ kém), hồ sơ sẽ hiển thị cảnh báo đỏ và công ty có thể cấm (Blacklist) không thuê người này ở các tour Châu Âu đắt tiền nữa.

### 2. Module Đào tạo và Cẩm nang Nghiệp vụ (Manual & SOP)
- Thông thường, các file nghiệp vụ của công ty (Ví dụ: Cách làm visa Nhật Bản, Danh sách các Đại sứ quán, Cấu trúc hoa hồng sale) được lưu rải rác trên Google Drive. 
- Tính năng **Manual** hoạt động như một bách khoa toàn thư bảo mật của riêng công ty (Company Wiki). Mọi công thức tính giá, chính sách hoa hồng đều hiển thị tại đây. 
- Khi một Sales mới vào công ty, họ chỉ cần mở tab Manual thay vì phải đi hỏi đồng nghiệp cũ, tiết kiệm hàng trăm giờ đào tạo (Onboarding).

### 3. Module Dashboard & Hệ thống Phân quyền (System & Auth)

#### 3.1 Bức tranh Toàn cảnh Quản trị (Dashboard & Performance)
CEO hay Giám đốc kinh doanh không cần hỏi "Báo cáo doanh thu tháng này thế nào?". Họ mở điện thoại lên là thấy:
- Hệ thống báo cáo phân tách cực sâu bằng biểu đồ cột (Bar Chart), biểu đồ tròn (Pie Chart), tích hợp tính năng lọc theo Ngày, Tuần, Tháng, Quý, và thao tác Lọc tùy chỉnh linh hoạt.
- Tự động vinh danh (Top Performer) những nhân viên có số lượng booking cao nhất hoặc tỷ lệ chốt Sale cao nhất. Tạo động lực cho toàn đội.

#### 3.2 Phân quyền Chặt chẽ (Role-Based Access Control)
Phần mềm du lịch chứa dữ liệu rất nhạy cảm (thông tin passport khách, lợi nhuận công ty). CRM này quản trị bằng cơ chế Role-Base cực chắc chắn:
- **Sales:** Chỉ được nhìn thấy Lead của mình, không xem được Lead của người khác, không được nhìn thấy "Giá vốn" (Costing) thực sự của chuyến đi.
- **Operator (Điều hành):** Được xem giá vốn, được phép điều phối số lượng chỗ (Inventory).
- **Accountant (Kế toán):** Được phép khóa báo cáo Tour, chỉnh sửa giá trị dòng tiền thực tế.
- **Admin (Giám đốc):** Quyền lực tối cao, nhìn thấy mọi bảng biểu và dashboard tổng quan. Có quyền xóa dữ liệu và sao lưu.

### Tổng Kết Giải Pháp
FIT Tour CRM không đơn thuần là một website nhập dữ liệu. Đó là một **"Hệ điều hành Doanh nghiệp Lữ hành" (Travel Agency Operating System)**. 
Nó biến một tổ chức phụ thuộc vào trí nhớ con người và file Excel thành một cỗ máy vận hành bằng Data - mọi thứ được đồng bộ, rành mạch từng con số, đảm bảo mỗi một vị khách đi tour đều được chăm sóc, và mỗi một đồng chi phí đều được kiểm soát.
