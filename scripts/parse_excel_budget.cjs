const xlsx = require('xlsx');
const path = require('path');
const wb = xlsx.readFile('./docs/BANG_DU_TOAN_DOANH_THU_LOI_NHUAN_ADS_BUDGET_5BU_Q4_2026.xlsx');

console.log('=== TOURS IN EXCEL BANG_DU_TOAN ===');
const excelTours = [];

for (const sheetName of ['BU1_TrungQuoc', 'BU2_NhatBan', 'BU3_ChauAu_Uc', 'BU4_NamA_Himalaya', 'BU5_DocLa_TrungDong']) {
  const ws = wb.Sheets[sheetName];
  if (!ws) continue;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  // Header row is row 5
  // Col 0: Tour name, Col 1: Date, Col 2: Pax, Col 3: Break-even, Col 4: Price, Col 5: Cost, Col 9: CR%, Col 11: CPL, Col 15: Notes
  for (let i = 6; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0] || String(r[0]).trim() === '') continue;
    excelTours.push({
      bu: sheetName.split('_')[0],
      name: String(r[0]).trim(),
      date: r[1],
      pax: r[2],
      breakEven: r[3],
      price: r[4],
      cost: r[5],
      crSale: r[9],
      cpl: r[11],
      notes: r[15]
    });
  }
}

console.log(`Loaded ${excelTours.length} tours from Excel:`);
console.table(excelTours.map(t => ({
  bu: t.bu,
  name: t.name,
  date: t.date,
  price: t.price ? Number(t.price).toLocaleString('vi-VN') : '',
  cost: t.cost ? Number(t.cost).toLocaleString('vi-VN') : '',
  cpl: t.cpl ? Number(t.cpl).toLocaleString('vi-VN') : '',
  notes: (t.notes || '').slice(0, 30)
})));
