/**
 * Script chạy 1 lần: Recalc VIP Tier cho TOÀN BỘ khách hàng
 * Dựa trên past_trip_count (nhập tay) + crm_trip_count (đếm realtime từ bookings)
 * 
 * Cách chạy: node scripts/recalc_vip.js
 */

const db = require('../db');

function getVipLevel(totalTrips) {
    if (totalTrips >= 7) return 'VIP 1';
    if (totalTrips >= 4) return 'VIP 2';
    if (totalTrips >= 3) return 'VIP 3';
    if (totalTrips >= 2) return 'Repeat Customer';
    return 'New Customer';
}

async function recalcAll() {
    console.log('=== RECALC VIP TIER CHO TOÀN BỘ KHÁCH HÀNG ===\n');
    
    const result = await db.query(`
        SELECT c.id, c.name, c.customer_segment, c.past_trip_count,
               COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count
        FROM customers c
        ORDER BY c.id
    `);

    let changed = 0;
    let unchanged = 0;

    for (const c of result.rows) {
        const pastTrips = parseInt(c.past_trip_count || 0);
        const crmTrips = parseInt(c.crm_trip_count || 0);
        const totalTrips = pastTrips + crmTrips;
        const newVip = getVipLevel(totalTrips);
        const oldVip = c.customer_segment || 'New Customer';

        if (newVip !== oldVip) {
            await db.query('UPDATE customers SET customer_segment = $1 WHERE id = $2', [newVip, c.id]);
            console.log(`  [CHANGED] #${c.id} ${c.name}: "${oldVip}" → "${newVip}" (past=${pastTrips}, crm=${crmTrips}, total=${totalTrips})`);
            changed++;
        } else {
            unchanged++;
        }
    }

    console.log(`\n=== KẾT QUẢ ===`);
    console.log(`  Tổng: ${result.rows.length} khách hàng`);
    console.log(`  Đã sửa: ${changed}`);
    console.log(`  Không đổi: ${unchanged}`);
    console.log(`\nXong!`);
    process.exit(0);
}

recalcAll().catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
