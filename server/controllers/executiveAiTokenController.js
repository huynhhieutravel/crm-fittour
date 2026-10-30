const crypto = require('crypto');
const db = require('../db');

/**
 * Controller Quản lý Personal Executive AI Tokens
 * Cho phép Sếp tự quản lý token (Self-service) trong Profile và Admin kiểm tra audit.
 */

// 1. Lấy danh sách token của user hiện tại
exports.listTokens = async (req, res) => {
    try {
        const userId = req.user.id;
        const targetUserId = (req.user.role === 'admin' && req.query.user_id) ? parseInt(req.query.user_id) : userId;

        const result = await db.query(`
            SELECT 
                t.id,
                t.user_id,
                u.full_name as owner_name,
                t.app_name,
                t.token_prefix,
                t.expires_at,
                t.revoked_at,
                t.last_used_at,
                t.created_at,
                CASE 
                    WHEN t.revoked_at IS NOT NULL THEN 'REVOKED'
                    WHEN t.expires_at < NOW() THEN 'EXPIRED'
                    ELSE 'ACTIVE'
                END as status,
                ROUND(EXTRACT(EPOCH FROM (t.expires_at - NOW())) / 86400) as days_remaining
            FROM executive_ai_tokens t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = $1
            ORDER BY t.created_at DESC
        `, [targetUserId]);

        return res.json({
            success: true,
            tokens: result.rows
        });
    } catch (err) {
        console.error('[AI-TOKEN-CONTROLLER] Lỗi list tokens:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách token AI.' });
    }
};

// 2. Tạo mới Token (Chỉ hiển thị plaintext MỘT LẦN)
exports.createToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const { app_name, validity_days } = req.body;

        if (!app_name || !app_name.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên ứng dụng (app_name), ví dụ: Claude Desktop, ChatGPT Custom GPT.' });
        }

        const days = Math.min(Math.max(parseInt(validity_days) || 90, 1), 365); // Mặc định 90 ngày, tối đa 1 năm
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        // Sinh chuỗi bí mật an toàn fit_ai_sec_ + 64 ký tự hex ngẫu nhiên
        const randomHex = crypto.randomBytes(32).toString('hex');
        const rawToken = `fit_ai_sec_${randomHex}`;
        const tokenPrefix = `fit_ai_sec_${randomHex.slice(0, 8)}...`;
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const insertRes = await db.query(`
            INSERT INTO executive_ai_tokens (user_id, app_name, token_hash, token_prefix, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, app_name, token_prefix, expires_at, created_at
        `, [userId, app_name.trim(), tokenHash, tokenPrefix, expiresAt]);

        const created = insertRes.rows[0];

        // Ghi vết vào audit_logs
        try {
            await db.query(`
                INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
                VALUES ($1, 'CREATE_AI_TOKEN', 'executive_ai_tokens', $2, $3)
            `, [userId, created.id, JSON.stringify({ app_name: created.app_name, expires_at: created.expires_at })]);
        } catch (_) {}

        return res.status(201).json({
            success: true,
            message: 'Token đã được tạo thành công! Hãy sao chép ngay vì token này CHỈ HIỂN THỊ MỘT LẦN DUY NHẤT.',
            token: rawToken, // Trả plaintext DUY NHẤT lần này
            token_info: {
                id: created.id,
                app_name: created.app_name,
                token_prefix: created.token_prefix,
                expires_at: created.expires_at,
                created_at: created.created_at
            }
        });
    } catch (err) {
        console.error('[AI-TOKEN-CONTROLLER] Lỗi create token:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo token AI mới.' });
    }
};

// 3. Thu hồi token tức thì (Revoke)
exports.revokeToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const tokenId = parseInt(req.params.id);

        let query = `
            UPDATE executive_ai_tokens 
            SET revoked_at = NOW(), updated_at = NOW() 
            WHERE id = $1 AND (user_id = $2 OR $3 = 'admin') AND revoked_at IS NULL
            RETURNING id, app_name
        `;
        const result = await db.query(query, [tokenId, userId, req.user.role]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Token không tồn tại hoặc đã bị thu hồi trước đó.' });
        }

        return res.json({
            success: true,
            message: `Token "${result.rows[0].app_name}" đã được thu hồi thành công. Mọi kết nối dùng token này sẽ bị từ chối ngay lập tức.`
        });
    } catch (err) {
        console.error('[AI-TOKEN-CONTROLLER] Lỗi revoke token:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi thu hồi token AI.' });
    }
};

// 4. Xoay vòng token (Rotate Token)
exports.rotateToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const tokenId = parseInt(req.params.id);

        // 1. Thu hồi token cũ
        const oldRes = await db.query(`
            UPDATE executive_ai_tokens 
            SET revoked_at = NOW(), updated_at = NOW() 
            WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')
            RETURNING id, app_name
        `, [tokenId, userId, req.user.role]);

        if (oldRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Token cũ không tồn tại.' });
        }

        const appName = oldRes.rows[0].app_name;

        // 2. Tạo token mới kế thừa tên ứng dụng
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const randomHex = crypto.randomBytes(32).toString('hex');
        const rawToken = `fit_ai_sec_${randomHex}`;
        const tokenPrefix = `fit_ai_sec_${randomHex.slice(0, 8)}...`;
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const insertRes = await db.query(`
            INSERT INTO executive_ai_tokens (user_id, app_name, token_hash, token_prefix, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, app_name, token_prefix, expires_at, created_at
        `, [userId, appName, tokenHash, tokenPrefix, expiresAt]);

        return res.json({
            success: true,
            message: `Token cho "${appName}" đã được xoay vòng thành công! Token cũ đã vô hiệu hóa, vui lòng cập nhật token mới vào ứng dụng AI của bạn.`,
            token: rawToken,
            token_info: insertRes.rows[0]
        });
    } catch (err) {
        console.error('[AI-TOKEN-CONTROLLER] Lỗi rotate token:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi rotate token AI.' });
    }
};

