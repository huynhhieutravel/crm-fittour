const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    const userOptions = (users || [])
    .filter(u => {
        if (!u.bus || !u.bus.includes('BU3')) return false;
        const nameL = (u.full_name || u.username || '').toLowerCase();
        if (nameL.includes('test')) return false;
        return true;
    })`;

const newCode = `    const userOptions = (users || [])
    .filter(u => {
        if (!u.bus || !u.bus.includes('BU3')) return false;
        if (u.role_name === 'admin') return false;
        const nameL = (u.full_name || u.username || '').toLowerCase();
        if (nameL.includes('test')) return false;
        if (nameL.includes('hiếu') || nameL.includes('hieu')) return false; // Hardcode remove Hiếu as requested
        return true;
    })`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success: Added extra filter for admin/Hiếu");
} else {
    console.log("Failed to find oldCode");
}
