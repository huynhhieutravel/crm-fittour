const db = require('../db');
const { invalidateCache } = require('../middleware/permCheck');

/**
 * GET /api/permissions/master
 * Trả về danh mục tất cả quyền, nhóm theo group_vi
 */
exports.getMaster = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, module, action, label_vi, group_vi, sort_order FROM permissions_master ORDER BY sort_order, module, action'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/permissions/role/:roleId
 * Trả về quyền mặc định của 1 role
 */
exports.getRolePermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const result = await db.query(
            `SELECT pm.id as permission_id, pm.module, pm.action, pm.label_vi, pm.group_vi, 
                    COALESCE(rpv2.granted, false) as granted
             FROM permissions_master pm
             LEFT JOIN role_permissions_v2 rpv2 ON rpv2.permission_id = pm.id AND rpv2.role_id = $1
             ORDER BY pm.sort_order, pm.module, pm.action`,
            [roleId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * PUT /api/permissions/role/:roleId
 * Admin cập nhật toàn bộ quyền mặc định cho 1 role
 * Body: { permissions: [{ permission_id: 1, granted: true }, ...] }
 */
exports.updateRolePermissions = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;
        
        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: 'permissions phải là mảng.' });
        }

        await client.query('BEGIN');
        
        // Xóa tất cả quyền cũ của role
        await client.query('DELETE FROM role_permissions_v2 WHERE role_id = $1', [roleId]);
        
        // Insert lại quyền mới (chỉ những granted = true)
        for (const p of permissions) {
            if (p.granted) {
                await client.query(
                    'INSERT INTO role_permissions_v2 (role_id, permission_id, granted) VALUES ($1, $2, true)',
                    [roleId, p.permission_id]
                );
            }
        }
        
        await client.query('COMMIT');
        invalidateCache();
        
        res.json({ message: 'Cập nhật quyền role thành công.' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

/**
 * GET /api/permissions/user/:userId
 * Trả về quyền override cá nhân
 */
exports.getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Lấy role_id
        const userRes = await db.query('SELECT role_id FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại.' });
        }
        const roleId = userRes.rows[0].role_id;

        const result = await db.query(
            `SELECT pm.id as permission_id, pm.module, pm.action, pm.label_vi, pm.group_vi,
                    COALESCE(rpv2.granted, false) as role_default,
                    upv2.granted as user_override
             FROM permissions_master pm
             LEFT JOIN role_permissions_v2 rpv2 ON rpv2.permission_id = pm.id AND rpv2.role_id = $1
             LEFT JOIN user_permissions_v2 upv2 ON upv2.permission_id = pm.id AND upv2.user_id = $2
             ORDER BY pm.sort_order, pm.module, pm.action`,
            [roleId, userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * PUT /api/permissions/user/:userId
 * Admin cập nhật override quyền cho 1 user
 * Body: { overrides: [{ permission_id: 1, granted: true/false }, ...] }
 * Chỉ lưu những quyền CÓ override (khác role mặc định)
 */
exports.updateUserPermissions = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { userId } = req.params;
        const { overrides } = req.body;
        
        if (!Array.isArray(overrides)) {
            return res.status(400).json({ message: 'overrides phải là mảng.' });
        }

        await client.query('BEGIN');
        
        // Xóa tất cả override cũ
        await client.query('DELETE FROM user_permissions_v2 WHERE user_id = $1', [userId]);
        
        // Insert override mới (chỉ những có giá trị khác null)
        for (const o of overrides) {
            if (o.granted !== null && o.granted !== undefined) {
                await client.query(
                    'INSERT INTO user_permissions_v2 (user_id, permission_id, granted) VALUES ($1, $2, $3) ON CONFLICT (user_id, permission_id) DO UPDATE SET granted = $3',
                    [userId, o.permission_id, o.granted]
                );
            }
        }
        
        await client.query('COMMIT');
        invalidateCache();
        
        res.json({ message: 'Cập nhật quyền cá nhân thành công.' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

/**
 * GET /api/permissions/my
 * Trả về quyền cuối cùng (merged) của user đang đăng nhập
 * Dùng cho frontend hook usePermissions()
 */
exports.getMyPermissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const roleName = req.user.role;
        
        // Admin → full quyền
        if (roleName === 'admin') {
            const allPerms = await db.query('SELECT module, action FROM permissions_master');
            const result = {};
            allPerms.rows.forEach(p => {
                if (!result[p.module]) result[p.module] = {};
                result[p.module][p.action] = true;
            });
            return res.json({ role: roleName, permissions: result });
        }

        // Lấy role_id + team info
        const userRes = await db.query(`
            SELECT u.role_id, u.team_id, 
                   EXISTS(SELECT 1 FROM team_managers tm WHERE tm.user_id = u.id) as is_team_manager
            FROM users u WHERE u.id = $1
        `, [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại.' });
        }
        const { role_id: roleId, team_id: teamId, is_team_manager: isTeamManager } = userRes.rows[0];

        // Merge: user_override > role_default
        const merged = await db.query(
            `SELECT pm.module, pm.action,
                    COALESCE(upv2.granted, rpv2.granted, false) as granted
             FROM permissions_master pm
             LEFT JOIN role_permissions_v2 rpv2 ON rpv2.permission_id = pm.id AND rpv2.role_id = $1
             LEFT JOIN user_permissions_v2 upv2 ON upv2.permission_id = pm.id AND upv2.user_id = $2
             ORDER BY pm.module, pm.action`,
            [roleId, userId]
        );

        // Chuyển thành object { module: { action: true/false } }
        const result = {};
        merged.rows.forEach(row => {
            if (!result[row.module]) result[row.module] = {};
            result[row.module][row.action] = row.granted;
        });

        res.json({ role: roleName, permissions: result, team_id: teamId, is_team_manager: isTeamManager });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
