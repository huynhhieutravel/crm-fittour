const axios = require('axios');
const db = require('../db');

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN;

exports.handleMessage = async (sender_psid, received_message) => {
    let response;

    if (received_message.text) {
        console.log(`Received message from ${sender_psid}: ${received_message.text}`);
        
        // 1. Kiểm tra xem hội thoại đã tồn tại chưa
        let convResult = await db.query('SELECT * FROM conversations WHERE external_id = $1', [sender_psid]);
        let conversationId;
        let leadId;

        if (convResult.rows.length === 0) {
            // 2. Nếu chưa có, tạo Lead mới
            const leadResult = await db.query(
                'INSERT INTO leads (name, source, status) VALUES ($1, $2, $3) RETURNING id',
                [`Messenger Guest ${sender_psid.substring(0, 5)}`, 'messenger', 'new']
            );
            leadId = leadResult.rows[0].id;

            // 3. Tạo Hội thoại mới
            const newConv = await db.query(
                'INSERT INTO conversations (source, external_id, lead_id, last_message) VALUES ($1, $2, $3, $4) RETURNING id',
                ['messenger', sender_psid, leadId, received_message.text]
            );
            conversationId = newConv.rows[0].id;
        } else {
            conversationId = convResult.rows[0].id;
            // Cập nhật tin nhắn cuối cùng
            await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [received_message.text, conversationId]);
        }

        // 4. Lưu tin nhắn vào bảng messages
        await db.query(
            'INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)',
            [conversationId, 'customer', received_message.text]
        );

        response = {
            "text": `Chào bạn! Cảm ơn bạn đã nhắn tin cho FIT Tour. Chúng tôi đã nhận được tin nhắn và tư vấn viên sẽ liên hệ với bạn ngay!`
        };
    }

    // Gửi phản hồi qua Graph API
    await this.callSendAPI(sender_psid, response);
};

exports.handlePostback = async (sender_psid, received_postback) => {
    let response;
    let payload = received_postback.payload;

    if (payload === 'GET_STARTED') {
        response = { "text": "Chào mừng bạn đến với FIT Tour! Bạn đang quan tâm đến tour du lịch nào?" };
    }

    await this.callSendAPI(sender_psid, response);
};

exports.callSendAPI = async (sender_psid, response) => {
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: sender_psid },
            message: response
        });
        console.log('Message sent!');
    } catch (error) {
        console.error('Unable to send message:', error.response ? error.response.data : error.message);
    }
};
