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
    let content = fs.readFileSync(file, 'utf8');

    // 1. Initial State
    content = content.replace(/bank_account_name: '', bank_account_number: '', bank_name: ''\n    }\);/g, "bank_account_name: '', bank_account_number: '', bank_name: '', rating: ''\n    });");

    // 2. useEffect destructuring (looking for market: ...)
    content = content.replace(/market: ([a-zA-Z]+)\.market \|\| ''\n            }\);/g, "market: $1.market || '', rating: $1.rating || ''\n            });");

    // 3. UI Notes
    const searchStr = `<div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Ghi chú đặc biệt</label>
                                        <textarea style={{...drawerInputStyle, resize: 'vertical'}} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} />
                                    </div>`;
    const repStr = `<div className="form-group" style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Ghi chú đặc biệt</label>
                                        <textarea style={{...drawerInputStyle, resize: 'vertical'}} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Đánh giá chất lượng</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="number" min="0" max="5" step="0.1" style={{...drawerInputStyle, fontWeight: 'bold', color: '#f59e0b', fontSize: '1.2rem', padding: '8px 14px', width: '100px'}} value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} disabled={isViewOnly} placeholder="0.0" />
                                            <span style={{ fontSize: '1.5rem', color: '#f59e0b' }}>★</span>
                                        </div>
                                    </div>`;
    
    content = content.replace(searchStr, repStr);

    fs.writeFileSync(file, content);
    console.log('Patched', file);
}
