const { Pool } = require('pg');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const YEAR = 2026;
const MONTH = 8;
const WEEK = 2;
const FILE_NAME = 'qc-t2-t8-2026.xlsx';

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const possiblePaths = [
    path.resolve(__dirname, `../../data_import/bao-cao-facebook-ads/${FILE_NAME}`),
    path.resolve(__dirname, `../data_import/bao-cao-facebook-ads/${FILE_NAME}`),
    `/var/www/fittour-crm/data_import/bao-cao-facebook-ads/${FILE_NAME}`
  ];

  const filePath = possiblePaths.find(p => fs.existsSync(p));
  if (!filePath) {
    console.error(`❌ File not found in any of the search paths:`);
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    process.exit(1);
  }

  console.log(`📂 Found file at: ${filePath}`);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  console.log(`📄 Total raw rows in sheet "${sheetName}": ${jsonData.length}`);

  function extractBU(adSet, campaign) {
    const buRegex = /\[(BU\d+)\]/i;
    let match = (adSet || '').match(buRegex);
    if (match) return match[1].toUpperCase();
    match = (campaign || '').match(buRegex);
    if (match) return match[1].toUpperCase();
    return 'Khác';
  }

  const mappedData = [];

  jsonData.forEach((row, idx) => {
    const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toString().trim();
    const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toString().trim();
    const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toString().trim();
    
    // Check if Total row or completely empty row
    if (!campaign && !adSet && !ad) {
      console.log(`ℹ️ Row ${idx}: Bỏ qua dòng Tổng cộng / Trống (Chi tiêu: ${row['Số tiền đã chi tiêu (VND)'] || 0})`);
      return;
    }

    const spend = parseFloat((row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || row['Số tiền đã chi tiêu (VND)'] || '0').toString().replace(/[^0-9.-]+/g, "")) || 0;
    const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || row['Quan hệ kết nối qua tin nhắn mới'] || '0') || 0;
    const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

    const bu = extractBU(adSet, campaign);

    mappedData.push({
      bu_name: bu,
      campaign_name: campaign,
      ad_set_name: adSet,
      ad_name: ad,
      spend: spend,
      messages: msgs,
      leads: leads,
      cpl_msg: msgs > 0 ? spend / msgs : 0,
      cpl_lead: leads > 0 ? spend / leads : 0,
    });
  });

  console.log(`📊 Valid mapped rows to insert: ${mappedData.length}`);

  const buBreakdown = {};
  let totalSpend = 0;
  let totalMsgs = 0;
  let totalLeads = 0;

  mappedData.forEach(r => {
    if (!buBreakdown[r.bu_name]) buBreakdown[r.bu_name] = { spend: 0, msgs: 0, leads: 0, count: 0 };
    buBreakdown[r.bu_name].spend += r.spend;
    buBreakdown[r.bu_name].msgs += r.messages;
    buBreakdown[r.bu_name].leads += r.leads;
    buBreakdown[r.bu_name].count += 1;
    totalSpend += r.spend;
    totalMsgs += r.messages;
    totalLeads += r.leads;
  });

  console.log('📈 Breakdown theo BU:');
  console.table(Object.entries(buBreakdown).map(([bu, data]) => ({
    BU: bu,
    'Số Adsets': data.count,
    'Chi tiêu (VNĐ)': data.spend.toLocaleString('vi-VN'),
    'Tin nhắn (Inbox)': data.msgs,
    'Lead (MKT)': data.leads,
    'Giá/Msg': data.msgs > 0 ? Math.round(data.spend / data.msgs).toLocaleString('vi-VN') : 0,
    'Giá/Lead': data.leads > 0 ? Math.round(data.spend / data.leads).toLocaleString('vi-VN') : 0
  })));

  console.log(`\n💰 TỔNG CỘNG: Chi tiêu = ${totalSpend.toLocaleString('vi-VN')} đ | Tin nhắn = ${totalMsgs} | Lead = ${totalLeads}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Xoá dữ liệu cũ của Tuần 2 Tháng 8 Năm 2026 (Safety)
    const delRes = await client.query(`
      DELETE FROM marketing_ads_reports 
      WHERE year = $1 AND month = $2 AND week_number = $3
    `, [YEAR, MONTH, WEEK]);
    console.log(`🗑 Đã dọn sạch dữ liệu cũ Tuần ${WEEK} Tháng ${MONTH}/${YEAR}: ${delRes.rowCount} bản ghi.`);

    // 2. Insert dữ liệu mới
    const insertQuery = `
      INSERT INTO marketing_ads_reports (
        bu_name, year, month, week_number, 
        campaign_name, ad_set_name, ad_name, 
        spend, messages, cpl_msg, leads, cpl_lead,
        crm_leads_manual, crm_won_manual, is_locked
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, 0, false)
    `;

    for (const row of mappedData) {
      await client.query(insertQuery, [
        row.bu_name,
        YEAR,
        MONTH,
        WEEK,
        row.campaign_name || null,
        row.ad_set_name || null,
        row.ad_name || null,
        row.spend,
        row.messages,
        row.cpl_msg,
        row.leads,
        row.cpl_lead
      ]);
    }

    await client.query('COMMIT');
    console.log(`\n✅ IMPORT THÀNH CÔNG ${mappedData.length} DÒNG CHO TUẦN ${WEEK} THÁNG ${MONTH}/${YEAR}!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Lỗi trong quá trình import:`, err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
