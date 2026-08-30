import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, Sparkles, FileText, CheckCircle2, ChevronRight, BellRing, Pin, ArrowRight } from 'lucide-react';
import AnnouncementViewModal from './AnnouncementViewModal';

export default function SystemAnnouncementPopup({ currentUser }) {
    const [latestDoc, setLatestDoc] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewFullModal, setViewFullModal] = useState(false);

    const getSeenKey = (docId) => {
        const uid = currentUser?.id || currentUser?.username || currentUser?.email || 'current_user';
        return `popup_seen_announcement_${docId}_${uid}`;
    };

    const checkAndFetchAnnouncement = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get('/api/announcements/public/latest', { headers });
            
            if (res.data && res.data.id) {
                const doc = res.data;
                const userKey = getSeenKey(doc.id);
                const hasSeenUser = localStorage.getItem(userKey);
                const hasSeenGlobal = localStorage.getItem(`popup_seen_announcement_${doc.id}`);

                if (!hasSeenUser && !hasSeenGlobal) {
                    setLatestDoc(doc);
                    const timer = setTimeout(() => {
                        setIsOpen(true);
                    }, 800);
                    return () => clearTimeout(timer);
                }
            }
        } catch (e) {
            // No announcement or error, silent fail
        }
    }, [currentUser]);

    useEffect(() => {
        checkAndFetchAnnouncement();

        const handleManualOpen = (e) => {
            if (e.detail) {
                setLatestDoc(e.detail);
            }
            setIsOpen(true);
        };

        window.addEventListener('open-system-announcement-popup', handleManualOpen);
        return () => window.removeEventListener('open-system-announcement-popup', handleManualOpen);
    }, [checkAndFetchAnnouncement]);

    const handleDismiss = () => {
        if (latestDoc) {
            try {
                const userKey = getSeenKey(latestDoc.id);
                localStorage.setItem(userKey, 'true');
                localStorage.setItem(`popup_seen_announcement_${latestDoc.id}`, 'true');
            } catch (e) {
                console.error(e);
            }
        }
        setIsOpen(false);
    };

    const handleOpenFullDoc = () => {
        handleDismiss();
        setViewFullModal(true);
    };

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleDismiss();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, latestDoc]);

    if (!isOpen && !viewFullModal) return null;

    const isDecision = latestDoc?.category === 'Quyết định' || latestDoc?.code?.startsWith('QĐ');

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    return (
        <>
            {isOpen && latestDoc && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99998,
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        animation: 'announcementFadeIn 0.3s ease-out'
                    }}
                    onClick={handleDismiss}
                >
                    <style>{`
                        @keyframes announcementFadeIn {
                            from { opacity: 0; }
                            to   { opacity: 1; }
                        }
                        @keyframes announcementSlideUp {
                            from { 
                                opacity: 0; 
                                transform: translateY(24px) scale(0.96); 
                            }
                            to { 
                                opacity: 1; 
                                transform: translateY(0) scale(1); 
                            }
                        }
                    `}</style>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '520px',
                            background: '#ffffff',
                            borderRadius: '20px',
                            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.45)',
                            overflow: 'hidden',
                            animation: 'announcementSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                            padding: '18px 22px',
                            color: 'white',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.18)',
                                    backdropFilter: 'blur(4px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fef08a'
                                }}>
                                    <BellRing size={22} className="animate-bounce" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#93c5fd' }}>
                                        BAN GIÁM ĐỐC FIT TOUR
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
                                        {isDecision ? 'Quyết Định Mới Ban Hành' : 'Thông Báo Nội Bộ Mới'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                aria-label="Đóng"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    border: 'none',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)'}
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '20px 22px' }}>
                            {/* Code & Pin info */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        border: '1px solid #bfdbfe'
                                    }}>
                                        {latestDoc.code}
                                    </span>
                                    {latestDoc.is_pinned && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ca8a04', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                                            <Pin size={10} /> Quan trọng
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
                                    {formatDate(latestDoc.issue_date)}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '16px',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.45
                            }}>
                                {latestDoc.title}
                            </h3>

                            {/* Summary / Excerpt */}
                            {latestDoc.summary ? (
                                <div style={{
                                    background: '#f8fafc',
                                    borderLeft: '3.5px solid #3b82f6',
                                    padding: '10px 14px',
                                    borderRadius: '0 8px 8px 0',
                                    fontSize: '13.5px',
                                    color: '#334155',
                                    lineHeight: 1.55,
                                    margin: '0 0 16px 0',
                                    fontStyle: 'italic'
                                }}>
                                    {latestDoc.summary}
                                </div>
                            ) : (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: '#64748b',
                                    marginBottom: '16px'
                                }}>
                                    Yêu cầu các phòng ban, Giám đốc BU và CBNV nghiêm túc nghiên cứu và thực hiện theo đúng chỉ đạo.
                                </div>
                            )}

                            {/* Signer line */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#f1f5f9',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                color: '#475569'
                            }}>
                                <div>
                                    <span style={{ color: '#64748b' }}>Ký duyệt: </span>
                                    <strong style={{ color: '#0f172a' }}>{latestDoc.signer_name || 'NGUYỄN NHẤT VŨ'}</strong>
                                    <span style={{ color: '#64748b' }}> ({latestDoc.signer_position || 'Giám Đốc'})</span>
                                </div>
                                <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '11.5px' }}>
                                    ✓ FIT TOUR ERP
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div style={{
                            padding: '14px 22px 18px',
                            background: '#ffffff',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px' }}>
                                <Sparkles size={14} color="#2563eb" />
                                <span style={{ fontWeight: 500 }}>Thông báo này chỉ hiển thị 1 lần duy nhất cho mỗi nhân sự</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                <button
                                    onClick={handleDismiss}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#475569',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    Đã Nắm • Đóng
                                </button>

                                <button
                                    onClick={handleOpenFullDoc}
                                    style={{
                                        flex: 1,
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        fontSize: '13.5px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <FileText size={16} /> Xem Toàn Văn Bản A4 <ArrowRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full View Modal */}
            {viewFullModal && latestDoc && (
                <AnnouncementViewModal
                    doc={latestDoc}
                    onClose={() => setViewFullModal(false)}
                    canEdit={false}
                />
            )}
        </>
    );
}
