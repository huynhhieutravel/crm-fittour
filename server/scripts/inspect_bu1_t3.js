const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspectBU1Leads() {
  const query = `
    SELECT 
      id, name, phone, source, bu_group, tour_id, 
      facebook_psid, meta_lead_id, 
      created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as created_vn,
      last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as contacted_vn,
      consultation_note
    FROM leads
    WHERE bu_group = 'BU1'
      AND (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
      AND (
        (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2026-09-14 00:00:00' AND created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' <= '2026-09-20 23:59:59')
        OR
        (last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2026-09-14 00:00:00' AND last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' <= '2026-09-20 23:59:59')
      )
    ORDER BY created_at ASC
  `;

  const res = await pool.query(query);
  console.log('Total leads found in CRM query for BU1 (14/9 - 20/9):', res.rows.length);

  const bySource = {};
  const byTour = {};
  let withMetaLeadId = 0;
  let withPsid = 0;

  res.rows.forEach(r => {
    bySource[r.source] = (bySource[r.source] || 0) + 1;
    const tour = r.tour_id || 'Không rõ tour';
    byTour[tour] = (byTour[tour] || 0) + 1;
    if (r.meta_lead_id) withMetaLeadId++;
    if (r.facebook_psid) withPsid++;
  });

  console.log('By Source:', bySource);
  console.log('Meta Lead Form (meta_lead_id):', withMetaLeadId);
  console.log('Facebook Messenger PSID (facebook_psid):', withPsid);
  console.log('By Tour Top:');
  console.table(Object.entries(byTour).sort((a,b) => b[1]-a[1]).map(([t, c]) => ({ Tour: t, Leads: c })));

  console.log('\n--- SAMPLE LEADS ---');
  res.rows.slice(0, 15).forEach(r => {
    console.log(`[ID ${r.id}] ${r.name} | Phone: ${r.phone ? r.phone.slice(0,4)+'***' : 'N/A'} | Source: ${r.source} | Tour: ${r.tour_id} | Created: ${r.created_vn} | Form: ${!!r.meta_lead_id} | PSID: ${!!r.facebook_psid} | Note: ${(r.consultation_note || r.notes || '').slice(0, 60)}`);
  });

  pool.end();
}

inspectBU1Leads().catch(e => { console.error(e); pool.end(); });
