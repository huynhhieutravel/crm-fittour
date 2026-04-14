const db = require('../db');
const { logActivity } = require('../utils/logger');

// Check HDV overlap across BOTH tour_departures AND group_projects
const checkGuideOverlapAll = async (guide_id, start_date, end_date, exclude_group_project_id = null) => {
    if (!guide_id || !start_date || !end_date) return null;

    // Check tour_departures
    const depResult = await db.query(`
        SELECT td.id, tt.name as tour_name, td.start_date, td.end_date
        FROM tour_departures td
        LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE td.guide_id = $1 AND td.status != 'Huỷ'
        AND (td.start_date <= $3 AND td.end_date >= $2)
    `, [guide_id, start_date, end_date]);
    if (depResult.rows.length > 0) {
        const conflict = depResult.rows[0];
        return `HDV đã có lịch Tour "${conflict.tour_name || 'N/A'}" (${new Date(conflict.start_date).toLocaleDateString('vi-VN')} - ${new Date(conflict.end_date).toLocaleDateString('vi-VN')}). Vui lòng chọn HDV khác hoặc đổi ngày.`;
    }

    // Check other group_projects
    let gpQuery = `
        SELECT id, name, departure_date, return_date
        FROM group_projects
        WHERE guide_id = $1 AND status NOT IN ('Chưa thành công')
        AND departure_date IS NOT NULL AND return_date IS NOT NULL
        AND (departure_date <= $3 AND return_date >= $2)
    `;
    const gpParams = [guide_id, start_date, end_date];
    if (exclude_group_project_id) {
        gpQuery += ` AND id != $4`;
        gpParams.push(exclude_group_project_id);
    }
    const gpResult = await db.query(gpQuery, gpParams);
    if (gpResult.rows.length > 0) {
        const conflict = gpResult.rows[0];
        return `HDV đã có lịch Dự án Đoàn "${conflict.name}" (${new Date(conflict.departure_date).toLocaleDateString('vi-VN')} - ${new Date(conflict.return_date).toLocaleDateString('vi-VN')}). Vui lòng chọn HDV khác hoặc đổi ngày.`;
    }

    return null; // No overlap
};

exports.getAllProjects = async (req, res) => {
    try {
        const isPrivileged = ['admin', 'manager', 'group_manager'].includes(req.user.role);
        const isGroupStaff = req.user.role === 'group_staff';

        // Group Staff: only see projects linked to companies they are assigned to
        const whereClause = (!isPrivileged && isGroupStaff) 
            ? 'WHERE c.assigned_to = $1' 
            : '';
        const params = (!isPrivileged && isGroupStaff) 
            ? [req.user.id] 
            : [];

        const result = await db.query(`
            SELECT gp.*, gl.name as leader_name, 
                   COALESCE(c.name, gl.company_name) as company_name, 
                   gl.phone as leader_phone, gl.email as leader_email,
                   u.full_name as assigned_name, u.username as assigned_username,
                   c.id as linked_company_id,
                   c.assigned_to as company_assigned_to,
                   cu.full_name as company_assigned_name,
                   gp.guide_ids,
                   (SELECT array_agg(g2.name) FROM guides g2 WHERE g2.id = ANY(gp.guide_ids)) as guide_names
            FROM group_projects gp
            LEFT JOIN group_leaders gl ON gp.group_leader_id = gl.id
            LEFT JOIN b2b_companies c ON gp.company_id = c.id
            LEFT JOIN users u ON COALESCE(gp.assigned_to, c.assigned_to) = u.id
            LEFT JOIN users cu ON c.assigned_to = cu.id
            ${whereClause}
            ORDER BY gp.created_at DESC
        `, params);

        // Masking logic based on ownership of the project
        const projects = result.rows.map(p => {
            const isOwner = p.assigned_to === req.user.id;
            const canViewRaw = isPrivileged || isOwner;

            if (!canViewRaw) {
                return {
                    ...p,
                    leader_name: p.leader_name ? p.leader_name + ' (***)' : null,
                    company_name: p.company_name ? p.company_name + ' (***)' : null,
                    leader_phone: p.leader_phone ? '***' : null,
                    leader_email: p.leader_email ? '***' : null
                };
            }
            return p;
        });

        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, profit, assigned_to, company_id, guide_ids } = req.body;
        
        // Auto-inherit assigned_to from b2b_companies if not explicitly set
        let finalAssignedTo = assigned_to || null;
        let finalCompanyId = company_id || null;
        if (!finalAssignedTo && group_leader_id) {
            const leaderRes = await db.query('SELECT company_id FROM group_leaders WHERE id = $1', [group_leader_id]);
            if (leaderRes.rows.length > 0 && leaderRes.rows[0].company_id) {
                finalCompanyId = leaderRes.rows[0].company_id;
                const compRes = await db.query('SELECT assigned_to FROM b2b_companies WHERE id = $1', [finalCompanyId]);
                if (compRes.rows.length > 0) finalAssignedTo = compRes.rows[0].assigned_to;
            }
        }

        const finalGuideIds = Array.isArray(guide_ids) ? guide_ids.filter(Boolean) : [];
        
        const result = await db.query(`
            INSERT INTO group_projects 
            (name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, profit, assigned_to, company_id, guide_ids)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
        `, [name, group_leader_id || null, source, status || 'Báo giá', destination, parseInt(expected_pax)||0, parseFloat(price_per_pax)||0, departure_date||null, return_date||null, expected_month||null, parseFloat(total_revenue)||0, parseFloat(profit)||0, finalAssignedTo, finalCompanyId, finalGuideIds]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, group_leader_id, source, status, destination, expected_pax, price_per_pax, departure_date, return_date, expected_month, total_revenue, profit, assigned_to, guide_ids } = req.body;
        
        const finalGuideIds = Array.isArray(guide_ids) ? guide_ids.filter(Boolean) : [];

        const result = await db.query(`
            UPDATE group_projects
            SET name=$1, group_leader_id=$2, source=$3, status=$4, destination=$5, expected_pax=$6, price_per_pax=$7, departure_date=$8, return_date=$9, expected_month=$10, total_revenue=$11, profit=$12, assigned_to=$13, guide_ids=$14, updated_at=CURRENT_TIMESTAMP
            WHERE id=$15 RETURNING *
        `, [name, group_leader_id || null, source, status, destination, parseInt(expected_pax)||0, parseFloat(price_per_pax)||0, departure_date||null, return_date||null, expected_month||null, parseFloat(total_revenue)||0, parseFloat(profit)||0, assigned_to || null, finalGuideIds, id]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await db.query('DELETE FROM group_projects WHERE id=$1', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProjectStats = async (req, res) => {
    try {
        const { startDate, endDate, groupBy, chartStartDate, chartEndDate, chartGroupBy } = req.query;

        // Base conditions for KPIs
        let timeCondition = "gp.status != 'Chưa thành công'";
        const params = [];

        if (startDate && endDate) {
            params.push(startDate, endDate);
            timeCondition += ` AND COALESCE(gp.departure_date, gp.created_at::date) >= $1 AND COALESCE(gp.departure_date, gp.created_at::date) <= $2`;
        }

        // 1. KPI Overview (Pax, Projects, Revenue, Profit - only successful count for financials)
        const kpiQuery = `
            SELECT 
                COUNT(*) as total_projects,
                SUM(gp.expected_pax) as total_pax,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.total_revenue ELSE 0 END) as total_revenue,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.profit ELSE 0 END) as total_profit,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN 1 ELSE 0 END) as won_projects,
                SUM(CASE WHEN gp.status IN ('Báo giá', 'Đang theo dõi', 'Mới') THEN gp.total_revenue ELSE 0 END) as pipeline_revenue,
                SUM(CASE WHEN gp.status IN ('Báo giá', 'Đang theo dõi', 'Mới') THEN 1 ELSE 0 END) as pipeline_projects
            FROM group_projects gp
            WHERE ${timeCondition}
        `;
        const kpiRes = await db.query(kpiQuery, params);

        // 2. Status Distribution (Include everything including failures for the pie chart)
        let statusCondition = "1=1";
        if (startDate && endDate) {
            statusCondition = `created_at >= $1 AND created_at <= $2`;
        }
        const statusQuery = `
            SELECT status, COUNT(*) as count 
            FROM group_projects 
            WHERE ${statusCondition}
            GROUP BY status 
            ORDER BY count DESC
        `;
        const statusRes = await db.query(statusQuery, params.length ? params : []);

        // 3. Top B2B Companies (By Profit/Revenue)
        const b2bQuery = `
            SELECT 
                c.name as company_name, 
                COUNT(gp.id) as total_projects,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.total_revenue ELSE 0 END) as total_revenue,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.profit ELSE 0 END) as total_profit
            FROM group_projects gp
            JOIN b2b_companies c ON gp.company_id = c.id
            WHERE ${timeCondition}
            GROUP BY c.id, c.name
            ORDER BY total_profit DESC, total_revenue DESC
            LIMIT 10
        `;
        const b2bRes = await db.query(b2bQuery, params);

        // 4. Sales Performance
        const salesQuery = `
            SELECT 
                u.full_name as sales_name, 
                COUNT(gp.id) as total_projects,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN 1 ELSE 0 END) as won_projects,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.total_revenue ELSE 0 END) as total_revenue,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.profit ELSE 0 END) as total_profit
            FROM group_projects gp
            JOIN users u ON COALESCE(gp.assigned_to, (SELECT assigned_to FROM b2b_companies c WHERE c.id = gp.company_id)) = u.id
            WHERE ${timeCondition}
            GROUP BY u.id, u.full_name
            ORDER BY total_profit DESC, won_projects DESC
            LIMIT 10
        `;
        const salesRes = await db.query(salesQuery, params);

        // 5. Time Series (Independent from KPI filter)
        let tsTimeCondition = "gp.status != 'Chưa thành công'";
        const tsParams = [];

        if (chartStartDate && chartEndDate) {
            tsParams.push(chartStartDate, chartEndDate);
            tsTimeCondition += ` AND COALESCE(gp.departure_date, gp.created_at::date) >= $1 AND COALESCE(gp.departure_date, gp.created_at::date) <= $2`;
        } else if (startDate && endDate) {
            tsParams.push(startDate, endDate);
            tsTimeCondition += ` AND COALESCE(gp.departure_date, gp.created_at::date) >= $1 AND COALESCE(gp.departure_date, gp.created_at::date) <= $2`;
        }

        let dateFormat = "YYYY-MM-DD";
        if (chartGroupBy === 'month' || (!chartGroupBy && groupBy === 'month')) dateFormat = "YYYY-MM";
        if (chartGroupBy === 'quarter') dateFormat = 'YYYY-"Q"Q';
        if (chartGroupBy === 'year') dateFormat = "YYYY";
        
        const timeSeriesQuery = `
            SELECT 
                TO_CHAR(COALESCE(gp.departure_date, gp.created_at::date), '${dateFormat}') as period,
                COUNT(*) as count,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.total_revenue ELSE 0 END) as revenue,
                SUM(CASE WHEN gp.status IN ('Thành công', 'Đã quyết toán') THEN gp.profit ELSE 0 END) as profit
            FROM group_projects gp
            WHERE ${tsTimeCondition}
            GROUP BY TO_CHAR(COALESCE(gp.departure_date, gp.created_at::date), '${dateFormat}')
            ORDER BY period ASC
        `;
        const timeSeriesRes = await db.query(timeSeriesQuery, tsParams);

        res.json({
            kpi: kpiRes.rows[0],
            statusStats: statusRes.rows,
            b2bStats: b2bRes.rows,
            salesStats: salesRes.rows,
            timeSeries: timeSeriesRes.rows
        });
    } catch (err) {
        console.error("getProjectStats Error:", err);
        res.status(500).json({ message: err.message });
    }
};
