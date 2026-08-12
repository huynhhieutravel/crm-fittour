const db = require('../db');
const { logActivity } = require('../utils/logger');
const { convertLeadToCustomer } = require('../services/conversionService');
const metaCapi = require('../services/metaCapiService');
const telegramService = require('../services/telegramService');
const { getDataScope } = require("../middleware/teamScope");
const { getUserMergedPerms } = require("../middleware/permCheck");
const { emitEvent } = require('../utils/eventBus');
const SystemEvents = require('../constants/SystemEvents');
const notificationController = require('./notificationController');


exports.getAllLeads = async (req, res) => {
    try {
        // Data Scoping (V2) - Masking thay vì Ẩn Dòng
        let myScope = null;
        if (req.user && req.user.role !== 'admin') {
            const perms = await getUserMergedPerms(req.user.id, req.user.role);
            myScope = await getDataScope(req.user.id, 'leads', perms);
            
            if (myScope.scope === 'none') {
                return res.json([]); // Không có quyền xem module
            }
        }

        const result = await db.query(`
            SELECT l.*, tt.name as tour_name, u.full_name as assigned_to_name,
                   (SELECT COUNT(*)::int FROM lead_notes WHERE lead_id = l.id) as notes_count,
                   (SELECT content FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note,
                   (SELECT created_at FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note_at,
                   c.id as returning_customer_id,
                   (SELECT SUM(total_price) FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới', 'CANCELLED', 'EXPIRED'))::numeric as total_spent,
                   CASE WHEN c.id IS NOT NULL THEN true ELSE false END as is_returning_customer
            FROM leads l 
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id 
            LEFT JOIN users u ON l.assigned_to = u.id 
            LEFT JOIN customers c ON l.customer_id = c.id
            ORDER BY l.created_at DESC
        `);

        const leads = result.rows.map(lead => {
            let isLocked = false;
            if (req.user && req.user.role !== 'admin' && myScope && myScope.scope !== 'all') {
                if (lead.assigned_to !== null && !myScope.userIds.includes(lead.assigned_to)) {
                    isLocked = true; // Lead thuộc về người khác
                }
            }

            if (isLocked) {
                lead.is_locked = true;
                if (lead.phone && lead.phone.length >= 7) {
                    lead.masked_phone = lead.phone.substring(0, 3) + '****' + lead.phone.substring(lead.phone.length - 3);
                } else if (lead.phone) {
                    lead.masked_phone = '***';
                }
            } else {
                lead.is_locked = false;
            }
            return lead;
        });

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLead = async (req, res) => {
    try {
        const { name, phone, email, source, tour_id, assigned_to, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at, facebook_psid, meta_lead_id, fbclid } = req.body;
        
        // Normalize
        const normalizedName = name ? name.toUpperCase().trim() : 'KHÁCH HÀNG MỚI';
        const finalPhone = (phone && phone.trim() !== '') ? phone.trim() : null;
        const finalEmail = (email && email.trim() !== '') ? email.trim() : null;
        const finalTourId = (tour_id === '' || !tour_id) ? null : tour_id;
        const finalAssignedTo = (assigned_to === '' || !assigned_to) ? null : assigned_to;
        // Auto-link retroactively: Check if customer exists by phone or facebook_psid
        let customerIdStr = null;
        if (finalPhone || facebook_psid) {
            const custRes = await db.query(
                `SELECT id FROM customers WHERE (phone = $1 AND $1 IS NOT NULL) OR (facebook_psid = $2 AND $2 IS NOT NULL) LIMIT 1`, 
                [finalPhone, facebook_psid]
            );
            if (custRes.rows.length > 0) {
                customerIdStr = custRes.rows[0].id;
            }
        }

        const finalStatus = req.body.status || 'Mới';

        const result = await db.query(
            'INSERT INTO leads (name, phone, email, source, tour_id, assigned_to, status, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at, facebook_psid, meta_lead_id, fbclid, customer_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
            [
                normalizedName, finalPhone, finalEmail, source || 'Messenger', 
                finalTourId, finalAssignedTo, finalStatus, 
                consultation_note || null, bu_group || null, gender || null, 
                birth_date || null, classification || 'Mới', last_contacted_at || new Date(),
                facebook_psid || null, meta_lead_id || null, fbclid || null, customerIdStr
            ]
        );

        const newLead = result.rows[0];

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'LEAD',
            entity_id: newLead.id,
            details: `Tạo mới Lead: ${newLead.name}`,
            new_data: newLead
        });

        // EMAIL EVENT
        emitEvent(SystemEvents.find(e => e.code === 'LEAD_CREATED').code, {
            lead_name: newLead.name,
            phone: newLead.phone,
            email: newLead.email,
            source: newLead.source,
            status: newLead.status,
            created_at: new Date().toISOString()
        });

        // TELEGRAM NOTIFICATION (NEW)
        try {
            const messageId = await telegramService.sendNewLeadNotification(newLead);
            if (messageId) {
                // Optionally save the message ID if we want to delete/update it later
                await db.query('UPDATE leads SET telegram_message_id = $1 WHERE id = $2', [messageId, newLead.id]);
                newLead.telegram_message_id = messageId;
            }
        } catch (e) {
            console.error('Failed to send telegram notification for new lead:', e);
        }

        // GLOBAL CHAT BOT NOTIFICATION
        try {
            const botContent = `Ting! Có khách hàng mới: ${newLead.name} ${newLead.phone ? '- ' + newLead.phone : ''}`;
            const botRes = await db.query(
                `INSERT INTO global_activities (user_id, content, type) VALUES (NULL, $1, 'SYSTEM_LOG') RETURNING *`,
                [botContent]
            );
            if (global.io) {
                const newAct = botRes.rows[0];
                newAct.user_name = 'Hệ Thống';
                global.io.emit('new_global_activity', newAct);
            }
        } catch(e) { console.error('Global activity emit error:', e); }

        res.status(201).json(newLead);
    } catch (err) {
        console.error('Create Lead Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLead = async (req, res) => {
    const leadId = req.params.id;
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Get old data for logging and comparison
        const oldLeadRes = await client.query('SELECT * FROM leads WHERE id = $1', [leadId]);
        if (oldLeadRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy lead' });
        }
        const oldLead = oldLeadRes.rows[0];

        const updates = req.body;

        // HANDLE RECALL DISPATCH
        if (updates.is_recall) {
            await client.query(`
                UPDATE leads 
                SET dispatched_at = NULL, dispatched_by = NULL, dispatched_by_name = NULL, assigned_to = NULL, status = 'Mới', updated_at = NOW() 
                WHERE id = $1 RETURNING *
            `, [leadId]);
            
            await client.query('COMMIT');

            const recruiterName = (req.user && req.user.full_name) || updates.recalled_by_name || 'Điều phối viên';

            try {
                const actRes = await db.pool.query(
                    `SELECT * FROM global_activities WHERE type = 'LEAD_DISPATCH' AND (metadata->>'lead_id')::text = $1 ORDER BY id DESC LIMIT 1`,
                    [String(leadId)]
                );

                let parentActivityId = null;

                if (actRes.rows.length > 0) {
                    const activity = actRes.rows[0];
                    parentActivityId = activity.id;
                    let currentMeta = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata || '{}') : (activity.metadata || {});
                    currentMeta.is_recalled = true;
                    currentMeta.recalled_by_name = recruiterName;
                    currentMeta.assigned_to = null;
                    currentMeta.assigned_to_name = null;

                    const updatedActRes = await db.pool.query(
                        `UPDATE global_activities SET metadata = $1::jsonb WHERE id = $2 RETURNING *`,
                        [JSON.stringify(currentMeta), activity.id]
                    );

                    if (global.io && updatedActRes.rows.length > 0) {
                        const actToEmit = updatedActRes.rows[0];
                        actToEmit.user_name = 'Điều Phối Viên';
                        global.io.emit('global_activity_updated', actToEmit);
                    }
                }

                // Post a Reply notification in Global Chat
                const replyContent = `🚫 [THU HỒI] ${recruiterName} đã thu hồi lượt Điều phối của Lead ${oldLead.name}`;
                const replyRes = await db.pool.query(
                    `INSERT INTO global_activities (user_id, content, type, parent_id, reactions) VALUES (NULL, $1, 'SYSTEM_LOG', $2, '{}'::jsonb) RETURNING *`,
                    [replyContent, parentActivityId]
                );

                if (global.io) {
                    const newAct = replyRes.rows[0];
                    newAct.user_name = 'Hệ Thống';
                    if (parentActivityId && actRes.rows.length > 0) {
                        newAct.parent_content = actRes.rows[0].content;
                        newAct.parent_user_name = 'Điều Phối Viên';
                    }
                    global.io.emit('new_global_activity', newAct);
                }

            } catch(e) {
                console.error('Error handling recall global activity:', e);
            }

            return res.json({ message: 'Đã thu hồi lượt điều phối thành công', id: leadId });
        }
        const updateFields = [];
        const queryValues = [];
        const allowedFields = [
            'name', 'phone', 'email', 'source', 'tour_id', 'status', 
            'assigned_to', 'consultation_note', 'bu_group', 'gender', 
            'birth_date', 'classification', 'last_contacted_at', 'won_at',
            'facebook_psid', 'meta_lead_id', 'fbclid',
            'dispatched_at', 'dispatched_by', 'dispatched_by_name', 'dispatcher_notes', 'market_collection'
        ];

        let autoWonAtAdded = false;
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                if (key === 'won_at' && autoWonAtAdded) return; // Bỏ qua nếu đã được thêm tự động

                let val = updates[key];
                
                // Normalization
                if (key === 'name' && val) val = val.toUpperCase().trim();
                if (key === 'tour_id' && val === '') val = null;
                if (key === 'assigned_to' && val === '') val = null;

                // Auto-update status to 'Đang liên hệ' if newly assigned and status is 'Mới'
                if (key === 'assigned_to' && val !== null && oldLead.status === 'Mới' && updates.status === undefined) {
                    updateFields.push(`status = $${queryValues.length + 1}`);
                    queryValues.push('Đang liên hệ');
                }
                
                // Set won_at automatically if status changed to Chốt đơn
                if (key === 'status' && val === 'Chốt đơn' && !oldLead.won_at && updates.won_at === undefined) {
                    updateFields.push(`won_at = $${queryValues.length + 1}`);
                    queryValues.push(new Date());
                    autoWonAtAdded = true;
                }

                updateFields.push(`${key} = $${queryValues.length + 1}`);
                queryValues.push(val);
            }
        });

            if (updateFields.length > 0) {
            queryValues.push(leadId);
            const updateQuery = `UPDATE leads SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${queryValues.length} RETURNING *`;
            const result = await client.query(updateQuery, queryValues);
            let updatedLead = result.rows[0];

            // 2.5 Retroactive link if phone or facebook_psid was updated
            if (updates.phone !== undefined || updates.facebook_psid !== undefined) {
                const phoneToCheck = updates.phone !== undefined ? updates.phone : updatedLead.phone;
                const psidToCheck = updates.facebook_psid !== undefined ? updates.facebook_psid : updatedLead.facebook_psid;
                
                if (phoneToCheck || psidToCheck) {
                    const custRes = await client.query(
                        `SELECT id FROM customers WHERE (phone = $1 AND $1 IS NOT NULL AND $1 != '') OR (facebook_psid = $2 AND $2 IS NOT NULL AND $2 != '') LIMIT 1`, 
                        [phoneToCheck, psidToCheck]
                    );
                    if (custRes.rows.length > 0) {
                        await client.query(`UPDATE leads SET customer_id = $1 WHERE id = $2`, [custRes.rows[0].id, leadId]);
                        updatedLead.customer_id = custRes.rows[0].id;
                    } else {
                        await client.query(`UPDATE leads SET customer_id = NULL WHERE id = $1`, [leadId]);
                        updatedLead.customer_id = null;
                    }
                } else {
                    await client.query(`UPDATE leads SET customer_id = NULL WHERE id = $1`, [leadId]);
                    updatedLead.customer_id = null;
                }
            }

            // 3. AUTO-CONVERT TO CUSTOMER if status is 'Chốt đơn'
            if (updates.status === 'Chốt đơn' || updatedLead.status === 'Chốt đơn') {
                await convertLeadToCustomer(client, leadId, req.user ? req.user.id : null);
            }

            // 4. LOG ACTIVITY
            await logActivity({
                user_id: req.user ? req.user.id : null,
                action_type: 'UPDATE',
                entity_type: 'LEAD',
                entity_id: leadId,
                details: `Cập nhật thông tin Lead: ${updatedLead.name}`,
                old_data: oldLead,
                new_data: updatedLead
            });

            await client.query('COMMIT');

            // EMAIL EVENT for Assignment
            if (updates.assigned_to !== undefined && updates.assigned_to !== oldLead.assigned_to && updates.assigned_to !== null) {
                emitEvent(SystemEvents.find(e => e.code === 'LEAD_ASSIGNED').code, {
                    lead_name: updatedLead.name,
                    assigned_to: updatedLead.assigned_to,
                    status: updatedLead.status,
                    updated_at: new Date().toISOString()
                });
                
                // GLOBAL CHAT BOT NOTIFICATION & PUSH NOTIFICATION
                try {
                    const assignRes = await db.pool.query('SELECT full_name FROM users WHERE id = $1', [updates.assigned_to]);
                    const saleName = assignRes.rows.length > 0 ? assignRes.rows[0].full_name : 'Sale';
                    
                    // Lấy tên tour để gửi push cụ thể
                    let tourName = 'chưa rõ sản phẩm';
                    if (updatedLead.tour_id) {
                        const tRes = await db.pool.query('SELECT name FROM tour_templates WHERE id = $1', [updatedLead.tour_id]);
                        if (tRes.rows.length > 0) tourName = tRes.rows[0].name;
                    }
                    
                    const botContent = `🔔 Lead ${updatedLead.name} vừa được giao cho ${saleName}`;
                    const botRes = await db.pool.query(
                        `INSERT INTO global_activities (user_id, content, type) VALUES (NULL, $1, 'SYSTEM_LOG') RETURNING *`,
                        [botContent]
                    );
                    if (global.io) {
                        const newAct = botRes.rows[0];
                        newAct.user_name = 'Hệ Thống';
                        global.io.emit('new_global_activity', newAct);
                    }
                    
                    // Gửi Push Notification trực tiếp cho nhân viên được giao
                    const pushTitle = '🎯 Bạn được giao 1 Lead mới!';
                    const pushBody = `Khách hàng: ${updatedLead.name} - Nhu cầu: ${tourName}. Click để xem ngay!`;
                    
                    await db.pool.query(
                        `INSERT INTO user_notifications (user_id, title, message, link, type, reference_id) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [updates.assigned_to, pushTitle, pushBody, `/leads/${updatedLead.id}`, 'NEW_LEAD', updatedLead.id]
                    );
                    
                    await notificationController.sendPushToUser(updates.assigned_to, {
                        title: pushTitle,
                        body: pushBody,
                        url: `/inbox?psid=${updatedLead.id}`
                    }, 'PERSONAL_ASSIGNMENT');
                    
                } catch(e) { console.error('Global activity emit / Push error on assign:', e); }
            }

            // GLOBAL CHAT NOTIFICATION FOR DISPATCH
            if (updates.dispatched_at !== undefined && updates.dispatched_at !== null) {
                try {
                    let tourName = 'Khách lẻ / Chưa rõ';
                    if (updatedLead.tour_id) {
                        const tRes = await db.pool.query('SELECT name FROM tour_templates WHERE id = $1', [updatedLead.tour_id]);
                        if (tRes.rows.length > 0) tourName = tRes.rows[0].name;
                    }
                    
                    let assignedToName = null;
                    if (updatedLead.assigned_to) {
                        const uRes = await db.pool.query('SELECT full_name FROM users WHERE id = $1', [updatedLead.assigned_to]);
                        if (uRes.rows.length > 0) assignedToName = uRes.rows[0].full_name;
                    }

                    const dispatchText = `🚨 CÓ TOUR / LEAD MỚI ĐƯỢC ĐIỀU PHỐI 🚨\n\n👤 Tên khách: ${updatedLead.name || 'Chưa có tên'}\n📞 SĐT: ${updatedLead.phone || 'Chưa có'}\n📦 Tour / Nhu cầu: ${tourName}\n🌍 Thị trường: ${updatedLead.market_collection || 'Chưa xác định'}\n🏢 Nhóm: ${updatedLead.bu_group || 'Chưa chọn'}\n💬 Ghi chú từ Điều phối: ${updatedLead.dispatcher_notes || 'Không có ghi chú.'}`;
                    
                    const metadata = {
                        lead_id: updatedLead.id,
                        lead_name: updatedLead.name,
                        phone: updatedLead.phone || null,
                        facebook_psid: updatedLead.facebook_psid || null,
                        source: updatedLead.source || 'Messenger',
                        tour_name: tourName,
                        market: updatedLead.market_collection,
                        bu_group: updatedLead.bu_group,
                        dispatcher_notes: updatedLead.dispatcher_notes,
                        assigned_to: updatedLead.assigned_to || null,
                        assigned_to_name: assignedToName || null
                    };

                    const botRes = await db.pool.query(
                        `INSERT INTO global_activities (user_id, content, type, metadata) VALUES (NULL, $1, 'LEAD_DISPATCH', $2::jsonb) RETURNING *`,
                        [dispatchText, JSON.stringify(metadata)]
                    );

                    if (global.io) {
                        const newAct = botRes.rows[0];
                        newAct.user_name = 'Điều Phối Viên';
                        global.io.emit('new_global_activity', newAct);
                    }

                    // Send Telegram Notification
                    const messageId = await telegramService.sendLeadDispatchNotification(updatedLead, assignedToName);
                    if (messageId) {
                        await db.pool.query('UPDATE leads SET telegram_message_id = $1 WHERE id = $2', [messageId, updatedLead.id]);
                        updatedLead.telegram_message_id = messageId;
                    }
                } catch(e) {
                    console.error('Error creating LEAD_DISPATCH activity:', e);
                }
            }

            // CAPI: Fire event when status changes (async, non-blocking)
            if (updates.status && updates.status !== oldLead.status) {
              // EMAIL EVENT
              emitEvent(SystemEvents.find(e => e.code === 'LEAD_STATUS_CHANGED').code, {
                  lead_name: updatedLead.name,
                  old_status: oldLead.status,
                  status: updatedLead.status,
                  updated_at: new Date().toISOString()
              });
              
              (async () => {
                let tourName = null;
                let tourPrice = 0;
                
                // If closing a deal or having a tour_id, try to fetch info for CAPI Value
                const tourId = updatedLead.tour_id;
                if (tourId) {
                  try {
                    const tourRes = await db.query('SELECT name, price FROM tour_templates WHERE id = $1', [tourId]);
                    if (tourRes.rows.length > 0) {
                      tourName = tourRes.rows[0].name;
                      tourPrice = tourRes.rows[0].price;
                    }
                  } catch (err) {
                    console.error('[CAPI] Error fetching tour info for event:', err.message);
                  }
                }

                metaCapi.sendStatusChangeEvent(updatedLead, updates.status, tourName, tourPrice).catch(err =>
                  console.error('[CAPI] Error sending status change event:', err.message)
                );
              })();
            }

            res.json(updatedLead);
        } else {
            await client.query('COMMIT');
            res.json(oldLead);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update Lead Error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.deleteLead = async (req, res) => {
    try {
        const leadId = req.params.id;
        const resLead = await db.query('SELECT name FROM leads WHERE id = $1', [leadId]);
        if (resLead.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });

        await db.query('DELETE FROM leads WHERE id = $1', [leadId]);

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'LEAD',
            entity_id: leadId,
            details: `Đã xóa Lead: ${resLead.rows[0].name}`
        });

        res.json({ message: 'Đã xoá lead thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getLeadStats = async (req, res) => {
    try {
        const { startDate, endDate, buGroup, groupBy } = req.query;
        
        let leadWhere = 'WHERE 1=1';
        let joinLeadWhere = '1=1';
        const params = [];

        if (startDate) {
            params.push(startDate);
            leadWhere += ` AND created_at >= $${params.length}`;
            joinLeadWhere += ` AND l.created_at >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate + ' 23:59:59');
            leadWhere += ` AND created_at <= $${params.length}`;
            joinLeadWhere += ` AND l.created_at <= $${params.length}`;
        }
        if (buGroup) {
            params.push(buGroup);
            leadWhere += ` AND bu_group = $${params.length}`;
            joinLeadWhere += ` AND l.bu_group = $${params.length}`;
        }

        // 1. Stats by Status
        const statusStats = await db.query(`SELECT status, COUNT(*)::int as count FROM leads ${leadWhere} GROUP BY status`, params);
        
        // 2. Stats by Source
        const sourceStats = await db.query(`SELECT source, COUNT(*)::int as count FROM leads ${leadWhere} GROUP BY source`, params);
        
        // 3. Stats by Staff (Performance)
        const staffStats = await db.query(`
            SELECT 
                u.full_name as name,
                COUNT(l.id)::int as total_leads,
                COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as won_leads
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN leads l ON u.id = l.assigned_to AND ${joinLeadWhere}
            WHERE r.name IN ('sales', 'manager', 'admin', 'marketing', 'operations')
            GROUP BY u.id, u.full_name, r.name
            HAVING COUNT(l.id) > 0 OR r.name = 'sales'
            ORDER BY total_leads DESC
        `, params);

        // 4. Distribution by Business Unit
        const buStats = await db.query(`
            SELECT 
                COALESCE(bu_group, 'Chưa phân loại') as name,
                COUNT(*)::int as count,
                COUNT(CASE WHEN status = 'Chốt đơn' THEN 1 END)::int as won_leads
            FROM leads 
            ${leadWhere}
            GROUP BY bu_group
        `, params);

        // 5. Lead Distribution by Country/Destination
        const destinationStats = await db.query(`
            SELECT 
                COALESCE(tt.destination, 'Chưa xác định') as name,
                COUNT(l.id)::int as count
            FROM leads l
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id
            WHERE ${joinLeadWhere}
            GROUP BY tt.destination
            ORDER BY count DESC
            LIMIT 10
        `, params);

        // 6. Care Status (Overdue vs Active)
        const careStats = await db.query(`
            SELECT 
                CASE 
                    WHEN last_contacted_at >= NOW() - INTERVAL '3 days' THEN 'Đang chăm sóc tốt'
                    ELSE 'Cần chăm sóc ngay'
                END as status,
                COUNT(*)::int as count
            FROM leads
            ${leadWhere} AND status NOT IN ('Chốt đơn', 'Thất bại', 'Không phản hồi')
            GROUP BY 1
        `, params);

        // 7. Recent Leads Activity
        const recentLeads = await db.query(`
            SELECT l.*, u.full_name as staff_name
            FROM leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            WHERE ${joinLeadWhere}
            ORDER BY l.created_at DESC
            LIMIT 5
        `, params);

        // 8. Stats by Classification
        const classificationStats = await db.query(`
            SELECT 
                COALESCE(classification, 'Chưa phân loại') as name,
                COUNT(*)::int as count 
            FROM leads 
            ${leadWhere} 
            GROUP BY classification
        `, params);

        // 9. Time Series Stats (Grouped by Period and Status)
        let timeSeriesStats = [];
        if (groupBy) {
            const { tsStartDate, tsEndDate } = req.query;
            let tsJoinWhere = '1=1';
            const tsParams = [];
            const actualTsStart = tsStartDate || startDate;
            const actualTsEnd = tsEndDate || endDate;

            if (actualTsStart) {
                tsParams.push(actualTsStart);
                tsJoinWhere += ` AND l.created_at >= $${tsParams.length}`;
            }
            if (actualTsEnd) {
                tsParams.push(actualTsEnd + ' 23:59:59');
                tsJoinWhere += ` AND l.created_at <= $${tsParams.length}`;
            }
            if (buGroup) {
                tsParams.push(buGroup);
                tsJoinWhere += ` AND l.bu_group = $${tsParams.length}`;
            }

            let periodSQL = "TO_CHAR(l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')";
            if (groupBy === 'week') {
                periodSQL = "TO_CHAR(DATE_TRUNC('week', l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh'), 'YYYY-MM-DD')";
            } else if (groupBy === 'month') {
                periodSQL = "TO_CHAR(DATE_TRUNC('month', l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh'), 'YYYY-MM')";
            }
            
            const tsQuery = `
                SELECT 
                    ${periodSQL} as period,
                    l.status,
                    COUNT(*)::int as count
                FROM leads l
                WHERE ${tsJoinWhere}
                GROUP BY 1, l.status
                ORDER BY 1
            `;
            const tsRes = await db.query(tsQuery, tsParams);
            
            // Pivot the data by period
            const pivotMap = {};
            tsRes.rows.forEach(row => {
                if (!pivotMap[row.period]) {
                    pivotMap[row.period] = { period: row.period };
                }
                const statusName = row.status || 'Chưa xác định';
                pivotMap[row.period][statusName] = row.count;
                // Accumulate totals
                pivotMap[row.period].totalCount = (pivotMap[row.period].totalCount || 0) + row.count;
            });
            timeSeriesStats = Object.values(pivotMap);
        }

        res.json({
            statusStats: statusStats.rows,
            sourceStats: sourceStats.rows,
            staffStats: staffStats.rows,
            buStats: buStats.rows,
            destinationStats: destinationStats.rows,
            careStats: careStats.rows,
            recentLeads: recentLeads.rows,
            classificationStats: classificationStats.rows,
            timeSeriesStats: timeSeriesStats
        });
    } catch (err) {
        console.error('Get Lead Stats Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.bulkUpdateLeads = async (req, res) => {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Danh sách Lead ID trống' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        let successCount = 0;
        const allowedFields = ['status', 'classification']; 
        // Currently only status and classification makes sense for bulk updating, according to the plan.

        for (const leadId of ids) {
            const oldLeadRes = await client.query('SELECT * FROM leads WHERE id = $1', [leadId]);
            if (oldLeadRes.rows.length === 0) continue;
            
            const oldLead = oldLeadRes.rows[0];
            const updateFields = [];
            const queryValues = [];
            
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    let val = updates[key];
                    if (key === 'status' && val === 'Chốt đơn' && !oldLead.won_at) {
                        updateFields.push(`won_at = $${queryValues.length + 1}`);
                        queryValues.push(new Date());
                    }
                    updateFields.push(`${key} = $${queryValues.length + 1}`);
                    queryValues.push(val);
                }
            });

            if (updateFields.length > 0) {
                queryValues.push(leadId);
                const updateQuery = `UPDATE leads SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${queryValues.length} RETURNING *`;
                const result = await client.query(updateQuery, queryValues);
                const updatedLead = result.rows[0];

                if (updates.status === 'Chốt đơn' || updatedLead.status === 'Chốt đơn') {
                    await convertLeadToCustomer(client, leadId, req.user ? req.user.id : null);
                }

                await logActivity({
                    user_id: req.user ? req.user.id : null,
                    action_type: 'UPDATE',
                    entity_type: 'LEAD',
                    entity_id: leadId,
                    details: `Cập nhật hàng loạt (Bulk Update): Đã thay đổi các trường dữ liệu.`,
                    old_data: oldLead,
                    new_data: updatedLead
                });
                successCount++;
            }
        }

        await client.query('COMMIT');
        res.json({ message: `Đã cập nhật hàng loạt thành công ${successCount} khách hàng.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Bulk Update Leads Error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.claimLead = async (req, res) => {
    const leadId = req.params.id;
    const userId = req.user.id;
    const { activity_id } = req.body;

    try {
        // 1. Get user name
        const userRes = await db.pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        const userName = userRes.rows[0].full_name;

        // 2. Atomic update on leads to prevent race condition
        const updateRes = await db.pool.query(
            `UPDATE leads SET assigned_to = $1, status = 'Chưa chăm sóc', assigned_at = NOW(), updated_at = NOW() WHERE id = $2 AND assigned_to IS NULL RETURNING *`,
            [userId, leadId]
        );

        if (updateRes.rows.length === 0) {
            const checkRes = await db.pool.query(
                `SELECT l.assigned_to, u.full_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.id = $1`,
                [leadId]
            );
            const currentOwner = checkRes.rows[0]?.full_name || 'nhân viên khác';
            return res.status(400).json({ message: `Rất tiếc! Lead này đã được nhận bởi ${currentOwner}` });
        }

        const updatedLead = updateRes.rows[0];

        // 2.5 Update user_notifications
        await db.pool.query(
            `UPDATE user_notifications SET title = $1, message = $2, is_read = TRUE WHERE reference_id = $3 AND type = 'NEW_LEAD'`,
            [`Đã được tiếp nhận`, `Lead này đã được tiếp nhận bởi ${userName}`, leadId]
        );

        // 3. Update global_activities if activity_id is provided
        if (activity_id) {
            const actRes = await db.pool.query(`SELECT metadata FROM global_activities WHERE id = $1`, [activity_id]);
            let currentMeta = {};
            if (actRes.rows.length > 0 && actRes.rows[0].metadata) {
                currentMeta = typeof actRes.rows[0].metadata === 'string' 
                    ? JSON.parse(actRes.rows[0].metadata) 
                    : actRes.rows[0].metadata;
            }
            currentMeta.assigned_to = userId;
            currentMeta.assigned_to_name = userName;

            const updatedActRes = await db.pool.query(
                `UPDATE global_activities SET metadata = $1::jsonb WHERE id = $2 RETURNING *`,
                [JSON.stringify(currentMeta), activity_id]
            );

            if (global.io && updatedActRes.rows.length > 0) {
                const actToEmit = updatedActRes.rows[0];
                actToEmit.user_name = 'Điều Phối Viên';
                global.io.emit('global_activity_updated', actToEmit);
            }
        }

        // Update Telegram Notification
        if (updatedLead.telegram_message_id) {
            await telegramService.updateLeadDispatchNotification(updatedLead.telegram_message_id, updatedLead, userName);
        }

        res.json({ message: 'Nhận Lead thành công!', lead: updatedLead });
    } catch (err) {
        console.error('Claim Lead Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.unclaimLead = async (req, res) => {
    const leadId = req.params.id;
    const userId = req.user.id;
    const { activity_id } = req.body;

    try {
        // 1. Unassign lead
        const updateRes = await db.pool.query(
            `UPDATE leads SET assigned_to = NULL, status = 'Mới', assigned_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [leadId]
        );

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ message: 'Lead không tồn tại hoặc đã bị xóa' });
        }

        const updatedLead = updateRes.rows[0];

        // 2. Update global_activities metadata if activity_id provided
        if (activity_id) {
            const actRes = await db.pool.query(`SELECT metadata FROM global_activities WHERE id = $1`, [activity_id]);
            let currentMeta = {};
            if (actRes.rows.length > 0 && actRes.rows[0].metadata) {
                currentMeta = typeof actRes.rows[0].metadata === 'string' 
                    ? JSON.parse(actRes.rows[0].metadata) 
                    : actRes.rows[0].metadata;
            }
            currentMeta.assigned_to = null;
            currentMeta.assigned_to_name = null;

            const updatedActRes = await db.pool.query(
                `UPDATE global_activities SET metadata = $1::jsonb WHERE id = $2 RETURNING *`,
                [JSON.stringify(currentMeta), activity_id]
            );

            if (global.io && updatedActRes.rows.length > 0) {
                const actToEmit = updatedActRes.rows[0];
                actToEmit.user_name = 'Điều Phối Viên';
                global.io.emit('global_activity_updated', actToEmit);
            }
        }

        // Update Telegram Notification back to unassigned
        if (updatedLead.telegram_message_id) {
            await telegramService.updateLeadDispatchNotification(updatedLead.telegram_message_id, updatedLead, null);
        }

        res.json({ message: 'Đã nhả Lead thành công!', lead: updatedLead });
    } catch (err) {
        console.error('Unclaim Lead Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getTodayDispatches = async (req, res) => {
    try {
        const { rows } = await db.pool.query(`
            SELECT l.id, l.name, l.phone, l.facebook_psid, l.source, tt.name as tour_name, 
                   l.market_collection, l.bu_group, l.assigned_to, l.dispatched_at, 
                   l.dispatched_by_name, l.dispatcher_notes, l.created_at, l.status,
                   u.full_name as assigned_to_name
            FROM leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id
            WHERE l.dispatched_at >= CURRENT_DATE
            ORDER BY l.dispatched_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching today dispatches:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getCustomerJourney = async (req, res) => {
    try {
        const leadId = req.params.id;
        
        // 1. Get current lead
        const leadRes = await db.query('SELECT id, phone, email, facebook_psid FROM leads WHERE id = $1', [leadId]);
        if (leadRes.rows.length === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        
        const currentLead = leadRes.rows[0];
        const { phone, email, facebook_psid } = currentLead;
        
        if (!phone && !email && !facebook_psid) {
            return res.json([]); // No identifiable info
        }
        
        // 2. Find related past leads
        const pastLeadsRes = await db.query(`
            SELECT l.*, t.name as tour_name, u.full_name as assigned_name 
            FROM leads l 
            LEFT JOIN tour_templates t ON l.tour_id = t.id 
            LEFT JOIN users u ON l.assigned_to = u.id 
            WHERE 
              (l.phone = $1 AND $1 IS NOT NULL AND $1 != '') OR 
              (l.email = $2 AND $2 IS NOT NULL AND $2 != '') OR 
              (l.facebook_psid = $3 AND $3 IS NOT NULL AND $3 != '')
            ORDER BY l.created_at DESC
        `, [phone, email, facebook_psid]);
        
        const relatedLeads = pastLeadsRes.rows.filter(l => l.id != leadId); // Exclude current lead
        
        if (relatedLeads.length === 0) {
            return res.json([]);
        }
        
        const leadIds = relatedLeads.map(l => l.id);
        
        // 3. Get all notes for these past leads
        const notesRes = await db.query(`
            SELECT n.*, u.full_name as creator_name 
            FROM lead_notes n 
            LEFT JOIN users u ON n.created_by = u.id 
            WHERE n.lead_id = ANY($1) 
            ORDER BY n.created_at DESC
        `, [leadIds]);
        
        const allNotes = notesRes.rows;
        
        // 4. Attach notes to leads
        const journey = relatedLeads.map(lead => ({
            ...lead,
            notes: allNotes.filter(n => n.lead_id === lead.id)
        }));
        
        res.json(journey);
        
    } catch (error) {
        console.error('Error fetching customer journey:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
