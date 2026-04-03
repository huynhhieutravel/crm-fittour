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
                COALESCE((SELECT SUM(pax_count) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status != 'cancelled'), 0) as sold_pax,
                COALESCE((SELECT SUM(total_price) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status != 'cancelled'), 0) as expected_revenue,
                tc.id as costing_id,
                tc.costs,
                tc.total_revenue as saved_revenue,
                tc.total_estimated_cost,
                tc.total_actual_cost,
                tc.total_deposit,
                tc.status as costing_status,
                tc.updated_at
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN tour_costings tc ON td.id = tc.tour_departure_id
            WHERE td.status != 'Cancelled'
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
        
        // Auto fetch latest revenue data from bookings
        const bookingStats = await db.query(`
            SELECT COALESCE(SUM(total_price), 0) as revenue, COALESCE(SUM(pax_count), 0) as sold_pax
            FROM bookings
            WHERE tour_departure_id = $1 AND booking_status != 'cancelled'
        `, [tour_departure_id]);

        const currentRevenue = bookingStats.rows[0].revenue;
        const currentPax = bookingStats.rows[0].sold_pax;

        const result = await db.query('SELECT * FROM tour_costings WHERE tour_departure_id = $1', [tour_departure_id]);
        
        if (result.rows.length === 0) {
            return res.json({
                tour_departure_id: parseInt(tour_departure_id),
                costs: [],
                total_revenue: parseFloat(currentRevenue),
                sold_pax: parseInt(currentPax),
                total_estimated_cost: 0,
                total_actual_cost: 0,
                total_deposit: 0,
                status: 'Draft'
            });
        }

        const data = result.rows[0];
        // Always return the freshest revenue and pax explicitly
        data.total_revenue = parseFloat(currentRevenue);
        data.sold_pax = parseInt(currentPax);
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveCosting = async (req, res) => {
    const { tour_departure_id } = req.params;
    const { costs, status } = req.body;
    
    // Auto calculate totals securely on backend
    let total_estimated_cost = 0;
    let total_actual_cost = 0;
    let total_deposit = 0;

    let costData = '[]';
    
    if (costs && Array.isArray(costs)) {
        costs.forEach(c => {
            const estPrice = Number(c.estimated_price) || 0;
            const estQty = Number(c.estimated_qty) || 0;
            const actualPrice = Number(c.actual_price) || 0;
            const actualQty = Number(c.actual_qty) || 0;
            const deposit = Number(c.deposit) || 0;

            total_estimated_cost += (estPrice * estQty);
            total_actual_cost += (actualPrice * actualQty);
            total_deposit += deposit;
        });
        costData = JSON.stringify(costs);
    }

    try {
        const fetchRev = await db.query(`SELECT COALESCE(SUM(total_price), 0) as rev FROM bookings WHERE tour_departure_id = $1 AND booking_status != 'cancelled'`, [tour_departure_id]);
        const total_revenue = fetchRev.rows[0].rev;

        const check = await db.query('SELECT id FROM tour_costings WHERE tour_departure_id = $1', [tour_departure_id]);
        
        let result;
        if (check.rows.length > 0) {
            result = await db.query(
                `UPDATE tour_costings 
                 SET costs = $1, total_estimated_cost = $2, total_actual_cost = $3, total_deposit = $4, total_revenue = $5, status = $6, updated_at = CURRENT_TIMESTAMP 
                 WHERE tour_departure_id = $7 RETURNING *`,
                [costData, total_estimated_cost, total_actual_cost, total_deposit, total_revenue, status || 'Draft', tour_departure_id]
            );
        } else {
            result = await db.query(
                `INSERT INTO tour_costings (tour_departure_id, costs, total_estimated_cost, total_actual_cost, total_deposit, total_revenue, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [tour_departure_id, costData, total_estimated_cost, total_actual_cost, total_deposit, total_revenue, status || 'Draft']
            );
        }

        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: check.rows.length > 0 ? 'UPDATE' : 'CREATE',
            entity_type: 'COSTING',
            entity_id: result.rows[0].id,
            details: `Đã lưu Dự Toán/Quyết Toán lịch khởi hành ID ${tour_departure_id}. Dự toán: ${total_estimated_cost.toLocaleString('vi-VN')} đ, Thực tế: ${total_actual_cost.toLocaleString('vi-VN')} đ.`
        });

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Save Costing Error:', err);
        res.status(500).json({ message: err.message });
    }
};
