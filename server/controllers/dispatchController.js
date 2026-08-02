const db = require('../db');
const moment = require('moment-timezone');

function calculateSLAMinutes(startTime, endTime) {
    if (!startTime || !endTime) return null;
    let start = moment(startTime).tz('Asia/Ho_Chi_Minh');
    let end = moment(endTime).tz('Asia/Ho_Chi_Minh');

    if (start.isAfter(end)) return 0;

    let totalMinutes = 0;
    let current = start.clone();
    
    while (current.isBefore(end, 'day')) {
        let dayEnd = current.clone().hour(20).minute(0).second(0).millisecond(0);
        let dayStart = current.clone().hour(8).minute(0).second(0).millisecond(0);
        
        if (current.isBefore(dayStart)) {
            current = dayStart.clone();
        }
        
        if (current.isBefore(dayEnd)) {
            totalMinutes += dayEnd.diff(current, 'minutes');
        }
        
        current.add(1, 'day').hour(8).minute(0).second(0).millisecond(0);
    }
    
    let finalDayEnd = end.clone();
    let dayEnd = end.clone().hour(20).minute(0).second(0).millisecond(0);
    let dayStart = end.clone().hour(8).minute(0).second(0).millisecond(0);
    
    if (finalDayEnd.isAfter(dayEnd)) {
        finalDayEnd = dayEnd.clone();
    }
    
    if (current.isBefore(dayStart)) {
        current = dayStart.clone();
    }
    
    if (current.isBefore(finalDayEnd)) {
        totalMinutes += finalDayEnd.diff(current, 'minutes');
    }
    
    return totalMinutes;
}

exports.getDashboard = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateCondition = "l.created_at >= CURRENT_DATE"; // Default to today
        let queryParams = [];

        if (startDate && endDate) {
            dateCondition = "l.created_at >= $1 AND l.created_at <= $2";
            queryParams = [startDate, endDate];
        }

        // 1. Alerts: Unassigned leads created > 30 minutes ago within the period
        const alertsQuery = `
            SELECT l.id, l.name, l.phone, l.source, l.created_at, l.bu_group, l.tour_id, l.classification, t.name as tour_name, l.facebook_psid
            FROM leads l
            LEFT JOIN tour_templates t ON l.tour_id = t.id
            WHERE l.assigned_to IS NULL 
              AND (l.classification IS NULL OR l.classification != 'Không Nhu Cầu')
              AND ${dateCondition}
            ORDER BY l.created_at ASC
        `;
        const alertsResult = await db.pool.query(alertsQuery, queryParams);
        
        // Filter in JS for > 30 minutes SLA
        const alerts = alertsResult.rows.filter(lead => {
            let sla_minutes = calculateSLAMinutes(lead.created_at, new Date());
            lead.sla_minutes = sla_minutes;
            return sla_minutes > 30;
        });

        // 2. Workload: Active leads per user within the period
        const workloadQuery = `
            SELECT u.id as user_id, u.full_name, u.username, l.bu_group, count(l.id)::int as active_leads
            FROM leads l
            JOIN users u ON l.assigned_to = u.id
            WHERE l.status IS DISTINCT FROM 'Chốt đơn'
              AND ${dateCondition}
            GROUP BY u.id, u.full_name, u.username, l.bu_group
            ORDER BY active_leads DESC
        `;
        const workloadResult = await db.pool.query(workloadQuery, queryParams);
        const workload = workloadResult.rows;

        // 3. Leaderboard: Avg Claim Time for the period
        const leaderboardQuery = `
            SELECT l.assigned_to, u.full_name, u.username, l.bu_group, 
                   l.created_at, l.assigned_at
            FROM leads l
            JOIN users u ON l.assigned_to = u.id
            WHERE l.assigned_to IS NOT NULL 
              AND l.assigned_at IS NOT NULL
              AND ${dateCondition}
        `;
        const lbResult = await db.pool.query(leaderboardQuery, queryParams);
        
        // Group by user and calculate average SLA
        const userStats = {};
        lbResult.rows.forEach(lead => {
            const key = `${lead.assigned_to}_${lead.bu_group}`;
            if (!userStats[key]) {
                userStats[key] = {
                    user_id: lead.assigned_to,
                    full_name: lead.full_name,
                    username: lead.username,
                    bu_group: lead.bu_group,
                    total_sla_minutes: 0,
                    lead_count: 0
                };
            }
            let sla = calculateSLAMinutes(lead.created_at, lead.assigned_at);
            if (sla !== null) {
                userStats[key].total_sla_minutes += sla;
                userStats[key].lead_count += 1;
            }
        });

        const leaderboard = Object.values(userStats).map(stat => ({
            ...stat,
            avg_sla_minutes: stat.lead_count > 0 ? (stat.total_sla_minutes / stat.lead_count).toFixed(1) : 0
        })).sort((a, b) => a.avg_sla_minutes - b.avg_sla_minutes);

        // 4. BU Counts: Count total leads (and maybe chat amount) per BU within the period
        const buQuery = `
            SELECT 
                bu_group, 
                count(id)::int as total_leads,
                count(assigned_to)::int as assigned_leads,
                sum(case when assigned_to is null then 1 else 0 end)::int as unassigned_leads
            FROM leads l
            WHERE ${dateCondition}
            GROUP BY bu_group
            ORDER BY bu_group ASC
        `;
        const buResult = await db.pool.query(buQuery, queryParams);
        const buCounts = buResult.rows;

        // Attach average SLA to workload and buCounts using leaderboard data
        workload.forEach(w => {
            const stat = leaderboard.find(l => l.user_id === w.user_id && l.bu_group === w.bu_group);
            w.avg_sla_minutes = stat ? stat.avg_sla_minutes : 0;
            w.processed_leads = stat ? stat.lead_count : 0;
        });

        buCounts.forEach(bu => {
            const buStats = leaderboard.filter(l => l.bu_group === bu.bu_group);
            let totalSla = 0;
            let totalLeads = 0;
            buStats.forEach(s => {
                totalSla += s.total_sla_minutes || 0;
                totalLeads += s.lead_count || 0;
            });
            bu.avg_sla_minutes = totalLeads > 0 ? (totalSla / totalLeads).toFixed(1) : 0;
        });

        res.json({
            alerts,
            workload,
            leaderboard,
            buCounts
        });
    } catch (err) {
        console.error('Lỗi getDashboard:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.assignLead = async (req, res) => {
    const leadId = req.params.id;
    const { assigned_to } = req.body;
    
    if (!assigned_to) {
        return res.status(400).json({ message: 'Thiếu người phụ trách' });
    }

    try {
        const updateRes = await db.pool.query(
            `UPDATE leads 
             SET assigned_to = $1, 
                 status = 'Đang liên hệ', 
                 assigned_at = NOW(), 
                 updated_at = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [assigned_to, leadId]
        );
        if (updateRes.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy Lead' });
        }
        res.json({ message: 'Gán Lead thành công', lead: updateRes.rows[0] });
    } catch (error) {
        console.error('Dispatch Assign Error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.saveSnapshot = async (req, res) => {
    try {
        const { date, data } = req.body;
        if (!date || !data) {
            return res.status(400).json({ message: 'Thiếu dữ liệu snapshot' });
        }
        
        await db.pool.query(`
            INSERT INTO dispatch_snapshots (snapshot_date, data, created_by)
            VALUES ($1, $2, $3)
            ON CONFLICT (snapshot_date) 
            DO UPDATE SET data = EXCLUDED.data, created_by = EXCLUDED.created_by, created_at = NOW()
        `, [date, data, req.user ? req.user.id : null]);
        
        res.json({ message: 'Lưu snapshot thành công' });
    } catch (err) {
        console.error('Lỗi saveSnapshot:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getSnapshotsList = async (req, res) => {
    try {
        const result = await db.pool.query(`
            SELECT snapshot_date, created_at, u.full_name as creator_name
            FROM dispatch_snapshots d
            LEFT JOIN users u ON d.created_by = u.id
            ORDER BY snapshot_date DESC
        `);
        // Format dates to YYYY-MM-DD
        const list = result.rows.map(r => ({
            ...r,
            snapshot_date: moment(r.snapshot_date).format('YYYY-MM-DD')
        }));
        res.json(list);
    } catch (err) {
        console.error('Lỗi getSnapshotsList:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getSnapshotData = async (req, res) => {
    try {
        const { date } = req.params;
        const result = await db.pool.query(`
            SELECT data FROM dispatch_snapshots WHERE snapshot_date = $1
        `, [date]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy snapshot cho ngày này' });
        }
        res.json(result.rows[0].data);
    } catch (err) {
        console.error('Lỗi getSnapshotData:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
