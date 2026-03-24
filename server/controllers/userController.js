const db = require('../db');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, full_name, role FROM users ORDER BY full_name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
