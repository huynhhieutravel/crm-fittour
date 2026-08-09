const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

function sendTelegramMessage(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
        console.warn('Telegram Bot credentials not found. Cannot send Auth Metrics.');
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML' // Allow some basic formatting
        })
    }).catch(err => {
        console.error('Failed to send Telegram message:', err.message);
    });
}

function runAuthMetricsReport() {
    // Determine typical PM2 log path
    const pm2LogPath = path.join(os.homedir(), '.pm2', 'logs', 'crm-fittour-out.log');
    const dashboardScript = path.join(__dirname, '..', 'scripts', 'auth_metrics_dashboard.js');
    
    // Command: cat log | node dashboard_script
    // We use tail to only get the last 10000 lines (or similar) to prevent huge memory usage, 
    // or just pass the file to the script if the script handles streaming. 
    // The script handles streaming efficiently via readline.
    const command = `node "${dashboardScript}" "${pm2LogPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error running auth metrics script:', error.message);
            return;
        }
        
        if (stderr && !stderr.includes('File not found')) {
            console.error('Auth metrics stderr:', stderr);
        }

        const report = stdout || 'Không tìm thấy dữ liệu log.';
        
        const message = `🚨 <b>BÁO CÁO JWT MIGRATION (Phase 3)</b> 🚨\n<pre>${report}</pre>\n<i>Tự động gửi từ hệ thống CRM</i>`;
        
        sendTelegramMessage(message);
    });
}

// Chạy 2 lần mỗi ngày lúc 08:00 sáng và 20:00 tối
const startAuthMetricsReporter = () => {
    cron.schedule('0 8,20 * * *', () => {
        console.log('[CRON] Đang quét log xác thực Auth Metrics...');
        runAuthMetricsReport();
    });
    console.log('✅ Cron: Auth Metrics Reporter đã khởi động.');
};

module.exports = { startAuthMetricsReporter };
