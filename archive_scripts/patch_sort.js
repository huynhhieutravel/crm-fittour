const fs = require('fs');

function patchFile(file, oldCode, newCode) {
    if (!fs.existsSync(file)) return console.log(`File not found: ${file}`);
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldCode)) {
        content = content.replace(oldCode, newCode);
        fs.writeFileSync(file, content);
        console.log(`Success: ${file}`);
    } else {
        console.log(`Failed to find oldCode in: ${file}`);
    }
}

// 1. GroupProjectsTab.jsx
patchFile(
    '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx',
    `.filter(u => allowedRoles.includes(u.role_name) || projects.some(p => p.assigned_to === u.id))
    .map(u => ({`,
    `.filter(u => allowedRoles.includes(u.role_name) || projects.some(p => p.assigned_to === u.id))
    .sort((a, b) => {
        if (a.is_active === false && b.is_active !== false) return 1;
        if (a.is_active !== false && b.is_active === false) return -1;
        const nameA = (a.full_name || a.username || '').toLowerCase();
        const nameB = (b.full_name || b.username || '').toLowerCase();
        return nameA.localeCompare(nameB);
    })
    .map(u => ({`
);

// 2. B2BCompaniesTab.jsx
// Note: This is an inline map, we need to extract the filter part carefully.
patchFile(
    '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/B2BCompaniesTab.jsx',
    `{users.filter(u => ['group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name) || companies.some(c => c.assigned_to === u.id)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}{u.is_active === false ? ' (TẠM DỪNG)' : ''}</option>)}`,
    `{users.filter(u => ['group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name) || companies.some(c => c.assigned_to === u.id))
          .sort((a, b) => {
            if (a.is_active === false && b.is_active !== false) return 1;
            if (a.is_active !== false && b.is_active === false) return -1;
            return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
          })
          .map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}{u.is_active === false ? ' (TẠM DỪNG)' : ''}</option>)}`
);

// 3. GroupProjectDetailDrawer.jsx
patchFile(
    '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/components/modals/GroupProjectDetailDrawer.jsx',
    `.filter(u => (u.is_active !== false && allowedRoles.includes(u.role_name)) || u.id === formData.assigned_to)
        .map(u => ({`,
    `.filter(u => (u.is_active !== false && allowedRoles.includes(u.role_name)) || u.id === formData.assigned_to)
        .sort((a, b) => {
            if (a.is_active === false && b.is_active !== false) return 1;
            if (a.is_active !== false && b.is_active === false) return -1;
            return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
        })
        .map(u => ({`
);
