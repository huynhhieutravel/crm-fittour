/**
 * CSKH Auto-Sync Cron Engine (Node.js / PostgreSQL)
 * Adapted from quan-ly-phong-kham/cron/cskh_engine.php for tour travel
 *
 * Runs every 15 minutes via node-cron:
 * 1. departure_upcoming → Scan tour_departures starting soon → create task per customer via bookings
 * 2. departure_completed → Scan completed departures → create follow-up tasks
 * 3. customer_reactivation → Customers who haven't booked in N days
 * 4. birthday_upcoming → Customer birthdays tomorrow
 * 5. Auto-mark overdue: pending tasks with due_date < today
 */

const cron = require('node-cron');
const db = require('../db');

const log = (msg) => console.log(`[CSKH-Engine ${new Date().toISOString()}] ${msg}`);

async function runCskhEngine() {
    try {
        log('=== START ===');
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Load active rules
        const rulesRes = await db.query(`SELECT * FROM cskh_rules WHERE is_active = true`);
        const rules = rulesRes.rows;
        log(`Loaded ${rules.length} active rules`);

        for (const rule of rules) {
            try {
                switch (rule.trigger_event) {

                    // ─────────────────────────────────────────
                    // RULE: departure_upcoming (T-N: Nhắc trước ngày khởi hành)
                    // ─────────────────────────────────────────
                    case 'departure_upcoming': {
                        // offset_days is negative (e.g. -7, -1)
                        // Target: departures starting in abs(offset_days) days from now
                        const absDays = Math.abs(rule.offset_days);
                        const targetDateRes = await db.query(
                            `SELECT (CURRENT_DATE + $1 * INTERVAL '1 day')::date as target_date`,
                            [absDays]
                        );
                        const targetDate = targetDateRes.rows[0].target_date;

                        // Find customers with bookings on departures starting on target_date
                        const customers = await db.query(`
                            SELECT DISTINCT b.customer_id, td.id as departure_id
                            FROM bookings b
                            JOIN tour_departures td ON b.tour_departure_id = td.id
                            WHERE td.start_date::date = $1
                              AND td.status NOT IN ('Huỷ')
                              AND b.booking_status NOT IN ('Huỷ', 'Mới')
                              AND NOT EXISTS (
                                  SELECT 1 FROM cskh_tasks t 
                                  WHERE t.rule_id = $2 
                                    AND t.customer_id = b.customer_id 
                                    AND t.reference_id = td.id 
                                    AND t.reference_type = 'departure'
                              )
                        `, [targetDate, rule.id]);

                        let count = 0;
                        for (const c of customers.rows) {
                            await db.query(`
                                INSERT INTO cskh_tasks (customer_id, rule_id, reference_id, reference_type, due_date, priority_color, assigned_to)
                                VALUES ($1, $2, $3, 'departure', $4, $5, 
                                    (SELECT assigned_to FROM customers WHERE id = $1)
                                )
                                ON CONFLICT (customer_id, rule_id, reference_id, reference_type) DO NOTHING
                            `, [c.customer_id, rule.id, c.departure_id, now, rule.default_color]);
                            count++;
                        }
                        log(`[Rule #${rule.id}] ${rule.rule_name}: Created ${count} task(s)`);
                        break;
                    }

                    // ─────────────────────────────────────────
                    // RULE: departure_completed (T+N: Hỏi thăm sau tour)
                    // ─────────────────────────────────────────
                    case 'departure_completed': {
                        // offset_days is positive (e.g. +3, +30)
                        // Target: departures that ended N days ago
                        const targetDateRes = await db.query(
                            `SELECT (CURRENT_DATE - $1 * INTERVAL '1 day')::date as target_date`,
                            [rule.offset_days]
                        );
                        const targetDate = targetDateRes.rows[0].target_date;

                        const customers = await db.query(`
                            SELECT DISTINCT b.customer_id, td.id as departure_id
                            FROM bookings b
                            JOIN tour_departures td ON b.tour_departure_id = td.id
                            WHERE td.end_date::date = $1
                              AND td.status NOT IN ('Huỷ')
                              AND b.booking_status NOT IN ('Huỷ', 'Mới')
                              AND NOT EXISTS (
                                  SELECT 1 FROM cskh_tasks t 
                                  WHERE t.rule_id = $2 
                                    AND t.customer_id = b.customer_id 
                                    AND t.reference_id = td.id 
                                    AND t.reference_type = 'departure'
                              )
                        `, [targetDate, rule.id]);

                        let count = 0;
                        for (const c of customers.rows) {
                            await db.query(`
                                INSERT INTO cskh_tasks (customer_id, rule_id, reference_id, reference_type, due_date, priority_color, assigned_to)
                                VALUES ($1, $2, $3, 'departure', $4, $5, 
                                    (SELECT assigned_to FROM customers WHERE id = $1)
                                )
                                ON CONFLICT (customer_id, rule_id, reference_id, reference_type) DO NOTHING
                            `, [c.customer_id, rule.id, c.departure_id, now, rule.default_color]);
                            count++;
                        }
                        log(`[Rule #${rule.id}] ${rule.rule_name}: Created ${count} task(s)`);
                        break;
                    }

                    // ─────────────────────────────────────────
                    // RULE: customer_reactivation (Khách lâu không đi tour)
                    // ─────────────────────────────────────────
                    case 'customer_reactivation': {
                        const cutoffRes = await db.query(
                            `SELECT (CURRENT_DATE - $1 * INTERVAL '1 day')::date as cutoff`,
                            [rule.offset_days]
                        );
                        const cutoff = cutoffRes.rows[0].cutoff;

                        const customers = await db.query(`
                            SELECT c.id as customer_id
                            FROM customers c
                            WHERE EXISTS (
                                SELECT 1 FROM bookings b WHERE b.customer_id = c.id AND b.booking_status NOT IN ('Huỷ','Mới')
                            )
                            AND NOT EXISTS (
                                SELECT 1 FROM bookings b2 
                                JOIN tour_departures td ON b2.tour_departure_id = td.id
                                WHERE b2.customer_id = c.id AND td.end_date > $1
                            )
                            AND NOT EXISTS (
                                SELECT 1 FROM cskh_tasks t 
                                WHERE t.customer_id = c.id AND t.rule_id = $2 AND t.status IN ('pending','in_progress')
                            )
                        `, [cutoff, rule.id]);

                        let count = 0;
                        for (const c of customers.rows) {
                            await db.query(`
                                INSERT INTO cskh_tasks (customer_id, rule_id, reference_type, due_date, priority_color, assigned_to)
                                VALUES ($1, $2, 'customer', $3, $4,
                                    (SELECT assigned_to FROM customers WHERE id = $1)
                                )
                                ON CONFLICT DO NOTHING
                            `, [c.customer_id, rule.id, now, rule.default_color]);
                            count++;
                        }
                        log(`[Rule #${rule.id}] ${rule.rule_name}: Created ${count} task(s)`);
                        break;
                    }

                    // ─────────────────────────────────────────
                    // RULE: birthday_upcoming (Chúc mừng sinh nhật)
                    // ─────────────────────────────────────────
                    case 'birthday_upcoming': {
                        const absDays = Math.abs(rule.offset_days);
                        // Find customers whose birthday is tomorrow (or in N days)
                        const customers = await db.query(`
                            SELECT c.id as customer_id
                            FROM customers c
                            WHERE c.birth_date IS NOT NULL
                              AND EXTRACT(MONTH FROM c.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE + $1 * INTERVAL '1 day')
                              AND EXTRACT(DAY FROM c.birth_date) = EXTRACT(DAY FROM CURRENT_DATE + $1 * INTERVAL '1 day')
                              AND NOT EXISTS (
                                  SELECT 1 FROM cskh_tasks t 
                                  WHERE t.customer_id = c.id 
                                    AND t.rule_id = $2 
                                    AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                              )
                        `, [absDays, rule.id]);

                        let count = 0;
                        for (const c of customers.rows) {
                            await db.query(`
                                INSERT INTO cskh_tasks (customer_id, rule_id, reference_type, due_date, priority_color, assigned_to)
                                VALUES ($1, $2, 'customer', $3, $4,
                                    (SELECT assigned_to FROM customers WHERE id = $1)
                                )
                                ON CONFLICT DO NOTHING
                            `, [c.customer_id, rule.id, now, rule.default_color]);
                            count++;
                        }
                        log(`[Rule #${rule.id}] ${rule.rule_name}: Created ${count} task(s)`);
                        break;
                    }

                    default:
                        log(`[Rule #${rule.id}] Unknown trigger: ${rule.trigger_event}`);
                }
            } catch (ruleErr) {
                log(`[Rule #${rule.id}] ERROR: ${ruleErr.message}`);
            }
        }

        // ─────────────────────────────────────────
        // AUTO-MARK OVERDUE (pending + due_date < today)
        // ─────────────────────────────────────────
        const overdueRes = await db.query(`
            UPDATE cskh_tasks SET status = 'overdue' 
            WHERE status = 'pending' AND due_date < CURRENT_DATE
        `);
        log(`[Overdue] Marked ${overdueRes.rowCount} task(s) as overdue`);

        log('=== COMPLETE ===');
    } catch (err) {
        log(`FATAL ERROR: ${err.message}`);
        console.error(err);
    }
}

function startCskhCron() {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        runCskhEngine();
    }, {
        timezone: 'Asia/Ho_Chi_Minh'
    });

    log('CSKH Cron Engine attached to system.');

    // Run once on boot after 8 seconds
    setTimeout(() => {
        runCskhEngine();
    }, 8000);
}

module.exports = { startCskhCron, runCskhEngine };
