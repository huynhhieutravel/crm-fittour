const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM departure_card_guides ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi lấy departure_card_guides:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, phone, profile_link, avatar_url, description } = req.body;
        const result = await db.query(
            'INSERT INTO departure_card_guides (name, phone, profile_link, avatar_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, phone, profile_link, avatar_url, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi thêm departure_card_guides:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, profile_link, avatar_url, description } = req.body;
        const result = await db.query(
            'UPDATE departure_card_guides SET name = $1, phone = $2, profile_link = $3, avatar_url = $4, description = $5 WHERE id = $6 RETURNING *',
            [name, phone, profile_link, avatar_url, description, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi cập nhật departure_card_guides:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM departure_card_guides WHERE id = $1', [id]);
        res.json({ message: 'Đã xóa' });
    } catch (err) {
        console.error('Lỗi xóa departure_card_guides:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
