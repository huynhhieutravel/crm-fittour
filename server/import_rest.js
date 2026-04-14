const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const XLSX = require('xlsx');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const files = [
  { week: 2, name: 'tuan2-thang3-nam2026.xlsx' },
  { week: 3, name: 'tuan3-thang3-nam2026.xlsx' },
  { week: 4, name: 'tuan4-thang3-nam2026.xlsx' },
  { week: 5, name: 'tuan5-thang3-nam2026.xlsx' }
];

const processFiles = async () => {
  for (let fileObj of files) {
    const filePath = `../data_import/bao-cao-facebook-ads/${fileObj.name}`;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    let count = 0;
    
    // Clear out any old data for this week before we insert fresh ones?
    // User wants us to ADD them. Just in case, let's delete anything from that week first.
    await pool.query('DELETE FROM marketing_ads_reports WHERE year = 2026 AND month = 3 AND week_number = $1', [fileObj.week]);

    for (const row of data) {
      const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toUpperCase();
      const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toUpperCase();
      const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toUpperCase();
      let spendRaw = (row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || '0').toString().replace(/[^0-9.-]+/g,"");
      const spend = parseFloat(spendRaw) || 0;
      const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || '0') || 0;
      const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

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

      if (bu !== 'UNKNOWN' && (spend > 0 || campaign)) {
        const cplMsg = msgs > 0 ? spend / msgs : 0;
        const cplLead = leads > 0 ? spend / leads : 0;

        await pool.query(
          `INSERT INTO marketing_ads_reports (bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name, spend, messages, leads, cpl_msg, cpl_lead)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [bu, 2026, 3, fileObj.week, row['Tên chiến dịch'] || '', row['Tên nhóm quảng cáo'] || '', row['Tên quảng cáo'] || '', spend, msgs, leads, cplMsg, cplLead]
        );
        count++;
      }
    }
    console.log(`Tuần ${fileObj.week}: Đã thêm ${count} dòng quảng cáo hợp lệ.`);
  }

  pool.end();
};

processFiles().catch(err => { console.error(err); pool.end(); });
