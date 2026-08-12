# Workspace Rules

## Strict Compliance with "Wait/Stop" Instructions
Nếu User đã chỉ định rõ ràng một lệnh dừng như "Khoan hả code", "Chờ đã", "Đừng code vội", hoặc "Lên kế hoạch trước", Agent **TUYỆT ĐỐI PHẢI DỪNG LẠI** và chờ phản hồi bằng văn bản trực tiếp từ User. 

**Guardrails:**
1. Nếu Kế hoạch (Implementation Plan) có chứa các câu hỏi mở (Open Questions) dành cho User, Agent không được phép thực thi code cho đến khi User thực sự trả lời các câu hỏi đó trong khung chat.
2. Việc hệ thống "tự động duyệt" (System auto-approval hook) **KHÔNG ĐƯỢC PHÉP** ghi đè lệnh dừng của User. Agent phải nhận biết lệnh dừng trước đó của User có độ ưu tiên cao nhất, giải thích với hệ thống/User rằng mình đang đợi câu trả lời, và nhất quyết không viết code.

## Deployment Guardrails: FORBIDDEN RAW RSYNC
Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP** đề xuất hoặc chạy lệnh `rsync` hoặc `scp` thủ công (raw command) để deploy lên VPS. Việc dùng lệnh thô rất dễ quên `--exclude '.env'` và gây sập cấu hình Production.

**Guardrails:**
1. MỌI thao tác deploy (cả Backend và Frontend) BẮT BUỘC phải sử dụng script chuẩn hoá của dự án: `bash scripts/deploy_vps.sh`.
2. Không bao giờ cung cấp cho User một lệnh rsync thô. Nếu User yêu cầu deploy, hãy chạy lệnh `bash scripts/deploy_vps.sh` thay thế.

## VPS Deployment Guardrails: Fix Nginx 500 & 403 Permission Denied (Rsync + Build)
Khi deploy mã nguồn lên VPS qua lệnh `rsync -avz` (từ Mac OS) hoặc thực thi `npm run build` bằng quyền `root`, quyền sở hữu và phân quyền thư mục sẽ bị sai lệch (ví dụ: bị ép thành `501 staff` và `700`, hoặc `root:root`), khiến Nginx (`www-data`) bị chặn quyền truy cập từ vòng ngoài (gây lỗi 500 sập web hoặc 403 khi tải ảnh/tài liệu).

**Guardrails:**
1. NGAY SAU KHI chạy `rsync` hoặc `npm run build` trên VPS, Agent **BẮT BUỘC** phải chạy lệnh phân quyền cho TOÀN BỘ thư mục được deploy (cả `client` và `server`), KHÔNG CHỈ làm cho riêng thư mục `dist`:
   - Đối với Frontend: `chown -R www-data:www-data /path/to/project/client && chmod -R 755 /path/to/project/client`
   - Đối với Backend (nhằm bảo vệ `uploads/`): `chown -R www-data:www-data /path/to/project/server && find /path/to/project/server -type d -exec chmod 755 {} \; && find /path/to/project/server -type f -exec chmod 644 {} \;`
2. Không bao giờ được quên bước này khi deploy (bất kể là FE hay BE). Việc thiếu sót sẽ chặn đứng Nginx, không cho phục vụ thư mục tĩnh như `server/public/uploads` (ảnh lỗi) hoặc `client/dist` (web chết 500).

## Data Modification Guardrails: Never Batch-Update Historical Data By Default
Khi User yêu cầu thay đổi các quy tắc hệ thống, luật phân bổ, hoặc từ khoá (ví dụ: "Cập nhật từ khoá Mông Cổ cho BU5"), Agent **CHỈ ĐƯỢC PHÉP** cập nhật quy tắc để áp dụng cho dữ liệu tương lai (forward-looking).

**Guardrails:**
1. **Tuyệt đối không** tự ý viết script SQL hoặc code để cập nhật hàng loạt (batch-update) dữ liệu cũ/lịch sử trong Database.
2. Việc thay đổi dữ liệu đã tồn tại có rủi ro gây sai lệch báo cáo và thống kê của User. Agent chỉ được phép càn quét cập nhật dữ liệu cũ nếu User ra lệnh rõ ràng bằng các từ ngữ như: "cập nhật luôn cả dữ liệu cũ", "chạy script sửa data lịch sử", "hồi tố".

## Marketing Ads Data Guardrails
Khi viết script import hoặc xử lý dữ liệu báo cáo Facebook Ads (Marketing Ads), Agent BẮT BUỘC tuân thủ các nguyên tắc:
1. **Tuyệt đối không dùng từ khoá địa danh (keyword mapping) để phân loại BU**: Do các tuyến (Mông Cổ, Pakistan, v.v.) thường xuyên được điều chuyển giữa các BU, việc hardcode từ khoá sẽ dẫn đến phân sai dữ liệu.
2. **Quét trực tiếp Tag `[BU...]`**: Bắt buộc dùng Regex (vd: `/\[(BU\d+)\]/i`) ưu tiên trích xuất tên BU từ **Tên nhóm quảng cáo** (Ad Set Name) hoặc **Tên chiến dịch** (Campaign Name).
3. **Bẫy dòng "Tổng cộng" (Total row)**: File Excel xuất từ Meta Ads luôn có dòng đầu tiên là "Tổng số kết quả". Bắt buộc phải có lệnh bỏ qua dòng này (ví dụ: `if (!campaignName) continue;`) nếu không dữ liệu toàn hệ thống sẽ bị nhân đôi.
