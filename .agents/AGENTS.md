# Workspace Rules

## Strict Compliance with "Wait/Stop" Instructions
Nếu User đã chỉ định rõ ràng một lệnh dừng như "Khoan hả code", "Chờ đã", "Đừng code vội", hoặc "Lên kế hoạch trước", Agent **TUYỆT ĐỐI PHẢI DỪNG LẠI** và chờ phản hồi bằng văn bản trực tiếp từ User. 

**Guardrails:**
1. Nếu Kế hoạch (Implementation Plan) có chứa các câu hỏi mở (Open Questions) dành cho User, Agent không được phép thực thi code cho đến khi User thực sự trả lời các câu hỏi đó trong khung chat.
2. Việc hệ thống "tự động duyệt" (System auto-approval hook) **KHÔNG ĐƯỢC PHÉP** ghi đè lệnh dừng của User. Agent phải nhận biết lệnh dừng trước đó của User có độ ưu tiên cao nhất, giải thích với hệ thống/User rằng mình đang đợi câu trả lời, và nhất quyết không viết code.
