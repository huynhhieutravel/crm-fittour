const crypto = require('crypto');
const db = require('../db');
const { verifyTokenSafely } = require('../utils/jwt');

/**
 * Executive AI Gateway Authentication Middleware
 * 
 * 1. Hỗ trợ Personal Executive Bearer Token (fit_ai_sec_...)
 * 2. Hỗ trợ fallback sang JWT Bearer Token (cho ERP frontend / OAuth)
 * 3. Bảo vệ timing attack qua crypto.timingSafeEqual
 * 4. Kiểm tra quyền ĐỘNG theo thời gian thực (Dynamic Scope & Permission check)
 * 5. Bỏ qua hoàn toàn dữ liệu PII/Token thô trong logging
 */
module.exports = async function executiveAiAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'UNAUTHORIZED',
                message: 'Thiếu Authorization Bearer token hợp lệ.'
            });
        }

        const rawToken = authHeader.substring(7).trim();
        if (!rawToken) {
            return res.status(401).json({
                success: false,
                error: 'EMPTY_TOKEN',
                message: 'Token không được để trống.'
            });
        }

        // --- TRƯỜNG HỢP 1: PERSONAL EXECUTIVE AI TOKEN (fit_ai_sec_...) ---
        if (rawToken.startsWith('fit_ai_sec_')) {
            const incomingHash = crypto.createHash('sha256').update(rawToken).digest('hex');

            const tokenQuery = `
                SELECT 
                    t.id as token_id, 
                    t.user_id, 
                    t.app_name, 
                    t.token_hash, 
                    t.expires_at, 
                    t.revoked_at,
                    u.id, 
                    u.username, 
                    u.full_name, 
                    u.role, 
                    u.role_id, 
                    u.bus, 
                    u.is_active
                FROM executive_ai_tokens t
                JOIN users u ON t.user_id = u.id
                WHERE t.token_hash = $1
            `;
            const tokenRes = await db.query(tokenQuery, [incomingHash]);

            if (tokenRes.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'INVALID_TOKEN',
                    message: 'Token không hợp lệ hoặc không tồn tại.'
                });
            }

            const record = tokenRes.rows[0];

            // 1. Timing-safe comparison kiểm chứng SHA-256 hash
            const storedBuf = Buffer.from(record.token_hash, 'utf8');
            const incomingBuf = Buffer.from(incomingHash, 'utf8');
            if (storedBuf.length !== incomingBuf.length || !crypto.timingSafeEqual(storedBuf, incomingBuf)) {
                return res.status(401).json({
                    success: false,
                    error: 'TIMING_MISMATCH',
                    message: 'Xác thực token thất bại.'
                });
            }

            // 2. Kiểm tra thu hồi (Revoke)
            if (record.revoked_at) {
                return res.status(401).json({
                    success: false,
                    error: 'TOKEN_REVOKED',
                    message: 'Token đã bị thu hồi (revoked). Vui lòng tạo token mới trong Profile.'
                });
            }

            // 3. Kiểm tra hết hạn (Expiry)
            if (new Date(record.expires_at) < new Date()) {
                return res.status(401).json({
                    success: false,
                    error: 'TOKEN_EXPIRED',
                    message: 'Token đã hết hạn sử dụng. Vui lòng tạo hoặc rotate token mới.'
                });
            }

            // 4. Kiểm tra trạng thái tài khoản User
            if (record.is_active === false) {
                return res.status(403).json({
                    success: false,
                    error: 'USER_INACTIVE',
                    message: 'Tài khoản người dùng liên kết đã bị khóa hoặc vô hiệu hóa.'
                });
            }

            // 5. Kiểm tra quyền truy cập ĐỘNG (ai_gateway:access)
            const hasAccess = await checkLiveGatewayPermission(record);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'PERMISSION_DENIED',
                    message: 'Tài khoản hiện không có quyền truy cập Executive AI Gateway (ai_gateway:access).'
                });
            }

            // 6. Cập nhật last_used_at không chặn luồng chính
            db.query('UPDATE executive_ai_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1', [record.token_id]).catch(() => {});

            // 7. Xác định BU Scope động
            const isUnrestricted = (record.role === 'admin');
            const allowedBUs = isUnrestricted ? null : (Array.isArray(record.bus) ? record.bus : []);

            req.aiUser = {
                id: record.id,
                username: record.username,
                full_name: record.full_name,
                role: record.role,
                bus: record.bus,
                scope: isUnrestricted ? 'all' : 'bu',
                allowedBUs: allowedBUs,
                app_name: record.app_name,
                token_id: record.token_id,
                auth_type: 'personal_token'
            };

            return next();
        }

        // --- TRƯỜNG HỢP 2: JWT TOKEN (CHO OAUTH HOẶC WEB CLIENT ĐĂNG NHẬP) ---
        try {
            const decoded = verifyTokenSafely(rawToken);
            if (!decoded || !decoded.id) {
                return res.status(401).json({ success: false, error: 'INVALID_JWT', message: 'JWT Token không hợp lệ.' });
            }

            // Đọc trạng thái người dùng mới nhất từ DB
            const userRes = await db.query(
                'SELECT id, username, full_name, role, role_id, bus, is_active FROM users WHERE id = $1',
                [decoded.id]
            );

            if (userRes.rows.length === 0 || userRes.rows[0].is_active === false) {
                return res.status(403).json({ success: false, error: 'USER_INACTIVE', message: 'Tài khoản không tồn tại hoặc đã bị khóa.' });
            }

            const liveUser = userRes.rows[0];
            const hasAccess = await checkLiveGatewayPermission(liveUser);
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    error: 'PERMISSION_DENIED',
                    message: 'Tài khoản không có quyền truy cập Executive AI Gateway.'
                });
            }

            const isUnrestricted = (liveUser.role === 'admin');
            const allowedBUs = isUnrestricted ? null : (Array.isArray(liveUser.bus) ? liveUser.bus : []);

            req.aiUser = {
                id: liveUser.id,
                username: liveUser.username,
                full_name: liveUser.full_name,
                role: liveUser.role,
                bus: liveUser.bus,
                scope: isUnrestricted ? 'all' : 'bu',
                allowedBUs: allowedBUs,
                app_name: 'Web / OAuth Session',
                token_id: null,
                auth_type: 'jwt'
            };

            return next();
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_FAILED',
                message: 'Xác thực không thành công. Token không hợp lệ hoặc đã hết hạn.'
            });
        }
    } catch (err) {
        console.error('[EXECUTIVE-AI-AUTH] Lỗi xác thực nội bộ:', err.message);
        return res.status(500).json({
            success: false,
            error: 'INTERNAL_AUTH_ERROR',
            message: 'Lỗi kiểm tra bảo mật phía máy chủ.'
        });
    }
};

/**
 * Kiểm tra quyền ai_gateway:access trong permissions_master theo thời gian thực
 */
async function checkLiveGatewayPermission(user) {
    if (user.role === 'admin') return true;

    // Kiểm tra user_permissions_v2 (ghi đè cá nhân)
    const userPermQuery = `
        SELECT up.granted
        FROM user_permissions_v2 up
        JOIN permissions_master pm ON up.permission_id = pm.id
        WHERE up.user_id = $1 AND pm.module = 'ai_gateway' AND pm.action = 'access'
    `;
    const userPermRes = await db.query(userPermQuery, [user.id]);
    if (userPermRes.rows.length > 0) {
        return !!userPermRes.rows[0].granted;
    }

    // Kiểm tra role_permissions_v2 (mặc định theo role)
    if (user.role_id) {
        const rolePermQuery = `
            SELECT rp.granted
            FROM role_permissions_v2 rp
            JOIN permissions_master pm ON rp.permission_id = pm.id
            WHERE rp.role_id = $1 AND pm.module = 'ai_gateway' AND pm.action = 'access'
        `;
        const rolePermRes = await db.query(rolePermQuery, [user.role_id]);
        if (rolePermRes.rows.length > 0) {
            return !!rolePermRes.rows[0].granted;
        }
    }

    return false;
}

