const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove QUY MÔ header
content = content.replace(
    `<th style={{ padding: '12px 16px', textAlign: 'left' }}>TUYẾN ĐIỂM</th>\n                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>QUY MÔ</th>`,
    `<th style={{ padding: '12px 16px', textAlign: 'left' }}>TUYẾN ĐIỂM</th>`
);

// 2. Merge data cells
const oldData = `<td style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                                            <MapPin size={14} color="#94a3b8" />
                                            {p.destination || 'Chưa xác định'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {p.expected_pax} Pax
                                    </td>`;

const newData = `<td style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                                            <MapPin size={14} color="#94a3b8" />
                                            {p.destination || 'Chưa xác định'}
                                        </div>
                                        <div style={{ marginTop: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users size={12} color="#64748b" /> {p.expected_pax} Pax
                                        </div>
                                    </td>`;

if (content.includes(oldData)) {
    content = content.replace(oldData, newData);
    fs.writeFileSync(file, content);
    console.log("Success: merged columns");
} else {
    console.log("Failed to find oldData");
}
