const db = require('../db');

exports.getAllBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, t.name as tour_name 
            FROM bookings b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            LEFT JOIN tours t ON b.tour_id = t.id 
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { booking_code, customer_id, tour_id, start_date, pax_count, total_price, payment_status, booking_status, notes } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO bookings (booking_code, customer_id, tour_id, start_date, pax_count, total_price, payment_status, booking_status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [booking_code, customer_id, tour_id, start_date, pax_count, total_price, payment_status || 'unpaid', booking_status || 'pending', notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateBooking = async (req, res) => {
    const { start_date, pax_count, total_price, payment_status, booking_status, notes } = req.body;
    try {
        const result = await db.query(
            'UPDATE bookings SET start_date=$1, pax_count=$2, total_price=$3, payment_status=$4, booking_status=$5, notes=$6 WHERE id=$7 RETURNING *',
            [start_date, pax_count, total_price, payment_status, booking_status, notes, req.params.id]
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
