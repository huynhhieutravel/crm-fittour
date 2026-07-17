const fs = require('fs');

function processFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace the filter definitions
    code = code.replace(
        /const filteredMarketingLinks[\s\S]*?normalizedSearch\)\)\n    \);/g,
        `const filteredAllLinks = referenceLinks.filter(link => 
        link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch)
    );`
    );

    // Replace TOC condition
    code = code.replace(
        /\(filteredTourLinks\.length > 0 \|\| filteredMarketingLinks\.length > 0\)/g,
        `(filteredAllLinks.length > 0)`
    );

    // Find the Reference Links Section and Tour Links Section
    // We will extract the structure of the Marketing links block and modify it
    const refLinksRegex = /\{\/\* ====== Reference Links Section ======\*\/\}[\s\S]*?\{\/\* ====== FAQs Section ======\*\/\}/;
    const match = code.match(refLinksRegex);
    
    if (match) {
        let block = match[0];
        
        // Extract the inner mapping block for marketing links
        // We know it starts with {filteredMarketingLinks.length > 0 && (
        
        let newBlock = `{\/\* ====== Combined Links Section ======\*\/}
                    {filteredAllLinks.length > 0 && (
                        <div id="references-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px' }}>
                                <div style={{ color: '#0284c7' }}>
                                    <Library size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                                    Link / Bài Viết Gửi Khách
                                </h2>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                                gap: '16px' 
                            }}>
                                {filteredAllLinks.map((link, idx) => (
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
                                                onClick={(e) => handleCopyLink(e, link)}
                                                style={{
                                                    background: copiedLink === link.url ? '#10b981' : '#f8fafc',
                                                    color: copiedLink === link.url ? '#fff' : '#475569',
                                                    border: copiedLink === link.url ? '1px solid #10b981' : '1px solid #e2e8f0',
                                                    padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {copiedLink === link.url ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                {copiedLink === link.url ? 'Đã copy' : 'Copy gửi khách'}
                                            </button>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ====== FAQs Section ====== */}`;

        code = code.replace(match[0], newBlock);
    }
    
    fs.writeFileSync(filePath, code);
}

processFile('client/src/pages/BhutanConsultingPage.jsx');
processFile('client/src/pages/LadakhConsultingPage.jsx');
console.log('Merge complete for both files.');
