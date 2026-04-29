-- =====================================================================
-- MIGRATION: Fix leave_balances sync after trigger upgrade
-- Chạy script này 1 LẦN trên VPS sau khi cập nhật trigger mới
-- Mục đích: Tính lại used_days từ dữ liệu thực tế trong leave_requests
-- =====================================================================

BEGIN;

-- Bước 1: Lấy default days từ settings
DO $$
DECLARE
    default_days NUMERIC := 12;
BEGIN
    SELECT COALESCE(NULLIF(value, '')::numeric, 12) INTO default_days
    FROM settings WHERE key = 'leave_default_days';

    -- Bước 2: Với mỗi nhân viên có đơn approved + annual, tính lại used_days
    UPDATE leave_balances lb
    SET used_days = (
        SELECT COALESCE(SUM(lr.total_days), 0)
        FROM leave_requests lr
        WHERE lr.user_id = lb.user_id
          AND lr.status = 'approved'
          AND lr.leave_type = 'annual'
          AND EXTRACT(YEAR FROM lr.start_date) = lb.year
    )
    WHERE lb.year = EXTRACT(YEAR FROM NOW());

    -- Bước 3: Tạo bản ghi leave_balance mặc định cho ai chưa có
    -- (dành cho nhân viên đã có đơn approved nhưng chưa có balance row)
    INSERT INTO leave_balances (user_id, year, total_days, used_days)
    SELECT 
        lr.user_id,
        EXTRACT(YEAR FROM lr.start_date)::int,
        default_days,
        SUM(lr.total_days)
    FROM leave_requests lr
    WHERE lr.status = 'approved'
      AND lr.leave_type = 'annual'
      AND EXTRACT(YEAR FROM lr.start_date) = EXTRACT(YEAR FROM NOW())
    GROUP BY lr.user_id, EXTRACT(YEAR FROM lr.start_date)
    ON CONFLICT (user_id, year) DO NOTHING;

END $$;

COMMIT;

-- Kiểm tra kết quả sau khi chạy
SELECT 
    u.full_name,
    COALESCE(lb.total_days, 12) as total_days,
    COALESCE(lb.used_days, 0) as used_days,
    COALESCE(lb.total_days, 12) - COALESCE(lb.used_days, 0) as available,
    (
        SELECT COALESCE(SUM(lr2.total_days), 0)
        FROM leave_requests lr2
        WHERE lr2.user_id = u.id
          AND lr2.status = 'approved'
          AND lr2.leave_type = 'annual'
          AND EXTRACT(YEAR FROM lr2.start_date) = 2026
    ) as actual_used
FROM users u
LEFT JOIN leave_balances lb ON lb.user_id = u.id AND lb.year = 2026
WHERE u.is_active = true
ORDER BY u.full_name;
