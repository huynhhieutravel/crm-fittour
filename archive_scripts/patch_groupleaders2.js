const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupLeadersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `>{u.full_name || u.username}</option>`;
const newCode = `>{u.full_name || u.username}{u.is_active === false ? ' (TẠM DỪNG)' : ''}</option>`;

if (content.includes(oldCode)) {
    content = content.replaceAll(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success GroupLeadersTab 2");
} else {
    console.log("Failed to find oldCode in GroupLeadersTab 2");
}
