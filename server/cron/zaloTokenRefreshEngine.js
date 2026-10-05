const cron = require('node-cron');
const fs = require('fs');
const { refreshZaloToken, TOKEN_FILE_PATH } = require('../controllers/zaloV2Controller');

/**
 * Kiểm tra và chủ động làm mới Zalo OA Token trước khi hết hạn
 */
const checkAndRefreshToken = async () => {
    try {
        if (!fs.existsSync(TOKEN_FILE_PATH)) {
            console.log('[ZALO TOKEN CRON] File token chưa tồn tại. Vui lòng đăng nhập Zalo OA lần đầu.');
            return;
        }

        const stats = fs.statSync(TOKEN_FILE_PATH);
        let tokenData = null;
        try {
            tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
        } catch (e) {
            console.error('[ZALO TOKEN CRON] Lỗi đọc file token:', e.message);
            return;
        }

        if (!tokenData?.refresh_token) {
            console.warn('[ZALO TOKEN CRON] Không tìm thấy refresh_token trong file token.');
            return;
        }

        let needsRefresh = false;
        let reason = '';

        if (tokenData.expires_at) {
            const hoursRemaining = (tokenData.expires_at - Date.now()) / (1000 * 60 * 60);
            if (hoursRemaining <= 4) {
                needsRefresh = true;
                reason = `Token chỉ còn hiệu lực ${hoursRemaining.toFixed(1)} giờ (ngưỡng an toàn là 4 giờ).`;
            } else {
                console.log(`[ZALO TOKEN CRON] Token đang an toàn. Còn hiệu lực: ${hoursRemaining.toFixed(1)} giờ.`);
            }
        } else {
            // Nếu chưa có trường expires_at, kiểm tra thời gian cập nhật file (mtime)
            const hoursSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
            if (hoursSinceModified >= 18) {
                needsRefresh = true;
                reason = `Token file đã sửa đổi từ ${hoursSinceModified.toFixed(1)} giờ trước (hạn 25 giờ).`;
            } else {
                console.log(`[ZALO TOKEN CRON] Token file cập nhật cách đây ${hoursSinceModified.toFixed(1)} giờ. Tạm thời an toàn.`);
            }
        }

        if (needsRefresh) {
            console.log(`[ZALO TOKEN CRON] 🔄 Đang tự động làm mới Zalo Access Token... Lý do: ${reason}`);
            const result = await refreshZaloToken(tokenData.refresh_token);
            if (result) {
                console.log(`[ZALO TOKEN CRON] ✅ Đã chủ động làm mới Zalo Access Token thành công!`);
            } else {
                console.error(`[ZALO TOKEN CRON] ❌ Tự động làm mới Zalo Access Token thất bại.`);
            }
        }
    } catch (err) {
        console.error('[ZALO TOKEN CRON] Ngoại lệ khi kiểm tra token:', err.message);
    }
};

const startZaloTokenRefreshCron = () => {
    // 1. Chạy kiểm tra ngay khi server khởi động (sau 5s để mọi thứ sẵn sàng)
    setTimeout(() => {
        checkAndRefreshToken().catch(console.error);
    }, 5000);

    // 2. Chạy định kỳ mỗi 30 phút
    cron.schedule('*/30 * * * *', () => {
        checkAndRefreshToken().catch(console.error);
    });

    console.log('[CRON] zaloTokenRefreshEngine đã đính kèm vào luồng hệ thống (quét mỗi 30 phút).');
};

module.exports = { startZaloTokenRefreshCron, checkAndRefreshToken };
