# MASTER PLAN: KIẾN TRÚC OMNICHANNEL CRM & HỆ SINH THÁI ZALO (FIT TOUR)

Tài liệu này là bản quy hoạch tổng thể (Master Plan) đúc kết toàn bộ các quyết định kiến trúc, giải pháp kỹ thuật và lộ trình triển khai cho hệ thống CRM Omnichannel (Facebook Messenger & Zalo OA) của FIT TOUR.

> [!IMPORTANT]
> **Triết lý cốt lõi:**
> - KHÔNG dùng Số điện thoại làm điều kiện bắt buộc để định danh khách ở giai đoạn đầu.
> - Hộp thoại (Inbox) lấy Khách Hàng làm trung tâm, tách biệt lịch sử theo kênh.
> - Xử lý Webhook Zalo qua Hàng đợi (Queue) để chống rớt tin nhắn.

---

## 1. GIẢI QUYẾT BÀI TOÁN ĐỊNH DANH ĐA KÊNH (IDENTITY RESOLUTION)

Sai lầm lớn nhất của các CRM hiện tại là ép buộc gộp khách hàng bằng Số điện thoại ngay từ đầu, dẫn đến việc mất Lead hoặc làm gãy trải nghiệm chat. FIT TOUR sẽ xử lý theo kiến trúc **Tách Contact Point & Auto-Merge**.

### 1.1. Mô hình Dữ liệu (Data Model)
- **Contact Point (Điểm chạm):** Bất kỳ ai nhắn tin vào hệ thống đều sinh ra một Contact Point độc lập (vd: `PSID: 123` trên FB, hoặc `Zalo UID: 456` trên Zalo).
- **Lead Profile (Hồ sơ Khách hàng):** Một thực thể duy nhất chứa thông tin xuyên suốt (Tên, SĐT, Lịch sử tour). Một Lead Profile có thể "sở hữu" nhiều Contact Point.

### 1.2. Chiến thuật Gộp Khách hàng (Merge Strategies)

**A. Gộp tự động (Auto-Merge) qua Deep-link Payload**
- Dùng trong kịch bản Sales đang chat FB và muốn đưa khách qua Zalo.
- Sales gửi deep-link: `zalo.me/[OA_ID]?ref=psid_123`.
- Khách bấm link mở Zalo, Zalo Webhook bắn event kèm `ref=psid_123`.
- CRM tự động hiểu Zalo UID mới này chính là khách FB hiện tại -> **Gộp tự động**.

**B. Gộp tự động (Auto-Merge) qua Proactive ZBS Invitation**
- Dùng trong kịch bản FIT TOUR có SĐT (từ form Website) nhưng chưa có Zalo Chat.
- Sales bấm nút **"Mời Chat Zalo"** trên CRM.
- CRM gửi 1 tin ZBS Template (chủ động) tới SĐT của khách: *"Chào bạn, chuyên viên X sẵn sàng hỗ trợ. [Nút CTA: Chat Ngay]"*.
- Nút CTA chứa link `zalo.me/[OA_ID]?ref=lead_789`.
- Khách bấm CTA -> Mở Zalo OA -> CRM lấy được UID gắn vào `lead_789` -> Mở khóa 7 ngày chat miễn phí.

**C. Gộp thủ công (Manual Merge)**
- Khách tự lên mạng tìm Zalo FIT TOUR nhắn tin (không qua link).
- Sales nhận ra khách quen qua văn phong/báo giá.
- Sales dùng tính năng **[ 🔗 Liên kết với Lead khác ]** trên UI để ghép Zalo UID này vào hồ sơ FB có sẵn.

---

## 2. THIẾT KẾ GIAO DIỆN CRM INBOX (UI/UX)

Để giải quyết bài toán "Sales bị rối khi trộn chung tin nhắn FB và Zalo vào 1 luồng" hoặc "Sales mệt mỏi khi phải mở 2 Tab lớn tách biệt":

### 2.1. Channel Toggle UI (Giao diện 1 Khách hàng - Đa Kênh Chat)
- **Cột Trái (Danh sách Khách hàng):** Liệt kê `Lead Profile`. Hiển thị icon trạng thái kênh đang kết nối (🔵 FB, 🟢 Zalo).
- **Cột Phải (Khung Chat chính):** 
  - Header có Nút chuyển kênh: `[ 🔵 Messenger ]`  |  `[ 🟢 Zalo OA ]`.
  - Bấm nút nào, khung chat đổi sang lịch sử và Input của riêng kênh đó.
  - Không bị trộn lẫn dòng thời gian (Timeline).
- **Sidebar Thông tin:** Hiển thị thống nhất toàn bộ Báo giá, Lịch sử đi tour, Note của Sale.

### 2.2. Chính sách Hiển thị (Data Privacy)
- **Global View (Toàn cục):** Sales mở khung chat sẽ thấy TOÀN BỘ lịch sử Timeline (ZBS đã gửi, lịch sử đi tour, tin nhắn từ Sales trước). Phục vụ triết lý **"Tư vấn 1-chạm"**, Sales hiểu ngay ngữ cảnh không cần hỏi lại khách.

---

## 3. KIẾN TRÚC HẠ TẦNG & BACKEND (INFRASTRUCTURE)

Hạ tầng xử lý Zalo Webhook và OpenAPI phải đạt chuẩn Enterprise để không rớt 1 tin nhắn nào.

### 3.1. Luồng xử lý Webhook (Zero Data Loss)
- **Queue + Worker + Socket.io:**
  1. Zalo bắn Webhook -> ERP nhận và trả `200 OK` ngay lập tức (dưới 10ms) để tránh Zalo phạt timeout.
  2. ERP đẩy Payload vào **Redis Queue** (vd: BullMQ).
  3. Hệ thống Worker chạy ngầm bốc dữ liệu ra -> Xử lý Auto-Merge -> Lưu vào Database.
  4. Worker dùng **Socket.io** bắn event Real-time lên trình duyệt của Sales (Cập nhật UI ngay lập tức).

### 3.2. Cấu trúc Database (Tối ưu theo Giai đoạn)
- **Phase 2 (Tập trung Core):**
  - `zalo_templates`: Quản lý mẫu ZBS.
  - `notification_queue`: Hàng đợi gửi ZBS (có cơ chế Retry/Fallback sang SMS).
  - `message_logs`: Bảng Core lưu mọi tin nhắn in/out đa kênh (`id, customer_id, channel, payload, status`).
- **Phase Mở rộng:**
  - `contact_points`: Quản lý các UID/PSID rác hoặc chưa định danh.
  - `campaigns` & `notification_rules`.

### 3.3. Thuật toán Phân bổ Lead (Lead Assignment)
- **KHÔNG dùng Round-Robin.**
- Sẽ thiết kế luồng (ví dụ: Chuyên viên lọc Lead rồi gán tay, hoặc Rule-based dựa theo tuyến tour khách quan tâm) sau khi thống nhất quy trình vận hành và KPI của Team Sales.

---

## 4. LỘ TRÌNH TRIỂN KHAI (MASTER ROADMAP 6 PHASE)

Bám sát giới hạn **Gói OA Tăng Trưởng** (đã tích hợp OpenAPI):

- **PHASE 1 (ĐANG LÀM): ZBS TEST**
  - Tạo 1 ZBS Template Giao dịch.
  - Gửi thử thủ công từ Zalo OA Manager sang SĐT nội bộ.
- **PHASE 2: OPENAPI & ZBS TRANSACTION (Code ERP)**
  - Đấu nối ERP với Zalo OpenAPI.
  - Thiết lập hạ tầng Webhook (Redis + Worker).
  - Code luồng tự động gửi ZBS: *"FIT TOUR đã tiếp nhận yêu cầu đặt tour"*.
- **PHASE 3: OMNICHANNEL INBOX & IDENTITY ENGINE**
  - Ra mắt giao diện Channel Toggle UI cho Sales.
  - Phát triển tính năng gộp Lead (Auto-Merge qua `?ref=` và Manual Merge).
- **PHASE 4: CSKH HẬU MÃI (ZBS POST-TOUR)**
  - Tự động hóa các luồng: Cảm ơn sau tour, Gửi Album ảnh, Chúc mừng sinh nhật VIP.
- **PHASE 5: OA MARKETING (MANUAL)**
  - Sử dụng Zalo Campaign Tool để Sales/Marketing tự chọn tệp khách và gửi chiến dịch.
- **PHASE 6: MARKETING AUTOMATION**
  - ERP tự chạy các kịch bản Cross-sell dựa trên Lifecycle (vd: Khách đi Lệ Giang sau 30 ngày tự động mời tour Cửu Trại Câu).
