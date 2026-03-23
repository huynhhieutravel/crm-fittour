const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const facebookService = require('../services/facebookService');

// 1. Lấy danh sách hội thoại
router.get('/conversations', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, l.name as lead_name, l.status as lead_status
            FROM conversations c
            LEFT JOIN leads l ON c.lead_id = l.id
            ORDER BY c.updated_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
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
