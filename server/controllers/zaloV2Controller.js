const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TOKEN_FILE_PATH = path.join(__dirname, '../../zalo_tokens.json');
const SANDBOX_FILE_PATH = path.join(__dirname, '../../zalo_sandbox_messages.json');

// Helper to save messages
const saveMessage = (msg) => {
  let messages = [];
  if (fs.existsSync(SANDBOX_FILE_PATH)) {
    messages = JSON.parse(fs.readFileSync(SANDBOX_FILE_PATH, 'utf8'));
  }
  messages.push({
    ...msg,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(SANDBOX_FILE_PATH, JSON.stringify(messages, null, 2));
};
// Helper to get user profile from Zalo API
const getZaloProfile = async (uid) => {
  try {
    if (!fs.existsSync(TOKEN_FILE_PATH)) return null;
    const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
    const response = await axios.get(`https://openapi.zalo.me/v2.0/oa/getprofile?data={"user_id":"${uid}"}`, {
      headers: { 'access_token': tokens.access_token }
    });
    if (response.data && response.data.data) {
      return {
        name: response.data.data.display_name,
        avatar: response.data.data.avatar
      };
    }
  } catch (err) {
    console.error("Error fetching Zalo profile:", err.response?.data || err.message);
  }
  return null;
};
const zaloV2Controller = {
  // --- TEST 1: OAUTH & API CONNECTION ---
  login: (req, res) => {
    if (process.env.ZALO_V2_ENABLED !== 'ON') {
      return res.status(403).send('Zalo V2 Module is DISABLED (Kill Switch ON).');
    }
    const appId = process.env.ZALO_APP_ID;
    // Hardcode URL để tránh lỗi Nginx proxy trả về host nội bộ (localhost:4000)
    const callbackUrl = encodeURIComponent(`https://erp.fittour.vn/api/zalo-v2/auth/callback`);
    const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${callbackUrl}`;
    res.redirect(authUrl);
  },

  callback: async (req, res) => {
    const { code, oa_id } = req.query;
    if (!code) {
      return res.status(400).send('Không nhận được Authorization Code từ Zalo');
    }

    try {
      // Đổi Authorization Code lấy Access Token
      const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', 
        new URLSearchParams({
          app_id: process.env.ZALO_APP_ID,
          code: code,
          grant_type: 'authorization_code'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': process.env.ZALO_APP_SECRET
          }
        }
      );

      if (response.data && response.data.access_token) {
        // Lưu token vào file tạm (PoC)
        fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(response.data, null, 2));
        res.send('✅ Xác thực thành công! Đã lấy được Access Token. Bây giờ hãy gọi GET /api/zalo-v2/test-connection để test API.');
      } else {
        res.status(400).json({ error: 'Lỗi từ Zalo', details: response.data });
      }
    } catch (error) {
      console.error('Lỗi lấy token:', error.response?.data || error.message);
      res.status(500).send('Lỗi server khi lấy token');
    }
  },

  testConnection: async (req, res) => {
    try {
      if (!fs.existsSync(TOKEN_FILE_PATH)) {
        return res.status(400).send('Chưa có token. Vui lòng gọi GET /api/zalo-v2/auth/login trước.');
      }
      const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
      const accessToken = tokens.access_token;

      // Gọi API lấy thông tin OA để test kết nối
      const response = await axios.get('https://openapi.zalo.me/v2.0/oa/getoa', {
        headers: {
          'access_token': accessToken
        }
      });

      res.json({
        message: '✅ Kết nối Zalo API thành công (TEST 1 PASSED)',
        oa_info: response.data
      });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi gọi API', details: error.response?.data || error.message });
    }
  },

  // --- TEST 2 & 3: WEBHOOK ---
  verifyWebhook: (req, res) => {
    if (process.env.ZALO_V2_ENABLED !== 'ON') {
      return res.status(403).send('Zalo V2 Module is DISABLED');
    }
    // Zalo có thể gọi GET tới webhook lúc đăng ký
    res.status(200).send('Webhook is ready!');
  },

  handleWebhook: async (req, res) => {
    if (process.env.ZALO_V2_ENABLED !== 'ON') {
      return res.status(200).send('OK (Module Disabled)');
    }
    
    // Trả về 200 OK ngay lập tức để Zalo không phạt timeout
    res.status(200).send('OK');

    const body = req.body;
    console.log('\n--- [ZALO V2 WEBHOOK] Nhận được Event ---');
    console.log(JSON.stringify(body, null, 2));
    
    // Save to Sandbox if it's a message
    if (body.event_name === 'user_send_text' && body.sender?.id && body.message?.text) {
      const profile = await getZaloProfile(body.sender.id);
      saveMessage({
        id: body.message.msg_id || Date.now().toString(),
        senderId: body.sender.id,
        senderName: profile?.name,
        senderAvatar: profile?.avatar,
        text: body.message.text,
        type: 'incoming'
      });
    } else if (body.event_name === 'oa_send_text' && body.recipient?.id && body.message?.text) {
      const profile = await getZaloProfile(body.recipient.id);
      saveMessage({
        id: body.message.msg_id || Date.now().toString(),
        senderId: body.recipient.id, // Nhóm theo người nhận
        senderName: profile?.name,
        senderAvatar: profile?.avatar,
        text: body.message.text,
        type: 'outgoing'
      });
    }

    // Kiểm tra TEST MODE
    const testMode = process.env.ZALO_V2_TEST_MODE === 'ON';
    if (!testMode) {
      console.log('Test mode đang OFF. Bỏ qua auto-reply.');
      return;
    }

    // Logic cho Test 3: Trả lời tự động nếu là tin nhắn text
    if (body.event_name === 'user_send_text') {
      const senderId = body.sender?.id;
      const text = body.message?.text;
      const testUid = process.env.ZALO_TEST_UID;

      if (!senderId) return;

      if (senderId !== testUid) {
        console.log(`[Bảo vệ] Bỏ qua tin nhắn từ người lạ (UID: ${senderId}). Chỉ trả lời Test UID.`);
        return;
      }

      console.log(`Tiến hành Auto-Reply tới Test UID: ${senderId}`);
      
      try {
        if (!fs.existsSync(TOKEN_FILE_PATH)) return;
        const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
        
        await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', 
          {
            recipient: { user_id: senderId },
            message: { text: 'ERP FIT TOUR xác nhận đã nhận tin nhắn PoC của bạn!' }
          },
          {
            headers: {
              'access_token': tokens.access_token,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Auto-Reply thành công!');
      } catch (error) {
        console.error('❌ Lỗi Auto-Reply:', error.response?.data || error.message);
      }
    }
  },

  // --- SANDBOX ---
  getSandboxMessages: (req, res) => {
    try {
      if (!fs.existsSync(SANDBOX_FILE_PATH)) {
        return res.json([]);
      }
      const messages = JSON.parse(fs.readFileSync(SANDBOX_FILE_PATH, 'utf8'));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi đọc sandbox messages' });
    }
  },

  replySandboxMessage: async (req, res) => {
    const { recipientId, text } = req.body;
    if (!recipientId || !text) {
      return res.status(400).json({ error: 'Missing recipientId or text' });
    }
    
    try {
      if (!fs.existsSync(TOKEN_FILE_PATH)) {
        return res.status(400).json({ error: 'Chưa có token. Vui lòng gọi GET /api/zalo-v2/auth/login trước.' });
      }
      const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
      
      await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', 
        {
          recipient: { user_id: recipientId },
          message: { text: text }
        },
        {
          headers: {
            'access_token': tokens.access_token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Save to sandbox
      const profile = await getZaloProfile(recipientId);
      saveMessage({
        id: Date.now().toString(),
        senderId: recipientId, // For grouping in UI
        senderName: profile?.name,
        senderAvatar: profile?.avatar,
        text: text,
        type: 'outgoing'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Lỗi Reply Sandbox:', error.response?.data || error.message);
      res.status(500).json({ error: 'Lỗi khi gửi tin', details: error.response?.data || error.message });
    }
  }
};

module.exports = zaloV2Controller;
