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
            AND status != 'Cancelled'
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
