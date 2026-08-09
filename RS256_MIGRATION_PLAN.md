# Kế hoạch Chuyển đổi RS256 - ERP FIT TOUR

> **Tài liệu lưu trữ trạng thái Migration JWT (HS256 -> RS256).**
> **Ngày bắt đầu Phase 3:** 10/08/2026.
> **Thời điểm dự kiến kiểm tra Phase 4:** Khoảng 24/08/2026 (sau 14-16 ngày).

---

## 1. Trạng Thái Hiện Tại
- **Phase 1 (Prepare):** Đã hoàn tất. Hệ thống hỗ trợ Dual-Verification (HS256 + RS256). Có đầu API `/.well-known/jwks.json`.
- **Phase 2 (Switch Signing):** Đã hoàn tất. Mọi token mới cấp phát từ hôm nay đều là `RS256` với đầy đủ claims (`iss`, `aud`, `typ`, `kid`, `nbf`, `jti`).
- **Phase 3 (Monitor):** ĐANG CHẠY. Đã bật log Metrics theo dõi mọi lượt xác thực.

---

## 2. Hướng dẫn Theo dõi (Monitoring) Phase 3
Trong suốt 14-16 ngày tới, thỉnh thoảng bạn có thể mở VPS và chạy lệnh sau để xem thống kê:

```bash
# Lệnh xem Dashboard Thống Kê
cat ~/.pm2/logs/crm-fittour-out.log | node server/scripts/auth_metrics_dashboard.js
```

**Mẫu kết quả Dashboard:**
```text
=========================================
             AUTH METRICS                
=========================================

HS256
  Success: 0
  Failed:  0

RS256
  Success: 1,284
  Failed:  3
...
```

---

## 3. Tiêu chí GO / NO-GO (Duyệt lên Phase 4)

Chỉ bắt đầu **Phase 4 (Khai tử HS256)** khi **ĐỒNG THỜI** đạt được 5 điều kiện sau:

- [ ] **A. Không còn HS256 authentication thành công:** `HS256 Success = 0` trong một khoảng thời gian đủ dài.
- [ ] **B. Không còn HS256 request đáng kể:** `HS256 Failed = 0` hoặc các luồng Failed đều giải thích được (do app cũ cố tình gửi lên, nhưng bị chặn đúng).
- [ ] **C. RS256 hoạt động ổn định:** Không xuất hiện lượng lớn `RS256 Failed` bất thường.
- [ ] **D. Vượt qua cửa sổ an toàn (Max Lifetime):** Đã trôi qua ít nhất 14 ngày (Token TTL) + vài ngày dự phòng.
- [ ] **E. Sạch bóng Codebase:** Đã chạy lệnh grep tìm `JWT_SECRET` trong toàn bộ repo (server) và đảm bảo không còn logic nào phụ thuộc vào nó (trừ đoạn fallback cần xóa ở Phase 4).

---

## 4. Các bước thực hiện Phase 4 (Khi đã đủ điều kiện)

Vào ngày bạn quay lại (nếu Checklist trên tick đủ), hãy làm theo thứ tự sau:

1. **Backup / Tag Release:** Tạo một bản backup `_backups/` hoặc tag Github cho version cuối cùng chạy Dual-Mode.
2. **Xóa Fallback trong Code:** 
   - Mở `server/utils/jwt.js`.
   - Tìm hàm `verifyTokenSafely`.
   - Xóa bỏ khối `if (alg === 'HS256') { ... }`.
   - Tìm hàm `generateAccessToken` và xóa logic fallback `return jwt.sign(payload, process.env.JWT_SECRET...);`.
3. **Dọn dẹp Biến Môi Trường:** Xóa biến `JWT_SECRET` khỏi file `.env` trên VPS.
4. **Deploy & Restart:** PM2 restart.
5. **Smoke Test:** Thử đăng nhập lại bằng Admin, dạo một vòng các module, check luồng đồng bộ Google Calendar để đảm bảo hệ thống API 100% RS256 đang chạy ngon lành.
6. **Báo Cáo Hoàn Tất Migration!**
