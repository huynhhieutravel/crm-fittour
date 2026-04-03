const axios = require('axios');
const db = require('../db');
const metaCapi = require('./metaCapiService');

const PAGE_ACCESS_TOKEN_ENV = process.env.FB_PAGE_TOKEN;

const getSetting = async (key) => {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
};

exports.handleMessage = async (sender_psid, received_message, isStandby = false) => {
    let response;

    if (received_message.text) {
        console.log(`Received ${isStandby ? 'standby' : 'primary'} message from ${sender_psid}: ${received_message.text}`);
        
        // 1. Kiểm tra xem hội thoại đã tồn tại chưa
        let convResult = await db.query('SELECT * FROM conversations WHERE external_id = $1', [sender_psid]);
        let conversationId;
        let leadId;

        if (convResult.rows.length === 0) {
            // 2. Lấy thông tin profile từ Facebook (nếu có thể)
            let senderName = `Messenger Guest ${sender_psid.substring(0, 5)}`;
            try {
                const { token } = await getPageToken();
                if (token) {
                    const profileRes = await axios.get(`https://graph.facebook.com/v25.0/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${token}`);
                    if (profileRes.data && (profileRes.data.first_name || profileRes.data.last_name)) {
                        senderName = `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim();
                    }
                }
            } catch (err) {
                console.error('Error fetching messenger profile:', err.response ? err.response.data : err.message);
            }

            // 3. Nếu chưa có, tạo Lead mới (với facebook_psid, last_contacted_at và dò lại Khách VIP)
            const leadResult = await db.query(
                'INSERT INTO leads (name, source, status, facebook_psid, last_contacted_at, customer_id) VALUES ($1, $2, $3, $4, NOW(), (SELECT id FROM customers WHERE facebook_psid = $5 LIMIT 1)) RETURNING *',
                [senderName, 'Messenger', 'Mới', sender_psid, sender_psid]
            );
            leadId = leadResult.rows[0].id;

            // Fire CAPI Lead event (async, non-blocking)
            metaCapi.sendLeadEvent(leadResult.rows[0]).catch(err => 
                console.error('[CAPI] Error sending Lead event:', err.message)
            );

            // 3. Tạo Hội thoại mới
            const newConv = await db.query(
                'INSERT INTO conversations (source, external_id, lead_id, last_message) VALUES ($1, $2, $3, $4) RETURNING id',
                ['messenger', sender_psid, leadId, received_message.text]
            );
            conversationId = newConv.rows[0].id;
        } else {
            conversationId = convResult.rows[0].id;
            let currentLeadId = convResult.rows[0].lead_id;

            // Kiểm tra trạng thái Lead hiện tại của cuộc hội thoại
            const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [currentLeadId]);
            if (leadRes.rows.length > 0) {
                const oldLead = leadRes.rows[0];

                // NẾU LUỒNG CŨ ĐÃ ĐÓNG (Chốt đơn/Thất bại) -> TẠO DEAL MỚI
                // (Bỏ logic 30 ngày — nếu khách cũ nhắn lại mà lead vẫn active thì chỉ cập nhật)
                if (['Chốt đơn', 'Thất bại'].includes(oldLead.status)) {
                    console.log(`[WEBHOOK] Khách quen nhắn lại (Lead đã đóng): ${oldLead.name}. Đang tạo Lead mới...`);
                    const newLeadResult = await db.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, last_contacted_at, customer_id, phone, email) VALUES ($1, $2, $3, $4, NOW(), (SELECT id FROM customers WHERE facebook_psid = $4 LIMIT 1), $5, $6) RETURNING *',
                        [oldLead.name, 'Messenger', 'Mới', sender_psid, oldLead.phone, oldLead.email]
                    );
                    leadId = newLeadResult.rows[0].id;
                    
                    // Nối hội thoại cũ sang Lead mới tinh này
                    await db.query('UPDATE conversations SET lead_id = $1, last_message = $2, updated_at = NOW() WHERE id = $3', [leadId, received_message.text, conversationId]);

                    metaCapi.sendLeadEvent(newLeadResult.rows[0]).catch(err => console.error(err));
                } else {
                    // LUỒNG VẪN ĐANG ACTIVE -> Chỉ cập nhật ngày tháng
                    leadId = currentLeadId;
                    await db.query('UPDATE leads SET created_at = NOW(), last_contacted_at = NOW() WHERE id = $1', [leadId]);
                    await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [received_message.text, conversationId]);
                }
            } else {
                await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [received_message.text, conversationId]);
            }
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

    // Gửi phản hồi qua Graph API (only if not standby)
    if (!isStandby && response) {
        await exports.callSendAPI(sender_psid, response);
    } else if (isStandby) {
        console.log('[FB] Standby event: Not sending auto-reply (another app has thread control).');
    }
};

exports.handlePostback = async (sender_psid, received_postback) => {
    let response;
    let payload = received_postback.payload;

    if (payload === 'GET_STARTED') {
        response = { "text": "Chào mừng bạn đến với FIT Tour! Bạn đang quan tâm đến tour du lịch nào?" };
    }

    await exports.callSendAPI(sender_psid, response);
};

// Cache for resolved page token (avoid calling /me/accounts every time)
let _cachedPageToken = null;
let _cachedPageId = null;
let _cacheTime = 0;
const CACHE_TTL = 3600000; // 1 hour

const getPageToken = async () => {
    // Return cached if fresh
    if (_cachedPageToken && (Date.now() - _cacheTime) < CACHE_TTL) {
        return { token: _cachedPageToken, pageId: _cachedPageId };
    }

    const dbToken = await getSetting('meta_page_access_token');
    const token = dbToken || PAGE_ACCESS_TOKEN_ENV;
    if (!token || token.includes('your_page_access_token_here')) {
        return { token: null, pageId: null };
    }

    // Try to resolve page token from System User token
    try {
        const accountsRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
        if (accountsRes.data?.data?.length > 0) {
            const page = accountsRes.data.data[0]; // Use first page
            _cachedPageToken = page.access_token;
            _cachedPageId = page.id;
            _cacheTime = Date.now();
            console.log(`[FB] Resolved Page Token for: ${page.name} (${page.id})`);
            return { token: _cachedPageToken, pageId: _cachedPageId };
        }
    } catch (err) {
        // Not a System User token or /me/accounts not available - use token directly
        console.log('[FB] Could not resolve page accounts, using token directly');
    }

    // Fallback: use token as-is (regular Page Token)
    return { token, pageId: null };
};

exports.callSendAPI = async (sender_psid, response) => {
    try {
        const { token, pageId } = await getPageToken();
        
        if (!token) {
            console.error('[FB] Page Access Token is not configured');
            return;
        }

        // Use /{page_id}/messages if we have page_id, otherwise fallback to /me/messages
        const endpoint = pageId 
            ? `https://graph.facebook.com/v25.0/${pageId}/messages?access_token=${token}`
            : `https://graph.facebook.com/v25.0/me/messages?access_token=${token}`;

        await axios.post(endpoint, {
            recipient: { id: sender_psid },
            message: response
        });
        console.log('[FB] ✅ Message sent successfully!');
    } catch (error) {
        console.error('[FB] ❌ Unable to send message:', error.response ? error.response.data : error.message);
    }
};

exports.getSubscribedApps = async (customToken) => {
    try {
        const dbToken = await getSetting('meta_page_access_token');
        const token = customToken || dbToken || PAGE_ACCESS_TOKEN_ENV;
        if (!token || token.includes('your_page_access_token_here')) throw new Error('No Page Access Token provided');
        
        try {
            // 1. Thử gọi trực tiếp (Dành cho Page Token)
            console.log('Attempting direct subscribed_apps call...');
            const response = await axios.get(`https://graph.facebook.com/v25.0/me/subscribed_apps?access_token=${token}`);
            return response.data;
        } catch (pageError) {
            // 2. Nếu lỗi (có thể là User Token), thử lấy danh sách Page
            const isUserTokenError = pageError.response && pageError.response.data && pageError.response.data.error.code === 100;
            
            if (isUserTokenError) {
                console.log('Detected User Token, trying to fetch Page Accounts...');
                try {
                    const accountsRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
                    const pages = accountsRes.data.data;
                    console.log(`Found ${pages ? pages.length : 0} pages associated with this token.`);
                    
                    if (pages && pages.length > 0) {
                        let successPages = [];
                        for (const page of pages) {
                            try {
                                console.log(`Attempting MEGA POST Activation for Page: ${page.name} (${page.id})`);
                                const pageToken = page.access_token;
                                
                                // 1. Quyền pages_manage_metadata (BẮT BUỘC PHẢI DÙNG POST ĐỂ ĐĂNG KÝ)
                                const subRes = await axios.post(`https://graph.facebook.com/v25.0/me/subscribed_apps?access_token=${pageToken}`, {
                                    subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_deliveries']
                                });
                                console.log(`- Subscribed Apps POST: SUCCESS (${JSON.stringify(subRes.data)})`);
                                
                                // 2. Quyền pages_read_engagement & public_profile
                                const meRes = await axios.get(`https://graph.facebook.com/v25.0/me?fields=id,name,category,about,description,location,new_like_count,fan_count&access_token=${pageToken}`);
                                console.log(`- Page Info GET: SUCCESS (${meRes.data.name})`);
                                
                                // 3. Quyền pages_messaging & pages_utility_messaging
                                const convRes = await axios.get(`https://graph.facebook.com/v25.0/me/conversations?access_token=${pageToken}`);
                                console.log(`- Conversations GET: SUCCESS (Found ${convRes.data.data ? convRes.data.data.length : 0} threads)`);
                                
                                if (convRes.data.data && convRes.data.data.length > 0) {
                                    const firstThread = convRes.data.data[0];
                                    // Lấy PSID từ thread
                                    const threadDetail = await axios.get(`https://graph.facebook.com/v25.0/${firstThread.id}?fields=participants&access_token=${pageToken}`);
                                    const psid = threadDetail.data.participants.data[0].id;
                                    
                                    console.log(`- Found Real PSID: ${psid}. Sending Test Message...`);
                                    await axios.post(`https://graph.facebook.com/v25.0/me/messages?access_token=${pageToken}`, {
                                        recipient: { id: psid },
                                        message: { text: "Meta Review Test: FIT Tour CRM messaging integration is working perfectly." }
                                    });
                                    console.log(`- Test Message POST: SUCCESS`);
                                }
                                
                                successPages.push(page.name);
                            } catch (err) {
                                console.error(`Failed for page ${page.name}:`, err.message);
                            }
                        }
                        
                        if (successPages.length > 0) {
                            return { 
                                success: true, 
                                note: `Đã kích hoạt thành công cho các trang: ${successPages.join(', ')}`,
                                pages: successPages
                            };
                        }
                    } else {
                        return {
                            success: false,
                            error_type: 'NO_PAGES',
                            message: 'Không tìm thấy Trang nào. Vui lòng chọn "FIT Tour" khi lấy Token trên Meta.'
                        };
                    }
                } catch (accountError) {
                    console.error('Error fetching accounts:', accountError.response ? accountError.response.data : accountError.message);
                }
                
                // Fallback cuối cùng
                const resMe = await axios.get(`https://graph.facebook.com/v25.0/me?fields=id,name&access_token=${token}`);
                return { ...resMe.data, note: 'Kích hoạt Profile cá nhân thành công' };
            }
            throw pageError;
        }
    } catch (error) {
        console.error('Meta API connection test failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

exports.handleLeadAd = async (leadgen_id, page_id) => {
    try {
        const dbToken = await getSetting('meta_page_access_token');
        const token = dbToken || PAGE_ACCESS_TOKEN_ENV;
        if (!token) {
            console.error('FB_PAGE_TOKEN is not configured for Lead Ads');
            return;
        }

        // Fetch lead details from Meta Graph API
        const response = await axios.get(`https://graph.facebook.com/v25.0/${leadgen_id}?access_token=${token}`);
        const leadData = response.data;
        
        console.log('Received Lead Ad Data:', JSON.stringify(leadData));

        // Parse field_data
        let name = 'Lead từ Quảng Cáo';
        let phone = null;
        let email = null;
        
        if (leadData.field_data) {
            leadData.field_data.forEach(field => {
                if (field.name === 'full_name' && field.values.length > 0) name = field.values[0];
                if (field.name === 'phone_number' && field.values.length > 0) phone = field.values[0];
                if (field.name === 'email' && field.values.length > 0) email = field.values[0];
            });
        }

        // Check if lead already exists based on meta_lead_id
        const existingLead = await db.query('SELECT * FROM leads WHERE meta_lead_id = $1', [leadgen_id]);
        if (existingLead.rows.length === 0) {
            const leadResult = await db.query(
                'INSERT INTO leads (name, phone, email, source, status, meta_lead_id, last_contacted_at, customer_id) VALUES ($1, $2, $3, $4, $5, $6, NOW(), (SELECT id FROM customers WHERE phone = $2 AND $2 IS NOT NULL AND $2 != \'\' LIMIT 1)) RETURNING *',
                [name, phone, email, 'Khác', 'Mới', leadgen_id]
            );
            
            // Log interaction
            await db.query(`INSERT INTO lead_notes (lead_id, content, created_by) VALUES ($1, $2, $3)`, [
                leadResult.rows[0].id,
                `Khách hàng điền form Quảng cáo Facebook (Form ID: ${leadData.form_id || 'N/A'}, Page ID: ${page_id})`,
                null
            ]);

            // Track CAPI (Mới -> Lead)
            metaCapi.sendLeadEvent(leadResult.rows[0]).catch(err => 
                console.error('[CAPI] Error sending Lead Ad event:', err.message)
            );
        }
    } catch (error) {
        console.error('Error handling lead ad webhook:', error.response ? error.response.data : error.message);
    }
};

// --- ALTERNATIVE POLLING SYSTEM (MESSENGER SYNC) ---
// Bypasses Meta Webhooks blockages when Business AI holds the thread
exports.syncRecentConversations = async () => {
    try {
        const { token, pageId } = await getPageToken();
        if (!token || !pageId) return;

        // Kéo 5 cuộc trò chuyện gần nhất để tìm khách hàng mới kèm 5 tin nhắn cực gần đễ trích xuất ghi chú
        const endpoint = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=participants{id,name},messages.limit(5){message,from}&limit=5&access_token=${token}`;
        const res = await axios.get(endpoint);
        
        if (!res.data || !res.data.data) return;

        for (const conv of res.data.data) {
            try {
                const participants = conv.participants?.data || [];
                // Tìm user (loại trừ Page hiện tại)
                const user = participants.find(p => p.id !== pageId);
                if (!user) continue;

                const psid = user.id;
                const userName = user.name || 'Khách hàng Messenger';

                // Trích xuất tin nhắn do chính User gửi để phòng hờ chặn Webhook
                const messagesList = conv.messages?.data || [];
                const userMsgObj = messagesList.find(m => m.from && m.from.id === psid);
                const rawMsgText = userMsgObj && userMsgObj.message ? userMsgObj.message : null;
                const actualMessageText = (rawMsgText && rawMsgText.trim() !== '') ? rawMsgText : '(Hình ảnh/Đính kèm)';
                const firstMessageNote = userMsgObj ? `Facebook Message: "${actualMessageText}"` : null;

                // Kéo hội thoại từ DB xem đã có chưa
                const convRes = await db.query('SELECT * FROM conversations WHERE external_id = $1', [psid]);
                
                if (convRes.rows.length === 0) {
                    console.log(`[FB POLLER] Phát hiện khách mới chat với Fanpage: ${userName}. Đang tạo Lead...`);
                    // Tạo Lead mới tinh (Kèm kiểm tra PSID dò Khách Quen)
                    const leadResult = await db.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, consultation_note, last_contacted_at, customer_id) VALUES ($1, $2, $3, $4, $5, NOW(), (SELECT id FROM customers WHERE facebook_psid = $6 LIMIT 1)) RETURNING *',
                        [userName, 'Messenger', 'Mới', psid, firstMessageNote, psid]
                    );

                    // --- LUÔN tạo Conversation để tránh tạo Lead trùng lặp mỗi lần poll ---
                    const messageForConv = actualMessageText || '(Khách mới nhắn tin)';
                    const newConv = await db.query(
                        'INSERT INTO conversations (source, external_id, lead_id, last_message) VALUES ($1, $2, $3, $4) RETURNING id',
                        ['messenger', psid, leadResult.rows[0].id, messageForConv]
                    );
                    const conversationId = newConv.rows[0].id;
                    if (userMsgObj) {
                        await db.query(
                            'INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)',
                            [conversationId, 'customer', actualMessageText]
                        );
                    }

                    // Kích hoạt CAPI
                    metaCapi.sendLeadEvent(leadResult.rows[0]).catch(err => 
                        console.error('[CAPI] Lỗi khi gửi sự kiện Lead từ Poller:', err.message)
                    );
                } else {
                    // ĐÃ CÓ CONVERSATION
                    const oldConv = convRes.rows[0];
                    
                    // Cờ kiểm tra: Nếu user Msg cuối cùng không khớp Last message (tức là webhook bị nghẽn chưa catch)
                    if (userMsgObj && actualMessageText !== oldConv.last_message) {
                        
                        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [oldConv.lead_id]);
                        if (leadRes.rows.length > 0) {
                            const oldLead = leadRes.rows[0];

                            // Chỉ tạo Lead mới nếu Lead cũ ĐÃ ĐÓNG (Chốt đơn / Thất bại)
                            if (['Chốt đơn', 'Thất bại'].includes(oldLead.status)) {
                                console.log(`[FB POLLER] Phát hiện KHÁCH QUEN CŨ (Lead đã đóng) nhắn Fanpage: ${userName}. Tạo Lead mới...`);
                                const newLeadResult = await db.query(
                                    'INSERT INTO leads (name, source, status, facebook_psid, last_contacted_at, customer_id, phone, email) VALUES ($1, $2, $3, $4, NOW(), (SELECT id FROM customers WHERE facebook_psid = $4 LIMIT 1), $5, $6) RETURNING *',
                                    [userName, 'Messenger', 'Mới', psid, oldLead.phone, oldLead.email]
                                );
                                
                                const safeMsg1 = actualMessageText || '(Hình ảnh/Đính kèm)';
                                await db.query('UPDATE conversations SET lead_id = $1, last_message = $2, updated_at = NOW() WHERE id = $3', [newLeadResult.rows[0].id, safeMsg1, oldConv.id]);
                                await db.query('INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)', [oldConv.id, 'customer', safeMsg1]);

                                metaCapi.sendLeadEvent(newLeadResult.rows[0]).catch(err => console.error(err));
                            } else {
                                // Lead vẫn Active => Nổi lên đầu mảng
                                const safeMsg2 = actualMessageText || '(Hình ảnh/Đính kèm)';
                                await db.query('UPDATE leads SET created_at = NOW(), last_contacted_at = NOW() WHERE id = $1', [oldLead.id]);
                                await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [safeMsg2, oldConv.id]);
                                await db.query('INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)', [oldConv.id, 'customer', safeMsg2]);
                            }
                        } else {
                            // Kẹt lead, update bình thường
                            const safeMsg3 = actualMessageText || '(Hình ảnh/Đính kèm)';
                            await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [safeMsg3, oldConv.id]);
                            await db.query('INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)', [oldConv.id, 'customer', safeMsg3]);
                        }
                    }
                }
            } catch (innerError) {
                console.error('[FB POLLER] Lỗi đồng bộ cho hội thoại lẻ, bỏ qua để chạy tiếp:', innerError.message);
            }
        }
    } catch (error) {
        console.error('[FB POLLER] Lỗi tổng lấy dữ liệu Facebook API:', error.message);
    }
};

let pollerInterval;
exports.startPolling = () => {
    if (pollerInterval) clearInterval(pollerInterval);
    // Quét mỗi 60 giây (1 phút) => Rất nhẹ, không đáng kể
    pollerInterval = setInterval(exports.syncRecentConversations, 60 * 1000);
    // Chạy thử ngay lần đầu tiên thiết lập
    setTimeout(exports.syncRecentConversations, 5000);
    console.log('[FB POLLER] Hệ thống tự động quét Lead Facebook đã khởi động (Chống kẹt Webhook).');
};
