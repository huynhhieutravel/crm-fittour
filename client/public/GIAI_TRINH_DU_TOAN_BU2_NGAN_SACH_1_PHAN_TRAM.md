# BÁO CÁO GIẢI TRÌNH ĐỀ ÁN DỰ TOÁN NGÂN SÁCH BU2: 45 TRIỆU / QUÝ (15 TRIỆU / THÁNG)

> **Người thực hiện:** Bộ phận Kế Hoạch & Marketing FIT Tour  
> **Kính gửi:** Ban Giám Đốc (CEO) & Trưởng Đơn vị Kinh doanh BU2 (Đông Bắc Á)  
> **Thời gian áp dụng:** Kế hoạch Quý 4/2026 (01/10/2026 – 31/12/2026)  
> **Phạm vi thị trường:** Đông Bắc Á (Nhật Bản, Hàn Quốc, Đài Loan)  
> **Trạng thái:** Đề án dự toán chính thức (Đồng bộ 100% Hệ Thống CRM ERP Production)

---

## I. TỔNG QUAN PHƯƠNG ÁN ĐỀ XUẤT: 45 TRIỆU / QUÝ & 15 TRIỆU / THÁNG

> **Bối cảnh & Nguồn gốc đề xuất:**  
> Do đặc thù các thị trường Đông Bắc Á (Nhật Bản, Hàn Quốc, Đài Loan) vận hành chủ yếu theo mô hình **Tour Liên Minh** (chia tải, gom khách chung và giữ quota vé máy bay), team Marketing không nắm rõ diễn biến thực địa và nghiệp vụ từng tuyến liên minh. Do đó, **dự toán ngân sách Quý 4/2026 này được chính đơn vị kinh doanh BU2 chủ động đề xuất** để bám sát thực tế thị trường.  
> Đồng thời, đề xuất này **kế thừa trực tiếp dữ liệu chi tiêu thực tế cũ của BU2 đang chạy khoảng 16 triệu mỗi tháng** (số liệu Database ERP ghi nhận thực chi Tháng 9/2026 là **15.954.295 đ**). Mức đề xuất 15 triệu/tháng (45 triệu/quý) duy trì đúng nhịp chạy quen thuộc của BU2, vừa giúp đơn vị chủ động phễu khách vừa kiểm soát trần chi phí ở mức an toàn tuyệt đối.

Căn cứ theo đề xuất từ BU2 và định hướng kiểm soát an toàn vốn từ Ban Giám Đốc, phương án dự toán ngân sách Quý 4/2026 xác lập các chỉ tiêu cốt lõi:

* **TỔNG NGÂN SÁCH QUÝ 4/2026:** **45.000.000 VNĐ** (45 Triệu / 3 Tháng)
* **ĐỊNH MỨC HÀNG THÁNG:** **15.000.000 VNĐ / Tháng** (Kế thừa nhịp chạy ~16 Triệu/tháng hiện tại của BU2)
* **TỔNG QUY MÔ PHỤC VỤ:** **11 Đoàn khởi hành** (10 đoàn Q4/2026 + 1 đoàn Hokkaido mùa tuyết 14/01/2027) với tổng **265 chỗ ngồi**.
* **HIỆU QUẢ TOÀN PHỄU:** Dự kiến mang về **~248 Lead SĐT** (~554 Inbox tư vấn) $\rightarrow$ chốt **~24 Pax từ Ads**, kết hợp **67 khách đã đặt cọc** nâng tổng quy mô bảo chứng lên **91 Pax (34.3% tỷ lệ lấp đầy)**.
* **TỶ LỆ AN TOÀN VỐN:** Chiếm **0.75% Doanh thu ERP Q4** (5.986 Tỷ) — **tuân thủ hoàn hảo trần chi phí MKT $\le 1.0\%$**. Chiếm **3.76% Lợi nhuận gộp** (1.197 Tỷ) — rất an toàn, dưới xa ngưỡng cảnh báo 15% - 25%.

---

## II. ĐỐI SOÁT DỮ LIỆU LỊCH SỬ META ADS BU2 (POSTGRESQL PRODUCTION)

Trích xuất 100% từ bảng `marketing_ads_reports` trên Database ERP của FIT Tour qua 6 tháng gần nhất (Tháng 4/2026 $\rightarrow$ Tháng 9/2026 • 50 Ad Sets):

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            DỮ LIỆU LỊCH SỬ META ADS BU2 (6 THÁNG GẦN NHẤT TRÊN DATABASE)                    │
├─────────────────┬──────────┬─────────────────┬────────────┬───────────┬──────────────┬──────────────┬───────────┤
│ Tháng           │ Số Adset │ Chi Phí Ads     │ Số Inbox   │ Lead SĐT  │ CPL/Inbox    │ CPL/Lead SĐT │ CR Inb->SĐT│
├─────────────────┼──────────┼─────────────────┼────────────┼───────────┼──────────────┼──────────────┼───────────┤
│ Tháng 4/2026    │ 8        │ 5.957.805 đ     │ 85         │ 48        │ 70.092 đ     │ 124.121 đ    │ 56.5%     │
│ Tháng 5/2026    │ 10       │ 9.828.160 đ     │ 104        │ 66        │ 94.502 đ     │ 148.912 đ    │ 63.5%     │
│ Tháng 6/2026    │ 12       │ 13.026.763 đ    │ 93         │ 57        │ 140.073 đ    │ 228.540 đ    │ 61.3%     │
│ Tháng 7/2026    │ 5        │ 8.438.160 đ     │ 133        │ 55        │ 63.445 đ     │ 153.421 đ    │ 41.4%     │
│ Tháng 8/2026    │ 7        │ 8.957.476 đ     │ 98         │ 26        │ 91.403 đ     │ 344.518 đ    │ 26.5%     │
│ Tháng 9/2026    │ 8        │ 15.954.295 đ    │ 222        │ 77        │ 71.866 đ     │ 207.199 đ    │ 34.7%     │
├─────────────────┼──────────┼─────────────────┼────────────┼───────────┼──────────────┼──────────────┼───────────┤
│ TỔNG CỘNG 6T    │ 50       │ 62.162.659 đ    │ 735        │ 329       │ 84.575 đ     │ 188.944 đ    │ 44.8%     │
│ BÌNH QUÂN THÁNG │ 8.3      │ 10.360.443 đ    │ 122.5      │ 54.8      │ 84.575 đ     │ 188.944 đ    │ 44.8%     │
└─────────────────┴──────────┴─────────────────┴────────────┴───────────┴──────────────┴──────────────┴───────────┘
```

### Rút ra nhận định then chốt:
1. **Mức đề xuất 15.000.000 đ/tháng là hoàn toàn thực tế:**
   * Trong Tháng 9/2026, BU2 thực tế đã chi **15.954.295 đ** (~16 Triệu) với **222 Inbox** và **77 Lead SĐT**.
   * Đề xuất 15 Triệu/tháng giữ đúng nhịp chạy thực tế của Tháng 9, tăng nhẹ so với mức bình quân 6 tháng trước (~10.4 Triệu/tháng) để phục vụ mùa cao điểm du lịch thu đông Đông Bắc Á.
2. **CPL chuẩn hóa cho từng tuyến sát thực tế:**
   * CPL thực tế trung bình 6 tháng là **188.944 đ / Lead SĐT**. 
   * Tuyến cao cấp Hokkaido đặt ở mức **210.000 đ/lead**; Nhật Cung Đường Vàng: **190.000 đ/lead**; Hàn Quốc: **165.000 đ/lead**; Đài Loan: **140.000 đ/lead**.
   * Phân biệt rõ: **Quy mô đoàn = 265 Pax (ghế)**, còn **Kỳ vọng phễu Ads = ~248 Lead SĐT** $\rightarrow$ chốt **~24 Pax Ads**.

---

## III. NGUYÊN TẮC PHÂN BỔ 2 TRỤC: TOUR RIÊNG CÓ GUU (40%) & TOUR LIÊN MINH (60%)

Không để tour liên minh Ads = 0đ (tránh bị động trước đối tác), ngân sách 45 Triệu được phân chia có chiều sâu cho cả 4 tuyến:

### 1. Trục 1: Tour Mũi Nhọn Thiết Kế Riêng — Hokkaido (18.000.000 đ • 40% — 6 Tr/tháng)
* **Định vị sản phẩm:** "Du lịch có Guu" độc quyền của FIT Tour. Trải nghiệm suối khoáng nóng Onsen lộ thiên ngắm tuyết rơi, thưởng thức cua hoàng đế Taraba, trượt tuyết tuyết bột powdery snow mềm mịn số 1 thế giới tại Niseko/Kiroro.
* **Biên lợi nhuận gộp:** Cực dày, đạt **~9.8 Triệu / khách** (giá tour ~55.5M, giá vốn ~45.7M).
* **Phân bổ:** 18 Triệu chia làm 3 tháng (6 Triệu/tháng). Dự kiến mang lại **~86 Lead SĐT** (~192 Inbox), chốt **~9 Pax Ads** (+10 cọc = **19/40 chỗ**, đạt 47.5% tải 2 đoàn).
* **Hiệu quả kinh tế:** Mang lại **~499.4 Triệu doanh thu** và **~88.1 Triệu lãi gộp**. Tỷ lệ Ads/Lãi gộp chỉ **20.4%**.

### 2. Trục 2: Tour Liên Minh Chia Tải — Cung Đường Vàng, Hàn Quốc, Đài Loan (27.000.000 đ • 60% — 9 Tr/tháng)
* **Nguyên tắc vận hành:** Gom khách chung với đối tác lữ hành liên minh, bảo đảm chắc chắn khởi hành 100%. FIT Tour **vẫn chạy Ads chủ động** để gom đủ hạn ngạch 20 - 30% chỗ được chia của mình, không phụ thuộc vào đối tác.
* **Cơ sở đề xuất từ BU2:** Do đặc thù tour liên minh các thị trường Nhật - Hàn - Đài có quy tắc chia tải và hạn chốt vé riêng biệt mà team Marketing không nắm sâu, **dự toán phân bổ 27 triệu này do chính BU2 trực tiếp đề xuất**, bám sát nhịp chi tiêu quen thuộc ~16 triệu/tháng để bảo đảm chắc chắn số lượng khách cam kết.
* **Phân bổ 27 Triệu cho 3 tuyến trong 3 tháng (9 Tr/tháng):**
  * **Nhật Bản Cung Đường Vàng (3 đoàn: 23/10, 06/11, 28/11):** **12.000.000 đ** (4 Tr/tháng • 4M/đoàn). CPL 190k $\rightarrow$ **63 Lead SĐT** $\rightarrow$ chốt **~6 Pax Ads** (+19 cọc = **25/75 chỗ**, đạt 33.3% tải liên minh).
  * **Hàn Quốc Mùa Thu (2 đoàn: 24/10, 14/11):** **7.500.000 đ** (2.5 Tr/tháng • 3.75M/đoàn). CPL 165k $\rightarrow$ **45 Lead SĐT** $\rightarrow$ chốt **~4 Pax Ads** (+11 cọc = **15/50 chỗ**, đạt 30.0% tải liên minh).
  * **Đài Loan Thu Đông (4 đoàn: 09/10, 30/10, 13/11, 27/11):** **7.500.000 đ** (2.5 Tr/tháng • 1.88M/đoàn). CPL 140k $\rightarrow$ **54 Lead SĐT** $\rightarrow$ chốt **~5 Pax Ads** (+27 cọc = **32/100 chỗ**, đạt 32.0% tải liên minh).

---

## IV. MA TRẬN PHÂN BỔ 45 TRIỆU & DỰ BÁO KẾT QUẢ KINH DOANH

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       MA TRẬN DỰ TOÁN NGÂN SÁCH 45 TRIỆU / QUÝ (15 TRIỆU / THÁNG) BU2                                           │
├─────────────────────┬──────────────┬────────────┬──────────────┬──────────────┬───────────┬──────────┬───────────┬─────────────┤
│ Tuyến Tour          │ Mô Hình      │ Số Đoàn    │ Ngân Sách    │ Tháng (TB)   │ CPL Lead  │ Lead SĐT │ Pax Ads   │ Tổng Pax    │
├─────────────────────┼──────────────┼────────────┼──────────────┼──────────────┼───────────┼──────────┼───────────┼─────────────┤
│ ❄️ Hokkaido Thu Đông│ Độc Quyền FIT│ 2 Đoàn (40)│ 18.000.000 đ │ 6.000.000 đ  │ 210.000 đ │ 86 Lead  │ 9 Pax Ads │ 19/40 (47%) │
│ 🗾 Cung Đường Vàng  │ Tour Liên Minh│ 3 Đoàn (75)│ 12.000.000 đ │ 4.000.000 đ  │ 190.000 đ │ 63 Lead  │ 6 Pax Ads │ 25/75 (33%) │
│ 🍁 Hàn Quốc Mùa Thu │ Tour Liên Minh│ 2 Đoàn (50)│ 7.500.000 đ  │ 2.500.000 đ  │ 165.000 đ │ 45 Lead  │ 4 Pax Ads │ 15/50 (30%) │
│ 🧋 Đài Loan Thu Đông│ Tour Liên Minh│ 4 Đoàn(100)│ 7.500.000 đ  │ 2.500.000 đ  │ 140.000 đ │ 54 Lead  │ 5 Pax Ads │ 32/100(32%) │
├─────────────────────┼──────────────┼────────────┼──────────────┼──────────────┼───────────┼──────────┼───────────┼─────────────┤
│ TỔNG CỘNG TOÀN BU2  │ 2 Trục kết hợp│ 11 Đoàn(265│ 45.000.000 đ │ 15.000.000 đ │ ~181.000 đ│ 248 Lead │ 24 Pax Ads│ 91/265(34%) │
└─────────────────────┴──────────────┴────────────┴──────────────┴──────────────┴───────────┴──────────┴───────────┴─────────────┘
```

### Các chỉ số tài chính cốt lõi:
1. **Doanh thu mang lại từ Ads:** **~847.4 Triệu VNĐ**.
2. **Doanh thu thực tế bảo chứng (91 Pax):** **~2.62 Tỷ VNĐ**.
3. **Lợi nhuận gộp ước tính thực tế:** **~950 Triệu VNĐ**.
4. **Tỷ lệ Ads / Doanh thu 10 đoàn Q4 ERP (5.986 Tỷ):**
   $$\frac{45.000.000\text{ đ}}{5.985.500.000\text{ đ}} = \mathbf{0.75\%} \quad (\le 1.0\%)$$
5. **Tỷ lệ Ads / Lợi nhuận gộp 10 đoàn Q4 ERP (1.197 Tỷ):**
   $$\frac{45.000.000\text{ đ}}{1.197.100.000\text{ đ}} = \mathbf{3.76\%} \quad (\ll 15\%)$$

---

## V. LỘ TRÌNH GIẢI NGÂN HÀNG THÁNG (15 TRIỆU / THÁNG)

Ngân sách được giải ngân đều đặn **15.000.000 VNĐ / tháng** theo tiến độ nộp visa và chốt đoàn:

### 1. Tháng 10/2026: 15.000.000 VNĐ (Nước rút T10 & đón mùa thu vàng)
* **Hokkaido (6 Tr):** Chạy dồn dập trong tuần đầu T10 để chốt cọc kịp hạn nộp visa trước 08/10 cho đoàn 22/10 (15 chỗ).
* **3 Tuyến Liên Minh (9 Tr):** Cung Đường Vàng 4 Tr, Hàn Quốc 2.5 Tr, Đài Loan 2.5 Tr. Giữ nhịp phễu lead, đón mùa lá đỏ và gom đủ quota khách cho các đoàn T10.

### 2. Tháng 11/2026: 15.000.000 VNĐ (Khởi động tuyết trắng Hokkaido & gom đoàn T11)
* **Hokkaido (6 Tr):** Tung chiến dịch Video trải nghiệm tuyết bột powdery snow, onsen lộ thiên cho đoàn Mùa Tuyết Trắng 14/01/2027 (25 chỗ).
* **3 Tuyến Liên Minh (9 Tr):** Cung Đường Vàng 4 Tr, Hàn Quốc 2.5 Tr, Đài Loan 2.5 Tr. Gom nốt khách cho các đoàn cuối tháng 11 qua kênh Ads và đối tác liên minh.

### 3. Tháng 12/2026: 15.000.000 VNĐ (Nước rút khóa đoàn Hokkaido 14/01/2027 & Du xuân)
* **Hokkaido (6 Tr):** Tăng tốc chốt những khách cuối cùng cho đoàn 25 chỗ, chốt sổ visa trước ngày 25/12/2026.
* **3 Tuyến Liên Minh & Re-targeting (9 Tr):** Tiếp thị lại toàn bộ tệp khách đã tương tác nhưng chưa chốt trong Q4 và mở bán các tuyến liên minh mùa hoa xuân đầu năm 2027.

---

## VI. BẢNG SO SÁNH 4 KỊCH BẢN NGÂN SÁCH BU2

Để Ban Giám Đốc có cái nhìn toàn cảnh và linh hoạt chỉ đạo, hệ thống CRM đã tích hợp 4 kịch bản đối sánh trực quan:

| Chỉ Số | KỊCH BẢN CHÍNH (CEO ĐỀ XUẤT) | KỊCH BẢN A (1% THỰC THU) | KỊCH BẢN B (1% ERP Q4) | KỊCH BẢN C (1% TỔNG 11 ĐOÀN) |
| :--- | :---: | :---: | :---: | :---: |
| **Tổng Ngân Sách** | **45.000.000 đ** | **38.000.000 đ** | **60.000.000 đ** | **75.000.000 đ** |
| **Ngân Sách / Tháng** | **15.000.000 đ/tháng** | ~12.67M/tháng | 20.000.000 đ/tháng | 25.000.000 đ/tháng |
| **Hokkaido (Tour riêng)**| **18.000.000 đ (40.0%)** | 25.000.000 đ (65.8%) | 30.000.000 đ (50.0%) | 40.000.000 đ (53.3%) |
| **3 Tuyến Liên Minh** | **27.000.000 đ (60.0%)** | 13.000.000 đ (34.2%) | 30.000.000 đ (50.0%) | 35.000.000 đ (46.7%) |
| **Lead SĐT Kỳ Vọng** | **~248 Lead SĐT** | ~185 Lead SĐT | ~350 Lead SĐT | ~440 Lead SĐT |
| **Pax Chốt Từ Ads** | **~24 Pax Ads** | ~18 Pax Ads | ~32 Pax Ads | ~41 Pax Ads |
| **Tổng Khách (+67 cọc)**| **91 Pax (34.3% tải)** | 85 Pax (32.1% tải) | 99 Pax (37.4% tải) | 108 Pax (40.8% tải) |
| **% Ads / DT 10 đoàn Q4**| **0.75% (Chuẩn ≤ 1%)** | 0.63% | 1.00% (Trần chuẩn) | 1.25% |
| **% Ads / Lãi Gộp Q4** | **3.76% (Rất an toàn)**| 3.17% | 5.01% | 6.27% |
| **Đánh Giá Chiến Lược** | ⭐ **Cân bằng hoàn hảo giữa bảo chứng dòng tiền và chủ động nguồn khách.** | Giảm Ads liên minh, an toàn nhưng tốc độ chậm. | Phủ mạnh liên minh, chạm trần 1%. | Bao trọn cả quý 1/2027, mở rộng thị phần. |

---

## VII. ĐỀ NGHỊ PHÊ DUYỆT

Bộ phận Kế Hoạch & Marketing kính trình Ban Giám Đốc (CEO):
1. **Phê duyệt hạn mức ngân sách BU2 Quý 4/2026: `45.000.000 VNĐ`** (mỗi tháng **15.000.000 VNĐ**).
2. Cho phép triển khai chiến dịch quảng cáo ngay từ ngày 01/10/2026 theo phân bổ: **Hokkaido 18M (6M/tháng)** và **3 Tuyến liên minh 27M (9M/tháng)**.
3. Kích hoạt toàn diện trên hệ thống ERP tại đường dẫn: `https://erp.fittour.vn/tai-lieu/thi-truong-bu2?tab=proposal`.
