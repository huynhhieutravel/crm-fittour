# Kế hoạch Chuyển đổi RS256 - ERP FIT TOUR

> **Tài liệu lưu trữ trạng thái Migration JWT (HS256 -> RS256).**
> **Ngày bắt đầu Phase 3:** 10/08/2026.
> **Thời điểm hoàn tất Phase 4:** 17/08/2026.
> **Trạng thái:** ✅ **HOÀN TẤT 100% (COMPLETED)**

---

## 1. Trạng Thái Hiện Tại
- **Phase 1 (Prepare):** Đã hoàn tất. Hệ thống hỗ trợ JWKS RFC 7517 (`/.well-known/jwks.json`).
- **Phase 2 (Switch Signing):** Đã hoàn tất. Mọi token cấp phát đều là `RS256` với đầy đủ claims (`iss`, `aud`, `typ`, `kid`, `nbf`, `jti`).
- **Phase 3 (Monitor):** Đã hoàn tất. Giám sát 7 ngày liên tiếp từ 10/08 -> 16/08/2026. Số lượng HS256 chạm mốc 0 lượt.
- **Phase 4 (Khai tử HS256 & Dọn dẹp Codebase):** ✅ ĐÃ HOÀN TẤT (17/08/2026).
  - Đã backup toàn bộ Database PostgreSQL và mã nguồn vào `_backups/`.
  - Đã loại bỏ hoàn toàn cơ chế fallback HS256.
  - Đã tắt cron `authMetricsReporter` và làm sạch log `[AUTH METRIC]`.
  - Đã chạy bộ test bảo mật xác thực 11/11 tests PASS.

---

## 2. Tiêu chí GO / NO-GO (Đã thỏa mãn 5/5 điều kiện)

- [x] **A. Không còn HS256 authentication thành công:** `HS256 = 0` lượt ghi nhận trên toàn bộ request.
- [x] **B. Không còn HS256 request đáng kể:** Hệ thống ổn định 100% trên RS256.
- [x] **C. RS256 hoạt động ổn định:** Hàng ngàn lượt xác thực mỗi ngày không có lỗi.
- [x] **D. Vượt qua cửa sổ an toàn (Max Lifetime):** Toàn bộ session cũ đã chuyển dịch sang RS256.
- [x] **E. Sạch bóng Codebase:** Không còn phụ thuộc vào `JWT_SECRET`. Toàn bộ token xác thực bằng RSA Asymmetric Key.

---

## 3. Tổng kết Kiến Trúc Xác Thực (Architecture Summary)

- **Thuật toán ký:** `RS256` (RSA Signature with SHA-256, 2048-bit key).
- **Public Key Endpoint:** `/.well-known/jwks.json`.
- **Token Claims bắt buộc:**
  - `iss`: `https://erp.fittour.vn`
  - `aud`: `fittour-api`
  - `typ`: `access+jwt`
  - `jti`: UUID v4 ngẫu nhiên
  - `nbf`: Thời điểm phát hành
  - `kid`: Key ID tương ứng trong JWKS
- **Chống tấn công:** Reject `alg: none`, reject `HS256`, reject Algorithm Confusion (dùng Public Key ký đối xứng), reject expired, reject missing claims.

