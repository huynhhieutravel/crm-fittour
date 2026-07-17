const fs = require('fs');

let code = fs.readFileSync('src/pages/LadakhConsultingPage.jsx', 'utf8');

const originalBlocks = `                    {/* ====== Reference Links Section ====== */}
                    {filteredMarketingLinks.length > 0 && (
                        <div id="references-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px', marginBottom: '60px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#0284c7' }}>
                                    <Library size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Tài Liệu Đào Tạo & Marketing
                                </h2>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                gap: '16px' 
                            }}>
                                {filteredMarketingLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            background: '#ffffff',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseOver={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 12px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)';
                                            e.currentTarget.style.borderColor = link.color;
                                        }}
                                        onMouseOut={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: \`\${link.color}15\`, color: link.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <div style={{ transform: 'scale(0.85)' }}>
                                                    {getIcon(link.icon)}
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: 0, flex: 1, lineHeight: '1.4' }}>
                                                {link.title}
                                            </h3>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                            {link.desc}
                                        </p>
                                        {link.url.match(/\\.(jpeg|jpg|gif|png|webp)$/i) && (
                                            <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                <img src={link.url} alt={link.title} style={{ width: '100%', height: '140px', display: 'block', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Mở xem <ExternalLink size={10} />
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(link.copyText);
                                                    const btn = e.currentTarget;
                                                    const originalText = btn.innerHTML;
                                                    btn.innerHTML = '<span style="color: #166534; display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Đã copy</span>';
                                                    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                                }}
                                                style={{
                                                    background: '#f8fafc',
                                                    color: '#475569',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Copy size={12} /> Copy gửi khách
                                            </button>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ====== Tour Links Section ====== */}
                    {filteredTourLinks.length > 0 && (
                        <div id="tours-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px', marginBottom: '60px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#059669' }}>
                                    <Map size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Sản Phẩm & Lịch Trình Tour
                                </h2>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                gap: '16px' 
                            }}>
                                {filteredTourLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            background: '#ffffff',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s',
                                            position: 'relative'
                                        }}
                                        onMouseOver={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 12px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)';
                                            e.currentTarget.style.borderColor = link.color;
                                        }}
                                        onMouseOut={(e) => { 
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: \`\${link.color}15\`, color: link.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <div style={{ transform: 'scale(0.85)' }}>
                                                    {getIcon(link.icon)}
                                                </div>
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', margin: 0, flex: 1, lineHeight: '1.4' }}>
                                                {link.title}
                                            </h3>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                            {link.desc}
                                        </p>
                                        {link.url.match(/\\.(jpeg|jpg|gif|png|webp)$/i) && (
                                            <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                <img src={link.url} alt={link.title} style={{ width: '100%', height: '140px', display: 'block', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#0ea5e9', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Mở xem <ExternalLink size={10} />
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(link.copyText);
                                                    const btn = e.currentTarget;
                                                    const originalText = btn.innerHTML;
                                                    btn.innerHTML = '<span style="color: #166534; display: flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Đã copy</span>';
                                                    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                                }}
                                                style={{
                                                    background: '#f8fafc',
                                                    color: '#475569',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Copy size={12} /> Copy gửi khách
                                            </button>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}`;

const startIndex = code.indexOf('{/* ====== Combined Links Section ====== */}');
const endIndex = code.indexOf('<div style={{ display: \'flex\', flexDirection: \'column\', gap: \'60px\' }}>', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find block to replace!");
    process.exit(1);
}

// Add filteredTourLinks definition
const filterLogic = `
    const filteredMarketingLinks = referenceLinks.filter(link => 
        link.type !== 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
    );
    const filteredTourLinks = referenceLinks.filter(link => 
        link.type === 'tour' && (link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch))
    );
    const filteredFaqs = groupedFaqs.map
`;
code = code.replace(/const filteredMarketingLinks = [^;]*;\n    const filteredFaqs = groupedFaqs\.map/s, filterLogic);

code = code.substring(0, startIndex) + originalBlocks + "\n                    " + code.substring(endIndex);

fs.writeFileSync('src/pages/LadakhConsultingPage.jsx', code);
console.log("Restored Ladakh full dual layout!");
