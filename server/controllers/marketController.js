const db = require('../db');
const { logActivity } = require('../utils/logger');

// GET /api/markets — Trả về tree structure (React-Select grouped format)
exports.getMarkets = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, parent_id, sort_order, is_active FROM markets WHERE is_active = true ORDER BY sort_order ASC, id ASC'
        );
        
        const rows = result.rows;
        const parents = rows.filter(r => r.parent_id === null);
        const children = rows.filter(r => r.parent_id !== null);
        
        // Build React-Select grouped format
        const tree = parents.map(p => ({
            label: p.name.trim(),
            id: p.id,
            options: children
                .filter(c => c.parent_id === p.id)
                .map(c => ({ value: c.name.trim(), label: c.name.trim(), id: c.id }))
        }));
        
        res.json(tree);
    } catch (err) {
        console.error('Error fetching markets:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/markets/flat — Trả về flat list (cho backend filter helpers)
exports.getMarketsFlat = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, parent_id, sort_order FROM markets WHERE is_active = true ORDER BY sort_order ASC, id ASC'
        );
        res.json(result.rows.map(r => ({ ...r, name: r.name.trim() })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/markets/all — Admin: Trả về tất cả (kể cả inactive)
exports.getAllMarkets = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, parent_id, sort_order, is_active FROM markets ORDER BY sort_order ASC, id ASC'
        );

        const rows = result.rows;
        const parents = rows.filter(r => r.parent_id === null);
        const children = rows.filter(r => r.parent_id !== null);

        const tree = parents.map(p => ({
            ...p,
            name: p.name.trim(),
            children: children.filter(c => c.parent_id === p.id).map(c => ({ ...c, name: c.name.trim() }))
        }));

        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/markets — Admin: Thêm thị trường mới
exports.createMarket = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Tên thị trường không được để trống' });
        }

        // Lấy sort_order max hiện tại cho cùng parent
        const maxSort = await db.query(
            'SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM markets WHERE parent_id IS NOT DISTINCT FROM $1',
            [parent_id || null]
        );
        const nextSort = (maxSort.rows[0].max_sort || 0) + 10;

        const result = await db.query(
            'INSERT INTO markets (name, parent_id, sort_order) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), parent_id || null, nextSort]
        );
        const newMarket = result.rows[0];

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'MARKET',
            entity_id: newMarket.id,
            details: `Thêm thị trường: ${newMarket.name}`,
            new_data: newMarket
        });
        
        res.json(newMarket);
    } catch (err) {
        console.error('Error creating market:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/markets/:id — Admin: Sửa thị trường
exports.updateMarket = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parent_id, sort_order, is_active } = req.body;

        const fields = [];
        const values = [];
        let idx = 1;

        if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
        if (parent_id !== undefined) { fields.push(`parent_id = $${idx++}`); values.push(parent_id); }
        if (sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(sort_order); }
        if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'Không có dữ liệu cập nhật' });
        }

        values.push(id);
        const result = await db.query(
            `UPDATE markets SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thị trường' });
        }
        
        // Cần fetch oldData
        // (Do lệnh UPDATE đã chạy, ta log chung chung vì không fetch trước)
        const updatedMarket = result.rows[0];
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'UPDATE',
            entity_type: 'MARKET',
            entity_id: updatedMarket.id,
            details: `Cập nhật thị trường: ${updatedMarket.name}`,
            new_data: updatedMarket
        });

        res.json(updatedMarket);
    } catch (err) {
        console.error('Error updating market:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/markets/:id — Admin: Xóa thị trường (soft delete)
exports.deleteMarket = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete: set is_active = false cho cả parent và children
        await db.query('UPDATE markets SET is_active = false WHERE id = $1 OR parent_id = $1', [id]);

        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'MARKET',
            entity_id: id,
            details: `Ẩn thị trường ID: ${id} và các thư mục con`
        });

        res.json({ success: true, message: 'Đã ẩn thị trường' });
    } catch (err) {
        console.error('Error deleting market:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/markets/reorder — Admin: Batch reorder
exports.reorderMarkets = async (req, res) => {
    try {
        const { items } = req.body; // [{ id, sort_order }, ...]
        
        for (const item of items) {
            await db.query('UPDATE markets SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
