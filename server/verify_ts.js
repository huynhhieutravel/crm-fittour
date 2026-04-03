const db = require('./db');
(async () => {
    try {
        const res = await db.query(`
            SELECT 
                TO_CHAR(DATE(l.created_at), 'YYYY-MM-DD') as period,
                l.status,
                COUNT(*)::int as count
            FROM leads l
            WHERE 1=1 AND l.created_at >= '2026-04-01' AND l.created_at <= '2026-04-03 23:59:59'
            GROUP BY 1, l.status
            ORDER BY 1
        `);
        console.log("DATA:", res.rows);
    } catch(e) { console.error(e); }
    process.exit(0);
})();
