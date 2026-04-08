const db = require('../db');

exports.getLicenses = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM licenses ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLicense = async (req, res) => {
    try {
        const { name, link } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên là bắt buộc' });
        const result = await db.query(
            'INSERT INTO licenses (name, link) VALUES ($1, $2) RETURNING *',
            [name, link || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLicense = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, link } = req.body;
        const result = await db.query(
            'UPDATE licenses SET name=$1, link=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *',
            [name, link || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteLicense = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM licenses WHERE id = $1', [id]);
        res.json({ message: 'Đã xóa' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
