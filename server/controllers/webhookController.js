const facebookService = require('../services/facebookService');

const db = require('../db');

exports.verifyWebhook = async (req, res) => {
    console.log('[WEBHOOK] ===== VERIFY REQUEST RECEIVED =====');
    console.log('[WEBHOOK] Query params:', JSON.stringify(req.query));
    
    try {
        const resSetting = await db.query('SELECT value FROM settings WHERE key = $1', ['meta_verify_token']);
        const VERIFY_TOKEN = (resSetting.rows.length > 0 && resSetting.rows[0].value) || process.env.FB_VERIFY_TOKEN;

        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        console.log(`[WEBHOOK] Mode: ${mode}, Token match: ${token === VERIFY_TOKEN}, Challenge: ${challenge ? 'present' : 'missing'}`);

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('[WEBHOOK] ✅ WEBHOOK_VERIFIED SUCCESSFULLY');
                return res.status(200).send(challenge);
            } else {
                console.log('[WEBHOOK] ❌ Token mismatch or wrong mode');
                return res.sendStatus(403);
            }
        } else {
            console.log('[WEBHOOK] ❌ Missing mode or token in query params');
            return res.status(400).send('Error: Missing hub.mode or hub.verify_token');
        }
    } catch (err) {
        console.error('[WEBHOOK] Error during verification:', err.message);
        return res.status(500).send('Internal Server Error during verification');
    }
};

exports.handleWebhookEvent = async (req, res) => {
    const body = req.body;
    
    console.log('[WEBHOOK] ===== INCOMING WEBHOOK EVENT =====');
    console.log('[WEBHOOK] Object:', body.object);
    console.log('[WEBHOOK] Full body:', JSON.stringify(body, null, 2));

    if (body.object === 'page') {
        for (const entry of body.entry) {
            console.log(`[WEBHOOK] Processing entry ID: ${entry.id}`);
            
            // Handle Messenger Conversations (Primary or Standby)
            const webhooks = entry.messaging || entry.standby || [];
            const isStandby = !!entry.standby;

            if (webhooks.length > 0) {
                for (const webhook_event of webhooks) {
                    console.log(`[WEBHOOK] ${isStandby ? '🕵️ Standby' : '📩 Primary'} Event:`, JSON.stringify(webhook_event));

                    if (webhook_event.sender && webhook_event.sender.id) {
                        const sender_psid = webhook_event.sender.id;
                        console.log(`[WEBHOOK] Sender PSID: ${sender_psid}`);
                        
                        if (webhook_event.message) {
                            // Kiểm tra nếu đây là echo (tin nhắn page gửi khách) → lưu vào messages
                            if (webhook_event.message.is_echo) {
                                const recipientPsid = webhook_event.recipient?.id || sender_psid;
                                const echoText = webhook_event.message.text || '(Hình ảnh/Đính kèm)';
                                // Tìm conversation bằng PSID người nhận (khách)
                                const echoConvRes = await db.query('SELECT id, lead_id FROM conversations WHERE external_id = $1', [recipientPsid]);
                                if (echoConvRes.rows.length > 0) {
                                    const echoConvId = echoConvRes.rows[0].id;
                                    await db.query(
                                        'INSERT INTO messages (conversation_id, sender_type, content) VALUES ($1, $2, $3)',
                                        [echoConvId, 'page', echoText]
                                    );
                                    // Nếu lead chưa có BU → check lại sau mỗi page reply
                                    const leadId = echoConvRes.rows[0].lead_id;
                                    if (leadId) {
                                        const leadCheck = await db.query('SELECT bu_group, name FROM leads WHERE id = $1', [leadId]);
                                        if (leadCheck.rows.length > 0 && !leadCheck.rows[0].bu_group) {
                                            const allMsgs = await db.query('SELECT content FROM messages WHERE conversation_id = $1', [echoConvId]);
                                            const allText = allMsgs.rows.map(m => m.content || '').join(' ');
                                            const autoBU = await facebookService.classifyBUFromMessage(allText);
                                            if (autoBU) {
                                                await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU, leadId]);
                                                console.log(`[BU-AUTO] Echo Webhook Lead #${leadId} (${leadCheck.rows[0].name}) → Auto BU: ${autoBU}`);
                                            }
                                        }
                                    }
                                }
                                console.log(`[WEBHOOK] 📤 Echo (page reply) saved for PSID: ${recipientPsid}`);
                            } else {
                                console.log(`[WEBHOOK] Message text: "${webhook_event.message.text || '(attachment/other)'}"`);
                                facebookService.handleMessage(sender_psid, webhook_event.message, isStandby)
                                    .then(() => console.log('[WEBHOOK] ✅ handleMessage completed'))
                                    .catch(err => console.error('[WEBHOOK] ❌ handleMessage error:', err.message, err.stack));
                            }
                        } else if (webhook_event.postback) {
                            console.log(`[WEBHOOK] Postback payload: ${webhook_event.postback.payload}`);
                            facebookService.handlePostback(sender_psid, webhook_event.postback)
                                .then(() => console.log('[WEBHOOK] ✅ handlePostback completed'))
                                .catch(err => console.error('[WEBHOOK] ❌ handlePostback error:', err.message, err.stack));
                        }
                    } else {
                        console.log('[WEBHOOK] ⚠️  No sender info in messaging event');
                    }
                }
            } else {
                console.log('[WEBHOOK] No messaging array in this entry');
            }

            // Handle Lead Ads (Form completions)
            if (entry.changes && entry.changes.length > 0) {
                entry.changes.forEach(change => {
                    console.log(`[WEBHOOK] Change field: ${change.field}`);
                    if (change.field === 'leadgen' && change.value) {
                        console.log('[WEBHOOK] 📋 Lead Ad Event:', JSON.stringify(change.value));
                        const leadgen_id = change.value.leadgen_id;
                        const page_id = change.value.page_id;
                        
                        if (leadgen_id) {
                            if (facebookService.handleLeadAd) {
                                facebookService.handleLeadAd(leadgen_id, page_id)
                                    .then(() => console.log('[WEBHOOK] ✅ handleLeadAd completed'))
                                    .catch(err => console.error('[WEBHOOK] ❌ handleLeadAd error:', err.message));
                            } else {
                                console.error('[WEBHOOK] handleLeadAd function is not found in facebookService');
                            }
                        }
                    }
                });
            }
        }

        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log(`[WEBHOOK] ❌ Unknown object type: ${body.object}, returning 404`);
        res.sendStatus(404);
    }
};
