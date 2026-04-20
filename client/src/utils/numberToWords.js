const defaultNumbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function chunkNumber(numberStr) {
  const chunks = [];
  let index = numberStr.length;
  while (index > 0) {
    chunks.push(numberStr.substring(Math.max(0, index - 3), index));
    index -= 3;
  }
  return chunks; // Returns chunks of hundreds (e.g. ['000', '123'] for 123000)
}

function readChunk(chunk) {
  let [h, t, u] = [0, 0, 0];
  if (chunk.length === 3) {
    h = parseInt(chunk[0]);
    t = parseInt(chunk[1]);
    u = parseInt(chunk[2]);
  } else if (chunk.length === 2) {
    t = parseInt(chunk[0]);
    u = parseInt(chunk[1]);
  } else {
    u = parseInt(chunk[0]);
  }

  let words = [];

  // Read Hundreds
  if (chunk.length === 3) {
    words.push(defaultNumbers[h] + ' trăm');
    if (h !== 0 && t === 0 && u !== 0) words.push('lẻ');
  }

  // Read Tens
  if (t !== 0) {
    if (t === 1) words.push('mười');
    else words.push(defaultNumbers[t] + ' mươi');
  }

  // Read Units
  if (u !== 0) {
    if (u === 1 && t !== 0 && t !== 1) words.push('mốt');
    else if (u === 5 && t !== 0) words.push('lăm');
    else words.push(defaultNumbers[u]);
  }

  return words.join(' ');
}

export function numberToWordsInVND(num) {
  if (!num || num === 0) return 'Không đồng chẵn';
  const units = ['', 'nghìn', 'triệu', 'tỉ', 'nghìn tỉ', 'triệu tỉ'];
  
  let numStr = Math.abs(num).toString();
  const chunks = chunkNumber(numStr);
  
  let wordsArray = [];
  
  for (let i = chunks.length - 1; i >= 0; i--) {
    if (parseInt(chunks[i]) !== 0) {
      let chunkText = readChunk(chunks[i]);
      if (chunks.length > 1 && chunks[i].length < 3 && i !== chunks.length -1) { // missing hundreds
          chunkText = 'không trăm ' + (parseInt(chunks[i]) < 10 ? 'lẻ ' : '') + chunkText;
      }
      wordsArray.push(chunkText + (units[i] ? ' ' + units[i] : ''));
    }
  }

  let result = wordsArray.join(' ').trim();
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result + ' đồng chẵn';
}
