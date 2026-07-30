const fs = require('fs');

const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupLeadersTab.jsx';
if (!fs.existsSync(file)) return console.log(`File not found: ${file}`);
let content = fs.readFileSync(file, 'utf8');

// The block ends with `.map(u => (`
const oldCode = `)).map(u => (`
const newCode = `))
.sort((a, b) => {
    if (a.is_active === false && b.is_active !== false) return 1;
    if (a.is_active !== false && b.is_active === false) return -1;
    return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
})
.map(u => (`

// Note: there are two instances of this in GroupLeadersTab.jsx. We replace all of them.
if (content.includes(oldCode)) {
    content = content.replaceAll(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success GroupLeadersTab Sort");
} else {
    console.log("Failed to find oldCode in GroupLeadersTab Sort");
}
