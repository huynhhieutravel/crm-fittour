const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/components/modals/GroupProjectDetailDrawer.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `const userOptions = (users || [])
        .filter(u => u.is_active !== false && allowedRoles.includes(u.role_name))
        .map(u => ({
            value: u.id, 
            label: \`\${u.full_name || u.username || \`User \${u.id}\`} (\${formatRoleDisplayName(u.role_name)})\`
        }));`;
const newCode = `const userOptions = (users || [])
        .filter(u => (u.is_active !== false && allowedRoles.includes(u.role_name)) || u.id === formData.assigned_to)
        .map(u => ({
            value: u.id, 
            label: \`\${u.full_name || u.username || \`User \${u.id}\`} (\${formatRoleDisplayName(u.role_name)})\${u.is_active === false ? ' (TẠM DỪNG)' : ''}\`
        }));`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content);
    console.log("Success GroupProjectDetailDrawer");
} else {
    console.log("Failed to find oldCode in GroupProjectDetailDrawer");
}
