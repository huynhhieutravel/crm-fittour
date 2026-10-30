# 13. Tích Hợp Trường Nickname Vào Hồ Sơ Nhân Viên ERP & Đồng Bộ Lịch Sử Từ Google Sheet

- **Status**: Accepted (Implemented & Verified)
- **Deciders**: Huỳnh Trọng Hiếu (MKT Lead), Ban Điều Hành FIT TOUR
- **Date**: 2026-10-30

## Context & Problem Statement
Trong văn hoá làm việc và vận hành tour tại FIT TOUR, bên cạnh tên khai sinh pháp lý (`full_name`), các thành viên thường xuyên sử dụng biệt danh thân mật (`nickname` như Max Vu, Loki, Phunnie, Darius Tran, Jo, Vy Phan,...). 

Hiện tại:
1. Bảng `users` trong cơ sở dữ liệu PostgreSQL của hệ thống ERP trước đây chưa có cột `nickname`, chỉ có `full_name`, `username` và `position`.
2. File Google Sheet quản lý danh sách Outing Đà Lạt 2026 (`company_trip_2026.xlsx`) đã thu thập đầy đủ cột `NICK NAME` của cả 32 nhân sự hiện hữu.
3. Quyết định được thông qua: Tích hợp vĩnh viễn trường `Nickname` vào "Thông tin cá nhân Nhân viên" trên hệ thống ERP để các chương trình nội bộ, danh bạ nhân sự và các chuyến đi sau này không phải thu thập lại từ đầu.

## Decision Drivers
- **Độ bền vững dữ liệu (Data Single Source of Truth)**: Lưu trữ tập trung biệt danh nhân sự tại một nguồn duy nhất (Bảng `users` trên ERP) thay vì phân tán trong từng file Excel sự kiện.
- **Tuân thủ quy tắc an toàn dữ liệu lịch sử (Data Guardrails)**: Tuyệt đối không tự ý chạy batch-update dữ liệu lịch sử mà không có sự xác nhận của người dùng. Migration script an toàn (idempotent, không ghi đè nếu người dùng đã có biệt danh khác).
- **Trải nghiệm người dùng xuyên suốt**: Tự phục vụ (Self-service) cho phép nhân viên tự sửa nickname trong trang "Hồ sơ của tôi" (`MyProfileTab`), hiển thị trong "Danh bạ nhân viên" (`TeamDirectoryTab`), tìm kiếm và hiển thị trong `UsersTab`, và cho phép Admin quản lý trong `UserModals`.

## Considered Options
1. **Lưu trữ dạng metadata JSON không cấu trúc trong cột `notification_preferences` hoặc một cột `metadata`**:
   - *Ưu điểm*: Không cần thay đổi schema bảng `users`.
   - *Nhược điểm*: Khó tìm kiếm, khó index, thiếu tính nhất quán và dễ lỗi cú pháp.
2. **Thêm cột chuyên biệt `nickname VARCHAR(100)` vào bảng `users`** (ĐÃ CHỌN & HOÀN TẤT):
   - *Ưu điểm*: Chuẩn hoá Schema Relational Database, index `idx_users_nickname` hỗ trợ tìm kiếm tốc độ cao trên `TeamDirectoryTab`, `UsersTab` và API `/api/users`.
   - *Tính năng đi kèm*: Migration an toàn đồng bộ 32 nickname từ Google Sheet hiện có; đồng thời mở rộng form `MyProfileTab` để nhân viên tự cập nhật trong tương lai.

## Implementation Details
1. **Migration SQL/JS**: Tạo migration `server/migrations/20261030_add_nickname_to_users.js` thêm cột `nickname VARCHAR(100)` và index `idx_users_nickname`. Đã thực thi backfill thành công 32/32 nhân sự.
2. **Backend API**:
   - `server/controllers/userController.js`:
     - `getAllUsers`: `SELECT u.id, u.full_name, u.nickname, ...`
     - `createUser`: Nhận `nickname` và lưu vào DB.
     - `updateUser`: Cập nhật `nickname = COALESCE($19, nickname)`.
     - `getMyProfile`: Lấy `u.nickname`.
     - `updateMyProfile`: Cập nhật `nickname = COALESCE($15, nickname)`.
3. **Frontend UI**:
   - `client/src/tabs/MyProfileTab.jsx`: Thêm trường `BIỆT DANH (NICKNAME NỘI BỘ)` cho phép tự cập nhật.
   - `client/src/tabs/TeamDirectoryTab.jsx`: Hiển thị badge `@nickname` cạnh tên và tìm kiếm theo nickname.
   - `client/src/tabs/UsersTab.jsx`: Hiển thị badge `@nickname`, tìm kiếm đa năng theo tên/nickname/email/username.
   - `client/src/components/modals/UserModals.jsx`: Thêm trường `BIỆT DANH (NICKNAME)` trong `AddUserModal` và `EditUserModal`.
4. **Verification**:
   - Local DB Migration: 32/32 records updated thành công.
   - Frontend Build: `npm run build` thành công trong 11.26s không lỗi.

