/**
 * Migration: Thêm role group_operations + group_operations_lead
 * 
 * - group_operations_lead: sv1.sale — full quyền (tương tự admin trong scope MICE)
 * - group_operations: sv2.sale, sv3.sale — Điều hành Đoàn
 */
require('dotenv').config();
const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Tạo 2 roles mới
        const r1 = await client.query(
            "INSERT INTO roles (name) VALUES ('group_operations') ON CONFLICT DO NOTHING RETURNING id"
        );
        const r2 = await client.query(
            "INSERT INTO roles (name) VALUES ('group_operations_lead') ON CONFLICT DO NOTHING RETURNING id"
        );

        let groupOpsId, groupOpsLeadId;

        if (r1.rows.length > 0) {
            groupOpsId = r1.rows[0].id;
        } else {
            const existing = await client.query("SELECT id FROM roles WHERE name = 'group_operations'");
            groupOpsId = existing.rows[0].id;
        }

        if (r2.rows.length > 0) {
            groupOpsLeadId = r2.rows[0].id;
        } else {
            const existing = await client.query("SELECT id FROM roles WHERE name = 'group_operations_lead'");
            groupOpsLeadId = existing.rows[0].id;
        }

        console.log(`✅ group_operations role_id = ${groupOpsId}`);
        console.log(`✅ group_operations_lead role_id = ${groupOpsLeadId}`);

        // 2. Lấy toàn bộ permissions_master
        const allPerms = await client.query('SELECT id, module, action FROM permissions_master');

        // 3. group_operations_lead → FULL quyền (tất cả permissions = true)
        for (const perm of allPerms.rows) {
            await client.query(
                `INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                 VALUES ($1, $2, true)
                 ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true`,
                [groupOpsLeadId, perm.id]
            );
        }
        console.log(`✅ group_operations_lead: Đã cấp FULL ${allPerms.rows.length} quyền`);

        // 4. group_operations → copy từ operations (role_id=4) + thêm group_projects, group_leaders, b2b
        const opsPerms = await client.query(
            'SELECT permission_id, granted FROM role_permissions_v2 WHERE role_id = 4'
        );
        
        for (const rp of opsPerms.rows) {
            await client.query(
                `INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = $3`,
                [groupOpsId, rp.permission_id, rp.granted]
            );
        }
        console.log(`✅ group_operations: Đã copy ${opsPerms.rows.length} quyền từ operations`);

        // Thêm quyền MICE-specific cho group_operations
        const miceModules = [
            { module: 'group_projects', actions: ['view', 'view_own', 'create', 'edit', 'edit_own', 'view_profit', 'view_dashboard'] },
            { module: 'group_leaders', actions: ['view', 'view_own', 'create', 'edit', 'edit_own'] },
            { module: 'b2b_companies', actions: ['view', 'view_own', 'create', 'edit'] },
        ];

        for (const mod of miceModules) {
            for (const action of mod.actions) {
                const perm = allPerms.rows.find(p => p.module === mod.module && p.action === action);
                if (perm) {
                    await client.query(
                        `INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                         VALUES ($1, $2, true)
                         ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = true`,
                        [groupOpsId, perm.id]
                    );
                    console.log(`  + group_operations: ${mod.module}.${action} ✓`);
                }
            }
        }

        // 5. Gán user vào role mới
        // sv1.sale (id=33) → group_operations_lead
        await client.query('UPDATE users SET role_id = $1 WHERE username = $2', [groupOpsLeadId, 'sv1.sale']);
        console.log(`✅ sv1.sale → group_operations_lead (role_id=${groupOpsLeadId})`);

        // sv2.sale (id=34) → group_operations
        await client.query('UPDATE users SET role_id = $1 WHERE username = $2', [groupOpsId, 'sv2.sale']);
        console.log(`✅ sv2.sale → group_operations (role_id=${groupOpsId})`);

        // sv3.sale (id=35) → group_operations
        await client.query('UPDATE users SET role_id = $1 WHERE username = $2', [groupOpsId, 'sv3.sale']);
        console.log(`✅ sv3.sale → group_operations (role_id=${groupOpsId})`);

        await client.query('COMMIT');
        console.log('\n🎉 Migration hoàn tất!');

        // Verify
        const verify = await client.query(
            "SELECT u.username, r.name as role_name, u.role_id FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username IN ('sv1.sale','sv2.sale','sv3.sale') ORDER BY u.username"
        );
        console.log('\n=== VERIFY ===');
        console.table(verify.rows);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration FAILED:', err.message);
        throw err;
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
