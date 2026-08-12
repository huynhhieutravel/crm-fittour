# Kiến trúc & Lộ trình Hệ thống Thông báo Zalo - FIT TOUR CRM

Tài liệu này định nghĩa hệ thống ZBS (Zalo Business Solution) và OA (Official Account) của FIT TOUR. Toàn bộ kiến trúc được thiết kế dựa trên thuật ngữ và chính sách mới nhất của Zalo, phân tách rõ ràng **Tin Giao dịch**, **Tin Hậu mãi** và **Tin Truyền thông OA**.

---

## 1. Tầm nhìn Kiến trúc: CRM Notification Engine

Tuyệt đối **KHÔNG** để các Controller riêng lẻ (Booking, Payment, Visa...) gọi trực tiếp API Zalo. Điều này sẽ gây ra tình trạng mã nguồn phân mảnh và khó quản lý chính sách gửi tin.

Kiến trúc chuẩn sẽ là một hệ thống Event-driven, có kiểm tra **Consent (Sự cho phép)** và **Eligibility (Điều kiện gửi)** trước khi áp dụng Policy:

```text
                    FIT TOUR ERP
                         │
                    Event Engine
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     Booking          Payment            Visa
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                 Notification Engine
                         │
                ┌────────┴────────┐
                ↓                 ↓
           Consent / Eligibility
                ↓                 ↓
           Message Policy      Template
                │                 │
                └────────┬────────┘
                         ↓
                    Zalo Dispatcher
                         │
                ┌────────┴────────┐
                ↓                 ↓
               OA                ZBS
```

### Cơ chế Message Policy & Fallback
- Không hard-code các giới hạn (như 7 ngày hay 2 tin/tháng). Tất cả đều là Policy có thể cấu hình được:
  - `Marketing`: max X / month.
  - `Post-sale`: max X / period.
  - `Transaction`: event-driven (không áp dụng cùng rule marketing).
  - `Urgent`: policy riêng.
- **Luồng Fallback an toàn:**
  - Zalo Dispatcher gửi tin -> Nếu thất bại (Lỗi API, số không dùng Zalo) -> **Retry** -> Nếu vẫn Fail -> Chuyển sang Fallback (SMS/Email).

---

## 2. Thiết kế Database Zalo Ecosystem (Tối ưu theo Giai đoạn)

Dữ liệu Zalo được tách biệt thành các bảng chuyên biệt trên ERP. Tránh tạo quá nhiều bảng ngay từ đầu (Over-engineer).

**PHASE 2 (Làm ngay):**
- `zalo_templates`: Quản lý các mẫu tin ZBS/OA đã duyệt.
- `notification_queue`: Hàng đợi gửi tin (cho phép Retry/Fallback).
- **`zalo_message_logs`**: (Bảng cốt lõi) Lưu lịch sử mọi tin nhắn để audit (`id, customer_id, channel, template_id, recipient, status...`).

**PHASE MỞ RỘNG (Khi có Webhook & Campaign):**
- `zalo_users`: Ánh xạ UID/Số điện thoại với Customer ID (khi làm Webhook).
- `zalo_events`: Cấu hình sự kiện map với template nào.
- `zalo_campaigns`: Quản lý chiến dịch ZBS Hậu mãi.
- `notification_rules`: Chứa các Message Policy phức tạp.

---

## 3. Hệ thống 3 Tầng Kịch Bản (Zalo 3-Tier System)

Hệ thống được chia làm 3 mảng độc lập, bám sát Lifecycle của một khách hàng:
`LEAD → INQUIRY → QUOTED → BOOKED → PAID → PRE_DEPARTURE → TRAVELING → COMPLETED → LOYAL → VIP`

### Tầng 1: ZBS Giao dịch (Transaction)
*Kích hoạt tự động ngay khi có thay đổi trên hệ thống ERP.*
- `BOOKED`: Xác nhận đặt tour (Booking Confirmation).
- `PAID`: Xác nhận thanh toán (Payment Confirmation).
- `PAYMENT_DUE`: Nhắc nợ thanh toán đợt 2/đợt cuối.
- `VISA_APPROVED` / `VISA_DOCUMENT_REQUIRED`: Cập nhật tình trạng Visa.
- `PRE_DEPARTURE`: Nhắc nhở khởi hành (T-7, T-3, T-1 ngày).
- `FLIGHT_CHANGED`: Cảnh báo khẩn cấp (thay đổi chuyến bay, lịch trình).

### Tầng 2: ZBS Hậu mãi (Post-tour & Retention)
*Sử dụng **ZBS Template Hậu mãi** (hoặc Zalo Campaign Tool).*
- `COMPLETED`: Cảm ơn sau chuyến đi (Thank you message).
- Kêu gọi đánh giá dịch vụ (Review).
- Cung cấp link tải Album ảnh chuyến đi.
- `VIP / LOYAL`: Chúc mừng sinh nhật kèm Voucher.
- Cross-sell: Giới thiệu điểm đến mới cho khách hàng cũ.

### Tầng 3: OA Marketing (Broadcast & Campaign)
*Tập trung vào tệp khách hàng đã Follow OA.*
- Dùng **Tin Truyền thông / Broadcast** (Giới hạn theo gói OA, ví dụ Premium là 4 tin/người/tháng).
- Phân phối bài viết content (Ladakh, Bhutan, Nepal...).
- Gửi Flash Sale, Ưu đãi theo mùa.

---

## 4. Master Roadmap (Lộ trình Triển khai)

Lộ trình triển khai bám sát giới hạn của Gói Tăng Trưởng (Đã tích hợp API). 

```text
PHASE 1
ZBS TEST (ĐANG LÀM - Manual trên Zalo OA)
│
├── Tạo Template
├── Gửi thử
└── Xác nhận khách nhận được
        ↓
PHASE 2
ZALO OPENAPI + ZBS TRANSACTION
│
├── Kết nối OA ↔ ERP
├── Gửi ZBS từ ERP (Code API)
└── Test Booking Confirmation Template
        ↓
PHASE 3
NOTIFICATION ENGINE (ERP)
│
├── Event Engine
├── Policy
├── Eligibility (Điều kiện cho phép gửi)
├── Queue
├── Retry
├── Fallback
└── Message Logs
        ↓
PHASE 4
CSKH & HẬU MÃI (Post-tour)
│
├── Cảm ơn sau tour
├── Khảo sát (Review)
├── Gửi Album
├── Chúc mừng Sinh nhật
└── Khách hàng Loyalty
        ↓
PHASE 5
OA MARKETING (Manual Campaign - Con người vận hành)
│
├── Broadcast (Đến người Follow)
├── Dùng Zalo Campaign Tool
└── Sales/Marketing chủ động gửi chiến dịch
        ↓
PHASE 6
MARKETING AUTOMATION (ERP Tự động chạy)
│
├── Lifecycle Trigger (vd: Khách Lệ Giang sau 30 ngày)
├── Cross-sell
├── Reactivation
├── AI Segmentation
└── Personalized Campaign
```

**Song song từ Phase 2 trở đi (Thiết kế dần):**
Tích hợp Webhook để nhận tin nhắn từ Zalo OA đẩy thẳng vào CRM Inbox cho Sales xử lý.

```text
ZALO OPENAPI
     │
     └── Chat + Webhook
             ↓
       FIT TOUR CRM Inbox
             ↓
            Sales
```
