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

exports.handleWebhookEvent = (req, res) => {
    const body = req.body;
    
    console.log('[WEBHOOK] ===== INCOMING WEBHOOK EVENT =====');
    console.log('[WEBHOOK] Object:', body.object);
    console.log('[WEBHOOK] Full body:', JSON.stringify(body, null, 2));

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            console.log(`[WEBHOOK] Processing entry ID: ${entry.id}`);
            
            // Handle Messenger Conversations
            if (entry.messaging && entry.messaging.length > 0) {
                const webhook_event = entry.messaging[0];
                console.log('[WEBHOOK] 📩 Messenger Event:', JSON.stringify(webhook_event));

                if (webhook_event.sender && webhook_event.sender.id) {
                    const sender_psid = webhook_event.sender.id;
                    console.log(`[WEBHOOK] Sender PSID: ${sender_psid}`);
                    
                    if (webhook_event.message) {
                        console.log(`[WEBHOOK] Message text: "${webhook_event.message.text || '(attachment/other)'}"`);
                        facebookService.handleMessage(sender_psid, webhook_event.message)
                            .then(() => console.log('[WEBHOOK] ✅ handleMessage completed'))
                            .catch(err => console.error('[WEBHOOK] ❌ handleMessage error:', err.message, err.stack));
                    } else if (webhook_event.postback) {
                        console.log(`[WEBHOOK] Postback payload: ${webhook_event.postback.payload}`);
                        facebookService.handlePostback(sender_psid, webhook_event.postback)
                            .then(() => console.log('[WEBHOOK] ✅ handlePostback completed'))
                            .catch(err => console.error('[WEBHOOK] ❌ handlePostback error:', err.message, err.stack));
                    }
                } else {
                    console.log('[WEBHOOK] ⚠️  No sender info in messaging event');
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
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log(`[WEBHOOK] ❌ Unknown object type: ${body.object}, returning 404`);
        res.sendStatus(404);
    }
};
