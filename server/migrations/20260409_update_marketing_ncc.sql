-- Cập nhật: Marketing xem được Booking (như Sales), xem Customers
-- Tất cả NV xem/tạo/sửa tất cả NCC.

BEGIN;

-- 1. Marketing & Marketing_lead được dùng Bookings & Customers giống Sale
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name IN ('marketing', 'marketing_lead') AND (
    (pm.module = 'bookings' AND pm.action IN ('view_own', 'create', 'edit_own'))
    OR (pm.module = 'customers' AND pm.action IN ('view_own', 'create', 'edit', 'view_sensitive'))
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true;

-- Marketing Lead có thêm quyền Team/All (như Sales Lead)
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name = 'marketing_lead' AND (
    (pm.module = 'bookings' AND pm.action IN ('view_all', 'edit_all', 'approve', 'transfer', 'export', 'view_team', 'edit_team'))
    OR (pm.module = 'customers' AND pm.action IN ('view_all', 'export', 'view_team'))
)
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true;

-- 2. Tất cả NV truy cập NCC (xem, tạo, sửa)
INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
SELECT r.id, pm.id, true
FROM roles r, permissions_master pm
WHERE r.name IN ('sales', 'sales_lead', 'marketing', 'marketing_lead', 'operations', 'operations_lead', 'group_staff', 'group_manager') 
AND pm.module IN ('hotels', 'restaurants', 'transports', 'tickets', 'airlines', 'landtours', 'insurances')
AND pm.action IN ('view', 'create', 'edit')
ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true;

COMMIT;
