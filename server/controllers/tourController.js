const db = require('../db');

exports.getAllTours = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT tt.*, 
                   (SELECT COUNT(*) FROM tour_departures td WHERE td.tour_template_id = tt.id) as departures_count
            FROM tour_templates tt 
            ORDER BY tt.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTour = async (req, res) => {
    const { 
        name, destination, duration, price, max_pax, start_date, description,
        tour_type, tags, itinerary, highlights, inclusions, exclusions,
        base_price, internal_cost, expected_margin, schedule_link
    } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO tour_templates (
                name, destination, duration, price, max_pax, start_date, description,
                tour_type, tags, itinerary, highlights, inclusions, exclusions,
                base_price, internal_cost, expected_margin, schedule_link
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [
                name, destination, duration, price || base_price, max_pax, start_date, description,
                tour_type, tags, itinerary, highlights, inclusions, exclusions,
                base_price || price, internal_cost, expected_margin, schedule_link
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
        base_price, internal_cost, expected_margin, schedule_link
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE tour_templates SET 
                name=$1, destination=$2, duration=$3, price=$4, max_pax=$5, 
                start_date=$6, description=$7, status=$8, tour_type=$9, tags=$10, 
                itinerary=$11, highlights=$12, inclusions=$13, exclusions=$14, 
                base_price=$15, internal_cost=$16, expected_margin=$17, schedule_link=$18 
            WHERE id=$19 RETURNING *`,
            [
                name, destination, duration, price || base_price, max_pax, 
                start_date, description, status, tour_type, tags, 
                itinerary, highlights, inclusions, exclusions, 
                base_price || price, internal_cost, expected_margin, schedule_link, req.params.id
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

exports.getTourNotes = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT tn.*, u.username as creator_name 
             FROM tour_notes tn 
             LEFT JOIN users u ON tn.created_by = u.id 
             WHERE tn.tour_id = $1 
             ORDER BY tn.created_at DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addTourNote = async (req, res) => {
    const { tour_id, content } = req.body;
    const created_by = req.user?.id;
    try {
        const result = await db.query(
            'INSERT INTO tour_notes (tour_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
            [tour_id, content, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
