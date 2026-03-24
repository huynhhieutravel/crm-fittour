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
    const { lead_id, customer_id, content } = req.body;
    const created_by = req.user.id;
    try {
        console.log('Adding Note - Body:', req.body);
        const result = await db.query(
            'INSERT INTO lead_notes (lead_id, customer_id, content, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [lead_id || null, customer_id || null, content, created_by]
        );
        console.log('Note added:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};
