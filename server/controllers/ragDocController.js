const db = require('../db');

exports.getItems = async (req, res) => {
    try {
        const { category, search, status } = req.query;
        let query = `SELECT * FROM rag_documents WHERE 1=1`;
        const params = [];
        
        // If not logged in, assume admin for local viewing, else use user's role
        const userRole = req.user ? req.user.role : 'admin';
        const userBus = req.user ? (req.user.bus || []) : [];

        if (userRole !== 'admin' && userRole !== 'manager') {
            if (userBus.length > 0) {
                params.push(userBus);
                query += ` AND (cardinality(target_bus) = 0 OR target_bus IS NULL OR target_bus && $${params.length}::text[])`;
            } else {
                query += ` AND (cardinality(target_bus) = 0 OR target_bus IS NULL)`;
            }
        }


        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }
        
        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR category ILIKE $${params.length})`;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching rag documents:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`SELECT * FROM rag_documents WHERE id = $1`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching rag document:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createItem = async (req, res) => {
    const { title, category, visibility, text_url, attachment_url, website_url, drive_url, display_priority, status, target_bus, content_text } = req.body;
    try {
        const result = await db.query(`
            INSERT INTO rag_documents 
            (title, category, visibility, text_url, attachment_url, website_url, drive_url, display_priority, status, target_bus, content_text)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `, [title, category, visibility || 'private', text_url, attachment_url, website_url, drive_url, display_priority || 'text', status || 'active', target_bus || [], content_text]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating rag document:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { title, category, visibility, text_url, attachment_url, website_url, drive_url, display_priority, status, target_bus, content_text } = req.body;
    try {
        const result = await db.query(`
            UPDATE rag_documents SET 
                title = $1, 
                category = $2, 
                visibility = $3, 
                text_url = $4, 
                attachment_url = $5, 
                website_url = $6, 
                drive_url = $7, 
                display_priority = $8, 
                status = $9, 
                target_bus = $10,
                content_text = $11,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $12 RETURNING *
        `, [title, category, visibility, text_url, attachment_url, website_url, drive_url, display_priority, status, target_bus, content_text, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating rag document:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM rag_documents WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ success: true, message: 'Document deleted' });
    } catch (err) {
        console.error('Error deleting rag document:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
