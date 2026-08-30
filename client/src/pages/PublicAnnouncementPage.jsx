import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, Link as LinkIcon, ExternalLink, Pin, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PublicAnnouncementPage() {
    const { id, code } = useParams();
    const docIdentifier = id || code;
    
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const printRef = useRef(null);

    useEffect(() => {
        if (!docIdentifier) return;
        fetchDocument();
    }, [docIdentifier]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.get(`/api/announcements/public/${encodeURIComponent(docIdentifier)}`, { headers });
            setDoc(res.data);
            if (res.data.title) {
                document.title = `${res.data.code} - ${res.data.title} | FIT TOUR ERP`;
            }
        } catch (err) {
            console.error('Error fetching announcement:', err);
            setError(err.response?.data?.message || 'Không tìm thấy văn bản thông báo');
        } finally {
            setLoading(false);
        }
    };

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

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Đã sao chép link văn bản vào bộ nhớ tạm!');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: '16px', fontSize: '15px', color: '#94a3b8' }}>Đang tải văn bản chính thức FIT TOUR...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', textAlign: 'center' }}>
                <FileText size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>Không tìm thấy văn bản</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '0 0 24px 0' }}>
                    {error || 'Văn bản này không tồn tại hoặc đã bị thu hồi khỏi hệ thống.'}
                </p>
                <Link
                    to="/licenses?tab=announcements"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}
                >
                    <ArrowLeft size={16} /> Về Danh Sách Văn Bản ERP
                </Link>
            </div>
        );
    }

    const dateInfo = formatDate(doc.issue_date);
    const isDecision = doc.category === 'Quyết định' || doc.code?.startsWith('QĐ');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b1120' }}>
            <Toaster position="top-right" />
            
            {/* Embedded Print & Component Styles */}
            <style>{`
                .public-top-bar {
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
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .public-scroll-body {
                    flex: 1;
                    padding: 30px 16px 80px;
                    background: #0b1120;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .public-a4-paper {
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

                .public-prose {
                    font-size: 15.5px;
                    line-height: 1.75;
                    color: #1e293b !important;
                    text-align: justify;
                }

                .public-prose p {
                    margin-bottom: 1.1em;
                    text-indent: 1.5em;
                    color: #1e293b !important;
                }

                .public-prose h3, .public-prose h4 {
                    font-weight: bold;
                    margin-top: 1.4em;
                    margin-bottom: 0.6em;
                    text-indent: 0;
                    font-size: 16px;
                    color: #0f172a !important;
                }

                .public-prose ul, .public-prose ol {
                    margin: 1em 0;
                    padding-left: 2.2em;
                    color: #1e293b !important;
                }

                .public-prose li {
                    margin-bottom: 0.5em;
                    color: #1e293b !important;
                }

                .public-prose table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    font-size: 14.5px;
                    color: #1e293b !important;
                }

                .public-prose th, .public-prose td {
                    border: 1px solid #334155;
                    padding: 8px 12px;
                    text-align: left;
                    color: #1e293b !important;
                }

                .public-prose th {
                    background: #f1f5f9;
                    font-weight: bold;
                    color: #0f172a !important;
                }

                .public-btn-text {
                    display: inline;
                }

                .public-footer-grid {
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
                    .public-a4-paper,
                    .public-a4-paper * {
                        visibility: visible !important;
                    }
                    .public-top-bar {
                        display: none !important;
                    }
                    .public-scroll-body {
                        padding: 0 !important;
                        background: white !important;
                    }
                    .public-a4-paper {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 25px 35px !important;
                        margin: 0 !important;
                    }
                }

                @media (max-width: 640px) {
                    .public-top-bar {
                        height: 50px;
                        padding: 0 10px;
                    }
                    .public-btn-text {
                        display: none;
                    }
                    .public-btn-compact {
                        padding: 6px 8px !important;
                    }
                    .public-scroll-body {
                        padding: 12px 8px 60px;
                    }
                    .public-a4-paper {
                        padding: 24px 16px 40px !important;
                        border-radius: 6px !important;
                        box-shadow: none !important;
                    }
                    .public-header-grid {
                        flex-direction: column !important;
                        gap: 12px !important;
                        margin-bottom: 20px !important;
                    }
                    .public-header-col {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .public-footer-grid {
                        flex-direction: column-reverse !important;
                        gap: 28px !important;
                        margin-top: 30px !important;
                    }
                    .public-footer-left {
                        width: 100% !important;
                        text-align: left !important;
                        background: #f8fafc;
                        padding: 12px 14px;
                        border-radius: 8px;
                    }
                    .public-footer-right {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .public-prose {
                        font-size: 14.5px !important;
                        line-height: 1.65 !important;
                    }
                    .public-prose p {
                        text-indent: 1em !important;
                    }
                }
            `}</style>

            {/* Top Fixed Bar */}
            <div className="public-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link
                        to="/licenses?tab=announcements"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#94a3b8', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
                        title="Về danh sách văn bản"
                    >
                        <ArrowLeft size={16} /> <span className="public-btn-text">Danh sách</span>
                    </Link>
                    <span style={{ color: '#475569' }}>|</span>
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
                            className="public-btn-compact"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#334155', color: '#f8fafc', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#475569'}
                            onMouseOut={e => e.currentTarget.style.background = '#334155'}
                        >
                            <ExternalLink size={14} /> <span className="public-btn-text">Đính kèm</span>
                        </a>
                    )}

                    <button
                        onClick={handleCopyLink}
                        title="Sao chép liên kết"
                        className="public-btn-compact"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#475569'}
                        onMouseOut={e => e.currentTarget.style.background = '#334155'}
                    >
                        <LinkIcon size={14} /> <span className="public-btn-text">Sao chép link</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        title="In / Xuất file PDF"
                        className="public-btn-compact"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
                    >
                        <Printer size={14} /> <span className="public-btn-text">In / Xuất PDF</span>
                    </button>
                </div>
            </div>

            {/* Main Document Content */}
            <div className="public-scroll-body">
                <div className="public-a4-paper" ref={printRef}>
                    
                    {/* 1. Header Block (2 Columns) */}
                    <div className="public-header-grid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                        {/* Left Column: Organization & Doc Number */}
                        <div className="public-header-col" style={{ width: '48%', textAlign: 'center' }}>
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
                        <div className="public-header-col" style={{ width: '48%', textAlign: 'center' }}>
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
                        className="public-prose"
                        dangerouslySetInnerHTML={{ __html: doc.content_html }}
                    />

                    {/* 4. Footer Sign-off Block (2 Columns) */}
                    <div className="public-footer-grid">
                        {/* Left: Recipients */}
                        <div className="public-footer-left" style={{ width: '45%', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                            <div style={{ fontWeight: 'bold', fontStyle: 'italic', marginBottom: '4px', textDecoration: 'underline' }}>
                                Nơi nhận:
                            </div>
                            <div>- {doc.recipient_scope || 'Như điều 1'};</div>
                            <div>- Ban Giám Đốc (để b/c);</div>
                            <div>- Các phòng ban liên quan;</div>
                            <div>- Lưu: VT, HR.</div>
                        </div>

                        {/* Right: Decision Maker / Signer */}
                        <div className="public-footer-right" style={{ width: '50%', textAlign: 'center', position: 'relative' }}>
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
