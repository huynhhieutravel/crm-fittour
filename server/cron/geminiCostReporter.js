const cron = require('node-cron');
const db = require('../db');
const telegramService = require('../services/telegramService');
const moment = require('moment-timezone');

class GeminiCostReporter {
    start() {
        // Chạy lúc 20:00 (GMT+7) mỗi ngày
        cron.schedule('0 20 * * *', async () => {
            console.log('🕒 [Cron] Starting Gemini Cost Reporter at 20:00 GMT+7...');
            await this.generateAndSendReport();
        }, {
            scheduled: true,
            timezone: "Asia/Ho_Chi_Minh"
        });
        
        console.log('✅ Gemini Cost Reporter scheduled (Daily at 20:00 GMT+7)');
    }

    async generateAndSendReport() {
        try {
            // Lấy dữ liệu ngày hôm nay
            const today = moment().tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD');
            const res = await db.query(`
                SELECT prompt_tokens, candidate_tokens, cached_tokens, total_tokens
                FROM gemini_api_usage
                WHERE date = $1
            `, [today]);

            if (res.rows.length === 0) {
                console.log(`[GeminiCostReporter] No usage data for today (${today}). Skipping report.`);
                return;
            }

            const usage = res.rows[0];
            
            // Lấy cấu hình model hiện tại
            const configRes = await db.query(`SELECT setting_value FROM ai_agent_settings WHERE setting_key = 'system_config'`);
            let modelName = 'gemini-3.7-flash';
            if (configRes.rows.length > 0 && configRes.rows[0].setting_value) {
                modelName = configRes.rows[0].setting_value.gemini_model || modelName;
            }

            // Tính toán chi phí dựa trên bảng giá 3.7 Flash
            // Prompt uncached: $0.75 / 1M
            // Prompt cached: $0.075 / 1M
            // Output: $3.75 / 1M
            const promptUncachedTokens = Math.max(0, usage.prompt_tokens - usage.cached_tokens);
            const promptCost = (promptUncachedTokens / 1000000) * 0.75;
            const cachedCost = (usage.cached_tokens / 1000000) * 0.075;
            const outputCost = (usage.candidate_tokens / 1000000) * 3.75;
            
            const totalCostUsd = promptCost + cachedCost + outputCost;

            // Cập nhật chi phí vào Database luôn cho chuẩn
            await db.query(`
                UPDATE gemini_api_usage 
                SET cost_usd = $1, updated_at = CURRENT_TIMESTAMP
                WHERE date = $2
            `, [totalCostUsd, today]);

            const reportData = {
                date: moment().tz("Asia/Ho_Chi_Minh").format('DD/MM/YYYY'),
                modelName: modelName,
                promptTokens: promptUncachedTokens,
                cachedTokens: usage.cached_tokens,
                candidateTokens: usage.candidate_tokens,
                totalTokens: usage.total_tokens,
                costUsd: totalCostUsd
            };

            await telegramService.sendGeminiCostReport(reportData);
            
        } catch (error) {
            console.error('[GeminiCostReporter] Lỗi khi tạo báo cáo:', error);
        }
    }
}

module.exports = new GeminiCostReporter();
