const db = require('../db');
const { logActivity } = require('../utils/logger');

// Masking utility
const maskContact = (str, type) => {
    if (!str) return '';
    if (type === 'phone') {
        if (str.length < 6) return '***';
        return str.substring(0, 3) + '***' + str.substring(str.length - 2);
    }
    if (type === 'email') {
        const parts = str.split('@');
        if (parts.length !== 2) return '***';
        const name = parts[0];
        if (name.length <= 2) return '***@' + parts[1];
        return name.substring(0, 2) + '***@' + parts[1];
    }
    return '***';
};

exports.getAllGroupLeaders = async (req, res) => {
    try {
        const isPrivileged = ['admin', 'manager', 'group_manager', 'group_operations', 'group_operations_lead'].includes(req.user.role);

        // Non-privileged users: only see leaders linked to companies they are assigned to, or leaders explicitly assigned to them
        const whereClause = !isPrivileged 
            ? 'WHERE c.assigned_to = $1 OR gl.assigned_to = $1' 
            : '';
        const params = !isPrivileged 
            ? [req.user.id] 
            : [];

        const result = await db.query(`
            SELECT gl.*, 
                   u.full_name as assigned_name,
                   u.username as assigned_username,
                   c.name as company_display_name,
                   c.id as linked_company_id,
                   COALESCE(stats.total_projects, 0) as total_projects,
                   COALESCE(stats.total_revenue, 0) as total_revenue,
                   latest_note.content as latest_note,
                   latest_note.created_at as latest_note_at
            FROM group_leaders gl
            LEFT JOIN users u ON gl.assigned_to = u.id
            LEFT JOIN b2b_companies c ON gl.company_id = c.id
            LEFT JOIN LATERAL (
                SELECT COUNT(*)::int as total_projects, 
                       COALESCE(SUM(total_revenue), 0) as total_revenue
                FROM group_projects gp 
                WHERE gp.group_leader_id = gl.id
            ) stats ON true
            LEFT JOIN LATERAL (
                SELECT gln.content, gln.created_at
                FROM group_leader_notes gln
                WHERE gln.group_leader_id = gl.id
                ORDER BY gln.created_at DESC
                LIMIT 1
            ) latest_note ON true
            ${whereClause}
            ORDER BY gl.created_at DESC
        `, params);

        const leaders = result.rows.map(leader => {
            const isOwner = leader.assigned_to === req.user.id;
            const canViewRaw = isPrivileged || isOwner;

            if (!canViewRaw) {
                return {
                    ...leader,
                    name: leader.name + ' (***)',
                    phone: maskContact(leader.phone, 'phone'),
                    email: maskContact(leader.email, 'email'),
                    preferences: '*** Bị ẩn ***'
                };
            }
            return leader;
        });

        res.json(leaders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single leader with full detail (for profile slider)
exports.getGroupLeaderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT gl.*, 
                   u.full_name as assigned_name,
                   u.username as assigned_username,
                   c.name as company_display_name,
                   c.founded_date as company_founded_date,
                   COALESCE(stats.total_projects, 0) as total_projects,
                   COALESCE(stats.total_revenue, 0) as total_revenue
            FROM group_leaders gl
            LEFT JOIN users u ON gl.assigned_to = u.id
            LEFT JOIN b2b_companies c ON gl.company_id = c.id
            LEFT JOIN LATERAL (
                SELECT COUNT(*)::int as total_projects, 
                       COALESCE(SUM(total_revenue), 0) as total_revenue
                FROM group_projects gp 
                WHERE gp.group_leader_id = gl.id
            ) stats ON true
            WHERE gl.id = $1
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const leader = result.rows[0];

        // Get projects list
        const projectsRes = await db.query(`
            SELECT id, name, status, destination, expected_pax, total_revenue, departure_date, return_date
            FROM group_projects WHERE group_leader_id = $1
            ORDER BY created_at DESC
        `, [id]);
        leader.projects = projectsRes.rows;

        // Get notes (interaction history)
        const notesRes = await db.query(`
            SELECT gln.*, u.full_name as creator_name
            FROM group_leader_notes gln
            LEFT JOIN users u ON gln.created_by = u.id
            WHERE gln.group_leader_id = $1
            ORDER BY gln.created_at DESC
        `, [id]);
        leader.interaction_history = notesRes.rows;

        // Masking
        const isPrivileged = ['admin', 'manager', 'group_manager'].includes(req.user.role);
        const isOwner = leader.assigned_to === req.user.id;
        if (!isPrivileged && !isOwner) {
            leader.phone = maskContact(leader.phone, 'phone');
            leader.email = maskContact(leader.email, 'email');
        }

        res.json(leader);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Notes endpoints
exports.getLeaderNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT gln.*, u.full_name as creator_name
            FROM group_leader_notes gln
            LEFT JOIN users u ON gln.created_by = u.id
            WHERE gln.group_leader_id = $1
            ORDER BY gln.created_at DESC
        `, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLeaderNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content || !content.trim()) return res.status(400).json({ message: 'Nội dung không được trống' });

        const result = await db.query(`
            INSERT INTO group_leader_notes (group_leader_id, content, created_by)
            VALUES ($1, $2, $3) RETURNING *
        `, [id, content.trim(), req.user.id]);

        // Get creator name
        const userRes = await db.query('SELECT full_name FROM users WHERE id=$1', [req.user.id]);
        const note = result.rows[0];
        note.creator_name = userRes.rows[0]?.full_name || 'Hệ thống';

        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGroupLeader = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { name, company_name, phone, email, preferences, dob, assigned_to, company_founded_date, company_id, position, contact_status } = req.body;
        
        // Prevent duplicate phone across all leaders
        if (phone) {
            const check = await client.query('SELECT id, assigned_to FROM group_leaders WHERE phone = $1', [phone]);
            if (check.rows.length > 0) {
                const existing = check.rows[0];
                if (existing.assigned_to && existing.assigned_to !== req.user.id && !['admin', 'manager', 'group_manager'].includes(req.user.role)) {
                    return res.status(403).json({ message: 'Số điện thoại Trưởng đoàn này đã thuộc quyền quản lý của một Sale khác. Vui lòng liên hệ Quản lý để biết thêm chi tiết.' });
                }
            }
        }

        const assignId = assigned_to || req.user.id; // Default ownership to creator

        const result = await client.query(`
            INSERT INTO group_leaders (name, company_name, phone, email, preferences, dob, assigned_to, company_founded_date, company_id, position, contact_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `, [name, company_name, phone, email, preferences, dob || null, assignId, company_founded_date || null, company_id || null, position || 'Trưởng đoàn', contact_status || 'active']);

        await logActivity({
            user_id: req.user.id,
            action_type: 'CREATE',
            entity_type: 'GROUP_LEADER',
            entity_id: result.rows[0].id,
            details: `Tạo Trưởng đoàn MICE: ${name}`,
            new_data: result.rows[0]
        });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.updateGroupLeader = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, company_name, phone, email, preferences, dob, assigned_to, company_founded_date, company_id, position, contact_status } = req.body;
        
        // Ensure ownership
        const current = await db.query('SELECT assigned_to FROM group_leaders WHERE id=$1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        
        const isPrivileged = ['admin', 'manager', 'group_manager'].includes(req.user.role);
        if (!isPrivileged && current.rows[0].assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa Trưởng đoàn của người khác.' });
        }

        // Fetch old data for logging
        const oldLeaderRes = await db.query('SELECT * FROM group_leaders WHERE id = $1', [id]);
        const oldLeader = oldLeaderRes.rows[0];

        const result = await db.query(`
            UPDATE group_leaders 
            SET name=$1, company_name=$2, phone=$3, email=$4, preferences=$5, dob=$6, 
                assigned_to=$7, company_founded_date=$8, company_id=$9, position=$10, 
                contact_status=$11, updated_at=CURRENT_TIMESTAMP
            WHERE id=$12 RETURNING *
        `, [name, company_name, phone, email, preferences, dob || null, assigned_to || null, company_founded_date || null, company_id || null, position || 'Trưởng đoàn', contact_status || 'active', id]);

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'GROUP_LEADER',
                entity_id: id,
                details: `Cập nhật thông tin Trưởng đoàn MICE: ${name}`,
                old_data: oldLeader,
                new_data: result.rows[0]
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGroupLeader = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch old data for logging
        const oldLeaderRes = await db.query('SELECT * FROM group_leaders WHERE id = $1', [id]);
        if (oldLeaderRes.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldLeader = oldLeaderRes.rows[0];

        await db.query('DELETE FROM group_leaders WHERE id=$1', [id]);

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'GROUP_LEADER',
                entity_id: id,
                details: `Xóa Trưởng đoàn MICE: ${oldLeader.name}`,
                old_data: oldLeader
            });
        }

        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
