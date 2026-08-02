const fs = require('fs');

const path = 'client/src/components/modals/VisaProviderDetailDrawer.jsx';
let content = fs.readFileSync(path, 'utf-8');

// Find the return statement
const returnIndex = content.indexOf('return (');

const viewOnlyUI = `
    if (isViewOnly) {
        return (
            <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
                <div className="drawer-content" style={{ width: '900px', maxWidth: '100%', background: '#f1f5f9', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onClick={e => e.stopPropagation()}>
                    {/* VIEW HEADER */}
                    <div style={{ padding: '2rem 2.5rem', background: 'linear-gradient(to right, #0284c7, #0369a1)', color: 'white', position: 'relative', flexShrink: 0 }}>
                        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', color: 'white' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Building size={28} color="#7dd3fc"/> {form.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#bae6fd' }}>
                            <span><strong>Mã:</strong> {form.code || 'N/A'}</span>
                            <span><strong>Quốc gia xử lý:</strong> {form.country || 'N/A'}</span>
                            <span><strong>TG Xử lý:</strong> {form.processing_time || 'N/A'}</span>
                        </div>
                    </div>

                    {/* VIEW BODY (No Tabs, Everything Scrollable) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 1. THÔNG TIN CHUNG */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <Map size={18} color="#0284c7" /> THÔNG TIN LIÊN LẠC & GHI CHÚ
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>SỐ ĐIỆN THOẠI</div><div style={{ fontWeight: 500 }}>{form.phone || '-'}</div></div>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>EMAIL</div><div style={{ fontWeight: 500 }}>{form.email || '-'}</div></div>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>THỊ TRƯỜNG</div><div style={{ fontWeight: 500 }}>{form.market || '-'}</div></div>
                                <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>ĐỊA CHỈ</div><div style={{ fontWeight: 500 }}>{form.address || '-'}</div></div>
                                {form.notes && (
                                    <div style={{ gridColumn: '1 / -1', background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, marginBottom: '4px' }}>GHI CHÚ NỘI BỘ</div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#92400e' }}>{form.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. NGƯỜI LIÊN HỆ */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <Users size={18} color="#0284c7" /> NGƯỜI LIÊN HỆ VẬN HÀNH
                            </h3>
                            {contacts.length === 0 ? <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Chưa có người liên hệ.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 16px', borderRadius: '6px 0 0 6px' }}>Họ Tên</th>
                                            <th style={{ padding: '10px 16px' }}>Chức Vụ</th>
                                            <th style={{ padding: '10px 16px' }}>Điện Thoại</th>
                                            <th style={{ padding: '10px 16px', borderRadius: '0 6px 6px 0' }}>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.map((c, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name || '-'}</td>
                                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.position || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{c.phone || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{c.email || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* 3. DỊCH VỤ CUNG CẤP */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <ShoppingBag size={18} color="#0284c7" /> DỊCH VỤ VISA CUNG CẤP
                            </h3>
                            {services.length === 0 ? <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Chưa có dịch vụ nào.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 16px', borderRadius: '6px 0 0 6px' }}>Mã SKU</th>
                                            <th style={{ padding: '10px 16px' }}>Tên Dịch Vụ</th>
                                            <th style={{ padding: '10px 16px' }}>Loại Visa</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Giá Net</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Giá Bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px', color: '#0284c7', fontWeight: 600 }}>{s.sku || '-'}</td>
                                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.name || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{s.visa_type || '-'}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.cost_price ? Number(s.cost_price).toLocaleString() : '-'}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>{s.sale_price ? Number(s.sale_price).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

`;

content = content.slice(0, returnIndex) + viewOnlyUI + content.slice(returnIndex);
fs.writeFileSync(path, content);
console.log("Updated VisaProviderDetailDrawer.jsx");
