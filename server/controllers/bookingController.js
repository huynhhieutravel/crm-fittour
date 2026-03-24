const db = require('../db');

exports.getAllBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, tt.name as tour_name 
            FROM bookings b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes } = req.body;
    try {
        // tour_id is kept for legacy/template reference, but tour_departure_id is the primary link
        const result = await db.query(
            'INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status || 'unpaid', booking_status || 'pending', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, tt.name as tour_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateBooking = async (req, res) => {
    const { tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes } = req.body;
    try {
        const result = await db.query(
            'UPDATE bookings SET tour_departure_id=$1, start_date=$2, pax_count=$3, total_price=$4, payment_status=$5, booking_status=$6, notes=$7 WHERE id=$8 RETURNING *',
            [tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        await db.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
        res.json({ message: 'Đã xoá booking thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
