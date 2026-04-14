const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const XLSX = require('xlsx');

const insertData = async () => {
  const filePath = './data_import/bao-cao-facebook-ads/Tuan1-thang3-nam2026.xlsx';
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  let insertedCount = 0;

  for (const row of data) {
    const campaign = (row['Tên chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || '').toUpperCase();
    const spend = parseFloat(row['Số tiền đã chi tiêu (VND)'] || 0);
    const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || 0);
    const leads = parseInt(row['Khách hàng tiềm năng'] || 0);

    if (!campaign && !adSet && !ad) continue;

    let bu = null;
    if (campaign.includes('BU1')) bu = 'BU1';
    else if (campaign.includes('BU2')) bu = 'BU2';
    else if (campaign.includes('BU4')) bu = 'BU4';

    if (!bu) {
      if (adSet.includes('BU1')) bu = 'BU1';
      else if (adSet.includes('BU2')) bu = 'BU2';
      else if (adSet.includes('BU4')) bu = 'BU4';
    }

    if (!bu) {
      const allText = `${campaign} ${adSet} ${ad}`.toUpperCase();
      if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM')) bu = 'BU1';
      else if (allText.includes('ALASKA') || allText.includes('NAM MỸ') || allText.includes('CHÂU ÂU')) bu = 'BU2';
      else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO')) bu = 'BU4';
    }

    if (!bu) bu = 'UNKNOWN';

    if (bu !== 'UNKNOWN') {
      await pool.query(
        `INSERT INTO marketing_ads_reports (bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name, spend, messages, leads)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [bu, 2026, 3, 1, row['Tên chiến dịch'], row['Tên nhóm quảng cáo'], row['Tên quảng cáo'], spend, msgs, leads]
      );
      insertedCount++;
    }
  }

  console.log(`Successfully inserted ${insertedCount} rows for Week 1 March 2026.`);
  pool.end();
};

insertData().catch(err => { console.error(err); pool.end(); });
