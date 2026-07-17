const fs = require('fs');

let code = fs.readFileSync('client/src/pages/LadakhConsultingPage.jsx', 'utf8');

const referenceLinks = `
const referenceLinks = [
    { 
        title: "Danh Sách Tour Ladakh", 
        desc: "Xem nhanh các lịch trình và ngày khởi hành", 
        url: "https://fittour.vn/country/ladakh/", 
        icon: "List", 
        color: "#8b5cf6",
        type: "tour",
        copyText: "Dạ đây là tổng hợp tất cả các lịch trình và ngày khởi hành tour Ladakh bên em. Anh/chị xem qua thử mình ưng ý lịch trình nào nhất nhé: https://fittour.vn/country/ladakh/"
    },
    { 
        title: "Tour Road Trip", 
        desc: "Hành trình truyền thống khám phá Leh, Nubra", 
        url: "https://fittour.vn/tour/tour-ladakh-roadtrip", 
        icon: "Map", 
        color: "#14b8a6",
        type: "tour",
        copyText: "Dạ đây là hành trình Road Trip, đưa mình đi qua những điểm đến biểu tượng nhất của Ladakh như Leh, thung lũng Nubra và hồ Pangong. Anh/chị xem chi tiết lịch trình ở đây nhé: https://fittour.vn/tour/tour-ladakh-roadtrip"
    },
    { 
        title: "Tour Kashmir - Zanskar", 
        desc: "Cung đường nâng cao dành cho người đam mê", 
        url: "https://fittour.vn/tour/tour-kashmir-zanskar", 
        icon: "Mountain", 
        color: "#0f766e",
        type: "tour",
        copyText: "Dạ nếu anh/chị thích những cung đường độc lạ, ít người đặt chân tới và phong cảnh hoang sơ ngoạn mục thì hành trình Kashmir - Zanskar này là dành cho mình: https://fittour.vn/tour/tour-kashmir-zanskar"
    },
    { 
        title: "Thư Viện Hình Ảnh", 
        desc: "Sưu tầm lại hình ảnh của FIT Tour tại Ladakh", 
        url: "https://fittour.vn/gallery-ladakh", 
        icon: "Image", 
        color: "#84cc16",
        type: "marketing",
        copyText: "Dạ trăm nghe không bằng một thấy, anh/chị lướt qua thư viện hình ảnh thực tế mà FIT Tour đã ghi lại trong các chuyến đi Ladakh vừa qua nhé, cảnh sắc bên ngoài còn đẹp hơn hình rất nhiều: https://fittour.vn/gallery-ladakh"
    }
];
`;

const jsxBlock = `
                    {/* ====== Combined Links Section ====== */}
                    {filteredMarketingLinks.length > 0 && (
                        <div id="references-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', scrollMarginTop: '40px', marginBottom: '60px' }}>
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
                                {filteredMarketingLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', 
                                            background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                                            textDecoration: 'none', color: 'inherit',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                                            e.currentTarget.style.borderColor = '#cbd5e1';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: link.color + '15', color: link.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Hash size={16} />
                                            </div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#1e293b', flex: 1 }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Mở xem <ExternalLink size={12} />
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
                                                    background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', 
                                                    fontSize: '0.75rem', fontWeight: '600', color: '#475569', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '4px'
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
`;

// Insert referenceLinks before groupedFaqs
code = code.replace('const groupedFaqs = [', referenceLinks + '\\nconst groupedFaqs = [');

// Insert filter logic before filteredFaqs
const filterLogic = `
    const filteredMarketingLinks = referenceLinks.filter(link => 
        link.title.toLowerCase().includes(normalizedSearch) || 
        link.desc.toLowerCase().includes(normalizedSearch)
    );
    const filteredFaqs = groupedFaqs.map
`;
code = code.replace('const filteredFaqs = groupedFaqs.map', filterLogic);

// Ensure all missing icons are imported
code = code.replace("import { Search, ChevronDown, ChevronRight, CheckCircle2, Copy, Zap, Info, Hash, Briefcase, HeartPulse, CloudSun, Passport, PhoneCall } from 'lucide-react';", 
"import { Search, ChevronDown, ChevronRight, CheckCircle2, Copy, Zap, Info, Hash, Briefcase, HeartPulse, CloudSun, Passport, PhoneCall, Library, ExternalLink } from 'lucide-react';");

// Insert JSX block before FAQs mapping
code = code.replace("<div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>", jsxBlock + "\\n                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>");

fs.writeFileSync('client/src/pages/LadakhConsultingPage.jsx', code);
console.log("Restored Ladakh properly!");
