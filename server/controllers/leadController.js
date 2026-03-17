const db = require('../db');

exports.getAllLeads = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, t.name as tour_name, u.full_name as assigned_to_name 
            FROM leads l 
            LEFT JOIN tours t ON l.tour_id = t.id 
            LEFT JOIN users u ON l.assigned_to = u.id 
            ORDER BY l.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLead = async (req, res) => {
    const { name, phone, email, source, tour_id, assigned_to } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO leads (name, phone, email, source, tour_id, assigned_to, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, phone, email, source, tour_id, assigned_to, 'new']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLead = async (req, res) => {
    const { name, phone, email, source, tour_id, status, assigned_to, consultation_note } = req.body;
    try {
        const result = await db.query(`UPDATE leads SET 
                name = COALESCE($1, name), 
                phone = COALESCE($2, phone), 
                email = COALESCE($3, email), 
                source = COALESCE($4, source), 
                tour_id = COALESCE($5, tour_id), 
                status = COALESCE($6, status), 
                assigned_to = COALESCE($7, assigned_to), 
                consultation_note = COALESCE($8, consultation_note) 
            WHERE id = $9 RETURNING *`,
            [name, phone, email, source, tour_id, status, assigned_to, consultation_note, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteLead = async (req, res) => {
    try {
        await db.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        res.json({ message: 'Đã xoá lead thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
