const db = require('../db');

exports.getAllTours = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tour_templates ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTour = async (req, res) => {
    const { 
        name, destination, duration, price, max_pax, start_date, description,
        tour_type, tags, itinerary, highlights, inclusions, exclusions,
        base_price, internal_cost, expected_margin
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO tour_templates (
                name, destination, duration, price, max_pax, start_date, description,
                tour_type, tags, itinerary, highlights, inclusions, exclusions,
                base_price, internal_cost, expected_margin
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                name, destination, duration, price || base_price, max_pax, start_date, description,
                tour_type, tags, itinerary, highlights, inclusions, exclusions,
                base_price || price, internal_cost, expected_margin
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tour_templates WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTour = async (req, res) => {
    const { 
        name, destination, duration, price, max_pax, start_date, description, status,
        tour_type, tags, itinerary, highlights, inclusions, exclusions,
        base_price, internal_cost, expected_margin
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE tour_templates SET 
                name=$1, destination=$2, duration=$3, price=$4, max_pax=$5, 
                start_date=$6, description=$7, status=$8, tour_type=$9, tags=$10, 
                itinerary=$11, highlights=$12, inclusions=$13, exclusions=$14, 
                base_price=$15, internal_cost=$16, expected_margin=$17 
            WHERE id=$18 RETURNING *`,
            [
                name, destination, duration, price || base_price, max_pax, 
                start_date, description, status, tour_type, tags, 
                itinerary, highlights, inclusions, exclusions, 
                base_price || price, internal_cost, expected_margin, req.params.id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM tour_templates WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy tour' });
        res.json({ message: 'Đã xoá tour thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
