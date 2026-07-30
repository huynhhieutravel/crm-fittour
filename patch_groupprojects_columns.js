const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update headers
content = content.replace(
    `<th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>NGÀY ĐI - VỀ</th>\n                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>TÊN ĐOÀN (DỰ ÁN)</th>`,
    `<th style={{ padding: '12px 16px', textAlign: 'left' }}>TÊN ĐOÀN (DỰ ÁN)</th>`
);

// 2. Update colspan for loading/empty
content = content.replace(/colSpan="10"/g, 'colSpan="9"');

// 3. Update the 3 TDs
const oldTDs = `<td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        <div 
                                            onClick={() => handleOpenProject(p)}
                                            style={{ cursor: 'pointer' }}
                                            onMouseOver={e => e.currentTarget.style.opacity = '0.7'} 
                                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            <div style={{ color: '#1e293b', fontWeight: 600 }}>
                                                {p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }) : '---'}
                                            </div>
                                            {p.return_date && new Date(p.return_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', }) !== new Date(p.departure_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', }) && (
                                                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                    → {new Date(p.return_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <div 
                                            onClick={() => handleOpenProject(p)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                            onMouseOver={e => e.currentTarget.style.color = '#2563eb'} 
                                            onMouseOut={e => e.currentTarget.style.color = '#0f172a'}
                                        >
                                            <Briefcase size={16} color="#3b82f6" />
                                            {p.name}
                                        </div>
                                        <div style={{ marginTop: '6px' }}>
                                            <button 
                                                onClick={() => handleOpenProject(p, true)}
                                                style={{
                                                    background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                }}
                                                title="Mở bảng tiến độ thực thi"
                                            >
                                                <Rocket size={12} /> Tiến độ thực thi
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProject(p, false, true)}
                                                style={{
                                                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    marginTop: '4px'
                                                }}
                                                title="Mở bản trình duyệt A4"
                                            >
                                                📄 Bản trình duyệt
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                        <select
                                            value={p.status || 'Báo giá'}
                                            onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                                                cursor: 'pointer', borderColor: 'transparent', minWidth: '130px',
                                                appearance: 'none', background: stColors.bg, color: stColors.color,
                                                borderRadius: '6px', outline: 'none', textAlign: 'center'
                                            }}
                                        >
                                            <option value="Báo giá">Báo giá</option>
                                            <option value="Đang theo dõi">Đang theo dõi</option>
                                            <option value="Thành công">Thành công</option>
                                            <option value="Đã quyết toán">Đã quyết toán</option>
                                            <option value="Chưa thành công">Chưa thành công</option>
                                        </select>
                                    </td>`;

const newTDs = `<td style={{ padding: '10px 16px' }}>
                                        <div 
                                            onClick={() => handleOpenProject(p)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                                            onMouseOver={e => e.currentTarget.style.color = '#2563eb'} 
                                            onMouseOut={e => e.currentTarget.style.color = '#0f172a'}
                                        >
                                            <Briefcase size={16} color="#3b82f6" />
                                            {p.name}
                                        </div>
                                        <div 
                                            onClick={() => handleOpenProject(p)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '6px' }}
                                            onMouseOver={e => e.currentTarget.style.opacity = '0.7'} 
                                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            <Calendar size={12} color="#64748b" />
                                            <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>{p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }) : '---'}</span>
                                                {p.return_date && new Date(p.return_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', }) !== new Date(p.departure_date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', }) && (
                                                    <>→ <span>{new Date(p.return_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</span></>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                        <select
                                            value={p.status || 'Báo giá'}
                                            onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                                                cursor: 'pointer', borderColor: 'transparent', minWidth: '130px',
                                                appearance: 'none', background: stColors.bg, color: stColors.color,
                                                borderRadius: '6px', outline: 'none', textAlign: 'center'
                                            }}
                                        >
                                            <option value="Báo giá">Báo giá</option>
                                            <option value="Đang theo dõi">Đang theo dõi</option>
                                            <option value="Thành công">Thành công</option>
                                            <option value="Đã quyết toán">Đã quyết toán</option>
                                            <option value="Chưa thành công">Chưa thành công</option>
                                        </select>
                                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <button 
                                                onClick={() => handleOpenProject(p, true)}
                                                style={{
                                                    background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                                                }}
                                                title="Mở bảng tiến độ thực thi"
                                            >
                                                <Rocket size={12} /> Tiến độ thực thi
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProject(p, false, true)}
                                                style={{
                                                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content'
                                                }}
                                                title="Mở bản trình duyệt A4"
                                            >
                                                📄 Bản trình duyệt
                                            </button>
                                        </div>
                                    </td>`;

if (content.includes(oldTDs)) {
    content = content.replace(oldTDs, newTDs);
    fs.writeFileSync(file, content);
    console.log("Success: Merged Columns for Project Name and Status Buttons");
} else {
    console.log("Failed to find oldTDs");
}
