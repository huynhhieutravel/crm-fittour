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
}

module.exports = new TelegramService();
