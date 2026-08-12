# Chiến lược Kết nối Zalo OA và ERP: Phễu Lead Marketing & Automation

Tài liệu này phác thảo ý tưởng và lộ trình biến Zalo OA thành một kênh **Inbound Marketing (Phễu thu thập Lead)** mạnh mẽ, đổ trực tiếp dữ liệu về phân hệ Lead Marketing của hệ thống FIT TOUR ERP.

---

## 1. Tầm nhìn: Biến Zalo OA thành Cỗ máy Thu Lead (Lead Generation Engine)

Thay vì chỉ dùng Zalo để chat thụ động, chúng ta sẽ xây dựng một phễu khép kín:
**Tiếp cận (Zalo Ads/Widget/QR)** ➔ **Thu thập (Zalo OA Webhook)** ➔ **Xử lý & Phân bổ (ERP CRM)** ➔ **Nuôi dưỡng (Zalo Marketing Automation).**

```text
[Zalo Ads]  [Website Widget]  [Offline QR Code]  [Zalo ZNS/Broadcast]
      │             │                 │                  │
      └─────────────┼─────────────────┴──────────────────┘
                    ↓
              ZALO OA (Follow / Chat / Share Info)
                    │
                    ↓ (Zalo Webhook)
            ┌───────────────┐
            │   FIT TOUR    │ ➔ 1. Định danh (UID / SĐT / user_external_id)
            │      ERP      │ ➔ 2. Phân loại (Tag / Segment / Tour Quan Tâm)
            │   (Bộ não)    │ ➔ 3. Phân bổ (Chia Lead cho Sales)
            └───────────────┘
                    │
                    ↓ (Zalo OpenAPI)
            Marketing Automation
      (Tin Tư Vấn / Broadcast / Campaign)
```

---

## 2. Các Giai đoạn Tích hợp & Vận hành

### Giai đoạn 1: Bắt trọn mọi điểm chạm (Lead Capture)
Mục tiêu: Kéo user tương tác với OA và xin được thông tin (SĐT) ngay lập tức.
*   **Website Widget (Đã chốt ở Plan trước):** Nút "Nhận tư vấn qua Zalo" trên trang chi tiết Tour Mông Cổ. Khách click -> Mở Zalo PC/App -> Tự động gửi tin nhắn "Tôi muốn tư vấn tour Mông Cổ".
*   **Zalo Form (Share Info):** Cấu hình Menu dưới cùng của OA là "Nhận Báo Giá". Khi khách bấm vào, Zalo bật form xin số điện thoại. Khách bấm "Đồng ý chia sẻ" -> Webhook bắn SĐT về ERP.
*   **QR Code Offline:** Tại hội thảo du lịch, khách quét QR Code -> Tự động Follow OA và nhận e-Brochure qua chat. Webhook báo về ERP: "Nguồn Lead = Event tháng 10".

### Giai đoạn 2: Phân loại & Chuyển giao tự động (Lead Routing)
Mục tiêu: Đưa Lead vào đúng phễu trên ERP mà không cần Sales nhập tay.
*   **Webhook Mapping:** ERP hứng sự kiện `follow` hoặc `user_send_text` từ Zalo.
*   **Tạo Lead Profile:** ERP tự động tạo một Lead Profile dạng: `Khách từ Zalo - UID: 123...`.
*   **Auto-Tagging (Gắn nhãn):** Dựa vào nội dung chat ban đầu (vd khách chat "Tour Tứ Xuyên"), ERP tự động gán Tag `Intent: Trung Quốc` và đẩy Lead về cho Team Sales Trung Quốc.
*   **Thông báo nội bộ:** ERP đẩy notification cho Sales (qua màn hình CRM hoặc Telegram/Slack nội bộ): *"Có Lead mới từ Zalo quan tâm Tour Tứ Xuyên"*.

### Giai đoạn 3: Nuôi dưỡng & Chuyển đổi (Lead Nurturing)
Mục tiêu: Tận dụng thời gian "Vàng" 7 ngày của Zalo (Tin Tư Vấn miễn phí) để chốt sale.
*   **Auto-Reply thông minh (48h đầu):** Khi Lead vừa nhắn tin, ERP gọi OpenAPI gửi ngay 1 tin nhắn Carousel (trượt ảnh) gồm 3 Tour HOT nhất kèm giá.
*   **Follow-up Drip Campaign (Ngày 3, Ngày 7):** Nếu sau 3 ngày Lead chưa chốt (State trên ERP vẫn là `INQUIRY`), ERP tự động nhắn 1 tin (qua Zalo OpenAPI): *"Chào anh/chị, FIT TOUR đang có mã giảm giá 1 triệu cho tour Tứ Xuyên, anh/chị có muốn tham khảo thêm không ạ?"*.
*   **OA Broadcast (Nuôi dài hạn):** Khi Lead hết cửa sổ 7 ngày, ERP sẽ gom Lead này vào Segment `Chưa chốt - Quan tâm TQ`. Cuối tháng, Marketing sẽ tạo Zalo Broadcast bài viết "Cảnh sắc Cửu Trại Câu mùa thu" gửi đến đúng Segment này.

---

## 4. Thiết kế Hệ thống cho Lead Marketing trên ERP

Để đáp ứng kịch bản trên, phân hệ Marketing trên ERP cần có các cấu phần (Component) sau:

1.  **Zalo Webhook Listener Module:**
    - Xử lý các event: `user_send_text`, `follow`, `user_submit_info`, `oa_send_text` (đồng bộ log chat của Sales).
2.  **Lead Scoring & Routing Rules:**
    - Engine quyết định Lead này sẽ chuyển cho Sale nào dựa vào Source (nguồn) và Nội dung quan tâm.
3.  **CRM Inbox (Chatbot & Live Chat Hỗn hợp):**
    - Màn hình để Sales chat trực tiếp với khách Zalo ngay trong ERP.
    - Sales thấy được cả lịch sử khách từng đi tour gì, đang coi tour gì để tư vấn (Unified View).
4.  **Campaign Builder (Liên kết với Zalo Campaign Tool):**
    - Giao diện tạo danh sách tập khách hàng trên ERP (ví dụ: Lọc toàn bộ Khách đi Mông Cổ năm 2023) -> Export sang Zalo để bắn Broadcast / ZBS Hậu mãi.

---

## 5. Lời khuyên khi bắt tay thực hiện

*   **Đừng build Chatbot quá phức tạp:** Khách đi tour cao cấp của FIT TOUR cần người thật tư vấn. Chỉ nên dùng Auto-reply cho câu chào hỏi đầu tiên và xin số điện thoại. Sau đó phải chuyển ngay cho Sales.
*   **Xin SĐT là Ưu tiên Số 1:** Chỉ khi khách bấm nút "Chia sẻ số điện thoại" trên Zalo, ERP mới có SĐT để tạo profile hoàn chỉnh (Map với `user_external_id`). Nếu chỉ có UID Zalo, mình sẽ rất bị động khi hết hạn 7 ngày nhắn tin.
*   **Đồng bộ State giữa Zalo OA và ERP:** Trạng thái Lead trên ERP (Ví dụ đổi từ `LEAD` sang `LOST`) phải quyết định việc có gửi tin Zalo Nurturing tiếp hay không, tránh spam khách đã từ chối.
