const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('./data_import/raw/mau-export-ds-tour.xls');
const wsName = wb.SheetNames[0];
const ws = wb.Sheets[wsName];

console.log("----- CELLS -----");
const range = XLSX.utils.decode_range(ws['!ref']);
for(let R = range.s.r; R <= Math.min(20, range.e.r); ++R) {
  let rowStr = [];
  for(let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = {c:C, r:R};
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    const cell = ws[cellRef];
    if(cell && cell.v !== undefined) {
      rowStr.push(`Col ${XLSX.utils.encode_col(C)}: "${(cell.w || cell.v).toString().replace(/\n/g, '\\n')}"`);
    }
  }
  if (rowStr.length > 0) {
    console.log(`Row ${R+1}: ${rowStr.join(' | ')}`);
  }
}

console.log("\n----- MERGED CELLS -----");
if (ws['!merges']) {
  ws['!merges'].forEach(m => {
    console.log(`Merged: ${XLSX.utils.encode_cell(m.s)} to ${XLSX.utils.encode_cell(m.e)}`);
  });
}
