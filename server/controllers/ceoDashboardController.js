const pool = require('../db');

exports.getCEODeparturesOverview = async (req, res) => {
    try {
        const { startDate, endDate, prevStartDate, prevEndDate, bu_group } = req.query;

        let dateFilter = '1=1';
        let params = [];
        if (startDate && endDate) {
            params.push(startDate, endDate);
            dateFilter = `td.start_date >= $1 AND td.start_date <= $2`;
        }

        let buFilter = '';
        if (bu_group && bu_group !== 'Tất cả') {
            params.push(bu_group);
            buFilter = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${params.length}`;
        }

        // Calculate previous period for Growth Indicators
        let prevDateFilter = '1=1';
        let prevParams = [];
        if (prevStartDate && prevEndDate) {
            prevParams.push(prevStartDate, prevEndDate);
            prevDateFilter = `td.start_date >= $1 AND td.start_date <= $2`;
        }
        
        let prevBuFilter = '';
        if (bu_group && bu_group !== 'Tất cả') {
            prevParams.push(bu_group);
            prevBuFilter = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${prevParams.length}`;
        }

        // 1. Revenue by Sale (Fix: Use created_by instead of assigned_to)
        const saleQuery = `
            SELECT 
                COALESCE(u.full_name, b.created_by_name, 'Chưa gán') as sale_name, 
                COALESCE(SUM(b.total_price), 0) as revenue, 
                COALESCE(SUM(b.paid), 0) as cashflow,
                COUNT(b.id) as booking_count,
                COALESCE(SUM(b.pax_count), 0) as total_pax
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
              ${buFilter}
            GROUP BY COALESCE(u.full_name, b.created_by_name, 'Chưa gán')
            ORDER BY revenue DESC;
        `;
        const saleRes = await pool.query(saleQuery, params);

        // 2. Revenue by BU
        const dateParams = (startDate && endDate) ? params.slice(0, 2) : [];
        const buQuery = `
            SELECT 
                COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group, 
                COALESCE(SUM(b.total_price), 0) as revenue,
                COALESCE(SUM(b.paid), 0) as cashflow
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
            GROUP BY tt.bu_group
            ORDER BY revenue DESC;
        `;
        const buRes = await pool.query(buQuery, dateParams);

        // 3. Revenue by Market (Aggregate by main country, e.g. "Trung Quốc, Lệ Giang" -> "Trung Quốc")
        const marketQuery = `
            SELECT 
                TRIM(SPLIT_PART(COALESCE(tt.destination, 'Khác'), ',', 1)) as market,
                COALESCE(SUM(b.total_price), 0) as revenue
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
              ${buFilter}
            GROUP BY TRIM(SPLIT_PART(COALESCE(tt.destination, 'Khác'), ',', 1))
            ORDER BY revenue DESC;
        `;
        const marketRes = await pool.query(marketQuery, params);

        // 4. Upcoming Departures Health
        let upcomingParams = [];
        let upcomingBuFilter = '';
        if (bu_group && bu_group !== 'Tất cả') {
            upcomingParams.push(bu_group);
            upcomingBuFilter = `AND COALESCE(tt.bu_group, 'Chưa phân loại') = $1`;
        }

        const upcomingQuery = `
            SELECT 
                td.id, td.start_date, td.status, tt.name as tour_name, 
                td.max_participants, COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group,
                COALESCE((SELECT SUM(pax_count) FROM bookings WHERE tour_departure_id = td.id AND booking_status != 'Huỷ' AND booking_status != 'Mới'), 0) as current_pax,
                COALESCE((SELECT SUM(total_price) FROM bookings WHERE tour_departure_id = td.id AND booking_status != 'Huỷ' AND booking_status != 'Mới'), 0) as total_revenue
            FROM tour_departures td
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE td.start_date >= CURRENT_DATE
              AND td.start_date <= CURRENT_DATE + interval '12 months'
              AND td.status != 'Huỷ'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              ${upcomingBuFilter}
            ORDER BY td.start_date ASC;
        `;
        const upcomingRes = await pool.query(upcomingQuery, upcomingParams);

        // 5. Total Stats for the selected period
        const totalQuery = `
            SELECT 
                COALESCE(SUM(b.total_price), 0) as total_revenue,
                COALESCE(SUM(b.paid), 0) as total_cashflow,
                COUNT(DISTINCT td.id) as total_departures,
                COALESCE(SUM(b.pax_count), 0) as total_pax
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
              ${buFilter};
        `;
        const totalRes = await pool.query(totalQuery, params);

        const prevTotalQuery = `
            SELECT 
                COALESCE(SUM(b.total_price), 0) as total_revenue,
                COALESCE(SUM(b.paid), 0) as total_cashflow,
                COUNT(DISTINCT td.id) as total_departures,
                COALESCE(SUM(b.pax_count), 0) as total_pax
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${prevDateFilter}
              ${prevBuFilter};
        `;
        const prevTotalRes = await pool.query(prevTotalQuery, prevParams);

        // 6. Sales Details for Modal Filtering
        const salesDetailsQuery = `
            SELECT 
                COALESCE(u.full_name, b.created_by_name, 'Chưa gán') as sale_name, 
                COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group,
                EXTRACT(MONTH FROM td.start_date) as month,
                EXTRACT(YEAR FROM td.start_date) as year,
                COALESCE(SUM(b.total_price), 0) as revenue, 
                COUNT(b.id) as booking_count,
                COALESCE(SUM(b.pax_count), 0) as total_pax
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
            GROUP BY sale_name, bu_group, month, year;
        `;
        const salesDetailsRes = await pool.query(salesDetailsQuery, dateParams);

        res.json({
            sales: saleRes.rows,
            sales_details: salesDetailsRes.rows,
            bus: buRes.rows,
            markets: marketRes.rows,
            upcoming: upcomingRes.rows,
            totals: totalRes.rows[0],
            prev_totals: prevTotalRes.rows[0] || {}
        });

    } catch (err) {
        console.error('Error in getCEODeparturesOverview:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.getDrilldownData = async (req, res) => {
    try {
        const { startDate, endDate, bu_group, type, value } = req.query;

        let params = [value];
        let dateFilter = '1=1';
        
        if (startDate && endDate) {
            params.push(startDate, endDate);
            dateFilter = `td.start_date >= $2 AND td.start_date <= $3`;
        }

        let buFilter = '';
        if (bu_group && bu_group !== 'Tất cả' && type !== 'bu_group') {
            params.push(bu_group);
            buFilter = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${params.length}`;
        }

        let typeFilter = "1=1";
        if (type === 'bu_group') {
            typeFilter = `COALESCE(tt.bu_group, 'Chưa phân loại') = $1`;
        } else if (type === 'market') {
            typeFilter = `TRIM(SPLIT_PART(COALESCE(tt.destination, 'Khác'), ',', 1)) = $1`;
        } else if (type === 'sale') {
             typeFilter = `COALESCE(u.full_name, b.created_by_name, 'Chưa gán') = $1`;
        } else if (type === 'tour') {
             typeFilter = `TRIM(tt.name) = $1`;
        }

        const query = `
            SELECT 
                td.id as departure_id,
                td.start_date,
                tt.name as tour_name,
                tt.code as tour_code,
                COALESCE(SUM(b.pax_count), 0) as total_pax,
                COALESCE(SUM(b.total_price), 0) as total_revenue,
                COALESCE(SUM(b.paid), 0) as total_cashflow
            FROM bookings b
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.booking_status != 'Huỷ' AND b.booking_status != 'Mới'
              AND tt.name NOT ILIKE '%[Tour Cũ]%'
              AND ${dateFilter}
              AND ${typeFilter}
              ${buFilter}
            GROUP BY td.id, td.start_date, tt.name, tt.code
            ORDER BY td.start_date ASC;
        `;

        const queryRes = await pool.query(query, params);
        res.json(queryRes.rows);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu drill-down CEO:', error);
        res.status(500).json({ status: 'error', message: 'Lỗi internal server' });
    }
};
