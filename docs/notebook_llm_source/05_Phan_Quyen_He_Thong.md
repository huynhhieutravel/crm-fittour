# 🛡️ 05. TÀI LIỆU PHÂN QUYỀN HỆ THỐNG FIT TOUR CRM

Tài liệu này quy định tiêu chuẩn phân quyền cho toàn bộ nhân sự theo sơ đồ tổ chức **Nhiều Đội Nhóm (Multi-Team)**.

Hệ thống được thiết kế theo tư duy **3 Tầng Bảo Mật**:
- 🌍 **Toàn cục (View All):** Dành cho Quản trị viên, Kế toán, các vị trí cần cái nhìn tổng thể.
- 👥 **Đội nhóm (View Team):** Dành cho Trưởng phòng/Trưởng nhóm. Chỉ xem được Data do lính của mình phụ trách.
- 👤 **Cá nhân (View Own):** Dành cho Nhân viên. Chỉ thấy Khách hàng / Booking / Data của chính mình.

---

## 🏗️ 1. KHỐI MARKETING & SALES

Phụ trách đem Khách hàng về và chốt Sale. Đặc quyền của khối này là tập trung vào **Khách hàng** và **Booking**.

| Module | Hành động (Action) | Trưởng Phòng (`marketing_lead`, `sales_lead`) | Nhân viên (`marketing`, `sales`) |
| :--- | :--- | :---: | :---: |
| **Leads** | Xem toàn bộ (`view_all`) | MKT Lead có, Sale Lead có | [ ] |
| | Xem của Cá nhân/Team (`view_team`/`view_own`) | [x] (Team) | [x] (Own)|
| | Tạo mới / Sửa (`create`, `edit`) | [x] | [x] |
| | Xóa (`delete`) | MKT Lead có | [ ] |
| | Phân Lead / Xuất file (`assign`, `export`) | [x] | [ ] |
| **Messenger**| Trực Fanpage (`view`, `reply`) | [x] | [x] |
| **Bookings**| Xem của Team/Cá nhân (`view_team`/`own`)| [x] (Team) | [x] (Own)|
| | Tạo mới / Sửa (`create`, `edit_own`) | [x] | [x] |
| | Điều chỉnh Bookings toàn Team (`edit_team`)| [x] | [ ] |
| | Chuyển Tour, Xuất file (`transfer`, `export`) | [x] | [ ] |
| | Duyệt Booking (`approve`) | Sale Lead có | [ ] |
| **Khách hàng**| Xem toàn bộ (`view_all`) / Xem SĐT Đầy đủ | MKT Lead có | [ ] |
| | Quản lý Team/Cá nhân (`view_team`/`own`)| [x] (Team) | [x] (Own)|
| | Tạo mới / Cập nhật (`create`, `edit`) | Sale Lead có | Sale có |

---

## ⚙️ 2. KHỐI ĐIỀU HÀNH & NHÀ CUNG CẤP

Phụ trách tổ chức Tour tuyến, điều phối vận hành thực tế.

| Module | Hành động (Action) | Trưởng Điều Hành (`operations_lead`) | Nhân viên Điều Hành (`operations`) |
| :--- | :--- | :---: | :---: |
| **Sản phẩm Tour** | Xem / Tạo / Sửa | [x] | [x] |
| | Xóa (`delete`) | [x] | [ ] |
| **Lịch Khởi Hành**| Thao tác All Lịch (`view_all`, `create`, `edit`)| [x] | [x] |
| | Xuất file / Xem Full thông tin NCC / Copy | [x] | [x] |
| | Xóa (`delete`) | [x] | [ ] |
| **Hướng Dẫn Viên** | Quản lý HDV (`view, create, edit`) | [x] | [x] |
| | Xóa (`delete`) | [x] | [ ] |
| **Toàn bộ NCC*** | Xem / Liên hệ / Thêm NCC / Sửa NCC | [x] | [x] |
| | Xóa (`delete`) | [x] | [ ] |
| **Dự toán (Costings)**| Kiểm soát Đầu vào/Đầu ra chi tiết | [x] | [x] |

*(NCC bao gồm: Khách sạn, Nhà hàng, Phương tiện, Vé, Hãng bay, Landtour, Bảo hiểm).*

---

## 🏢 3. KHỐI TOUR ĐOÀN (MICE & B2B)

Phụ trách các hợp đồng Doanh nghiệp quy mô lớn. 

| Module | Hành động (Action) | Trưởng Nhóm MICE (`group_manager`) | Nhân viên MICE (`group_staff`) |
| :--- | :--- | :---: | :---: |
| **Doanh Nghiệp (B2B)** | Xem All / Tạo / Sửa / Xóa (`Full`) | [x] | [ ] |
| | Xem Cá nhân & Tạo, Sửa (`view_own`...)| [ ] | [x] |
| **Trưởng đoàn (Đại diện)**| Xem All / Tạo / Sửa / Xóa (`Full`) | [x] | [ ] |
| | Xem Cá nhân & Tạo, Sửa (`view_own`...)| [ ] | [x] |
| **Dự án Tour Đoàn** | Xem All / Tạo / Sửa / Xóa (`Full`) | [x] | [ ] |
| | Xem Cá nhân & Tạo, Sửa (`view_own`...)| [ ] | [x] |
| **Lịch Khởi Hành**| Can thiệp Toàn bộ Hệ Thống Lịch | [x] | [ ] |
| | Chỉ quản lý Lịch do mình chạy | [ ] | [x] |
| **Bookings & KH** | Can thiệp Toàn bộ | [x] | [ ] |
| | Ghi nhận Booking dự án do mình chạy | [ ] | [x] |

---

## 💵 4. KHỐI TÀI CHÍNH KẾ TOÁN

Chịu trách nhiệm chốt công nợ, duyệt thu/chi dòng tiền.

| Module | Hành động (Action) | Kế Toán (`accountant`) | Quản lý / Các User Khác |
| :--- | :--- | :---: | :---: |
| **Phiếu Thu/Chi** | Xem Toàn bộ Dòng Tiền (`view_all`) | [x] | Chỉ Quản Lý |
| | Xem/Tạo Phiếu cho Cá nhân (`own`) | [x] | [x] (Tất cả N.Viên đều có) |
| | Duyệt Phiếu Thu (`approve`) | [x] | Sale Lead |
| | Duyệt Phiếu Chi / Đặt cọc (`approve`) | [x] | Ops Lead |
| | Hủy Phiếu (`cancel`) / Xóa (`delete`) | [x] (Full) | Quản lý có quyền Hủy |
| **Kiểm toán khác** | Xem Toàn bộ Bookings, Customers | [x] | Tùy role |
| | Xem Costings toàn hệ thống | [x] | Ops Lead |

---

## 👑 5. QUY TRÌNH CẤP QUYỀN TEAM MANAGER (DÀNH CHO ADMIN)

Khi có nhân sự lên chức Leader, Admin phải làm theo Quy đinh 2 Buớc Nhất Quán sau:

**🔥 BƯỚC 1: Xếp người vào Team (Thiết lập cấu trúc)**
1. Mở màn hình **Quản lý Team**.
2. Chọn team tương ứng (Ví dụ: `Sale`) -> Bấm `THÊM THÀNH VIÊN` -> Thêm lính mới và Leader vào.
3. Bấm nút ⭐️ (Hành động phong tước) bên cạnh tên Leader. Máy chủ sẽ ghi nhận đây là Quản lý Team.

**🔥 BƯỚC 2: Mở đặc quyền Quản trị (Tại màn hình Phân quyền chức vụ)**
- Vào màn hình **Phân quyền chức vụ** -> Chọn Role của Leader (VD: `sales_lead`).
- Kéo xuống bảng Hệ Thống, Tích vào 2 ô MỚI: 
  ✅ `Quản lý nhân viên trong Team` (Cho phép thêm/xóa/gán sao lính)
  ✅ `Đổi mật khẩu NV trong Team` (Cho phép bấm Đổi Pass cấp dưới)
- Kéo tới Modules nghiệp vụ (Bookings, Leads, Customers):
  ✅ Bỏ tích dòng `Xem toàn bộ (View All)`.
  ✅ Thay bằng dòng **`Xem/Sửa dữ liệu Của Team (Team Scope)`**.

*(Việc này đảm bảo 1 Leader Sale sẽ không bao giờ xem lén được khách của Team MICE hay Marketing, mà chỉ truy vết được nhân viên dưới trướng của chính họ!).*
