/**
 * Migration: CSKH Module (Chăm Sóc Khách Hàng)
 * Creates: cskh_rules, cskh_tasks, cskh_interaction_logs
 * Safe: IF NOT EXISTS + ON CONFLICT DO NOTHING
 */
const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        console.log('[CSKH Migration] Creating tables...');

        // 1. cskh_rules — Configurable automation rules
        await client.query(`
            CREATE TABLE IF NOT EXISTS cskh_rules (
                id SERIAL PRIMARY KEY,
                rule_name VARCHAR(200) NOT NULL,
                trigger_event VARCHAR(100) NOT NULL,
                offset_days INT NOT NULL DEFAULT 0,
                default_color VARCHAR(20) NOT NULL DEFAULT 'yellow',
                retry_max INT NOT NULL DEFAULT 3,
                retry_interval_days INT NOT NULL DEFAULT 2,
                is_active BOOLEAN NOT NULL DEFAULT true,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('[CSKH Migration] ✓ cskh_rules');

        // 2. cskh_tasks — Task tracking
        await client.query(`
            CREATE TABLE IF NOT EXISTS cskh_tasks (
                id SERIAL PRIMARY KEY,
                customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                rule_id INT REFERENCES cskh_rules(id) ON DELETE SET NULL,
                reference_id INT,
                reference_type VARCHAR(50),
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                priority_color VARCHAR(20) NOT NULL DEFAULT 'yellow',
                due_date DATE NOT NULL,
                retry_count INT NOT NULL DEFAULT 0,
                assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
                title VARCHAR(300),
                description TEXT,
                resolved_by INT REFERENCES users(id) ON DELETE SET NULL,
                resolved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(customer_id, rule_id, reference_id, reference_type)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cskh_tasks_status ON cskh_tasks(status);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cskh_tasks_customer ON cskh_tasks(customer_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cskh_tasks_due ON cskh_tasks(due_date);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cskh_tasks_color ON cskh_tasks(priority_color);`);
        console.log('[CSKH Migration] ✓ cskh_tasks');

        // 3. cskh_interaction_logs — Contact history
        await client.query(`
            CREATE TABLE IF NOT EXISTS cskh_interaction_logs (
                id SERIAL PRIMARY KEY,
                task_id INT NOT NULL REFERENCES cskh_tasks(id) ON DELETE CASCADE,
                customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
                interaction_result VARCHAR(50),
                call_outcome VARCHAR(50),
                notes TEXT,
                post_care_notes TEXT,
                created_by INT REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cskh_logs_task ON cskh_interaction_logs(task_id);`);
        console.log('[CSKH Migration] ✓ cskh_interaction_logs');

        // 4. Seed default rules for tour du lịch
        const seedRules = [
            {
                rule_name: 'Nhắc chuẩn bị giấy tờ, visa (T-7)',
                trigger_event: 'departure_upcoming',
                offset_days: -7,
                default_color: 'yellow',
                retry_max: 3,
                retry_interval_days: 2,
                description: 'Nhắc KH chuẩn bị hộ chiếu, visa, giấy tờ cá nhân trước 7 ngày khởi hành'
            },
            {
                rule_name: 'Nhắc trước ngày bay (T-1)',
                trigger_event: 'departure_upcoming',
                offset_days: -1,
                default_color: 'red',
                retry_max: 3,
                retry_interval_days: 1,
                description: 'Gửi lịch trình chi tiết, nhắc tập trung tại điểm hẹn, kiểm tra hành lý'
            },
            {
                rule_name: 'Hỏi thăm sau tour (T+3)',
                trigger_event: 'departure_completed',
                offset_days: 3,
                default_color: 'green',
                retry_max: 2,
                retry_interval_days: 3,
                description: 'Hỏi thăm trải nghiệm tour, xin feedback, nhắc đánh giá Google Maps'
            },
            {
                rule_name: 'Gợi ý tour mới (T+30)',
                trigger_event: 'departure_completed',
                offset_days: 30,
                default_color: 'yellow',
                retry_max: 2,
                retry_interval_days: 7,
                description: 'Giới thiệu tour tương tự, ưu đãi cho khách cũ, upsell'
            },
            {
                rule_name: 'Khách lâu không đi tour (90 ngày)',
                trigger_event: 'customer_reactivation',
                offset_days: 90,
                default_color: 'red',
                retry_max: 3,
                retry_interval_days: 5,
                description: 'Khách đã từng book nhưng 90 ngày chưa có booking mới. Cần re-engage.'
            },
            {
                rule_name: 'Chúc mừng sinh nhật (T-1)',
                trigger_event: 'birthday_upcoming',
                offset_days: -1,
                default_color: 'green',
                retry_max: 1,
                retry_interval_days: 1,
                description: 'Gửi lời chúc mừng sinh nhật, thông báo ưu đãi đặc biệt'
            }
        ];

        for (const rule of seedRules) {
            await client.query(`
                INSERT INTO cskh_rules (rule_name, trigger_event, offset_days, default_color, retry_max, retry_interval_days, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT DO NOTHING
            `, [rule.rule_name, rule.trigger_event, rule.offset_days, rule.default_color, rule.retry_max, rule.retry_interval_days, rule.description]);
        }
        console.log('[CSKH Migration] ✓ Seeded', seedRules.length, 'default rules');

        await client.query('COMMIT');
        console.log('[CSKH Migration] ✅ All done!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[CSKH Migration] ❌ Error:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Run directly or as module
if (require.main === module) {
    migrate().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    module.exports = { migrate };
}
