const db = require('../db');

/**
 * Helper: Parse Date Range from query params or presets
 */
function parseDateRange(query) {
    const { period, startDate, endDate } = query;
    const now = new Date();
    
    let start = new Date();
    let end = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    if (period === 'today') {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        prevStart.setDate(prevStart.getDate() - 1);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setDate(prevEnd.getDate() - 1);
        prevEnd.setHours(23, 59, 59, 999);
    } else if (period === 'yesterday') {
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);

        prevStart.setDate(prevStart.getDate() - 2);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setDate(prevEnd.getDate() - 2);
        prevEnd.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - (day - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - 7);
        prevEnd = new Date(end);
        prevEnd.setDate(prevEnd.getDate() - 7);
    } else if (period === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
        prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);

        prevStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1, 0, 0, 0, 0);
        prevEnd = new Date(now.getFullYear(), currentQuarter * 3, 0, 23, 59, 59, 999);
    } else if (period === 'year') {
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    } else if (period === 'custom' && startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const durationMs = end.getTime() - start.getTime();
        prevEnd = new Date(start.getTime() - 1);
        prevStart = new Date(prevEnd.getTime() - durationMs);
    } else {
        // Default: month (This month)
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    return { start, end, prevStart, prevEnd };
}

/**
 * GET /api/customers/analytics/overview
 * Tổng quan KPI: Khách mới, tăng trưởng MoM, Khách cũ quay lại, Retention rate, LTV
 */
exports.getOverviewStats = async (req, res) => {
    try {
        const { start, end, prevStart, prevEnd } = parseDateRange(req.query);

        // 1. Tổng khách mới trong kỳ
        const newCustRes = await db.query(
            `SELECT COUNT(*)::int as count FROM customers WHERE created_at >= $1 AND created_at <= $2`,
            [start, end]
        );
        const newCustomersCount = newCustRes.rows[0].count;

        // 2. Tổng khách mới kỳ trước (để tính MoM Growth)
        const prevCustRes = await db.query(
            `SELECT COUNT(*)::int as count FROM customers WHERE created_at >= $1 AND created_at <= $2`,
            [prevStart, prevEnd]
        );
        const prevCustomersCount = prevCustRes.rows[0].count;

        let momGrowth = 0;
        if (prevCustomersCount > 0) {
            momGrowth = Math.round(((newCustomersCount - prevCustomersCount) / prevCustomersCount) * 1000) / 10;
        } else if (newCustomersCount > 0) {
            momGrowth = 100;
        }

        // 3. Tổng khách hàng toàn hệ thống
        const totalAllCustRes = await db.query(`SELECT COUNT(*)::int as count FROM customers`);
        const totalAllCustomers = totalAllCustRes.rows[0].count;

        // 4. Bookings trong kỳ (không tính đã huỷ)
        const bookingsInPeriodRes = await db.query(`
            SELECT 
                b.id, b.customer_id, b.total_price, b.created_at,
                c.created_at as cust_created_at, c.past_trip_count
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.created_at >= $1 AND b.created_at <= $2
              AND b.booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED')
        `, [start, end]);

        const bookingsInPeriod = bookingsInPeriodRes.rows;
        const totalBookingsInPeriod = bookingsInPeriod.length;
        const totalRevenueInPeriod = bookingsInPeriod.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        // Phân loại khách trong kỳ: Khách mới vs Khách cũ
        const uniqueCustomerMap = new Map();
        let repeatBookingsCount = 0;
        let repeatRevenue = 0;
        let newCustomerRevenue = 0;
        let newCustomerBookingsCount = 0;

        bookingsInPeriod.forEach(b => {
            if (!b.customer_id) return;
            const isReturning = (b.cust_created_at && new Date(b.cust_created_at) < start) || 
                                (parseInt(b.past_trip_count || 0) > 0);
            
            if (!uniqueCustomerMap.has(b.customer_id)) {
                uniqueCustomerMap.set(b.customer_id, {
                    isReturning,
                    bookingsCount: 0,
                    totalSpent: 0
                });
            }
            
            const custStat = uniqueCustomerMap.get(b.customer_id);
            custStat.bookingsCount += 1;
            custStat.totalSpent += parseFloat(b.total_price || 0);

            if (isReturning) {
                repeatBookingsCount += 1;
                repeatRevenue += parseFloat(b.total_price || 0);
            } else {
                newCustomerBookingsCount += 1;
                newCustomerRevenue += parseFloat(b.total_price || 0);
            }
        });

        let returningCustomersCount = 0;
        let activeNewCustomersCount = 0;

        uniqueCustomerMap.forEach(val => {
            if (val.isReturning) returningCustomersCount++;
            else activeNewCustomersCount++;
        });

        const totalActiveCustInPeriod = uniqueCustomerMap.size;
        const repeatRate = totalActiveCustInPeriod > 0 
            ? Math.round((returningCustomersCount / totalActiveCustInPeriod) * 1000) / 10 
            : 0;

        // 5. Phân bổ Nguồn khách mới (Source Breakdown)
        const sourceRes = await db.query(`
            SELECT 
                COALESCE(NULLIF(l.source, ''), NULLIF(c.preferred_contact, ''), 'Vãng lai/Khác') as source_name,
                COUNT(c.id)::int as count
            FROM customers c
            LEFT JOIN leads l ON c.lead_id = l.id
            WHERE c.created_at >= $1 AND c.created_at <= $2
            GROUP BY source_name
            ORDER BY count DESC
            LIMIT 6
        `, [start, end]);

        // 6. Phân bổ theo Nhân viên phụ trách (Staff Breakdown)
        const staffRes = await db.query(`
            SELECT 
                COALESCE(u.full_name, u.username, 'Chưa phân công') as staff_name,
                COUNT(c.id)::int as count
            FROM customers c
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.created_at >= $1 AND c.created_at <= $2
            GROUP BY staff_name
            ORDER BY count DESC
            LIMIT 6
        `, [start, end]);

        // 7. Phân khúc khách hàng toàn hệ thống (Segment breakdown)
        const segmentRes = await db.query(`
            SELECT 
                COALESCE(NULLIF(customer_segment, ''), 'New Customer') as segment,
                COUNT(*)::int as count
            FROM customers
            GROUP BY segment
            ORDER BY count DESC
        `);

        // 8. Tóm tắt Kiểm toán Chất lượng Dữ liệu (Data Integrity Summary)
        const [orphanBookingsRes, wonLeadsUnconvertedRes, unassignedCustRes, missingPhoneCustRes, dupPhoneRes] = await Promise.all([
            // Bookings không có customer_id hoặc customer không tồn tại
            db.query(`
                SELECT COUNT(*)::int as count 
                FROM bookings b 
                LEFT JOIN customers c ON b.customer_id = c.id 
                WHERE (b.customer_id IS NULL OR c.id IS NULL)
                  AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')
            `),
            // Leads chốt đơn nhưng chưa convert thành customer
            db.query(`
                SELECT COUNT(*)::int as count 
                FROM leads l 
                WHERE l.status = 'Chốt đơn' AND l.customer_id IS NULL
            `),
            // Khách hàng chưa gán nhân viên phụ trách
            db.query(`
                SELECT COUNT(*)::int as count 
                FROM customers c 
                WHERE c.assigned_to IS NULL
            `),
            // Khách hàng thiếu số điện thoại
            db.query(`
                SELECT COUNT(*)::int as count 
                FROM customers c 
                WHERE c.phone IS NULL OR TRIM(c.phone) = ''
            `),
            // Số lượng SĐT bị trùng lặp
            db.query(`
                SELECT COUNT(*)::int as count FROM (
                    SELECT phone FROM customers 
                    WHERE phone IS NOT NULL AND TRIM(phone) != ''
                    GROUP BY phone HAVING COUNT(*) > 1
                ) sub
            `)
        ]);

        const dataIntegritySummary = {
            orphanBookingsCount: orphanBookingsRes.rows[0]?.count || 0,
            wonLeadsUnconvertedCount: wonLeadsUnconvertedRes.rows[0]?.count || 0,
            unassignedCustCount: unassignedCustRes.rows[0]?.count || 0,
            missingPhoneCustCount: missingPhoneCustRes.rows[0]?.count || 0,
            duplicatePhoneGroupsCount: dupPhoneRes.rows[0]?.count || 0,
            totalIssues: (orphanBookingsRes.rows[0]?.count || 0) +
                         (wonLeadsUnconvertedRes.rows[0]?.count || 0) +
                         (unassignedCustRes.rows[0]?.count || 0) +
                         (missingPhoneCustRes.rows[0]?.count || 0) +
                         (dupPhoneRes.rows[0]?.count || 0)
        };

        res.json({
            dateRange: { start, end, prevStart, prevEnd },
            kpi: {
                newCustomersCount,
                prevCustomersCount,
                momGrowth,
                totalAllCustomers,
                returningCustomersCount,
                activeNewCustomersCount,
                totalActiveCustInPeriod,
                repeatRate,
                repeatBookingsCount,
                repeatRevenue,
                newCustomerBookingsCount,
                newCustomerRevenue,
                totalBookingsInPeriod,
                totalRevenueInPeriod
            },
            sourceDistribution: sourceRes.rows,
            staffDistribution: staffRes.rows,
            segmentDistribution: segmentRes.rows,
            dataIntegritySummary
        });
    } catch (err) {
        console.error('Error in getOverviewStats:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/customers/analytics/growth-chart
 * Biểu đồ xu hướng Khách mới & Khách cũ theo 12 tháng gần nhất
 */
exports.getGrowthChart = async (req, res) => {
    try {
        const monthsCount = parseInt(req.query.months) || 12;
        const now = new Date();
        
        const monthlyStats = [];

        for (let i = monthsCount - 1; i >= 0; i--) {
            const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
            const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
            
            const monthLabel = `T${String(mStart.getMonth() + 1).padStart(2, '0')}/${mStart.getFullYear()}`;

            // 1. Khách mới tạo trong tháng
            const newRes = await db.query(
                `SELECT COUNT(*)::int as count FROM customers WHERE created_at >= $1 AND created_at <= $2`,
                [mStart, mEnd]
            );

            // 2. Bookings trong tháng
            const bookRes = await db.query(`
                SELECT 
                    b.id, b.customer_id, b.total_price,
                    c.created_at as cust_created_at, c.past_trip_count
                FROM bookings b
                LEFT JOIN customers c ON b.customer_id = c.id
                WHERE b.created_at >= $1 AND b.created_at <= $2
                  AND b.booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED')
            `, [mStart, mEnd]);

            const bookings = bookRes.rows;
            let returningCustSet = new Set();
            let newCustBookingSet = new Set();
            let totalRevenue = 0;
            let repeatRevenue = 0;

            bookings.forEach(b => {
                const price = parseFloat(b.total_price || 0);
                totalRevenue += price;

                if (!b.customer_id) return;
                const isReturning = (b.cust_created_at && new Date(b.cust_created_at) < mStart) || 
                                    (parseInt(b.past_trip_count || 0) > 0);
                if (isReturning) {
                    returningCustSet.add(b.customer_id);
                    repeatRevenue += price;
                } else {
                    newCustBookingSet.add(b.customer_id);
                }
            });

            monthlyStats.push({
                month: monthLabel,
                startDate: mStart,
                endDate: mEnd,
                newCustomers: newRes.rows[0].count,
                returningCustomers: returningCustSet.size,
                totalBookings: bookings.length,
                totalRevenue,
                repeatRevenue
            });
        }

        res.json(monthlyStats);
    } catch (err) {
        console.error('Error in getGrowthChart:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/customers/analytics/data-audit
 * Danh sách chi tiết các dữ liệu chưa chuẩn để kiểm toán và điều phối
 */
exports.getDataIntegrityAudit = async (req, res) => {
    try {
        const { type = 'all', limit = 50 } = req.query;
        const result = {};

        if (type === 'all' || type === 'orphan_bookings') {
            const orphanBookings = await db.query(`
                SELECT 
                    b.id, b.booking_code, b.total_price, b.created_at, 
                    b.booking_status, b.pax_count, b.customer_id,
                    COALESCE(tt.name, 'Tour Tuỳ Chỉnh') as tour_name, 
                    COALESCE(tt.code, td.code, '---') as tour_code
                FROM bookings b
                LEFT JOIN customers c ON b.customer_id = c.id
                LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
                LEFT JOIN tour_templates tt ON COALESCE(b.tour_template_id, td.tour_template_id, b.tour_id) = tt.id
                WHERE (b.customer_id IS NULL OR c.id IS NULL)
                  AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')
                ORDER BY b.created_at DESC
                LIMIT $1
            `, [limit]);
            result.orphanBookings = orphanBookings.rows;
        }

        if (type === 'all' || type === 'won_leads_unconverted') {
            const wonLeads = await db.query(`
                SELECT 
                    l.id, l.name, l.phone, l.source, l.won_at, l.created_at, 
                    l.bu_group, l.consultation_note,
                    COALESCE(u.full_name, u.username, 'Chưa giao') as assigned_to_name
                FROM leads l
                LEFT JOIN users u ON l.assigned_to = u.id
                WHERE l.status = 'Chốt đơn' AND l.customer_id IS NULL
                ORDER BY COALESCE(l.won_at, l.created_at) DESC
                LIMIT $1
            `, [limit]);
            result.wonLeadsUnconverted = wonLeads.rows;
        }

        if (type === 'all' || type === 'unassigned_customers') {
            const unassignedCust = await db.query(`
                SELECT 
                    c.id, c.name, c.phone, c.customer_segment, c.created_at,
                    COALESCE((SELECT COUNT(*)::int FROM bookings b WHERE b.customer_id = c.id AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')), 0) as booking_count,
                    COALESCE((SELECT SUM(total_price) FROM bookings b WHERE b.customer_id = c.id AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')), 0) as total_spent
                FROM customers c
                WHERE c.assigned_to IS NULL
                ORDER BY c.created_at DESC
                LIMIT $1
            `, [limit]);
            result.unassignedCustomers = unassignedCust.rows;
        }

        if (type === 'all' || type === 'missing_phone') {
            const missingPhone = await db.query(`
                SELECT 
                    c.id, c.name, c.email, c.customer_segment, c.created_at,
                    COALESCE(u.full_name, u.username, 'Chưa giao') as assigned_to_name,
                    COALESCE((SELECT COUNT(*)::int FROM bookings b WHERE b.customer_id = c.id AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')), 0) as booking_count
                FROM customers c
                LEFT JOIN users u ON c.assigned_to = u.id
                WHERE c.phone IS NULL OR TRIM(c.phone) = ''
                ORDER BY c.created_at DESC
                LIMIT $1
            `, [limit]);
            result.missingPhoneCustomers = missingPhone.rows;
        }

        if (type === 'all' || type === 'duplicate_phones') {
            const dupPhones = await db.query(`
                WITH dup AS (
                    SELECT phone
                    FROM customers
                    WHERE phone IS NOT NULL AND TRIM(phone) != ''
                    GROUP BY phone
                    HAVING COUNT(*) > 1
                    LIMIT 20
                )
                SELECT 
                    c.id, c.name, c.phone, c.customer_segment, c.created_at,
                    COALESCE(u.full_name, u.username, 'Chưa giao') as assigned_to_name,
                    COALESCE((SELECT COUNT(*)::int FROM bookings b WHERE b.customer_id = c.id AND b.booking_status NOT IN ('Huỷ', 'CANCELLED')), 0) as booking_count
                FROM customers c
                JOIN dup ON c.phone = dup.phone
                LEFT JOIN users u ON c.assigned_to = u.id
                ORDER BY c.phone, c.created_at DESC
            `);
            
            // Nhóm theo số điện thoại
            const groupedDups = {};
            dupPhones.rows.forEach(cust => {
                if (!groupedDups[cust.phone]) {
                    groupedDups[cust.phone] = [];
                }
                groupedDups[cust.phone].push(cust);
            });

            result.duplicatePhoneGroups = Object.keys(groupedDups).map(phone => ({
                phone,
                customers: groupedDups[phone]
            }));
        }

        res.json(result);
    } catch (err) {
        console.error('Error in getDataIntegrityAudit:', err);
        res.status(500).json({ message: err.message });
    }
};
