const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

const refreshZaloToken = async () => {
    try {
        if (!fs.existsSync(TOKEN_FILE_PATH)) return null;
        const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
        if (!tokens.refresh_token) return null;

        const appId = process.env.ZALO_APP_ID;
        const appSecret = process.env.ZALO_APP_SECRET;
        if (!appId || !appSecret) {
            console.warn('⚠️ Thiếu ZALO_APP_ID hoặc ZALO_APP_SECRET trong .env để refresh token.');
            return null;
        }

        const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', 
            new URLSearchParams({
                app_id: appId,
                refresh_token: tokens.refresh_token,
                grant_type: 'refresh_token'
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'secret_key': appSecret
                }
            }
        );

        if (response.data && response.data.access_token) {
            const newTokens = { ...tokens, ...response.data };
            fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(newTokens, null, 2));
            console.log('✅ Đã tự động Refresh Zalo OA Access Token thành công!');
            return newTokens.access_token;
        }
        return null;
    } catch (err) {
        console.error('❌ Lỗi refresh Zalo token trong ZNS Service:', err.response?.data || err.message);
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
        let accessToken = getAccessToken();
        if (!accessToken) {
            accessToken = await refreshZaloToken();
        }
        if (!accessToken) {
            throw new Error('Chưa có cấu hình Zalo OA Access Token hoặc token đã hết hạn.');
        }

        // Chuẩn hóa định dạng số điện thoại về 84xxxxxxxxx
        let formattedPhone = String(phone || '').replace(/[\s\.\-\+]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '84' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('84') && (formattedPhone.length === 9 || formattedPhone.length === 10)) {
            formattedPhone = '84' + formattedPhone;
        }

        const payload = {
            phone: formattedPhone,
            template_id: String(templateId),
            template_data: templateData,
            tracking_id: 'ZNS_' + Date.now()
        };

        const isDemoMode = false;
        
        let response = { data: {} };
        if (isDemoMode) {
            console.log('\n--- [ZALO ZNS DEMO MODE] ---');
            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('------------------------------\n');
            response.data = { error: 0, message: "Success", data: { msg_id: "demo_msg_" + Date.now() } };
        } else {
            // Thử gọi lần 1
            try {
                response = await axios.post('https://business.openapi.zalo.me/message/template', payload, {
                    headers: {
                        'access_token': accessToken,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
            } catch (apiErr) {
                // Nếu lỗi 401 hoặc token hết hạn, thử refresh và gọi lại 1 lần
                if (apiErr.response?.status === 401 || apiErr.response?.data?.error === -216) {
                    console.log('🔄 Token hết hạn (-216), đang tự động refresh token và thử lại...');
                    const newToken = await refreshZaloToken();
                    if (newToken) {
                        response = await axios.post('https://business.openapi.zalo.me/message/template', payload, {
                            headers: {
                                'access_token': newToken,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        });
                    } else {
                        throw apiErr;
                    }
                } else {
                    throw apiErr;
                }
            }
        }

        if (response.data && response.data.error !== 0) {
            // Mã lỗi chi tiết từ Zalo OpenAPI
            const errMsg = `Zalo ZNS Error (${response.data.error}): ${response.data.message}`;
            console.error('❌', errMsg, response.data);
            throw new Error(errMsg);
        }

        return { 
            success: true, 
            data: response.data?.data || response.data,
            rawResponse: response.data 
        };
    } catch (error) {
        console.error('❌ Lỗi gửi ZNS:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Lỗi không xác định khi gửi ZNS');
    }
};

module.exports = {
    sendZnsMessage
};
