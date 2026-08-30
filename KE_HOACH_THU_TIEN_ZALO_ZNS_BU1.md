# ĐỀ ÁN QUY TRÌNH TỰ ĐỘNG HÓA THU TIỀN & XÁC NHẬN THANH TOÁN QUA ZALO ZNS (PILOT BU1)

> **Kính gửi:** Ban Giám Đốc & Lãnh Đạo FIT TOUR  
> **Đơn vị đề xuất:** Bộ Phận Công Nghệ & Vận Hành CRM  
> **Phạm vi áp dụng:** Thử nghiệm giai đoạn 1 (Pilot) dành riêng cho **BU1**  
> **Mục tiêu:** Tự động hóa quy trình Yêu cầu thu tiền $\rightarrow$ Đối soát Kế toán $\rightarrow$ Xác nhận thanh toán qua Zalo Brandname & Email nội bộ.

---

## I. BỐI CẢNH & MỤC TIÊU ĐỀ ÁN

### 1. Thực trạng hiện tại:
* **Giao tiếp rời rạc:** Sales nhắc khách chuyển tiền qua Zalo cá nhân, gửi số tài khoản dạng text hoặc ảnh rời, dễ bị trôi tin hoặc khách gõ sai nội dung chuyển khoản.
* **Mất thời gian đối soát:** Khi khách chuyển tiền xong, Sales phải chụp màn hình biên lai gửi Kế toán $\rightarrow$ Kế toán mở App ngân hàng kiểm tra $\rightarrow$ Báo miệng lại cho Sales $\rightarrow$ Sales nhắn lại khách. Quy trình này mất từ 15 - 45 phút (hoặc qua ngày hôm sau nếu ngoài giờ).
* **Nhập liệu lặp lại:** Kế toán phải tự tạo lại Phiếu thu từ đầu trên CRM sau khi đã nhận tiền.

### 2. Mục tiêu giải pháp mới:
1. **Nâng tầm trải nghiệm khách hàng (WOW Effect):** Khách nhận được thông báo Yêu cầu thanh toán và Xác nhận đã nhận tiền chính thức từ **Zalo OA tích xanh của FIT TOUR** (ZNS) kèm STK ACB và nút bấm chuyển khoản tự động.
2. **Khép kín quy trình Sales & Kế toán:** Sales tạo yêu cầu thu $\rightarrow$ Kế toán thấy ngay phiếu chờ và chỉ cần **1-Click Duyệt** $\rightarrow$ Hệ thống tự động phát hành Phiếu Thu chuẩn Mẫu TT-01.
3. **Thông báo đa kênh tức thời:** Khách nhận Zalo ZNS, Kế toán & Sales nhận Email và Chuông In-App nội bộ theo thời gian thực.
4. **An toàn tuyệt đối (Pilot BU1):** Chỉ kích hoạt thử nghiệm cho BU1, các BU khác (BU2, BU3, BU4, BU5...) giữ nguyên 100% giao diện và quy trình cũ.

---

## II. SƠ ĐỒ HÀNH TRÌNH TỔNG THỂ (WORKFLOW DIAGRAM)

```
                     ┌──────────────────────────────────────────────┐
                     │          1. SALES PHỤ TRÁCH (BU1)            │
                     │  Mở Booking -> Bấm [Tạo Yêu Cầu Thu Tiền]    │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          HỆ THỐNG CRM XỬ LÝ (TỰ ĐỘNG)        │
                     │  - Tạo Phiếu Thu trạng thái 'Chờ duyệt'      │
                     │  - Chưa cộng tiền vào Doanh thu Tour         │
                     └──────────────┬────────────────┬──────────────┘
                                    │                │
            ┌───────────────────────┘                └────────────────────────┐
            ▼                                                                 ▼
┌───────────────────────────────────────┐                 ┌───────────────────────────────────────┐
│           KHÁCH HÀNG NHẬN             │                 │           KẾ TOÁN NHẬN                │
│ 📱 Tin nhắn Zalo ZNS Mẫu 625192       │                 │ ✉️ Email thông báo yêu cầu thu tiền  │
│ (Chi tiết tiền + STK ACB + Nút CK)   │                 │ 🔔 Chuông thông báo đỏ trên CRM       │
└───────────────────┬───────────────────┘                 └───────────────────┬───────────────────┘
                    │                                                         │
                    ▼ (Khách chuyển khoản thành công)                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   2. KẾ TOÁN FIT TOUR                                           │
│  - Truy cập https://erp.fittour.vn/vouchers -> Mở tab [⚡ Chờ Kế Toán Duyệt (Pending)]          │
│  - Đối chiếu tiền về tài khoản ACB -> Bấm nút [ ✅ Duyệt Thu Tiền ]                            │
└───────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   HỆ THỐNG CRM KÍCH HOẠT                                        │
│  1. Cập nhật Phiếu thu thành 'Đã duyệt' & Cộng tiền vào 'Đã thanh toán' của Booking             │
│  2. Tự động gửi Zalo ZNS Mẫu 625193 (Xác nhận đã nhận tiền) cho Khách hàng                      │
│  3. Tự động gửi Email xác nhận + Chuông thông báo cho Sales phụ trách                           │
│  4. Mở khóa Phiếu Thu chính thức (Mẫu TT-01 có dấu đỏ "ĐÃ THU TIỀN")                            │
└───────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │           3. SALES NHẬN KẾT QUẢ              │
                     │  - Nhận Email báo tiền đã vào an toàn        │
                     │  - Bấm [Xem Phiếu Thu] (Mẫu TT-01)           │
                     │  - Copy ảnh chất lượng cao gửi Zalo Khách    │
                     └──────────────────────────────────────────────┘
```

---

## III. CHI TIẾT CÁC BƯỚC TRIỂN KHAI

### BƯỚC 1: Phía Sales — Tạo Yêu Cầu Thu Tiền & Gửi Zalo (Phiếu Thu Nháp)

1. **Vị trí thao tác:**
   - Trong Slider chi tiết Booking (`BookingProfileSlider`) hoặc Modal Quản lý Phiếu thu của Tour BU1.
   - Nút bấm nổi bật: **`[ 📱 Tạo Yêu Cầu Thu Tiền (Zalo) ]`**.

2. **Giao diện Form thông minh (Auto-Populate & Editable):**
   - Hệ thống tự động bốc tách toàn bộ thông tin từ Booking:
     - *Tên khách hàng / Người nộp:* Mặc định lấy tên khách (Cho phép sửa nếu người nộp là người thân/công ty).
     - *Số điện thoại nhận Zalo:* Mặc định lấy SĐT khách (Cho phép sửa số nhận Zalo).
     - *Tên Tour:* Tự điền tên tour đang bán.
     - *Tổng giá trị booking (`total_price`):* Tự điền.
     - *Đã thanh toán trước đó (`paid_amount`):* Tự điền.
     - *Số tiền cần thu đợt này (`amount`):* Tự gợi ý số tiền còn nợ (`total_price - paid`), Sales có thể gõ lại số tiền cọc bất kỳ (VD: `15,000,000` VNĐ).
     - *Nội dung thu (`title`):* Gợi ý sẵn (VD: `Thanh toán cọc đợt 1`).
   - Có **Live Preview** mô phỏng tin nhắn Zalo gửi đến khách trước khi nhấn gửi.

3. **Kết quả sau khi gửi:**
   - Phiếu thu được ghi nhận vào CSDL với trạng thái: **`⏳ Chờ Kế toán duyệt`**.
   - Chưa cộng vào tiền thực thu của Tour để đảm bảo an toàn tài chính.
   - Khách nhận ngay tin nhắn Zalo ZNS Yêu cầu thanh toán.

---

### BƯỚC 2: Phía Kế Toán — Nhận Biết & Duyệt Nhanh 1-Click

1. **Giao diện tập trung tại `https://erp.fittour.vn/vouchers`:**
   - Bổ sung thanh Tab phân loại nhanh:
     - `Tất cả`
     - **`⚡ Chờ Kế Toán Duyệt`** (Kèm **Badge đỏ** đếm số lượng, VD: `Chờ duyệt [3]`).
     - `✅ Đã duyệt`
     - `❌ Đã hủy`
   - Kế toán chỉ cần bấm vào tab `Chờ duyệt` là gom toàn bộ danh sách các yêu cầu mà Sales BU1 vừa đẩy lên.

2. **Thao tác Duyệt:**
   - Mỗi dòng phiếu chờ có nút bấm: **`[ ✅ Duyệt Thu Tiền ]`** và nút **`[ ❌ Từ Chối / Hủy ]`**.
   - Kế toán check Bank thấy tiền về $\rightarrow$ Bấm **`[ ✅ Duyệt Thu Tiền ]`**.

3. **Hệ thống tự động thực thi ngay lập tức:**
   - Phiếu chuyển sang trạng thái `Đã duyệt`.
   - Tiền được cộng chính thức vào mục `Đã thanh toán` của Booking.
   - Tự động kích hoạt gửi Zalo ZNS Mẫu 625193 cho khách và gửi Email xác nhận cho Sales.

---

### BƯỚC 3: Phía Sales — Nhận Thông Báo & Xuất Phiếu Thu Mẫu TT-01

1. **Nhận kết quả:**
   - Sales nhận Email thông báo Kế toán đã duyệt thành công.
   - Trong trang Booking, nhãn phiếu thu đổi từ màu cam sang màu xanh **`✅ Đã duyệt`**.

2. **Xem & Xuất Phiếu Thu Mẫu TT-01:**
   - Sales bấm nút: **`[ 👁️ Xem Phiếu Thu ]`**.
   - Màn hình hiển thị Popup **Phiếu Thu chuẩn Mẫu TT-01** (theo Thông tư 200/2014/TT-BTC):
     - Đầy đủ thông tin: Họ tên người nộp, SĐT, Số tiền (bằng số & bằng chữ), Mã tham chiếu, Chữ ký người lập phiếu và ngày giờ chuẩn xác.
     - Đóng dấu đỏ **"ĐÃ THU TIỀN"** sắc nét.
     - Tích hợp công nghệ chụp ảnh HD (`html2canvas`): Sales chỉ cần **Chuột phải $\rightarrow$ Copy Image** là có thể dán gửi thẳng vào Zalo Khách hàng.
     - Có nút **In / Lưu PDF** để lưu trữ hồ sơ.
   - *Phân quyền:* Sales chỉ có quyền **Xem / In / Tải ảnh**, tuyệt đối không thể sửa hay xóa phiếu thu sau khi Kế toán đã duyệt.

---

## IV. CHI TIẾT CÁC MẪU THÔNG BÁO (ZALO ZNS & EMAIL)

### 1. Các Mẫu Zalo ZNS (Đã được Zalo duyệt trên OA FIT TOUR):

#### 📱 Mẫu 1: Yêu Cầu Chuyển Khoản (ID: `625192`)
* **Thời điểm gửi:** Khi Sales bấm gửi yêu cầu thu tiền.
* **Nội dung hiển thị trên Zalo khách:**
  ```
  FIT TOUR - Yêu cầu thanh toán
  FIT TOUR trân trọng thông báo đến Quý khách khoản thanh toán dịch vụ như sau:
  - Quý khách: <customer_name>
  - Mã hợp đồng: <booking_code>
  - Tên tour: <tour_name>
  - Tổng tiền: <total_price> đ
  - Đã thanh toán: <paid_amount> đ
  - Cần thanh toán: <amount> đ

  [ Khung thông tin Ngân hàng TMCP Á Châu (ACB) - STK: 8888678968 ]
  [ Nút bấm: Chuyển khoản ngay ]
  ```

#### 📱 Mẫu 2: Xác Nhận Đã Nhận Tiền (ID: `625193`)
* **Thời điểm gửi:** Khi Kế toán bấm nút Duyệt thu tiền trên CRM.
* **Nội dung hiển thị trên Zalo khách:**
  ```
  FIT TOUR - Xác nhận thanh toán dịch vụ
  Xin chào <customer_name>, FIT TOUR trân trọng thông báo đã nhận được 
  khoản thanh toán dịch vụ Tour du lịch của Quý khách như sau:
  - Quý khách: <customer_name>
  - Mã hợp đồng: <booking_code>
  - Tên tour: <tour_name>
  - Tổng tiền: <total_price> đ
  - Đã thanh toán: <paid_amount> đ

  [ Nút bấm: Quan tâm OA ]
  ```

---

### 2. Các Mẫu Email Thông Báo Nội Bộ:

#### ✉️ Email 1: Gửi Team Kế Toán (Khi Sales tạo yêu cầu)
* **Người nhận:** `ketoan@fittour.com.vn` (hoặc role `accountant`)
* **Tiêu đề:** `[YÊU CẦU THU TIỀN] Sales {sales_name} tạo yêu cầu thu {amount}đ - Booking {booking_code} (BU1)`
* **Nội dung:** Thông tin chi tiết khách, số tiền cần thu, nội dung CK và nút bấm dẫn thẳng vào trang duyệt phiếu trên CRM.

#### ✉️ Email 2: Gửi Sales Phụ Trách (Khi Kế toán duyệt)
* **Người nhận:** Email của Sales phụ trách Booking.
* **Tiêu đề:** `✅ [ĐÃ DUYỆT THU TIỀN] Phiếu thu {voucher_code} ({amount}đ) cho khách {customer_name} đã xác nhận!`
* **Nội dung:** Xác nhận tiền đã về tài khoản, thông tin Kế toán duyệt, cập nhật tiến độ thanh toán tour và link mở Phiếu thu Mẫu TT-01.

---

## V. CƠ CHẾ AN TOÀN & CÔ LẬP PILOT (BU1 ONLY)

Để đảm bảo quá trình thử nghiệm diễn ra êm đẹp và không ảnh hưởng đến các bộ phận khác:

1. **Bộ lọc BU1 (Feature Flag):**
   ```javascript
   const isBU1 = (booking?.bu_group === 'BU1' || tour?.bu_group === 'BU1');
   ```
2. **Các BU khác (BU2, BU3, BU4, BU5...):**
   - 100% giữ nguyên giao diện và luồng tạo phiếu thu cũ.
   - Không hiển thị nút Zalo để tránh thao tác nhầm lẫn.
3. **An toàn số liệu:**
   - Chỉ phiếu có `status = 'Đã duyệt'` mới được tính vào báo cáo doanh thu.
   - Kiểm soát chặt chẽ: Không cho phép tạo yêu cầu thu vượt quá số tiền khách còn nợ.
   - Cơ chế khóa đồng thời (Concurrency Lock) tránh trường hợp 2 kế toán cùng bấm duyệt 1 phiếu.

---

## VI. KẾT LUẬN & KIẾN NGHỊ

Đề án này giải quyết triệt để bài toán đồng bộ thông tin giữa **Khách hàng ⮂ Sales ⮂ Kế toán**, mang lại hình ảnh chuyên nghiệp đẳng cấp cho thương hiệu FIT TOUR, đồng thời tiết kiệm hàng chục giờ làm việc thủ công mỗi tuần cho đội ngũ nhân sự.

Kính trình Ban Giám Đốc xem xét và phê duyệt chủ trương triển khai thử nghiệm trên **BU1**.

---
*Tài liệu được soạn thảo và lưu trữ tại hệ thống CRM FIT TOUR.*
