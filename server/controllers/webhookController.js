const facebookService = require('../services/facebookService');
const notificationController = require('./notificationController');

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
            const webhooksToProcess = [];
            
            if (entry.messaging && entry.messaging.length > 0) {
                entry.messaging.forEach(event => {
                    webhooksToProcess.push({ event, isStandby: false });
                });
            }
            
            if (entry.standby && entry.standby.length > 0) {
                entry.standby.forEach(event => {
                    webhooksToProcess.push({ event, isStandby: true });
                });
            }

            if (webhooksToProcess.length > 0) {
                for (const { event: webhook_event, isStandby } of webhooksToProcess) {
                    console.log(`[WEBHOOK] ${isStandby ? '🕵️ Standby' : '📩 Primary'} Event:`, JSON.stringify(webhook_event));

                    if (webhook_event.sender && webhook_event.sender.id) {
                        const sender_psid = webhook_event.sender.id;
                        console.log(`[WEBHOOK] Sender PSID: ${sender_psid}`);
                        
                        if (webhook_event.message) {
                            // Kiểm tra nếu đây là echo (tin nhắn page gửi khách) → lưu vào messages
                            if (webhook_event.message.is_echo) {
                                const recipientPsid = webhook_event.recipient?.id || sender_psid;
                                let echoText = webhook_event.message.text || '';
                                let echoImageUrl = null;

                                // Bóc tách ảnh đính kèm nếu Page gửi ảnh
                                if (webhook_event.message.attachments && webhook_event.message.attachments.length > 0) {
                                    const imgAtt = webhook_event.message.attachments.find(a => a.type === 'image' || (a.payload && a.payload.url));
                                    if (imgAtt && imgAtt.payload && imgAtt.payload.url) {
                                        echoImageUrl = imgAtt.payload.url;
                                    }
                                }

                                if (!echoText && !echoImageUrl) {
                                    echoText = '(Hình ảnh/Đính kèm)';
                                } else if (!echoText && echoImageUrl) {
                                    echoText = '[Hình ảnh]';
                                }

                                // Tìm conversation bằng PSID người nhận (khách)
                                const echoConvRes = await db.query('SELECT id, lead_id FROM conversations WHERE external_id = $1', [recipientPsid]);
                                if (echoConvRes.rows.length > 0) {
                                    const echoConvId = echoConvRes.rows[0].id;
                                    // Chống trùng lặp tin nhắn vừa được gửi qua Send API từ CRM hoặc duplicate echo webhook
                                    const isCrmSent = webhook_event.message.metadata === 'CRM_SENT';
                                    let isDuplicate = isCrmSent;

                                    if (!isDuplicate) {
                                        // Kiểm tra xem CRM vừa lưu tin này (sender_type = 'user') trong 30s qua không
                                        // hoặc tin page cùng nội dung vừa được lưu trong 5s qua (chống webhook retry lặp lại)
                                        const recentCheck = await db.query(
                                            `SELECT id FROM messages 
                                             WHERE conversation_id = $1 
                                               AND (
                                                 (content = $2 AND content IS NOT NULL AND content != '')
                                                 OR ($3::text IS NOT NULL AND image_url = $3)
                                               )
                                               AND (
                                                 (sender_type = 'user' AND created_at >= NOW() - INTERVAL '30 seconds')
                                                 OR 
                                                 (sender_type = 'page' AND created_at >= NOW() - INTERVAL '5 seconds')
                                               )
                                             LIMIT 1`,
                                            [echoConvId, echoText, echoImageUrl]
                                        );
                                        if (recentCheck.rows.length > 0) {
                                            isDuplicate = true;
                                            console.log(`[WEBHOOK] ⏭️ Echo message already recorded (id: ${recentCheck.rows[0].id}). Skipping duplicate for PSID: ${recipientPsid}`);
                                        }
                                    } else {
                                        console.log(`[WEBHOOK] ⏭️ Echo from CRM Send API (metadata: CRM_SENT). Skipping duplicate insert for PSID: ${recipientPsid}`);
                                    }

                                    if (!isDuplicate) {
                                        await db.query(
                                            'INSERT INTO messages (conversation_id, sender_type, content, image_url) VALUES ($1, $2, $3, $4)',
                                            [echoConvId, 'page', echoText, echoImageUrl]
                                        );
                                        console.log(`[WEBHOOK] 📤 Echo (page reply from Meta) saved for PSID: ${recipientPsid}${echoImageUrl ? ' (có ảnh đính kèm)' : ''}`);
                                    }
                                    // Nếu lead chưa có BU → check lại sau mỗi page reply
                                    const leadId = echoConvRes.rows[0].lead_id;
                                    if (leadId) {
                                        const leadCheck = await db.query('SELECT bu_group, tour_id, name FROM leads WHERE id = $1', [leadId]);
                                        if (leadCheck.rows.length > 0) {
                                            const allMsgs = await db.query('SELECT sender_type, content FROM messages WHERE conversation_id = $1', [echoConvId]);
                                            // Gộp tin khách VÀ AI (trừ câu hỏi chung chung) để vớt từ khoá Quảng Cáo
                                            const allText = allMsgs.rows
                                                .filter(m => !(m.content || '').includes('(Trung Quốc, Himalayas, Quốc tế...)'))
                                                .map(m => m.content || '').join(' ');
                                            
                                            // BU Auto
                                            if (!leadCheck.rows[0].bu_group) {
                                                const autoBU = await facebookService.classifyBUFromMessage(allText);
                                                if (autoBU) {
                                                    await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU, leadId]);
                                                    console.log(`[BU-AUTO] Echo Webhook Lead #${leadId} (${leadCheck.rows[0].name}) → Auto BU: ${autoBU}`);
                                                    leadCheck.rows[0].bu_group = autoBU;
                                                    
                                                    // Bắn thông báo cho toàn bộ team BU
                                                    notificationController.broadcastNewLead({ id: leadId, customer_name: leadCheck.rows[0].name }, autoBU).catch(console.error);
                                                }
                                            }
                                            
                                            // Tour Auto
                                            if (!leadCheck.rows[0].tour_id) {
                                                const autoTour = await facebookService.classifyTourFromMessage(allText, '', leadCheck.rows[0].bu_group);
                                                if (autoTour && autoTour.tour_id) {
                                                    if (leadCheck.rows[0].bu_group) {
                                                        // ĐÃ CÓ BU: KHÓA CỨNG BU, CHỈ CẬP NHẬT TOUR_ID
                                                        await db.query('UPDATE leads SET tour_id = $1 WHERE id = $2', [autoTour.tour_id, leadId]);
                                                        console.log(`[TOUR-AUTO] Echo Webhook Lead #${leadId} (${leadCheck.rows[0].name}) → Auto Tour: ${autoTour.tour_id} (BU giữ nguyên: ${leadCheck.rows[0].bu_group})`);
                                                    } else {
                                                        const targetBU = autoTour.bu_group;
                                                        const q = targetBU ? 
                                                            'UPDATE leads SET tour_id = $1, bu_group = $2 WHERE id = $3' : 
                                                            'UPDATE leads SET tour_id = $1 WHERE id = $2';
                                                        const params = targetBU ? 
                                                            [autoTour.tour_id, targetBU, leadId] : 
                                                            [autoTour.tour_id, leadId];
                                                        
                                                        await db.query(q, params);
                                                        console.log(`[TOUR-AUTO] Echo Webhook Lead #${leadId} (${leadCheck.rows[0].name}) → Auto Tour: ${autoTour.tour_id} (BU mới: ${targetBU})`);
                                                        
                                                        if (targetBU) {
                                                            notificationController.broadcastNewLead({ id: leadId, customer_name: leadCheck.rows[0].name }, targetBU).catch(console.error);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                console.log(`[WEBHOOK] 📤 Echo (page reply) saved for PSID: ${recipientPsid}`);
                            } else {
                                console.log(`[WEBHOOK] Message text: "${webhook_event.message.text || '(attachment/other)'}"`);
                                
                                let adContextText = '';
                                let adPhotoUrl = null;
                                let adTitle = '';

                                // Trích xuất thông tin Quảng cáo Click-to-Messenger từ referral hoặc postback
                                const referralObj = webhook_event.message?.referral || webhook_event.referral || webhook_event.postback?.referral;
                                if (referralObj) {
                                    if (referralObj.ad_title) {
                                        adContextText += referralObj.ad_title + ' ';
                                        adTitle = referralObj.ad_title;
                                    }
                                    if (referralObj.ref) adContextText += referralObj.ref + ' ';
                                    if (referralObj.ads_context_data) {
                                        if (referralObj.ads_context_data.ad_title) {
                                            adContextText += referralObj.ads_context_data.ad_title + ' ';
                                            if (!adTitle) adTitle = referralObj.ads_context_data.ad_title;
                                        }
                                        if (referralObj.ads_context_data.photo_url) adPhotoUrl = referralObj.ads_context_data.photo_url;
                                        else if (referralObj.ads_context_data.image_url) adPhotoUrl = referralObj.ads_context_data.image_url;
                                        else if (referralObj.ads_context_data.video_url) adPhotoUrl = referralObj.ads_context_data.video_url;
                                    }
                                }

                                // Trích xuất hình ảnh đính kèm (nếu khách gửi ảnh trực tiếp)
                                let attachmentImageUrl = null;
                                if (webhook_event.message && webhook_event.message.attachments) {
                                    webhook_event.message.attachments.forEach(att => {
                                        if (att.title) adContextText += att.title + ' ';
                                        if (att.url) adContextText += att.url + ' ';
                                        if (att.payload && att.payload.title) adContextText += att.payload.title + ' ';
                                        if (att.payload && att.payload.description) adContextText += att.payload.description + ' ';
                                        
                                        if (!attachmentImageUrl) {
                                            if (att.type === 'image' && att.payload?.url) {
                                                attachmentImageUrl = att.payload.url;
                                            } else if (att.payload?.url && (att.url || '').match(/\.(jpg|jpeg|png|webp|gif)/i)) {
                                                attachmentImageUrl = att.payload.url;
                                            }
                                        }
                                    });
                                }
                                if (adContextText) console.log(`[WEBHOOK] Extracted adContextText: "${adContextText.trim()}"`);
                                if (adPhotoUrl) console.log(`[WEBHOOK] 🖼️ Extracted adPhotoUrl: "${adPhotoUrl.substring(0, 70)}..."`);
                                if (attachmentImageUrl) console.log(`[WEBHOOK] 📎 Extracted attachmentImageUrl: "${attachmentImageUrl.substring(0, 70)}..."`);

                                try {
                                    await facebookService.handleMessage(sender_psid, webhook_event.message, isStandby, adContextText, {
                                        adPhotoUrl,
                                        adTitle,
                                        attachmentImageUrl
                                    });
                                    console.log('[WEBHOOK] ✅ handleMessage completed');
                                } catch (err) {
                                    console.error('[WEBHOOK] ❌ handleMessage error:', err.message, err.stack);
                                }
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
