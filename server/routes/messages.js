const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const facebookService = require('../services/facebookService');

// 1. Lấy danh sách hội thoại có phân trang và tìm kiếm
router.get('/conversations', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let queryArgs = [];
        let whereClause = '';

        if (search) {
            queryArgs.push(`%${search}%`);
            whereClause = `WHERE l.name ILIKE $1 OR c.last_message ILIKE $1`;
        }

        // Đếm tổng số lượng
        const countQuery = `
            SELECT COUNT(c.id) 
            FROM conversations c 
            LEFT JOIN leads l ON c.lead_id = l.id 
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, queryArgs);
        const totalRows = parseInt(countResult.rows[0].count);

        // Lấy dữ liệu
        const dataQueryArgs = [...queryArgs, limitNum, offset];
        const dataQuery = `
            SELECT c.*, l.name as lead_name, l.status as lead_status
            FROM conversations c
            LEFT JOIN leads l ON c.lead_id = l.id
            ${whereClause}
            ORDER BY c.updated_at DESC
            LIMIT $${queryArgs.length + 1} OFFSET $${queryArgs.length + 2}
        `;
        const result = await db.query(dataQuery, dataQueryArgs);

        res.json({
            data: result.rows,
            pagination: {
                total: totalRows,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalRows / limitNum)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1.5 Xóa hàng loạt hội thoại (Cùng tin nhắn liên quan)
router.post('/conversations/delete', auth, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Mảng IDs trống' });
        }

        // Bắt đầu transaction đảm bảo an toàn
        await db.query('BEGIN');
        
        // 1. Xóa các tin nhắn chứa trong hội thoại (nếu không có ON DELETE CASCADE)
        await db.query('DELETE FROM messages WHERE conversation_id = ANY($1::int[])', [ids]);
        
        // 2. Xóa các hội thoại
        await db.query('DELETE FROM conversations WHERE id = ANY($1::int[])', [ids]);
        
        await db.query('COMMIT');
        
        res.json({ success: true, message: `Đã xóa ${ids.length} hội thoại thành công!` });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Delete Conversations Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Lấy tin nhắn của một hội thoại
router.get('/:conversationId', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
            [req.params.conversationId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Gửi tin nhắn phản hồi
router.post('/send', auth, async (req, res) => {
    const { conversationId, content } = req.body;
    try {
        // Lấy PSID từ hội thoại
        const conv = await db.query('SELECT external_id FROM conversations WHERE id = $1', [conversationId]);
        if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversation not found' });
        
        const psid = conv.rows[0].external_id;

        // Gửi qua Facebook API
        await facebookService.callSendAPI(psid, { text: content });

        // Lưu vào database
        const msgResult = await db.query(
            'INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [conversationId, 'user', req.user.id, content]
        );

        // Cập nhật last_message trong hội thoại
        await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [content, conversationId]);

        res.json(msgResult.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Test Meta API connection (Dành cho việc chứng minh quyền pages_manage_metadata)
router.post('/test-meta', auth, async (req, res) => {
    const { token: providedToken } = req.body; // Nhận token từ body
    console.log('--- META TEST POST REQUEST RECEIVED ---');
    console.log('Token snippet:', providedToken ? providedToken.substring(0, 10) + '...' : 'NONE');
    try {
        const data = await facebookService.getSubscribedApps(providedToken);
        res.json({
            success: true,
            message: 'Đã thực hiện lệnh gọi API thành công!',
            data: data
        });
    } catch (err) {
        console.error('Test Meta Error:', err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi kết nối Meta API. Vui lòng kiểm tra Page Token.',
            error: err.message 
        });
    }
});

module.exports = router;
