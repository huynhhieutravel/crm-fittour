const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace userOptions definition
const oldCode = `const userOptions = (users || []).filter(u => u.is_active !== false && allowedRoles.includes(u.role_name))
    .map(u => ({
        value: u.id.toString(), 
        label: \`\${u.full_name || u.username} (\${formatRoleDisplayName(u.role_name)})\`
    }));`;
const newCode = `const userOptions = (users || [])
    .filter(u => allowedRoles.includes(u.role_name) || projects.some(p => p.assigned_to === u.id))
    .map(u => ({
        value: u.id.toString(), 
        label: \`\${u.full_name || u.username} (\${formatRoleDisplayName(u.role_name)})\${u.is_active === false ? ' (TẠM DỪNG)' : ''}\`
    }));`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success GroupProjectsTab");
} else {
    console.log("Failed to find oldCode in GroupProjectsTab");
}
