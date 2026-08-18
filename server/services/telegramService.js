const axios = require('axios');

function escapeHTML(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

class TelegramService {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID;
        this.apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`;
    }

    /**
     * Send a notification when a lead is dispatched
     * @param {Object} lead - The fully updated lead object
     * @returns {Number|null} message_id if successful, or null
     */
    async sendLeadDispatchNotification(lead, assignedToName = null) {
        if (!this.token || !this.chatId) {
            console.warn('Telegram token or chat ID is not configured. Skipping notification.');
            return null;
        }

        const message = `🚨 <b>CÓ LEAD MỚI ĐƯỢC ĐIỀU PHỐI</b> 🚨

👤 <b>Tên:</b> ${escapeHTML(lead.name) || 'Không có tên'}
📞 <b>SĐT:</b> ${escapeHTML(lead.phone) || 'Chưa có SĐT'}
📦 <b>Sản phẩm / Nhu cầu:</b> ${escapeHTML(lead.tour_name) || 'Khách lẻ / Chưa rõ'}
🌍 <b>Thị trường:</b> ${escapeHTML(lead.market_collection) || 'Chưa xác định'}
🔖 <b>Nguồn:</b> ${escapeHTML(lead.source) || 'Không rõ'}
🏢 <b>Nhóm:</b> ${escapeHTML(lead.bu_group) || 'Chưa phân nhóm'}
${assignedToName ? `\n✅ <b>Đã nhận bởi:</b> ${escapeHTML(assignedToName)}` : `\n🔴 <b>Trạng thái:</b> Chưa có người nhận`}

💬 <b>Ghi chú từ Điều phối:</b>
<i>${escapeHTML(lead.dispatcher_notes) ? escapeHTML(lead.dispatcher_notes) : 'Không có ghi chú.'}</i>`;

        try {
            const res = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });
            console.log(`[Telegram] Sent dispatch notification for lead ${lead.id}`);
            return res.data?.result?.message_id || null;
        } catch (error) {
            console.error('[Telegram Error] Failed to send message:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Update an existing dispatch notification
     * @param {Number} messageId - The Telegram message ID
     * @param {Object} lead - The fully updated lead object
     */
    async updateLeadDispatchNotification(messageId, lead, assignedToName) {
        if (!this.token || !this.chatId || !messageId) return;

        const message = `🎫 <b>LEAD ĐÃ ĐƯỢC NHẬN</b> 🎫

👤 <b>Tên:</b> ${escapeHTML(lead.name) || 'Không có tên'}
📞 <b>SĐT:</b> ${escapeHTML(lead.phone) || 'Chưa có SĐT'}
📦 <b>Sản phẩm / Nhu cầu:</b> ${escapeHTML(lead.tour_name) || 'Khách lẻ / Chưa rõ'}
🌍 <b>Thị trường:</b> ${escapeHTML(lead.market_collection) || 'Chưa xác định'}
🔖 <b>Nguồn:</b> ${escapeHTML(lead.source) || 'Không rõ'}
🏢 <b>Nhóm:</b> ${escapeHTML(lead.bu_group) || 'Chưa phân nhóm'}

✅ <b>Đã nhận bởi:</b> ${escapeHTML(assignedToName) || 'Nhân viên (Không xác định)'}

💬 <b>Ghi chú từ Điều phối:</b>
<i>${escapeHTML(lead.dispatcher_notes) ? escapeHTML(lead.dispatcher_notes) : 'Không có ghi chú.'}</i>`;

        try {
            await axios.post(`https://api.telegram.org/bot${this.token}/editMessageText`, {
                chat_id: this.chatId,
                message_id: messageId,
                text: message,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            });
            console.log(`[Telegram] Updated dispatch notification message_id: ${messageId}`);
            
            // Also send a reply to notify the group
            await axios.post(`https://api.telegram.org/bot${this.token}/sendMessage`, {
                chat_id: this.chatId,
                text: `✅ <b>${escapeHTML(assignedToName)}</b> đã nhận xử lý lead này!`,
                parse_mode: 'HTML',
                reply_to_message_id: messageId
            });
        } catch (error) {
            console.error('[Telegram Error] Failed to update/reply message:', error.response?.data || error.message);
        }
    }

    /**
     * Send an SLA reminder by replying to the original message
     * @param {Number} messageId - The Telegram message ID
     * @param {String} type - "30m" or "60m"
     */
    async sendDispatchReminder(messageId, type) {
        if (!this.token || !this.chatId || !messageId) return;

        let reminderMessage = "";
        if (type === '30m') {
            reminderMessage = `⚠️ <b>[CẢNH BÁO SLA]</b> Khách này đã được điều phối 30 phút nhưng chưa có ai nhận!`;
        } else if (type === '60m') {
            reminderMessage = `🚨 <b>[BÁO ĐỘNG ĐỎ]</b> Quá 60 phút khách này vẫn đang bị bỏ quên! Cần xử lý ngay!`;
        } else {
            return;
        }

        try {
            await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: reminderMessage,
                parse_mode: 'HTML',
                reply_to_message_id: messageId
            });
            console.log(`[Telegram] Sent SLA reminder (${type}) for message_id: ${messageId}`);
        } catch (error) {
            console.error('[Telegram Error] Failed to send SLA reminder:', error.response?.data || error.message);
        }
    }

    /**
     * Delete a previously sent notification
     * @param {Number} messageId - The Telegram message ID
     */
    async deleteLeadDispatchNotification(messageId) {
        if (!this.token || !this.chatId || !messageId) return;
        
        try {
            await axios.post(`https://api.telegram.org/bot${this.token}/deleteMessage`, {
                chat_id: this.chatId,
                message_id: messageId
            });
            console.log(`[Telegram] Deleted dispatch notification message_id: ${messageId}`);
        } catch (error) {
            console.error('[Telegram Error] Failed to delete message:', error.response?.data || error.message);
        }
    }

    /**
     * Send a notification when a new organic lead cannot be auto-assigned
     * @param {Object} lead - The lead object
     */
    async sendOrphanLeadNotification(lead) {
        if (!this.token || !this.chatId) return;

        const message = `🚨 <b>CẢNH BÁO: KHÁCH HÀNG MỒ CÔI TỪ INBOX</b> 🚨

Khách hàng mới nhắn tin từ kênh tự nhiên nhưng hệ thống không thể tự động phân bổ BU (không có từ khóa).

👤 <b>Tên:</b> ${escapeHTML(lead.name) || 'Không có tên'}
💬 <b>Nguồn:</b> ${escapeHTML(lead.source) || 'Messenger'}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}

👉 Vui lòng vào CRM, mục <b>Chưa phân bổ</b> để gán BU thủ công!`;

        try {
            await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });
            console.log(`[Telegram] Sent orphan lead notification for lead ${lead.id}`);
        } catch (error) {
            console.error('[Telegram Error] Failed to send orphan lead notification:', error.response?.data || error.message);
        }
    }

    /**
     * Send a notification when a new lead is created (unassigned)
     * @param {Object} lead - The newly created lead object
     * @returns {Number|null} message_id if successful, or null
     */
    async sendNewLeadNotification(lead) {
        if (!this.token || !this.chatId) return null;

        const message = `🚨 <b>CÓ LEAD MỚI ĐĂNG KÝ</b> 🚨

👤 <b>Tên:</b> ${escapeHTML(lead.name) || 'Không có tên'}
📞 <b>SĐT:</b> ${escapeHTML(lead.phone) || 'Chưa có SĐT'}
📧 <b>Email:</b> ${escapeHTML(lead.email) || 'Chưa có Email'}
🔖 <b>Nguồn:</b> ${escapeHTML(lead.source) || 'Không rõ'}

👉 Vui lòng vào CRM kiểm tra và liên hệ khách ngay!`;

        try {
            const res = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });
            console.log(`[Telegram] Sent new lead notification for lead ${lead.id}`);
            return res.data?.result?.message_id || null;
        } catch (error) {
            console.error('[Telegram Error] Failed to send new lead notification:', error.response?.data || error.message);
            return null;
        }
    }
    async sendGeminiCostReport(reportData) {
        if (!this.token || !this.chatId) {
            console.warn('Telegram token or chat ID is not configured. Skipping Gemini cost report.');
            return null;
        }

        const message = `📊 <b>BÁO CÁO CHI PHÍ AI (ZALO BOT)</b> 🤖

📅 <b>Ngày:</b> ${reportData.date}
⚡ <b>Model:</b> ${reportData.modelName}

📈 <b>THỐNG KÊ TOKEN:</b>
- Input Tokens: <b>${reportData.promptTokens.toLocaleString()}</b> (Giá: $0.75/1M)
- Cached Tokens: <b>${reportData.cachedTokens.toLocaleString()}</b> (Giá: $0.075/1M)
- Output Tokens: <b>${reportData.candidateTokens.toLocaleString()}</b> (Giá: $3.75/1M)
- Tổng Tokens: <b>${reportData.totalTokens.toLocaleString()}</b>

💰 <b>CHI PHÍ HÔM NAY:</b>
- Chi phí: <b>$${reportData.costUsd.toFixed(4)}</b>
- Ước tính VNĐ: <b>${Math.round(reportData.costUsd * 25400).toLocaleString()} VNĐ</b>

<i>⏳ Báo cáo được gửi tự động lúc 20:00 (GMT+7) hàng ngày.</i>`;

        try {
            const res = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });
            console.log(`[Telegram] Sent Gemini cost report for date ${reportData.date}`);
            return res.data?.result?.message_id || null;
        } catch (error) {
            console.error('[Telegram Error] Failed to send Gemini cost report:', error.response?.data || error.message);
            return null;
        }
    }

    /**
     * Thông báo Telegram khi AI bắt được SĐT nóng từ khách hàng Zalo
     */
    async sendHotLeadPhoneCapturedAlert(lead, phone) {
        if (!this.token || !this.chatId) {
            return null;
        }

        // Bỏ qua các lead test tự động để tránh làm phiền group Telegram
        if (lead.zalo_uid?.startsWith('qa_') || lead.name?.startsWith('QA_') || ['0912345678', '0938112233', '0988776655'].includes(phone)) {
            console.log(`[Telegram] Skipped test lead notification for ${lead.name} (${phone})`);
            return null;
        }

        const message = `🔥 <b>[HOT LEAD] KHÁCH ĐÃ ĐỂ LẠI SỐ ĐIỆN THOẠI TRÊN ZALO</b> 📞

👤 <b>Khách hàng:</b> ${escapeHTML(lead.name) || 'Khách Zalo'}
📞 <b>Số điện thoại:</b> <code>${escapeHTML(phone)}</code>
🏢 <b>BU phụ trách:</b> ${escapeHTML(lead.bu_group) || 'Chưa phân nhóm'}
📦 <b>Nhu cầu / Tour:</b> ${escapeHTML(lead.tour_name) || 'Đang trao đổi qua Zalo'}
🤖 <b>Trạng thái AI:</b> <i>Đã tự động ngắt bot để chuyển giao cho Sales</i>

👉 <i>Vui lòng phân bổ Sale hoặc mở CRM gọi điện tư vấn ngay cho khách nhé!</i>`;

        try {
            const res = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });
            console.log(`[Telegram] Sent Hot Lead Phone Alert for lead ${lead.id || lead.name}`);
            return res.data?.result?.message_id || null;
        } catch (error) {
            console.error('[Telegram Error] Failed to send hot lead phone alert:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new TelegramService();
