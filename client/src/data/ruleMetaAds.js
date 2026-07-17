export const RULE_META_ADS_MARKDOWN = `
# Tổng Hợp Rule Meta Ads - FIT Tour

Tài liệu này tổng hợp các bộ quy tắc (Rules) bắt buộc và khuyến nghị khi thiết lập chiến dịch Meta Ads. Các quy tắc này được thiết kế để dễ dàng tra cứu nhanh, bạn có thể click vào "Xem chi tiết" để đọc giải thích chuyên sâu.

---

## Rule 0.1 – Đặt tên chính xác

**Yêu cầu:** Bắt buộc tuân thủ quy tắc đặt tên Campaign, Ad Set và Ad theo đúng chuẩn hệ thống của FIT Tour.

<a href="/tai-lieu/sop-meta-ads" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--blog-primary); color: white; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 10px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.15);">👉 Mở xem chi tiết SOP Đặt Tên Quảng Cáo</a>

---

## Rule 01 – Quy Mô Đối Tượng Cold Ads

**Yêu cầu:** Đối với các chiến dịch **Cold Ads**, quy mô đối tượng khuyến nghị nên đạt **từ 1.000.000 người trở lên**. Nếu nhỏ hơn 1.000.000 người, cần xem xét mở rộng Interest, Broad Audience hoặc bổ sung thêm các điều kiện Targeting phù hợp trước khi triển khai.

<details class="blog-rule-accordion">
<summary>Xem chi tiết (Mục tiêu, Lý do, Thiết lập)</summary>
<div class="blog-rule-content">

### 1. Mục tiêu
Đảm bảo Meta có đủ dữ liệu để học máy, tìm khách hàng mới và tối ưu phân phối hiệu quả.

### 2. Lý do
Với ngân sách phổ biến của FIT TOUR (**~200.000đ/ngày**), chiến dịch thường tạo khoảng **5.000–10.000 impressions/ngày**.
Nếu Audience quá nhỏ:
* Dễ bị lặp lại người xem (Frequency tăng nhanh).
* Không gian đấu giá bị hạn chế.
* Thuật toán có ít dữ liệu để khám phá khách hàng mới.
* Khó tối ưu và mở rộng ngân sách hiệu quả.

Audience lớn giúp Meta có nhiều lựa chọn hơn để tìm đúng người có khả năng chuyển đổi.

### 3. Thiết Lập Khuyến Nghị
Khi xây dựng Audience, **khuyến nghị bổ sung thêm bộ lọc Device Age** nếu quy mô đối tượng vẫn đủ lớn sau khi áp dụng.

**Đường dẫn:** \`Behavior → Người dùng thiết bị di động → Thời gian dùng thiết bị\`

Có thể kết hợp một hoặc nhiều nhóm:
- [ ] Sử dụng thiết bị di động **1–3 tháng**
- [ ] Sử dụng thiết bị di động **7–9 tháng**
- [ ] Sử dụng thiết bị di động **10–12 tháng**
- [ ] Sử dụng thiết bị di động **13–18 tháng**
- [ ] Sử dụng thiết bị di động **19–24 tháng**
- [ ] Sử dụng thiết bị di động **25 tháng trở lên**

Việc lựa chọn bao nhiêu nhóm phụ thuộc vào quy mô Audience sau khi lọc.
* Nếu Audience vẫn lớn (>1 triệu), có thể chọn các nhóm Device Age để tăng chất lượng tệp.
* Nếu Audience giảm xuống dưới ngưỡng khuyến nghị, ưu tiên mở rộng Audience trước, sau đó mới cân nhắc áp dụng Device Age.

### 4. Ví dụ
* Ngân sách: **200.000đ/ngày**
* CPM: **20.000 – 40.000đ**
→ Khoảng **5.000 – 10.000 impressions/ngày**

Nếu Audience chỉ **300.000 – 500.000 người**, quảng cáo dễ bị lặp lại nhanh.
Ngược lại, Audience **≥ 1.000.000 người** giúp phân phối ổn định và tối ưu tốt hơn.

### 5. Ngoại lệ
Không áp dụng cho:
* Remarketing.
* Lookalike Audience.
* Customer List.
* Khu vực địa lý nhỏ hoặc thị trường ngách.

> 💡 **Internal Tip**
>
> Ngưỡng **≥ 1.000.000 người** và việc kết hợp **Device Age** là Best Practice nội bộ của FIT TOUR, được tổng hợp từ kinh nghiệm vận hành và trao đổi với đội ngũ tư vấn Meta.
> 
> Đây **không phải quy định chính thức của Meta**, nhưng được sử dụng như tiêu chuẩn triển khai nhằm tạo nhiều không gian hơn cho thuật toán tối ưu và cải thiện chất lượng Lead.

</div>
</details>

---

## Rule 02 – Không Tạo Thêm Nhóm Quảng Cáo Chỉ Để Test Creative

**Yêu cầu:** Đối với cùng một Audience, cùng mục tiêu và cùng chiến lược phân phối: **Khi muốn tạo quảng cáo mới, phải ưu tiên thêm vào Campaign và Nhóm quảng cáo (Ad Set) liên quan đã có. Không tạo thêm Nhóm quảng cáo mới chỉ để thay đổi hình ảnh, video hoặc nội dung quảng cáo.**

<details class="blog-rule-accordion">
<summary>Xem chi tiết (Mục tiêu, Lý do, Ví dụ)</summary>
<div class="blog-rule-content">

### 1. Mục tiêu
Tập trung dữ liệu học máy vào một Nhóm quảng cáo duy nhất, giúp Meta tối ưu nhanh hơn và phân phối hiệu quả hơn.

### 2. Lý do
Mỗi **Nhóm quảng cáo (Ad Set)** là một môi trường học máy độc lập.

Khi tạo thêm nhiều Nhóm quảng cáo có cùng Audience nhưng chỉ khác Creative:
* Ngân sách bị phân mảnh.
* Dữ liệu chuyển đổi bị chia nhỏ.
* Mỗi Ad Set có ít cơ hội học máy hơn.
* Thời gian thoát Learning Phase lâu hơn.
* Khó xác định Creative nào thực sự hiệu quả.

Trong khi đó, khi thêm nhiều Ads vào cùng một Ad Set:
* Meta sẽ tự động phân phối nhiều ngân sách hơn cho Creative có hiệu quả tốt.
* Các Ads cùng chia sẻ một tập dữ liệu Audience.
* Hệ thống có nhiều dữ liệu hơn để tối ưu.
* Dễ mở rộng ngân sách (Scale) hơn.

Đây cũng là hướng Meta hiện nay khuyến khích: **giảm phân mảnh (Fragmentation), hợp nhất Ad Set (Consolidation) và để Creative cạnh tranh trong cùng một Ad Set**.

### 3. Ví dụ

**❌ Không khuyến nghị**
Campaign
* Ad Set 1 → Video Puja
* Ad Set 2 → Video Tiger's Nest
* Ad Set 3 → Video Farmhouse
* Ad Set 4 → Ảnh Mùa Thu

*(4 Ad Set cùng Audience, cùng ngân sách)*

**✅ Khuyến nghị**
Campaign
* Ad Set Cold
  * Video Puja
  * Video Tiger's Nest
  * Video Farmhouse
  * Ảnh Mùa Thu
  * Carousel
  * Review khách

*(Một Audience, nhiều Creative. Meta sẽ tự tối ưu ngân sách cho Creative hiệu quả nhất)*

### 4. Chỉ Tạo Nhóm Quảng Cáo Mới Khi
* Audience khác.
* Quốc gia hoặc khu vực khác.
* Placement khác.
* Mục tiêu tối ưu (Optimization Event) khác.
* Chiến lược giá thầu (Bid Strategy) khác.
* Ngân sách cần tách riêng để kiểm soát.

**Nếu đã có Campaign và Ad Set phù hợp, bắt buộc phải thêm Ads vào đó thay vì tạo mới.**

> 💡 **Internal Best Practice**
>
> Với ngân sách phổ biến của FIT TOUR (**200.000–500.000đ/ngày**), việc tập trung ngân sách vào **ít Ad Set nhưng nhiều Creative** thường giúp Meta học máy hiệu quả hơn so với việc chia nhỏ ngân sách thành nhiều Ad Set.
> 
> Đây cũng là quan điểm được nhiều Media Buyer và cộng đồng Reddit đồng thuận đối với các tài khoản có ngân sách nhỏ và trung bình.

</div>
</details>
`;
