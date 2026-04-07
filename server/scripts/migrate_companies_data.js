const db = require('../db');

/**
 * Script migrate dữ liệu: Tạo DN từ data hiện tại
 * 
 * Logic:
 * 1. Đọc company_name từ group_leaders → tạo b2b_companies
 * 2. Đọc name từ group_projects (nơi group_leader_id IS NULL) → tạo thêm DN
 * 3. Gom tên trùng (VIB/VIB BANK, Draeger/Draeger )
 * 4. Link FK: group_leaders.company_id, group_projects.company_id
 */

// Bảng gom tên trùng → tên chuẩn
const MERGE_MAP = {
    'VIB': 'VIB BANK',
    'Ngân hàng VIB': 'VIB BANK', 
    'VIB BANK': 'VIB BANK',
    'Kiểm TOÁN EY': 'KIỂM TOÁN EY',
};

function normalizeName(name) {
    if (!name) return null;
    const trimmed = name.trim();
    return MERGE_MAP[trimmed] || trimmed;
}

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const companyMap = new Map(); // normalized_name → company_id
        
        // ═══ Step 1: Create companies from group_leaders.company_name ═══
        console.log('\n📦 Step 1: Creating companies from group_leaders...');
        const leadersRes = await client.query('SELECT id, company_name, assigned_to, company_founded_date FROM group_leaders WHERE company_name IS NOT NULL');
        
        for (const leader of leadersRes.rows) {
            const companyName = normalizeName(leader.company_name);
            if (!companyName) continue;
            
            if (!companyMap.has(companyName)) {
                const result = await client.query(
                    `INSERT INTO b2b_companies (name, assigned_to, founded_date) VALUES ($1, $2, $3) RETURNING id`,
                    [companyName, leader.assigned_to, leader.company_founded_date || null]
                );
                companyMap.set(companyName, result.rows[0].id);
                console.log(`   ✅ Created company: "${companyName}" (id=${result.rows[0].id})`);
            }
            
            // Link leader to company
            await client.query(
                'UPDATE group_leaders SET company_id = $1, is_primary = true WHERE id = $2',
                [companyMap.get(companyName), leader.id]
            );
        }
        
        // ═══ Step 2: Create companies from orphaned group_projects ═══
        console.log('\n📦 Step 2: Creating companies from orphaned projects...');
        const orphanedRes = await client.query(
            'SELECT DISTINCT name FROM group_projects WHERE group_leader_id IS NULL AND name IS NOT NULL ORDER BY name'
        );
        
        for (const proj of orphanedRes.rows) {
            const companyName = normalizeName(proj.name);
            if (!companyName) continue;
            
            if (!companyMap.has(companyName)) {
                const result = await client.query(
                    `INSERT INTO b2b_companies (name) VALUES ($1) RETURNING id`,
                    [companyName]
                );
                companyMap.set(companyName, result.rows[0].id);
                console.log(`   ✅ Created company (from project): "${companyName}" (id=${result.rows[0].id})`);
            }
        }
        
        // ═══ Step 3: Link ALL group_projects to companies ═══
        console.log('\n🔗 Step 3: Linking projects to companies...');
        const allProjectsRes = await client.query('SELECT id, name, group_leader_id FROM group_projects');
        
        let linked = 0;
        for (const proj of allProjectsRes.rows) {
            let companyId = null;
            
            // If project has a leader, use leader's company
            if (proj.group_leader_id) {
                const leaderRes = await client.query('SELECT company_id FROM group_leaders WHERE id = $1', [proj.group_leader_id]);
                if (leaderRes.rows.length > 0) {
                    companyId = leaderRes.rows[0].company_id;
                }
            }
            
            // If no leader, match by project name
            if (!companyId) {
                const projName = normalizeName(proj.name);
                companyId = companyMap.get(projName) || null;
            }
            
            if (companyId) {
                await client.query('UPDATE group_projects SET company_id = $1 WHERE id = $2', [companyId, proj.id]);
                linked++;
            }
        }
        console.log(`   ✅ Linked ${linked}/${allProjectsRes.rows.length} projects to companies`);
        
        // ═══ Step 4: Link events to companies ═══
        console.log('\n🔗 Step 4: Linking events to companies...');
        await client.query(`
            UPDATE group_leader_events gle
            SET company_id = gl.company_id
            FROM group_leaders gl
            WHERE gle.group_leader_id = gl.id AND gl.company_id IS NOT NULL
        `);
        
        await client.query('COMMIT');
        
        // ═══ Summary ═══
        const countRes = await client.query('SELECT COUNT(*) FROM b2b_companies');
        const linkedProjectsRes = await client.query('SELECT COUNT(*) FROM group_projects WHERE company_id IS NOT NULL');
        const linkedLeadersRes = await client.query('SELECT COUNT(*) FROM group_leaders WHERE company_id IS NOT NULL');
        
        console.log('\n═══════════════════════════════════');
        console.log('✅ DATA MIGRATION COMPLETED!');
        console.log(`   Companies created: ${countRes.rows[0].count}`);
        console.log(`   Leaders linked: ${linkedLeadersRes.rows[0].count}`);
        console.log(`   Projects linked: ${linkedProjectsRes.rows[0].count}`);
        console.log('═══════════════════════════════════\n');
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
