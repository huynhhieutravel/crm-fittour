# 0010. Executive AI Gateway Architecture (Curated Semantic Tools, Dual Protocol & Scoped RBAC)

Date: 2026-10-29

## Context
Ban lãnh đạo FIT TOUR (CEO, Giám đốc khối, Trưởng BU) có nhu cầu kết nối trực tiếp các trợ lý AI cá nhân (Claude Desktop, ChatGPT Custom GPTs, Cursor, Agentic workflows) vào dữ liệu ERP theo thời gian thực (live data) để truy vấn doanh thu, dòng tiền đoàn tour, công nợ D-7, hiệu quả marketing và tình trạng booking. Việc mở kết nối trực tiếp vào database hoặc dùng text-to-SQL tự do tiềm ẩn nguy cơ bảo mật nghiêm trọng (rò rỉ dữ liệu PII, bảng lương, lộ chi phí vốn), hallucinate công thức tài chính và khóa hiệu năng PostgreSQL.

## Decision
Chúng tôi quyết định xây dựng **Executive AI Gateway** đặt trực tiếp bên trong Node.js/Express backend hiện tại của FIT TOUR CRM (`server/`), tuân thủ các nguyên tắc cốt lõi:
1. **Curated Semantic Tools (Strict Read-Only)**: Tuyệt đối không mở Text-to-SQL hay truy vấn cơ sở dữ liệu tùy ý. Mọi dữ liệu cung cấp cho AI đều được chuẩn hóa qua các hàm nghiệp vụ (Semantic Tools) với công thức tài chính, timezone (Asia/Ho_Chi_Minh), và bộ lọc đối soát khớp 100% với báo cáo hiện hành (`ceoDashboardController`, `departureCashflowController`, `debtD7AlertEngine`).
2. **Dual-Protocol Surface (MCP Streamable HTTP + OpenAPI 3.0 REST)**: Cung cấp 2 cổng giao tiếp cùng trỏ vào một tầng Business Service (`aiGatewayService.js`):
   - Endpoint REST (`/api/ai-gateway/v1/...`) kèm file đặc tả schema (`/api/ai-gateway/openapi.json`) tương thích với ChatGPT Actions / Custom GPTs.
   - Endpoint Remote MCP Server qua chuẩn **Streamable HTTP transport** hiện hành tương thích với Claude Desktop, Claude Code và các tác nhân AI hiện đại.
3. **Personal Executive Token & Scoped Authorization**:
   - Sử dụng Bearer token cá nhân (`fit_ai_sec_...`) được mã hóa băm SHA-256 trong database (`executive_ai_tokens`), không lưu plaintext.
   - Kế thừa toàn bộ hệ thống phân quyền có sẵn (`teamScope.js`, `permCheck.js`): AI của CEO được xem toàn bộ công ty (Transparent BU Scope); AI của Trưởng BU chỉ được truy xuất trong phạm vi BU mình phụ trách.
   - Backend thẩm định quyền hạn trên từng request, không bao giờ tin cậy BU ID do AI tự khai báo. Hỗ trợ thu hồi (revoke) ngay lập tức và ghi lịch sử truy vết (`auditLogs`).
4. **PII Redaction Fence (Bảo vệ thông tin cá nhân)**:
   - Tự động che mờ số điện thoại, CCCD/hộ chiếu khách hàng trước khi payload rời khỏi server FIT TOUR sang hạ tầng LLM đám mây của bên thứ ba. Tuyệt đối không cho phép AI tự dùng cờ override để bypass bảo vệ PII.
   - Không ghi token, password hoặc PII thô vào hệ thống log.

## Considered Options
1. **Direct Database Connection / LangChain Text-to-SQL**: Bị loại bỏ vì nguy cơ sai lệch số liệu tài chính, chậm hệ thống, và rủi ro rò rỉ bảo mật.
2. **Separate Python/FastAPI Microservice**: Bị loại bỏ vì gây phân mảnh hạ tầng, phải nhân đôi toàn bộ logic nghiệp vụ, kết nối DB và phân quyền vốn đã ổn định trên Express.
3. **Legacy SSE Transport cho MCP**: Bị loại bỏ để chuyển sang chuẩn **Streamable HTTP** chuẩn hóa của MCP Foundation.

## Consequences
- Hệ thống ERP hiện hữu không bị ảnh hưởng hiệu năng nhờ rate-limiting và cơ chế query có index sẵn.
- Mọi Sếp đều có thể dùng AI riêng mà không lo ngại rò rỉ dữ liệu chéo phòng ban.
- Dễ dàng mở rộng sang các công cụ AI mới mà không cần sửa đổi lõi nghiệp vụ.

