const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/B2BCompaniesTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode1 = `{users.filter(u => ['group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}`;
const newCode1 = `{users.filter(u => ['group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name) || companies.some(c => c.assigned_to === u.id)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}{u.is_active === false ? ' (TẠM DỪNG)' : ''}</option>)}`;

if (content.includes(oldCode1)) {
    content = content.replaceAll(oldCode1, newCode1);
    fs.writeFileSync(file, content);
    console.log("Success B2BCompaniesTab");
} else {
    console.log("Failed to find oldCode1 in B2BCompaniesTab");
}
