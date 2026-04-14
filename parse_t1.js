const XLSX = require('xlsx');

const parseFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  let results = { BU1: [], BU2: [], BU4: [], UNKNOWN: [] };
  let totalSpend = 0;

  data.forEach((row, index) => {
    const campaign = (row['Tên chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || '').toUpperCase();
    const spend = parseFloat(row['Số tiền đã chi tiêu (VND)'] || 0);

    // Skip the "Total" row that Meta outputs at the top/bottom
    if (!campaign && !adSet && !ad) return;

    let bu = null;

    // Rule 1: Campaign
    if (campaign.includes('BU1')) bu = 'BU1';
    else if (campaign.includes('BU2')) bu = 'BU2';
    else if (campaign.includes('BU4')) bu = 'BU4';

    // Rule 2: Ad Set
    if (!bu) {
      if (adSet.includes('BU1')) bu = 'BU1';
      else if (adSet.includes('BU2')) bu = 'BU2';
      else if (adSet.includes('BU4')) bu = 'BU4';
    }

    // Rule 3: Keyword Fallback
    if (!bu) {
      const allText = `${campaign} ${adSet} ${ad}`.toUpperCase();
      if (allText.includes('TRUNG QUỐC') || allText.includes('ĐÀI LOAN') || allText.includes('HỒNG KÔNG') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH')) bu = 'BU1';
      else if (allText.includes('ALASKA') || allText.includes('NAM MỸ') || allText.includes('CHÂU ÂU') || allText.includes('ÚC')) bu = 'BU2';
      else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO') || allText.includes('TÂY TẠNG') || allText.includes('ADVENTURE') || allText.includes('MÔNG CỔ')) bu = 'BU4';
    }

    if (!bu) bu = 'UNKNOWN';

    totalSpend += spend;
    results[bu].push({
      campaign: row['Tên chiến dịch'],
      adSet: row['Tên nhóm quảng cáo'],
      spend: spend,
      msgs: parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || 0),
      leads: parseInt(row['Khách hàng tiềm năng'] || 0)
    });
  });

  return { results, totalSpend };
};

const output = parseFile('./data_import/bao-cao-facebook-ads/Tuan1-thang3-nam2026.xlsx');
console.log(`--- KẾT QUẢ QUÉT TUẦN 1 THÁNG 3 ---`);
console.log(`Số dòng BU1: ${output.results['BU1'].length}`);
console.log(`Số dòng BU2: ${output.results['BU2'].length}`);
console.log(`Số dòng BU4: ${output.results['BU4'].length}`);
console.log(`Số dòng LỖI (UNKNOWN): ${output.results['UNKNOWN'].length}`);

if (output.results['UNKNOWN'].length > 0) {
  console.log(`\nCHI TIẾT CÁC DÒNG UNKNOWN:`);
  console.log(output.results['UNKNOWN']);
}

console.log(`\nTổng tiền quét được: ${output.totalSpend.toLocaleString()} VND`);
