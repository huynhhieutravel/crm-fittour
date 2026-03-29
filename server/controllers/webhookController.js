const facebookService = require('../services/facebookService');

const db = require('../db');

exports.verifyWebhook = async (req, res) => {
    const resSetting = await db.query('SELECT value FROM settings WHERE key = $1', ['meta_verify_token']);
    const VERIFY_TOKEN = (resSetting.rows.length > 0 && resSetting.rows[0].value) || process.env.FB_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

exports.handleWebhookEvent = (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            // Handle Messenger Conversations
            if (entry.messaging && entry.messaging.length > 0) {
                const webhook_event = entry.messaging[0];
                console.log('Messenger Event:', JSON.stringify(webhook_event));

                if (webhook_event.sender && webhook_event.sender.id) {
                    const sender_psid = webhook_event.sender.id;
                    if (webhook_event.message) {
                        facebookService.handleMessage(sender_psid, webhook_event.message);
                    } else if (webhook_event.postback) {
                        facebookService.handlePostback(sender_psid, webhook_event.postback);
                    }
                }
            }

            // Handle Lead Ads (Form completions)
            if (entry.changes && entry.changes.length > 0) {
                entry.changes.forEach(change => {
                    if (change.field === 'leadgen' && change.value) {
                        console.log('Lead Ad Event:', JSON.stringify(change.value));
                        const leadgen_id = change.value.leadgen_id;
                        const page_id = change.value.page_id;
                        
                        if (leadgen_id) {
                            if (facebookService.handleLeadAd) {
                                facebookService.handleLeadAd(leadgen_id, page_id);
                            } else {
                                console.error('handleLeadAd function is not found in facebookService');
                            }
                        }
                    }
                });
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};
