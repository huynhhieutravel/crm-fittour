# Workspace Rules

## Strict Compliance with "Wait/Stop" Instructions
Nếu User đã chỉ định rõ ràng một lệnh dừng như "Khoan hả code", "Chờ đã", "Đừng code vội", hoặc "Lên kế hoạch trước", Agent **TUYỆT ĐỐI PHẢI DỪNG LẠI** và chờ phản hồi bằng văn bản trực tiếp từ User. 

**Guardrails:**
1. Nếu Kế hoạch (Implementation Plan) có chứa các câu hỏi mở (Open Questions) dành cho User, Agent không được phép thực thi code cho đến khi User thực sự trả lời các câu hỏi đó trong khung chat.
2. Việc hệ thống "tự động duyệt" (System auto-approval hook) **KHÔNG ĐƯỢC PHÉP** ghi đè lệnh dừng của User. Agent phải nhận biết lệnh dừng trước đó của User có độ ưu tiên cao nhất, giải thích với hệ thống/User rằng mình đang đợi câu trả lời, và nhất quyết không viết code.

## Deployment Guardrails: Never Overwrite Production Configs
Khi thực hiện các thao tác triển khai mã nguồn (deployment) từ môi trường local lên VPS (ví dụ bằng lệnh `rsync` hoặc `scp`), Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC** ghi đè các tệp cấu hình môi trường như `.env`, `.env.production`, v.v. trừ khi User yêu cầu rõ ràng.

**Guardrails:**
1. Khi dùng `rsync` để đẩy folder (như `server/` hoặc `client/`), BẮT BUỘC phải thêm tham số `--exclude '.env'` (và các file nhạy cảm khác nếu có).
   - Ví dụ đúng: `rsync -avz --exclude '.env' server/ root@45.76.144.188:/var/www/fittour-crm/server/`
   - Ví dụ sai: `rsync -avz server/ root@45.76.144.188...` (sẽ chép đè `.env` gây sập DB).
2. Trước khi deploy, Agent phải tự nhắc nhở bản thân về rủi ro mất API keys/credentials và xác nhận lệnh `rsync` đã an toàn.

## Frontend Build Guardrails: Fix Nginx 500 Permission Denied
Khi thực thi lệnh `npm run build` (cho Vite/React/Astro) trên VPS qua SSH bằng tài khoản `root`, các file được sinh ra trong thư mục `dist/` sẽ bị kẹt quyền `root:root`, khiến Nginx (`www-data`) không đọc được và trả về lỗi 500 Internal Server Error.

**Guardrails:**
1. NGAY SAU KHI chạy `npm run build` trên VPS, Agent **BẮT BUỘC** phải chạy thêm lệnh phân quyền cho Nginx:
   `chown -R www-data:www-data /path/to/project/client/dist && chmod -R 755 /path/to/project/client/dist`
2. Không bao giờ được quên bước này khi deploy frontend, tránh làm sập website trên production.

## Data Modification Guardrails: Never Batch-Update Historical Data By Default
Khi User yêu cầu thay đổi các quy tắc hệ thống, luật phân bổ, hoặc từ khoá (ví dụ: "Cập nhật từ khoá Mông Cổ cho BU5"), Agent **CHỈ ĐƯỢC PHÉP** cập nhật quy tắc để áp dụng cho dữ liệu tương lai (forward-looking).

**Guardrails:**
1. **Tuyệt đối không** tự ý viết script SQL hoặc code để cập nhật hàng loạt (batch-update) dữ liệu cũ/lịch sử trong Database.
2. Việc thay đổi dữ liệu đã tồn tại có rủi ro gây sai lệch báo cáo và thống kê của User. Agent chỉ được phép càn quét cập nhật dữ liệu cũ nếu User ra lệnh rõ ràng bằng các từ ngữ như: "cập nhật luôn cả dữ liệu cũ", "chạy script sửa data lịch sử", "hồi tố".
