const db = require('./db');

async function test() {
  try {
    console.log("Testing Stats Queries...");
    
    console.log("1. Status Stats");
    const s1 = await db.query('SELECT status, COUNT(*)::int as count FROM leads GROUP BY status');
    console.log(s1.rows);

    console.log("2. Source Stats");
    const s2 = await db.query('SELECT source, COUNT(*)::int as count FROM leads GROUP BY source');
    console.log(s2.rows);

    console.log("3. Staff Stats");
    const s3 = await db.query(`
            SELECT 
                u.full_name as name,
                u.role,
                COUNT(l.id)::int as total_leads,
                COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as won_leads
            FROM users u
            LEFT JOIN leads l ON u.id = l.assigned_to
            GROUP BY u.id, u.full_name, u.role
            HAVING COUNT(l.id) > 0
            ORDER BY total_leads DESC
        `);
    console.log(s3.rows);

    console.log("4. Tour Stats");
    const s4 = await db.query(`
            SELECT 
                COALESCE(tt.name, 'Chưa xác định') as name,
                COUNT(l.id)::int as count
            FROM leads l
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id
            GROUP BY tt.name
            ORDER BY count DESC
            LIMIT 10
        `);
    console.log(s4.rows);

    console.log("5. Care Stats");
    const s5 = await db.query(`
            SELECT 
                CASE 
                    WHEN last_contacted_at >= NOW() - INTERVAL '3 days' THEN 'Đang chăm sóc tốt'
                    ELSE 'Cần chăm sóc ngay'
                END as status,
                COUNT(*)::int as count
            FROM leads
            WHERE status NOT IN ('Chốt đơn', 'Thất bại')
            GROUP BY 1
        `);
    console.log(s5.rows);

    console.log("6. Overdue Leads List");
    const s6 = await db.query(`
            SELECT l.id, l.name, l.phone, l.last_contacted_at, u.full_name as staff_name
            FROM leads l
            LEFT JOIN users u ON l.assigned_to = u.id
            WHERE l.status NOT IN ('Chốt đơn', 'Thất bại')
              AND (l.last_contacted_at < NOW() - INTERVAL '3 days' OR l.last_contacted_at IS NULL)
            ORDER BY l.last_contacted_at ASC NULLS FIRST
            LIMIT 5
        `);
    console.log(s6.rows);

    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

test();
