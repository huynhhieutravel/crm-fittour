const db = require('../db');

exports.getAllDepartures = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                td.*, 
                tt.name as template_name, tt.duration as template_duration,
                g.name as guide_name,
                (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status != 'cancelled') as sold_pax
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            ORDER BY td.start_date ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDeparture = async (req, res) => {
    const { 
        tour_template_id, start_date, end_date, max_participants, status,
        actual_price, discount_price, single_room_supplement, visa_fee, tip_fee,
        guide_id, operator_id, supplier_info, min_participants, break_even_pax,
        deadline_booking, deadline_visa, deadline_payment
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO tour_departures (
                tour_template_id, start_date, end_date, max_participants, status,
                actual_price, discount_price, single_room_supplement, visa_fee, tip_fee,
                guide_id, operator_id, supplier_info, min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [
                tour_template_id, start_date, end_date, max_participants, status || 'Open',
                actual_price, discount_price, single_room_supplement, visa_fee, tip_fee,
                guide_id, operator_id, supplier_info, min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDepartureById = async (req, res) => {
    try {
        const departureResult = await db.query(`
            SELECT td.*, tt.name as template_name, g.name as guide_name
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            WHERE td.id = $1
        `, [req.params.id]);

        if (departureResult.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });

        const bookingsResult = await db.query(`
            SELECT b.*, c.name as customer_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.tour_departure_id = $1
        `, [req.params.id]);

        const departure = departureResult.rows[0];
        departure.bookings = bookingsResult.rows;
        departure.sold_pax = bookingsResult.rows.reduce((sum, b) => b.booking_status !== 'cancelled' ? sum + Number(b.pax_count) : sum, 0);

        res.json(departure);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateDeparture = async (req, res) => {
    const { 
        start_date, end_date, max_participants, status,
        actual_price, discount_price, single_room_supplement, visa_fee, tip_fee,
        guide_id, operator_id, supplier_info, min_participants, break_even_pax,
        deadline_booking, deadline_visa, deadline_payment
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE tour_departures SET 
                start_date=$1, end_date=$2, max_participants=$3, status=$4,
                actual_price=$5, discount_price=$6, single_room_supplement=$7, 
                visa_fee=$8, tip_fee=$9, guide_id=$10, operator_id=$11, 
                supplier_info=$12, min_participants=$13, break_even_pax=$14,
                deadline_booking=$15, deadline_visa=$16, deadline_payment=$17
            WHERE id=$18 RETURNING *`,
            [
                start_date, end_date, max_participants, status,
                actual_price, discount_price, single_room_supplement, 
                visa_fee, tip_fee, guide_id, operator_id, 
                supplier_info, min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment, req.params.id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteDeparture = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM tour_departures WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });
        res.json({ message: 'Đã xoá lịch khởi hành thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
