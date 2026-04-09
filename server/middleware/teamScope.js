/**
 * Team Scope Helper (v2 — Many-to-Many)
 * Hỗ trợ 1 user thuộc nhiều team qua bảng team_members.
 * 
 * 3 tầng scope:
 *   - 'all'  → admin/manager, hoặc user có view_all → không giới hạn
 *   - 'team' → user có view_team → chỉ thấy data của members cùng team(s)
 *   - 'own'  → user có view_own  → chỉ thấy data của chính mình
 */
const db = require('../db');

/**
 * Lấy danh sách user IDs thuộc cùng team(s) với userId.
 * Nếu userId là manager → gộp tất cả members từ các team mình quản lý.
 * Nếu userId thuộc nhiều team → gộp members từ tất cả team.
 */
async function getTeamMemberIds(userId) {
    // 1. Lấy tất cả team mà user thuộc về (qua team_members)
    const userTeams = await db.query(
        'SELECT team_id FROM team_members WHERE user_id = $1',
        [userId]
    );

    // 2. Lấy thêm các team mà user quản lý (qua team_managers)
    const managedTeams = await db.query(
        'SELECT team_id FROM team_managers WHERE user_id = $1',
        [userId]
    );

    // 3. Gom tất cả team IDs
    const teamIds = new Set();
    userTeams.rows.forEach(r => teamIds.add(r.team_id));
    managedTeams.rows.forEach(r => teamIds.add(r.team_id));

    if (teamIds.size === 0) return [userId]; // fallback: chỉ mình

    // 4. Lấy toàn bộ user IDs trong các team đó (qua team_members)
    const memberRes = await db.query(
        'SELECT DISTINCT user_id FROM team_members WHERE team_id = ANY($1)',
        [Array.from(teamIds)]
    );

    const ids = memberRes.rows.map(r => r.user_id);
    // Đảm bảo luôn bao gồm chính mình
    if (!ids.includes(userId)) ids.push(userId);
    return ids;
}

/**
 * Xác định scope cho một module dựa trên quyền user.
 * @returns {{ scope: 'all'|'team'|'own'|'none', userIds: number[]|null }}
 */
async function getDataScope(userId, module, userPermissions) {
    const perms = userPermissions?.[module] || {};

    // view_all → toàn bộ
    if (perms.view_all) {
        return { scope: 'all', userIds: null };
    }

    // view (không phân biệt) → coi như all cho modules không có view_all/view_own
    if (perms.view && !perms.view_all && !perms.view_own && !perms.view_team) {
        return { scope: 'all', userIds: null };
    }

    // view_team → lấy team member IDs
    if (perms.view_team) {
        const memberIds = await getTeamMemberIds(userId);
        return { scope: 'team', userIds: memberIds };
    }

    // view_own → chỉ chính mình
    if (perms.view_own) {
        return { scope: 'own', userIds: [userId] };
    }

    // Không có quyền xem
    return { scope: 'none', userIds: [] };
}

/**
 * Kiểm tra xem targetUserId có nằm trong team mà userId quản lý không.
 */
async function isInManagedTeam(managerUserId, targetUserId) {
    const managedTeams = await db.query(
        'SELECT team_id FROM team_managers WHERE user_id = $1',
        [managerUserId]
    );
    if (managedTeams.rows.length === 0) return false;

    const teamIds = managedTeams.rows.map(r => r.team_id);

    const check = await db.query(
        'SELECT user_id FROM team_members WHERE user_id = $1 AND team_id = ANY($2)',
        [targetUserId, teamIds]
    );

    return check.rows.length > 0;
}

/**
 * Lấy danh sách roles mà một team manager được phép assign.
 */
async function getAllowedRolesForManager(managerUserId) {
    const userRes = await db.query(`
        SELECT r.name as role_name FROM users u 
        JOIN roles r ON u.role_id = r.id 
        WHERE u.id = $1
    `, [managerUserId]);

    if (userRes.rows.length === 0) return [];

    const managerRole = userRes.rows[0].role_name;

    const SUBORDINATE_MAP = {
        'admin': null,
        'manager': null,
        'sales_lead': ['sales'],
        'marketing_lead': ['marketing'],
        'operations_lead': ['operations'],
        'group_manager': ['group_staff'],
    };

    const allowed = SUBORDINATE_MAP[managerRole];
    if (allowed === null) {
        const allRoles = await db.query('SELECT id, name FROM roles ORDER BY name');
        return allRoles.rows;
    }
    if (allowed === undefined) {
        return [];
    }

    const roles = await db.query(
        'SELECT id, name FROM roles WHERE name = ANY($1) ORDER BY name',
        [allowed]
    );
    return roles.rows;
}

/**
 * Lấy tất cả teams mà user thuộc về (for frontend display).
 */
async function getUserTeams(userId) {
    const result = await db.query(`
        SELECT t.id, t.name, t.code 
        FROM team_members tmb 
        JOIN teams t ON tmb.team_id = t.id 
        WHERE tmb.user_id = $1
        ORDER BY t.name
    `, [userId]);
    return result.rows;
}

module.exports = {
    getTeamMemberIds,
    getDataScope,
    isInManagedTeam,
    getAllowedRolesForManager,
    getUserTeams
};
