# BÁO CÁO AUDIT TOÀN DIỆN: SỐ LIỆU LEAD MARKETING, TRUNG TÂM ĐIỀU PHỐI, TỶ LỆ SLA VÀ CHẤT LƯỢNG CHĂM SÓC CÁC TEAM TƯ VẤN

* **Thời gian thực hiện audit:** Ngày 05 - 06/09/2026
* **Nguồn dữ liệu:** PostgreSQL Database Production (VPS `45.76.144.188`)
* **Phạm vi khảo sát:** Toàn bộ dữ liệu Lead, Hội thoại (`conversations`), Tin nhắn (`messages`), Booking (`bookings_raw`) từ 01/08/2026 đến 05/09/2026 (trọng tâm 5 ngày đầu Tháng 9/2026).

---

## 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Một cuộc kiểm toán dữ liệu thời gian thực trên hệ thống CRM Production cho thấy một bức tranh đối lập: **Marketing đang làm rất tốt nhiệm vụ kéo Lead đầu vào với chi phí tối ưu, nhưng khâu XỬ LÝ (Điều phối - Nhắn tin - SLA - Chăm sóc) của các team Tư vấn đang gặp khủng hoảng đứt gãy nghiêm trọng**.

### Những con số "biết nói":
1. **73.3% cuộc trò chuyện hoàn toàn không có con người can thiệp:** Gần 3/4 khách hàng nhắn tin vào Fanpage chỉ nói chuyện với AI Bot / tin nhắn tự động rồi bị bỏ rơi, trong đó có **71 khách hàng đã để lại SĐT trong 5 ngày qua chưa từng có người thật chào hỏi**.
2. **SLA con người can thiệp trung bình lên tới 23.7 TIẾNG (1.425 phút):** SOP quy định phản hồi trong < 10 phút, nhưng thực tế có tới **64.4% cuộc chat bị ngâm từ 2 tiếng đến vài ngày** mới có nhân viên vào tiếp quản.
3. **138 / 221 Lead tháng 9 (62.4%) chưa được phân bổ cho ai:** Trong đó có **32 khách hàng CÓ ĐẦY ĐỦ SĐT và NÊU RÕ TOUR CỤ THỂ** đang nằm chờ từ 1 - 5 ngày không có Sales nào gọi điện.
4. **25 cuộc hội thoại khách hàng nhắn tin giục, thắc mắc giá, xin add Zalo nhưng bị "bỏ đói" tin nhắn từ 9.5h đến 97.6h (4 ngày)** mà không có bất kỳ phản hồi nào từ tư vấn viên.
5. **Lệch pha nhân sự cực đoan:** BU5 (Adventure) quá tải nghẽn cổ chai với 2 Sales (bỏ rơi 91.8% lead T9), BU4 (Heritage) bị "đóng băng" đột ngột từ 28/08 (bỏ rơi 87.1% lead T9), trong khi BU3 có tới **6 Sales nhưng "đói" việc hoàn toàn** (cả tháng 9 chỉ có đúng 1 Lead).

---

## 2. BỨC TRANH SỐ LIỆU LEAD MARKETING (ĐẦU VÀO)

Từ ngày 01/08 đến 05/09/2026, hệ thống ghi nhận **1.821 Lead** đổ về:
* **Tháng 8/2026:** 1.600 Lead.
* **Tháng 9/2026 (01/09 - 05/09):** **221 Lead** (~44 Lead/ngày).
* **Nguồn kênh:** Facebook Ads / Messenger chiếm **>95%**, kế tiếp là TikTok Lead Form, Zalo OA và Hotline.

### Bảng phân bổ Lead và Chi phí theo từng Nhóm BU:
| Nhóm BU | Tổng Lead (T8+T9) | Riêng Tháng 9 (5 ngày) | Chi phí Ads T8 | Số Lead có SĐT | Tỷ lệ đã phân bổ | Số Lead chưa giao (Bỏ rơi) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **BU1 (Trung Quốc)** | 505 | 69 | 30.2 tr | 183 | **94.7%** | 27 (T9: 8) |
| **BU5 (Adventure/Viễn du)** | 367 | 61 | **34.4 tr** | 77 | **22.6%** | **284 (T9: 56)** |
| **BU4 (Heritage/Nam Á/Tây Á)**| 521 | 31 | 29.0 tr | 149 | **71.8%** | **147 (T9: 27)** |
| **BU2 (Du lịch Có Gu)** | 175 | 37 | 8.9 tr | 91 | **55.4%** | **78 (T9: 24)** |
| **BU3 (Siêu Việt / Nội địa)** | 17 | **1** | 1.8 tr | 8 | 29.4% | **12 (T9: 1)** |
| **Chưa phân BU (Trôi nổi)** | 224 | 22 | - | 8 | 4.0% | **215 (T9: 22)** |
| **Khác / Marketing** | 12 | 0 | - | 3 | - | 9 |
| **TỔNG CỘNG** | **1.821** | **221** | **~104 tr** | **519** | **57.5%** | **772 (T9: 138)** |

---

## 3. THỰC TRẠNG NHẮN TIN: "ẢO TƯỞNG TỰ ĐỘNG HÓA" (AUTOMATION ILLUSION)

Phân tích 19.306 tin nhắn qua 2.183 cuộc trò chuyện từ 01/08 đến nay cho thấy:
* **Tin nhắn từ Khách hàng:** 4.824 tin (25.0%).
* **Tin nhắn từ Page / AI Bot tự động:** 13.996 tin (**72.5%**).
* **Tin nhắn gõ tay thực tế từ Tư vấn viên:** **Chỉ 486 tin (2.5%)**!

```
                    TỔNG SỐ TIN NHẮN TRÊN HỆ THỐNG
   ┌──────────────────────────────────────────────────────────────┐
   │ AI Bot / Meta Automation: 72.5% (13.996 tin)                 │
   ├───────────────────────────────┬──────────────────────────────┤
   │ Khách hàng: 25.0% (4.824 tin) │ Sales gõ tay: 2.5% (486 tin) │
   └───────────────────────────────┴──────────────────────────────┘
```

### Vấn đề "Ảo tưởng tự động hoá":
1. Khi khách nhắn tin, AI Bot Meta phản hồi cực nhanh (< 10 giây), chào hỏi và giới thiệu tour rất mượt, xin được SĐT thành công.
2. Ngay sau khi khách cung cấp SĐT, Bot gửi tin nhắn:
   > *"Cảm ơn Anh/Chị... Tác nhân AI đã chuyển đoạn chat này cho bạn... Đoạn chat này được chỉ định cho [Tên Sales]... Chuyên viên tư vấn sẽ chủ động liên hệ ngay..."*
3. **Và ngay sau câu thông báo đó, HỆ THỐNG BỊ "ĐỨT CÁP" HOÀN TOÀN:**
   * Không có nhân viên nào vào chat tiếp.
   * Sales được Bot nhắc tên (Huy Ngô, Quỳnh Phương, Trần Thịnh...) **không hề hay biết** hoặc **không vào xử lý**.
   * Trên CRM, Lead đó vẫn nằm ở trạng thái `assigned_to = NULL`.

---

## 4. TỶ LỆ SLA XỬ LÝ (RESPONSE TIME & SERVICE LEVEL AGREEMENT)

Dữ liệu đo đạc thực tế thời gian phản hồi giữa Khách hàng - Bot - Tư vấn viên:

| Chỉ số SLA | Thời gian thực tế | Chuẩn SOP | Đánh giá |
| :--- | :---: | :---: | :--- |
| **SLA Bot phản hồi tin đầu tiên** | **< 30 giây** | < 1 phút | Đạt (Do AI Bot tự động trả lời). |
| **SLA Con người vào tiếp quản (Human Response)** | **1.425 phút (~23.7 TIẾNG)** | < 10 phút | **Vi phạm nghiêm trọng** (Chậm gấp 140 lần). |
| **Tỷ lệ có người chat trong < 10 phút** | **29.0%** (127 / 438 ca) | > 90% | Chỉ chưa đầy 1/3 khách được gặp người thật lúc còn online. |
| **Tỷ lệ có người chat từ 10 - 30 phút** | **6.6%** (29 / 438 ca) | - | Khách bắt đầu mất kiên nhẫn. |
| **Tỷ lệ ngâm từ 2 tiếng đến vài ngày** | **64.4%** (282 / 438 ca) | 0% | **Gần 2/3 khách hàng bị bỏ ngâm nguội lạnh.** |

### So sánh SLA Con người can thiệp giữa các Nhóm BU:
| Nhóm BU | Tổng cuộc chat | Số cuộc có người rep | Tỷ lệ có người rep | Thời gian rep TB | Số ca rep < 10 phút | Số ca bị ngâm > 2 tiếng |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **BU5 (Adventure)** | 420 | 75 | **17.9%** | **8.1 tiếng** | 41 | 15 |
| **BU4 (Heritage)** | 596 | 129 | **21.6%** | **22.8 tiếng** | 22 | 88 |
| **BU2 (Có Gu)** | 194 | 52 | **26.8%** | **25.6 tiếng** | 17 | 23 |
| **BU1 (Trung Quốc)** | 630 | 174 | **27.6%** | **31.5 tiếng** | 45 | 102 |
| **BU3 (Siêu Việt)** | 16 | 2 | **12.5%** | **3.1 tiếng** | 0 | 2 |
| **Chưa phân BU** | 95 | 5 | **5.3%** | **5.2 tiếng** | 1 | 3 |

> **Nhận xét cốt lõi:** Toàn bộ các BU đều có tỷ lệ con người can thiệp **dưới 30%**. Khi có người can thiệp thì thời gian chờ trung bình đều tính bằng **hơn nửa ngày đến hơn một ngày**.

---

## 5. CHẤT LƯỢNG CHĂM SÓC & HIỆN TƯỢNG "BỎ RƠI GIỮA CHỪNG"

### 1. Hiện tượng "Đem con bỏ chợ" sau khi lấy SĐT
Nhiều tư vấn viên có thói quen: thấy khách để lại SĐT thì mặc định "sẽ add Zalo sau", nên **bỏ bẵng hoàn toàn khung chat Facebook Messenger**.
Tuy nhiên:
* Khách chặn kết bạn từ người lạ trên Zalo.
* Hoặc Sales bận chưa add Zalo ngay.
* Khách chờ sốt ruột quay lại Messenger nhắn tin thì **không ai đọc, không ai trả lời**.

### 2. Danh sách 12 khách hàng NÓNG đang bị "bỏ đói" tin nhắn (01/09 - 05/09/2026):

| Tên Khách | SĐT Khách | BU / Phụ trách | Nội dung tin nhắn cuối cùng của khách | Thời gian chờ |
| :--- | :---: | :---: | :--- | :---: |
| **Trà Mi** | `0913333520` | BU4 (`admin`) | *"Nhắn tin zalo c cho dễ nha 0913333520"* | **97.6 tiếng (4 ngày)** |
| **Linh Tang** | `0933506068` | BU2 | *"Ko add zalo dc thì nhắn c sdt bạn c tự add hén"* | **90.2 tiếng (3.8 ngày)** |
| **Thùy Trang** | `0867337804` | BU1 (`tq2.sale` An) | *"Số zalo mình ạ"* | **78.3 tiếng (3.2 ngày)** |
| **Ha Duy** | `0903831964` | BU4 (`hi1.sale` Trang)| *"Cho chương trình chi tiết tour Ladakh"* | **55.0 tiếng (2.3 ngày)** |
| **Thao Dang** | `0919916080` | BU4 (`admin`) | *"Hóa cảnh ở Ấn Độ hả em"* | **53.1 tiếng (2.2 ngày)** |
| **Cin Vo** | `0915135505` | BU4 (`hi1.sale` Trang)| *"E đang cần đi 10/10"* | **51.5 tiếng (2.1 ngày)** |
| **Nguyễn Trà My** | `0975969641` | BU2 (`gu2.sale` Hiếu) | *"Dạ mình gửi kết bạn rồi ạ"* | **49.0 tiếng (2 ngày)** |
| **Nhi Tran** | `0966004194` | BU2 (`gu2.sale` Hiếu) | *"Mình gửi chưa"* | **43.4 tiếng (1.8 ngày)** |
| **Thúy Vy** | `0764885910` | BU5 (`hi4.sale` Tuệ) | *"Sao mình thấy giá cao hơn so với một số bên á"* | **31.1 tiếng (1.3 ngày)** |
| **Cuc Pham** | `0963989910` | BU2 | *"Mình thấy bên cty báo giá như này."* | **27.5 tiếng (1.1 ngày)** |
| **Sy Nguyen Tien**| - | BU4 (`hi1.sale` Trang)| *"Lịch trình khởi hành đi từ đâu ở HN có lịch trình k"*| **19.1 tiếng** |
| **Nguyen Lan Anh**| `0909697575` | BU1 (`tq2.sale` An) | *"gửi chị ct tour dạo thành a dinh 7/11"* | **9.5 tiếng (từ 6h sáng)** |

### 3. Bóc tách 3 Case Study điển hình trong 24 giờ qua:
* **Case 1 (Khách Nguyễn Thắng - `0936233572` - Tour Giang Nam):**
  * Khách cho SĐT lúc 18:13 ngày 04/09: *"Sdt của a là 0936233572. Chắc e cứ gửi qua cho a tham khảo..."*.
  * Suốt **21 tiếng** không có nhân viên nào nhắn lại. Đến 15:16 ngày 05/09, tư vấn viên mới vào rep: *"Dạ có bạn Phương nhân viên tư vấn bên em đã liên hệ với mình qua bên zalo, chị để ý điện thoại nhen"* (Khách là Anh Thắng nhưng gọi nhầm thành Chị).
* **Case 2 (Khách Thanh Mai - `0822333369` - Tour Sri Lanka Tết 2027):**
  * Khách cho SĐT lúc 12:40 ngày 05/09. Bot thông báo: *"Đoạn chat này được chỉ định cho Huy Ngô"*.
  * Đến hết buổi chiều ngày 05/09, **Huy Ngô (`hi3.sale`) hoàn toàn không vào chat, không nhận trên CRM, khách nằm chờ**.
* **Case 3 (Khách HL Nguyen - `0931221147` - Khách VIP Bespoke Bắc Kinh 7 pax):**
  * Khách nhắn cần thiết kế tour riêng cho 5 người lớn + 2 trẻ em đi Bắc Kinh 6N5Đ, cho SĐT lúc 11:07 sáng.
  * Bot thông báo chỉ định Quỳnh Phương, nhưng trên CRM lúc 11:18 lại gán cho Hưng Thịnh. Trên khung chat hoàn toàn không có lời chào xác nhận nào từ phía chuyên viên.

---

## 6. ĐÁNH GIÁ VIỆC SỬ DỤNG CÁC TEAM TƯ VẤN (CONSULTANT TEAMS)

```
                            BẢN ĐỒ HIỆU SUẤT CÁC TEAM TƯ VẤN
┌───────────────────┬──────────────┬──────────────────────────────────────────────────────────┐
│ Team Tư Vấn       │ Số Nhân Sự   │ Tình Trạng Vận Hành & Khắc Phục                         │
├───────────────────┼──────────────┼──────────────────────────────────────────────────────────┤
│ BU1 (Trung Quốc)  │ 5 Sales      │ Vận hành tốt nhất, chia đều lead, chốt ~2.9 tỷ T8       │
│ BU5 (Adventure)   │ 2 Sales      │ Nghẽn cổ chai nặng nhất: 61 lead T9 nhưng bỏ rơi 91.8%   │
│ BU4 (Heritage)    │ 3 Sales      │ Đóng băng bất thường từ 28/08: Bỏ xó 87.1% lead T9       │
│ BU2 (Có Gu)       │ 2 Sales      │ Dồn hết áp lực lên 1 người (Bùi Ngọc Hiếu)               │
│ BU3 (Siêu Việt)   │ 6 Sales      │ ĐÓI LEAD HOÀN TOÀN: Cả T9 có 1 lead, lãng phí nhân sự     │
└───────────────────┴──────────────┴──────────────────────────────────────────────────────────┘
```

1. **BU1 (Trung Quốc - 5 Sales):** Đội ngũ vận hành đồng đều và kỷ luật nhất (An 18, Thịnh NV 16, Phương 14, Duyên 12). Tỷ lệ phân bổ đạt **88.4%**.
2. **BU5 (Adventure - 2 Sales):** Mâu thuẫn lớn nhất công ty: Marketing chạy ads mạnh nhất (34.4 tr T8, 61 lead trong 5 ngày T9), mang về doanh thu kỷ lục (>2.5 tỷ từ Dương Quỳnh Như), nhưng chỉ có 2 Sales nên **quá tải, bỏ rơi 56/61 lead trong tháng 9**.
3. **BU4 (Heritage - 3 Sales):** Đang từ team nhận nhiều lead nhất tháng 8 (374 lead, Huy nhận 216 lead, Trang 152 lead) thì sang tháng 9 **bị ngắt đột ngột**: Huy nhận 0 lead từ ngày 27/08 đến nay, khiến 27/31 lead tháng 9 của BU4 bị bỏ xó.
4. **BU2 (Có Gu - 2 Sales):** Trưởng phòng không nhận lead, toàn bộ 92 lead đổ lên vai Bùi Ngọc Hiếu dẫn đến trễ hẹn và quá hạn xử lý (nhiều khách giục gửi báo giá từ 2 ngày trước vẫn chưa rep).
5. **BU3 (Siêu Việt - 6 Sales):** Lãng phí nguồn lực nghiêm trọng nhất: Có tới 6 nhân sự nhưng tháng 8 chỉ có 6 lead, tháng 9 có **đúng 1 Lead**, 35 ngày qua tạo ra **0 booking, 0 doanh thu**.

---

## 7. NGUYÊN NHÂN CỐT LÕI (ROOT CAUSES)

1. **Tê liệt Trung tâm Điều phối:** Không có nhân sự trực chiến chuyên trách để duyệt và phân bổ lead theo thời gian thực (SLA < 5 phút). Bảng ca trực bỏ trống từ tháng 7/2026.
2. **Đứt gãy công nghệ giữa Meta Bot và CRM:** Bot trên Fanpage tự động xướng tên Sales, nhưng hệ thống không có webhook bắn Web Push Notification hoặc Telegram ép Sales đó phải claim trong 5 phút.
3. **Tâm lý ỷ lại vào AI Bot:** Tư vấn viên thấy Bot đã trả lời lịch trình, giá cả và lấy được SĐT nên chủ quan, nghĩ khách đã được "giữ chân" mà không biết rằng khách tour cao cấp cần sự tương tác ấm áp ngay lập tức của con người.
4. **Không có Dashboard giám sát SLA Unreplied:** Quản lý không có màn hình cảnh báo các hội thoại mà khách đang chờ quá 15 phút chưa được rep.
5. **Kỷ luật cập nhật Pipeline bằng 0:** Bảng `lead_notes` = 0 note. Sales không ghi lại bất kỳ thông tin tư vấn nào lên CRM, khiến dữ liệu khách hàng biến thành "hộp đen".

---

## 8. KẾ HOẠCH HÀNH ĐỘNG CẤP BÁCH (ACTION PLAN)

### Giai đoạn 1: Xử lý nóng (Thực hiện ngay trong ngày hôm nay)
* [ ] **Cứu 12 khách hàng NÓNG đang bị bỏ đói tin nhắn** (Bảng tại Mục 5.2): Chỉ đạo Sales trực tiếp nhắn tin xin lỗi vì sự chậm trễ và gọi điện tư vấn ngay.
* [ ] **Phân bổ ngay 32 Lead có SĐT đang unassigned trong tháng 9** (Bảng chi tiết trong phụ lục) cho Sales gọi điện thoại trực tiếp.
* [ ] **Kiểm tra và kích hoạt lại tài khoản `hi3.sale` (Đăng Huy - BU4)** để tiếp tục nhận các tuyến Ladakh/Sri Lanka.

### Giai đoạn 2: Cân bằng nhân sự chéo BU (Trong 48 giờ tới)
* [ ] **Điều động team BU3 (6 Sales đang thiếu việc)** sang nhận đào tạo nhanh và hỗ trợ tư vấn các tuyến đang quá tải của BU5 (Pakistan, Ai Cập, Thổ Nhĩ Kỳ) và BU2 (Trung Á, Nhật Bản, Hàn Quốc).

### Giai đoạn 3: Chuẩn hoá vận hành & Công nghệ (Trong tuần tới)
* [ ] **Quy tắc "Xác nhận 2 đầu" khi có SĐT:** Khi khách gửi SĐT trên Messenger, Sales trong vòng 5 phút bắt buộc phải:
  1. Gõ tin nhắn Messenger: *"Dạ em là [Tên], chuyên viên tuyến [Tour], em đang kết bạn Zalo và gọi cho mình từ số [SĐT] ngay đây ạ"*.
  2. Bốc máy gọi điện trực tiếp.
* [ ] **Cài đặt cảnh báo Bot Telegram vi phạm SLA:** Tự động cảnh báo vào nhóm quản trị nếu một khách hàng nhắn tin mà sau **15 phút** chưa có nhân sự (`user`) trả lời.
* [ ] **Bật cơ chế Auto Round-Robin:** Tự động chia đều Lead cho các Sales đang Online trong BU ngay khi Lead đổ về, không chờ phân bổ thủ công.

---
*Báo cáo được trích xuất và tổng hợp tự động từ hệ thống CRM FIT Tour.*
