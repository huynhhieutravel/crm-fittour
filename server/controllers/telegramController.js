const db = require('../db');
const axios = require('axios');
const telegramService = require('../services/telegramService');

exports.setWebhook = async (req, res) => {
    try {
        const url = 'https://erp.fittour.vn/api/telegram/webhook';
        const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, { url });
        res.json(response.data);
    } catch (error) {
        console.error('Error setting webhook', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    // Acknowledge receipt to Telegram immediately so it doesn't retry
    res.sendStatus(200);

    const data = req.body;
    
    // Handle commands like /myid
    if (data.message && data.message.text) {
        const text = data.message.text;
        const chatId = data.message.chat.id;
        const userId = data.message.from.id;

        if (text === '/myid' || text === '/start') {
            try {
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: `Mã ID Telegram của bạn là: <b>${userId}</b>\n\n<i>Hãy copy dãy số này gửi cho Quản lý để điền vào hồ sơ CRM của bạn nhé!</i>`,
                    parse_mode: 'HTML'
                });
            } catch (err) {
                console.error('Error sending /myid response', err.message);
            }
        }
        return;
    }

    // Handle Inline Button clicks (Claim Lead)
    if (data.callback_query) {
        const callbackQuery = data.callback_query;
        const callbackData = callbackQuery.data; // e.g. "claim_lead_123"
        const fromUserId = callbackQuery.from.id;
        const messageId = callbackQuery.message.message_id;
        const chatId = callbackQuery.message.chat.id;

        if (callbackData.startsWith('claim_lead_')) {
            const leadId = parseInt(callbackData.replace('claim_lead_', ''));

            try {
                // 1. Check if the Telegram User is mapped in the CRM
                const userRes = await db.query('SELECT id, full_name FROM users WHERE telegram_user_id = $1 LIMIT 1', [fromUserId]);
                if (userRes.rows.length === 0) {
                    // Not mapped, alert them
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Bạn chưa liên kết tài khoản CRM với Telegram! Hãy chat /myid với Bot và dán ID vào hồ sơ CRM của bạn.",
                        show_alert: true
                    });
                    return;
                }

                const employee = userRes.rows[0];

                // 2. Check if the Lead is already claimed or updated
                const leadRes = await db.query('SELECT assigned_to FROM leads WHERE id = $1', [leadId]);
                if (leadRes.rows.length === 0) {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Lead này không tồn tại hoặc đã bị xóa!",
                        show_alert: true
                    });
                    return;
                }

                if (leadRes.rows[0].assigned_to) {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Opps, Lead này đã có người nhận mất rồi!",
                        show_alert: true
                    });
                    return;
                }

                // 3. Claim the Lead
                await db.query(
                    `UPDATE leads SET assigned_to = $1, status = 'Chưa chăm sóc', updated_at = NOW() WHERE id = $2`,
                    [employee.id, leadId]
                );

                // 4. Acknowledge the claim
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                    callback_query_id: callbackQuery.id,
                    text: `Chúc mừng! Bạn đã nhận Lead thành công.`,
                    show_alert: false
                });

                // 5. Edit the message to remove the button and append "Claimed by"
                const originalText = callbackQuery.message.text || callbackQuery.message.caption || "🚨 CÓ LEAD MỚI ĐƯỢC ĐIỀU PHỐI 🚨";
                const newText = originalText + `\n\n✅ <b>Đã được nhận bởi:</b> ${employee.full_name}`;
                
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
                    chat_id: chatId,
                    message_id: messageId,
                    text: newText,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '↩️ Nhả Lead lại', callback_data: `unclaim_lead_${leadId}` }
                            ]
                        ]
                    }
                });

            } catch (err) {
                console.error('Error handling claim_lead', err.message);
                try {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Có lỗi hệ thống xảy ra!",
                        show_alert: true
                    });
                } catch(e) {}
            }
        } else if (callbackData.startsWith('unclaim_lead_')) {
            const leadId = parseInt(callbackData.replace('unclaim_lead_', ''));
            
            try {
                // 1. Check mapping
                const userRes = await db.query('SELECT id, full_name FROM users WHERE telegram_user_id = $1 LIMIT 1', [fromUserId]);
                if (userRes.rows.length === 0) {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Bạn chưa liên kết tài khoản CRM với Telegram!",
                        show_alert: true
                    });
                    return;
                }
                const employee = userRes.rows[0];

                // 2. Check if lead is assigned to this user
                const leadRes = await db.query('SELECT assigned_to FROM leads WHERE id = $1', [leadId]);
                if (leadRes.rows.length === 0) {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Lead này không tồn tại hoặc đã bị xóa!",
                        show_alert: true
                    });
                    return;
                }

                if (leadRes.rows[0].assigned_to !== employee.id) {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Bạn không thể nhả Lead của người khác!",
                        show_alert: true
                    });
                    return;
                }

                // 3. Unclaim lead
                await db.query(
                    `UPDATE leads SET assigned_to = NULL, status = 'Chưa phân bổ', updated_at = NOW() WHERE id = $1`,
                    [leadId]
                );

                // 4. Acknowledge the unclaim
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                    callback_query_id: callbackQuery.id,
                    text: `Bạn đã nhả Lead thành công. Lead hiện có thể được nhận bởi người khác.`,
                    show_alert: false
                });

                // 5. Restore the message to original
                let originalText = callbackQuery.message.text || callbackQuery.message.caption || "🚨 CÓ LEAD MỚI ĐƯỢC ĐIỀU PHỐI 🚨";
                // Remove the "Đã được nhận bởi..." part
                const claimTextIndex = originalText.lastIndexOf('\n\n✅ <b>Đã được nhận bởi:');
                if (claimTextIndex !== -1) {
                    originalText = originalText.substring(0, claimTextIndex);
                }

                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
                    chat_id: chatId,
                    message_id: messageId,
                    text: originalText,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🚀 Nhận Lead', callback_data: `claim_lead_${leadId}` }
                            ]
                        ]
                    }
                });

            } catch (err) {
                console.error('Error handling unclaim_lead', err.message);
                try {
                    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                        callback_query_id: callbackQuery.id,
                        text: "Có lỗi hệ thống xảy ra!",
                        show_alert: true
                    });
                } catch(e) {}
            }
        }
    }
};
