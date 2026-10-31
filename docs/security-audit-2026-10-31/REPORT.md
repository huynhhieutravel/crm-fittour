# Đánh giá bảo mật và QA CRM FIT TOUR

Ngày đánh giá: **31/10/2026**, múi giờ Asia/Ho_Chi_Minh. Commit được kiểm tra: `4921b6483bb9ec466b77e8ef3154616351efccfa`.

**Kết luận: FAIL về bảo mật.** Có **17 nhóm phát hiện: 4 nghiêm trọng, 11 cao, 2 trung bình**. Ưu tiên xử lý việc cấp token admin, media không xác thực, đọc file qua RAG và sửa tài khoản người khác. Đây là kết luận đối với mã nguồn và kiểm thử cách ly; chưa xác nhận toàn bộ các đường khai thác có truy cập được trên production hay chưa. Không có bằng chứng trong lần đánh giá này để kết luận đã xảy ra xâm nhập.

## Phạm vi và độ chắc chắn

Đã khảo sát cấu trúc 79 file route và 68 controller; đọc sâu các vùng auth/RBAC, users, bookings, customers, vouchers, reservations, media, API công khai, Facebook/Zalo/Telegram, RAG/AI gateway, WebSocket, logging, frontend và deployment. Không phải mọi nhánh trong tất cả controller đã được kiểm thử.

- **Tái hiện cách ly:** chạy mã controller/middleware thực với database và filesystem giả; không nạp `.env`, không gọi database thật, không gửi tin nhắn. Riêng test Zalo kiểm tra route thực với controller giả để chứng minh thiếu chặn xác thực tại router.
- **Đọc mã:** xác định đường đi và điều kiện lỗi; chưa kiểm thử khai thác trên hệ thống triển khai.
- **Phụ thuộc cấu hình:** cần xác minh firewall, reverse proxy, biến môi trường hoặc tính năng đang bật trước khi kết luận phơi lộ thực tế.

Không sửa logic ứng dụng, không deploy, không thay đổi dữ liệu lịch sử. Chỉ thêm báo cáo và script tái hiện. Không đưa mật khẩu, token, thông tin khách hàng thật vào báo cáo.

## Các phát hiện ưu tiên

| ID | Mức độ | Phần | Vấn đề | Bằng chứng |
|---|---|---|---|---|
| S01 | Nghiêm trọng | Auth | Dev-login cấp token admin khi vượt điều kiện localhost | Tái hiện |
| S02 | Nghiêm trọng | Media | Liệt kê/upload/xóa file thiếu xác thực và quyền sở hữu | Tái hiện xóa; đọc mã các nhánh còn lại |
| S03 | Nghiêm trọng | RAG | Path traversal đọc file; khóa mặc định công khai khi thiếu env | Tái hiện cả hai |
| S04 | Nghiêm trọng | Users | Nhân viên sửa tài khoản khác, kể cả thông tin admin | Tái hiện |
| S05 | Cao | Hợp đồng | API public dùng ID tuần tự, trả booking và phiếu thu | Tái hiện |
| S06 | Cao | CRM/tài chính | Quyền `view_own`/`edit_own` không được ràng buộc đầy đủ với bản ghi | Tái hiện đọc booking; đọc mã các nhánh còn lại |
| S07 | Cao | RBAC | `permCheckAny` bỏ qua override cá nhân `false` | Tái hiện |
| S08 | Cao | Phiên đăng nhập | Token cũ tiếp tục dùng sau khóa tài khoản/đổi quyền/mật khẩu | Tái hiện middleware; đọc mã vòng đời token |
| S09 | Cao | Zalo | Sandbox và điều khiển OA/AI thiếu xác thực | Test router; đọc mã controller |
| S10 | Cao | Webhooks | Facebook/Zalo/Telegram thiếu kiểm chứng nguồn sự kiện | Đọc mã |
| S11 | Cao | WebSocket | Kết nối ẩn danh nhận broadcast dữ liệu CRM | Đọc mã |
| S12 | Cao | Bí mật/log | Git theo dõi log có trường mật khẩu; gateway secret trong mã | Kiểm tra file tracked, chỉ đọc tên trường |
| S13 | Cao | Nhân sự | Danh bạ trả CCCD, địa chỉ, link hộ chiếu cho mọi user đăng nhập | Đọc mã |
| S14 | Cao | Dependencies | Audit production dependencies báo nhiều package bị ảnh hưởng | npm audit và đường dùng PDF |
| S15 | Cao | Giữ chỗ | Endpoint tạo reservation không yêu cầu đăng nhập | Đọc mã |
| S16 | Trung bình | Google OAuth | Thiếu state ràng buộc phiên; JWT xuất hiện trong URL | Đọc mã |
| S17 | Trung bình | Deployment | Script chưa dừng chắc chắn khi lỗi; quyền file bí mật quá rộng | Đọc mã |

### S01 — Dev-login có thể cấp quyền admin không cần mật khẩu

Vị trí: `server/controllers/authController.js:58`, `server/routes/auth.js:7`, `server/index.js:44`.

Điều kiện chặn chỉ áp dụng khi `NODE_ENV === 'production'` **và** request không bị nhận diện là localhost. Việc nhận diện dựa trên `req.hostname` hoặc `req.ip`, trong khi ứng dụng bật `trust proxy = 1`. Host hoặc forwarded headers là dữ liệu của request; khi proxy/đường truy cập cho phép, chúng có thể khiến điều kiện localhost vượt qua. Nếu `NODE_ENV` không phải production thì endpoint mở cho mọi nguồn. Dev-login cũng không kiểm tra `is_active` của admin được chọn.

Test cách ly đặt production và IP chuyển tiếp ngoài mạng: Host bình thường trả 403; đổi Host thành localhost trả 200 và token có role admin. Khả năng tới endpoint trên production phụ thuộc proxy có chuẩn hóa Host/forwarded headers và firewall hay không.

**Khắc phục:** bỏ hoàn toàn route bypass khỏi production; bật dev-login bằng cờ riêng chỉ trong môi trường phát triển và chỉ bind loopback. Không dùng Host để xác định môi trường tin cậy. Kiểm tra lại proxy chain. Sau khi sửa, vô hiệu hóa các phiên admin cũ có nguy cơ được cấp qua đường này.

**Tiêu chí đóng:** production luôn trả 404/403 với mọi Host, X-Forwarded-Host, X-Forwarded-For; thiếu cấu hình môi trường không được mở bypass.

### S02 — Media không có hàng rào xác thực, phân quyền

Vị trí: `server/routes/media.js:27`, `:40`, `:56`, `:94`, `:111`; mount trực tiếp tại `server/index.js`.

Các API upload, liệt kê, xóa và bulk-delete không gắn auth/RBAC. Danh sách media cung cấp đường dẫn cùng nhãn liên quan phiếu thu/hộ chiếu. Test ẩn danh gọi bulk-delete đã đi tới `unlinkSync` trong filesystem giả và trả xóa thành công. Không có thao tác xóa file thật.

Ngoài ra, `/uploads` được phục vụ tĩnh công khai, và server tự tạo symlink trong frontend dist. Vì thế chỉ thêm auth cho API liệt kê vẫn chưa bảo vệ file đã lộ URL. Bộ lọc upload tin `file.mimetype` do client gửi, giữ đuôi từ tên file, cho `image/*` gồm SVG và giới hạn 80 MB/file. Điều này cho phép file sai nội dung/đuôi và rủi ro nội dung chủ động hoặc lấp đầy ổ đĩa. Việc thực thi script phụ thuộc CSP và cách Nginx phục vụ file; chưa kiểm thử trình duyệt.

**Khắc phục:** auth + quyền theo thao tác + quyền sở hữu file; đưa hộ chiếu/phiếu thu ra kho private và trả download đã kiểm quyền hoặc signed URL ngắn hạn. Allowlist loại file/đuôi, xác thực magic bytes, chặn hoặc xử lý SVG, đặt quota người dùng và giới hạn phù hợp. Xóa chỉ qua ID metadata trong DB.

**Tiêu chí đóng:** ẩn danh không list/upload/delete; user A không truy cập/xóa file B; URL trực tiếp tới tài liệu private bị chặn; file giả MIME bị từ chối.

### S03 — RAG có thể đọc file ngoài thư mục tài liệu

Vị trí: `server/controllers/ragController.js:236`, `server/middleware/ragAuth.js:10`.

`id` có tiền tố `sotay_` được nối vào đường dẫn và đọc bằng `fs.readFileSync` mà không kiểm tra containment hay danh sách tài liệu hợp lệ. Test `sotay_../server/.env` đã làm controller chọn đường dẫn `server/.env` trong filesystem giả và trả nội dung giả. Chưa đọc file bí mật thật.

Đồng thời, khi thiếu `RAG_API_KEY`, middleware dùng một khóa cố định nằm trong source. Test xác nhận khóa mặc định được chấp nhận. Nếu production có khóa mạnh riêng thì traversal vẫn tồn tại với người có khóa; nếu chưa cấu hình thì hai lỗi nối thành đường đọc bí mật bằng khóa công khai.

**Khắc phục:** resolve đường dẫn rồi xác nhận nằm trong thư mục cho phép, chặn symlink thoát thư mục, chỉ nhận ID từ catalog tài liệu, không cho nhập đường dẫn. Thiếu secret phải từ chối hoặc dừng khởi động. Nếu xác minh endpoint từng phơi lộ, xoay vòng các bí mật có thể đọc bằng quyền tiến trình, bao gồm khóa ký JWT.

**Tiêu chí đóng:** mọi `../`, encoded traversal, đường dẫn tuyệt đối và symlink ra ngoài bị chặn; thiếu env không xác thực được bằng khóa mặc định.

### S04 — Update user thiếu kiểm quyền thao tác và phạm vi nhân sự

Vị trí: `server/routes/users.js:35`, `server/controllers/userController.js:214`; `server/middleware/teamScope.js`, hàm `getAllowedRolesForManager`.

`PUT /api/users/:id` chỉ yêu cầu đăng nhập. Controller chặn manager sửa admin, nhưng không chặn role sales; kiểm tra quyền gán role chỉ diễn ra nếu role mới khác role hiện tại. Một sales có thể gửi lại `role_id` hiện có để đổi email, trạng thái hoạt động, BU và thông tin khác của tài khoản mục tiêu. Test sales sửa admin giữ nguyên role_id trả 200, bao gồm ghi `is_active=false` trong DB giả. Việc đổi email còn ảnh hưởng ánh xạ Google login, cần kiểm tra kịch bản chiếm tài khoản sau khi sửa.

Helper cho manager lấy mọi role, gồm admin; các luồng tạo user/đổi role cần kiểm tra lại việc manager có được phép nâng quyền thành admin theo chính sách thực tế hay không.

**Khắc phục:** chặn tại route bằng permission riêng; kiểm quyền actor-target và team/BU trong controller trước mọi thao tác; tách self-profile với quản trị nhân sự; allowlist trường theo vai trò; cấm nâng quyền admin ngoài quyền chuyên biệt. Xác minh email mới trước khi dùng để đăng nhập.

**Tiêu chí đóng:** sales không sửa user khác; lead chỉ sửa đúng team và đúng trường; manager không tạo hoặc gán admin nếu không được ủy quyền; audit ghi đủ actor/target.

### S05 — Hợp đồng công khai bị truy cập bằng ID

Vị trí: `server/routes/publicContracts.js:10`, `:51`.

Cả JSON và xuất DOCX dùng `tourId/bookingId` mà không auth, share token hay thời hạn. JSON lấy `SELECT *` từ booking, tour và payment_vouchers. Dữ liệu có thể gồm thông tin khách, danh sách thành viên, số định danh và tài chính. Test không có Authorization trả booking/phiếu thu giả bằng đúng ID.

**Khắc phục:** dùng share token ngẫu nhiên có expiry/revoke và scope một hợp đồng; chỉ trả các trường cần công khai. Đổi toàn bộ liên kết ở frontend; không để endpoint ID cũ vẫn hoạt động.

**Tiêu chí đóng:** biết hai ID vẫn không lấy được dữ liệu; token chỉ mở đúng hợp đồng, hết hạn/thu hồi không dùng được; JSON và DOCX có cùng kiểm quyền.

### S06 — Quyền own chỉ được kiểm ở cửa vào, chưa gắn với bản ghi

Vị trí: `server/routes/bookings.js`; `server/controllers/bookingController.js:257`, `:350`, `:668`; `server/controllers/customerController.js:216`; `server/controllers/voucherController.js:147`, `:166`.

Các route cho phép `view_own`/`edit_own`, nhưng nhiều controller truy vấn bằng ID mà thiếu điều kiện sở hữu. Test user 101 có view_own đọc được booking giả thuộc sale_id 202. Đọc mã thấy update booking/passenger cũng không kiểm chủ booking; customer detail tương tự. Danh sách phiếu thu lấy tới 2.000 bản ghi mà không lọc user dù route nhận view_own.

**Khắc phục:** hàm kiểm scope chung, áp vào list/detail/subresource/write và SQL; passenger, voucher, transaction phải kiểm booking/visa cha. Không dựa vào việc UI có ẩn nút hay không.

**Tiêu chí đóng:** ma trận A/B khác sale, team, BU cho list/detail/update/passenger/voucher đều từ chối theo policy; trả 403 hoặc 404 nhất quán.

### S07 — Quyền từ chối cá nhân bị role cấp lại

Vị trí: `server/middleware/permCheck.js:177–207`.

`permCheckAny` chỉ dừng khi override là true; override false vẫn rơi xuống quyền mặc định của role. Khác với `permCheck` và `getUserMergedPerms`, logic này khiến quyền bị thu hồi vẫn dùng được. Test override false + role true nhận 200.

**Khắc phục:** nếu tồn tại override thì dùng kết quả đó cho permission hiện tại; false phải bỏ qua role cho permission đó và xét cặp quyền tiếp theo. Dùng chung bộ tính quyền cho middleware/controller/UI. Khi v2 lỗi, tránh fallback v1 làm mất quyết định deny.

**Tiêu chí đóng:** deny cá nhân thắng role allow ở mọi middleware; nếu một permission khác trong danh sách được cấp hợp lệ thì vẫn cho phép đúng chính sách.

### S08 — Token cũ không bị thu hồi kịp thời

Vị trí: `server/utils/jwt.js:32`, `server/middleware/auth.js`, nhánh admin bypass của `permCheck`, `server/controllers/userController.js:308`.

Access token sống 14 ngày; auth chỉ kiểm chữ ký và claim, không kiểm user còn tồn tại/active hay version phiên. Các chỗ admin bypass tin role trong token. Khóa user, đổi mật khẩu, hạ role không khiến token cũ hết hiệu lực ngay. Test token được ký hợp lệ vẫn đi qua auth mà không có một query kiểm trạng thái tài khoản. Refresh có kiểm DB, nhưng kẻ giữ token không buộc phải refresh.

Test bổ sung cho thấy verifier còn chấp nhận token được ký đúng nhưng thiếu exp và typ. Đây là lỗ hổng kiểm chặt claim, không có nghĩa người ngoài tự ký được token.

**Khắc phục:** kiểm trạng thái/version tài khoản trước cấp quyền, thu hồi phiên khi khóa user/đổi mật khẩu/quyền; access token ngắn hơn kết hợp refresh được quản lý; yêu cầu đầy đủ claim bắt buộc. Mẫu kiểm live-user của Executive AI auth là hướng có thể chuẩn hóa cho API thường.

**Tiêu chí đóng:** token phát trước khóa/hạ quyền/đổi mật khẩu bị từ chối ngay; token thiếu exp bị từ chối; không có admin bypass dựa duy nhất vào claim cũ.

### S09 — API điều khiển Zalo thiếu auth

Vị trí: `server/routes/zalo_v2.js`, `server/controllers/zaloV2Controller.js:903` trở đi.

Các route đọc tin, reply, xóa hội thoại, refresh token, toggle AI và gửi ZNS demo không gắn xác thực/permission. Controller dùng file token OA của hệ thống cho thao tác gửi. Test router xác nhận request ẩn danh đi đến controller đọc/gửi/xóa; controller trong test là stub, nên không có tin nhắn thật được gửi.

**Khắc phục:** tách webhook/OAuth callback public khỏi chức năng nhân viên; gắn auth/RBAC và scope lead cho inbox; quyền quản trị riêng cho token, gửi demo và AI settings; kiểm OAuth state.

**Tiêu chí đóng:** ẩn danh không đọc/gửi/xóa/toggle/refresh; nhân viên không thao tác hội thoại ngoài phạm vi; callback giả không thay token OA.

### S10 — Webhook không kiểm chứng sự kiện đầu vào

Vị trí: `server/routes/webhook.js`, `server/controllers/webhookController.js:39`; `server/controllers/telegramController.js:16`; `server/controllers/zaloV2Controller.js`, hàm `handleWebhook`.

Không thấy kiểm chữ ký Facebook, xác thực MAC/chữ ký Zalo hoặc Telegram secret header trước xử lý. GET verify-token của Facebook chỉ là bước đăng ký, không xác thực POST sự kiện. Telegram xử lý callback claim/unclaim lead dựa dữ liệu người dùng trong body. Giả sự kiện có thể làm sai hội thoại, phân lead và kích hoạt xử lý nền. Chưa bắn sự kiện giả lên dịch vụ thật.

**Khắc phục:** kiểm chữ ký đúng quy định nhà cung cấp với raw body trước parse/xử lý; Telegram dùng secret_token/header và kiểm đúng chat/user; chống replay/duplicate theo event ID và timestamp. Chặn `/telegram/set-webhook` khỏi public.

**Tiêu chí đóng:** sai/thiếu chữ ký trả 401/403 trước DB và outbound; event hợp lệ xử lý một lần; replay không tạo lead/tin nhắn lặp.

### S11 — Broadcast WebSocket không có xác thực/scope

Vị trí: `server/index.js:33`, `:317`; `server/services/facebookService.js:697`; `server/controllers/globalActivityController.js:61`.

Socket.IO cho origin `*`, không có middleware auth, còn `global.io.emit` phát `customer_new_message` với tên người gửi, text, leadId, assigned_to và BU; hoạt động toàn cục cũng broadcast. Khi socket endpoint truy cập được, người chưa đăng nhập có thể nghe dữ liệu. Các lệnh gửi tới room `user_*` không thấy logic join room ở index, nên cũng cần kiểm tra tính đầy đủ của thông báo cá nhân.

**Khắc phục:** xác thực handshake, kiểm user còn hoạt động, join room phía server theo quyền; thay broadcast toàn cục bằng room user/team/BU; whitelist origin và giới hạn kết nối/message. CORS không thay thế xác thực WebSocket.

**Tiêu chí đóng:** client không token bị ngắt; A không nghe event B; token hết hạn/thu hồi kết nối bị chặn hoặc đóng.

### S12 — Log và bí mật đã nằm trong Git

Vị trí: các file tracked `server/logs/recovery_2026-07-10.jsonl`, `recovery_2026-07-19.jsonl`, `recovery_2026-07-24.jsonl`, `recovery_2026-08-19.jsonl`; `zalo_gateway_php/config.php:3`; `server/index.js:114–137`.

Kiểm tra tên trường trong log cho thấy body có `username,password`. Gateway shared secret là literal trong file tracked. `fittour.db` và `server/crm.db` cũng đang tracked; chưa phân tích nội dung hai DB để kết luận dữ liệu bên trong. `.gitignore` hiện có không loại bỏ file đã được Git theo dõi.

Logger hiện bỏ qua `/auth/` nhưng vẫn ghi nguyên body các POST/PUT/PATCH khác: đổi mật khẩu user dùng `newPassword`, settings có token, nghiệp vụ có dữ liệu hộ chiếu. URL đầy đủ cũng được log, bao gồm query có thể chứa token. Giá trị bí mật không được hiển thị trong lần đánh giá.

**Khắc phục:** đổi gateway secret và các mật khẩu/token xác nhận từng bị log; redaction theo danh sách trường và loại endpoint; log metadata thay payload. Gỡ file nhạy cảm khỏi tracking; lập phương án làm sạch lịch sử Git và các bản sao sau khi phối hợp người quản trị. Không tự xóa lịch sử trong lần review này.

**Tiêu chí đóng:** secret scanning trên working tree/lịch sử theo phạm vi thống nhất sạch; thay mật khẩu/settings không ghi secret; quyền và retention của log được giới hạn.

### S13 — Danh bạ nhân viên làm lộ thông tin định danh

Vị trí: `server/routes/users.js:9`, `server/controllers/userController.js:26`.

Mọi user đăng nhập được lấy danh sách chứa ngày sinh, id_card, passport_url, địa chỉ, email, điện thoại và quyền. Quyền xem danh bạ không đồng nghĩa được xem CCCD/hộ chiếu tất cả nhân viên.

**Khắc phục:** endpoint danh bạ chỉ trả id/tên/vai trò/avatar phù hợp; thông tin định danh tách endpoint cần permission HR/view_sensitive và scope; tải hộ chiếu phải kiểm quyền riêng.

**Tiêu chí đóng:** tài khoản sales thường không nhận trường định danh hoặc link private của nhân viên khác.

### S14 — Thư viện phụ thuộc có cảnh báo bảo mật

Chạy `npm audit --omit=dev --json`, không chạy audit fix hoặc đổi lockfile.

| Khu vực | Critical | High | Moderate | Low | Tổng package bị báo |
|---|---:|---:|---:|---:|---:|
| Server | 2 | 18 | 14 | 1 | 35 |
| Client | 1 | 10 | 7 | 0 | 18 |

Đây là số package do npm registry báo, gồm phụ thuộc gián tiếp; không phải số lỗ hổng đã chứng minh khai thác được. Không cộng hai dòng thành số lỗ hổng duy nhất. Kết quả theo registry lúc chạy, cần đối chiếu phiên bản thực tế trên VPS.

Ưu tiên kiểm tra:

- `pdfjs-dist` 3.x: advisory thực thi JavaScript khi mở PDF độc hại. `client/src/utils/pdfToImages.js:15` gọi `getDocument` và không đặt `isEvalSupported:false`. Đây là đường xử lý file thực trong frontend; cần nâng phiên bản được vá và kiểm lại worker/API. [Advisory của dự án PDF.js](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq).
- `xlsx`: audit báo prototype pollution/ReDoS và không có fix qua nhánh npm hiện dùng; cần chọn bản phân phối đã vá/thư viện thay thế, kiểm soát kích thước và cấu trúc file import. [Advisory ReDoS](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9).
- Server báo critical cho `proxy-addr`, `sanitize-html`; client báo critical cho `tar`. Cần đánh giá đường sử dụng từng package, gồm trường hợp chỉ dùng ở khâu build/optional dependency. Không suy luận frontend SPA đang có server-side RCE chỉ từ advisory React Router SSR/RSC.
- Các package trực tiếp khác bị báo gồm axios, multer, nodemailer, sharp, exceljs, react-router-dom và react-quill. Một số gợi ý fix của npm là downgrade/major change; không áp dụng `--force` tự động.

**Tiêu chí đóng:** danh mục runtime/build được phân loại; update có kiểm hồi quy upload, PDF, Excel, mail, socket; audit không còn critical/high có đường khai thác khả thi hoặc có ngoại lệ được ghi rõ và biện pháp giảm thiểu.

### S15 — Tạo giữ chỗ công khai có thể làm cạn tồn chỗ

Vị trí: `server/routes/reservations.js:7`, `server/controllers/reservationController.js`, `server/services/bookingService.js`.

Route import sai dạng `verifyToken` và không dùng auth. Request ẩn danh vào idempotency rồi tạo booking HELD. Thiếu Idempotency-Key còn được middleware tự sinh, nên không tạo hàng rào chống abuse. Khóa DB giúp tránh vượt tồn nhưng không ngăn người lạ giữ hết chỗ bằng nhiều request hợp lệ. Có global rate limit, nhưng không có quota giữ chỗ theo người dùng/lead.

**Khắc phục:** xác định rõ đây là API nội bộ hay public. Nội bộ cần auth + quyền create + scope; public cần xác minh liên hệ/lead, quota giữ chỗ, chống bot và TTL/release chắc chắn.

**Tiêu chí đóng:** ẩn danh không giữ chỗ nội bộ; public không thể giữ hết tồn bằng thay Idempotency-Key; test song song xác minh TTL/release và tồn kho trên test DB.

### S16 — OAuth dùng JWT trong URL và chưa ràng buộc state

Vị trí: `server/controllers/authController.js`, `googleAuth`, `googleCallback`; `client/src/tabs/MyProfileTab.jsx:160`.

Login Google bình thường không có state ngẫu nhiên gắn phiên. Liên kết tài khoản dùng access JWT trong `sync_token` rồi đưa vào OAuth state; callback login đặt JWT ở query frontend. Token có thể xuất hiện trong access log/lịch sử URL. Cần kiểm thêm login/linking CSRF và email verified/duy nhất; chưa tái hiện chiếm tài khoản qua Google.

**Khắc phục:** state một lần, TTL ngắn, ràng buộc phiên và mục đích login/link; dùng code exchange một lần thay JWT trong URL; xác minh email ownership và xử lý trùng email. Cân nhắc session cookie HttpOnly/Secure cùng CSRF phù hợp kiến trúc.

**Tiêu chí đóng:** state thiếu/sai/replay bị chặn; access JWT không xuất hiện trong URL hoặc log; linking yêu cầu đúng phiên và xác thực gần đây.

### S17 — Deployment dễ báo thành công dù lỗi, quyền bí mật quá rộng

Vị trí: `scripts/deploy_vps.sh`.

Script không bật fail-fast cho toàn quy trình, không kiểm chắc lỗi backend transfer/SSH/install/restart, migration dùng `|| true`, và vẫn có thông báo thành công cuối. Backend được chuyển trước khi frontend build xong nên build fail có thể để hai phần lệch phiên bản. Không có health check/rollback. Các lệnh chmod toàn server thành 644 và toàn client thành 755 bao gồm file bí mật; source cùng owner web user làm tăng quyền ghi không cần thiết. Đây là đánh giá script, chưa kiểm file mode thực tế trên VPS.

**Khắc phục:** sửa chính script deploy chuẩn của dự án: build/validate trước khi chuyển, kiểm lỗi từng bước, migration có quản lý trạng thái, health check và rollback. Tách owner code/runtime/uploads; áp quyền riêng cho env/key, tránh chmod đệ quy rộng. Không deploy bằng lệnh chuyển file thủ công.

**Tiêu chí đóng:** mô phỏng build/install/migration/restart lỗi phải dừng và không báo thành công; health fail rollback; env/key chỉ owner hoặc nhóm tiến trình cần thiết đọc được.

## Kết quả QA đã chạy

| Kiểm tra | Kết quả | Ý nghĩa |
|---|---|---|
| Test auth có sẵn `server/tests/auth_security.test.js` | 11 PASS, 0 FAIL | Kiểm được RS256, chữ ký, alg confusion, kid, exp/nbf sai, iss/aud; chưa bao phủ thu hồi phiên và IDOR |
| Script `reproduce.cjs` kèm báo cáo | 11 probe tái hiện | Là bằng chứng có lỗi; **không phải 11 tiêu chí an toàn PASS** |
| `node --check` các file JS server được chọn | 380 file, 0 lỗi cú pháp | Loại node_modules, public, archive_scripts, _dev, scratch; không chứng minh logic đúng |
| Frontend `npm run build` | PASS, 14,93 giây | Có cảnh báo nêu bên dưới |
| Frontend `npm run lint` | FAIL, exit 2 | ESLint 9 không tìm thấy `eslint.config.js/mjs/cjs` |
| `npm audit --omit=dev` server/client | Cả hai exit 1 | Có package bị báo bảo mật; lưu JSON gốc |
| Integration/E2E nghiệp vụ | Chưa chạy | Chưa thiết lập test DB và bộ fixture cách ly được xác minh |

Các vấn đề chất lượng bổ sung:

1. **Gate lint đang hỏng:** `client/package.json` dùng ESLint 9 nhưng không có flat config. Cần cấu hình lại và thực sự xử lý lỗi sau khi lint chạy được, không chỉ tắt warning.
2. **Build còn warning:** duplicate key `height` tại `ZaloSandboxTab.jsx:380`; ký tự `>` chưa escape tại `SocialMediaOverviewSubTab.jsx:161`; PDF.js dùng eval; có import vừa static vừa dynamic. Bundle chính khoảng **4,60 MB**, gzip **1,20 MB**; cần đo thiết bị thực trước kết luận UX/performance. Sourcemap bật trong build, có thể lộ source frontend nếu phục vụ công khai; đây là hardening, không mặc định là rò bí mật.
3. **Test runner chưa sẵn sàng làm release gate:** `server/package.json` có npm test chỉ báo chưa cấu hình. Một số test như `run_tests.js`, `bu_planning_studio.test.js` import server thật và ghi DB mà không gọi safety guard trước. Một số suite mang tên unit vẫn có nhánh gọi DB. Không chạy chúng trực tiếp bằng cấu hình hiện có.

## Các vùng cần xác minh thêm trước khi ký QA toàn diện

| Vùng | Điều cần kiểm tra | Trạng thái |
|---|---|---|
| Live infrastructure | Nginx thực tế, firewall, port 5001/3333, Host/forwarded headers, TLS, CSP frontend, backup/restore | PENDING |
| UI/UX | Desktop/mobile, modal/keyboard, lỗi form, accessibility, tải dữ liệu, refresh/logout, trạng thái mất mạng | PENDING — chưa kiểm thử trình duyệt với fixture/tài khoản từng role |
| Bảo toàn nghiệp vụ | Giữ chỗ song song, thanh toán/hoàn/hủy phiếu, giữ lại cọc, double-submit, rollback, reconciliation | PENDING — cần DB test và fixture |
| Phân quyền toàn hệ thống | Admin/manager/lead/staff/BU A-B và dữ liệu own/team/all cho từng module | PENDING phần còn lại; S04/S06/S07 đã chứng minh có lỗi |
| Google/Zalo OAuth và webhook | End-to-end sandbox, sai state/signature, retry/replay, sự kiện đến không theo thứ tự | PENDING |
| Nội dung HTML | Announcement/email/notification dùng dangerouslySetInnerHTML; chưa thấy sanitizer ở các đường đã đọc | Cần test XSS và CSP trên frontend; chưa khẳng định script đã thực thi |
| Public visa | Trả notes/checklist/evaluation toàn hồ sơ qua bearer link; không thấy expiry trong query token | Cần xác nhận mục đích chia sẻ, consent, TTL/revoke và giới hạn trường |
| Legacy MCP SSE | `mcp-server/index.js` mở `/sse`, `/messages` không auth, listen không chỉ định loopback, dùng một transport chung | Rủi ro cao **nếu bật SSE và port truy cập được**; chưa xác nhận đang triển khai |
| Cloudflare email worker | Outbound chỉ kiểm secret khi env có giá trị; thiếu secret sẽ đi tiếp | Cần fail-closed; chưa xác nhận worker đang chạy/secret đã cấu hình |
| Secrets và dữ liệu | Phạm vi lịch sử Git, bản sao repo/log, nội dung DB tracked, khả năng phục hồi backup | Chỉ xác minh metadata/trường, chưa kiểm đầy đủ dữ liệu thật |

Các điểm đã có nền tảng tốt: JWT ép RS256/kid/issuer/audience; mật khẩu dùng bcrypt; nhiều truy vấn dùng parameter; nhiều route có RBAC; có Helmet/rate limiter; cơ chế booking có khóa hàng và idempotency; Executive AI auth có kiểm live user và quyền. Những điểm này cần được áp dụng nhất quán, vì endpoint thiếu kiểm quyền vẫn có thể vượt toàn bộ hàng rào UI.

## Thứ tự xử lý đề nghị

1. **Ngay trong đợt sửa đầu:** S01–S04; đồng thời chặn truy cập ẩn danh tới media, Zalo và hợp đồng ID cũ. Xác minh phơi lộ rồi thu hồi/đổi bí mật phù hợp S12 và S03.
2. **Trước khi chấp nhận bản phát hành:** S05–S11, S13–S15; thêm test phủ các đường own/team/all, user deny và token bị thu hồi; nâng dependency theo đường dùng thực tế; khôi phục lint/test gate.
3. **Sau đó hoàn thiện:** OAuth, deployment, kho file private, retention log, MFA cho admin nếu phù hợp, hardening CSP và hiệu năng; chạy ma trận PENDING và live read-only verification trước khi ký PASS.

Mỗi lỗi chỉ đóng khi có test mong đợi **từ chối** request vi phạm, test luồng hợp lệ vẫn hoạt động, và bằng chứng trên môi trường test tương ứng. Script probe hiện xác nhận hành vi lỗi, cần đảo assertion thành security regression sau khi sửa.

## Bằng chứng đi kèm và cách chạy lại an toàn

- `reproduce.cjs`: test cách ly, chỉ dùng dữ liệu giả và khóa RSA sinh trong tiến trình; chạy từ root repo bằng `node docs/security-audit-2026-10-31/reproduce.cjs`.
- `evidence/probes.txt`: kết quả 11 probe.
- `evidence/server-audit.json`, `evidence/client-audit.json`: output npm audit gốc, không chứa `.env`.

Tham chiếu nguyên tắc khắc phục: [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) về kiểm quyền từng request và tài nguyên tĩnh; [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) về xác minh loại file/lưu trữ/quyền; [OWASP WebSocket Security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html) về handshake, session và quyền theo message.
