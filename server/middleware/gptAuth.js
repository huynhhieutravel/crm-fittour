const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực kép: JWT (user bình thường) HOẶC GPT_API_KEY (ChatGPT Bot).
 * Middleware này CHỈ được gắn vào route /api/marketing-ads.
 * GPT Bot chỉ có quyền READ-ONLY (GET), không được thao tác ghi.
 */
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Truy cập bị từ chối' });

    // Ưu tiên kiểm tra GPT_API_KEY trước
    if (process.env.GPT_API_KEY && token === process.env.GPT_API_KEY) {
        // ChatGPT Bot chỉ được phép đọc (GET)
        if (req.method !== 'GET') {
            return res.status(403).json({ error: 'ChatGPT Bot chỉ có quyền Đọc (Read-only). Không được phép thêm/sửa/xóa dữ liệu.' });
        }
        req.user = { role: 'gpt-bot', id: 'chatgpt-system' };
        return next();
    }

    // Fallback: xác thực JWT cho user bình thường (bằng RS256)
    const { verifyTokenSafely } = require('../utils/jwt');
    try {
        const decodedPayload = verifyTokenSafely(token);
        req.user = decodedPayload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        return res.status(401).json({ message: err.message || 'Token không hợp lệ' });
    }
};
