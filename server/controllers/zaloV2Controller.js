const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../db');
const facebookService = require('../services/facebookService');
const notificationController = require('./notificationController');
const telegramService = require('../services/telegramService');
const zaloAiService = require('../services/zaloAiService');
const zaloZnsService = require('../services/zaloZnsService');

const extractVietnamPhone = (text) => {
  if (!text) return null;
  const phoneRegex = /(?:\+84|0)(?:[\s\.\-]*[3|5|7|8|9])(?:[\s\.\-]*[0-9]){8}\b/g;
  const matches = text.match(phoneRegex);
  if (matches && matches.length > 0) {
    let phone = matches[0].replace(/[\s\.\-\+]/g, '');
    if (phone.startsWith('84')) phone = '0' + phone.substring(2);
    return phone;
  }
  return null;
};

const TOKEN_FILE_PATH = path.join(__dirname, '../../zalo_tokens.json');
const SANDBOX_FILE_PATH = path.join(__dirname, '../../zalo_sandbox_messages.json');

const saveMessage = (msg) => {
  let messages = [];
  if (fs.existsSync(SANDBOX_FILE_PATH)) {
    try {
      messages = JSON.parse(fs.readFileSync(SANDBOX_FILE_PATH, 'utf8'));
    } catch (e) {
      messages = [];
    }
  }
  // 1. Prevent duplicate by exact msg id
  if (msg.id && messages.some(m => m.id === msg.id)) {
    return;
  }

  // 2. Prevent duplicate outgoing messages sent within 10 seconds with identical text
  const isDuplicateOutgoing = messages.some(m => 
    m.type === 'outgoing' && 
    (m.senderId === msg.senderId || m.recipientId === msg.senderId) && 
    m.text && msg.text && m.text.trim() === msg.text.trim() &&
    Math.abs(Date.now() - new Date(m.timestamp).getTime()) < 10000
  );
  if (isDuplicateOutgoing) {
    return;
  }

  messages.push({
    ...msg,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(SANDBOX_FILE_PATH, JSON.stringify(messages, null, 2));

  // Emit socket event to update clients in real-time
  if (global.io) {
    global.io.emit('zalo_message_update');
  }
};

// Helper quản lý phiên AI (Session State) theo từng khách hàng Zalo
const getAiSession = async (zaloUid) => {
  if (!zaloUid) return { is_ai_active: true, message_count: 0 };
  try {
    const res = await db.query(`SELECT * FROM zalo_ai_sessions WHERE zalo_uid = $1`, [String(zaloUid)]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return { zalo_uid: String(zaloUid), is_ai_active: true, message_count: 0 };
  } catch (e) {
    console.error('[ZaloV2] Error getAiSession:', e.message);
    return { is_ai_active: true, message_count: 0 };
  }
};

const incrementAiSessionTurn = async (zaloUid) => {
  if (!zaloUid) return 1;
  try {
    const res = await db.query(`
      INSERT INTO zalo_ai_sessions (zalo_uid, is_ai_active, message_count, last_message_at, updated_at)
      VALUES ($1, true, 1, NOW(), NOW())
      ON CONFLICT (zalo_uid) DO UPDATE
      SET message_count = COALESCE(zalo_ai_sessions.message_count, 0) + 1,
          last_message_at = NOW(),
          updated_at = NOW()
      RETURNING message_count, is_ai_active;
    `, [String(zaloUid)]);
    return res.rows[0]?.message_count || 1;
  } catch (e) {
    console.error('[ZaloV2] Error incrementAiSessionTurn:', e.message);
    return 1;
  }
};

const setAiSession = async (zaloUid, isAiActive, mutedBy, notes = null) => {
  if (!zaloUid) return;
  try {
    await db.query(`
      INSERT INTO zalo_ai_sessions (zalo_uid, is_ai_active, muted_by, muted_at, updated_at, notes)
      VALUES ($1, $2, $3, CASE WHEN $2 = false THEN NOW() ELSE NULL END, NOW(), $4)
      ON CONFLICT (zalo_uid) DO UPDATE
      SET is_ai_active = $2,
          muted_by = $3,
          muted_at = CASE WHEN $2 = false THEN NOW() ELSE NULL END,
          updated_at = NOW(),
          notes = COALESCE($4, zalo_ai_sessions.notes)
    `, [String(zaloUid), isAiActive, mutedBy, notes]);

    if (global.io) {
      global.io.emit('zalo_ai_session_update', {
        zalo_uid: String(zaloUid),
        is_ai_active: isAiActive,
        muted_by: mutedBy,
        notes
      });
    }
  } catch (e) {
    console.error('[ZaloV2] Error setAiSession:', e.message);
  }
};

// Helper to get user profile from Zalo API via Zalo Gateway VN
const getZaloProfile = async (uid) => {
  try {
    if (!fs.existsSync(TOKEN_FILE_PATH)) return null;
    const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
    
    // Không cần dùng Gateway nữa vì Zalo V3 không còn chặn IP nước ngoài!
    const response = await axios.get(`https://openapi.zalo.me/v3.0/oa/user/detail?data={"user_id":"${uid}"}`, {
      headers: {
        'access_token': tokens.access_token
      },
      timeout: 3000 // Timeout 3s
    });
    
    console.log(`[Zalo V3 Response for UID ${uid}]:`, response.data);
    
    return {
      name: response.data.data?.display_name,
      avatar: response.data.data?.avatar
    };
  } catch (error) {
    console.error(`❌ Zalo Gateway Error cho UID ${uid}:`, error.message);
    // Fallback về Zalo User
    return null;
  }
};

const refreshZaloToken = async (refreshToken) => {
  try {
    const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', 
      new URLSearchParams({
        app_id: process.env.ZALO_APP_ID,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': process.env.ZALO_APP_SECRET
        }
      }
    );
    if (response.data && response.data.access_token) {
      fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(response.data, null, 2));
      return response.data;
    }
    return null;
  } catch (err) {
    console.error('Lỗi khi refresh Zalo token:', err.response?.data || err.message);
    return null;
  }
};

const sendZaloCsMessageWithAutoRefresh = async (recipientId, text) => {
  let tokens = null;
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    try {
      tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
    } catch (e) {
      console.error('[ZaloV2] Error reading token file:', e.message);
    }
  }
  if (!tokens?.access_token) {
    console.error('[ZaloV2] No valid access token found');
    return false;
  }

  const sendOnce = async (token) => {
    return await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', 
      {
        recipient: { user_id: recipientId },
        message: { text }
      },
      {
        headers: {
          'access_token': token,
          'Content-Type': 'application/json'
        }
      }
    );
  };

  try {
    let res = await sendOnce(tokens.access_token);
    if (res.data?.error === -216 || res.data?.error === -215) {
      console.log('[ZaloV2] Access Token expired (-216), auto-refreshing token...');
      const newTokens = await refreshZaloToken(tokens.refresh_token);
      if (newTokens?.access_token) {
        console.log('[ZaloV2] Retrying send message with new access token...');
        res = await sendOnce(newTokens.access_token);
      }
    }
    if (res.data?.error && res.data.error !== 0) {
      console.error('[ZaloV2] Error from Zalo API:', res.data);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[ZaloV2] Error sending CS message:', err.response?.data || err.message);
    return false;
  }
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
    if (['user_send_text', 'user_send_image', 'user_send_file'].includes(body.event_name) && body.sender?.id && body.message) {
      const profile = await getZaloProfile(body.sender.id);
      
      let attachments = null;
      if (body.message.attachments && body.message.attachments.length > 0) {
        attachments = body.message.attachments.map(att => ({
          type: att.type,
          url: att.payload?.url,
          name: att.payload?.name || 'File đính kèm',
          size: att.payload?.size
        }));
      }

      saveMessage({
        id: body.message.msg_id || Date.now().toString(),
        senderId: body.sender.id,
        senderName: profile?.name,
        senderAvatar: profile?.avatar,
        text: body.message.text || '',
        type: 'incoming',
        attachments: attachments
      });

      // DB Lead Sync: Tự động tạo / cập nhật Lead trong PostgreSQL
      try {
        const senderId = body.sender.id;
        const messageText = body.message.text || '';
        const senderName = profile?.name || `Zalo Guest ${senderId.substring(0, 5)}`;
        
        // 1. Kiểm tra Lead hiện tại theo zalo_uid
        const leadRes = await db.query(
          'SELECT * FROM leads WHERE zalo_uid = $1 ORDER BY created_at DESC LIMIT 1',
          [senderId]
        );

        let leadId;
        if (leadRes.rows.length === 0) {
          // Chưa có Lead -> Tạo Lead mới
          const insertRes = await db.query(
            `INSERT INTO leads (name, source, status, zalo_uid, last_contacted_at, customer_id) 
             VALUES ($1, 'Zalo', 'Mới', $2, NOW(), (SELECT id FROM customers WHERE zalo_uid = $3 LIMIT 1)) 
             RETURNING *`,
            [senderName, senderId, senderId]
          );
          const newLead = insertRes.rows[0];
          leadId = newLead.id;
          console.log(`[ZALO WEBHOOK] ✅ Đã tạo Lead mới #${leadId} (${senderName}) từ Zalo UID ${senderId}`);

          // Auto-classify BU
          const autoBU = await facebookService.classifyBUFromMessage(messageText);
          if (autoBU) {
            await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU, leadId]);
            console.log(`[BU-AUTO] Zalo Lead #${leadId} (${senderName}) → Auto BU: ${autoBU}`);
            notificationController.broadcastNewLead({ id: leadId, customer_name: senderName }, autoBU).catch(console.error);
          }

          // Auto-classify Tour
          const autoTour = await facebookService.classifyTourFromMessage(messageText);
          if (autoTour && autoTour.tour_id) {
            const q = autoBU ? 
              'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
              'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
            const params = autoBU ? 
              [autoTour.tour_id, leadId] : 
              [autoTour.tour_id, autoTour.bu_group, leadId];
            await db.query(q, params);
            console.log(`[TOUR-AUTO] Zalo Lead #${leadId} (${senderName}) → Auto Tour: ${autoTour.tour_id}`);
            
            if (!autoBU && autoTour.bu_group) {
              notificationController.broadcastNewLead({ id: leadId, customer_name: senderName }, autoTour.bu_group).catch(console.error);
            }
          }

          if (!autoBU && (!autoTour || !autoTour.bu_group)) {
            telegramService.sendOrphanLeadNotification(newLead).catch(console.error);
          }
        } else {
          const oldLead = leadRes.rows[0];
          let isExpired = false;
          if (oldLead.last_contacted_at) {
            const daysSinceLastContact = (new Date() - new Date(oldLead.last_contacted_at)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastContact > 30) isExpired = true;
          } else if (oldLead.created_at) {
            const daysSinceCreated = (new Date() - new Date(oldLead.created_at)) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated > 30) isExpired = true;
          }

          // NẾU LUỒNG CŨ ĐÃ ĐÓNG HOẶC QUÁ 30 NGÀY -> TẠO LEAD MỚI (REOPEN DEAL)
          if (['Chốt đơn', 'Thất bại'].includes(oldLead.status) || isExpired) {
            console.log(`[ZALO WEBHOOK] Khách Zalo nhắn lại (Lead đã đóng hoặc quá 30 ngày): ${oldLead.name}. Đang tạo Lead mới...`);
            const newLeadResult = await db.query(
              `INSERT INTO leads (name, source, status, zalo_uid, last_contacted_at, customer_id, phone, email) 
               VALUES ($1, 'Zalo', 'Mới', $2, NOW(), (SELECT id FROM customers WHERE zalo_uid = $3 LIMIT 1), $4, $5) 
               RETURNING *`,
              [oldLead.name, senderId, senderId, oldLead.phone, oldLead.email]
            );
            leadId = newLeadResult.rows[0].id;

            const autoBU2 = await facebookService.classifyBUFromMessage(messageText);
            if (autoBU2) {
              await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU2, leadId]);
            }
            const autoTour2 = await facebookService.classifyTourFromMessage(messageText);
            if (autoTour2 && autoTour2.tour_id) {
              const q2 = autoBU2 ? 
                'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
              const params2 = autoBU2 ? 
                [autoTour2.tour_id, leadId] : 
                [autoTour2.tour_id, autoTour2.bu_group, leadId];
              await db.query(q2, params2);
            }
          } else {
            // LUỒNG VẪN ĐANG ACTIVE
            leadId = oldLead.id;
            if (profile?.name && (oldLead.name.startsWith('Zalo Guest') || oldLead.name.startsWith('Zalo User'))) {
              await db.query('UPDATE leads SET name = $1, last_contacted_at = NOW() WHERE id = $2', [profile.name, leadId]);
              console.log(`[ZALO WEBHOOK] ✅ Đã cập nhật tên Lead #${leadId} từ ${oldLead.name} -> ${profile.name}`);
            } else if (oldLead.status === 'Không phản hồi') {
              console.log(`[ZALO WEBHOOK] Khách nhắn lại cho Lead (Auto-Fail): ${oldLead.name}. Re-opening -> Mới.`);
              await db.query("UPDATE leads SET status = 'Mới', last_contacted_at = NOW(), updated_at = NOW() WHERE id = $1", [leadId]);
            } else {
              await db.query('UPDATE leads SET last_contacted_at = NOW() WHERE id = $1', [leadId]);
            }

            // Phân loại BU nếu chưa có
            if (!oldLead.bu_group && messageText) {
              const autoBU3 = await facebookService.classifyBUFromMessage(messageText);
              if (autoBU3) {
                await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU3, leadId]);
                console.log(`[BU-AUTO] Zalo Lead #${leadId} (${oldLead.name}) → Auto BU: ${autoBU3} (từ tin nhắn tiếp theo)`);
              }
            }

            // Phân loại Tour nếu chưa có
            if (!oldLead.tour_id && messageText) {
              const autoTour3 = await facebookService.classifyTourFromMessage(messageText);
              if (autoTour3 && autoTour3.tour_id) {
                const updatedLead = await db.query('SELECT bu_group FROM leads WHERE id = $1', [leadId]);
                const currentBuGroup = updatedLead.rows[0]?.bu_group;
                const q3 = currentBuGroup ? 
                  'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                  'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                const params3 = currentBuGroup ? 
                  [autoTour3.tour_id, leadId] : 
                  [autoTour3.tour_id, autoTour3.bu_group, leadId];
                await db.query(q3, params3);
                console.log(`[TOUR-AUTO] Zalo Lead #${leadId} (${oldLead.name}) → Auto Tour: ${autoTour3.tour_id}`);
              }
            }
          }
        }

        // Tự động trích xuất Số điện thoại nếu khách gõ
        const extractedPhone = extractVietnamPhone(messageText);
        if (extractedPhone && leadId) {
          const checkPhone = await db.query('SELECT phone FROM leads WHERE id = $1', [leadId]);
          if (checkPhone.rows.length > 0) {
            const currentPhone = checkPhone.rows[0].phone;
            if (currentPhone !== extractedPhone) {
              console.log(`[ZALO WEBHOOK] Phát hiện SĐT mới ${extractedPhone} cho Zalo Lead ID ${leadId} (cũ: ${currentPhone || 'Trống'}). Đang ghi đè...`);
              await db.query(
                'UPDATE leads SET phone = $1, customer_id = COALESCE(customer_id, (SELECT id FROM customers WHERE phone = $3 LIMIT 1)) WHERE id = $2',
                [extractedPhone, leadId, extractedPhone]
              );
            }
          }
        }
      } catch (dbErr) {
        console.error('❌ Lỗi lưu Lead từ Zalo Webhook vào DB:', dbErr.message);
      }
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

    // Logic: Trả lời tự động cho Zalo OA nếu là tin nhắn text từ khách hàng
    if (body.event_name === 'user_send_text') {
      const senderId = body.sender?.id;
      const text = body.message?.text;

      if (!senderId || !text) return;

      // 1. Kiểm tra cấu hình AI Agent toàn cục
      const aiConfig = await zaloAiService.getAiConfig();
      if (!aiConfig || aiConfig.system_config?.is_sandbox_bot_enabled === false) {
        console.log(`[AI Agent] Bot đang tắt trong Cài đặt Zalo AI. Bỏ qua Auto-Reply.`);
        return;
      }

      // 2. Kiểm tra trạng thái phiên AI của khách hàng này (Nhân viên tiếp quản / Human Takeover)
      const aiSession = await getAiSession(senderId);
      if (aiSession && aiSession.is_ai_active === false) {
        console.log(`[AI Muted] UID ${senderId} đã được nhân viên tiếp quản (Muted by: ${aiSession.muted_by}). Bỏ qua Auto-Reply để nhân viên chat.`);
        return;
      }

      // 3. Kiểm tra Giới hạn số tin nhắn AI tối đa (Max Turns - Mặc định 10 lượt)
      const maxTurns = Number(aiConfig.system_config?.max_ai_turns || 10);
      const currentTurn = await incrementAiSessionTurn(senderId);

      // Lấy Access Token hợp lệ của Zalo OA
      let accessToken = null;
      if (fs.existsSync(TOKEN_FILE_PATH)) {
        try {
          const tokenData = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
          accessToken = tokenData?.access_token;
        } catch (e) {
          console.error('[ZaloV2] Lỗi đọc token file:', e.message);
        }
      }

      if (!accessToken) {
        console.error('[ZaloV2] Không tìm thấy Zalo OA access_token hợp lệ. Vui lòng đăng nhập lại Zalo OA.');
        return;
      }

      if (currentTurn > maxTurns) {
        console.log(`[AI Max Turns Reached] UID ${senderId} đã đạt ngưỡng ${currentTurn}/${maxTurns} tin nhắn. Tự động ngắt AI và gửi câu chuyển giao cho chuyên viên.`);
        
        const handoverText = `Dạ để hỗ trợ Anh/Chị chu đáo và chi tiết nhất cho hành trình này, em đã chuyển tiếp toàn bộ thông tin của mình tới Chuyên viên tư vấn chuyên tuyến của FIT TOUR. Chuyên viên sẽ trực tiếp nhắn tin hỗ trợ Anh/Chị ngay tại khung chat này nhé ạ! 💚`;
        
        try {
          await sendZaloCsMessageWithAutoRefresh(senderId, handoverText);

          const customerProfile = await getZaloProfile(senderId);
          saveMessage({
            id: Date.now().toString(),
            senderId: senderId,
            senderName: customerProfile?.name || profile?.name,
            senderAvatar: customerProfile?.avatar || profile?.avatar,
            recipientId: senderId,
            text: handoverText,
            type: 'outgoing',
            senderType: 'ai',
            senderStaffName: 'AI Agent'
          });

          await setAiSession(senderId, false, 'max_turn_limit', `Đã đạt giới hạn ${maxTurns} tin nhắn`);
        } catch (e) {
          console.error('[ZaloV2] Lỗi gửi tin nhắn chuyển giao max turns:', e.message);
        }
        return;
      }

      console.log(`[Zalo OA AI Agent] 🤖 Đang sinh phản hồi tự động (Lượt ${currentTurn}/${maxTurns}) cho UID: ${senderId}`);
      
      try {
        // Lấy lịch sử hội thoại gần nhất của khách hàng này (tối đa 6 tin)
        let conversationHistory = [];
        if (fs.existsSync(SANDBOX_FILE_PATH)) {
          try {
            const allMsgs = JSON.parse(fs.readFileSync(SANDBOX_FILE_PATH, 'utf8'));
            conversationHistory = allMsgs
              .filter(m => m.senderId === senderId || m.recipientId === senderId)
              .slice(-6)
              .map(m => ({
                sender: m.senderId === senderId ? 'user' : 'model',
                text: m.text || ''
              }));
          } catch (e) {
            console.error('[ZaloV2] Lỗi đọc lịch sử tin nhắn:', e.message);
          }
        }

        // Tạo câu trả lời thông minh từ Gemini + RAG
        const aiResult = await zaloAiService.processCustomerMessage({
          message: text,
          conversationHistory,
          leadContext: { zalo_uid: senderId }
        });

        const replyText = aiResult?.reply || 'Dạ em chào Anh/Chị, FIT TOUR hân hạnh được hỗ trợ tư vấn tour cho mình ạ!';

        await sendZaloCsMessageWithAutoRefresh(senderId, replyText);

        // Lưu tin nhắn Bot gửi vào Sandbox
        const customerProfile = await getZaloProfile(senderId);
        saveMessage({
          id: Date.now().toString(),
          senderId: senderId,
          senderName: customerProfile?.name || profile?.name,
          senderAvatar: customerProfile?.avatar || profile?.avatar,
          recipientId: senderId,
          text: replyText,
          type: 'outgoing',
          senderType: 'ai',
          senderStaffName: 'AI Agent'
        });

        console.log('✅ Auto-Reply Gemini AI thành công:', replyText);
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
    const { recipientId, text, attachmentUrl, attachmentType, attachmentName } = req.body;
    if (!recipientId || (!text && !attachmentUrl)) {
      return res.status(400).json({ error: 'Missing recipientId, text, or attachment' });
    }
    
    try {
      if (!fs.existsSync(TOKEN_FILE_PATH)) {
        return res.status(400).json({ error: 'Chưa có token. Vui lòng gọi GET /api/zalo-v2/auth/login trước.' });
      }
      let tokens = JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
      
      const attemptSend = async (isRetry = false) => {
        let payload = {
          recipient: { user_id: recipientId },
          message: {}
        };

        if (text) {
          payload.message.text = text;
        }

        // Handle Attachment
        if (attachmentUrl) {
          if (attachmentType === 'image') {
            payload.message.attachment = {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [{
                  media_type: 'image',
                  url: process.env.BASE_URL ? `${process.env.BASE_URL}${attachmentUrl}` : `https://erp.fittour.vn${attachmentUrl}`
                }]
              }
            };
          } else if (attachmentType === 'file') {
            // Upload file to Zalo OA to get file_token
            const FormData = require('form-data');
            const filePath = path.join(__dirname, '../public', attachmentUrl);
            
            if (!fs.existsSync(filePath)) {
               throw new Error('Không tìm thấy file trên server CRM tại đường dẫn: ' + filePath);
            }

            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const uploadRes = await axios.post('https://openapi.zalo.me/v2.0/oa/upload/file', formData, {
              headers: {
                ...formData.getHeaders(),
                'access_token': tokens.access_token
              }
            });

            if (uploadRes.data?.error === -216 && !isRetry) {
              return { needsRefresh: true };
            }

            if (uploadRes.data?.error !== undefined && uploadRes.data?.error !== 0) {
               throw new Error(`Lỗi upload file lên Zalo: ${JSON.stringify(uploadRes.data)}`);
            }

            const fileToken = uploadRes.data?.data?.token;
            if (!fileToken) {
               throw new Error('Không lấy được token file từ Zalo');
            }

            payload.message.attachment = {
              type: 'file',
              payload: { token: fileToken }
            };
          }
        }

        const response = await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', 
          payload,
          {
            headers: {
              'access_token': tokens.access_token,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.error === -216 && !isRetry) {
          return { needsRefresh: true };
        }

        if (response.data && response.data.error !== undefined && response.data.error !== 0) {
          throw new Error(`Zalo API Error (${response.data.error}): ${response.data.message}`);
        }
        
        return { success: true, realMsgId: response.data?.data?.message_id || Date.now().toString() };
      };

      let result = await attemptSend(false);
      
      if (result.needsRefresh) {
        console.log('Token Zalo hết hạn, đang auto-refresh...');
        const newTokens = await refreshZaloToken(tokens.refresh_token);
        if (!newTokens) {
           throw new Error('Không thể auto-refresh token Zalo. Vui lòng đăng nhập lại qua /api/zalo-v2/auth/login');
        }
        tokens = newTokens;
        result = await attemptSend(true);
      }
      
      const realMsgId = result.realMsgId;
      
      // Auto-Mute AI khi nhân viên gửi tin nhắn trực tiếp
      await setAiSession(recipientId, false, 'human_message', `Nhân viên gửi tin: ${(text || 'File đính kèm').substring(0, 40)}`);

      // Save to sandbox
      const profile = await getZaloProfile(recipientId);
      saveMessage({
        id: realMsgId,
        senderId: recipientId, // For grouping in UI
        senderName: profile?.name,
        senderAvatar: profile?.avatar,
        text: text || '',
        type: 'outgoing',
        senderType: 'human',
        senderStaffName: req.user?.full_name || req.user?.username || 'Tư vấn viên',
        attachments: attachmentUrl ? [{
          type: attachmentType,
          url: attachmentUrl,
          name: attachmentName || 'File đính kèm'
        }] : null
      });
      
      res.json({ success: true, ai_muted: true });
    } catch (error) {
      console.error('❌ Lỗi Reply Sandbox:', error.response?.data || error.message);
      res.status(500).json({ error: 'Lỗi khi gửi tin', details: error.response?.data || error.message });
    }
  },
  
  deleteSandboxMessages: (req, res) => {
    try {
      const { uid } = req.params;
      if (!fs.existsSync(SANDBOX_FILE_PATH)) {
        return res.json({ success: true });
      }
      const messages = JSON.parse(fs.readFileSync(SANDBOX_FILE_PATH, 'utf8'));
      const filteredMessages = messages.filter(m => m.senderId !== uid);
      fs.writeFileSync(SANDBOX_FILE_PATH, JSON.stringify(filteredMessages, null, 2));
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Lỗi Xóa Sandbox:', error);
      res.status(500).json({ error: 'Lỗi khi xóa tin nhắn', details: error.message });
    }
  },

  // --- AI AGENT SESSION & TAKEOVER CONTROLLER ---
  getAiSessionStatus: async (req, res) => {
    try {
      const { zaloUid } = req.params;
      const session = await getAiSession(zaloUid);
      res.json({ success: true, data: session });
    } catch (error) {
      console.error('❌ Lỗi getAiSessionStatus:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  toggleAiSession: async (req, res) => {
    try {
      const { zaloUid, isAiActive, mutedBy } = req.body;
      if (!zaloUid) {
        return res.status(400).json({ success: false, error: 'Thiếu zaloUid' });
      }
      const current = await getAiSession(zaloUid);
      const nextState = isAiActive !== undefined ? !!isAiActive : !current.is_ai_active;
      const reason = mutedBy || (nextState ? 'manual_enable' : 'manual_toggle');
      await setAiSession(zaloUid, nextState, reason, nextState ? 'Nhân viên bật lại AI' : 'Nhân viên tắt AI thủ công');
      res.json({ success: true, is_ai_active: nextState, muted_by: reason });
    } catch (error) {
      console.error('❌ Lỗi toggleAiSession:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // --- ZNS DEMO MODULE ---
  sendZnsDemo: async (req, res) => {
    try {
      const { phone, templateType } = req.body;
      if (!phone || !templateType) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin số điện thoại hoặc loại mẫu.' });
      }

      const templateId = templateType === 'REQUEST_PAYMENT' ? "REQUEST_PAYMENT_TEMPLATE_ID" : "CONFIRM_PAYMENT_TEMPLATE_ID";
      
      const templateData = {
        customer_name: "Khách hàng Demo",
        booking_code: "DEMO_FIT_" + Math.floor(Math.random() * 10000),
        amount: templateType === 'REQUEST_PAYMENT' ? "5000000" : undefined,
        receipt_url: "https://erp.fittour.vn/receipt/demo-uuid-1234"
      };

      const response = await zaloZnsService.sendZnsMessage(phone, templateId, templateData);
      res.json({ success: true, message: 'Đã gửi Demo ZNS thành công!', data: response });
    } catch (error) {
      console.error('❌ Lỗi sendZnsDemo:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = zaloV2Controller;
