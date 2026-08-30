import React, { useRef, useEffect } from 'react';
import { X, Printer, Link as LinkIcon, Edit2, ExternalLink, Pin } from 'lucide-react';

export default function AnnouncementViewModal({ doc, onClose, onEdit, canEdit, addToast }) {
    const printRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Auto scroll to top when opened & handle ESC key & body scroll lock
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!doc) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return { day: '--', month: '--', year: '----', full: '' };
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return {
            day,
            month,
            year,
            full: `${day}/${month}/${year}`
        };
    };

    const dateInfo = formatDate(doc.issue_date);

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/thong-bao/${doc.id}`;
        navigator.clipboard.writeText(url);
        if (addToast) addToast(`Đã sao chép link văn bản: /thong-bao/${doc.id}`, 'success');
    };

    const isDecision = doc.category === 'Quyết định' || doc.code?.startsWith('QĐ');

    const handleBackdropClick = (e) => {
        if (e.target === scrollContainerRef.current) {
            onClose();
        }
    };

    return (
        <div className="announcement-modal-root">
            {/* Embedded Print & Component Styles */}
            <style>{`
                .announcement-modal-root {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    background: #0f172a;
                }

                .announcement-fixed-top-bar {
                    height: 56px;
                    background: #1e293b;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 10001;
                }

                .announcement-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 30px 16px 80px;
                    background: #090d16;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    -webkit-overflow-scrolling: touch;
                }

                .announcement-a4-paper {
                    width: 100%;
                    max-width: 820px;
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    border-radius: 4px;
                    padding: 60px 75px 80px;
                    font-family: "Times New Roman", Times, "Segoe UI", serif;
                    position: relative;
                    box-sizing: border-box;
                    margin: 0 auto;
                }

                .announcement-prose {
                    font-size: 15.5px;
                    line-height: 1.75;
                    color: #1e293b !important;
                    text-align: justify;
                }

                .announcement-prose p {
                    margin-bottom: 1.1em;
                    text-indent: 1.5em;
                    color: #1e293b !important;
                }

                .announcement-prose h3, .announcement-prose h4 {
                    font-weight: bold;
                    margin-top: 1.4em;
                    margin-bottom: 0.6em;
                    text-indent: 0;
                    font-size: 16px;
                    color: #0f172a !important;
                }

                .announcement-prose ul, .announcement-prose ol {
                    margin: 1em 0;
                    padding-left: 2.2em;
                    color: #1e293b !important;
                }

                .announcement-prose li {
                    margin-bottom: 0.5em;
                    color: #1e293b !important;
                }

                .announcement-prose table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    font-size: 14.5px;
                    color: #1e293b !important;
                }

                .announcement-prose th, .announcement-prose td {
                    border: 1px solid #334155;
                    padding: 8px 12px;
                    text-align: left;
                    color: #1e293b !important;
                }

                .announcement-prose th {
                    background: #f1f5f9;
                    font-weight: bold;
                    color: #0f172a !important;
                }

                .announcement-btn-text {
                    display: inline;
                }

                .announcement-footer-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-top: 45px;
                    padding-top: 15px;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .announcement-modal-root,
                    .announcement-modal-root * {
                        visibility: visible !important;
                    }
                    .announcement-modal-root {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        z-index: 9999999 !important;
                    }
                    .announcement-fixed-top-bar {
                        display: none !important;
                    }
                    .announcement-scroll-body {
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .announcement-a4-paper {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        max-width: 100% !important;
                        width: 100% !important;
                        padding: 25px 35px !important;
                        margin: 0 !important;
                    }
                }

                @media (max-width: 640px) {
                    .announcement-fixed-top-bar {
                        height: 50px;
                        padding: 0 10px;
                    }
                    .announcement-btn-text {
                        display: none;
                    }
                    .announcement-btn-compact {
                        padding: 6px 8px !important;
                    }
                    .announcement-scroll-body {
                        padding: 12px 8px 60px;
                    }
                    .announcement-a4-paper {
                        padding: 24px 16px 40px !important;
                        border-radius: 6px !important;
                        box-shadow: none !important;
                    }
                    .announcement-header-grid {
                        flex-direction: column !important;
                        gap: 12px !important;
                        margin-bottom: 20px !important;
                    }
                    .announcement-header-col {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .announcement-footer-grid {
                        flex-direction: column-reverse !important;
                        gap: 28px !important;
                        margin-top: 30px !important;
                    }
                    .announcement-footer-left {
                        width: 100% !important;
                        text-align: left !important;
                        background: #f8fafc;
                        padding: 12px 14px;
                        border-radius: 8px;
                    }
                    .announcement-footer-right {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .announcement-prose {
                        font-size: 14.5px !important;
                        line-height: 1.65 !important;
                    }
                    .announcement-prose p {
                        text-indent: 1em !important;
                    }
                }
            `}</style>

            {/* Top Fixed Navigation & Action Bar */}
            <div className="announcement-fixed-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '14px', letterSpacing: '0.3px' }}>{doc.code}</span>
                    {doc.is_pinned && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#eab308', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700 }}>
                            <Pin size={10} /> Ghim
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {doc.attachment_url && (
                        <a
                            href={doc.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="announcement-btn-compact"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#475569'}
                            onMouseOut={e => e.currentTarget.style.background = '#334155'}
                        >
                            <ExternalLink size={14} /> <span className="announcement-btn-text">File đính kèm</span>
                        </a>
                    )}
                    <button
                        onClick={handleCopyLink}
                        title="Sao chép liên kết"
                        className="announcement-btn-compact"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#475569'}
                        onMouseOut={e => e.currentTarget.style.background = '#334155'}
                    >
                        <LinkIcon size={14} /> <span className="announcement-btn-text">Sao chép link</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        title="In / Xuất file PDF"
                        className="announcement-btn-compact"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                    >
                        <Printer size={14} /> <span className="announcement-btn-text">In / Xuất PDF</span>
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => onEdit(doc)}
                            title="Chỉnh sửa văn bản"
                            className="announcement-btn-compact"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            <Edit2 size={14} /> <span className="announcement-btn-text">Sửa</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        title="Đóng cửa sổ (ESC)"
                        style={{ background: '#475569', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px' }}
                        onMouseOver={e => e.currentTarget.style.background = '#ef4444'}
                        onMouseOut={e => e.currentTarget.style.background = '#475569'}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Scrollable View Area */}
            <div className="announcement-scroll-body" ref={scrollContainerRef} onClick={handleBackdropClick}>
                
                {/* A4 Paper Document Content - Strictly 100% White Sheet */}
                <div className="announcement-a4-paper" ref={printRef}>
                    
                    {/* 1. Header Block (2 Columns) */}
                    <div className="announcement-header-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                        {/* Left Column: Organization & Doc Number */}
                        <div className="announcement-header-col" style={{ width: '48%', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.2px', lineHeight: 1.3 }}>
                                CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR
                            </div>
                            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: 'bold' }}>
                                HỆ THỐNG ĐIỀU HÀNH ERP
                            </div>
                            <div style={{ width: '80px', height: '1px', background: '#0f172a', margin: '4px auto 6px' }} />
                            <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#1e293b' }}>
                                Số: <span style={{ fontWeight: 600, fontStyle: 'normal' }}>{doc.code}</span>
                            </div>
                        </div>

                        {/* Right Column: Country National Motto or Company Notice Motto */}
                        <div className="announcement-header-col" style={{ width: '48%', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>
                                Độc lập - Tự do - Hạnh phúc
                            </div>
                            <div style={{ width: '130px', height: '1px', background: '#0f172a', margin: '4px auto 8px' }} />
                            <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: '#1e293b', textAlign: 'center', marginTop: '6px' }}>
                                TP. Hồ Chí Minh, ngày {dateInfo.day} tháng {dateInfo.month} năm {dateInfo.year}
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Title */}
                    <div style={{ textAlign: 'center', marginTop: '25px', marginBottom: '25px' }}>
                        <h1 style={{ fontSize: '19px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '0.5px' }}>
                            {isDecision ? 'QUYẾT ĐỊNH' : (doc.category ? doc.category.toUpperCase() : 'THÔNG BÁO')}
                        </h1>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', maxWidth: '95%', margin: '0 auto', lineHeight: 1.4 }}>
                            V/v: {doc.title}
                        </div>
                    </div>

                    {/* Optional Summary Box */}
                    {doc.summary && (
                        <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '12px 16px', margin: '0 0 20px 0', fontSize: '13.5px', fontStyle: 'italic', color: '#334155', lineHeight: 1.5, borderRadius: '0 6px 6px 0' }}>
                            <strong>Trích yếu nội dung:</strong> {doc.summary}
                        </div>
                    )}

                    {/* 3. Document Body / Rich HTML Content */}
                    <div 
                        className="announcement-prose"
                        dangerouslySetInnerHTML={{ __html: doc.content_html }}
                    />

                    {/* 4. Footer Sign-off Block (2 Columns) */}
                    <div className="announcement-footer-grid">
                        {/* Left: Recipients */}
                        <div className="announcement-footer-left" style={{ width: '45%', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 'bold', fontStyle: 'italic', marginBottom: '4px', textDecoration: 'underline' }}>
                                Nơi nhận:
                            </div>
                            <div>- {doc.recipient_scope || 'Như điều 1'};</div>
                            <div>- Ban Giám Đốc (để b/c);</div>
                            <div>- Các phòng ban liên quan;</div>
                            <div>- Lưu: VT, HR.</div>
                        </div>

                        {/* Right: Decision Maker / Signer */}
                        <div className="announcement-footer-right" style={{ width: '50%', textAlign: 'center', position: 'relative' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>
                                {isDecision ? 'TM. BAN GIÁM ĐỐC' : 'NGƯỜI RA THÔNG BÁO'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginTop: '2px' }}>
                                {doc.signer_position || doc.signer_user_position || 'Giám Đốc'}
                            </div>

                            {/* Official Real Stamp & Signature Image */}
                            <div style={{ margin: '10px auto 6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img 
                                    src="/con-dau-tron-fittour.png" 
                                    alt="FIT TOUR Official Stamp" 
                                    style={{ 
                                        width: '145px', 
                                        maxWidth: '100%', 
                                        height: 'auto', 
                                        objectFit: 'contain',
                                        display: 'block'
                                    }} 
                                />
                            </div>

                            <div style={{ fontSize: '15.5px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginTop: '4px' }}>
                                {doc.signer_name || 'NGUYỄN NHẤT VŨ'}
                            </div>
                        </div>
                    </div>

                    {/* Effective Date Note if different */}
                    {doc.effective_date && doc.effective_date !== doc.issue_date && (
                        <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                            * Văn bản này có hiệu lực thi hành kể từ ngày {formatDate(doc.effective_date).full}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
