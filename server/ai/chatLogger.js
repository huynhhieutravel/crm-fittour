/**
 * ═══════════════════════════════════════════════════════════════
 *  AI Copilot — Chat Logger + Anti-Spam
 *  
 *  Lưu MỌI cuộc hội thoại AI vào DB và chặn spam.
 * ═══════════════════════════════════════════════════════════════
 */
const db = require('../db');

// In-memory rate limit tracker
const rateLimits = new Map();

// ─── RATE LIMIT CONFIG ──────────────────────────────────
const RATE_LIMIT_ADMIN = {
  perMinute: 30,    // Admin chat tẹt ga 30 msg/phút
  perDay: 1000,     // 1000 msg/ngày
  windowMs: 60000,
};

const RATE_LIMIT_USER = {
  perMinute: 10,    
  perDay: 20,       // Nhân viên thường: 20 tin/ngày (Chống tốn cost)
  windowMs: 60000,
};

/**
 * Kiểm tra rate limit cho user
 * @param {string|number} userId
 * @param {string} role - 'admin', 'sales', etc.
 * @returns {{ allowed: boolean, message?: string }}
 */
function checkRateLimit(userId, role = 'user') {
  const now = Date.now();
  const key = `user_${userId}`;
  const config = role === 'admin' ? RATE_LIMIT_ADMIN : RATE_LIMIT_USER;

  if (!rateLimits.has(key)) {
    rateLimits.set(key, { timestamps: [], dailyCount: 0, dailyReset: now });
  }

  const tracker = rateLimits.get(key);

  // Reset daily counter nếu qua ngày mới
  if (now - tracker.dailyReset > 86400000) {
    tracker.dailyCount = 0;
    tracker.dailyReset = now;
  }

  // Xóa timestamps cũ hơn 1 phút
  tracker.timestamps = tracker.timestamps.filter(t => now - t < config.windowMs);

  // Check per-minute limit
  if (tracker.timestamps.length >= config.perMinute) {
    return {
      allowed: false,
      message: '⏳ Sếp ơi, em cần nghỉ ngơi 1 phút! Sếp gửi nhanh quá em xử lý không kịp 😅'
    };
  }

  // Check daily limit
  if (tracker.dailyCount >= config.perDay) {
    if (role !== 'admin') {
      return {
        allowed: false,
        message: '🌙 Dạ tài khoản của anh/chị hôm nay đã hết hạn mức trải nghiệm AI (Tối đa 20 lượt/ngày). Nếu có việc gấp vui lòng nhờ Admin (Sếp) xử lý hoặc chờ qua ngày mai ạ!'
      };
    }
    return {
      allowed: false,
      message: '🌙 Sếp ơi, hôm nay sếp đã xài AI quá nhiều rồi. Mời sếp nghỉ lưng chút nha!'
    };
  }

  // Cho phép
  tracker.timestamps.push(now);
  tracker.dailyCount++;

  return { allowed: true };
}

/**
 * Ghi log cuộc hội thoại vào Database
 */
async function logChat({
  userId, userName, userMessage, aiReply,
  functionCalled, functionArgs, actionType,
  modelUsed, responseTimeMs, tokenInput, tokenOutput
}) {
  try {
    await db.query(`
      INSERT INTO ai_chat_logs 
        (user_id, user_name, user_message, ai_reply,
         function_called, function_args, action_type,
         model_used, response_time_ms, token_input, token_output)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      userId, userName, userMessage, aiReply,
      functionCalled || null,
      functionArgs ? JSON.stringify(functionArgs) : null,
      actionType || null,
      modelUsed || null,
      responseTimeMs || null,
      tokenInput || null,
      tokenOutput || null
    ]);
  } catch (err) {
    // Logging lỗi nhưng KHÔNG chặn luồng chính
    console.error('[ChatLogger] Lỗi ghi log:', err.message);
  }
}

/**
 * Lấy thống kê sử dụng AI (cho Dashboard tương lai)
 */
async function getUsageStats(period = '30 days') {
  try {
    const result = await db.query(`
      SELECT 
        user_name,
        COUNT(*) as total_chats,
        COUNT(function_called) as function_calls,
        ROUND(AVG(response_time_ms)) as avg_response_ms,
        SUM(COALESCE(token_input, 0) + COALESCE(token_output, 0)) as total_tokens
      FROM ai_chat_logs
      WHERE created_at >= NOW() - INTERVAL '${period}'
      GROUP BY user_name
      ORDER BY total_chats DESC
    `);
    return result.rows;
  } catch (err) {
    console.error('[ChatLogger] Lỗi lấy stats:', err.message);
    return [];
  }
}

module.exports = { checkRateLimit, logChat, getUsageStats };
