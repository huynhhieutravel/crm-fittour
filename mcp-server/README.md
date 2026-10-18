# FIT Tour CRM & Marketing Ads - MCP Server & GPT Integration Guide

Hệ thống cung cấp **2 phương thức kết nối** dữ liệu Marketing Ads & CRM cho AI (ChatGPT, Claude, Cursor, Antigravity IDE):
1. **Model Context Protocol (MCP) Server**: Dành cho Claude Desktop, Cursor, Antigravity IDE, Cline, hoặc ChatGPT Desktop macOS.
2. **ChatGPT Custom GPT Actions (Web & Mobile)**: Dành cho việc tạo Custom GPT trực tiếp trên [chatgpt.com](https://chatgpt.com) gọi API trực tiếp vào `https://erp.fittour.vn`.

---

## PHẦN 1: Cấu hình MCP Server (Claude Desktop / Cursor / Antigravity IDE)

Thư mục MCP Server nằm tại: `/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/mcp-server`

### 1. Claude Desktop (macOS)
Mở hoặc tạo file cấu hình Claude Desktop:
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```
Thêm đoạn cấu hình sau:
```json
{
  "mcpServers": {
    "fittour-marketing": {
      "command": "node",
      "args": [
        "/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/mcp-server/index.js"
      ],
      "env": {
        "DATABASE_URL": "postgres://localhost:5432/fittour_local"
      }
    }
  }
}
```
*Khởi động lại Claude Desktop, bạn sẽ thấy biểu tượng chiếc búa (Tools) với đầy đủ 8 công cụ tra cứu số liệu.*

### 2. Cursor IDE
1. Mở **Cursor Settings** -> **Features** -> **MCP**.
2. Bấm **+ Add New MCP Server**.
3. Điền thông tin:
   - **Name**: `fittour-marketing`
   - **Type**: `command`
   - **Command**: `node /Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/mcp-server/index.js`
4. Lưu và bật kết nối.

### 3. Antigravity IDE
File cấu hình MCP nằm tại `~/.gemini/antigravity-ide/mcp_config.json`:
```json
{
  "mcpServers": {
    "fittour-marketing": {
      "command": "node",
      "args": [
        "/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/mcp-server/index.js"
      ]
    }
  }
}
```

---

## PHẦN 2: Cấu hình Custom GPT trên ChatGPT Web (chatgpt.com)

Nếu bạn muốn tạo một con GPT chuyên dụng trên ChatGPT Web để cả team hoặc bản thân chat mọi lúc mọi nơi trên điện thoại & trình duyệt:

### Bước 1: Tạo Custom GPT
1. Truy cập [ChatGPT](https://chatgpt.com), chọn **Explore GPTs** -> **+ Create**.
2. Đặt tên: **FIT Tour Marketing Analyst & Forensic Auditor**.
3. Mô tả: *Chuyên gia phân tích dữ liệu hiệu suất Marketing Ads, ngân sách, số leads, và kiểm định pháp y báo cáo của FIT Tour.*

### Bước 2: Thiết lập Instructions (Lời nhắc chỉ đạo)
Dán đoạn prompt mẫu sau vào ô **Instructions**:
```text
Bạn là Trợ lý Dữ liệu Marketing Ads & CRM cấp cao của FIT Tour.
Nhiệm vụ của bạn là truy xuất dữ liệu từ các Action API của FIT Tour ERP để phân tích hiệu suất quảng cáo, phát hiện bất thường, so sánh KPI và đề xuất giải pháp tối ưu.

Quy tắc phân tích:
1. Luôn dẫn chứng số liệu thực tế: Chi tiêu (VND), Số tin nhắn, Số Lead, CPL Lead, CPL Tin nhắn.
2. Phân loại chuẩn 4 đơn vị kinh doanh:
   - BU1: Âu Úc Mỹ
   - BU2: Hành hương & Sự kiện
   - BU4: FIT Tour Adventure
   - BU5: Khám phá & Tour Độc lạ
3. Chú ý hiện tượng Bẫy phễu rộng (Broad Funnel Paradox): Tin nhắn cao bất thường nhưng tỷ lệ ra số Lead thấp.
4. Trả lời mạch lạc bằng bảng Markdown và các gạch đầu dòng chiến lược hành động.
```

### Bước 3: Thêm Action API
1. Kéo xuống mục **Actions**, bấm **Create new action**.
2. Chọn **Import from URL**, dán đường link OpenAPI:
   ```text
   https://erp.fittour.vn/docs/marketing-ads-openapi.json
   ```
    *(ChatGPT sẽ tự động đọc 7 endpoints: summary, crm-phone-audit, weekly-audit, search, top-tours, mom-trends, crm-leads-summary).*
3. Trong phần **Authentication**:
   - Chọn **API Key**.
   - **Auth Type**: `Bearer`.
   - **API Key**: Nhập mã token bí mật `GPT_API_KEY` của hệ thống.
4. Bấm **Save** (hoặc **Publish** ở chế độ *Only me* hoặc *Anyone with a link*).

---

## PHẦN 3: Danh sách các công cụ (Tools) được cung cấp

| Tên Tool | Chức năng chính |
| :--- | :--- |
| `get_marketing_monthly_summary` | Tổng quan ngân sách, tin nhắn, lead báo cáo, lead SĐT thực tế từ CRM, CPL và KPI theo từng BU và toàn công ty. |
| `get_crm_phone_audit` | **[MỚI]** Kiểm định pháp y phễu 2 tầng: Đối chiếu Tier 1 (427 form leads) vs Tier 2 (673 lead có SĐT thực tế CRM), CPL thực 145.018 đ, phân bổ theo tuần W1-W4 và điểm nghẽn BU4. |
| `get_bu_performance_detail` | Phân tích sâu 1 BU cụ thể (BU1, BU2, BU4, BU5): mục tiêu vs thực tế, tiến độ theo tuần, danh sách campaign. |
| `get_weekly_audit` | Kiểm định pháp y theo tuần (W1-W5): tự động bẫy dị biệt, cảnh báo CPL nhảy vọt hoặc tin nhắn ảo. |
| `query_campaigns_and_adsets` | Tra cứu linh hoạt theo từ khóa điểm đến (vd: *Ladakh*, *Mông Cổ*, *Nga*, *Cáp Nhĩ Tân*, *Ai Cập*...). |
| `get_top_performing_tours` | Xếp hạng top chiến dịch hiệu quả nhất (Winners - CPL rẻ) và tốn kém nhất (Bleeders - CPL cao). |
| `get_mom_trends` | So sánh biến động liên tháng (Month-over-Month) giữa các tháng (ví dụ: T7, T8, T9). |
| `get_crm_leads_analytics` | Thống kê số lượng lead trong CRM: tỷ lệ thu thập số điện thoại, trạng thái xử lý, tỷ lệ chốt đơn. |
| `execute_read_only_query` | Cho phép GPT chạy các câu lệnh SQL `SELECT` an toàn trực tiếp vào database để trả lời bất kỳ câu hỏi ngẫu hứng nào. |

---

## PHẦN 4: Câu hỏi mẫu gợi ý để test với GPT

1. *"Cho tôi xem báo cáo tổng quan Marketing Ads tháng 9/2026 của FIT Tour."*
2. *"Đối chiếu số lead có SĐT thực tế trong CRM tháng 9/2026 xem toàn công ty thu thập được bao nhiêu số điện thoại và CPL thực tế là bao nhiêu?"*
3. *"BU nào trong tháng 9 có chi phí CPL cao nhất và nguyên nhân là gì?"*
4. *"Tìm cho tôi tất cả các nhóm quảng cáo chạy tour Ladakh trong tháng 9, chi tiêu bao nhiêu và CPL thế nào?"*
5. *"Kiểm tra pháp y theo tuần của tháng 9 xem có tuần nào bị bẫy phễu rộng không?"*
6. *"So sánh hiệu suất chi tiêu và số leads giữa tháng 7, tháng 8 và tháng 9 năm 2026."*
