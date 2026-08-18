const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../db');

const TOKEN_FILE_PATH = path.join(__dirname, '../../zalo_tokens.json');

const getAccessToken = () => {
    if (!fs.existsSync(TOKEN_FILE_PATH)) return null;
    try {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
        return tokens.access_token;
    } catch (e) {
        console.error('Lỗi đọc Zalo Token:', e.message);
        return null;
    }
};

/**
 * Send ZNS Template Message
 * @param {string} phone Vietnam phone number
 * @param {string} templateId ZNS Template ID
 * @param {object} templateData Template Data payload
 */
const sendZnsMessage = async (phone, templateId, templateData) => {
    try {
        const accessToken = getAccessToken();
        if (!accessToken) {
            throw new Error('Chưa có cấu hình Zalo OA Access Token.');
        }

        // Format phone to 84xxxxxxxxx
        let formattedPhone = phone.replace(/[\s\.\-\+]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '84' + formattedPhone.substring(1);
        }

        const payload = {
            phone: formattedPhone,
            template_id: templateId,
            template_data: templateData,
            tracking_id: Date.now().toString()
        };

        // Bật chế độ DEMO để không gọi thật lên Zalo (tránh tốn phí và lỗi do chưa có template ID thật)
        const isDemoMode = true; 
        
        let response = { data: {} };
        if (isDemoMode) {
            console.log('\n--- [ZALO ZNS DEMO MODE] ---');
            console.log('Sẽ gửi ZNS payload:', JSON.stringify(payload, null, 2));
            console.log('------------------------------\n');
            // Giả lập Zalo trả về thành công
            response.data = { error: 0, message: "Success", data: { msg_id: "demo_msg_12345" } };
            // Simulate delay
            await new Promise(r => setTimeout(r, 1000));
        } else {
            response = await axios.post('https://business.openapi.zalo.me/message/template', payload, {
                headers: {
                    'access_token': accessToken,
                    'Content-Type': 'application/json'
                }
            });
        }

        if (response.data && response.data.error) {
            throw new Error(`Zalo ZNS Error (${response.data.error}): ${response.data.message}`);
        }

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Lỗi gửi ZNS:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendZnsMessage
};
