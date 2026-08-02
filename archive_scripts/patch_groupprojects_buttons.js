const fs = require('fs');
const file = '/Users/huynhtronghieu/Documents/WORK Hiếu/crm-fittour/client/src/tabs/GroupProjectsTab.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTDs = `<td style={{ padding: '10px 8px', textAlign: 'center' }}>
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

const newTDs = `<td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <select
                                                value={p.status || 'Báo giá'}
                                                onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                                                    cursor: 'pointer', borderColor: 'transparent', width: '130px',
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
                                            <button 
                                                onClick={() => handleOpenProject(p, true)}
                                                style={{
                                                    background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '130px'
                                                }}
                                                title="Mở bảng tiến độ thực thi"
                                            >
                                                <Rocket size={12} /> Tiến độ thực thi
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProject(p, false, true)}
                                                style={{
                                                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '130px'
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
    console.log("Success: Aligned buttons");
} else {
    console.log("Failed to find oldTDs");
}
