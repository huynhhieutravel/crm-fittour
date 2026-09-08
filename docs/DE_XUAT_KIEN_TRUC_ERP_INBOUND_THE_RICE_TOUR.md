# BẢN ĐỀ XUẤT HỆ THỐNG ERP INBOUND DÀNH CHO THE RICE TOUR
## ĐỐI CHIẾU & KẾ THỪA 100% HỆ THỐNG PHÂN HỆ THỰC TẾ TỪ CRM FIT TOUR
*Tài liệu chuẩn hóa bám sát từng Tab Giao diện, Bảng Database và Quy trình Vận hành có sẵn*

---

## MỤC LỤC
1. [TỔNG QUAN CHIẾN LƯỢC: TẬN DỤNG NỀN TẢNG ERP FIT TOUR](#1-tổng-quan-chiến-lược-tận-dụng-nền-tảng-erp-fit-tour)
2. [BÀI TOÁN SỐNG CÒN: THỐNG NHẤT GIÁ TOUR + LỊCH TRÌNH ĐA WEBSITE](#2-bài-toán-sống-còn-thống-nhất-giá-tour--lịch-trình-đa-website)
3. [CHI TIẾT TOÀN BỘ 9 PHÂN HỆ CỦA ERP THE RICE TOUR (ĐỐI CHIẾU FIT TOUR)](#3-chi-tiết-toàn-bộ-9-phân-hệ-của-erp-the-rice-tour-đối-chiếu-fit-tour)
   - [Phân hệ 1: Quản lý Marketing Ads & Thu nạp Dữ liệu Đa kênh](#phân-hệ-1-quản-lý-marketing-ads--thu-nạp-dữ-liệu-đa-kênh)
   - [Phân hệ 2: Quản lý Lead Bán hàng & Chăm sóc Khách hàng tiềm năng](#phân-hệ-2-quản-lý-lead-bán-hàng--chăm-sóc-khách-hàng-tiềm-năng)
   - [Phân hệ 3: Kho Sản phẩm Tour Mẫu & Lịch trình Gốc](#phân-hệ-3-kho-sản-phẩm-tour-mẫu--lịch-trình-gốc)
   - [Phân hệ 4: Quản lý Lịch Khởi Hành & Bảng Giá Động](#phân-hệ-4-quản-lý-lịch-khởi-hành--bảng-giá-động)
   - [Phân hệ 5: Kênh Public API & Webhook Đồng bộ Đa Website](#phân-hệ-5-kênh-public-api--webhook-đồng-bộ-đa-website)
   - [Phân hệ 6: Quản lý Booking & Điều Hành Thực Địa (Bookings & Operations Hub)](#phân-hệ-6-quản-lý-booking--điều-hành-thực-địa-bookings--operations-hub)
   - [Phân hệ 7: Mạng lưới Nhà Cung Cấp Bản Địa (Suppliers)](#phân-hệ-7-mạng-lưới-nhà-cung-cấp-bản-địa-suppliers)
   - [Phân hệ 8: Dự toán & Quyết toán Chi phí Lãi/Lỗ](#phân-hệ-8-dự-toán--quyết-toán-chi-phí-lãilỗ)
   - [Phân hệ 9: Chăm sóc Sau Tour & Báo cáo Hiệu suất Lãnh đạo](#phân-hệ-9-chăm-sóc-sau-tour--báo-cáo-hiệu-suất-lãnh-đạo)
4. [BẢNG TỔNG HỢP SO SÁNH FIT TOUR (HIỆN TẠI) VS. THE RICE TOUR (INBOUND)](#4-bảng-tổng-hợp-so-sánh-fit-tour-hiện-tại-vs-the-rice-tour-inbound)
5. [CÂY CẤU TRÚC PHÂN CẤP ĐỂ VẼ MINDMAP](#5-cây-cấu-trúc-phân-cấp-để-vẽ-mindmap)

---

## 1. TỔNG QUAN CHIẾN LƯỢC: TẬN DỤNG NỀN TẢNG ERP FIT TOUR

Hệ thống ERP của FIT Tour hiện tại là một hệ sinh thái quản trị lữ hành toàn diện (Node.js + PostgreSQL + React Vite), đã trải qua thực chiến vận hành hàng ngày:
- **Chuỗi cung ứng khép kín:** Từ khâu chạy Marketing Ads ➔ Sales tư vấn & chăm sóc Lead ➔ Tạo Tour & Bảng giá ➔ Đặt tour & Điều hành xe/HDV/khách sạn ➔ Dự toán/Quyết toán Costing ➔ Thu chi kế toán ➔ CSKH sau tour.
- **Tính khả thi của dự án The Rice Tour:** Chúng ta lấy **toàn bộ bộ khung ERP FIT Tour làm lõi (chiếm 80% hệ thống)**, và tập trung may đo vào các điểm mấu chốt của dòng tour Inbound:
  1. **Thống nhất Lịch trình & Giá Tour đa Website:** Dùng API chung và tiến trình Webhook Outbox sẵn có để phát tán dữ liệu, đảm bảo sửa giá/lịch trình ở ERP thì tất cả các website đổi theo ngay lập tức.
  2. **Ma trận Giá bậc thang (Tiered Pax):** Tận dụng cột `price_rules` (JSONB) có sẵn để tính giá theo số lượng khách (1 khách, 2 khách, nhóm 4-6 khách...) và mùa cao điểm/thấp điểm.
  3. **Tích hợp liền mạch Booking & Điều hành (Bookings & Operations Hub):** Gộp khâu Đặt chỗ, Thu tiền cọc 30% với Điều hành hậu cần đoàn tour, xuất Phiếu dặn dò nhà bếp (cảnh báo dị ứng đậu phộng/ăn chay) và Danh sách đoàn (Passenger Manifest).
  4. **Loại bỏ các khâu chưa khả thi:** Bỏ Trung tâm Điều phối tự động vì phụ thuộc vào Meta App Review (hiện The Rice Tour chưa có App Facebook được phê duyệt); Lead được tiếp nhận trực tiếp từ Form Website, WhatsApp Business và Email. Bỏ phân hệ B2B MICE doanh nghiệp để tinh gọn cho giai đoạn đầu.

---

## 2. BÀI TOÁN SỐNG CÒN: THỐNG NHẤT GIÁ TOUR + LỊCH TRÌNH ĐA WEBSITE

### 2.1. Hiện trạng Codebase FIT Tour đã có sẵn gì?
- **Kênh Public API:** File `server/routes/publicDepartures.js` hiện đang cấp API công khai `GET /api/public/departures` và `GET /api/public/departures/:code` để trang Astro bên ngoài (`fittour.vn`) kéo dữ liệu lịch khởi hành, giá vé, số chỗ còn và dữ liệu Thẻ khởi hành (`departure_card_data`).
- **Tiến trình Webhook Outbox:** Hệ thống đã có bảng `webhook_outbox` (`id`, `app_id`, `event_type`, `payload`, `status`) và file cron `server/cron/webhookOutboxEngine.js` quét mỗi 1 phút để bắn tín hiệu đồng bộ ra các hệ sinh thái bên ngoài.

### 2.2. Giải pháp triển khai cho The Rice Tour:
ERP The Rice Tour đóng vai trò là **Tổng kho trung tâm (Single Source of Truth - SSOT)**:

```
                            ┌──────────────────────────────────────────────┐
                            │          ERP THE RICE TOUR (BACKEND)         │
                            │                                              │
                            │  • Bảng `tour_templates`: Kho lịch trình gốc │
                            │  • Cột `price_rules`: Bảng giá theo số khách │
                            │  • Bảng `webhook_outbox`: Hàng đợi đồng bộ   │
                            └──────────────────────┬───────────────────────┘
                                                   │
                ┌──────────────────────────────────┴──────────────────────────────────┐
                │                                                                     │
   (1) CÁC WEBSITE KÉO DỮ LIỆU                                           (2) ERP BẮN TÍN HIỆU KHI CÓ SỬA ĐỔI
   Kế thừa `routes/publicDepartures.js`                                  Kế thừa `cron/webhookOutboxEngine.js`
                │                                                                     │
                ▼                                                                     ▼
┌─────────────────────────────────┐                                   ┌─────────────────────────────────┐
│ CÁC ENDPOINT CÔNG KHAI (PUBLIC) │                                   │ TIẾN TRÌNH WEBHOOK ENGINE       │
│                                 │                                   │                                 │
│ • GET /api/public/tours         │                                   │ • Quét `webhook_outbox` mỗi phút│
│   (Lấy danh sách tour hiển thị) │                                   │ • Bắn POST tới các Website:     │
│ • GET /api/public/tours/:slug   │                                   │   - thericetour.com/api/sync    │
│   (Lấy full lịch trình từng ngày│                                   │   - mekongfoodtour.com/api/sync │
│ • POST /api/public/calc-price   │                                   │ ➔ Tất cả Website tự xóa cache,  │
│   (Tính giá động theo số khách, │                                   │   hiển thị nội dung mới ngay.   │
│    ngày đi, phụ thu HDV...)     │                                   │                                 │
└─────────────────────────────────┘                                   └─────────────────────────────────┘
```

1. **Website kéo dữ liệu (Chiều đi):**
   - Website thương hiệu chính (`thericetour.com`), các website ngách chuyên đề (vd: tour ẩm thực, tour nông nghiệp) chỉ cần gọi API về ERP để lấy bài viết, ảnh và bảng giá.
   - Khi khách chọn ngày đi và số lượng người ➔ Web gọi API `POST /api/public/tours/:slug/calculate-price` để ERP trả về con số giá USD chuẩn xác tức thì.
2. **ERP tự động xóa cache đa Website khi có cập nhật:**
   - Khi Admin trên ERP bấm "Lưu Tour" hoặc đổi giá, controller tự động chèn 1 dòng vào bảng `webhook_outbox`.
   - Tiến trình `webhookOutboxEngine.js` lập tức bắn Webhook sang tất cả các website để làm mới dữ liệu. **Không cần bất kỳ ai phải vào từng website chỉnh sửa bằng tay.**

---

## 3. CHI TIẾT TOÀN BỘ 9 PHÂN HỆ CỦA ERP THE RICE TOUR (ĐỐI CHIẾU FIT TOUR)

---

### PHÂN HỆ 1: QUẢN LÝ MARKETING ADS & THU NẠP DỮ LIỆU ĐA KÊNH
*Phân hệ giúp Ban Giám đốc và Marketing kiểm soát chi phí quảng cáo, đo lường giá tiền trên mỗi khách hàng tiềm năng (CPL) và bảo đảm không thất thoát số liệu.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/MarketingAdsTab.jsx`.
  - **Bảng Database:** `marketing_ads_reports`, `marketing_campaigns`, `marketing_kpis`.
  - **Dịch vụ Backend:** `server/routes/marketingAds.js`, `server/services/facebookService.js`, script `vps_import_ads.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Import file Excel báo cáo định kỳ từ Meta Ads Manager (Chi phí, Số lượt hiển thị, Số click, Số tin nhắn Messenger phát sinh).
  - Áp dụng nguyên tắc: Quét trực tiếp Tag `[BU...]` từ Tên nhóm quảng cáo (Ad Set Name) để phân loại thị trường, loại bỏ dòng "Tổng cộng" tránh nhân đôi số liệu.
  - Đo lường chỉ số sống còn: Chi phí trên mỗi Lead (CPL), Tỷ lệ chuyển đổi từ tiền quảng cáo ra Doanh thu thực tế.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - Giữ nguyên toàn bộ logic import và bảng tính CPL.
  - Phân loại Tag theo thị trường mục tiêu Inbound (thay vì BU nội địa): `[US-EU]` (Khách Âu - Mỹ), `[AUS]` (Khách Úc), `[ASIA]` (Khách Nhật, Hàn, Singapore), `[LOCAL-EXPATS]` (Người nước ngoài sống tại Việt Nam).
  - Tích hợp thêm kênh Google Ads (Search/Performance Max) vì du khách quốc tế tìm kiếm tour văn hóa/ẩm thực qua Google Search rất nhiều.

---

### PHÂN HỆ 2: QUẢN LÝ LEAD BÁN HÀNG & CHĂM SÓC KHÁCH HÀNG TIỀM NĂNG
*Phân hệ là bàn làm việc hàng ngày của nhân viên Sales Inbound để quản lý toàn bộ phễu khách hàng từ khi tiếp nhận đến khi chốt tour.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/LeadsTab.jsx`, `client/src/tabs/LeadsDashboardTab.jsx`, Modal `LeadNotesModal.jsx`, `client/src/tabs/RemindersTab.jsx`.
  - **Bảng Database:** `leads`, `lead_notes`, `lead_reminders`, `customers`.
  - **Controller xử lý:** `server/controllers/leadController.js`, `server/routes/leads.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Hiển thị danh sách khách theo phễu trạng thái: `Mới`, `Đang tư vấn`, `Tiềm năng`, `Đã chốt (Booking)`, `Không mua / Thất bại`.
  - **Nhật ký chăm sóc bắt buộc (`lead_notes`):** Sales phải ghi chú nội dung cuộc gọi/tin nhắn, lý do khách chưa chốt, ngân sách của khách. Không được để CRM thành "Hộp đen".
  - **Lịch nhắc hẹn (`lead_reminders`):** Đặt lịch hẹn ngày giờ gọi lại hoặc gửi lại chương trình tour, hệ thống tự động bắn chuông thông báo nhắc nhở.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - **Tiếp nhận khách thực tế (không cần App Review):** Lead tự động đổ về từ Form Website (`POST /api/public/inquiries`), Form Landing page quảng cáo, Tin nhắn WhatsApp Business của công ty và Email gửi về `info@thericetour.com`.
  - **Phân bổ Lead:** Trưởng phòng Sales gán trực tiếp cho nhân viên hoặc Sales tự nhận theo thị trường ngôn ngữ phụ trách (Anh, Pháp).
  - **Nhận diện Múi giờ Quốc tế:** Hiển thị quốc kỳ và đồng hồ múi giờ của khách (Paris, New York, Sydney) trên giao diện Lead để Sales biết thời điểm thích hợp nhắn tin/trao đổi mà không làm phiền giờ ngủ của khách.
  - Lưu trữ: Quốc tịch du khách, Ngôn ngữ giao tiếp ưu tiên, Kênh liên lạc ưa chuộng (WhatsApp thay vì Zalo).

---

### PHÂN HỆ 3: KHO SẢN PHẨM TOUR MẪU & LỊCH TRÌNH GỐC
*Phân hệ số hoá toàn bộ sản phẩm lữ hành mẹ của The Rice Tour, đóng vai trò là "Tổng kho nội dung" cho toàn bộ hệ thống.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/ToursTab.jsx` và `AddTemplateModal` trong `TourModals.jsx`.
  - **Bảng Database:** `tour_templates` trong PostgreSQL.
  - **Controller xử lý:** `server/controllers/tourController.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Quản lý mã tour (`code`), tên tour (`name`), thời lượng (`duration`), khối quản lý (`bu_group`), điểm đến (`destination`), ảnh đại diện (`image_url`), điểm nổi bật (`highlights`), danh mục dịch vụ bao gồm/không bao gồm, công tắc bật/tắt hiển thị (`is_active`).
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - **Trình soạn thảo Lịch trình theo ngày (`itinerary` JSONB):** Soạn chi tiết từng ngày (Day 1, Day 2...). Mỗi ngày gồm:
    - *Hoạt động chi tiết Sáng/Chiều/Tối:* Gặt lúa cùng nông dân, Workshop làm cốm dẹp, Chèo xuồng ba lá rạch dừa.
    - *Cấp độ vận động (Activity Level):* Đi bộ nhẹ 2km, đạp xe 5km, chèo thuyền 45 phút.
    - *Bữa ăn bao gồm:* Sáng (B), Trưa (L), Tối (D) kèm mô tả thực đơn đặc sản Nam Bộ.
    - *Cơ sở lưu trú:* Homestay lúa nước / Ecolodge ven sông / Resort boutique.
    - *Tọa độ GPS:* Gắn tọa độ các điểm dừng để tự động vẽ lộ trình bản đồ Google Maps lên website.
  - Hỗ trợ tiêu đề và tóm tắt song ngữ (Tiếng Anh + Tiếng Pháp).

---

### PHÂN HỆ 4: QUẢN LÝ LỊCH KHỞI HÀNH & BẢNG GIÁ ĐỘNG
*Phân hệ quản lý các ngày chạy tour thực tế và vận hành cỗ máy tính giá tự động theo số lượng khách và mùa vụ.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/DeparturesTab.jsx`, Modal `AddDepartureModal`, trang `client/src/pages/ViewDeparturePage.jsx`.
  - **Bảng Database:** `tour_departures` trong PostgreSQL.
  - **Cơ sở đã có sẵn:** File `migration_dynamic_pricing.js` đã tạo sẵn 2 cột JSONB là `price_rules` và `additional_services`.
  - **Controller xử lý:** `server/controllers/departureController.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Quản lý mã khởi hành (`code`), ngày bắt đầu (`start_date`), ngày kết thúc (`end_date`), số chỗ tối đa (`max_participants`), hạn chót nhận cọc (`deadline_payment`), thông tin thẻ khởi hành (`departure_card_data`).
  - Sử dụng cột `price_rules` và `additional_services` để lưu giá vé và phụ thu.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - **Ma trận giá bậc thang (Tiered Pax Matrix) trong `price_rules`:**
    Do chi phí xe Limousine, thuyền riêng và công HDV là cố định, giá bán lẻ/khách sẽ tự động giảm dần theo số lượng khách trong đoàn:
    * 1 Khách (Solo): $480/khách
    * 2 Khách (Couple): $295/khách
    * 3 - 4 Khách: $230/khách
    * 5 - 7 Khách: $185/khách
    * 8 - 12 Khách: $155/khách
  - **Mùa vụ:** Tự động nhân hệ số mùa cao điểm khách Tây (*High Season* Tháng 10 - Tháng 4) hoặc mùa hè kích cầu (*Green Season* Tháng 5 - Tháng 9).
  - **Phụ thu dịch vụ trong `additional_services`:** Phụ thu phòng đơn (*Single Supplement*: $+65$), Phụ thu HDV tiếng Pháp ($+40$/ngày), HDV tiếng Đức ($+45$/ngày), Phụ thu Gala Dinner đêm Giáng sinh (24/12) và Tết Dương lịch (31/12).

---

### PHÂN HỆ 5: KÊNH PUBLIC API & WEBHOOK ĐỒNG BỘ ĐA WEBSITE
*Phân hệ đóng vai trò là "cầu nối tự động", giải quyết triệt để yêu cầu thống nhất dữ liệu giữa ERP và nhiều website vệ tinh.*

- **Đối chiếu Codebase FIT Tour:**
  - **Tệp Router Backend:** `server/routes/publicDepartures.js`, `server/routes/catalog.js`.
  - **Bảng Database:** `webhook_outbox`.
  - **Tiến trình chạy ngầm:** `server/cron/webhookOutboxEngine.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Cung cấp API công khai `GET /api/public/departures` cho website Astro (`Dulichcoguu`) lấy dữ liệu lịch tour, giá vé, số chỗ còn.
  - Quản lý hàng đợi `webhook_outbox` để phát tín hiệu đồng bộ ra ngoài.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - **Nâng cấp API công khai:**
    - `GET /api/public/tours`: Website kéo danh sách tour hiển thị lên trang chủ/danh mục.
    - `GET /api/public/tours/:slug`: Website lấy chi tiết bài viết, thư viện ảnh và toàn bộ lịch trình từng ngày (`itinerary` JSONB).
    - `POST /api/public/tours/:slug/calculate-price`: Khách trên web chọn ngày và số người ➔ ERP tính toán trả về số tiền USD chính xác sau 0.05 giây.
  - **Tự động xóa cache đa Website qua Webhook:**
    Khi Admin trên ERP sửa lịch trình hoặc đổi giá ➔ Hệ thống tự động ghi 1 job vào `webhook_outbox` ➔ Tiến trình `webhookOutboxEngine.js` lập tức gửi tín hiệu HTTP xóa cache tới tất cả các website (thericetour.com, blog đối tác, landing page) ➔ **Nội dung mới hiển thị đồng bộ sau 3 giây.**

---

### PHÂN HỆ 6: QUẢN LÝ BOOKING & ĐIỀU HÀNH THỰC ĐỊA (BOOKINGS & OPERATIONS HUB)
*Phân hệ tích hợp toàn diện từ khâu khách đặt chỗ, thu tiền cọc đến điều phối xe cộ, hướng dẫn viên và hậu cần an toàn thực phẩm trên tour.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/OpToursTab.jsx`, `client/src/tabs/BookingsTab.jsx`, Modal `BookingModals.jsx`, `client/src/tabs/PaymentVouchersTab.jsx`.
  - **Bảng Database:** `tour_departures`, `bookings`, `customers`, `booking_transactions`, `payment_vouchers`.
  - **Controller xử lý:** `server/controllers/opTourController.js` và `bookingController.js`.
- **Nghiệp vụ thực tế tích hợp (Khép kín từ Bán hàng đến Vận hành):**
  1. **Khâu Đặt chỗ & Thu tiền (Bookings & Payments):**
     - Tiếp nhận đơn đặt tour: Lưu mã booking (`booking_code`), ngày đi, số lượng khách, tổng tiền USD.
     - **Quy trình thu tiền 2 giai đoạn:**
       * *Đợt 1 (Deposit):* Thu cọc 30% khi chốt tour qua thẻ quốc tế (Stripe / OnePay 3D-Secure).
       * *Đợt 2 (Final Balance):* Hệ thống tự động gửi email nhắc thanh toán 70% còn lại trước ngày khởi hành 21-30 ngày.
     - Quản lý phiếu thu tiền (`payment_vouchers`) và xuất phiếu thu trực tuyến (`PublicReceiptPage.jsx`).
  2. **Khâu Quản lý Hồ sơ Khách Inbound (cột `raw_details` JSONB):**
     - Lưu trữ danh sách thành viên: Họ tên theo hộ chiếu, Ngày sinh, Quốc tịch, Số hộ chiếu, Hạn hộ chiếu.
     - Xếp phòng khách sạn: Phòng Double (1 giường đôi), Phòng Twin (2 giường đơn), Single (ở riêng), Extra Bed cho trẻ em.
     - **Tự động xuất Danh sách đoàn (Passenger Manifest):** Đúng mẫu quy định để khai báo lưu trú với chính quyền dọc tuyến sông Mekong.
  3. **Khâu Điều hành Thực địa & Hậu cần Đoàn (Tour Operations):**
     - Tự động gắn các booking vào Lịch khởi hành tương ứng trong `OpToursTab`.
     - Theo dõi số lượng khách đã bán (`total_sold`), số chỗ đang giữ (`total_reserved`), số tiền đã thu (`total_paid`).
     - Phân công xe Limousine, tàu thuyền sông nước và Hướng dẫn viên ngoại ngữ (chống trùng lịch bằng hàm `checkGuideOverlap`).
     - Theo dõi các chi phí phát sinh thực tế trong tour (`expenses`).
  4. **Xuất "Phiếu Dặn Dò Nhà Bếp" Tự Động (Kitchen Preparation Slip):**
     - Hệ thống quét qua toàn bộ hồ sơ khách trong các booking của đoàn và xuất ra văn bản tiếng Việt gửi cho homestay/nhà hàng bản địa:
       > *"LỆNH DẶN DÒ BẾP - ĐOÀN KHÁCH ÔNG SMITH (4 KHÁCH) - NGÀY 15/10:*  
       > *- Bàn ăn gồm: 01 khách ăn chay hoàn toàn (Vegan - không nêm nước mắm, không dùng mỡ động vật).*  
       > *- 01 khách DỊ ỨNG NẶNG ĐẬU PHỘNG (tuyệt đối không dùng dầu đậu phộng, không rắc đậu phộng lên đĩa gỏi).*  
       > *- 02 khách ăn uống bình thường."*

---

### PHÂN HỆ 7: MẠNG LƯỚI NHÀ CUNG CẤP BẢN ĐỊA (SUPPLIERS)
*Phân hệ quản lý toàn bộ chuỗi cung ứng dịch vụ tại địa phương (Mekong, Đồng bằng sông Cửu Long).*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** 5 Tab chuyên biệt: `HotelsTab.jsx`, `TransportsTab.jsx`, `RestaurantsTab.jsx`, `TicketsTab.jsx`, `GuidesTab.jsx`.
  - **Bảng Database:** `hotels`, `transports`, `restaurants`, `tickets`, `guides`.
  - **Controllers:** `hotelController.js`, `transportController.js`, `restaurantController.js`, `ticketController.js`, `guideController.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Quản lý danh bạ, giá hợp đồng đại lý, thông tin người liên hệ của từng nhà cung cấp.
  - **Quản lý Hướng dẫn viên (`guides`):** Lưu trữ ngoại ngữ (`languages`), số thẻ HDV quốc tế, và **thuật toán kiểm tra trùng lịch `checkGuideOverlap`** trong `departureController.js` tự động ngăn chặn việc gán trùng lịch dẫn tour.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - Tái sử dụng 90% module này.
  - Phân loại đối tác: Khách sạn boutique ven sông, Homestay nhà dân, Đội xe Limousine Mekong, Thuyền gỗ và xuồng chèo ba lá, Nghệ nhân làng nghề lúa gạo.

---

### PHÂN HỆ 8: DỰ TOÁN & QUYẾT TOÁN CHI PHÍ LÃI/LỖ
*Phân hệ kiểm soát toàn bộ chi phí đầu vào của tour, đối soát doanh thu và tính toán lợi nhuận gộp thực tế của từng đoàn.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/CostingsTab.jsx`.
  - **Bảng Database:** `tour_costings` trong PostgreSQL.
  - **Controller xử lý:** `server/controllers/costingController.js`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - Quản lý chi tiết 11 nhóm chi phí đầu vào trong cột `costs` (JSONB): Vận chuyển, Khách sạn, Suất ăn, Vé tham quan, Hướng dẫn viên, Bảo hiểm, Dự phòng...
  - Mỗi dòng chi phí có sẵn: Đơn giá và số lượng dự toán vs thực tế, Tiền đã đặt cọc (`deposit`), **Tỷ giá ngoại tệ quy đổi (`exchange_rate`)**.
  - Tự động lấy doanh thu từ `bookings` trừ đi chi phí thực tế ➔ Tính ra **Lợi nhuận gộp thực tế (Gross Profit)** và tỷ suất lợi nhuận gộp (% Margin) của từng đoàn tour.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - Giữ nguyên 100% logic toán học và giao diện của FIT Tour vì cấu trúc bóc tách định phí / biến phí và tỷ giá ngoại tệ hiện tại đã quá hoàn chỉnh cho bài toán Inbound.

---

### PHÂN HỆ 9: CHĂM SÓC SAU TOUR & BÁO CÁO HIỆU SUẤT LÃNH ĐẠO
*Phân hệ giúp Ban Giám đốc có cái nhìn toàn cảnh về sức khỏe doanh nghiệp, hiệu suất làm việc của nhân viên và uy tín thương hiệu trên thị trường quốc tế.*

- **Đối chiếu Codebase FIT Tour:**
  - **Màn hình giao diện:** `client/src/tabs/CEODepartureDashboardTab.jsx`, `client/src/tabs/ManagementDashboardTab.jsx`, `client/src/tabs/StaffPerformanceTab.jsx`, `client/src/tabs/CustomerReviewsTab.jsx`, `client/src/tabs/GoogleReviewsTab.jsx`.
  - **Bảng Database:** `customer_reviews`, `google_reviews`, `audit_logs`.
- **Nghiệp vụ thực tế đang chạy tại FIT Tour:**
  - **Dashboard Khởi hành cho CEO:** Nắm bắt ngay đoàn nào sắp chạy, tỷ lệ lấp đầy chỗ, đoàn nào hòa vốn, đoàn nào đang có lãi cao.
  - **Đánh giá Hiệu suất Nhân viên (`StaffPerformanceTab`):** Đo lường số lượng lead từng Sales tiếp nhận, tỷ lệ chốt thành công, doanh thu mang về.
  - **Quản lý Đánh giá Sau tour:** Thu thập ý kiến phản hồi của khách hàng sau khi kết thúc chuyến đi.
- **Tùy chỉnh áp dụng cho The Rice Tour (Inbound):**
  - Tích hợp gửi email/tin nhắn cảm ơn tự động vào ngày cuối cùng của tour kèm **đường link mời khách đánh giá 5 sao trên TripAdvisor và Google Maps The Rice Tour**.
  - Nếu khách chấm điểm dịch vụ dưới 4 sao ➔ ERP tự động bắn cảnh báo đỏ về điện thoại của Quản lý để can thiệp chăm sóc ngay trước khi khách bay về nước, ngăn chặn review tiêu cực trên mạng xã hội.

---

## 4. BẢNG TỔNG HỢP SO SÁNH FIT TOUR (HIỆN TẠI) VS. THE RICE TOUR (INBOUND)

| Tiêu chí | FIT Tour CRM (Codebase hiện tại) | The Rice Tour ERP (Đề xuất Inbound) |
| :--- | :--- | :--- |
| **Sản phẩm Tour** | Tour outbound đoàn lớn, lịch cố định (SIC) | Tour trải nghiệm văn hóa, lúa nước, 70% may đo (Private) |
| **Lịch trình Tour** | Lưu link PDF (`schedule_link`) & text tóm tắt | Lịch trình cấu trúc khối theo ngày (`itinerary` JSONB) |
| **Bảng giá Tour** | Giá vé Người lớn/Trẻ em cố định / khách | **Ma trận giá bậc thang theo số khách (Tiered Pax)** + Mùa vụ |
| **Phụ thu Dịch vụ** | Phí Visa, Tiền Tip, Phòng đơn | Phòng đơn, **Phụ thu HDV tiếng Pháp/Đức**, Nâng hạng resort |
| **Kênh Phân phối Web** | Xuất API cho 1 website Astro (`fittour.vn`) | **Headless API & Webhook Outbox** phát tán cho chuỗi website vệ tinh |
| **Marketing Ads** | Facebook Ads thị trường Việt Nam (Tag BU) | Facebook Ads + Google Ads thị trường quốc tế (Tag US, EU, AUS) |
| **Tiếp nhận Lead** | Messenger Fanpage (qua Bot AI/Webhook), Zalo | Form Website, Landing page, WhatsApp Business, Email quốc tế |
| **Booking & Điều hành** | Tách 2 Tab: BookingsTab & OpToursTab | **Gộp làm một Hub:** Khách đặt ➔ Xếp phòng ➔ Điều xe/HDV ➔ Phiếu bếp |
| **Hồ sơ Du khách** | Họ tên, SĐT, CCCD, Hộ chiếu | Hộ chiếu, Rooming list, **Yêu cầu ăn chay (Vegan), Dị ứng đậu phộng** |
| **Cổng Thanh toán** | Chuyển khoản QR ngân hàng nội địa VN | Cổng quẹt thẻ quốc tế (**Stripe, OnePay 3D-Secure**) |

---

## 5. CÂY CẤU TRÚC PHÂN CẤP ĐỂ VẼ MINDMAP

*(Anh có thể copy toàn bộ đoạn văn bản bên dưới dán thẳng vào **XMind, Miro hoặc FigJam** để bung ra sơ đồ cây hoàn chỉnh):*

```text
ERP THE RICE TOUR (KẾ THỪA 100% NỀN TẢNG FIT TOUR)
	1. HỆ THỐNG KẾT NỐI ĐỒNG BỘ ĐA WEBSITE
		1.1. Kênh API công khai phát tán dữ liệu (Chiều đi)
			1.1.1. API danh sách tour (GET /api/public/tours)
			1.1.2. API chi tiết lịch trình theo ngày (GET /api/public/tours/:slug)
			1.1.3. API tính giá động theo số khách, ngày đi, phụ thu (POST /api/public/calc-price)
		1.2. Cơ chế tự động xóa cache đa Website (Webhook Outbox Engine)
			1.2.1. Admin bấm Lưu Tour ở ERP -> Tự ghi job vào bảng webhook_outbox
			1.2.2. Tiến trình cron ngầm bắn tín hiệu xóa cache tới các Website sau 3 giây
		1.3. Kênh tiếp nhận đơn hàng về ERP (Chiều về)
			1.3.1. Form yêu cầu tư vấn / customize tour (POST /api/public/inquiries)
			1.3.2. Form đặt tour trực tiếp và giữ chỗ (POST /api/public/bookings)
			1.3.3. Cổng thanh toán quốc tế (Stripe/OnePay) xác nhận cọc 30% tự động
	2. PHÂN HỆ 1: MARKETING ADS & THU NẠP DỮ LIỆU ĐA KÊNH
		2.1. Quản lý chi phí chiến dịch Facebook Ads & Google Ads (MarketingAdsTab)
		2.2. Phân loại thị trường theo Tag quốc tế ([US-EU], [AUS], [ASIA])
		2.3. Đo lường chi phí trên mỗi Lead (CPL) và tỷ lệ chuyển đổi doanh thu
	3. PHÂN HỆ 2: QUẢN LÝ LEAD BÁN HÀNG & CHĂM SÓC
		3.1. Quản lý phễu khách hàng tiềm năng (LeadsTab, LeadsDashboardTab)
		3.2. Nhật ký tư vấn bắt buộc (LeadNotesModal - chống hộp đen CRM)
		3.3. Lịch nhắc hẹn chăm sóc khách hàng (RemindersTab)
		3.4. Tiếp nhận khách đa kênh (Form Website, WhatsApp, Email quốc tế)
		3.5. Hiển thị đồng hồ múi giờ quốc tế của khách (Paris, New York, Sydney)
	4. PHÂN HỆ 3: KHO SẢN PHẨM TOUR MẪU (TOUR TEMPLATES)
		4.1. Quản lý thông tin tour (Mã tour, Tên tour đa ngữ, Thời lượng, Tags)
		4.2. Trình soạn lịch trình theo ngày (Day-by-Day Blocks)
			4.2.1. Lộ trình hoạt động Sáng - Chiều - Tối
			4.2.2. Bữa ăn bao gồm (B/L/D) và Lưu trú (Ecolodge, Homestay)
			4.2.3. Tọa độ GPS tự vẽ bản đồ Google Maps
		4.3. Dịch vụ bao gồm (Inclusions) và Không bao gồm (Exclusions)
		4.4. Thư viện hình ảnh chất lượng cao
	5. PHÂN HỆ 4: LỊCH KHỞI HÀNH & BẢNG GIÁ ĐỘNG
		5.1. Ma trận giá bậc thang theo số khách (Cột price_rules JSONB)
			5.1.1. Giá 1 khách đi một mình (Solo Traveler)
			5.1.2. Giá 2 khách đi đôi (Couple)
			5.1.3. Giá nhóm nhỏ 3-4 khách và 5-7 khách
			5.1.4. Giá đoàn 8-12 khách và đoàn lớn 13+ khách
		5.2. Bảng giá theo mùa vụ (Mùa cao điểm khách Tây T10-T4 vs Mùa hè)
		5.3. Phụ thu dịch vụ (Cột additional_services JSONB)
			5.3.1. Phụ thu phòng đơn (Single Supplement)
			5.3.2. Phụ thu HDV tiếng Pháp, Đức, Tây Ban Nha
			5.3.3. Nâng cấp hạng phòng khách sạn
		5.4. Dữ liệu Thẻ Khởi Hành trực tuyến (departure_card_data)
	6. PHÂN HỆ 5: KÊNH PUBLIC API & WEBHOOK ĐỒNG BỘ ĐA WEBSITE
		6.1. API công khai trả dữ liệu tour và tính giá động
		6.2. Webhook Outbox tự động bắn tín hiệu làm mới dữ liệu các web sau 3 giây
		6.3. Form thu nạp booking và tiền cọc về thẳng ERP
	7. PHÂN HỆ 6: QUẢN LÝ BOOKING & ĐIỀU HÀNH THỰC ĐỊA
		7.1. Tiếp nhận đặt tour & Thu cọc 30% qua thẻ quốc tế (Stripe/OnePay)
		7.2. Tự động gửi email nhắc thanh toán 70% còn lại trước 21 ngày
		7.3. Lưu trữ Rooming list, hộ chiếu và xuất Passenger Manifest khai báo lưu trú
		7.4. Phân công xe Limousine, tàu thuyền, Hướng dẫn viên (chống trùng lịch)
		7.5. Xuất phiếu dặn dò nhà bếp tiếng Việt (cảnh báo dị ứng đậu phộng, ăn chay)
	8. PHÂN HỆ 7: MẠNG LƯỚI NHÀ CUNG CẤP (SUPPLIERS)
		8.1. Khách sạn & Homestay sinh thái (HotelsTab)
		8.2. Đội xe & Vận chuyển (TransportsTab)
		8.3. Thuyền bè sông nước Mekong
		8.4. Nhà hàng & Ẩm thực (RestaurantsTab)
		8.5. Vé tham quan & Làng nghề (TicketsTab)
		8.6. Đội ngũ Hướng dẫn viên (GuidesTab - phân loại ngoại ngữ & check trùng lịch)
	9. PHÂN HỆ 8: DỰ TOÁN & QUYẾT TOÁN CHI PHÍ LÃI/LỖ (COSTINGS)
		9.1. Bóc tách chi phí cố định (xe, thuyền, công HDV) và chi phí biến đổi (ăn, vé, phòng)
		9.2. Quản lý 11 hạng mục chi phí đầu vào
		9.3. Hạch toán tỷ giá ngoại tệ (USD sang VND)
		9.4. Báo cáo lợi nhuận gộp thực tế trên từng đoàn tour
	10. PHÂN HỆ 9: CHĂM SÓC SAU TOUR & BÁO CÁO LÃNH ĐẠO
		10.1. Dashboard khởi hành cho CEO (CEODepartureDashboardTab)
		10.2. Đánh giá hiệu suất nhân viên Sales (StaffPerformanceTab)
		10.3. Tự động kích hoạt đánh giá 5 sao trên TripAdvisor và Google Maps
```
