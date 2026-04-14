const pool = require('../db');

exports.getFullDashboardMetrics = async (req, res) => {
    try {
        const { year, month } = req.query;
        let yearNum = year ? parseInt(year) : new Date().getFullYear();
        let monthNum = month ? parseInt(month) : null;
        
        const paramsFilter = [];
        let dateFilter = '';
        if (monthNum) {
            paramsFilter.push(yearNum, monthNum);
            dateFilter = ` AND year = $1 AND month = $2 `;
        } else {
            paramsFilter.push(yearNum);
            dateFilter = ` AND year = $1 `;
        }

        let spendTrendQuery;
        let spendTrendRes;
        let spendTrendBUQuery;
        let spendTrendBURes;

        if (monthNum) {
            // Nhóm theo tuần (1 đến 5) nếu filter Trong Tháng
            spendTrendQuery = `
                WITH Weeks AS (
                    SELECT generate_series(1, 5) AS week_num
                ),
                WeeklyAgg AS (
                    SELECT 
                        week_number,
                        COALESCE(SUM(spend), 0) AS total_spend,
                        COALESCE(SUM(messages), 0) AS total_messages,
                        COALESCE(SUM(leads), 0) AS total_leads
                    FROM marketing_ads_reports
                    WHERE year = $1 AND month = $2
                    GROUP BY week_number
                )
                SELECT 
                    'Tuần ' || w.week_num::text AS month,
                    COALESCE(a.total_spend, 0) AS "MarketingSpend",
                    COALESCE(a.total_messages, 0) AS "Messages",
                    COALESCE(a.total_leads, 0) AS "Leads",
                    CASE WHEN COALESCE(a.total_leads, 0) > 0 THEN 
                        ROUND((COALESCE(a.total_spend, 0) / COALESCE(a.total_leads, 1))::numeric, 0) 
                    ELSE 0 END AS avg_cpl
                FROM Weeks w
                LEFT JOIN WeeklyAgg a ON w.week_num = a.week_number
                ORDER BY w.week_num;
            `;
            spendTrendRes = await pool.query(spendTrendQuery, [yearNum, monthNum]);

            spendTrendBUQuery = `
                SELECT 
                    'Tuần ' || week_number::text AS month,
                    bu_name,
                    COALESCE(SUM(spend), 0) AS spend,
                    COALESCE(SUM(messages), 0) AS messages,
                    COALESCE(SUM(leads), 0) AS leads
                FROM marketing_ads_reports
                WHERE year = $1 AND month = $2
                GROUP BY week_number, bu_name
                ORDER BY week_number ASC, bu_name ASC;
            `;
            spendTrendBURes = await pool.query(spendTrendBUQuery, [yearNum, monthNum]);
        } else {
            // Nhóm theo tháng (1 đến 12) nếu filter Trong Năm
            spendTrendQuery = `
                WITH Months AS (
                    SELECT generate_series(1, 12) AS month_num
                ),
                MonthlyAgg AS (
                    SELECT 
                        month,
                        COALESCE(SUM(spend), 0) AS total_spend,
                        COALESCE(SUM(messages), 0) AS total_messages,
                        COALESCE(SUM(leads), 0) AS total_leads
                    FROM marketing_ads_reports
                    WHERE year = $1
                    GROUP BY month
                )
                SELECT 
                    TO_CHAR(TO_DATE(m.month_num::text, 'MM'), 'MM') AS month,
                    COALESCE(a.total_spend, 0) AS "MarketingSpend",
                    COALESCE(a.total_messages, 0) AS "Messages",
                    COALESCE(a.total_leads, 0) AS "Leads",
                    CASE WHEN COALESCE(a.total_leads, 0) > 0 THEN 
                        ROUND((COALESCE(a.total_spend, 0) / COALESCE(a.total_leads, 1))::numeric, 0) 
                    ELSE 0 END AS avg_cpl
                FROM Months m
                LEFT JOIN MonthlyAgg a ON m.month_num = a.month
                ORDER BY m.month_num;
            `;
            spendTrendRes = await pool.query(spendTrendQuery, [yearNum]);

            spendTrendBUQuery = `
                SELECT 
                    TO_CHAR(TO_DATE((year::text || '-' || LPAD(month::text, 2, '0') || '-01'), 'YYYY-MM-DD'), 'MM') AS month,
                    bu_name,
                    COALESCE(SUM(spend), 0) AS spend,
                    COALESCE(SUM(messages), 0) AS messages,
                    COALESCE(SUM(leads), 0) AS leads
                FROM marketing_ads_reports
                WHERE year = $1
                GROUP BY year, month, bu_name
                ORDER BY month ASC, bu_name ASC;
            `;
            spendTrendBURes = await pool.query(spendTrendBUQuery, [yearNum]);
        }

        // 2. BU COMPARISON
        let buComparisonQuery = `
            SELECT 
                bu_name,
                COALESCE(SUM(spend), 0) AS total_spend,
                COALESCE(SUM(messages), 0) AS total_messages,
                COALESCE(SUM(leads), 0) AS total_leads,
                CASE WHEN COALESCE(SUM(leads), 0) > 0 THEN 
                    ROUND((SUM(spend) / SUM(leads))::numeric, 0) 
                ELSE 0 END AS avg_cpl
            FROM marketing_ads_reports
            WHERE 1=1 ${dateFilter}
            GROUP BY bu_name
            ORDER BY total_spend DESC;
        `;
        const buSalesRes = await pool.query(buComparisonQuery, paramsFilter);

        // 3. CAMPAIGN LEADERBOARD (Top Chiến Dịch Đốt Tiền & Kéo Khách)
        let leaderboardQuery = `
            SELECT 
                campaign_name as name,
                bu_name as username,
                COALESCE(SUM(spend), 0) as spend,
                COALESCE(SUM(leads), 0) as won_leads,
                CASE WHEN SUM(leads) > 0 THEN ROUND((SUM(spend) / SUM(leads))::numeric, 0) ELSE 0 END as conversion_rate
            FROM marketing_ads_reports
            WHERE 1=1 ${dateFilter}
            GROUP BY campaign_name, bu_name
            ORDER BY spend DESC
            LIMIT 15;
        `;
        const leaderboardRes = await pool.query(leaderboardQuery, paramsFilter);

        // Pivot Monthly Trend Data with BU splits
        const pivotedCashflow = spendTrendRes.rows.map(m => {
             const monthData = { 
                 month: m.month, 
                 MarketingSpend: parseFloat(m.MarketingSpend) || 0, 
                 Messages: parseFloat(m.Messages) || 0, 
                 Leads: parseFloat(m.Leads) || 0, 
                 avg_cpl: parseFloat(m.avg_cpl) || 0
             };
             // Pivot BU data into this month
             spendTrendBURes.rows.forEach(buRow => {
                  if (buRow.month === m.month) {
                      monthData[`${buRow.bu_name}_spend`] = parseFloat(buRow.spend) || 0;
                      monthData[`${buRow.bu_name}_leads`] = parseFloat(buRow.leads) || 0;
                      monthData[`${buRow.bu_name}_messages`] = parseFloat(buRow.messages) || 0;
                      monthData[`${buRow.bu_name}_cpl`] = parseFloat(buRow.leads) > 0 ? Math.round(parseFloat(buRow.spend) / parseFloat(buRow.leads)) : 0;
                  }
             });
             return monthData;
        });

        // 4. BIG NUMBERS (KPI TỔNG)
        let funnelQuery = `
            SELECT 
                COALESCE(SUM(spend), 0) as total_spend,
                COALESCE(SUM(messages), 0) as total_messages,
                COALESCE(SUM(leads), 0) as total_leads
            FROM marketing_ads_reports
            WHERE 1=1 ${dateFilter};
        `;
        const funnelRes = await pool.query(funnelQuery, paramsFilter);
        const f = funnelRes.rows[0];
        const funnelData = [
            { name: 'Tổng Spend', value: parseFloat(f.total_spend) || 0, fill: '#3b82f6' },
            { name: 'Tổng Tin Nhắn', value: parseInt(f.total_messages) || 0, fill: '#8b5cf6' },
            { name: 'Tổng Leads', value: parseInt(f.total_leads) || 0, fill: '#f59e0b' }
        ];

        res.json({
            cashflow: pivotedCashflow,
            buComparison: buSalesRes.rows,
            leaderboard: leaderboardRes.rows,
            funnel: funnelData
        });

    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu Management Dashboard Marketing:', err);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
