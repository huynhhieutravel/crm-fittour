const fs = require('fs');
let content = fs.readFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', 'utf8');

// 1. Hide "Lưu lại" button
content = content.replace(
    /<button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>\s*<Save size={16} \/> \{saving \? 'Đang lưu\.\.\.' : 'Lưu lại'\}\s*<\/button>/g,
    `{!isViewOnly && (
                        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                    )}`
);

// 2. Hide "Thêm người liên hệ" button
content = content.replace(
    /<button onClick={handleAddContact} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>\s*<Plus size={18} \/> Thêm người liên hệ\s*<\/button>/g,
    `{!isViewOnly && (
                                    <button onClick={handleAddContact} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Plus size={18} /> Thêm người liên hệ
                                    </button>
                                    )}`
);

// 3. Hide Trash can for Contacts
content = content.replace(
    /<button onClick={\(\) => handleDeleteContact\(c.id\)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} \/><\/button>/g,
    `{!isViewOnly && <button onClick={() => handleDeleteContact(c.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>}`
);

// 4. Hide "Thêm dịch vụ" button (if exists)
content = content.replace(
    /<button onClick={handleAddService} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>\s*<Plus size={18} \/> Thêm dịch vụ\s*<\/button>/g,
    `{!isViewOnly && (
                                <button onClick={handleAddService} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                                    <Plus size={18} /> Thêm dịch vụ
                                </button>
                                )}`
);

// 5. Hide Trash can for Services
content = content.replace(
    /<button onClick={\(\) => handleDeleteService\(s.id\)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={16} \/><\/button>/g,
    `{!isViewOnly && <button onClick={() => handleDeleteService(s.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={16} /></button>}`
);

fs.writeFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', content);
console.log('Fixed VisaProviderDetailDrawer.jsx buttons');
