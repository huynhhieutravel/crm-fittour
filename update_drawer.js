const fs = require('fs');
let content = fs.readFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', 'utf8');

// 1. Update component signature
content = content.replace(
    /const VisaProviderDetailDrawer = \({ provider, onClose, onSuccess, addToast }\) => {/,
    "const VisaProviderDetailDrawer = ({ provider, onClose, onSuccess, onEdit, onDelete, mode = 'edit', addToast, currentUser, checkPerm }) => {"
);

// 2. Add isViewOnly var
content = content.replace(
    /const \[saving, setSaving\] = useState\(false\);/,
    "const [saving, setSaving] = useState(false);\n    const isViewOnly = mode === 'view';"
);

// 3. Update header action buttons
content = content.replace(
    /<button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>\s*<Save size={16} \/> \{saving \? 'Đang lưu\.\.\.' : 'Lưu lại'\}\s*<\/button>/m,
    `{!isViewOnly && (
                        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                    )}
                    {isViewOnly && onEdit && (
                        <button onClick={onEdit} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            Chỉnh sửa
                        </button>
                    )}`
);

// 4. Update Delete Contact button
content = content.replace(
    /<button onClick={\(\) => handleDeleteContact\(c.id\)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} \/><\/button>/g,
    "{!isViewOnly && <button onClick={() => handleDeleteContact(c.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>}"
);

// 5. Update Add Contact button
content = content.replace(
    /<button onClick={handleAddContact} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>\s*<Plus size={18} \/> Thêm người liên hệ\s*<\/button>/m,
    `{!isViewOnly && (
                                        <button onClick={handleAddContact} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <Plus size={18} /> Thêm người liên hệ
                                        </button>
                                    )}`
);

// 6. Update Delete Service button
content = content.replace(
    /<button onClick={\(\) => handleDeleteService\(s.id\)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={16} \/><\/button>/g,
    "{!isViewOnly && <button onClick={() => handleDeleteService(s.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={16} /></button>}"
);

// 7. Update Add Service button
content = content.replace(
    /<button onClick={handleAddService} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>\s*<Plus size={18} \/> Thêm dịch vụ\s*<\/button>/m,
    `{!isViewOnly && (
                                    <button onClick={handleAddService} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Plus size={18} /> Thêm dịch vụ
                                    </button>
                                )}`
);

// 8. Add disabled={isViewOnly} to inputs, textareas, Select
content = content.replace(/<input /g, '<input disabled={isViewOnly} ');
content = content.replace(/<textarea /g, '<textarea disabled={isViewOnly} ');
content = content.replace(/<Select /g, '<Select isDisabled={isViewOnly} ');

fs.writeFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', content);
console.log('Done!');
