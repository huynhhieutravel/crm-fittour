const db = require('../db');
const { logActivity } = require('../utils/logger');
const { convertLeadToCustomer } = require('../services/conversionService');
const metaCapi = require('../services/metaCapiService');

exports.getAllLeads = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, tt.name as tour_name, u.full_name as assigned_to_name,
                   (SELECT COUNT(*)::int FROM lead_notes WHERE lead_id = l.id) as notes_count,
                   (SELECT content FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note,
                   (SELECT created_at FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note_at
            FROM leads l 
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id 
            LEFT JOIN users u ON l.assigned_to = u.id 
            ORDER BY l.created_at DESC
        `);
        res.json(result.rows);
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
        const finalStatus = 'Mới';

        const result = await db.query(
            'INSERT INTO leads (name, phone, email, source, tour_id, assigned_to, status, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at, facebook_psid, meta_lead_id, fbclid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [
                normalizedName, finalPhone, finalEmail, source || 'Messenger', 
                finalTourId, finalAssignedTo, finalStatus, 
                consultation_note || null, bu_group || null, gender || null, 
                birth_date || null, classification || 'Mới', last_contacted_at || new Date(),
                facebook_psid || null, meta_lead_id || null, fbclid || null
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

        // 2. Build Dynamic Update (Null-safe & Partial)
        const updates = req.body;
        const updateFields = [];
        const queryValues = [];
        const allowedFields = [
            'name', 'phone', 'email', 'source', 'tour_id', 'status', 
            'assigned_to', 'consultation_note', 'bu_group', 'gender', 
            'birth_date', 'classification', 'last_contacted_at', 'won_at',
            'facebook_psid', 'meta_lead_id', 'fbclid'
        ];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                let val = updates[key];
                
                // Normalization
                if (key === 'name' && val) val = val.toUpperCase().trim();
                if (key === 'tour_id' && val === '') val = null;
                if (key === 'assigned_to' && val === '') val = null;
                
                // Set won_at automatically if status changed to Chốt đơn
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

            // CAPI: Fire event when status changes (async, non-blocking)
            if (updates.status && updates.status !== oldLead.status) {
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
        const { startDate, endDate, buGroup } = req.query;
        
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
            LEFT JOIN leads l ON u.id = l.assigned_to AND ${joinLeadWhere}
            WHERE u.role IN ('sale', 'sales', 'manager', 'admin', 'staff')
            GROUP BY u.id, u.full_name
            HAVING COUNT(l.id) > 0 OR u.role = 'sale'
            ORDER BY total_leads DESC
        `, params);

        // 4. Distribution by Business Unit
        const buStats = await db.query(`
            SELECT 
                COALESCE(bu_group, 'Chưa phân loại') as name,
                COUNT(*)::int as count
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
            ${leadWhere} AND status NOT IN ('Chốt đơn', 'Thất bại')
            GROUP BY 1
        `, params);

        // 7. Recent Overdue Leads for action list
        const overdueLeads = await db.query(`
            SELECT l.id, l.name, l.phone, l.last_contacted_at, u.full_name as staff_name
            FROM leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            WHERE ${joinLeadWhere} 
              AND l.status NOT IN ('Chốt đơn', 'Thất bại')
              AND (l.last_contacted_at < NOW() - INTERVAL '3 days' OR l.last_contacted_at IS NULL)
            ORDER BY l.last_contacted_at ASC NULLS FIRST
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

        res.json({
            statusStats: statusStats.rows,
            sourceStats: sourceStats.rows,
            staffStats: staffStats.rows,
            buStats: buStats.rows,
            destinationStats: destinationStats.rows,
            careStats: careStats.rows,
            overdueLeads: overdueLeads.rows,
            classificationStats: classificationStats.rows
        });
    } catch (err) {
        console.error('Get Lead Stats Error:', err);
        res.status(500).json({ message: err.message });
    }
};
