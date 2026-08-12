# Dự án Tích hợp Hệ sinh thái Zalo (Zalo Ecosystem Architecture) - FIT TOUR CRM

Tài liệu này lưu trữ định hướng kiến trúc và lộ trình triển khai hệ thống Zalo (Zalo OA, ZBS, OpenAPI, Mini App) kết nối với hệ thống CRM của FIT TOUR.

---

## 1. Tầm nhìn Kiến trúc (Zalo Ecosystem Architecture)

Hệ sinh thái Zalo được thiết kế với các luồng độc lập, tập trung đổ dữ liệu về trung tâm là **FIT TOUR ERP**. 

*Zalo Mini App không phải là bước tiếp nối của Zalo ZBS, mà là một ứng dụng client (Frontend) tách biệt.*

```text
                    FIT TOUR ZALO ECOSYSTEM

                         ZALO OA
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
           Chat           Follow        Webhook
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                       OpenAPI
                            │
                            ↓
                       FIT TOUR ERP
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
          ZBS Template              CRM / Data
                │                       (user_external_id)
                ↓
             Customer


                ZALO MINI APP
                      │
                      ↓
                 FIT TOUR API
                      │
                      ↓
                     ERP
```

### Định vị vai trò các nền tảng Mobile App
*   **FIT TOUR Mobile (iOS App - Astro + Capacitor):** 
    *   Định vị: **VIP Concierge App**. 
    *   Đối tượng: Khách hàng hiện hữu.
    *   Tính năng: Quản lý hành trình (Journey), thanh toán, hồ sơ, và nhận hỗ trợ cao cấp.
*   **Zalo Mini App:** 
    *   Định vị: **Entry / Conversion App**. 
    *   Đối tượng: Khách hàng tiềm năng tiếp cận qua Zalo (không muốn tải app Native). 
    *   Tính năng (Gọn nhẹ): Xem tour, tìm kiếm, yêu cầu tư vấn, booking cơ bản và chat với OA.

---

## 2. Lộ trình Triển khai (Roadmap)

Dự án được chia làm 2 giai đoạn (Phase) chính. Mọi nguồn lực hiện tại sẽ tập trung 100% vào **Phase A**.

### Phase A: Zalo OA OpenAPI Foundation & ZBS (Đang triển khai - NOW)
**Mục tiêu:** Đưa hệ thống Zalo OA vào luồng automation của ERP, đồng bộ định danh khách hàng.

1.  **Zalo OA & ZBS Template (Manual Validation):**
    *   Tạo 1 ZBS Template (vd: "FIT TOUR đã tiếp nhận yêu cầu đặt tour").
    *   Sử dụng ZBS Account hiện có để test gửi thành công tới 1 số điện thoại thực tế.
2.  **Tạo Zalo Developer App & Cấp quyền:**
    *   Tạo duy nhất 1 App trên [Zalo for Developers](https://developers.zalo.me/).
    *   Liên kết App với Zalo OA và cấp các quyền OpenAPI cần thiết (gửi tin nhắn, nhận webhook).
    *   *Lưu ý:* Kiểm tra các điều kiện (ví dụ: OA xác thực tích vàng) đối với từng API cụ thể thay vì coi đó là điều kiện chặn cứng từ đầu.
3.  **Xây dựng OpenAPI Foundation trên CRM (Backend Node.js):**
    *   **Token Management:** Cơ chế xin cấp phát (OAuth), lưu trữ và refresh Zalo Access Token.
    *   **Webhook Listener:** Nhận sự kiện tương tác từ khách hàng (nhắn tin, follow OA) để đưa vào quy trình xử lý của đội Sales.
    *   **Message Dispatcher:** Tích hợp gọi API gửi ZBS Template từ logic của ERP (ví dụ: Khi chuyển state thành `BOOKING_CREATED`).
4.  **Đồng bộ Định danh (Customer Mapping):**
    *   Sử dụng cơ chế `user_external_id` của Zalo OpenAPI để ánh xạ (map) khách hàng Zalo với mã khách hàng trên ERP (vd: `CUST-9988`).
    *   Tích hợp **Zalo Interactive Widget** lên website FIT TOUR để khách hàng cấp quyền, qua đó hệ thống thu thập và gán `user_external_id` tự động.

### Phase B: Zalo Mini App Development (Tương lai - NEXT)
**Mục tiêu:** Phát triển thêm kênh bán hàng qua Mini App khi Phase A đã vận hành trơn tru và luồng dữ liệu khách hàng qua OA đã đồng bộ với ERP.
*   **Không clone lại** VIP Concierge App.
*   Tập trung vào trải nghiệm UI/UX tạo chuyển đổi: Tour Listing, Tour Detail, Lead Capture, và Booking Form.

---

## 3. Các bước hành động (Action Items) Hiện tại

Để bắt đầu **Phase A (Zalo OA OpenAPI Foundation)**, nhóm phát triển sẽ thực hiện:

1.  **Khảo sát Zalo OpenAPI Docs:** Xác định chính xác luồng cấp phép (OAuth 2.0), cấu trúc của Access Token / Refresh Token mà Zalo đang yêu cầu.
2.  **Thiết kế Database & Module:** Lên thiết kế cấu trúc Database và Module trên ERP (Node.js) để xử lý luồng Authentication một cách an toàn và tự động.
