const db = require('../db');

exports.getAllTours = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tours ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTour = async (req, res) => {
    const { name, destination, duration, price, max_pax, start_date, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tours (name, destination, duration, price, max_pax, start_date, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, destination, duration, price, max_pax, start_date, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tours WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTour = async (req, res) => {
    const { name, destination, duration, price, max_pax, start_date, description, status } = req.body;
    try {
        const result = await db.query(
            'UPDATE tours SET name=$1, destination=$2, duration=$3, price=$4, max_pax=$5, start_date=$6, description=$7, status=$8 WHERE id=$9 RETURNING *',
            [name, destination, duration, price, max_pax, start_date, description, status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM tours WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json({ message: 'Đã xoá tour thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
