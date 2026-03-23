const db = require('../db');

exports.getNotesByLeadId = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM lead_notes n LEFT JOIN users u ON n.created_by = u.id WHERE n.lead_id = $1 ORDER BY n.created_at DESC',
            [req.params.leadId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addNote = async (req, res) => {
    const { lead_id, content } = req.body;
    const created_by = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO lead_notes (lead_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
            [lead_id, content, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
