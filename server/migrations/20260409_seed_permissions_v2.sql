-- ============================================================
-- SEED: Quyền mặc định cho 11 roles vào role_permissions_v2
-- ============================================================

BEGIN;

-- Helper: Lấy role_id và permission_id động từ tên
-- ADMIN: Full quyền (tất cả permissions = granted)
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MANAGER: Full quyền (giống admin nhưng không có admin-exclusive)
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- SALES_LEAD (Trưởng phòng Sales)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'sales_lead' AND (
    -- Leads: Full (trừ delete)
    (pm.module = 'leads' AND pm.action IN ('view_all','view_own','create','edit','assign','export'))
    OR (pm.module = 'messenger' AND pm.action IN ('view','reply'))
    -- Tours: Xem only
    OR (pm.module = 'tours' AND pm.action = 'view')
    -- Op Tours: View all, view own, export, view sensitive
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own','export','view_sensitive'))
    -- Guides: Xem only
    OR (pm.module = 'guides' AND pm.action = 'view')
    -- Bookings: Full trừ delete
    OR (pm.module = 'bookings' AND pm.action IN ('view_all','view_own','create','edit_own','edit_all','approve','transfer','export'))
    -- Customers: Full trừ delete
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own','create','edit','view_sensitive','export'))
    -- Vouchers: Full trừ delete
    OR (pm.module = 'vouchers' AND pm.action IN ('view_all','view_own','create','approve','cancel'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- SALES (Nhân viên Sales)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'sales' AND (
    -- Leads: View own, create, edit
    (pm.module = 'leads' AND pm.action IN ('view_own','create','edit'))
    OR (pm.module = 'messenger' AND pm.action IN ('view','reply'))
    -- Tours: Xem only
    OR (pm.module = 'tours' AND pm.action = 'view')
    -- Op Tours: View own only
    OR (pm.module = 'op_tours' AND pm.action = 'view_own')
    -- Guides: Xem only
    OR (pm.module = 'guides' AND pm.action = 'view')
    -- Bookings: View own, create, edit own
    OR (pm.module = 'bookings' AND pm.action IN ('view_own','create','edit_own'))
    -- Customers: View own, create, edit
    OR (pm.module = 'customers' AND pm.action IN ('view_own','create','edit','view_sensitive'))
    -- Vouchers: View own, create
    OR (pm.module = 'vouchers' AND pm.action IN ('view_own','create'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- MARKETING_LEAD (Trưởng phòng Marketing)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'marketing_lead' AND (
    -- Leads: Full
    (pm.module = 'leads' AND pm.action IN ('view_all','view_own','create','edit','delete','assign','export'))
    OR (pm.module = 'messenger' AND pm.action IN ('view','reply'))
    -- Tours: Full trừ delete
    OR (pm.module = 'tours' AND pm.action IN ('view','create','edit'))
    -- Op Tours: View all
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own'))
    -- Customers: View all
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- MARKETING (Nhân viên Marketing)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'marketing' AND (
    -- Leads: View own, create, edit
    (pm.module = 'leads' AND pm.action IN ('view_own','create','edit'))
    OR (pm.module = 'messenger' AND pm.action IN ('view','reply'))
    -- Tours: View, create, edit
    OR (pm.module = 'tours' AND pm.action IN ('view','create','edit'))
    -- Op Tours: View all (để biết tour nào còn chỗ)
    OR (pm.module = 'op_tours' AND pm.action = 'view_own')
    -- Customers: View limited
    OR (pm.module = 'customers' AND pm.action = 'view_own')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- OPERATIONS_LEAD (Trưởng phòng Điều hành)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'operations_lead' AND (
    -- Tours: Full
    (pm.module = 'tours' AND pm.action IN ('view','create','edit','delete'))
    -- Op Tours: Full
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own','create','edit','delete','export','view_sensitive','clone'))
    -- Guides: Full
    OR (pm.module = 'guides' AND pm.action IN ('view','create','edit','delete'))
    -- Bookings: View all, approve, transfer, export
    OR (pm.module = 'bookings' AND pm.action IN ('view_all','view_own','create','edit_own','edit_all','approve','transfer','export'))
    -- Customers: View all, view sensitive
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own','view_sensitive'))
    -- Vouchers: View all, create, approve
    OR (pm.module = 'vouchers' AND pm.action IN ('view_all','view_own','create','approve','cancel'))
    -- Costings: Full
    OR (pm.module = 'costings' AND pm.action IN ('view','edit'))
    -- NCC: Full
    OR (pm.module IN ('hotels','restaurants','transports','tickets','airlines','landtours','insurances') AND pm.action IN ('view','create','edit','delete'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- OPERATIONS (Nhân viên Điều hành)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'operations' AND (
    -- Tours: View, create, edit
    (pm.module = 'tours' AND pm.action IN ('view','create','edit'))
    -- Op Tours: View all, create, edit, clone
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own','create','edit','export','view_sensitive','clone'))
    -- Guides: View, create, edit
    OR (pm.module = 'guides' AND pm.action IN ('view','create','edit'))
    -- Bookings: View all, edit
    OR (pm.module = 'bookings' AND pm.action IN ('view_all','view_own','create','edit_own','edit_all'))
    -- Customers: View all, view sensitive
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own','view_sensitive'))
    -- Vouchers: View, create
    OR (pm.module = 'vouchers' AND pm.action IN ('view_all','view_own','create'))
    -- Costings: View, edit
    OR (pm.module = 'costings' AND pm.action IN ('view','edit'))
    -- NCC: View, create, edit (no delete)
    OR (pm.module IN ('hotels','restaurants','transports','tickets','airlines','landtours','insurances') AND pm.action IN ('view','create','edit'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- GROUP_MANAGER (Trưởng phòng Tour Đoàn)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'group_manager' AND (
    -- B2B: Full
    (pm.module IN ('b2b_companies','group_leaders','group_projects') AND pm.action IN ('view_all','view_own','create','edit','delete'))
    -- Op Tours: View all
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own','create','edit','delete','export','view_sensitive','clone'))
    -- Bookings: Full
    OR (pm.module = 'bookings' AND pm.action IN ('view_all','view_own','create','edit_own','edit_all','approve','transfer','export'))
    -- Customers: Full
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own','create','edit','view_sensitive','export'))
    -- Tours: Full
    OR (pm.module = 'tours' AND pm.action IN ('view','create','edit','delete'))
    -- Guides: Full
    OR (pm.module = 'guides' AND pm.action IN ('view','create','edit','delete'))
    -- Vouchers
    OR (pm.module = 'vouchers' AND pm.action IN ('view_all','view_own','create','approve','cancel'))
    -- NCC
    OR (pm.module IN ('hotels','restaurants','transports','tickets','airlines','landtours','insurances') AND pm.action IN ('view','create','edit','delete'))
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- GROUP_STAFF (Nhân viên Tour Đoàn)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'group_staff' AND (
    -- B2B: View own, create, edit
    (pm.module IN ('b2b_companies','group_leaders','group_projects') AND pm.action IN ('view_own','create','edit'))
    -- Op Tours: View own
    OR (pm.module = 'op_tours' AND pm.action = 'view_own')
    -- Bookings: View own, create, edit own
    OR (pm.module = 'bookings' AND pm.action IN ('view_own','create','edit_own'))
    -- Customers: View own
    OR (pm.module = 'customers' AND pm.action = 'view_own')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- ACCOUNTANT (Kế toán)
-- ============================================================
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'accountant' AND (
    -- Vouchers: Full
    (pm.module = 'vouchers' AND pm.action IN ('view_all','view_own','create','approve','cancel','delete'))
    -- Costings: Full
    OR (pm.module = 'costings' AND pm.action IN ('view','edit'))
    -- Bookings: View all (xem để đối chiếu)
    OR (pm.module = 'bookings' AND pm.action IN ('view_all','view_own','export'))
    -- Customers: View all, view sensitive (xuất hóa đơn)
    OR (pm.module = 'customers' AND pm.action IN ('view_all','view_own','view_sensitive'))
    -- Op Tours: View all (xem doanh thu)
    OR (pm.module = 'op_tours' AND pm.action IN ('view_all','view_own','export'))
    -- NCC: View (xem để đối chiếu chi phí)
    OR (pm.module IN ('hotels','restaurants','transports','tickets','airlines','landtours','insurances') AND pm.action = 'view')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- MIGRATE: user_permissions cũ → user_permissions_v2
-- Map: can_view → view_own, can_create → create, can_edit → edit, can_delete → delete
-- ============================================================
INSERT INTO user_permissions_v2 (user_id, permission_id, granted)
SELECT up.user_id, pm.id, true
FROM user_permissions up
JOIN permissions_master pm ON pm.module = up.module_name AND (
    (up.can_view = true AND pm.action = 'view_own')
    OR (up.can_create = true AND pm.action = 'create')
    OR (up.can_edit = true AND pm.action = 'edit')
    OR (up.can_delete = true AND pm.action = 'delete')
)
WHERE (
    (up.can_view = true AND pm.action = 'view_own')
    OR (up.can_create = true AND pm.action = 'create')
    OR (up.can_edit = true AND pm.action = 'edit')
    OR (up.can_delete = true AND pm.action = 'delete')
)
ON CONFLICT (user_id, permission_id) DO NOTHING;

COMMIT;
