const fs = require('fs');

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

    // Handle toLocaleDateString
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleDateString\(\s*['"]vi-VN['"]\s*\)/g, "new Date($1).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleDateString\(\s*['"]vi-VN['"]\s*,\s*\{/g, "new Date($1).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ");
    
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleDateString\(\s*['"]en-CA['"]\s*\)/g, "new Date($1).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })");
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleDateString\(\s*['"]en-CA['"]\s*,\s*\{/g, "new Date($1).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', ");

    // Handle just variable calls: bdt.toLocaleDateString('vi-VN') -> bdt.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    // Careful not to match things that we just replaced.
    // So we match ([\w.]+)\.toLocaleDateString('vi-VN')
    content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleDateString\(\s*['"]vi-VN['"]\s*\)/g, "$1.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
    content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleDateString\(\s*['"]en-CA['"]\s*\)/g, "$1.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })");

    // Handle toLocaleTimeString
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleTimeString\(\s*['"]vi-VN['"]\s*\)/g, "new Date($1).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
    content = content.replace(/new Date\(([^)]*)\)\.toLocaleTimeString\(\s*['"]vi-VN['"]\s*,\s*\{/g, "new Date($1).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ");

    content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleTimeString\(\s*['"]vi-VN['"]\s*\)/g, "$1.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })");
    content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleTimeString\(\s*['"]vi-VN['"]\s*,\s*\{/g, "$1.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ");

    // Deduplicate in case we doubled it up (e.g. if the original code ALREADY had timeZone: 'Asia/Ho_Chi_Minh')
    content = content.replace(/timeZone:\s*['"]Asia\/Ho_Chi_Minh['"],\s*timeZone:\s*['"]Asia\/Ho_Chi_Minh['"],?/g, "timeZone: 'Asia/Ho_Chi_Minh',");
    content = content.replace(/timeZone:\s*['"]Asia\/Ho_Chi_Minh['"],\s*timeZone:\s*['"]Asia\/Ho_Chi_Minh['"]/g, "timeZone: 'Asia/Ho_Chi_Minh'");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        changedCount++;
    }
}
console.log(`Total files updated: ${changedCount}`);
