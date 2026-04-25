const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { processMessage, clearHistory } = require('../ai/agentRouter');

// POST /api/ai/chat — Gửi tin nhắn cho AI Copilot
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Tin nhắn không được để trống' });
        }

        const result = await processMessage(message.trim(), req.user);
        res.json(result);
    } catch (err) {
        console.error('[AI Route] Error:', err);
        res.status(500).json({ message: 'Lỗi AI Copilot', error: err.message });
    }
});

// POST /api/ai/clear — Xóa lịch sử hội thoại
router.post('/clear', authenticateToken, (req, res) => {
    clearHistory(req.user ? req.user.id : 'anonymous');
    res.json({ message: 'Đã xóa lịch sử hội thoại.' });
});

module.exports = router;
