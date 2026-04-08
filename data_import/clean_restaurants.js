const XLSX = require('xlsx');
const path = require('path');

const inputFile = path.join(__dirname, 'raw/bang-nha-hang.xlsx');
const outputFile = path.join(__dirname, 'raw/bang-nha-hang.xlsx'); // overwrite

// Vietnamese-aware Title Case
function toTitleCase(str) {
  if (!str) return str;
  // List of small words to keep lowercase (except at start)
  const smallWords = ['và', 'của', 'với', 'trong', 'ngoài', 'trên', 'dưới'];
  
  return str.split(/(\s+|-)/g).map((word, idx) => {
    // Keep separators as-is
    if (/^[\s-]+$/.test(word)) return word;
    // Keep acronyms like KS, NH as-is if they are 2 chars
    if (word.length <= 2 && /^[A-Z]+$/.test(word)) return word;
    // Lowercase the word first
    const lower = word.toLowerCase();
    // Capitalize first letter
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}

const wb = XLSX.readFile(inputFile, { cellStyles: true });
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];

// Get range
const range = XLSX.utils.decode_range(ws['!ref']);
console.log('Original range:', ws['!ref']);

// Expand range to include column D
range.e.c = Math.max(range.e.c, 3); // D = column 3
ws['!ref'] = XLSX.utils.encode_range(range);

// Process each row
for (let row = range.s.r; row <= range.e.r; row++) {
  const cellA = XLSX.utils.encode_cell({ r: row, c: 0 }); // Miền
  const cellB = XLSX.utils.encode_cell({ r: row, c: 1 }); // Địa danh
  const cellC = XLSX.utils.encode_cell({ r: row, c: 2 }); // Tên nhà hàng
  const cellD = XLSX.utils.encode_cell({ r: row, c: 3 }); // Link Drive (new)
  
  // Title Case column A (Miền)
  if (ws[cellA] && ws[cellA].v) {
    const original = ws[cellA].v;
    ws[cellA].v = toTitleCase(original);
    ws[cellA].w = ws[cellA].v;
    console.log(`A${row+1}: "${original}" -> "${ws[cellA].v}"`);
  }
  
  // Title Case column B (Địa danh)
  if (ws[cellB] && ws[cellB].v) {
    const original = ws[cellB].v;
    ws[cellB].v = toTitleCase(original);
    ws[cellB].w = ws[cellB].v;
    console.log(`B${row+1}: "${original}" -> "${ws[cellB].v}"`);
  }
  
  // Title Case column C (Tên nhà hàng)
  if (ws[cellC] && ws[cellC].v) {
    const original = ws[cellC].v;
    ws[cellC].v = toTitleCase(original);
    ws[cellC].w = ws[cellC].v;
    
    // Extract hyperlink to column D
    if (ws[cellC].l && ws[cellC].l.Target) {
      let link = ws[cellC].l.Target.replace(/&amp;/g, '&');
      ws[cellD] = { v: link, t: 's', l: { Target: link } };
      console.log(`C${row+1}: "${original}" -> "${ws[cellC].v}" | D: ${link.substring(0, 60)}...`);
    } else {
      // No link — leave D empty
      console.log(`C${row+1}: "${original}" -> "${ws[cellC].v}" | D: (no link)`);
    }
  }
}

// Write back
XLSX.writeFile(wb, outputFile);
console.log('\n✅ Saved to:', outputFile);
