# BÁO CÁO GIẢI TRÌNH CƠ SỞ DỰ TOÁN NGÂN SÁCH ADS BU5 & ĐỐI SOÁT ĐỊNH MỨC 1% DOANH THU (QUÝ 4/2026)

> **Người thực hiện:** Bộ phận Kế Hoạch & Marketing FIT Tour  
> **Kính gửi:** Ban Giám Đốc (CEO) & Trưởng Đơn vị Kinh doanh BU5 (Khám Phá & Độc Bản)  
> **Thời gian áp dụng:** Kế hoạch Quý 4/2026 & Mùa Đông 2026 - 2027  
> **Phạm vi thị trường:** Pakistan, Ai Cập, Ma Rốc, Bắc Cực Murmansk (Nga), Con Đường Tơ Lụa Trung Á  
> **Trạng thái:** Báo cáo giải trình nội bộ (Đồng bộ 100% Database ERP `marketing_budget_plans` & `tour_departures`)

---

## I. TỔNG QUAN DOANH THU KẾ HOẠCH & ĐỊNH MỨC 1% DOANH THU BU5

Trích xuất trực tiếp 100% từ bảng `marketing_budget_plans` và `tour_departures` của hệ thống ERP Production:
* **TỔNG SỐ ĐOÀN KHỞI HÀNH Q4/2026:** **8 Đoàn** (Tháng 10, Tháng 11 & Tháng 12/2026)
* **TỔNG SỐ KHÁCH MỤC TIÊU (TARGET PAX):** **91 Pax**
* **TỔNG DOANH THU KẾ HOẠCH:** **10.134.900.000 đ (~10.135 TỶ ĐỒNG)**
* **TỔNG CHI PHÍ GIÁ VỐN KẾ HOẠCH:** **8.107.920.000 đ (~8.108 TỶ ĐỒNG)**
* **TỔNG LÃI GỘP KẾ HOẠCH:** **2.026.980.000 đ (~2.027 TỶ ĐỒNG — Tỷ suất 20.00%)**
* **ĐỊNH MỨC CHI PHÍ MARKETING ADS 1% DOANH THU:** **101.349.000 đ (~101.35 Triệu / 3 tháng $\rightarrow$ Làm tròn: 100.000.000 đ)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 BẢNG ĐỐI CHIẾU CHỈ SỐ TÀI CHÍNH KẾ HOẠCH BU5 QUÝ 4/2026                     │
├──────────────────────────────────┬────────────────────────────┬─────────────────────────────┤
│ CHỈ SỐ                           │ SỐ LIỆU TOÀN QUÝ 4/2026    │ BÌNH QUÂN / THÁNG (3 THÁNG) │
├──────────────────────────────────┼────────────────────────────┼─────────────────────────────┤
│ Số lượng đoàn khởi hành          │ 8 Đoàn                     │ ~2.7 Đoàn / tháng           │
│ Quy mô khách mục tiêu            │ 91 Pax                     │ ~30.3 Pax / tháng           │
│ TỔNG DOANH THU KẾ HOẠCH          │ 10.134.900.000 đ (~10.14 Tỷ)│ ~3.378 Tỷ / tháng           │
│ Lãi gộp kế hoạch                 │ 2.026.980.000 đ (20.0%)    │ ~675.6 Triệu / tháng        │
│ ĐỊNH MỨC MKT 1% DOANH THU        │ 100.000.000 đ              │ ~33.33 Triệu / tháng        │
│ Tỷ lệ Ngân sách Ads / Lãi gộp    │ 4.93% (Rất an toàn < 15%)  │ 4.93%                       │
└──────────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

---

## II. CHI TIẾT 8 ĐOÀN KHỞI HÀNH BU5 TRÊN DATABASE ERP PRODUCTION

| STT | Mã Lịch Khởi Hành | Tên Tuyến & Sản Phẩm | Ngày Bay | Target | Giá Bán / Pax | Doanh Thu Đoàn | Lãi Gộp Đoàn | Đã Cọc | Tiền Cọc Đã Về |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `TRUNG Á-20261010` | Con Đường Tơ Lụa Trung Á (Kazakhstan - Kyrgyzstan - Uzbekistan) | 10/10/2026 | 10p | 105.000.000 đ | 1.050.000.000 đ | 210.000.000 đ | 1p | 40.000.000 đ |
| 2 | `Pakistan 2603` | Pakistan Mùa Thu - Thung lũng Hunza (Đợt 1) | 17/10/2026 | 11p | 76.400.000 đ | 840.400.000 đ | 168.080.000 đ | **11p** | **418.120.000 đ (FULL)** |
| 3 | `PAKISTAN12N11D-20261030` | Pakistan Mùa Thu - Thung lũng Hunza (Đợt 2) | 31/10/2026 | 11p | 76.400.000 đ | 840.400.000 đ | 168.080.000 đ | 0p | 0 đ (Đang giữ đoàn) |
| 4 | `MR11N10Đ-20261119` | Tour Ma Rốc 11N10Đ - Viên Ngọc Bắc Phi & Sa Mạc Sahara | 19/11/2026 | 15p | 109.900.000 đ | 1.648.500.000 đ | 329.700.000 đ | 4p | 120.000.000 đ |
| 5 | `AC9N8D-20261122` | Tour Ai Cập - Hành Trình Du Thuyền 5 Sao Sông Nile | 22/11/2026 | 12p | 94.900.000 đ | 1.138.800.000 đ | 227.760.000 đ | 3p | 85.000.000 đ |
| 6 | `(HAN)MURMANSK11N10Đ-20261209` | Nước Nga Vĩ Đại & Săn Cực Quang Murmansk (Hà Nội) | 09/12/2026 | 10p | 165.900.000 đ | 1.659.000.000 đ | 331.800.000 đ | 2p | 11.000.000 đ |
| 7 | `SGNMM` | Nước Nga Vĩ Đại & Săn Cực Quang Murmansk (Sài Gòn) | 09/12/2026 | 10p | 169.900.000 đ | 1.699.000.000 đ | 339.800.000 đ | 1p | 10.000.000 đ |
| 8 | `AC9N8D-20261220` | Tour Ai Cập Noel & Đón Năm Mới Du Thuyền 5 Sao | 20/12/2026 | 12p | 104.900.000 đ | 1.258.800.000 đ | 251.760.000 đ | 0p | 0 đ |
| **Σ**| **TỔNG CỘNG 8 ĐOÀN** | **KẾ HOẠCH TÀI CHÍNH QUÝ 4/2026** | — | **91p** | — | **10.134.900.000 đ**| **2.026.980.000 đ**| **22p** | **684.120.000 đ** |

---

## III. DỮ LIỆU LỊCH SỬ CHẠY ADS META THỰC TẾ (BẢNG `marketing_ads_reports`)

Hệ thống đã theo dõi 43 Adset chiến dịch Meta Ads dành riêng cho BU5 trong 2 tháng gần nhất (Tháng 8 & Tháng 9/2026):

* **Tổng ngân sách đã chi:** **56.464.843 đ**
* **Tổng số tin nhắn (Inbox):** **993 Tin nhắn** (Bình quân: 56.863 đ/msg)
* **Tổng Lead SĐT chất lượng cao:** **221 Lead** (Bình quân CPL: **255.497 đ/lead**)
* **Chi tiết theo từng thị trường:**
  1. **Pakistan:** Chi 17.906.689 đ $\rightarrow$ Thu về **83 Lead SĐT** (CPL: 215.743 đ/lead). Đây là chiến dịch đạt hiệu quả chuyển đổi cao nhất, giúp đoàn 17/10 full 11/11 cọc sớm 1 tháng.
  2. **Murmansk Cực Quang Nga:** Chi 4.432.533 đ $\rightarrow$ Thu về **31 Lead SĐT** (CPL: **142.985 đ/lead** — CPL siêu rẻ do hiệu ứng săn cực quang mùa đông cực kỳ thu hút giới thượng lưu).
  3. **Ai Cập:** Chi 14.359.170 đ $\rightarrow$ Thu về **34 Lead SĐT** (CPL: 422.329 đ/lead).
  4. **Ma Rốc:** Chi 13.356.057 đ $\rightarrow$ Thu về **40 Lead SĐT** (CPL: 333.901 đ/lead).
  5. **Mông Cổ:** Chi 6.410.394 đ $\rightarrow$ Thu về **33 Lead SĐT** (CPL: 194.254 đ/lead).

---

## IV. PHƯƠNG ÁN PHÂN BỔ 100 TRIỆU CHO 5 TUYẾN TRONG 3 THÁNG (Q4/2026)

Ngân sách **100.000.000 đ** được chia đều theo tỷ trọng tiềm năng và tiến độ khởi hành của 5 tuyến sản phẩm:

| Tuyến Tour | Số Đoàn | Ngân Sách Ads (3 Tháng) | Tỷ Trọng % | CPL Dự Kiến | Phễu Lead SĐT | Pax Ads Chốt (~8-10%) | Khách Đã Cọc | Tổng Pax Dự Kiến | Tải Đoàn (Pax / Ghế) | Doanh Thu Dự Kiến |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **❄️ Murmansk Nga (HAN + SGN)** | 2 đoàn | **28.000.000 đ** | 28.0% | 180.000 đ | **155 lead** | **~14 pax** | 3 cọc | **17 pax** | 17 / 20p (85.0%) | 2.854.300.000 đ |
| **☀️ Ai Cập Sông Nile (2 đoàn)** | 2 đoàn | **28.000.000 đ** | 28.0% | 380.000 đ | **74 lead** | **~7 pax** | 3 cọc | **10 pax** | 10 / 24p (41.7%) | 999.000.000 đ |
| **🏜️ Ma Rốc Bắc Phi (1 đoàn)** | 1 đoàn | **20.000.000 đ** | 20.0% | 320.000 đ | **63 lead** | **~6 pax** | 4 cọc | **10 pax** | 10 / 15p (66.7%) | 1.099.000.000 đ |
| **🏔️ Pakistan Hunza (2 đoàn)** | 2 đoàn | **16.000.000 đ** | 16.0% | 220.000 đ | **73 lead** | **~6 pax** | 11 cọc | **17 pax** | 17 / 22p (77.3%) | 1.298.800.000 đ |
| **🏛️ Trung Á Tơ Lụa (1 đoàn)** | 1 đoàn | **8.000.000 đ** | 8.0% | 250.000 đ | **32 lead** | **~3 pax** | 1 cọc | **4 pax** | 4 / 10p (40.0%) | 420.000.000 đ |
| **Σ TỔNG CỘNG 5 TUYẾN** | **8 đoàn** | **100.000.000 đ** | **100%** | **~251.800 đ** | **~397 lead** | **~36 pax** | **22 cọc** | **58 pax** | **58 / 91p (63.7%)** | **6.671.100.000 đ** |

---

## V. ĐÁNH GIÁ CHỈ SỐ AN TOÀN TÀI CHÍNH & LỢI NHUẬN RÒNG

1. **Doanh thu ghi nhận bảo chứng:**
   - Dựa trên **58 Pax** chắc chắn (22 cọc hiện hữu + 36 khách chốt từ Ads), doanh thu mang về đạt **~6.671.100.000 đ (~6.67 TỶ ĐỒNG)**.
   - Nếu tính theo lấp đầy 100% cả 8 đoàn (91 Pax), doanh thu đạt **10.134.900.000 đ (~10.135 TỶ ĐỒNG)**.
2. **Chỉ số an toàn ngân sách:**
   - **Tỷ lệ Ads / Doanh thu bảo chứng (~6.67 Tỷ):** **1.50%** *(Rất an toàn với dòng tour thám hiểm cao cấp)*.
   - **Tỷ lệ Ads / Doanh thu kế hoạch (10.14 Tỷ):** **0.99%** *(Chuẩn định mức 1%)*.
   - **Tỷ lệ Ads / Lãi gộp bảo chứng (~1.33 Tỷ):** **7.52%** *(Thấp hơn rất nhiều so với trần 15%)*.
   - **Tỷ lệ Ads / Lãi gộp kế hoạch (2.027 Tỷ):** **4.93%**.

---

## VI. 3 KỊCH BẢN ĐỀ XUẤT CHO BAN GIÁM ĐỐC

* **Kịch bản 1 (CEO Phê duyệt - Khuyến nghị): 100 Triệu / 3 Tháng (~33.3 Tr/tháng)**  
  Phân bổ toàn diện 5 tuyến, đón đầu mùa Cực quang Nga và Noel Ai Cập, thu về ~397 Lead SĐT, đạt 58/91 Pax (63.7% tải).
* **Kịch bản 2 (An toàn vốn): 60 Triệu / 3 Tháng (~20 Tr/tháng)**  
  Rút gọn ngân sách 40%, dồn toàn lực cho Murmansk (20M) và Ai Cập (16M), đạt 43/91 Pax (47.3% tải).
* **Kịch bản 3 (Mở rộng & Thống lĩnh): 150 Triệu / 3 Tháng (~50 Tr/tháng)**  
  Tăng ngân sách lên 1.48% doanh thu, chạy phủ sóng toàn quốc cả 2 đầu HAN & SGN, hướng tới lấp đầy 76/91 Pax (83.5% tải).

---
*Tài liệu được cập nhật tự động từ hệ thống ERP CRM FIT Tour ngày 03/10/2026.*
