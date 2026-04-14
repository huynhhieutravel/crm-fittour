/**
 * Migration: Thêm permissions cho module Dịch vụ Hỗ trợ (travel_support)
 * 
 * Quyền:
 * - view: Xem danh sách
 * - create: Thêm mới
 * - edit: Chỉnh sửa
 * - delete: Xóa
 * - unlock: Mở khóa vé đã Tất toán/Hủy (Quyền đặc biệt cho Admin, Quản lý, Kế toán)
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Phase 1: Insert permissions_master entries ===');
        
        const permissions = [
            { module: 'travel_support', action: 'view',   label_vi: 'Xem danh sách',       group_vi: 'Nghiệp vụ cốt lõi', sort_order: 810 },
            { module: 'travel_support', action: 'create', label_vi: 'Thêm dịch vụ hỗ trợ', group_vi: 'Nghiệp vụ cốt lõi', sort_order: 811 },
            { module: 'travel_support', action: 'edit',   label_vi: 'Sửa dịch vụ hỗ trợ',  group_vi: 'Nghiệp vụ cốt lõi', sort_order: 812 },
            { module: 'travel_support', action: 'delete', label_vi: 'Xóa dịch vụ hỗ trợ',  group_vi: 'Nghiệp vụ cốt lõi', sort_order: 813 },
            { module: 'travel_support', action: 'unlock', label_vi: 'Mở khóa Tất toán/Hủy', group_vi: 'Nghiệp vụ cốt lõi', sort_order: 814 }
        ];

        let insertedCount = 0;
        for (const p of permissions) {
            const result = await client.query(
                `INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT DO NOTHING
                 RETURNING id`,
                [p.module, p.action, p.label_vi, p.group_vi, p.sort_order]
            );
            if (result.rows.length > 0) {
                insertedCount++;
                console.log(`  ✅ ${p.module}.${p.action} (id=${result.rows[0].id})`);
            } else {
                console.log(`  ⏩ ${p.module}.${p.action} already exists, skipping`);
            }
        }
        console.log(`Inserted ${insertedCount} new permissions.\n`);

        // Phase 2: Grant permissions
        console.log('=== Phase 2: Grant permissions to roles ===');
        
        const rolesRes = await client.query('SELECT id, name FROM roles ORDER BY id');
        const newPermsRes = await client.query(
            `SELECT id, module, action FROM permissions_master WHERE module = 'travel_support'`
        );
        
        let grantedCount = 0;
        for (const role of rolesRes.rows) {
            const roleNameLower = (role.name || '').toLowerCase();
            
            // "Kế toán" / "Accountant", "Manager", "Admin" get full permissions (including unlock)
            const isPrivileged = roleNameLower.includes('quản lý') || roleNameLower.includes('manager') || 
                                 roleNameLower.includes('kế toán') || roleNameLower.includes('accountant') ||
                                 roleNameLower.includes('admin') || roleNameLower.includes('giám đốc') ||
                                 roleNameLower.includes('operations');
                                 
            for (const perm of newPermsRes.rows) {
                // If it's 'unlock', only grant to Privileged
                // Else grant standard view, create, edit, delete to everyone
                let grantIt = false;
                if (perm.action === 'unlock') {
                    if (isPrivileged) grantIt = true;
                } else {
                    grantIt = true;
                }

                if (grantIt) {
                    const insertRes = await client.query(
                        `INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                         VALUES ($1, $2, true)
                         ON CONFLICT (role_id, permission_id) DO NOTHING
                         RETURNING id`,
                        [role.id, perm.id]
                    );
                    if (insertRes.rows.length > 0) grantedCount++;
                }
            }
            console.log(`  ✅ Role "${role.name}" (id=${role.id}): Configured permissions for travel_support. Privileged: ${isPrivileged}`);
        }
        console.log(`\nTotal grants inserted: ${grantedCount}`);

        await client.query('COMMIT');
        console.log('\n🎉 Migration travel_support permissions completed successfully!');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(() => process.exit(1));
