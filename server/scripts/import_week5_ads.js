const { Pool } = require('pg');
const xlsx = require('xlsx');
require('dotenv').config({ path: './server/.env' }); 

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const workbook = xlsx.readFile('./client/public/thu-vien-input/qc-t5-t7-2026.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  const mappedData = [];

  jsonData.forEach((row) => {
    const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toUpperCase();
    const spend = parseFloat((row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || row['Số tiền đã chi tiêu (VND)'] || '0').toString().replace(/[^0-9.-]+/g,"")) || 0;
    const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || row['Quan hệ kết nối qua tin nhắn mới'] || '0') || 0;
    const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

    if (!campaign && !adSet && !ad) return;

    let detectedBu = null;
    const fallbackBUs = ['BU1', 'BU2', 'BU3', 'BU4', 'BU5'];
    for (const bu of fallbackBUs) {
      if (campaign.includes(bu) || adSet.includes(bu)) {
        detectedBu = bu; break;
      }
    }

    if (!detectedBu) {
      const allText = `${campaign} ${adSet} ${ad}`;
      if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM') || allText.includes('LỆ GIANG') || allText.includes('GIANG TÂY')) detectedBu = 'BU1';
      else if (allText.includes('CHÂU ÂU') || allText.includes('ÚC')) detectedBu = 'BU2';
      else if (allText.includes('HÀN QUỐC') || allText.includes('NHẬT BẢN') || allText.includes('ĐÀI LOAN')) detectedBu = 'BU3';
      else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO')) detectedBu = 'BU4';
      else if (allText.includes('ALASKA') || allText.includes('BẮC MỸ') || allText.includes('BẮC CỰC') || allText.includes('NAM MỸ') || allText.includes('MÔNG CỔ') || allText.includes('MONGOLIA') || allText.includes('SILKROAD') || allText.includes('CON ĐƯỜNG TƠ LỤA') || allText.includes('TRUNG Á') || allText.includes('THỔ NHĨ KỲ') || allText.includes('MA RỐC') || allText.includes('AFRICA') || allText.includes('CHÂU PHI') || allText.includes('CANADA') || allText.includes('MỸ') || allText.includes('PAKISTAN') || allText.includes('TÂY Á') || allText.includes('TRUNG ĐÔNG')) detectedBu = 'BU5';
    }

    if (!detectedBu) detectedBu = 'UNKNOWN';
    if (detectedBu === 'UNKNOWN') return;
    
    mappedData.push({
      bu_name: detectedBu,
      campaign_name: row['Tên chiến dịch'] || row['Chiến dịch'] || '',
      ad_set_name: row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '',
      ad_name: row['Tên quảng cáo'] || row['Quảng cáo'] || '',
      spend: spend,
      messages: msgs,
      leads: leads,
      cpl_msg: msgs > 0 ? spend / msgs : 0,
      cpl_lead: leads > 0 ? spend / leads : 0,
    });
  });

  const validData = mappedData.filter(r => r.spend > 0 || r.campaign_name);
  console.log(`Found ${validData.length} valid rows.`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const year = 2026;
    const month = 7;
    const week_number = 5;

    // Delete existing week 5 data
    await client.query(`
      DELETE FROM marketing_ads_reports 
      WHERE year = $1 AND month = $2 AND week_number = $3
    `, [year, month, week_number]);

    for (const row of validData) {
      await client.query(`
        INSERT INTO marketing_ads_reports (
          bu_name, year, month, week_number, 
          campaign_name, ad_set_name, ad_name, 
          spend, messages, cpl_msg, leads, cpl_lead
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        row.bu_name, year, month, week_number,
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
    console.log("Import success!");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

run();
