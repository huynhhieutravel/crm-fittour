/**
 * permCheck middleware — Kiểm tra quyền dựa trên DB (permissions_master + role_permissions_v2 + user_permissions_v2)
 * 
 * Thay thế roleCheck.js hoàn toàn.
 * 
 * Logic merge quyền:
 *   1. Admin bypass → luôn cho phép
 *   2. user_permissions_v2 (override cá nhân) → ưu tiên cao nhất
 *   3. role_permissions_v2 (mặc định role) → fallback
 *   4. Nếu v2 không có data → fallback đọc v1 (role_permissions cũ) → an toàn 100%
 */

const db = require('../db');

// Cache permissions_master để không query DB mỗi request
let permMasterCache = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

async function getPermMaster() {
    const now = Date.now();
    if (permMasterCache && now < cacheExpiry) return permMasterCache;
    
    const res = await db.query('SELECT id, module, action FROM permissions_master');
    permMasterCache = res.rows;
    cacheExpiry = now + CACHE_TTL;
    return permMasterCache;
}

// Invalidate cache khi admin thay đổi quyền
function invalidateCache() {
    permMasterCache = null;
    cacheExpiry = 0;
}

/**
 * Middleware factory: permCheck('op_tours', 'view_all')
 * Kiểm tra user hiện tại có quyền (module, action) hay không
 */
const permCheck = (module, action) => {
    return async (req, res, next) => {
        try {
            // 1. Admin bypass
            if (req.user && req.user.role === 'admin') {
                return next();
            }

            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Chưa đăng nhập.' });
            }

            // 2. Tìm permission_id từ master
            const master = await getPermMaster();
            const perm = master.find(p => p.module === module && p.action === action);
            
            if (!perm) {
                // Quyền chưa tồn tại trong master → fallback v1
                console.warn(`[permCheck] WARN: Permission '${module}.${action}' not found in master — falling back to v1`);
                return fallbackV1(req, res, next, module, action);
            }

            // 3. Check user_permissions_v2 (override cá nhân, ưu tiên cao nhất)
            const userOverride = await db.query(
                'SELECT granted FROM user_permissions_v2 WHERE user_id = $1 AND permission_id = $2',
                [req.user.id, perm.id]
            );
            
            if (userOverride.rows.length > 0) {
                if (userOverride.rows[0].granted) return next();
                return res.status(403).json({ 
                    message: `Bạn không có quyền: ${module}.${action}` 
                });
            }

            // 4. Check role_permissions_v2 (mặc định role)
            // Lấy role_id từ DB (không hardcode)
            const userRoleRes = await db.query(
                'SELECT role_id FROM users WHERE id = $1', 
                [req.user.id]
            );
            
            if (userRoleRes.rows.length === 0) {
                return res.status(403).json({ message: 'Không tìm thấy tài khoản.' });
            }
            
            const roleId = userRoleRes.rows[0].role_id;
            
            const roleDefault = await db.query(
                'SELECT granted FROM role_permissions_v2 WHERE role_id = $1 AND permission_id = $2',
                [roleId, perm.id]
            );
            
            if (roleDefault.rows.length > 0 && roleDefault.rows[0].granted) {
                return next();
            }

            // 5. Không có quyền
            return res.status(403).json({ 
                message: `Bạn không có quyền thực hiện thao tác này (${module}.${action}).` 
            });

        } catch (err) {
            console.error('[permCheck] Error:', err.message);
            // Lỗi DB → fallback v1 để không block user
            return fallbackV1(req, res, next, module, action);
        }
    };
};

/**
 * Fallback: Đọc bảng v1 cũ (role_permissions) nếu v2 chưa có data hoặc lỗi
 * Đảm bảo hệ thống KHÔNG bị gián đoạn khi chuyển đổi
 */
async function fallbackV1(req, res, next, module, action) {
    try {
        // Map action mới → cột v1 cũ
        const actionToV1Column = {
            'view': 'can_view', 'view_all': 'can_view', 'view_own': 'can_view',
            'create': 'can_create', 
            'edit': 'can_edit', 'edit_own': 'can_edit', 'edit_all': 'can_edit',
            'delete': 'can_delete',
            // Các quyền mới không có trong v1 → mặc định cho admin/manager
            'approve': null, 'export': null, 'assign': null, 
            'transfer': null, 'view_sensitive': null, 'clone': null,
            'cancel': null, 'reply': null, 'change_permissions': null,
        };
        
        const v1Column = actionToV1Column[action];
        
        if (!v1Column) {
            // Quyền mới chưa có trong v1 → chỉ cho admin/manager
            if (req.user.role === 'admin' || req.user.role === 'manager') {
                return next();
            }
            return res.status(403).json({ 
                message: `Bạn không có quyền: ${module}.${action}` 
            });
        }

        // Đọc từ bảng v1 cũ
        const result = await db.query(
            `SELECT ${v1Column} FROM role_permissions rp 
             JOIN users u ON u.role_id = rp.role_id 
             WHERE u.id = $1 AND rp.module_name = $2`,
            [req.user.id, module]
        );
        
        if (result.rows.length > 0 && result.rows[0][v1Column]) {
            return next();
        }

        // Check user_permissions v1
        const userResult = await db.query(
            `SELECT ${v1Column} FROM user_permissions 
             WHERE user_id = $1 AND module_name = $2`,
            [req.user.id, module]
        );
        
        if (userResult.rows.length > 0 && userResult.rows[0][v1Column]) {
            return next();
        }

        return res.status(403).json({ 
            message: `Bạn không có quyền thực hiện thao tác này.` 
        });
        
    } catch (err) {
        console.error('[permCheck fallbackV1] Error:', err.message);
        return res.status(500).json({ message: 'Lỗi kiểm tra quyền.' });
    }
}

/**
 * permCheckAny — Cho phép nếu user có BẤT KỲ quyền nào trong danh sách
 * Ví dụ: permCheckAny([['leads','view_all'], ['leads','view_own']])
 */
const permCheckAny = (permPairs) => {
    return async (req, res, next) => {
        if (req.user && req.user.role === 'admin') return next();
        
        for (const [mod, act] of permPairs) {
            try {
                const master = await getPermMaster();
                const perm = master.find(p => p.module === mod && p.action === act);
                if (!perm) continue;

                // Check user override
                const userOverride = await db.query(
                    'SELECT granted FROM user_permissions_v2 WHERE user_id = $1 AND permission_id = $2',
                    [req.user.id, perm.id]
                );
                if (userOverride.rows.length > 0 && userOverride.rows[0].granted) return next();

                // Check role default
                const userRoleRes = await db.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
                if (userRoleRes.rows.length === 0) continue;
                
                const roleDefault = await db.query(
                    'SELECT granted FROM role_permissions_v2 WHERE role_id = $1 AND permission_id = $2',
                    [userRoleRes.rows[0].role_id, perm.id]
                );
                if (roleDefault.rows.length > 0 && roleDefault.rows[0].granted) return next();
            } catch (e) { continue; }
        }

        return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    };
};

/**
 * getUserMergedPerms — Trả về object { module: { action: true/false } } 
 * cho 1 user. Dùng trong controller để xác định scope (view_all / view_team / view_own).
 */
async function getUserMergedPerms(userId, roleName) {
    // Admin → full
    if (roleName === 'admin') {
        const master = await getPermMaster();
        const result = {};
        master.forEach(p => {
            if (!result[p.module]) result[p.module] = {};
            result[p.module][p.action] = true;
        });
        return result;
    }

    const userRoleRes = await db.query('SELECT role_id FROM users WHERE id = $1', [userId]);
    if (userRoleRes.rows.length === 0) return {};
    const roleId = userRoleRes.rows[0].role_id;

    const merged = await db.query(
        `SELECT pm.module, pm.action,
                COALESCE(upv2.granted, rpv2.granted, false) as granted
         FROM permissions_master pm
         LEFT JOIN role_permissions_v2 rpv2 ON rpv2.permission_id = pm.id AND rpv2.role_id = $1
         LEFT JOIN user_permissions_v2 upv2 ON upv2.permission_id = pm.id AND upv2.user_id = $2`,
        [roleId, userId]
    );

    const result = {};
    merged.rows.forEach(row => {
        if (!result[row.module]) result[row.module] = {};
        result[row.module][row.action] = row.granted;
    });
    return result;
}

/**
 * permCheckOrOwner — Cho phép nếu user có quyền HOẶC là người tạo/sở hữu record
 * 
 * Dùng cho PUT/DELETE routes:
 *   permCheckOrOwner('hotels', 'edit', 'hotels', 'id')
 *
 * @param {string} module  — tên module trong permissions_master
 * @param {string} action  — tên action (edit, delete)  
 * @param {string} table   — tên bảng DB để query
 * @param {string} paramKey — tên param trong req.params chứa ID (mặc định 'id')
 * @param {string} ownerColumn — cột dùng để xác định sở hữu (mặc định 'created_by')
 */
const permCheckOrOwner = (module, action, table, paramKey = 'id', ownerColumn = 'created_by') => {
    return async (req, res, next) => {
        try {
            // 1. Admin bypass
            if (req.user && req.user.role === 'admin') return next();

            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Chưa đăng nhập.' });
            }

            // 2. Check global permission first (same logic as permCheck)
            let hasGlobalPerm = false;
            try {
                const master = await getPermMaster();
                const perm = master.find(p => p.module === module && p.action === action);
                
                if (perm) {
                    // Check user override
                    const userOverride = await db.query(
                        'SELECT granted FROM user_permissions_v2 WHERE user_id = $1 AND permission_id = $2',
                        [req.user.id, perm.id]
                    );
                    if (userOverride.rows.length > 0) {
                        hasGlobalPerm = userOverride.rows[0].granted;
                    } else {
                        // Check role default
                        const userRoleRes = await db.query('SELECT role_id FROM users WHERE id = $1', [req.user.id]);
                        if (userRoleRes.rows.length > 0) {
                            const roleDefault = await db.query(
                                'SELECT granted FROM role_permissions_v2 WHERE role_id = $1 AND permission_id = $2',
                                [userRoleRes.rows[0].role_id, perm.id]
                            );
                            hasGlobalPerm = roleDefault.rows.length > 0 && roleDefault.rows[0].granted;
                        }
                    }
                }
            } catch (e) {
                // If v2 fails, try v1 silently
            }

            if (hasGlobalPerm) return next();

            // 3. No global perm → Check if user is the creator (ownership bypass)
            const entityId = req.params[paramKey];
            if (!entityId) {
                return res.status(403).json({ message: `Bạn không có quyền: ${module}.${action}` });
            }

            // Sanitize table name to prevent SQL injection (whitelist)
            const ALLOWED_TABLES = [
                'tour_templates', 'tour_departures', 'hotels', 'restaurants', 
                'transports', 'airlines', 'tickets', 'landtours', 'insurances', 
                'visas', 'group_projects', 'group_leaders', 'b2b_companies',
                'bookings', 'leads', 'guides', 'vouchers', 'payment_vouchers',
                'customers'
            ];
            if (!ALLOWED_TABLES.includes(table)) {
                return res.status(403).json({ message: `Bạn không có quyền: ${module}.${action}` });
            }
            
            // Validate ownerColumn to prevent SQL injection
            const ALLOWED_OWNER_COLUMNS = ['created_by', 'assigned_to', 'sale_id', 'operator_id'];
            if (!ALLOWED_OWNER_COLUMNS.includes(ownerColumn)) {
                return res.status(400).json({ message: 'Invalid owner column configuration' });
            }

            const ownerRes = await db.query(
                `SELECT ${ownerColumn} FROM ${table} WHERE id = $1`, [entityId]
            );

            if (ownerRes.rows.length > 0 && ownerRes.rows[0][ownerColumn] === req.user.id) {
                return next(); // Creator can edit/delete own record
            }

            // 4. Not owner, not authorized
            return res.status(403).json({
                message: `Bạn không có quyền ${action === 'delete' ? 'xóa' : 'chỉnh sửa'} mục này. Chỉ người tạo hoặc quản lý mới có thể thao tác.`
            });

        } catch (err) {
            console.error('[permCheckOrOwner] Error:', err.message);
            return res.status(500).json({ message: 'Lỗi kiểm tra quyền.' });
        }
    };
};

module.exports = permCheck;
module.exports.permCheck = permCheck;
module.exports.permCheckAny = permCheckAny;
module.exports.permCheckOrOwner = permCheckOrOwner;
module.exports.invalidateCache = invalidateCache;
module.exports.getUserMergedPerms = getUserMergedPerms;
