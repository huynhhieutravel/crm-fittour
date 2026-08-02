const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupLeadersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `{users.filter(u => u.is_active !== false && (`;
const newCode = `{users.filter(u => leaders.some(l => l.assigned_to === u.id) || (u.is_active !== false && (`;

if (content.includes(oldCode)) {
    // There are multiple instances of this filter? One for assignedFilter dropdown, one for inline assign dropdown!
    // We should allow suspended users for FILTER dropdown, and ALSO for inline assign IF they are currently assigned?
    // Wait, it's easier to just do:
    content = content.replaceAll('{users.filter(u => u.is_active !== false && (', '{users.filter(u => leaders.some(l => l.assigned_to === u.id) || (u.is_active !== false && (');
    fs.writeFileSync(file, content);
    console.log("Success GroupLeadersTab");
} else {
    console.log("Failed to find oldCode in GroupLeadersTab");
}
