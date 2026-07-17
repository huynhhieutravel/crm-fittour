export const SOP_ASTRO_TOUR_MARKDOWN = `
# SOP Chuyển Đổi Trang Tour: Elementor Sang Astro Native

Tài liệu này là quy chuẩn (Guard Rails) dành cho các Lập trình viên và AI Copilot khi thực hiện quá trình Migrate (Chuyển đổi) các trang Tour cũ (được dựng bằng Elementor/WordPress) sang hệ thống Astro Native mới của dự án.

Mục tiêu cốt lõi: **Xóa sạch toàn bộ HTML rác của Elementor, thay thế bằng các Native Component chuẩn của dự án.**

---

## 1. Cấu Trúc Khung Của Một Trang Tour Chuẩn

Một trang Tour chuẩn (ví dụ: \`tour-le-giang-6n5d.astro\`) BẮT BUỘC phải import \`BaseLayout\` và các Components hỗ trợ sau:

\`\`\`javascript
import { env } from 'cloudflare:workers';
import BaseLayout from '@/layouts/BaseLayout.astro';
import '@/styles/tour-landing.css'; // Bắt buộc import CSS scope

// Các Component Native
import TourUnfoldSection from '@/components/tour/TourUnfoldSection.astro';
import TourItinerary from '@/components/tour/TourItinerary.astro';
import TourItineraryItem from '@/components/tour/TourItineraryItem.astro';
import TourFAQ from '@/components/tour/TourFAQ.astro';
import TourFAQItem from '@/components/tour/TourFAQItem.astro';
import TourGallery from '@/components/tour/TourGallery.astro';
import TourSidebarPriceCard from '@/components/tour/TourSidebarPriceCard.astro';
\`\`\`

---

## 2. Các Native Components Cốt Lõi

Thay vì để nguyên các cục \`<div>\` rác của Elementor, hãy thay thế bằng các block dưới đây.

### 2.1. Khung "Điểm Nổi Bật" (Unfold Section)
Bọc nội dung giới thiệu tour (Sapo / Điểm nổi bật) vào trong thẻ \`<TourUnfoldSection>\` để tạo hiệu ứng thu gọn nội dung tự động nếu quá dài.

\`\`\`html
<TourUnfoldSection>
  <h3>Điểm nổi bật của chương trình:</h3>
  <ul>
    <li>Thăm quan Phố Cổ Lệ Giang, Ngọc Long Tuyết Sơn...</li>
    <li>Khách sạn 4 sao chuẩn quốc tế...</li>
  </ul>
</TourUnfoldSection>
\`\`\`

### 2.2. Lịch Trình Chi Tiết (Itinerary)
Dùng \`<TourItinerary>\` bao bọc bên ngoài. Mỗi ngày dùng một \`<TourItineraryItem>\`.

> **Quy định quan trọng:** Truyền thuộc tính \`open={true}\` cho Ngày 1 để ngày đầu tiên luôn mặc định sổ ra.

\`\`\`html
<TourItinerary>
  <TourItineraryItem day="Ngày 1: TP.HCM - Lệ Giang" open={true}>
    <p>Sáng: Xe đón quý khách ra sân bay...</p>
    <img src="/path-to-image.jpg" alt="Ngày 1" class="w-full h-auto rounded-lg my-4" />
  </TourItineraryItem>
  <TourItineraryItem day="Ngày 2: Lệ Giang - Ngọc Long Tuyết Sơn">
    <p>Sáng: Đoàn di chuyển đi cáp treo...</p>
  </TourItineraryItem>
</TourItinerary>
\`\`\`

### 2.3. Thông Tin Thêm (Bao Gồm / Không Bao Gồm / Lưu Ý)
Dùng \`<TourFAQ>\` bọc ngoài. Bên trong dùng \`<TourFAQItem>\`.
- Truyền \`type="success"\` cho mục "Bao Gồm" (Hiện icon check màu xanh).
- Truyền \`type="danger"\` cho mục "Không Bao Gồm" (Hiện icon chéo màu đỏ).
- Truyền \`type="info"\` (hoặc bỏ trống) cho mục "Lưu Ý / Chính Sách Hủy" (Hiện icon tròn chấm bi màu xanh).

\`\`\`html
<TourFAQ>
  <TourFAQItem title="Bao Gồm" type="success" open={true}>
    <ol>
      <li>Vé máy bay khứ hồi</li>
      <li>Khách sạn 4 sao</li>
    </ol>
  </TourFAQItem>
  
  <TourFAQItem title="Không Bao Gồm" type="danger">
    <ul>
      <li>Chi phí cá nhân (giặt ủi, điện thoại)</li>
      <li>Tiền Tip cho HDV</li>
    </ul>
  </TourFAQItem>

  <TourFAQItem title="Chính Sách Hủy Đổi" type="info">
    <ul>
      <li>Hủy trước 30 ngày: Mất cọc</li>
      <li>Hủy trước 15 ngày: Phạt 50%</li>
    </ul>
  </TourFAQItem>
</TourFAQ>
\`\`\`

### 2.4. Hình Ảnh Khách Hàng (Gallery Masonry)
Thay thế toàn bộ Elementor Gallery bằng \`<TourGallery>\`. Chỉ cần truyền vào mảng \`images\`.

\`\`\`html
<TourGallery 
  title="Hình ảnh thực tế đoàn Fit Tour"
  images={[
    { src: "https://media.fittour.vn/uploads/anh-1.jpg", alt: "Đoàn khách 1" },
    { src: "https://media.fittour.vn/uploads/anh-2.jpg", alt: "Đoàn khách 2" }
  ]} 
/>
\`\`\`

### 2.5. Sticky Price Card (Cột Báo Giá)
Dùng cho cột bên phải (Sidebar) hiển thị giá cố định khi cuộn chuột.

\`\`\`html
<div class="tour-sidebar-col w-full lg:w-[35%] relative">
  <div class="sticky top-[100px]">
    <!-- Có thể nhúng thẻ Ảnh thu nhỏ của Tour tại đây nếu cần thiết -->
    
    <TourSidebarPriceCard 
      price="15.990.000 ₫" 
      duration="6 Ngày 5 Đêm" 
    />
  </div>
</div>
\`\`\`

---

## 3. Checklist Dành Cho AI Khi Migrate

Khi có Request Migrate Tour, AI cần check kỹ:

1. **Xóa toàn bộ Class rác:** Không để lại bất kỳ \`class="e-con"\`, \`elementor-widget\` nào. 
2. **Xóa Data Attributes:** Các thẻ HTML không được chứa thuộc tính \`data-element_type="..."\` hay \`data-id\`.
3. **Tuyệt đối không dùng \`set:html\`:** Mọi nội dung text tĩnh, hình ảnh phải đưa thẳng ra HTML Native.
4. **Giữ nguyên \`elementor-tour-wrapper\`:** Thẻ \`<main>\` lớn nhất của khối Tour **vẫn phải giữ lại class \`elementor-tour-wrapper\`** (vì file \`tour-landing.css\` được viết CSS Scope theo ID này).
5. **Cơ chế nạp JS GLightbox an toàn:** Sử dụng block script chuẩn (cần dùng \`initScripts()\` và lắng nghe \`astro:page-load\`) ở dưới cùng của Layout để kích hoạt Modal và Lightbox.

`
