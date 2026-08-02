const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    const allowedRoles = ['group_staff', 'group_manager', 'group_operations', 'group_operations_lead', 'admin', 'manager'];
    const userOptions = (users || [])
    .filter(u => allowedRoles.includes(u.role_name) || projects.some(p => p.assigned_to === u.id))
    .sort((a, b) => {`;

const newCode = `    const userOptions = (users || [])
    .filter(u => {
        if (u.business_unit !== 'BU3') return false;
        const nameL = (u.full_name || u.username || '').toLowerCase();
        if (nameL.includes('test')) return false;
        return true;
    })
    .sort((a, b) => {`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success: Filtered userOptions by BU3 and no test");
} else {
    console.log("Failed to find oldCode");
}
