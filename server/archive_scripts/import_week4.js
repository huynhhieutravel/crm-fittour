const xlsx = require('xlsx');
const db = require('./db');

async function importWeek4() {
  const workbook = xlsx.readFile('../client/public/thu-vien-input/qc-t4-t7-2026.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

  const year = 2026;
  const month = 7;
  const week_number = 4;

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    
    // Xóa dữ liệu cũ của tuần 4 tháng 7 năm 2026
    const deleteQuery = `
      DELETE FROM marketing_ads_reports 
      WHERE year = $1 AND month = $2 AND week_number = $3
    `;
    await client.query(deleteQuery, [year, month, week_number]);

    const insertQuery = `
      INSERT INTO marketing_ads_reports (
        bu_name, year, month, week_number, 
        campaign_name, ad_set_name, ad_name, 
        spend, messages, cpl_msg, leads, cpl_lead
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    let count = 0;
    for (const row of data) {
      const campaign_name = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toString().trim();
      const ad_set_name = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toString().trim();
      const ad_name = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toString().trim();
      
      // Bỏ qua dòng tổng hoặc rác
      if (!campaign_name && !ad_set_name && !ad_name) continue;

      let bu_name = 'KHÁC';
      if (campaign_name.includes('[BU1]') || ad_set_name.includes('[BU1]')) bu_name = 'BU1';
      else if (campaign_name.includes('[BU2]') || ad_set_name.includes('[BU2]')) bu_name = 'BU2';
      else if (campaign_name.includes('[BU3]') || ad_set_name.includes('[BU3]')) bu_name = 'BU3';
      else if (campaign_name.includes('[BU4]') || ad_set_name.includes('[BU4]')) bu_name = 'BU4';
      else if (campaign_name.includes('[BU5]') || ad_set_name.includes('[BU5]')) bu_name = 'BU5';

      let spendStr = (row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || '0').toString().replace(/[^0-9.-]+/g,"");
      const spend = parseFloat(spendStr) || 0;
      
      let msgStr = (row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || '0').toString();
      const messages = parseInt(msgStr) || 0;
      
      let leadStr = (row['Khách hàng tiềm năng'] || row['Lead'] || '0').toString();
      const leads = parseInt(leadStr) || 0;
      
      const cpl_msg = messages > 0 ? spend / messages : 0;
      const cpl_lead = leads > 0 ? spend / leads : 0;

      await client.query(insertQuery, [
        bu_name, year, month, week_number,
        campaign_name, ad_set_name, ad_name,
        spend, messages, cpl_msg, leads, cpl_lead
      ]);
      count++;
    }

    await client.query('COMMIT');
    console.log(`Nhập thành công ${count} dòng cho tuần 4 tháng 7 năm 2026 từ file qc-t4-t7-2026.xlsx.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi import:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

importWeek4();
