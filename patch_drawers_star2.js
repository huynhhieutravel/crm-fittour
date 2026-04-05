const fs = require('fs');

const files = [
    'client/src/components/modals/RestaurantDetailDrawer.jsx',
    'client/src/components/modals/TransportDetailDrawer.jsx',
    'client/src/components/modals/TicketDetailDrawer.jsx',
    'client/src/components/modals/AirlineDetailDrawer.jsx',
    'client/src/components/modals/LandtourDetailDrawer.jsx',
    'client/src/components/modals/InsuranceDetailDrawer.jsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('import StarRating')) {
        content = content.replace(/(import React.*?;\n)/, "$1import StarRating from '../common/StarRating';\n");
    }

    // Since they don't have StarRating yet. The "Ghi chú đặc biệt" is inside `<div style={{ gridColumn: 'span 2' }}>`
    // We will extract the placeholder as it differs
    const searchStr = /<div style={{ gridColumn: 'span 2' }}>\s*<label style=\{labelStyle\}>Ghi chú đặc biệt<\/label>\s*<textarea style=\{\{\.\.\.drawerInputStyle, resize: 'vertical'\}\} value=\{formData\.notes\} onChange=\{e => setFormData\(\{\.\.\.formData, notes: e\.target\.value\}\)\} disabled=\{isViewOnly\} rows=\{2\} placeholder="([^"]*)" \/>\s*<\/div>/;

    if (content.match(searchStr)) {
        const replacement = `<div style={{ gridColumn: 'span 1' }}>
                                        <label style={labelStyle}>Ghi chú đặc biệt</label>
                                        <textarea style={{...drawerInputStyle, resize: 'vertical'}} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} placeholder="$1" />
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Đánh giá chất lượng</label>
                                        <StarRating 
                                            rating={Number(formData.rating) || 0} 
                                            onChange={(val) => setFormData({...formData, rating: val})} 
                                            disabled={isViewOnly} 
                                        />
                                    </div>`;
        content = content.replace(searchStr, replacement);
        fs.writeFileSync(file, content);
        console.log('Patched', file);
    } else {
        console.log('Not patched (String not found):', file);
    }
}
