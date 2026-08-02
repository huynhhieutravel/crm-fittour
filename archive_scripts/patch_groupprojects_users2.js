const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    const userOptions = (users || [])
    .filter(u => {
        if (u.business_unit !== 'BU3') return false;
        const nameL = (u.full_name || u.username || '').toLowerCase();
        if (nameL.includes('test')) return false;
        return true;
    })
    .sort((a, b) => {`;

const newCode = `    const userOptions = (users || [])
    .filter(u => {
        if (!u.bus || !u.bus.includes('BU3')) return false;
        const nameL = (u.full_name || u.username || '').toLowerCase();
        if (nameL.includes('test')) return false;
        return true;
    })
    .sort((a, b) => {`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success: Fixed bus filter");
} else {
    console.log("Failed to find oldCode");
}
