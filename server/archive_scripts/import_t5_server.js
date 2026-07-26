const XLSX = require('xlsx');
const db = require('./db');
const path = require('path');

async function importData() {
  const filePath = path.join(__dirname, 'qc-t5-t6-2026.xlsx');
  console.log(`Reading file: ${filePath}`);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  
  const groups = {};
  
  const buRes = await db.query("SELECT * FROM business_units ORDER BY sort_order ASC, id ASC");
  const activeBUs = buRes.rows || [];

  jsonData.forEach((row) => {
    const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toUpperCase();
    const spendStr = (row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || row['Số tiền đã chi tiêu (VND)'] || '0').toString().replace(/[^0-9.-]+/g,"");
    const spend = parseFloat(spendStr) || 0;
    const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || row['Quan hệ kết nối qua tin nhắn mới'] || '0') || 0;
    const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

    if (!campaign && !adSet && !ad) return;

    let detectedBu = null;

    // 1. Exact ID match in campaign or adSet (e.g. BU1, BU2...)
    if (activeBUs.length > 0) {
      for (const bu of activeBUs) {
        if (campaign.includes(bu.id)) { detectedBu = bu.id; break; }
      }
      if (!detectedBu) {
        for (const bu of activeBUs) {
          if (adSet.includes(bu.id)) { detectedBu = bu.id; break; }
        }
      }
    }

    // Fallback for ID matching if activeBUs is somehow empty
    if (!detectedBu && activeBUs.length === 0) {
      const fallbackBUs = ['BU1', 'BU2', 'BU3', 'BU4', 'BU5'];
      for (const bu of fallbackBUs) {
        if (campaign.includes(bu) || adSet.includes(bu)) {
          detectedBu = bu; break;
        }
      }
    }

    // 2. Keyword matching from dynamic database arrays
    if (!detectedBu) {
      const allText = `${campaign} ${adSet} ${ad}`;
      
      if (activeBUs.length > 0) {
        for (const bu of activeBUs) {
          const keywords = [...(bu.countries || []), ...(bu.keywords || [])];
          const isMatch = keywords.some(kw => kw && allText.includes(kw.toUpperCase()));
          if (isMatch) {
            detectedBu = bu.id;
            break;
          }
        }
      } else {
        // Fallback keywords if DB query failed
        if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM') || allText.includes('LỆ GIANG') || allText.includes('GIANG TÂY')) detectedBu = 'BU1';
        else if (allText.includes('CHÂU ÂU') || allText.includes('ÚC')) detectedBu = 'BU2';
        else if (allText.includes('HÀN QUỐC') || allText.includes('NHẬT BẢN') || allText.includes('ĐÀI LOAN')) detectedBu = 'BU3';
        else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO')) detectedBu = 'BU4';
        else if (allText.includes('ALASKA') || allText.includes('BẮC MỸ') || allText.includes('BẮC CỰC') || allText.includes('NAM MỸ') || allText.includes('MÔNG CỔ') || allText.includes('MONGOLIA') || allText.includes('SILKROAD') || allText.includes('CON ĐƯỜNG TƠ LỤA') || allText.includes('TRUNG Á') || allText.includes('THỔ NHĨ KỲ') || allText.includes('MA RỐC') || allText.includes('AFRICA') || allText.includes('CHÂU PHI') || allText.includes('CANADA') || allText.includes('MỸ')) detectedBu = 'BU5';
      }
    }

    if (!detectedBu) detectedBu = 'UNKNOWN';
    if (detectedBu === 'UNKNOWN') return;

    if (!groups[detectedBu]) groups[detectedBu] = [];

    const obj = {
      campaign_name: row['Tên chiến dịch'] || row['Chiến dịch'] || '',
      ad_set_name: row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '',
      ad_name: row['Tên quảng cáo'] || row['Quảng cáo'] || '',
      spend: spend,
      messages: msgs,
      cpl_msg: msgs > 0 ? spend / msgs : 0,
      leads: leads,
      cpl_lead: leads > 0 ? spend / leads : 0,
    };
    
    if (obj.spend > 0 || obj.campaign_name) {
      groups[detectedBu].push(obj);
    }
  });

  const year = 2026;
  const month = 6;
  const week_number = 5;

  console.log(`Parsed groups:`, Object.keys(groups));

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const bu_name in groups) {
      const dataRows = groups[bu_name];
      
      const deleteQuery = `
        DELETE FROM marketing_ads_reports 
        WHERE bu_name = $1 AND year = $2 AND month = $3 AND week_number = $4
      `;
      await client.query(deleteQuery, [bu_name, year, month, week_number]);

      const insertQuery = `
        INSERT INTO marketing_ads_reports (
          bu_name, year, month, week_number, 
          campaign_name, ad_set_name, ad_name, 
          spend, messages, cpl_msg, leads, cpl_lead
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      let totalInserted = 0;
      for (let row of dataRows) {
          await client.query(insertQuery, [
              bu_name, 
              year, 
              month, 
              week_number,
              row.campaign_name || null,
              row.ad_set_name || null,
              row.ad_name || null,
              row.spend ? parseFloat(row.spend) : 0,
              row.messages ? parseInt(row.messages) : 0,
              row.cpl_msg ? parseFloat(row.cpl_msg) : 0,
              row.leads ? parseInt(row.leads) : 0,
              row.cpl_lead ? parseFloat(row.cpl_lead) : 0
          ]);
          totalInserted++;
      }
      console.log(`Imported ${totalInserted} rows for ${bu_name}`);
    }
    await client.query('COMMIT');
    console.log('Import done!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during import:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

importData();
