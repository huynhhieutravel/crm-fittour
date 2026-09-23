const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function analyzeBU1Leads() {
  const query = `
    SELECT 
      l.id, l.name, l.phone, l.source, l.bu_group, l.tour_id, 
      t.name as tour_name, t.code as tour_code,
      l.facebook_psid, l.meta_lead_id, 
      TO_CHAR(l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') as created_vn,
      TO_CHAR(l.last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD HH24:MI') as contacted_vn,
      l.consultation_note
    FROM leads l
    LEFT JOIN tour_templates t ON l.tour_id::text = t.id::text
    WHERE l.bu_group = 'BU1'
      AND (l.source ILIKE '%meta%' OR l.source ILIKE '%mess%' OR l.source ILIKE '%fb%' OR l.facebook_psid IS NOT NULL OR l.meta_lead_id IS NOT NULL)
      AND l.phone IS NOT NULL AND TRIM(l.phone) != ''
      AND (
        (l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2026-09-14 00:00:00' AND l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' <= '2026-09-20 23:59:59')
        OR
        (
          l.last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2026-09-14 00:00:00' 
          AND l.last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' <= '2026-09-20 23:59:59'
          AND (l.last_contacted_at - l.created_at) > INTERVAL '14 days'
        )
      )
    ORDER BY l.created_at ASC
  `;

  const res = await pool.query(query);
  console.log("Total leads matching the 101 count:", res.rows.length);

  const byDay = {};
  const byTour = {};
  let psidCount = 0;
  let formCount = 0;
  let manualCount = 0;

  res.rows.forEach(r => {
    const day = r.created_vn ? r.created_vn.slice(0, 10) : 'N/A';
    byDay[day] = (byDay[day] || 0) + 1;
    const tourName = r.tour_name ? `[${r.tour_code || r.tour_id}] ${r.tour_name}` : (r.tour_id ? `ID #${r.tour_id}` : 'Không rõ tour');
    byTour[tourName] = (byTour[tourName] || 0) + 1;
    if (r.facebook_psid) psidCount++;
    if (r.meta_lead_id) formCount++;
    if (!r.facebook_psid && !r.meta_lead_id) manualCount++;
  });

  console.log("By Day of Lead Creation / Contact:");
  console.table(Object.entries(byDay).sort().map(([d, c]) => ({ Day: d, Count: c })));

  console.log(`Channels: Messenger PSID = ${psidCount} | Meta Form = ${formCount} | Manual = ${manualCount}`);

  console.log("\nTop Tours for these 101 leads:");
  console.table(Object.entries(byTour).sort((a,b) => b[1]-a[1]).map(([t, c]) => ({ Tour: t, Leads: c })));

  console.log("\n--- Sample 20 leads with notes ---");
  res.rows.slice(0, 20).forEach(r => {
    console.log(`[${r.created_vn}] [ID:${r.id}] ${r.name} (${r.phone ? r.phone.slice(0,4)+'***'+r.phone.slice(-3) : 'N/A'}) | Tour: ${r.tour_name || r.tour_id} | Note: ${(r.consultation_note || '').replace(/\n/g, ' ')}`);
  });

  pool.end();
}

analyzeBU1Leads().catch(e => { console.error(e); pool.end(); });
