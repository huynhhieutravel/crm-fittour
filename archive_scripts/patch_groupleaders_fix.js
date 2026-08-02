const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupLeadersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const errorCode = `(u.is_active !== false && (
                                    (u.teams || []).some(t => String(t.name || '').toLowerCase().includes('đoàn') || String(t.name || '').toLowerCase().includes('mice')) ||
                                    ['admin', 'manager', 'group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name) ||
                                    u.permissions?.group?.can_view
                                ))).map(u => (`;

const newCode = `(u.is_active !== false && (
                                    (u.teams || []).some(t => String(t.name || '').toLowerCase().includes('đoàn') || String(t.name || '').toLowerCase().includes('mice')) ||
                                    ['admin', 'manager', 'group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name) ||
                                    u.permissions?.group?.can_view
                                ))).map(u => (`;

// Let's just fix it properly by searching the exact block around line 199.
