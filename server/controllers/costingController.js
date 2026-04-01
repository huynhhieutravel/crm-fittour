const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAllCostings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                td.id as tour_departure_id,
                td.code as departure_code,
                td.start_date,
                tt.name as template_name,
                td.status as departure_status,
                COALESCE((SELECT SUM(pax_count) FROM bookings b WHERE b.tour_departure_id = td.id), 0) as sold_pax,
                COALESCE((SELECT SUM(total_price) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status != 'cancelled'), 0) as total_revenue,
                tc.id as costing_id,
                tc.costs,
                tc.total_cost,
                tc.status as costing_status,
                tc.updated_at
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN tour_costings tc ON td.id = tc.tour_departure_id
            ORDER BY td.start_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCostingByDeparture = async (req, res) => {
    try {
        const { tour_departure_id } = req.params;
        const result = await db.query('SELECT * FROM tour_costings WHERE tour_departure_id = $1', [tour_departure_id]);
        
        if (result.rows.length === 0) {
            // Return empty draft if none exists
            return res.json({
                tour_departure_id: parseInt(tour_departure_id),
                costs: [],
                total_cost: 0,
                status: 'Draft'
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveCosting = async (req, res) => {
    const { tour_departure_id } = req.params;
    const { costs, status } = req.body;
    
    // Calculate total on backend for safety
    let total_cost = 0;
    if (costs && Array.isArray(costs)) {
        costs.forEach(c => total_cost += (c.price * (c.qty || 1)));
    }

    try {
        const check = await db.query('SELECT id FROM tour_costings WHERE tour_departure_id = $1', [tour_departure_id]);
        
        let costData = typeof costs === 'object' ? JSON.stringify(costs) : (costs || '[]');

        if (check.rows.length > 0) {
            // UPDATE
            result = await db.query(
                'UPDATE tour_costings SET costs = $1, total_cost = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE tour_departure_id = $4 RETURNING *',
                [costData, total_cost, status || 'Draft', tour_departure_id]
            );
        } else {
            // INSERT
            result = await db.query(
                'INSERT INTO tour_costings (tour_departure_id, costs, total_cost, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [tour_departure_id, costData, total_cost, status || 'Draft']
            );
        }

        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: check.rows.length > 0 ? 'UPDATE' : 'CREATE',
            entity_type: 'COSTING',
            entity_id: result.rows[0].id,
            details: `Đã lưu bảng Dự Toán/Quyết toán cho Lịch khởi hành ID ${tour_departure_id} với tổng chi: ${total_cost.toLocaleString('vi-VN')} đ.`
        });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
