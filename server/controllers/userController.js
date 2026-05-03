const db = require('../db');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../utils/logger');
const { isInManagedTeam, getAllowedRolesForManager } = require('../middleware/teamScope');

exports.getAllUsers = async (req, res) => {
    try {
        const usersRes = await db.query(`
            SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, u.created_at,
                   u.birth_date, u.gender, u.id_card, u.passport_url, u.id_expiry, u.address, u.facebook_url,
                   u.position, u.avatar_url,
                   r.name as role_name, r.id as role_id,
                   COALESCE(
                       (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'code', t.code) ORDER BY t.name)
                        FROM team_members tmb JOIN teams t ON tmb.team_id = t.id
                        WHERE tmb.user_id = u.id), '[]'::json
                   ) as teams
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            ORDER BY u.full_name ASC
        `);

        // ---- V2: Đọc từ bảng mới (ưu tiên) ----
        let useV2 = false;
        let permMaster = [];
        let rolePermsV2 = [];
        let userPermsV2 = [];
        
        try {
            const masterRes = await db.query('SELECT id, module, action FROM permissions_master');
            permMaster = masterRes.rows;
            if (permMaster.length > 0) {
                useV2 = true;
                const rpRes = await db.query('SELECT * FROM role_permissions_v2');
                rolePermsV2 = rpRes.rows;
                const upRes = await db.query('SELECT * FROM user_permissions_v2');
                userPermsV2 = upRes.rows;
            }
        } catch (e) {
            // V2 tables chưa tồn tại → fallback v1
            useV2 = false;
        }

        if (useV2) {
            // ---- V2 Path ----
            const usersWithPerms = usersRes.rows.map(user => {
                const permissions = {};
                
                permMaster.forEach(pm => {
                    if (!permissions[pm.module]) permissions[pm.module] = {};
                    
                    // Check user override first
                    const userOverride = userPermsV2.find(
                        up => up.user_id === user.id && up.permission_id === pm.id
                    );
                    
                    if (userOverride) {
                        permissions[pm.module][pm.action] = userOverride.granted;
                    } else {
                        // Fall back to role default
                        const roleDefault = rolePermsV2.find(
                            rp => rp.role_id === user.role_id && rp.permission_id === pm.id
                        );
                        permissions[pm.module][pm.action] = roleDefault ? roleDefault.granted : false;
                    }
                });
                
                // Backward compatibility: Generate can_view/can_create/can_edit/can_delete 
                // so frontend sidebar checkView() still works during migration
                const legacyPerms = {};
                Object.entries(permissions).forEach(([mod, actions]) => {
                    legacyPerms[mod] = {
                        can_view: actions.view_all || actions.view_own || actions.view || false,
                        can_create: actions.create || false,
                        can_edit: actions.edit || actions.edit_own || actions.edit_all || false,
                        can_delete: actions.delete || false,
                        // V2 detailed permissions
                        ...actions
                    };
                });
                
                return {
                    ...user,
                    permissions: legacyPerms,
                    permissions_v2: permissions
                };
            });
            
            return res.json(usersWithPerms);
        }

        // ---- V1 Fallback (bảng cũ) ----
        const rolePermsRes = await db.query('SELECT * FROM role_permissions');
        const userPermsRes = await db.query('SELECT * FROM user_permissions');

        const modules = [
            'leads', 'tours', 'departures', 'guides', 'customers', 'bookings', 'users', 'settings', 
            'b2b_companies', 'group_leaders', 'group_projects', 'op_tours'
        ];
        
        const usersWithPerms = usersRes.rows.map(user => {
            const myOverrides = userPermsRes.rows.filter(p => p.user_id === user.id);
            const myDefaultRolePerms = rolePermsRes.rows.filter(p => p.role_id === user.role_id);
            
            const mergedPermissions = {};
            modules.forEach(mod => {
                const defaultP = myDefaultRolePerms.find(p => p.module_name === mod) || { can_view: false, can_create: false, can_edit: false, can_delete: false };
                const overrideP = myOverrides.find(p => p.module_name === mod);
                
                mergedPermissions[mod] = {
                    can_view: overrideP ? overrideP.can_view : defaultP.can_view,
                    can_create: overrideP ? overrideP.can_create : defaultP.can_create,
                    can_edit: overrideP ? overrideP.can_edit : defaultP.can_edit,
                    can_delete: overrideP ? overrideP.can_delete : defaultP.can_delete
                };
            });
            
            return { ...user, permissions: mergedPermissions };
        });

        res.json(usersWithPerms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM roles ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, password, full_name, email, role_id, phone, is_active, team_id } = req.body;
    try {
        // Password policy: tối thiểu 6 ký tự
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        // Check if username exists
        const userExists = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }

        // Security check: restrict what roles the creator can assign
        if (req.user && req.user.role !== 'admin') {
            const allowedRoles = await getAllowedRolesForManager(req.user.id);
            const isAllowedRole = allowedRoles.some(r => r.id === parseInt(role_id));
            if (!isAllowedRole) {
                return res.status(403).json({ message: 'Bạn không có quyền tạo tài khoản với Phân quyền này.' });
            }
        }

        // Determine team_id: if team manager creates user, auto-assign to their team
        let finalTeamId = team_id || null;
        if (!finalTeamId && req.user) {
            const creatorRes = await db.query('SELECT team_id FROM users WHERE id = $1', [req.user.id]);
            if (creatorRes.rows.length > 0 && creatorRes.rows[0].team_id) {
                finalTeamId = creatorRes.rows[0].team_id;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password, full_name, email, role_id, phone, is_active, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [username, hashedPassword, full_name, email, role_id, phone || null, is_active !== false, finalTeamId]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Thêm nhân viên thành công.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, role_id, phone, is_active, permissions,
            birth_date, gender, id_card, passport_url, id_expiry, address, facebook_url, created_at, position, avatar_url } = req.body;
    console.log(`[UPDATE USER ${id}] Payload:`, JSON.stringify(req.body));
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Safeguard: Managers cannot edit Admins
        if (req.user.role === 'manager') {
            const targetUser = await client.query('SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [id]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role_name === 'admin') {
                await client.query('ROLLBACK');
                return res.status(403).json({ message: 'Quản lý không có quyền chỉnh sửa tài khoản Quản trị viên.' });
            }
        }

        // Logic delete old avatar if changed
        if (avatar_url) {
            const oldUserRes = await client.query('SELECT avatar_url FROM users WHERE id = $1', [id]);
            const oldAvatar = oldUserRes.rows[0]?.avatar_url;
            if (oldAvatar && oldAvatar !== avatar_url && oldAvatar.startsWith('/uploads/')) {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(__dirname, '../public', oldAvatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log(`[USER] Deleted old avatar: ${oldPath}`);
                }
            }
        }

        const updateRes = await client.query(
            `UPDATE users SET full_name = $1, email = $2, role_id = $3, phone = $4, is_active = $5,
             birth_date = $7, gender = $8, id_card = $9, passport_url = $10, id_expiry = $11, address = $12, facebook_url = $13,
             created_at = COALESCE($14, created_at), position = $15, avatar_url = COALESCE($16, avatar_url)
             WHERE id = $6`,
            [full_name, email, role_id, phone || null, is_active !== false, id,
             birth_date || null, gender || null, id_card || null, passport_url || null, id_expiry || null, address || null, facebook_url || null,
             created_at || null, position || null, avatar_url || null]
        );
        
        if (updateRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
        }
        
        // Sync custom permissions if provided
        if (permissions && typeof permissions === 'object') {
            // First, delete existing overrides for this user
            await client.query('DELETE FROM user_permissions WHERE user_id = $1', [id]);
            
            // Insert new overrides
            for (const [moduleName, perms] of Object.entries(permissions)) {
                // Determine if this is actually an override or just matching the default role
                // To keep it simple, we save it directly if it was passed from frontend as an override
                await client.query(`
                    INSERT INTO user_permissions (user_id, module_name, can_view, can_create, can_edit, can_delete)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [id, moduleName, perms.can_view, perms.can_create, perms.can_edit, perms.can_delete]);
            }
        }

        await client.query('COMMIT');

        // Ghi Audit Log khi thay đổi quyền / thông tin nhân sự
        logActivity({
            user_id: req.user.id,
            action_type: 'UPDATE',
            entity_type: 'USER',
            entity_id: parseInt(id),
            details: `Admin/Manager cập nhật thông tin nhân sự #${id} (role_id: ${role_id}, is_active: ${is_active})`,
            new_data: JSON.stringify({ full_name, email, role_id, phone, is_active, permissions: permissions ? Object.keys(permissions) : [] })
        });

        res.json({ message: 'Cập nhật nhân viên thành công.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Lỗi cập nhật user:", err.message);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.changePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        // Password policy: tối thiểu 6 ký tự
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }

        const isAdmin = req.user.role === 'admin';
        const isManager = req.user.role === 'manager';
        const isSelf = req.user.id === parseInt(id);

        // Check team manager permission
        let isTeamMgr = false;
        if (!isAdmin && !isManager && !isSelf) {
            isTeamMgr = await isInManagedTeam(req.user.id, parseInt(id));
        }

        if (!isAdmin && !isManager && !isSelf && !isTeamMgr) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
        }

        // Safeguard: Managers/Team leads cannot change Admin password
        if (!isAdmin) {
            const targetUser = await db.query('SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [id]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role_name === 'admin') {
                return res.status(403).json({ message: 'Không có quyền đổi mật khẩu của Quản trị viên.' });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        res.json({ message: 'Đổi mật khẩu thành công.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Don't allow deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình.' });
        }

        // Safeguard: Managers cannot delete Admins
        if (req.user.role === 'manager') {
            const targetUser = await db.query('SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [id]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role_name === 'admin') {
                return res.status(403).json({ message: 'Quản lý không có quyền xóa tài khoản Quản trị viên.' });
            }
        }

        // Soft-delete: vô hiệu hóa tài khoản thay vì xóa cứng (tránh lỗi FK constraint)
        await db.query('UPDATE users SET is_active = false WHERE id = $1', [id]);

        logActivity({
            user_id: req.user.id,
            action_type: 'DELETE',
            entity_type: 'USER',
            entity_id: parseInt(id),
            details: `Vô hiệu hóa tài khoản nhân sự #${id}`
        });

        res.json({ message: 'Đã vô hiệu hóa nhân viên thành công. Tài khoản sẽ không thể đăng nhập.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === TEAM MANAGEMENT ENDPOINTS ===

exports.getTeams = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.*, 
                   (SELECT COUNT(*)::int FROM team_members tmb WHERE tmb.team_id = t.id) as member_count,
                   COALESCE(
                       (SELECT json_agg(json_build_object('id', mgr.id, 'full_name', mgr.full_name))
                        FROM team_managers tm JOIN users mgr ON tm.user_id = mgr.id
                        WHERE tm.team_id = t.id), '[]'::json
                   ) as managers
            FROM teams t
            ORDER BY t.name
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const result = await db.query(`
            SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active,
                   r.name as role_name,
                   EXISTS(SELECT 1 FROM team_managers tm WHERE tm.user_id = u.id AND tm.team_id = $1) as is_manager
            FROM team_members tmb
            JOIN users u ON tmb.user_id = u.id
            JOIN roles r ON u.role_id = r.id
            WHERE tmb.team_id = $1
            ORDER BY is_manager DESC, u.full_name ASC
        `, [teamId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTeam = async (req, res) => {
    try {
        const { name, code, description } = req.body;
        if (!name || !code) return res.status(400).json({ message: 'Tên và mã team là bắt buộc.' });
        
        const exists = await db.query('SELECT id FROM teams WHERE code = $1', [code.toUpperCase()]);
        if (exists.rows.length > 0) return res.status(409).json({ message: 'Mã team đã tồn tại.' });
        
        const result = await db.query(
            'INSERT INTO teams (name, code, description) VALUES ($1, $2, $3) RETURNING *',
            [name, code.toUpperCase(), description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const result = await db.query(
            'UPDATE teams SET name = COALESCE($1, name), description = $2 WHERE id = $3 RETURNING *',
            [name, description || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Team không tồn tại.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const memberCount = await db.query('SELECT COUNT(*)::int as c FROM team_members WHERE team_id = $1', [id]);
        if (memberCount.rows[0].c > 0) {
            return res.status(409).json({ message: `Team có ${memberCount.rows[0].c} thành viên. Vui lòng chuyển hết thành viên trước khi xóa.` });
        }
        await db.query('DELETE FROM teams WHERE id = $1', [id]);
        res.json({ message: 'Đã xóa team.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;
        await db.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT (team_id, user_id) DO NOTHING',
            [teamId, userId]
        );
        res.json({ message: 'Đã thêm thành viên vào team.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removeTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        // Also remove from managers if exists
        await db.query('DELETE FROM team_managers WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
        await db.query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
        res.json({ message: 'Đã xóa thành viên khỏi team.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.setTeamManager = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId } = req.body;
        // Ensure user is a member first
        await db.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [teamId, userId]
        );
        await db.query(
            'INSERT INTO team_managers (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [teamId, userId]
        );
        res.json({ message: 'Đã gán trưởng nhóm.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.removeTeamManager = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        await db.query('DELETE FROM team_managers WHERE team_id = $1 AND user_id = $2', [teamId, userId]);
        res.json({ message: 'Đã gỡ quyền trưởng nhóm.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllowedRoles = async (req, res) => {
    try {
        const roles = await getAllowedRolesForManager(req.user.id);
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SELF PROFILE ENDPOINTS ===

exports.getMyProfile = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, u.created_at,
                   u.birth_date, u.gender, u.id_card, u.passport_url, u.id_expiry, u.address, u.facebook_url,
                   u.position, u.avatar_url,
                   r.name as role_name, r.id as role_id,
                   COALESCE(
                       (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'code', t.code) ORDER BY t.name)
                        FROM team_members tmb JOIN teams t ON tmb.team_id = t.id
                        WHERE tmb.user_id = u.id), '[]'::json
                   ) as teams
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = $1
        `, [req.user.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        // Don't expose password
        const user = result.rows[0];
        delete user.password;
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const { full_name, email, phone, birth_date, gender, id_card, passport_url, id_expiry, address, facebook_url, created_at, position, avatar_url } = req.body;
        
        // Handle old avatar deletion
        if (avatar_url) {
            const oldUserRes = await db.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
            const oldAvatar = oldUserRes.rows[0]?.avatar_url;
            if (oldAvatar && oldAvatar !== avatar_url && oldAvatar.startsWith('/uploads/')) {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(__dirname, '../public', oldAvatar);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log(`[USER] Deleted old avatar: ${oldPath}`);
                }
            }
        }

        await db.query(`
            UPDATE users SET 
                full_name = COALESCE($1, full_name), 
                email = $2, phone = $3,
                birth_date = $4, gender = $5, id_card = $6, 
                passport_url = $7, id_expiry = $8, address = $9, facebook_url = $10,
                created_at = COALESCE($12, created_at),
                position = $13,
                avatar_url = COALESCE($14, avatar_url),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
        `, [
            full_name, email || null, phone || null,
            birth_date || null, gender || null, id_card || null,
            passport_url || null, id_expiry || null, address || null, facebook_url || null,
            req.user.id, created_at || null, position || null, avatar_url || null
        ]);
        
        res.json({ message: 'Cập nhật hồ sơ cá nhân thành công.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
