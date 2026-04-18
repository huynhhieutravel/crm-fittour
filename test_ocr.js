const { readFileSync } = require('fs');

function forceLetters(str) {
  return str.replace(/0/g, 'O').replace(/1/g, 'I').replace(/2/g, 'Z').replace(/5/g, 'S').replace(/6/g, 'G').replace(/7/g, 'T').replace(/8/g, 'B');
}

function mergeNameStr(vis, mrz, isTruncated = false) {
  if (!vis) return mrz || '';
  if (!mrz) return vis || '';
  const vStr = vis.replace(/\s+/g, '');
  const mStr = mrz.replace(/\s+/g, '');
  if (vStr === mStr) return mrz;
  if (vStr.includes(mStr)) return isTruncated ? vis : mrz; 
  if (mStr.includes(vStr)) return vis;
  return mrz;
}

// Giả lập case
// 1. Nếu MRZ là MTRUONG X và Visual là RUONG X
console.log(mergeNameStr("RUONG X", "MTRUONG X"));

// 2. Nếu MRZ là RUONG X và Visual là MTRUONG X
console.log(mergeNameStr("MTRUONG X", "RUONG X"));

