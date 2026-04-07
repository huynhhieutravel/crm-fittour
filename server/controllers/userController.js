const db = require('../db');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../utils/logger');

exports.getAllUsers = async (req, res) => {
    try {
        const usersRes = await db.query(`
            SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.name as role_name, r.id as role_id 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            ORDER BY u.full_name ASC
        `);
        
        const rolePermsRes = await db.query('SELECT * FROM role_permissions');
        const userPermsRes = await db.query('SELECT * FROM user_permissions');

        // Map users and attach merged permissions
        const usersWithPerms = usersRes.rows.map(user => {
            const myOverrides = userPermsRes.rows.filter(p => p.user_id === user.id);
            const myDefaultRolePerms = rolePermsRes.rows.filter(p => p.role_id === user.role_id);
            
            // Generate matrix
            const modules = [
                'leads', 'tours', 'departures', 'guides', 'customers', 'bookings', 'users', 'settings', 
                'b2b_companies', 'group_leaders', 'group_projects', 'op_tours'
            ];
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
            
            return {
                ...user,
                permissions: mergedPermissions
            };
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
    const { username, password, full_name, email, role_id, phone, is_active } = req.body;
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

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password, full_name, email, role_id, phone, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [username, hashedPassword, full_name, email, role_id, phone || null, is_active !== false]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Thêm nhân viên thành công.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, role_id, phone, is_active, permissions } = req.body;
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

        await client.query(
            'UPDATE users SET full_name = $1, email = $2, role_id = $3, phone = $4, is_active = $5 WHERE id = $6',
            [full_name, email, role_id, phone || null, is_active !== false, id]
        );
        
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

        // Kiểm tra quyền (phải là Admin/Manager hoặc chính chủ)
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
        }

        // Safeguard: Managers cannot change Admin password
        if (req.user.role === 'manager') {
            const targetUser = await db.query('SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [id]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role_name === 'admin') {
                return res.status(403).json({ message: 'Quản lý không có quyền đổi mật khẩu của Quản trị viên.' });
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
