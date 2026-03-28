import fs from 'fs';
const content = fs.readFileSync('/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/App.jsx', 'utf8');
const lines = content.split('\n');
let stack = [];
lines.forEach((line, i) => {
  const lineNum = i + 1;
  for (let char of line) {
    if (char === '{') {
      stack.push(lineNum);
    } else if (char === '}') {
      if (stack.length > 0) {
        const startLine = stack.pop();
        if (lineNum >= 2320 && lineNum <= 2680) {
          console.log(`Line ${lineNum}: } matches { from line ${startLine}`);
        }
      } else {
        if (lineNum >= 2320 && lineNum <= 2680) {
          console.log(`Line ${lineNum}: Extra } found!`);
        }
      }
    }
  }
});
console.log('Final stack size:', stack.length);
if (stack.length > 0) {
  console.log('Last 5 unclosed braces started at lines:', stack.slice(-5));
}
