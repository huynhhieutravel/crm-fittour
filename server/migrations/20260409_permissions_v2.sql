-- ============================================================
-- MIGRATION: Hệ thống Phân Quyền v2 — Permissions Master
-- Ngày: 2026-04-09
-- Mô tả: Tạo bảng mới, KHÔNG sửa bảng cũ → an toàn 100%
-- ============================================================

BEGIN;

-- ============================================================
-- PHẦN 1: TẠO BẢNG MỚI
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions_master (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    label_vi VARCHAR(200) NOT NULL,
    group_vi VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    UNIQUE(module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions_v2 (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions_master(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT false,
    UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_permissions_v2 (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    permission_id INT REFERENCES permissions_master(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT false,
    UNIQUE(user_id, permission_id)
);

-- Index cho tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_rpm_v2_role ON role_permissions_v2(role_id);
CREATE INDEX IF NOT EXISTS idx_upm_v2_user ON user_permissions_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_module ON permissions_master(module);

-- ============================================================
-- PHẦN 2: THÊM 4 ROLES MỚI (nếu chưa tồn tại)
-- ============================================================

INSERT INTO roles (name) VALUES ('sales_lead')       ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('marketing_lead')   ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('operations_lead')  ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name) VALUES ('accountant')       ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PHẦN 3: INSERT DANH MỤC QUYỀN VÀO permissions_master
-- ============================================================

-- ---- Nhóm: Marketing & Sales ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('leads', 'view_all',   'Xem toàn bộ Lead',           'Marketing & Sales', 100),
('leads', 'view_own',   'Xem Lead cá nhân',            'Marketing & Sales', 101),
('leads', 'create',     'Tạo mới Lead',                'Marketing & Sales', 102),
('leads', 'edit',       'Sửa Lead',                    'Marketing & Sales', 103),
('leads', 'delete',     'Xóa Lead',                    'Marketing & Sales', 104),
('leads', 'assign',     'Phân Lead cho NV khác',       'Marketing & Sales', 105),
('leads', 'export',     'Xuất file Lead',              'Marketing & Sales', 106),
('messenger', 'view',   'Xem Inbox Messenger',         'Marketing & Sales', 110),
('messenger', 'reply',  'Trả lời tin nhắn Messenger',  'Marketing & Sales', 111)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Sản phẩm Tour ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('tours', 'view',       'Xem Sản phẩm Tour',         'Nghiệp vụ Tour', 200),
('tours', 'create',     'Tạo Sản phẩm Tour',         'Nghiệp vụ Tour', 201),
('tours', 'edit',       'Sửa Sản phẩm Tour',         'Nghiệp vụ Tour', 202),
('tours', 'delete',     'Xóa Sản phẩm Tour',         'Nghiệp vụ Tour', 203)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Lịch Khởi Hành ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('op_tours', 'view_all',        'Xem toàn bộ Lịch Khởi Hành',          'Nghiệp vụ Tour', 210),
('op_tours', 'view_own',        'Xem Lịch KH có booking của mình',     'Nghiệp vụ Tour', 211),
('op_tours', 'create',          'Tạo Lịch KH mới',                     'Nghiệp vụ Tour', 212),
('op_tours', 'edit',            'Sửa Lịch KH',                         'Nghiệp vụ Tour', 213),
('op_tours', 'delete',          'Xóa Lịch KH',                         'Nghiệp vụ Tour', 214),
('op_tours', 'export',          'Export Lịch KH',                       'Nghiệp vụ Tour', 215),
('op_tours', 'view_sensitive',  'Xem SĐT/CMND đầy đủ trong Lịch KH',  'Nghiệp vụ Tour', 216),
('op_tours', 'clone',           'Nhân bản Lịch KH',                    'Nghiệp vụ Tour', 217)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Hướng dẫn viên ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('guides', 'view',    'Xem Hướng dẫn viên',   'Nghiệp vụ Tour', 230),
('guides', 'create',  'Thêm HDV',             'Nghiệp vụ Tour', 231),
('guides', 'edit',    'Sửa HDV',              'Nghiệp vụ Tour', 232),
('guides', 'delete',  'Xóa HDV',              'Nghiệp vụ Tour', 233)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Booking ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('bookings', 'view_all',   'Xem toàn bộ Booking',        'Booking & Khách hàng', 300),
('bookings', 'view_own',   'Xem Booking cá nhân',         'Booking & Khách hàng', 301),
('bookings', 'create',     'Tạo Booking / Giữ chỗ',      'Booking & Khách hàng', 302),
('bookings', 'edit_own',   'Sửa Booking của mình',        'Booking & Khách hàng', 303),
('bookings', 'edit_all',   'Sửa Booking của mọi người',   'Booking & Khách hàng', 304),
('bookings', 'approve',    'Duyệt Booking',               'Booking & Khách hàng', 305),
('bookings', 'transfer',   'Chuyển tour Booking',          'Booking & Khách hàng', 306),
('bookings', 'export',     'Xuất file Booking / DSKH',    'Booking & Khách hàng', 307),
('bookings', 'delete',     'Xóa Booking',                 'Booking & Khách hàng', 308)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Khách hàng ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('customers', 'view_all',        'Xem toàn bộ Khách hàng',          'Booking & Khách hàng', 320),
('customers', 'view_own',        'Xem KH cá nhân',                  'Booking & Khách hàng', 321),
('customers', 'create',          'Thêm KH',                         'Booking & Khách hàng', 322),
('customers', 'edit',            'Sửa KH',                          'Booking & Khách hàng', 323),
('customers', 'delete',          'Xóa KH',                          'Booking & Khách hàng', 324),
('customers', 'view_sensitive',  'Xem SĐT/CMND đầy đủ KH',         'Booking & Khách hàng', 325),
('customers', 'export',          'Xuất file KH',                    'Booking & Khách hàng', 326)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Tài chính ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('vouchers', 'view_all',  'Xem toàn bộ Phiếu thu/chi',   'Tài chính', 400),
('vouchers', 'view_own',  'Xem Phiếu cá nhân',            'Tài chính', 401),
('vouchers', 'create',    'Tạo Phiếu thu/chi',            'Tài chính', 402),
('vouchers', 'approve',   'Duyệt Phiếu',                  'Tài chính', 403),
('vouchers', 'cancel',    'Hủy Phiếu',                    'Tài chính', 404),
('vouchers', 'delete',    'Xóa Phiếu',                    'Tài chính', 405),
('costings', 'view',      'Xem Dự toán chi phí',          'Tài chính', 410),
('costings', 'edit',      'Sửa Dự toán chi phí',          'Tài chính', 411)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Nhà cung cấp (NCC) ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('hotels', 'view',         'Xem NCC Khách sạn',        'Nhà cung cấp (NCC)', 500),
('hotels', 'create',       'Thêm NCC Khách sạn',       'Nhà cung cấp (NCC)', 501),
('hotels', 'edit',         'Sửa NCC Khách sạn',        'Nhà cung cấp (NCC)', 502),
('hotels', 'delete',       'Xóa NCC Khách sạn',        'Nhà cung cấp (NCC)', 503),
('restaurants', 'view',    'Xem NCC Nhà hàng',         'Nhà cung cấp (NCC)', 510),
('restaurants', 'create',  'Thêm NCC Nhà hàng',        'Nhà cung cấp (NCC)', 511),
('restaurants', 'edit',    'Sửa NCC Nhà hàng',         'Nhà cung cấp (NCC)', 512),
('restaurants', 'delete',  'Xóa NCC Nhà hàng',         'Nhà cung cấp (NCC)', 513),
('transports', 'view',    'Xem NCC Vận chuyển',        'Nhà cung cấp (NCC)', 520),
('transports', 'create',  'Thêm NCC Vận chuyển',       'Nhà cung cấp (NCC)', 521),
('transports', 'edit',    'Sửa NCC Vận chuyển',        'Nhà cung cấp (NCC)', 522),
('transports', 'delete',  'Xóa NCC Vận chuyển',        'Nhà cung cấp (NCC)', 523),
('tickets', 'view',       'Xem NCC Vé tham quan',      'Nhà cung cấp (NCC)', 530),
('tickets', 'create',     'Thêm NCC Vé tham quan',     'Nhà cung cấp (NCC)', 531),
('tickets', 'edit',       'Sửa NCC Vé tham quan',      'Nhà cung cấp (NCC)', 532),
('tickets', 'delete',     'Xóa NCC Vé tham quan',      'Nhà cung cấp (NCC)', 533),
('airlines', 'view',      'Xem NCC Hãng bay',          'Nhà cung cấp (NCC)', 540),
('airlines', 'create',    'Thêm NCC Hãng bay',         'Nhà cung cấp (NCC)', 541),
('airlines', 'edit',      'Sửa NCC Hãng bay',          'Nhà cung cấp (NCC)', 542),
('airlines', 'delete',    'Xóa NCC Hãng bay',          'Nhà cung cấp (NCC)', 543),
('landtours', 'view',     'Xem NCC Land Tour',         'Nhà cung cấp (NCC)', 550),
('landtours', 'create',   'Thêm NCC Land Tour',        'Nhà cung cấp (NCC)', 551),
('landtours', 'edit',     'Sửa NCC Land Tour',         'Nhà cung cấp (NCC)', 552),
('landtours', 'delete',   'Xóa NCC Land Tour',         'Nhà cung cấp (NCC)', 553),
('insurances', 'view',    'Xem NCC Bảo hiểm',          'Nhà cung cấp (NCC)', 560),
('insurances', 'create',  'Thêm NCC Bảo hiểm',         'Nhà cung cấp (NCC)', 561),
('insurances', 'edit',    'Sửa NCC Bảo hiểm',          'Nhà cung cấp (NCC)', 562),
('insurances', 'delete',  'Xóa NCC Bảo hiểm',          'Nhà cung cấp (NCC)', 563)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Tour Đoàn (B2B) ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('b2b_companies', 'view_all',  'Xem toàn bộ Doanh nghiệp',   'Tour Đoàn (B2B)', 600),
('b2b_companies', 'view_own',  'Xem DN cá nhân phụ trách',    'Tour Đoàn (B2B)', 601),
('b2b_companies', 'create',    'Thêm Doanh nghiệp',           'Tour Đoàn (B2B)', 602),
('b2b_companies', 'edit',      'Sửa Doanh nghiệp',            'Tour Đoàn (B2B)', 603),
('b2b_companies', 'delete',    'Xóa Doanh nghiệp',            'Tour Đoàn (B2B)', 604),
('group_leaders', 'view_all',  'Xem toàn bộ Trưởng đoàn',    'Tour Đoàn (B2B)', 610),
('group_leaders', 'view_own',  'Xem TĐ cá nhân phụ trách',   'Tour Đoàn (B2B)', 611),
('group_leaders', 'create',    'Thêm Trưởng đoàn',            'Tour Đoàn (B2B)', 612),
('group_leaders', 'edit',      'Sửa Trưởng đoàn',             'Tour Đoàn (B2B)', 613),
('group_leaders', 'delete',    'Xóa Trưởng đoàn',             'Tour Đoàn (B2B)', 614),
('group_projects', 'view_all', 'Xem toàn bộ Dự án',          'Tour Đoàn (B2B)', 620),
('group_projects', 'view_own', 'Xem Dự án cá nhân',           'Tour Đoàn (B2B)', 621),
('group_projects', 'create',   'Tạo Dự án Tour Đoàn',         'Tour Đoàn (B2B)', 622),
('group_projects', 'edit',     'Sửa Dự án',                   'Tour Đoàn (B2B)', 623),
('group_projects', 'delete',   'Xóa Dự án',                   'Tour Đoàn (B2B)', 624)
ON CONFLICT (module, action) DO NOTHING;

-- ---- Nhóm: Hệ thống ----
INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
('users', 'view',               'Xem danh sách Nhân sự',      'Hệ thống', 700),
('users', 'create',             'Thêm Nhân sự',               'Hệ thống', 701),
('users', 'edit',               'Sửa Nhân sự',                'Hệ thống', 702),
('users', 'delete',             'Xóa / Vô hiệu hóa NV',      'Hệ thống', 703),
('users', 'change_permissions', 'Thay đổi phân quyền NV',     'Hệ thống', 704),
('settings', 'view',            'Xem Cài đặt hệ thống',       'Hệ thống', 710),
('settings', 'edit',            'Sửa Cài đặt hệ thống',       'Hệ thống', 711),
('licenses', 'view',            'Xem Giấy phép kinh doanh',   'Hệ thống', 720),
('licenses', 'edit',            'Sửa Giấy phép',              'Hệ thống', 721)
ON CONFLICT (module, action) DO NOTHING;

COMMIT;
