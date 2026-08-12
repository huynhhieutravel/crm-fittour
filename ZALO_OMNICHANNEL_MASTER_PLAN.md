# KẾ HOẠCH THỰC THI TỔNG THỂ
**Hệ Sinh Thái Zalo Omnichannel & CRM FIT TOUR**

Mục tiêu của hệ thống là biến **Zalo OA + Messenger + FIT TOUR CRM** thành một hệ thống giao tiếp thống nhất:

**Khách tìm đến → Tư vấn → Báo giá → Booking → Thanh toán → Chăm sóc → Khách quay lại**

---

## PHẦN 1: TẦM NHÌN & ĐỊNH VỊ

### 1.1. Zalo OA
Zalo OA là **cửa giao tiếp chính với khách hàng trên Zalo**.
Dùng để:
* Khách tìm đến FIT TOUR.
* Khách hỏi Tour.
* Sales tư vấn.
* Gửi thông tin cần thiết.
* Gửi ZBS Template Message.
* Content và Marketing OA.

### 1.2. Messenger
Messenger là **cửa tiếp nhận khách từ Facebook**.
Khách từ Facebook có thể tiếp tục được Sales tư vấn trên Messenger và dữ liệu được đưa về CRM.

### 1.3. FIT TOUR CRM
**CRM là trung tâm làm việc của Sales.**
Sales nhìn thấy:
* Khách hàng.
* Nguồn khách.
* Lịch sử trao đổi.
* Tour đang quan tâm.
* Báo giá.
* Booking.
* Thanh toán.
* Sales phụ trách.
* Trạng thái khách.

Mục tiêu:
> **Sales không phải mở nhiều hệ thống để quản lý một khách hàng.**

---

## PHẦN 2: HỆ THỐNG CHAT OMNICHANNEL

### 2.1. Khách nhắn ở đâu → CRM nhận ở đó

```text
                 KHÁCH HÀNG
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       ZALO OA     MESSENGER    WEBSITE
          │           │           │
          └───────────┼───────────┘
                      ↓
                FIT TOUR CRM
                      ↓
                    SALES
                      ↓
               TƯ VẤN / BÁO GIÁ
                      ↓
                   BOOKING
```

Sales không cần quan tâm khách đến từ kênh nào. CRM cho Sales biết:
> Nguyễn Văn A | Nguồn: Zalo | Quan tâm: Bhutan 7N6Đ | Sales: Minh
Hoặc:
> Trần Văn B | Nguồn: Messenger | Quan tâm: Nepal 9N8Đ | Sales: Lan

---

## PHẦN 3: QUY TẮC CHAT

### 3.1. Zalo OA
Trong khung tương tác: **Khách tương tác → Sales tư vấn.**
Zalo hiện áp dụng cơ chế Tin Tư vấn với **08 tin miễn phí trong 48 giờ kể từ lần tương tác của khách**; khi khách có tương tác mới, hạn mức được thiết lập lại.
Ngoài khung 48 giờ, Gói Tăng trưởng của FIT TOUR có **500 tin Tư vấn ngoài 48h/tháng**, sau đó **55đ/tin**.

**Ý nghĩa vận hành:**
- **Khách đang chủ động trao đổi → Sales cứ tư vấn.**
- **Khách im lặng → không cần chủ động nhắn liên tục.**
- **Khách quay lại nhắn → tiếp tục xử lý theo khung tương tác mới.**

### 3.2. Messenger
Khách từ Facebook → Messenger → Sales tư vấn.
CRM cần quản lý được hội thoại Messenger tương tự như Zalo nhưng vẫn giữ được **nguồn và lịch sử của từng kênh**. Khi khách chuyển từ Messenger sang Zalo, CRM cần hỗ trợ xác định và gộp đúng khách hàng (Technical Design sẽ nghiên cứu phương án kỹ thuật sau).

---

## PHẦN 4: ZBS GIAO DỊCH (CORE AUTOMATION)

Đây là phần **automation ưu tiên đầu tiên**. Không gửi tất cả mọi thứ. Chỉ gửi những thông tin **có giá trị và liên quan trực tiếp đến giao dịch**.

### 4.1. Xác nhận Booking
**Thời điểm:** Ngay sau khi Booking được xác nhận.
Gửi: Tên khách, Tour, Mã Booking, Ngày khởi hành, Số khách, Giá trị Booking.
Chi phí: Theo giá ZBS Template hiện hành của Template được sử dụng.

### 4.2. Xác nhận Thanh toán
**Thời điểm:** Ngay sau khi ghi nhận thanh toán.
Gửi: Mã Booking, Số tiền vừa thanh toán, Tổng đã thanh toán, Số còn lại.
Chi phí: Theo giá ZBS Template hiện hành.

### 4.3. Thay đổi giao dịch quan trọng
**Chỉ gửi khi có thay đổi thực sự cần khách biết.** (Ví dụ: Booking thay đổi, Điều chỉnh thanh toán quan trọng).
*Không dùng ZBS cho những thông báo mà **Group Zalo đoàn đã xử lý tốt**.*

---

## PHẦN 5: SAU KHI KHÁCH ĐẶT TOUR

Đây là điểm rất quan trọng của FIT TOUR trong vận hành thực tế.

```text
TƯ VẤN → BÁO GIÁ → CHỐT TOUR → ĐẶT CỌC → BOOKING 
↓
KẾT NỐI ZALO RIÊNG + GROUP ZALO 
↓
KHÁCH ĐANG ĐI TOUR
```

Sau khi khách đặt cọc/Booking:
- **Kết nối Zalo riêng:** Sales xin phép kết nối Zalo cá nhân để tiện hỗ trợ trực tiếp.
- **Group Zalo:** Add khách vào Group của đoàn để trao đổi về (Lịch trình, Visa, Hành lý, Giờ tập trung, HDV...).
> **Group Zalo tiếp tục là kênh điều hành chính của đoàn.** Do đó KHÔNG cần dùng ZBS để gửi hàng loạt thông báo T-7, T-3, T-1, Visa... trong giai đoạn đầu.

---

## PHẦN 6: OA CONTENT & MARKETING

Zalo OA tiếp tục là kênh Marketing. Dùng cho: Điểm đến, Câu chuyện hành trình, Kinh nghiệm du lịch, Tour mới, Campaign, Ưu đãi.
Mục tiêu không phải "Gửi càng nhiều càng tốt" mà là:
> **Duy trì sự hiện diện của FIT TOUR trong Zalo của khách hàng.**

---

## PHẦN 7: KHÁCH HÀNG CŨ & REMARKETING (FUTURE EXPANSION)

Sau khi CRM có đủ dữ liệu, có thể bắt đầu phân nhóm (Đã đi Ladakh, Quan tâm Bhutan, Lead chưa chốt...). Sau đó Marketing mới bắt đầu: **Đúng khách → đúng điểm đến → đúng thời điểm.**
Phần này là **Marketing Automation giai đoạn sau**, KHÔNG phải requirement của Core ZBS ban đầu.

---

## PHẦN 8: KIẾN TRÚC TỔNG THỂ

```text
                       KHÁCH HÀNG
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
          ZALO OA       MESSENGER       WEBSITE
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                       FIT TOUR CRM
                            │
                            ↓
                          SALES
                            │
                  ┌─────────┴─────────┐
                  ↓                   ↓
              TƯ VẤN               BOOKING
                  │                   │
                  ↓                   ↓
              BÁO GIÁ              ĐẶT CỌC
                                      │
                         ┌────────────┴────────────┐
                         ↓                         ↓
                    ZALO RIÊNG                GROUP ZALO
                         │                         │
                       CSKH                    ĐIỀU HÀNH
                         │                         │
                         └────────────┬────────────┘
                                      ↓
                                  KHÁCH ĐI TOUR
```

Song song với luồng CRM là các luồng Automation độc lập:
`BOOKING/PAYMENT → ZBS TEMPLATE → THÔNG BÁO GIAO DỊCH`
`OA CONTENT → CAMPAIGN → KHÁCH HÀNG CŨ → REMARKETING`

---

## PHẦN 9: MASTER EXECUTION ROADMAP

### PHASE 1 – ZBS TEST
**Mục tiêu:** Xác nhận FIT TOUR có thể gửi ZBS thành công.
**Action:** Tạo Template -> Gửi thử -> Kiểm tra khách nhận được -> Kiểm tra chi phí thực tế. *(Chưa cần code CRM)*.

### PHASE 2 – ZBS TRANSACTION
**Mục tiêu:** ERP có thể tự động gửi thông báo giao dịch cốt lõi.
**Ưu tiên:** 1. Booking Confirmation | 2. Payment Confirmation | 3. Thay đổi quan trọng.
ZBS Template Message hỗ trợ gửi qua **SĐT hoặc UID**, sử dụng Template được Zalo kiểm duyệt.

### PHASE 3 – CRM OMNICHANNEL CHAT
**Mục tiêu:** Sales làm việc tập trung trên CRM.
Kết nối **Zalo OA + Messenger → FIT TOUR CRM**. CRM cần thể hiện: Khách là ai, Đến từ đâu, Đang nói chuyện kênh nào, Lịch sử hội thoại, Tour quan tâm.

### PHASE 4 – KẾT NỐI KHÁCH SAU BOOKING
**Mục tiêu:** Chuyển khách từ Lead thành Customer.
**Quy trình:** Chốt Tour → Đặt cọc → Booking → Add Zalo cá nhân → Add Group Zalo điều hành.

### PHASE 5 – OA CONTENT & CAMPAIGN
**Mục tiêu:** Biến OA thành một kênh Marketing thực sự (Content, Tour mới, Ưu đãi mùa vụ).

### PHASE 6 – REMARKETING AUTOMATION
*Chỉ thực hiện khi dữ liệu khách hàng đã đủ tốt.*
Tự động hóa phân nhóm khách, Cross-sell, Reactivation, Lifecycle Marketing.

---

## PHẦN 10: KẾT LUẬN

**Một câu để team Dev hiểu toàn bộ dự án:**
> **Zalo OA và Messenger là cửa vào; FIT TOUR CRM là nơi Sales làm việc; ZBS là công cụ thông báo giao dịch; Zalo riêng và Group Zalo là lớp chăm sóc sau Booking; còn OA Marketing và Remarketing là lớp tăng trưởng khách hàng.**
