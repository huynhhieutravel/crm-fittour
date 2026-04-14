/**
 * Migration: Thêm permissions cho module Marketing Ads + Management Dashboard
 * 
 * Module: marketing_ads (Quản trị chiến dịch quảng cáo)
 *   - view: Xem dữ liệu quảng cáo
 *   - create: Upload / thêm dữ liệu quảng cáo
 *   - edit: Sửa dữ liệu (BU, chi tiêu, KPI...)
 *   - delete: Xóa dữ liệu quảng cáo
 *   - manage_kpi: Quản lý KPI (thiết lập mục tiêu theo BU/tháng)
 * 
 * Module: marketing_dashboard (Tổng quan Marketing - biểu đồ)
 *   - view: Xem Dashboard tổng quan
 * 
 * Tạm thời grant ALL cho tất cả role hiện tại (mở cho mọi người coi).
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
            // marketing_ads
            { module: 'marketing_ads', action: 'view',       label_vi: 'Xem dữ liệu quảng cáo',       group_vi: 'Marketing & Sales', sort_order: 120 },
            { module: 'marketing_ads', action: 'create',     label_vi: 'Upload / thêm báo cáo QC',     group_vi: 'Marketing & Sales', sort_order: 121 },
            { module: 'marketing_ads', action: 'edit',       label_vi: 'Sửa dữ liệu quảng cáo',       group_vi: 'Marketing & Sales', sort_order: 122 },
            { module: 'marketing_ads', action: 'delete',     label_vi: 'Xóa dữ liệu quảng cáo',       group_vi: 'Marketing & Sales', sort_order: 123 },
            { module: 'marketing_ads', action: 'manage_kpi', label_vi: 'Thiết lập KPI Marketing',      group_vi: 'Marketing & Sales', sort_order: 124 },
            // marketing_dashboard
            { module: 'marketing_dashboard', action: 'view', label_vi: 'Xem Tổng quan Marketing',      group_vi: 'Marketing & Sales', sort_order: 125 },
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

        // Phase 2: Grant ALL marketing permissions to ALL existing roles (tạm thời mở cho tất cả)
        console.log('=== Phase 2: Grant marketing permissions to ALL roles ===');
        
        const rolesRes = await client.query('SELECT id, name FROM roles ORDER BY id');
        const newPermsRes = await client.query(
            `SELECT id, module, action FROM permissions_master WHERE module IN ('marketing_ads', 'marketing_dashboard')`
        );
        
        let grantedCount = 0;
        for (const role of rolesRes.rows) {
            for (const perm of newPermsRes.rows) {
                const insertRes = await client.query(
                    `INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                     VALUES ($1, $2, true)
                     ON CONFLICT (role_id, permission_id) DO NOTHING
                     RETURNING id`,
                    [role.id, perm.id]
                );
                if (insertRes.rows.length > 0) grantedCount++;
            }
            console.log(`  ✅ Role "${role.name}" (id=${role.id}): granted ${newPermsRes.rows.length} permissions`);
        }
        console.log(`\nTotal grants inserted: ${grantedCount}`);

        await client.query('COMMIT');
        console.log('\n🎉 Migration marketing permissions completed successfully!');
        
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
