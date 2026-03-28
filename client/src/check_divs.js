import fs from 'fs';
const content = fs.readFileSync('/Volumes/T7 Loki SS/WORK Hiếu/crm-fittour/client/src/App.jsx', 'utf8');
const lines = content.split('\n');
let stack = [];
lines.forEach((line, i) => {
  for (let char of line) {
    if (char === '{') stack.push(i + 1);
    else if (char === '}') {
      if (stack.length > 0) {
        const start = stack.pop();
        if (i+1 >= 2322 && i+1 <= 2680) {
           console.log('Line ' + (i+1) + ': } matches { from line ' + start);
        }
      }
    }
  }
});
