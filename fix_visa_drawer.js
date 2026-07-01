const fs = require('fs');
let content = fs.readFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', 'utf8');

// Add the renderTabs function right before return (
const renderTabsFn = `
    const renderTabs = () => {
        if (isViewOnly) return null;
        return (
            <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', flexShrink: 0, gap: '2rem' }}>
                <div onClick={() => setActiveTab('info')} style={{ padding: '16px 0', borderBottom: activeTab === 'info' ? '2px solid #3b82f6' : 'none', color: activeTab === 'info' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} /> Thông tin & Liên hệ
                </div>
                <div onClick={() => setActiveTab('services')} style={{ padding: '16px 0', borderBottom: activeTab === 'services' ? '2px solid #3b82f6' : 'none', color: activeTab === 'services' ? '#3b82f6' : '#64748b', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> Dịch vụ cung cấp
                </div>
            </div>
        );
    };

    return (
`;

content = content.replace(/    return \(/, renderTabsFn);

// Insert renderTabs() between header and body
content = content.replace(
    /<\/div>\n\n\n\n            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>/,
    `</div>\n\n            {renderTabs()}\n\n            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>`
);

// Wrap Info & Contact block in {(isViewOnly || activeTab === 'info') && ( ... )}
content = content.replace(
    /<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>/,
    `{(isViewOnly || activeTab === 'info') && (\n                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>`
);

// The end of Info & Contact block is before <div style={{ marginTop: '32px', borderTop: '2px dashed #e2e8f0', paddingTop: '32px' }}>
content = content.replace(
    /<\/div>\n\n                        <div style={{ marginTop: '32px', borderTop: '2px dashed #e2e8f0', paddingTop: '32px' }}>/,
    `</div>\n                        )}\n\n                        {(isViewOnly || activeTab === 'services') && (\n                        <div style={{ marginTop: isViewOnly ? '32px' : '0', borderTop: isViewOnly ? '2px dashed #e2e8f0' : 'none', paddingTop: isViewOnly ? '32px' : '0' }}>`
);

// The end of Services block is before </>
content = content.replace(
    /<\/div>\n                    <\/>/,
    `</div>\n                        )}\n                    </>`
);

// Also we need to fix the case where plus button for contacts is wrapped in {!isViewOnly && ...}
// I already did that in previous script but we need to ensure the closing div aligns with our wrap.

fs.writeFileSync('client/src/components/modals/VisaProviderDetailDrawer.jsx', content);
console.log('Fixed VisaProviderDetailDrawer.jsx');
