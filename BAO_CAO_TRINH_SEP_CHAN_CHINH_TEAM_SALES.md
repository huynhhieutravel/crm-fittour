# BÁO CÁO NỘI BỘ TRÌNH BAN GIÁM ĐỐC
## V/v: THỰC TRẠNG VẬN HÀNH, TỶ LỆ PHẢN HỒI (SLA) VÀ ĐỀ XUẤT CHẤN CHỈNH KỶ LUẬT ĐỘI NGŨ SALES

* **Kính gửi:** Ban Giám Đốc / Ban Lãnh Đạo FIT TOUR
* **Người lập báo cáo:** Bộ phận Vận hành & Hệ thống CRM
* **Thời gian trích xuất dữ liệu:** Ngày 05 - 06/09/2026
* **Cơ sở dữ liệu:** Toàn bộ lịch sử Lead, Tin nhắn Messenger, Cuộc gọi và Doanh thu trên CRM Production (VPS) từ ngày 01/08/2026 đến 05/09/2026.

---

### LỜI MỞ ĐẦU: VẤN ĐỀ NẰM Ở ĐÂU?

> **Thông điệp chính gửi Sếp:**  
> Marketing không thiếu số. Hệ thống quảng cáo đang mang về lượng khách tiềm năng rất lớn với chi phí tối ưu (hơn 1.800 lead trong tháng 8 & đầu tháng 9). **Tuy nhiên, doanh thu đang bị "chảy máu" nghiêm trọng ở khâu TIẾP NHẬN & TƯ VẤN CỦA ĐỘI NGŨ SALES.**  
> Khách hàng có tiền, có nhu cầu đi tour cao cấp (30 - 100 triệu), chủ động để lại số điện thoại nhưng **Sales không gọi, không nhắn tin, ngâm khách từ 1 đến 4 ngày**, thậm chí để khách giục nhiều lần rồi bỏ đi sang công ty khác.

---

### I. 5 CON SỐ "BÁO ĐỘNG ĐỎ" BAN GIÁM ĐỐC CẦN NẮM NGAY

1. **62.4% Lead trong tháng 9 đang bị "bỏ xó" (138 / 221 Lead):** Trong 5 ngày đầu tháng 9, cứ 10 khách tìm đến FIT TOUR thì có hơn 6 khách không được bất kỳ Sales nào tiếp nhận.
2. **32 Khách hàng NÓNG có đầy đủ SĐT & hỏi tour cụ thể đang bị ngâm từ 1 - 5 ngày:** Toàn bộ các tuyến tour cao cấp (Ai Cập, Pakistan, Sri Lanka, Ladakh, Hokkaido, Trung Á, Lệ Giang) khách đã để lại SĐT nhưng không ai bốc máy gọi.
3. **Thời gian con người can thiệp trung bình là 23.7 TIẾNG (1.425 phút):** Quy định chuẩn của công ty là Sales phải kết nối trong vòng 10 phút. Thực tế, **hơn 64% cuộc trò chuyện bị ngâm từ nửa ngày đến vài ngày** mới có nhân viên thật vào trả lời.
4. **73.3% Khách hàng chỉ nói chuyện với AI Bot rồi "bặt vô âm tín":** Ảo tưởng tự động hoá khiến Sales ỷ lại vào Bot. Bot xin được SĐT xong thì không có Sales nào vào tiếp quản, để mặc khách hàng trên khung chat.
5. **Lệch pha nhân sự phi lý:** BU3 có tới **6 Sales nhưng 35 ngày qua tạo ra 0 đồng doanh thu** (cả tháng 9 chỉ nhận 1 Lead), trong khi BU5 (Ai Cập, Pakistan) đổ về 61 Lead thì **chỉ có 2 Sales gánh, dẫn đến bỏ rơi 56 Lead (91.8%)**!

---

### II. 4 LỖ HỔNG "CHẾT NGƯỜI" TRONG THÁNG VỪA QUA CỦA TEAM SALES

#### Lỗ hổng 1: Tật xấu "Đem con bỏ chợ" – Xin được SĐT xong là vứt xó
Khách hàng vừa để lại SĐT trên Fanpage, AI Bot gửi câu: *"Tác nhân AI đã chuyển đoạn chat cho [Tên Sales]... Chuyên viên sẽ liên hệ ngay..."*.  
Nhưng thực tế:
* Sales **không hề vào chào lại khách một câu trên Messenger**.
* Sales cũng **không bốc máy gọi ngay thoại ngoài**.
* Hậu quả: Khách chờ sốt ruột quay lại nhắn tin thắc mắc: *"Sao không thấy ai gọi?"*, *"Nhắn tin Zalo chị số này..."*, *"Em add Zalo chưa?"* -> Khung chat hoàn toàn bị bỏ hoang, không ai thèm trả lời.

#### Lỗ hổng 2: Khách giục chốt tour, thắc mắc giá nhưng Sales im lặng tuyệt đối
Nhiều khách hàng đang ở trạng thái **cực nóng** (cần đi tour tháng 10, hỏi lịch khởi hành, so sánh giá) nhưng bị Sales ngâm từ 20 tiếng đến 4 ngày:
* Khách hỏi: *"Sao mình thấy giá cao hơn một số bên á?"* -> Sales không vào xử lý từ chối, bỏ mặc khách sang đối thủ mua.
* Khách nhắn: *"E đang cần đi 10/10"* -> Không ai tư vấn.
* Khách nhắn: *"Dạ mình gửi kết bạn rồi ạ"*, *"Mình gửi chưa em?"* -> Sales đọc xong để đó, không gửi chương trình.

#### Lỗ hổng 3: Bệnh "Du kích ngoài luồng", CRM biến thành "Hộp đen"
* Bảng ghi chú chăm sóc (`lead_notes`) trong suốt tháng 8 và tháng 9 ghi nhận: **ĐÚNG 0 GHI CHÚ**.
* Sales tư vấn thế nào, khách từ chối vì sao, hẹn ngày nào gọi lại... hoàn toàn không được ghi nhận lên hệ thống. Sếp và Marketing hoàn toàn "mù" thông tin, không thể đánh giá được chất lượng Lead hay đo lường tỷ lệ chốt của từng nhân viên.

#### Lỗ hổng 4: Trung tâm Điều phối bị tê liệt, Lead chia theo kiểu "ngẫu hứng"
* Lịch phân ca trực điều phối bỏ trống từ tháng 7/2026. Không ai làm "người gác cổng" chia số trong 5 phút.
* Phân bổ lead chuyển sang hình thức ai rảnh thì vào danh sách bốc đại, dồn cục vào cuối buổi hoặc hôm sau mới gán một loạt.

---

### III. BẰNG CHỨNG THỰC TẾ: DANH SÁCH KHÁCH HÀNG ĐANG BỊ SALES BỎ RƠI

#### 1. Bảng 12 khách hàng NÓNG có SĐT đang bị "bỏ đói" tin nhắn từ 10 tiếng đến 4 ngày:
*(Sếp có thể yêu cầu kiểm tra ngay từng tin nhắn trên hệ thống)*

| Tên Khách Hàng | Số Điện Thoại | Tuyến BU | Nhân Sự Phụ Trách | Lời Nhắn Cuối Cùng Của Khách (Đang Chờ Trả Lời) | Thời Gian Bị Bỏ Ngâm |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Trà Mi** | `0913333520` | BU4 | `admin` | *"Nhắn tin zalo c cho dễ nha 0913333520"* | **4 NGÀY (97.6 tiếng)** |
| **Linh Tang** | `0933506068` | BU2 | Chưa giao | *"Ko add zalo dc thì nhắn c sdt bạn c tự add hén"* | **3.8 NGÀY (90.2 tiếng)** |
| **Thùy Trang** | `0867337804` | BU1 | `tq2.sale` (Đoàn Thuý An) | *"Số zalo mình ạ"* | **3.2 NGÀY (78.3 tiếng)** |
| **Ha Duy** | `0903831964` | BU4 | `hi1.sale` (Hồng Trang) | *"Cho chương trình chi tiết tour Ladakh"* | **2.3 NGÀY (55.0 tiếng)** |
| **Thao Dang** | `0919916080` | BU4 | `admin` | *"Hóa cảnh ở Ấn Độ hả em"* | **2.2 NGÀY (53.1 tiếng)** |
| **Cin Vo** | `0915135505` | BU4 | `hi1.sale` (Hồng Trang) | *"E đang cần đi 10/10"* | **2.1 NGÀY (51.5 tiếng)** |
| **Nguyễn Trà My** | `0975969641` | BU2 | `gu2.sale` (Bùi Ngọc Hiếu) | *"Dạ mình gửi kết bạn rồi ạ"* | **2.0 NGÀY (49.0 tiếng)** |
| **Nhi Tran** | `0966004194` | BU2 | `gu2.sale` (Bùi Ngọc Hiếu) | *"Mình gửi chưa"* | **1.8 NGÀY (43.4 tiếng)** |
| **Thúy Vy** | `0764885910` | BU5 | `hi4.sale` (Trần Gia Tuệ) | *"Sao mình thấy giá cao hơn so với một số bên á"* | **1.3 NGÀY (31.1 tiếng)** |
| **Cuc Pham** | `0963989910` | BU2 | Chưa giao | *"Mình thấy bên cty báo giá như này."* | **1.1 NGÀY (27.5 tiếng)** |
| **Sy Nguyen Tien**| - | BU4 | `hi1.sale` (Hồng Trang) | *"Lịch trình khởi hành đi từ đâu ở HN có lịch trình k"* | **19.1 tiếng** |
| **Nguyen Lan Anh**| `0909697575` | BU1 | `tq2.sale` (Đoàn Thuý An) | *"gửi chị ct tour dạo thành a dinh 7/11"* | **9.5 tiếng (từ 6h sáng)** |

---

#### 2. Bảng 32 Lead Tháng 9 CÓ ĐẦY ĐỦ SĐT nhưng KHÔNG ĐƯỢC PHÂN BỔ CHO BẤT KỲ SALES NÀO:
*(Khách hàng đăng ký từ ngày 01/09 đến 05/09/2026, hiện trạng thái `assigned_to = NULL`)*

| Tuyến BU | Số Lượng Lead Có SĐT Bị Bỏ Quên | Danh Sách Khách Hàng & Nhu Cầu Cụ Thể |
| :--- | :---: | :--- |
| **BU5 (Adventure)** | **6 Khách** | • Nguyễn Hồng Hạnh (`0977887015`) - Pakistan Mùa Thu<br>• Ngan Cao (`0362358831`) - Pakistan Mùa Thu<br>• Nguyễn Thị Diệp Anh (`0934667769`) - Pakistan Mùa Thu<br>• Nguyễn Thị Phúc (`0961517646`) - Tour Ai Cập<br>• Mai Anh (`0977350603`) - Tour Ai Cập<br>• Huyền Thu Đặng (`0961723189`) - Thổ Nhĩ Kỳ |
| **BU2 (Có Gu)** | **14 Khách** | • Chu Phương Linh (`0965833333`) - Tour Alaska Bắc Mỹ<br>• Selena Tran (`0938635626`) - Tour Đài Loan<br>• Tu Phan (`0909600503`), Huy Khánh (`0374409355`), Nheo Bứ (`0971907788`), Linh Tang (`0933506068`) - Tour Hokkaido & Nhật Bản<br>• Ngan Nguyen (`0935195090`), Hanh Quynh (`0915905099`) - Tour Hàn Quốc<br>• **6 Khách TikTok để lại SĐT hỏi Tour Con Đường Tơ Lụa Trung Á**: `0586604689`, `0987267249`, `0908604499`, `0352785882`, `0964978841`, `0935744531` |
| **BU4 (Heritage)** | **6 Khách** | • Thanh Mai (`0822333369`) - Tour Sri Lanka Tết 2027<br>• Vinh Ta (`0919990068`) - Tour Sri Lanka 8N8Đ<br>• Mi Ng (`0905599009`), Võ Hoài Thiên (`0916720692`), Sunnie Trinh (`0919120678`) - Tour Ladakh Roadtrip |
| **BU1 (Trung Quốc)** | **4 Khách** | • Đông Thuần Nguyễn (`0934185274`) - Tàu Thanh Tạng 10N9Đ<br>• Linh Dan Dang (`0866120080`) - Tour Giang Nam 5N5Đ<br>• Hồng Nhung (`0353752269`) - Tour Lệ Giang 6N5Đ |
| **Chưa phân BU** | **2 Khách** | • THẢO (`0986629532`), Brand Biyokea (`0979793676`) |

> **Ước tính thiệt hại doanh thu:** 32 khách hàng trên nếu chỉ cần chốt theo tỷ lệ trung bình 15% (khoảng 5 booking nhóm 2 người), công ty đã đánh rơi **từ 400 đến 800 triệu đồng doanh thu** chỉ trong 5 ngày đầu tháng!

---

### IV. BẢN ĐỒ HIỆU SUẤT & NGHỊCH LÝ NHÂN SỰ GIỮA CÁC TEAM

```
┌─────────────────┬───────────┬───────────────────┬────────────────────────────────────────────────────────┐
│ Nhóm BU         │ Nhân sự   │ Lượng Lead T8-T9  │ Tình trạng & Hiệu quả thực tế                         │
├─────────────────┼───────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ BU1 (Trung Quốc)│ 5 Sales   │ 505 Lead          │ VẬN HÀNH TỐT: Chia đều lead, chốt ~2.9 tỷ VNĐ          │
│ BU5 (Adventure) │ 2 Sales   │ 367 Lead (T9: 61) │ QUÁ TẢI NẶNG: Bỏ rơi 91.8% lead T9; Top 1 DT gánh team │
│ BU4 (Heritage)  │ 3 Sales   │ 521 Lead (T9: 31) │ BẤT THƯỜNG: Bị ngắt lead từ 28/08, bỏ xó 87.1% lead T9 │
│ BU2 (Có Gu)     │ 2 Sales   │ 175 Lead (T9: 37) │ DỒN 1 NGƯỜI: 1 Sales gánh hết, trễ hẹn khách hàng      │
│ BU3 (Siêu Việt) │ 6 Sales   │ 17 Lead (T9: 1)   │ LÃNG PHÍ: 6 Sales ngồi chơi, 0 booking, 0 doanh thu    │
└─────────────────┴───────────┴───────────────────┴────────────────────────────────────────────────────────┘
```

1. **BU1 (Trung Quốc - 5 Sales):** Là team duy nhất giữ được kỷ luật phân bổ đều tay và phản hồi ổn định. Mang về doanh thu gần 3 tỷ VNĐ.
2. **BU5 (Adventure - 2 Sales):** Đang là "con gà đẻ trứng vàng" về doanh thu (> 2.8 tỷ VNĐ, trong đó riêng Dương Quỳnh Như chốt 2.51 tỷ), Marketing rót tiền mạnh nhất, nhưng nhân sự quá mỏng dẫn đến **56 khách hàng tháng 9 bị vứt bỏ**.
3. **BU4 (Heritage - 3 Sales):** Tháng 8 nhận 374 lead, chốt 1.3 tỷ VNĐ. Nhưng từ **28/08 đến nay (8 ngày qua), nhân sự chủ lực `hi3.sale` (Ngô Ngọc Đăng Huy) hoàn toàn không nhận lead nào**, khiến cả team rơi vào tê liệt, 27/31 lead tháng 9 bị bỏ xó.
4. **BU2 (Du lịch Có Gu - 2 Sales):** Trưởng phòng không nhận lead, dồn hết 92 lead cho Bùi Ngọc Hiếu khiến nhân sự này quá tải, khách giục gửi báo giá 2 ngày không trả lời.
5. **BU3 (Siêu Việt - 6 Sales):** Nghịch lý lớn nhất công ty: Có tới 6 nhân sự ăn lương nhưng cả tháng 8 chỉ có 16 lead, tháng 9 **đúng 1 lead**, mang về **0 đồng doanh thu**.

---

### V. ĐỀ XUẤT CỦA BỘ PHẬN VẬN HÀNH ĐỂ SẾP CHẤN CHỈNH NGAY

Để chặn đứng việc lãng phí tiền Marketing và phục hồi doanh số ngay trong tuần này, đề xuất Ban Giám Đốc ban hành các quyết định sau:

#### 1. Xử lý khẩn cấp trong ngày hôm nay (Cứu nóng khách hàng):
* **Họp khẩn cấp toàn bộ Sales:** Yêu cầu các Sales có tên trong danh sách mục III.1 (`tq2.sale`, `hi1.sale`, `gu2.sale`, `hi4.sale`) mở ngay khung chat Messenger và điện thoại trực tiếp xin lỗi khách hàng, gửi chương trình tư vấn.
* **Cưỡng chế phân bổ ngay 32 Lead có SĐT** đang nằm ở trạng thái Chưa giao để gọi điện ngay trước khi khách đặt bên khác.
* **Làm rõ tình trạng của `hi3.sale` (Huy Ngô - BU4):** Vì sao ngưng nhận lead từ 28/08 để phân bổ lại các tuyến Ladakh, Sri Lanka.

#### 2. Tái cơ cấu & Điều chuyển nhân sự chéo BU (Trong 48 giờ):
* **Cắt cử ngay 3 - 4 Sales từ BU3 (đang không có việc)** sang phụ trách các thị trường đang quá tải của **BU5** (Ai Cập, Pakistan, Thổ Nhĩ Kỳ) và **BU2** (Trung Á, Nhật Bản). Đào tạo cấp tốc sản phẩm trong 1 buổi để vào việc ngay.

#### 3. Thiết lập kỷ luật thép & Chế tài SLA:
* **Áp dụng Quy tắc "Xác nhận 2 đầu" (SLA 5 phút):** Khi có SĐT trên Messenger, trong vòng 5 phút Sales bắt buộc phải:
  1. Gõ tin nhắn xác nhận trên Messenger: *"Dạ em là [Tên], chuyên viên tuyến [Tour], em đang kết bạn Zalo và gọi cho mình từ số [SĐT] ngay đây ạ"*.
  2. Bốc máy gọi điện trực tiếp.
* **Chế tài vi phạm:** 
  * Quá 15 phút không nhận hoặc không phản hồi lead -> **Hệ thống tự động thu hồi Lead chuyển cho người khác**.
  * Bỏ quên tin nhắn của khách quá 2 tiếng -> **Phạt trừ điểm KPI / Cắt quyền nhận lead trong 3 ngày**.
* **Kỷ luật cập nhật CRM:** Bắt buộc 100% cuộc gọi/tư vấn phải có ít nhất 1 dòng Note ghi nhận trạng thái khách trên CRM. Cuối tuần Sales nào 0 Note sẽ không được tính hoa hồng booking.

#### 4. Kích hoạt tính năng Auto Round-Robin & Cảnh báo Telegram:
* Chuyển đổi cơ chế phân bổ: Tự động chia đều theo vòng tròn (Round-Robin) cho các Sales đang Online, chấm dứt việc gán thủ công ngẫu hứng.
* Cài đặt Bot Telegram tự động "bêu tên" Sales vào nhóm chung công ty nếu để khách chờ quá 15 phút.

---
*Báo cáo kính trình Ban Giám Đốc xem xét và phê duyệt các biện pháp chấn chỉnh.*
