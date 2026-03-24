const db = require('../db');

exports.getAllGuides = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM guides ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGuide = async (req, res) => {
    const { name, phone, email, languages, rating, status } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO guides (name, phone, email, languages, rating, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, phone, email, languages, rating, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGuideById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM guides WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateGuide = async (req, res) => {
    const { name, phone, email, languages, rating, status } = req.body;
    try {
        const result = await db.query(
            'UPDATE guides SET name=$1, phone=$2, email=$3, languages=$4, rating=$5, status=$6 WHERE id=$7 RETURNING *',
            [name, phone, email, languages, rating, status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGuide = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM guides WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên' });
        res.json({ message: 'Đã xoá hướng dẫn viên thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
