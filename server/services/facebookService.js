const axios = require('axios');
const db = require('../db');
const metaCapi = require('./metaCapiService');

const PAGE_ACCESS_TOKEN_ENV = process.env.FB_PAGE_TOKEN;

const getSetting = async (key) => {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
};

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

// Lọc tin chào mừng tự động khi khách comment bài viết (chỉ bỏ template greeting)
// Pattern: "FIT xin chào chị [TÊN] ạ, team FIT sẽ gửi..." + "để lại SDT"
const isAutoGreeting = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return lower.includes('fit xin chào') && lower.includes('team fit') && lower.includes('lịch trình');
};

// Auto-classify BU from message keywords
// v5: Smart Diacritic-Aware Matching
// - Pass 1: So keyword GỐC (có dấu) với tin nhắn GỐC → phân biệt "nhật" vs "nhất"
// - Pass 2: So keyword bỏ dấu, nhưng CHỈ chấp nhận nếu từ gốc KHÔNG có dấu (khách gõ không dấu)
const classifyBUFromMessage = async (messageText) => {
    if (!messageText || messageText.trim().length < 2) return null;
    
    // Normalize: lowercase + remove diacritics
    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
    // Check if a string contains Vietnamese diacritics
    const hasDiacritics = (str) => str.toLowerCase() !== normalize(str);
    
    const normalizedMsg = normalize(messageText);
    const msgLower = messageText.toLowerCase();
    
    // Stopwords: CHỈ chặn những từ quá ngắn / 1 ký tự gây false positive tuyệt đối
    // "nhat" KHÔNG còn ở đây → đã được xử lý bởi smart matching (nhật ≠ nhất)
    const STOPWORDS = new Set([
        'y',      // ý → y (1 ký tự, trùng tên người VD: "Ý Đặng Quốc")
        'cho',    // cho
        'ay',     // ấy
        'an',     // ăn/an
    ]);
    
    try {
        const busResult = await db.query(
            "SELECT id, label, countries, keywords FROM business_units WHERE is_active = true ORDER BY sort_order ASC"
        );
        
        for (const bu of busResult.rows) {
            const allKeywords = [
                ...(bu.countries || []),
                ...(bu.keywords || [])
            ];
            
            for (const keyword of allKeywords) {
                if (!keyword || keyword.trim().length < 1) continue;
                const normalizedKw = normalize(keyword);
                if (normalizedKw.length < 1) continue;
                
                // Skip absolute stopwords (quá ngắn, không thể phân biệt)
                if (normalizedKw.length <= 4 && STOPWORDS.has(normalizedKw)) continue;
                
                // === PASS 1: So keyword GỐC với tin nhắn GỐC (có dấu) ===
                // "nhật" chỉ match "nhật", KHÔNG match "nhất"
                const kwLower = keyword.toLowerCase().trim();
                const escapedOrig = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Unicode-aware word boundary: ký tự không phải chữ cái bao quanh
                const regexOriginal = new RegExp('(?:^|[^\\p{L}\\p{N}])' + escapedOrig + '(?:$|[^\\p{L}\\p{N}])', 'iu');
                
                if (regexOriginal.test(' ' + msgLower + ' ')) {
                    console.log('[BU-AUTO] ✅ Pass1 (dấu chính xác) "' + keyword + '" -> ' + bu.id + ' | msg: "' + messageText.substring(0, 60) + '"');
                    return bu.id;
                }
                
                // === PASS 2: So keyword BỎ DẤU, nhưng CHỈ chấp nhận nếu từ gốc KHÔNG CÓ DẤU ===
                // "nhat" match "nhat" (khách gõ ko dấu) ✅
                // "nhat" KHÔNG match "nhất" (vì "nhất" có dấu → khác từ) ❌
                const escapedNorm = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexNorm = new RegExp('\\b' + escapedNorm + '\\b', 'i');
                
                if (regexNorm.test(normalizedMsg)) {
                    // Tìm thấy trong bản bỏ dấu → kiểm tra bản gốc có dấu hay không
                    const origWords = msgLower.split(/\s+/).map(w => w.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0110\u0111]/g, ''));
                    const kwWordCount = kwLower.split(/\s+/).length;
                    
                    let foundNoDiacritics = false;
                    for (let i = 0; i <= origWords.length - kwWordCount; i++) {
                        const segment = origWords.slice(i, i + kwWordCount).join(' ');
                        // Từ gốc bỏ dấu = keyword bỏ dấu VÀ từ gốc KHÔNG có dấu → khách gõ không dấu
                        if (normalize(segment) === normalizedKw && !hasDiacritics(segment)) {
                            foundNoDiacritics = true;
                            break;
                        }
                    }
                    
                    if (foundNoDiacritics) {
                        console.log('[BU-AUTO] ✅ Pass2 (ko dấu) "' + keyword + '" -> ' + bu.id + ' | msg: "' + messageText.substring(0, 60) + '"');
                        return bu.id;
                    } else {
                        console.log('[BU-AUTO] ⛔ Skip "' + keyword + '" - bản gốc có dấu nhưng khác từ | msg: "' + messageText.substring(0, 60) + '"');
                    }
                }
            }
        }
        
        console.log('[BU-AUTO] Khong match BU cho tin nhan: "' + messageText.substring(0, 80) + '"');
        return null;
    } catch (err) {
        console.error('[BU-AUTO] Loi classifyBU:', err.message);
        return null;
    }
};

const classifyTourFromMessage = async (messageText) => {
    if (!messageText || messageText.trim().length < 2) return null;
    
    // Normalize: lowercase + remove diacritics
    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');
    
    const normalizedMsg = normalize(messageText);
    const msgLower = messageText.toLowerCase();
    
    try {
        const toursResult = await db.query(
            "SELECT id, keywords, bu_group FROM tour_templates WHERE is_active = true AND keywords IS NOT NULL AND keywords != ''"
        );
        
        for (const tour of toursResult.rows) {
            const keywordsStr = tour.keywords || '';
            const keywordsList = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
            
            for (const keyword of keywordsList) {
                const normalizedKw = normalize(keyword);
                if (normalizedKw.length < 2) continue; // skip very short keywords to be safe
                
                // 1. Exact match (with diacritics)
                const kwLower = keyword.toLowerCase();
                const escapedOrig = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexOriginal = new RegExp('(?:^|[^\\p{L}\\p{N}])' + escapedOrig + '(?:$|[^\\p{L}\\p{N}])', 'iu');
                
                if (regexOriginal.test(' ' + msgLower + ' ')) {
                    console.log('[TOUR-AUTO] ✅ Strict Match (dấu) "' + keyword + '" -> Tour ' + tour.id + ' | msg: "' + messageText.substring(0, 60) + '"');
                    return { tour_id: tour.id, bu_group: tour.bu_group };
                }
                
                // 2. Exact match (without diacritics - ONLY if the original message text was typed without diacritics for that word)
                const escapedNorm = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexNorm = new RegExp('\\b' + escapedNorm + '\\b', 'i');
                
                if (regexNorm.test(normalizedMsg)) {
                    // Cần đảm bảo khách thực sự gõ không dấu, chứ không phải gõ chữ có dấu khác nhưng khi bỏ dấu thì lại giống keyword
                    const origWords = msgLower.split(/\s+/).map(w => w.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\u0110\u0111]/g, ''));
                    const kwWordCount = kwLower.split(/\s+/).length;
                    
                    const hasDiacritics = (str) => str.toLowerCase() !== normalize(str);
                    
                    let foundNoDiacritics = false;
                    for (let i = 0; i <= origWords.length - kwWordCount; i++) {
                        const segment = origWords.slice(i, i + kwWordCount).join(' ');
                        if (normalize(segment) === normalizedKw && !hasDiacritics(segment)) {
                            foundNoDiacritics = true;
                            break;
                        }
                    }
                    
                    if (foundNoDiacritics) {
                        console.log('[TOUR-AUTO] ✅ Strict Match (ko dấu) "' + keyword + '" -> Tour ' + tour.id + ' | msg: "' + messageText.substring(0, 60) + '"');
                        return { tour_id: tour.id, bu_group: tour.bu_group };
                    }
                }
            }
        }
        
        return null; // Không tìm thấy tour nào hợp lệ
    } catch (err) {
        console.error('[TOUR-AUTO] Loi classifyTour:', err.message);
        return null;
    }
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

            // Auto-classify BU from first message
            const autoBU = await classifyBUFromMessage(received_message.text);
            if (autoBU) {
                await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU, leadId]);
                console.log(`[BU-AUTO] Lead #${leadId} (${senderName}) → Auto BU: ${autoBU}`);
            }

            // Auto-classify Tour from first message
            const autoTour = await classifyTourFromMessage(received_message.text);
            if (autoTour && autoTour.tour_id) {
                const q = autoBU ? 
                    'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                    'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                const params = autoBU ? 
                    [autoTour.tour_id, leadId] : 
                    [autoTour.tour_id, autoTour.bu_group, leadId];
                await db.query(q, params);
                console.log(`[TOUR-AUTO] Lead #${leadId} (${senderName}) → Auto Tour: ${autoTour.tour_id}`);
            }

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

                let isExpired = false;
                if (oldLead.last_contacted_at) {
                    const daysSinceLastContact = (new Date() - new Date(oldLead.last_contacted_at)) / (1000 * 60 * 60 * 24);
                    if (daysSinceLastContact > 30) isExpired = true;
                } else if (oldLead.created_at) {
                    const daysSinceCreated = (new Date() - new Date(oldLead.created_at)) / (1000 * 60 * 60 * 24);
                    if (daysSinceCreated > 30) isExpired = true;
                }

                // NẾU LUỒNG CŨ ĐÃ ĐÓNG (Chốt đơn/Thất bại) HOẶC QUÁ HẠN 30 NGÀY -> TẠO DEAL MỚI
                if (['Chốt đơn', 'Thất bại'].includes(oldLead.status) || isExpired) {
                    console.log(`[WEBHOOK] Khách quen nhắn lại (Lead đã đóng hoặc quá 30 ngày): ${oldLead.name}. Đang tạo Lead mới...`);
                    const newLeadResult = await db.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, last_contacted_at, customer_id, phone, email) VALUES ($1, $2, $3, $4, NOW(), (SELECT id FROM customers WHERE facebook_psid = $4 LIMIT 1), $5, $6) RETURNING *',
                        [oldLead.name, 'Messenger', 'Mới', sender_psid, oldLead.phone, oldLead.email]
                    );
                    leadId = newLeadResult.rows[0].id;

                    // Auto-classify BU for re-opened lead
                    const autoBU2 = await classifyBUFromMessage(received_message.text);
                    if (autoBU2) {
                        await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU2, leadId]);
                    }

                    // Auto-classify Tour for re-opened lead
                    const autoTour2 = await classifyTourFromMessage(received_message.text);
                    if (autoTour2 && autoTour2.tour_id) {
                        const q2 = autoBU2 ? 
                            'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                            'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                        const params2 = autoBU2 ? 
                            [autoTour2.tour_id, leadId] : 
                            [autoTour2.tour_id, autoTour2.bu_group, leadId];
                        await db.query(q2, params2);
                        console.log(`[TOUR-AUTO] Lead #${leadId} (${oldLead.name}) → Auto Tour: ${autoTour2.tour_id} (Re-opened)`);
                    }
                    
                    // Nối hội thoại cũ sang Lead mới tinh này
                    await db.query('UPDATE conversations SET lead_id = $1, last_message = $2, updated_at = NOW() WHERE id = $3', [leadId, received_message.text, conversationId]);

                    metaCapi.sendLeadEvent(newLeadResult.rows[0]).catch(err => console.error(err));
                } else {
                    // LUỒNG VẪN ĐANG ACTIVE → Chỉ cập nhật ngày tháng
                    leadId = currentLeadId;
                    await db.query('UPDATE leads SET last_contacted_at = NOW() WHERE id = $1', [leadId]);
                    await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [received_message.text, conversationId]);

                    // [BU-AUTO] Nếu lead chưa có BU → classify từ TẤT CẢ tin nhắn (lọc greeting template)
                    if (!oldLead.bu_group) {
                        const allMsgsResult = await db.query(
                            'SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
                            [conversationId]
                        );
                        const allText = allMsgsResult.rows.filter(m => !isAutoGreeting(m.content)).map(m => m.content || '').join(' ') + ' ' + (received_message.text || '');
                        const autoBU3 = await classifyBUFromMessage(allText);
                        if (autoBU3) {
                            await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU3, leadId]);
                            console.log(`[BU-AUTO] Lead #${leadId} (${oldLead.name}) → Auto BU: ${autoBU3} (từ tin nhắn tiếp theo)`);
                        }
                    }

                    // [TOUR-AUTO] Nếu lead chưa có Tour
                    if (!oldLead.tour_id) {
                        // Re-fetch oldLead.bu_group to get the most updated one if it was just assigned above
                        const updatedLead = await db.query('SELECT bu_group FROM leads WHERE id = $1', [leadId]);
                        const currentBuGroup = updatedLead.rows[0].bu_group;

                        const allMsgsResult = await db.query(
                            'SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
                            [conversationId]
                        );
                        const allText = allMsgsResult.rows.filter(m => !isAutoGreeting(m.content)).map(m => m.content || '').join(' ') + ' ' + (received_message.text || '');
                        const autoTour3 = await classifyTourFromMessage(allText);
                        
                        if (autoTour3 && autoTour3.tour_id) {
                            const q3 = currentBuGroup ? 
                                'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                                'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                            const params3 = currentBuGroup ? 
                                [autoTour3.tour_id, leadId] : 
                                [autoTour3.tour_id, autoTour3.bu_group, leadId];
                            
                            await db.query(q3, params3);
                            console.log(`[TOUR-AUTO] Lead #${leadId} (${oldLead.name}) → Auto Tour: ${autoTour3.tour_id} (từ tin nhắn tiếp theo)`);
                        }
                    }
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

        // 5. Cập nhật Số điện thoại (Tự động trích xuất)
        const extractedPhone = extractVietnamPhone(received_message.text);
        if (extractedPhone && leadId) {
            const checkPhone = await db.query('SELECT phone FROM leads WHERE id = $1', [leadId]);
            if (checkPhone.rows.length > 0) {
                const currentPhone = checkPhone.rows[0].phone;
                if (currentPhone !== extractedPhone) {
                    console.log(`[FB WEBHOOK] Phát hiện SĐT mới ${extractedPhone} cho Lead ID ${leadId} (cũ: ${currentPhone || 'Trống'}). Đang ghi đè...`);
                    // Cập nhật SĐT và cố gắng định danh KH cũ
                    await db.query(
                        'UPDATE leads SET phone = $1, customer_id = COALESCE(customer_id, (SELECT id FROM customers WHERE phone = $1 LIMIT 1)) WHERE id = $2',
                        [extractedPhone, leadId]
                    );
                }
            }
        }

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
                                    subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_deliveries', 'standby']
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
exports.syncRecentConversations = async (limitCount = 25) => {
    try {
        const { token, pageId: resolvedPageId } = await getPageToken();
        if (!token) return;

        // Nếu không có pageId, thử resolve từ /me
        let pageId = resolvedPageId;
        if (!pageId) {
            try {
                const meRes = await axios.get(`https://graph.facebook.com/v25.0/me?fields=id&access_token=${token}`);
                pageId = meRes.data?.id;
            } catch (e) {
                console.error('[FB POLLER] Không thể resolve Page ID từ /me:', e.message);
                return;
            }
        }
        if (!pageId) return;

        // Kéo các cuộc trò chuyện gần nhất theo limitCount
        const endpoint = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=link,participants{id,name},messages.limit(100){message,from,created_time,shares}&limit=${limitCount}&access_token=${token}`;
        const res = await axios.get(endpoint);
        
        if (!res.data || !res.data.data) return;

        for (const conv of res.data.data) {
            try {
                const fbLink = conv.link ? `https://facebook.com${conv.link}` : null;
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
                const fbCreatedAt = userMsgObj && userMsgObj.created_time ? new Date(userMsgObj.created_time) : new Date();

                // Kéo hội thoại từ DB xem đã có chưa
                const convRes = await db.query('SELECT * FROM conversations WHERE external_id = $1', [psid]);
                
                // Trích xuất tự động SĐT từ TẤT CẢ tin nhắn của khách trong batch này
                let extractedPhone = null;
                for (const m of messagesList) {
                    if (m.from && m.from.id === psid && m.message) {
                        const phone = extractVietnamPhone(m.message);
                        if (phone) {
                            extractedPhone = phone;
                            break;
                        }
                    }
                }
                if (!extractedPhone && actualMessageText) {
                    extractedPhone = extractVietnamPhone(actualMessageText);
                }
                let currentLeadId;

                if (convRes.rows.length === 0) {
                    console.log(`[FB POLLER] Phát hiện khách mới chat với Fanpage: ${userName}. Đang tạo Lead...`);
                    // Tạo Lead mới tinh (Kèm kiểm tra PSID dò Khách Quen)
                    const leadResult = await db.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, consultation_note, last_contacted_at, customer_id, phone, fb_conversation_link, created_at) VALUES ($1, $2, $3, $4::text, $5, $9, (SELECT id FROM customers WHERE facebook_psid = $6::text OR phone = $7::text LIMIT 1), $7::text, $8, $9) RETURNING *',
                        [userName, 'Messenger', 'Mới', psid, firstMessageNote, psid, extractedPhone, fbLink, fbCreatedAt]
                    );

                    currentLeadId = leadResult.rows[0].id;
                    
                    let adContextText = '';
                    for (const m of messagesList) {
                        if (m.shares && m.shares.data && m.shares.data.length > 0) {
                            for (const share of m.shares.data) {
                                if (share.description) adContextText += share.description + ' ';
                                if (share.name) adContextText += share.name + ' ';
                            }
                        }
                    }

                    // Auto-classify BU from ALL messages + shares ad_context
                    const allConvMsgs = messagesList.filter(m => !isAutoGreeting(m.message)).map(m => (m.message || '')).join(' ');
                    const autoBUPoller = await classifyBUFromMessage(allConvMsgs + ' ' + (actualMessageText || '') + ' ' + adContextText);
                    if (autoBUPoller) {
                        await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBUPoller, currentLeadId]);
                        console.log(`[BU-AUTO] Poller Lead #${currentLeadId} (${userName}) → Auto BU: ${autoBUPoller}`);
                    }

                    // Auto-classify Tour from ALL messages + shares ad_context
                    const autoTourPoller = await classifyTourFromMessage(allConvMsgs + ' ' + (actualMessageText || '') + ' ' + adContextText);
                    if (autoTourPoller && autoTourPoller.tour_id) {
                        const q = autoBUPoller ? 
                            'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                            'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                        const params = autoBUPoller ? 
                            [autoTourPoller.tour_id, currentLeadId] : 
                            [autoTourPoller.tour_id, autoTourPoller.bu_group, currentLeadId];
                        await db.query(q, params);
                        console.log(`[TOUR-AUTO] Poller Lead #${currentLeadId} (${userName}) → Auto Tour: ${autoTourPoller.tour_id}`);
                    }
                    // --- LUÔN tạo Conversation để tránh tạo Lead trùng lặp mỗi lần poll ---
                    const messageForConv = actualMessageText || '(Khách mới nhắn tin)';
                    const newConv = await db.query(
                        'INSERT INTO conversations (source, external_id, lead_id, last_message) VALUES ($1, $2, $3, $4) RETURNING id',
                        ['messenger', psid, currentLeadId, messageForConv]
                    );
                    const conversationId = newConv.rows[0].id;
                    // Lưu TẤT CẢ messages từ cuộc hội thoại (cả customer + page)
                    for (const msg of messagesList) {
                        if (!msg.message || msg.message.trim() === '') continue;
                        const senderType = (msg.from && msg.from.id === psid) ? 'customer' : 'page';
                        const createdAt = msg.created_time ? new Date(msg.created_time) : new Date();
                        await db.query(
                            'INSERT INTO messages (conversation_id, sender_type, content, created_at) VALUES ($1, $2, $3, $4)',
                            [conversationId, senderType, msg.message, createdAt]
                        );
                    }

                    // Kích hoạt CAPI
                    metaCapi.sendLeadEvent(leadResult.rows[0]).catch(err => 
                        console.error('[CAPI] Lỗi khi gửi sự kiện Lead từ Poller:', err.message)
                    );
                } else {
                    // ĐÃ CÓ CONVERSATION
                    const oldConv = convRes.rows[0];
                    currentLeadId = oldConv.lead_id;

                    // Nếu có SĐT mới, cập nhật vào Lead nếu đang trống
                    if (extractedPhone) {
                        const checkPhone = await db.query('SELECT phone FROM leads WHERE id = $1', [currentLeadId]);
                        if (checkPhone.rows.length > 0 && !checkPhone.rows[0].phone) {
                            console.log(`[FB POLLER] Trích xuất SĐT ${extractedPhone} cho Lead ID ${currentLeadId}`);
                            await db.query('UPDATE leads SET phone = $1::text, customer_id = COALESCE(customer_id, (SELECT id FROM customers WHERE phone = $1::text LIMIT 1)) WHERE id = $2', [extractedPhone, currentLeadId]);
                        }
                    }

                    // Lưu/Cập nhật fb_conversation_link liên tục để sửa lỗi cũ
                    if (fbLink) {
                        await db.query('UPDATE leads SET fb_conversation_link = $1::text WHERE id = $2 AND (fb_conversation_link IS NULL OR fb_conversation_link != $1::text)', [fbLink, currentLeadId]);
                    }
                    
                    const existingMsgsRes = await db.query('SELECT content, sender_type FROM messages WHERE conversation_id = $1 ORDER BY id DESC LIMIT 150', [oldConv.id]);
                    const existingMsgSet = new Set(existingMsgsRes.rows.map(m => `${m.sender_type}|${m.content}`));
                    
                    let hasAnyNewMsg = false;
                    let lastIteratedMessage = oldConv.last_message;
                    
                    let adContextText = '';

                    // Duyệt ngược để chèn theo đúng thời gian (cũ -> mới)
                    for (let i = messagesList.length - 1; i >= 0; i--) {
                        const msg = messagesList[i];
                        
                        if (msg.shares && msg.shares.data && msg.shares.data.length > 0) {
                            for (const share of msg.shares.data) {
                                if (share.description) adContextText += share.description + ' ';
                                if (share.name) adContextText += share.name + ' ';
                            }
                        }
                        
                        if (!msg.message || msg.message.trim() === '') continue;
                        
                        const senderType = (msg.from && msg.from.id === psid) ? 'customer' : 'page';
                        const matchKey = `${senderType}|${msg.message}`;
                        
                        if (!existingMsgSet.has(matchKey)) {
                            const createdAt = msg.created_time ? new Date(msg.created_time) : new Date();
                            await db.query(
                                'INSERT INTO messages (conversation_id, sender_type, content, created_at) VALUES ($1, $2, $3, $4)',
                                [oldConv.id, senderType, msg.message, createdAt]
                            );
                            hasAnyNewMsg = true;
                            lastIteratedMessage = msg.message;
                            existingMsgSet.add(matchKey); // To duplicate handles within same block
                            
                            if (senderType === 'customer') {
                                // Cập nhật Lead's last_contacted_at
                                const leadRes = await db.query('SELECT status, name, phone, email FROM leads WHERE id = $1', [currentLeadId]);
                                if (leadRes.rows.length > 0) {
                                    const oldLead = leadRes.rows[0];
                                    if (['Chốt đơn', 'Thất bại'].includes(oldLead.status)) {
                                        console.log(`[FB POLLER] Khách Cũ (Đã Đóng) nhắn Fanpage: ${userName}. Tạo Lead mới...`);
                                        const newLeadResult = await db.query(
                                            'INSERT INTO leads (name, source, status, facebook_psid, last_contacted_at, customer_id, phone, email, fb_conversation_link, created_at) VALUES ($1, $2, $3, $4::text, $8, (SELECT id FROM customers WHERE facebook_psid = $4::text LIMIT 1), $5, $6, $7, $8) RETURNING *',
                                            [userName, 'Messenger', 'Mới', psid, oldLead.phone, oldLead.email, fbLink, fbCreatedAt]
                                        );
                                        currentLeadId = newLeadResult.rows[0].id;
                                        await db.query('UPDATE conversations SET lead_id = $1 WHERE id = $2', [currentLeadId, oldConv.id]);
                                        metaCapi.sendLeadEvent(newLeadResult.rows[0]).catch(err => console.error(err));
                                    } else {
                                        await db.query('UPDATE leads SET last_contacted_at = NOW() WHERE id = $1', [currentLeadId]);
                                    }
                                }
                            }
                        }
                    }

                    if (hasAnyNewMsg) {
                        await db.query('UPDATE conversations SET last_message = $1, updated_at = NOW() WHERE id = $2', [lastIteratedMessage, oldConv.id]);
                    }
                    
                    // Classification for existing lead if BU missing (Luôn chạy nếu chưa có BU)
                    const leadCheckRe = await db.query('SELECT bu_group, tour_id, name FROM leads WHERE id = $1', [currentLeadId]);
                    if (leadCheckRe.rows.length > 0) {
                        const allPollerMsgs = await db.query('SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [oldConv.id]);
                        const allPollerText = allPollerMsgs.rows.filter(m => !isAutoGreeting(m.content)).map(m => m.content || '').join(' ');
                        
                        if (!leadCheckRe.rows[0].bu_group) {
                            const autoBUPoller2 = await classifyBUFromMessage(allPollerText + ' ' + adContextText);
                            if (autoBUPoller2) {
                                await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBUPoller2, currentLeadId]);
                                console.log(`[BU-AUTO] Poller Lead #${currentLeadId} (${leadCheckRe.rows[0].name}) → Auto BU: ${autoBUPoller2}`);
                            }
                        }

                        if (!leadCheckRe.rows[0].tour_id) {
                            // Re-fetch BU to get the most up-to-date one
                            const checkBu = await db.query('SELECT bu_group FROM leads WHERE id = $1', [currentLeadId]);
                            const autoTourPoller2 = await classifyTourFromMessage(allPollerText + ' ' + adContextText);
                            
                            if (autoTourPoller2 && autoTourPoller2.tour_id) {
                                const q3 = checkBu.rows[0].bu_group ? 
                                    'UPDATE leads SET tour_id = $1 WHERE id = $2' : 
                                    'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3';
                                const params3 = checkBu.rows[0].bu_group ? 
                                    [autoTourPoller2.tour_id, currentLeadId] : 
                                    [autoTourPoller2.tour_id, autoTourPoller2.bu_group, currentLeadId];
                                
                                await db.query(q3, params3);
                                console.log(`[TOUR-AUTO] Poller Lead #${currentLeadId} (${leadCheckRe.rows[0].name}) → Auto Tour: ${autoTourPoller2.tour_id}`);
                            }
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

exports.classifyBUFromMessage = classifyBUFromMessage;

exports.classifyTourFromMessage = classifyTourFromMessage;
