const pool = require('../db');

exports.getOverviewStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = '';
        const params = [];
        let paramIdx = 1;

        if (startDate && endDate) {
            // Support exact matching for start and end timestamp boundaries
            dateFilter = `AND created_at >= $${paramIdx} AND created_at <= $${paramIdx+1}`;
            params.push(startDate, endDate);
        }

        // 1. Get Leads Stats
        let leadsQuery = `
            SELECT 
                COUNT(*) as total_leads,
                COUNT(*) FILTER (WHERE status = 'Mới') as new_leads,
                COUNT(*) FILTER (WHERE status = 'Đã tư vấn' OR status = 'Tư vấn lần 2' OR status = 'Đã gửi báo giá/Lịch trình') as contacted_leads,
                COUNT(*) FILTER (WHERE status = 'Chốt đơn') as won_leads
            FROM leads 
            WHERE 1=1 ${dateFilter}
        `;
        const leadsRes = await pool.query(leadsQuery, params);
        const leadsData = leadsRes.rows[0];

        // 2. Get Revenue Stats from Bookings
        let bookingFilter = '';
        if (startDate && endDate) {
            bookingFilter = `AND created_at >= $1 AND created_at <= $2`;
        }
        let revenueQuery = `
            SELECT 
                COALESCE(SUM(total_price), 0) as total_revenue
            FROM bookings 
            WHERE 1=1 ${bookingFilter}
        `;
        const revenueRes = await pool.query(revenueQuery, params);
        const revenueData = revenueRes.rows[0];

        // 3. Active Departures (upcoming & running relative to today)
        let depsQuery = `
            SELECT COUNT(*) as active_departures
            FROM tour_departures
            WHERE start_date >= CURRENT_DATE 
            AND status != 'Huỷ'
        `;
        const depsRes = await pool.query(depsQuery);
        const depsData = depsRes.rows[0];

        // 4. Lead Source Distribution
        let sourceQuery = `
            SELECT 
                COALESCE(source, 'Khác') as source, 
                COUNT(*) as count
            FROM leads
            WHERE 1=1 ${dateFilter}
            GROUP BY source
            ORDER BY count DESC
        `;
        const sourceRes = await pool.query(sourceQuery, params);

        res.json({
            stats: {
                total_leads: parseInt(leadsData.total_leads) || 0,
                new_leads: parseInt(leadsData.new_leads) || 0,
                contacted_leads: parseInt(leadsData.contacted_leads) || 0,
                won_leads: parseInt(leadsData.won_leads) || 0,
                total_revenue: parseFloat(revenueData.total_revenue) || 0,
                active_departures: parseInt(depsData.active_departures) || 0
            },
            sourceDistribution: sourceRes.rows.map(r => ({
                source: r.source,
                count: parseInt(r.count) || 0
            }))
        });
    } catch (err) {
        console.error("Error in getOverviewStats:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu tổng quan', error: err.message });
    }
};

exports.getLeaderOverview = async (req, res) => {
    try {
        const { year, month, quarter, period } = req.query;
        let yearNum = year ? parseInt(year) : new Date().getFullYear();
        let monthNum = month ? parseInt(month) : new Date().getMonth() + 1;
        let qNum = quarter ? parseInt(quarter) : Math.floor((new Date().getMonth() + 3) / 3);
        let filterPeriod = period || 'month'; // 'month', 'quarter', 'year'
        
        let dateFilter, dateFilterBookings, dateFilterAds;
        let params = [yearNum];
        let prevParams = [];
        let dateFilterPrev, dateFilterBookingsPrev;

        if (filterPeriod === 'year') {
            dateFilter = "EXTRACT(YEAR FROM created_at) = $1";
            dateFilterBookings = "EXTRACT(YEAR FROM start_date) = $1";
            dateFilterAds = "year = $1";
            
            prevParams = [yearNum - 1];
            dateFilterPrev = "EXTRACT(YEAR FROM created_at) = $1";
            dateFilterBookingsPrev = "EXTRACT(YEAR FROM start_date) = $1";
        } else if (filterPeriod === 'quarter') {
            params.push(qNum);
            dateFilter = "EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(QUARTER FROM created_at) = $2";
            dateFilterBookings = "EXTRACT(YEAR FROM start_date) = $1 AND EXTRACT(QUARTER FROM start_date) = $2";
            let m1 = (qNum - 1) * 3 + 1;
            let m2 = m1 + 1;
            let m3 = m2 + 1;
            dateFilterAds = `year = $1 AND month IN (${m1}, ${m2}, ${m3}) AND $2=$2`;
            
            let prevQ = qNum === 1 ? 4 : qNum - 1;
            let prevY = qNum === 1 ? yearNum - 1 : yearNum;
            prevParams = [prevY, prevQ];
            dateFilterPrev = "EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(QUARTER FROM created_at) = $2";
            dateFilterBookingsPrev = "EXTRACT(YEAR FROM start_date) = $1 AND EXTRACT(QUARTER FROM start_date) = $2";
        } else {
            params.push(monthNum);
            dateFilter = "EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2";
            dateFilterBookings = "EXTRACT(YEAR FROM start_date) = $1 AND EXTRACT(MONTH FROM start_date) = $2";
            dateFilterAds = "year = $1 AND month = $2";
            
            let prevM = monthNum === 1 ? 12 : monthNum - 1;
            let prevY = monthNum === 1 ? yearNum - 1 : yearNum;
            prevParams = [prevY, prevM];
            dateFilterPrev = "EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2";
            dateFilterBookingsPrev = "EXTRACT(YEAR FROM start_date) = $1 AND EXTRACT(MONTH FROM start_date) = $2";
        }

        // 1. TOP METRICS
        // Booking Value (Doanh số Sales tạo mới trong tháng)
        const bookingRes = await pool.query(
            `SELECT COALESCE(SUM(total_price), 0) as booking_value,
                    COALESCE(SUM(pax_count), 0) as total_pax_booked
             FROM bookings 
             WHERE booking_status NOT IN ('Huỷ', 'Mới') AND ${dateFilter}`,
            params
        );
        const totalBookingValue = parseFloat(bookingRes.rows[0].booking_value);
        const totalPaxBooked = parseInt(bookingRes.rows[0].total_pax_booked);

        // Actual Revenue (Thực thu)
        const voucherRes = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as actual_revenue 
             FROM payment_vouchers 
             WHERE status = 'Đã duyệt' AND ${dateFilter}`,
            params
        );
        const actualRevenue = parseFloat(voucherRes.rows[0].actual_revenue);

        // Marketing Spend & Messages
        const adsRes = await pool.query(
            `SELECT 
                COALESCE(SUM(spend), 0) as total_spend,
                COALESCE(SUM(messages), 0) as total_messages 
             FROM marketing_ads_reports 
             WHERE ${dateFilterAds}`,
            params
        );
        const totalMarketingSpend = parseFloat(adsRes.rows[0].total_spend);
        const totalMessages = parseInt(adsRes.rows[0].total_messages);

        // Leads (Hồ sơ)
        const leadsRes = await pool.query(
            `SELECT 
                COUNT(*) as total_leads,
                COUNT(*) FILTER (WHERE status = 'Đã gửi báo giá/Lịch trình' OR status = 'Chốt đơn') as quoted_leads,
                COUNT(*) FILTER (WHERE status = 'Chốt đơn') as won_leads
             FROM leads 
             WHERE ${dateFilter}`,
            params
        );
        const totalLeads = parseInt(leadsRes.rows[0].total_leads);
        const quotedLeads = parseInt(leadsRes.rows[0].quoted_leads);
        
        // Calculate wonLeads based on actual bookings created in this period
        const wonRes = await pool.query(
            `SELECT COUNT(DISTINCT id) as won_leads 
             FROM bookings 
             WHERE booking_status NOT IN ('Huỷ', 'Mới') AND ${dateFilter}`,
            params
        );
        const wonLeads = parseInt(wonRes.rows[0].won_leads) + parseInt(leadsRes.rows[0].won_leads);

        const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
        const cpl = totalLeads > 0 ? totalMarketingSpend / totalLeads : 0;

        // 2. FUNNEL
        const funnel = [
            { name: 'Tổng Tin Nhắn', value: totalMessages },
            { name: 'Tổng Hồ Sơ', value: totalLeads },
            { name: 'Đã Báo Giá', value: quotedLeads },
            { name: 'Chốt Đơn', value: wonLeads }
        ];

        // 3. BU TOUR PERFORMANCE
        const toursRes = await pool.query(
            `SELECT 
                tt.bu_group,
                td.id as departure_id,
                tt.name as tour_name,
                td.code as tour_code,
                td.start_date,
                td.max_participants as max_pax,
                (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as sold_pax,
                (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as revenue,
                (SELECT COALESCE(SUM(pv.amount), 0) FROM payment_vouchers pv JOIN bookings b ON pv.booking_id::varchar = b.id::varchar WHERE b.tour_departure_id = td.id AND pv.status = 'Đã duyệt' AND b.booking_status NOT IN ('Huỷ', 'Mới')) as collected_revenue
             FROM tour_departures_raw td
             JOIN tour_templates tt ON td.tour_template_id = tt.id
             WHERE ${dateFilterBookings.replace(/start_date/g, 'td.start_date')}
             AND td.status != 'Huỷ'
             AND (td.is_deleted IS NULL OR td.is_deleted = false)
             ORDER BY tt.bu_group, td.start_date`,
            params
        );

        const buData = {};
        let totalTourMaxPax = 0;
        let totalTourSoldPax = 0;

        toursRes.rows.forEach(t => {
            totalTourMaxPax += parseInt(t.max_pax) || 0;
            totalTourSoldPax += parseInt(t.sold_pax) || 0;

            const bu = t.bu_group || 'Khác';
            if (!buData[bu]) {
                buData[bu] = {
                    bu_name: bu,
                    total_revenue: 0,
                    total_collected: 0,
                    total_pax: 0,
                    sold_pax: 0,
                    tours: []
                };
            }
            buData[bu].total_revenue += parseFloat(t.revenue) || 0;
            buData[bu].total_collected += parseFloat(t.collected_revenue) || 0;
            buData[bu].total_pax += parseInt(t.max_pax) || 0;
            buData[bu].sold_pax += parseInt(t.sold_pax) || 0;
            buData[bu].tours.push({
                departure_id: t.departure_id,
                tour_code: t.tour_code,
                tour_name: t.tour_name,
                start_date: t.start_date,
                max_pax: parseInt(t.max_pax) || 0,
                sold_pax: parseInt(t.sold_pax) || 0,
                revenue: parseFloat(t.revenue) || 0,
                collected_revenue: parseFloat(t.collected_revenue) || 0
            });
        });

        // 3.5 BU SALES PERFORMANCE
        const salesRes = await pool.query(`
            SELECT 
                sale_bu_group as bu_group,
                COALESCE(u.full_name, b.created_by_name, 'Chưa gán') as sale_name,
                COUNT(DISTINCT b.tour_departure_id) as tours_consulted,
                COUNT(b.id) as bookings_count,
                SUM(b.pax_count) as total_pax,
                SUM(b.total_price) as revenue,
                SUM(b.paid) as collected_revenue
            FROM tour_departures_raw td
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            JOIN bookings b ON b.tour_departure_id = td.id
            LEFT JOIN users u ON b.created_by = u.id
            CROSS JOIN LATERAL unnest(COALESCE(u.bus, ARRAY['Chưa gán'])) as sale_bu_group
            WHERE ${dateFilter.replace(/created_at/g, 'b.created_at')}
            AND (td.is_deleted IS NULL OR td.is_deleted = false)
            AND td.status != 'Huỷ'
            AND b.booking_status NOT IN ('Huỷ', 'Mới')
            GROUP BY sale_bu_group, COALESCE(u.full_name, b.created_by_name, 'Chưa gán')`, params);

        // Map sales performance to the respective BU
        salesRes.rows.forEach(s => {
            const bu = s.bu_group;
            if (!buData[bu]) {
                buData[bu] = {
                    bu_name: bu,
                    total_revenue: 0,
                    total_collected: 0,
                    total_pax: 0,
                    sold_pax: 0,
                    tours: [],
                    sales: []
                };
            }
            if (!buData[bu].sales) buData[bu].sales = [];
            
            buData[bu].sales.push({
                sale_name: s.sale_name,
                tours_consulted: parseInt(s.tours_consulted) || 0,
                bookings_count: parseInt(s.bookings_count) || 0,
                total_pax: parseInt(s.total_pax) || 0,
                revenue: parseFloat(s.revenue) || 0,
                collected_revenue: parseFloat(s.collected_revenue) || 0
            });
        });

        // Sort sales by revenue descending within each BU
        Object.values(buData).forEach(bu => {
            if (bu.sales) {
                bu.sales.sort((a, b) => b.revenue - a.revenue);
            }
        });

        // 3.8 PREVIOUS PERIOD BU TOUR PERFORMANCE & SALES
        const prevToursRes = await pool.query(
            `SELECT 
                tt.bu_group,
                (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as revenue
             FROM tour_departures_raw td
             JOIN tour_templates tt ON td.tour_template_id = tt.id
             WHERE ${dateFilterBookingsPrev.replace(/start_date/g, 'td.start_date')}
             AND td.status != 'Huỷ'
             AND (td.is_deleted IS NULL OR td.is_deleted = false)`,
            prevParams
        );

        const prevSalesRes = await pool.query(`
            SELECT 
                sale_bu_group as bu_group,
                SUM(b.total_price) as revenue
            FROM tour_departures_raw td
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            JOIN bookings b ON b.tour_departure_id = td.id
            LEFT JOIN users u ON b.created_by = u.id
            CROSS JOIN LATERAL unnest(COALESCE(u.bus, ARRAY['Chưa gán'])) as sale_bu_group
            WHERE ${dateFilterPrev.replace(/created_at/g, 'b.created_at')}
            AND (td.is_deleted IS NULL OR td.is_deleted = false)
            AND td.status != 'Huỷ'
            AND b.booking_status NOT IN ('Huỷ', 'Mới')
            GROUP BY sale_bu_group`, prevParams);

        const prevBuData = {};
        
        prevToursRes.rows.forEach(t => {
            const bu = t.bu_group || 'Khác';
            if (!prevBuData[bu]) prevBuData[bu] = { bu_name: bu, total_revenue: 0, sales_revenue: 0 };
            prevBuData[bu].total_revenue += parseFloat(t.revenue) || 0;
        });

        prevSalesRes.rows.forEach(s => {
            const bu = s.bu_group || 'Khác';
            if (!prevBuData[bu]) prevBuData[bu] = { bu_name: bu, total_revenue: 0, sales_revenue: 0 };
            prevBuData[bu].sales_revenue += parseFloat(s.revenue) || 0;
        });


        // 4. ALERTS
        // Unpaid bookings (start within 14 days)
        const unpaidRes = await pool.query(
            `SELECT b.booking_code, b.total_price, b.customer_id, b.tour_id, b.start_date, t.name as tour_name
             FROM bookings b
             JOIN tour_templates t ON b.tour_id = t.id
             WHERE b.payment_status != 'Đã thanh toán đủ' 
             AND b.booking_status = 'Thành công'
             AND b.start_date >= CURRENT_DATE 
             AND b.start_date <= CURRENT_DATE + INTERVAL '14 days'`
        );

        // Missing guides (start within 14 days)
        const noGuideRes = await pool.query(
            `SELECT td.code, td.start_date, tt.name as tour_name
             FROM tour_departures_raw td
             JOIN tour_templates tt ON td.tour_template_id = tt.id
             WHERE td.guide_id IS NULL
             AND td.status != 'Huỷ'
             AND (td.is_deleted IS NULL OR td.is_deleted = false)
             AND td.start_date >= CURRENT_DATE
             AND td.start_date <= CURRENT_DATE + INTERVAL '14 days'`
        );

        // Work Schedules
        const scheduleRes = await pool.query(
            `SELECT 
                u.id as user_id,
                u.full_name,
                u.bus,
                TO_CHAR(lrd.leave_date, 'YYYY-MM-DD') as leave_date,
                lr.leave_type
             FROM users u
             LEFT JOIN leave_requests lr ON lr.user_id = u.id AND lr.status = 'approved'
             LEFT JOIN leave_request_dates lrd ON lrd.leave_request_id = lr.id 
                AND ${dateFilter.replace(/created_at/g, 'lrd.leave_date')}
             WHERE u.is_active = true
             ORDER BY u.id`,
            params
        );
        
        const scheduleData = {};
        scheduleRes.rows.forEach(r => {
            const bus = r.bus || ['Chưa gán'];
            bus.forEach(bu => {
                if (!scheduleData[bu]) {
                    scheduleData[bu] = { bu_name: bu, users: {} };
                }
                if (!scheduleData[bu].users[r.user_id]) {
                    scheduleData[bu].users[r.user_id] = {
                        user_id: r.user_id,
                        full_name: r.full_name,
                        leaves: []
                    };
                }
                if (r.leave_date) {
                    scheduleData[bu].users[r.user_id].leaves.push({
                        date: r.leave_date,
                        type: r.leave_type
                    });
                }
            });
        });
        
        Object.keys(scheduleData).forEach(bu => {
            scheduleData[bu].users = Object.values(scheduleData[bu].users);
        });

        res.json({
            topMetrics: {
                totalBookingValue,
                totalPaxBooked,
                actualRevenue,
                totalMarketingSpend,
                winRate: parseFloat(winRate.toFixed(2)),
                cpl: Math.round(cpl),
                totalDepartures: toursRes.rows.length,
                totalTourMaxPax,
                totalTourSoldPax
            },
            funnel,
            tourPerformance: Object.values(buData),
            prevTourPerformance: Object.values(prevBuData),
            workSchedules: Object.values(scheduleData),
            alerts: {
                unpaidBookings: unpaidRes.rows,
                missingGuides: noGuideRes.rows
            }
        });
    } catch (err) {
        console.error("Error in getLeaderOverview:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.getEmployeeProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { period, year, month, quarter } = req.query;
        
        let yearNum = parseInt(year) || new Date().getFullYear();
        let monthNum = parseInt(month) || new Date().getMonth() + 1;
        let qNum = parseInt(quarter) || Math.ceil((new Date().getMonth() + 1) / 3);

        let dateFilter = "";
        let params = [userId, yearNum];

        if (period === 'year') {
            dateFilter = "EXTRACT(YEAR FROM created_at) = $2";
        } else if (period === 'quarter') {
            dateFilter = "EXTRACT(YEAR FROM created_at) = $2 AND EXTRACT(QUARTER FROM created_at) = $3";
            params.push(qNum);
        } else {
            dateFilter = "EXTRACT(YEAR FROM created_at) = $2 AND EXTRACT(MONTH FROM created_at) = $3";
            params.push(monthNum);
        }

        // Fetch User Info
        const userRes = await pool.query(
            `SELECT full_name, avatar_url, position, created_at, email, phone 
             FROM users WHERE id = $1`, [userId]
        );
        if (userRes.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
        const user = userRes.rows[0];

        // Tours they are operating in this period
        const toursRes = await pool.query(`
            SELECT COUNT(td.id) as count 
            FROM tour_departures_raw td
            WHERE td.operator_id = $1 
            AND td.status != 'Huỷ'
            AND (td.is_deleted IS NULL OR td.is_deleted = false)
            AND ${dateFilter.replace(/created_at/g, 'td.start_date')}
        `, params);
        
        const toursOperatingCount = parseInt(toursRes.rows[0].count) || 0;

        const toursListRes = await pool.query(`
            SELECT 
                td.id, 
                td.code, 
                tt.name as template_name,
                td.start_date, 
                td.max_participants,
                (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as sold,
                (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as revenue
            FROM tour_departures_raw td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE td.operator_id = $1 
            AND td.status != 'Huỷ'
            AND (td.is_deleted IS NULL OR td.is_deleted = false)
            AND ${dateFilter.replace(/created_at/g, 'td.start_date')}
            ORDER BY td.start_date ASC
        `, params);

        // Total Bookings, Pax, Revenue won in this period (using b.created_at)
        const perfRes = await pool.query(`
            SELECT 
                COUNT(b.id) as bookings_count,
                COALESCE(SUM(b.pax_count), 0) as total_pax,
                COALESCE(SUM(b.total_price), 0) as revenue,
                COALESCE(SUM(b.paid), 0) as collected_revenue
            FROM bookings b
            WHERE b.created_by = $1 
            AND b.booking_status NOT IN ('Huỷ', 'Mới')
            AND ${dateFilter.replace(/created_at/g, 'b.created_at')}
        `, params);

        const perf = perfRes.rows[0];
        const bookingsCount = parseInt(perf.bookings_count) || 0;

        const bookingsListRes = await pool.query(`
            SELECT 
                b.id,
                COALESCE(c.name, b.new_customer_info->>'name', 'Khách vãng lai') as customer_name,
                b.pax_count,
                b.total_price,
                b.paid,
                b.created_at,
                td.code as tour_code,
                tt.name as tour_name
            FROM bookings b
            LEFT JOIN tour_departures_raw td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.created_by = $1 
            AND b.booking_status NOT IN ('Huỷ', 'Mới')
            AND ${dateFilter.replace(/created_at/g, 'b.created_at')}
            ORDER BY b.created_at DESC
        `, params);

        res.json({
            user: {
                ...user,
                // created_at is returned, frontend will calculate working time
            },
            performance: {
                toursOperatingCount,
                bookingsCount,
                totalPax: parseInt(perf.total_pax) || 0,
                revenue: parseFloat(perf.revenue) || 0,
                collectedRevenue: parseFloat(perf.collected_revenue) || 0
            },
            toursList: toursListRes.rows,
            bookingsList: bookingsListRes.rows
        });

    } catch (err) {
        console.error("Error in getEmployeeProfile:", err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
