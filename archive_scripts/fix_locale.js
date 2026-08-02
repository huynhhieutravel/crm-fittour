const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./client/src');
let changedCount = 0;

for (const file of files) {
    if (file.includes('App.jsx.stable_monolith.bak')) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace: new Date(...).toLocaleString('vi-VN') -> new Date(...).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleString\(\s*['"]vi-VN['"]\s*\)/g, "new Date($1).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
    
    // Replace: new Date(...).toLocaleString('vi-VN', { ... }) -> new Date(...).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ... })
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleString\(\s*['"]vi-VN['"]\s*,\s*\{/g, "new Date($1).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        changedCount++;
    }
}
console.log(`Total files updated: ${changedCount}`);
