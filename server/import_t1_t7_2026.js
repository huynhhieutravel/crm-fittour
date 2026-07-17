const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });
const XLSX = require('xlsx');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const processFiles = async () => {
  const filePath = `../client/public/thu-vien-input/qc-t1-t7-2026.xlsx`;
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  const WEEK = 1;
  const MONTH = 7;
  const YEAR = 2026;
  let count = 0;
  
  // Clear out any old data for this week before we insert fresh ones
  const delResult = await pool.query('DELETE FROM marketing_ads_reports WHERE year = $1 AND month = $2 AND week_number = $3', [YEAR, MONTH, WEEK]);
  console.log(`Đã xóa ${delResult.rowCount} dòng cũ của Tuần ${WEEK} Tháng ${MONTH}.`);

  for (const row of data) {
    const campaign = (row['Tên chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || '').toUpperCase();
    let spendRaw = (row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || row['Số tiền đã chi tiêu (VND)'] || '0').toString().replace(/[^0-9.-]+/g,"");
    const spend = parseFloat(spendRaw) || 0;
    const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || row['Quan hệ kết nối qua tin nhắn mới'] || '0') || 0;
    const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

    if (!campaign && !adSet && !ad) continue;

    let bu = null;
    if (campaign.includes('BU1')) bu = 'BU1';
    else if (campaign.includes('BU2')) bu = 'BU2';
    else if (campaign.includes('BU3')) bu = 'BU3'; 
    else if (campaign.includes('BU4')) bu = 'BU4';

    if (!bu) {
      if (adSet.includes('BU1')) bu = 'BU1';
      else if (adSet.includes('BU2')) bu = 'BU2';
      else if (adSet.includes('BU3')) bu = 'BU3';
      else if (adSet.includes('BU4')) bu = 'BU4';
    }

    if (!bu) {
      const allText = `${campaign} ${adSet} ${ad}`.toUpperCase();
      if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM') || allText.includes('TÂN CƯƠNG') || allText.includes('TÂY TẠNG') || allText.includes('LỆ GIANG') || allText.includes('THIỂM TÂY') || allText.includes('VÂN NAM')) bu = 'BU1';
      else if (allText.includes('ALASKA') || allText.includes('NAM MỸ') || allText.includes('CHÂU ÂU') || allText.includes('ÚC') || allText.includes('MỸ') || allText.includes('CANADA') || allText.includes('MONGOLIA') || allText.includes('MÔNG CỔ')) bu = 'BU2';
      else if (allText.includes('HÀN QUỐC') || allText.includes('NHẬT BẢN') || allText.includes('ĐÀI LOAN')) bu = 'BU3';
      else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO') || allText.includes('KASHMIR') || allText.includes('ẤN ĐỘ') || allText.includes('NEPAL') || allText.includes('SRI LANKA')) bu = 'BU4';
    }

    if (!bu) bu = 'UNKNOWN';

    if (bu !== 'UNKNOWN' && (spend > 0 || campaign)) {
      const cplMsg = msgs > 0 ? spend / msgs : 0;
      const cplLead = leads > 0 ? spend / leads : 0;

      await pool.query(
        `INSERT INTO marketing_ads_reports (bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name, spend, messages, leads, cpl_msg, cpl_lead)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [bu, YEAR, MONTH, WEEK, row['Tên chiến dịch'] || row['Chiến dịch'] || '', row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '', row['Tên quảng cáo'] || row['Quảng cáo'] || '', spend, msgs, leads, cplMsg, cplLead]
      );
      count++;
    } else if (bu === 'UNKNOWN' && spend > 0) {
      console.log(`⚠️ UNKNOWN BU: "${row['Tên chiến dịch']}" | spend=${spend}`);
    }
  }
  
  console.log(`\n✅ Tuần ${WEEK} Tháng ${MONTH}/${YEAR}: Đã import ${count} dòng quảng cáo hợp lệ.`);
  pool.end();
};

processFiles().catch(err => { console.error(err); pool.end(); });
