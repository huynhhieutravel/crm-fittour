const XLSX = require('xlsx');

const files = [
  { week: 1, name: 'tuan1-thang2-nam2026.xlsx' },
  { week: 2, name: 'tuan2-thang2-nam2026.xlsx' },
  { week: 3, name: 'tuan3-thang2-nam2026.xlsx' },
  { week: 4, name: 'tuan4-thang2-nam2026.xlsx' }
];

let unknownSet = new Set();
let counts = { BU1: 0, BU2: 0, BU4: 0, UNKNOWN: 0 };

for (let fileObj of files) {
  const filePath = `../data_import/bao-cao-facebook-ads/${fileObj.name}`;
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  for (const row of data) {
    const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toUpperCase();
    const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toUpperCase();
    const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toUpperCase();

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
      const allText = `${campaign} ${adSet} ${ad}`;
      if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM')) bu = 'BU1';
      else if (allText.includes('ALASKA') || allText.includes('NAM MỸ') || allText.includes('CHÂU ÂU')) bu = 'BU2';
      else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO') || allText.includes('TÂY TẠNG')) bu = 'BU4';
    }

    if (!bu) {
      bu = 'UNKNOWN';
      unknownSet.add(`${campaign} | ${adSet} | ${ad}`);
    }

    counts[bu]++;
  }
}

console.log("Tổng hợp kết quả nhận diện Tháng 2:");
console.log(counts);

if (unknownSet.size > 0) {
  console.log("\nDANH SÁCH CÁC TÊN KHÔNG THỂ PHÂN LOẠI (Cần sếp định nghĩa BU):");
  unknownSet.forEach(item => console.log("-", item));
}
