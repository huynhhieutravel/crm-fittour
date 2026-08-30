import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { swalConfirm } from '../utils/swalHelpers';
import { Search, Plus, Edit2, Trash2, Eye, Pin, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, ExternalLink, Calendar, User, Tag } from 'lucide-react';
import AnnouncementViewModal from '../components/modals/AnnouncementViewModal';
import AnnouncementEditModal from '../components/modals/AnnouncementEditModal';

export default function AnnouncementsTab({ currentUser, addToast }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [viewDoc, setViewDoc] = useState(null);
    const [editDoc, setEditDoc] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const canEdit = ['admin', 'manager'].includes(currentUser?.role);

    useEffect(() => {
        fetchAnnouncements();
    }, [categoryFilter, statusFilter]);

    // Check URL for direct document linking (e.g. ?tab=announcements&id=5 or &code=...)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const docId = params.get('id') || params.get('doc') || params.get('code');
        if (docId && announcements.length > 0) {
            const found = announcements.find(a => String(a.id) === String(docId) || a.code === docId);
            if (found) setViewDoc(found);
        }
    }, [announcements]);

    const handleOpenView = (item) => {
        setViewDoc(item);
        const url = new URL(window.location);
        url.searchParams.set('tab', 'announcements');
        url.searchParams.set('id', item.id);
        window.history.pushState({}, '', url);
    };

    const handleCloseView = () => {
        setViewDoc(null);
        const url = new URL(window.location);
        url.searchParams.delete('id');
        url.searchParams.delete('doc');
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url);
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let url = `/api/announcements?`;
            if (categoryFilter !== 'all') url += `category=${encodeURIComponent(categoryFilter)}&`;
            if (statusFilter !== 'all') url += `status=${encodeURIComponent(statusFilter)}&`;

            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setAnnouncements(res.data);
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            if (addToast) addToast('Lỗi khi tải danh sách văn bản thông báo', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!await swalConfirm(`Bạn có chắc muốn xóa văn bản "${item.code} - ${item.title}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/announcements/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (addToast) addToast('Đã xóa văn bản thành công', 'success');
            if (viewDoc?.id === item.id) handleCloseView();
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
            if (addToast) addToast(err.response?.data?.message || 'Lỗi khi xóa văn bản', 'error');
        }
    };

    const openCreate = () => {
        setEditDoc(null);
        setShowEditModal(true);
    };

    const openEdit = (item) => {
        setEditDoc(item);
        setShowEditModal(true);
    };

    const filtered = announcements.filter(item => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            item.title?.toLowerCase().includes(q) ||
            item.code?.toLowerCase().includes(q) ||
            item.summary?.toLowerCase().includes(q) ||
            item.signer_name?.toLowerCase().includes(q) ||
            item.recipient_scope?.toLowerCase().includes(q)
        );
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    // Quick Stats
    const totalDocs = announcements.length;
    const totalDecisions = announcements.filter(a => a.category === 'Quyết định' || a.code?.startsWith('QĐ')).length;
    const totalNotices = announcements.filter(a => a.category === 'Thông báo' || a.code?.startsWith('TB')).length;
    const totalPinned = announcements.filter(a => a.is_pinned).length;

    return (
        <div className="announcements-tab-container" style={{ padding: '0 0 40px 0' }}>
            <style>{`
                .announcements-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }

                .announcements-toolbar {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    background: white;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    margin-bottom: 1.25rem;
                    flex-wrap: wrap;
                }

                .announcements-desktop-table-wrapper {
                    display: block;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    overflow-x: auto;
                }

                .announcements-mobile-cards-wrapper {
                    display: none;
                }

                @media (max-width: 768px) {
                    .announcements-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.5rem;
                    }
                    .announcement-stat-card {
                        padding: 0.75rem !important;
                        gap: 10px !important;
                    }
                    .announcement-stat-icon {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .announcement-stat-title {
                        font-size: 10.5px !important;
                    }
                    .announcement-stat-value {
                        font-size: 16px !important;
                    }

                    .announcements-toolbar {
                        padding: 0.75rem;
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .announcements-toolbar-search {
                        width: 100% !important;
                        flex: auto !important;
                    }
                    .announcements-toolbar-filters {
                        display: flex;
                        width: 100%;
                        gap: 6px;
                    }
                    .announcements-toolbar-filters select {
                        flex: 1;
                        width: 50%;
                    }
                    .announcements-toolbar-btn-create {
                        width: 100%;
                        justify-content: center;
                    }

                    .announcements-desktop-table-wrapper {
                        display: none;
                    }

                    .announcements-mobile-cards-wrapper {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }
                }
            `}</style>

            {/* Quick Stats Grid */}
            <div className="announcements-stats-grid">
                <div className="announcement-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="announcement-stat-icon" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} />
                    </div>
                    <div>
                        <div className="announcement-stat-title" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tổng Văn Bản</div>
                        <div className="announcement-stat-value" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalDocs}</div>
                    </div>
                </div>

                <div className="announcement-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="announcement-stat-icon" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className="announcement-stat-title" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Quyết Định Ban Hành</div>
                        <div className="announcement-stat-value" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalDecisions}</div>
                    </div>
                </div>

                <div className="announcement-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="announcement-stat-icon" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div className="announcement-stat-title" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Thông Báo Nội Bộ</div>
                        <div className="announcement-stat-value" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalNotices}</div>
                    </div>
                </div>

                <div className="announcement-stat-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="announcement-stat-icon" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pin size={22} />
                    </div>
                    <div>
                        <div className="announcement-stat-title" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Văn Bản Ghim</div>
                        <div className="announcement-stat-value" style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{totalPinned}</div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="announcements-toolbar">
                <div className="announcements-toolbar-search" style={{ flex: '1 1 260px', position: 'relative' }}>
                    <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm mã số, tiêu đề, người ký..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '38px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                    />
                </div>

                <div className="announcements-toolbar-filters">
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        style={{ height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.84rem', color: '#334155', outline: 'none' }}
                    >
                        <option value="all">Tất cả thể loại</option>
                        <option value="Thông báo">Thông báo</option>
                        <option value="Quyết định">Quyết định</option>
                        <option value="Quy chế">Quy chế</option>
                        <option value="Thông báo nghỉ lễ">Nghỉ lễ</option>
                        <option value="Hướng dẫn công việc">Hướng dẫn</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ height: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.84rem', color: '#334155', outline: 'none' }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã ban hành</option>
                        <option value="draft">Bản nháp</option>
                        <option value="expired">Hết hiệu lực</option>
                    </select>
                </div>

                {canEdit && (
                    <button
                        className="announcements-toolbar-btn-create"
                        onClick={openCreate}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '40px', padding: '0 1.1rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', cursor: 'pointer' }}
                    >
                        <Plus size={17} /> Soạn Văn Bản Mới
                    </button>
                )}
            </div>

            {/* 1. Desktop Table View (>= 768px) */}
            <div className="announcements-desktop-table-wrapper">
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '14px 16px', textAlign: 'center', width: '50px' }}>#</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', width: '170px' }}>MÃ VĂN BẢN</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left' }}>TIÊU ĐỀ & TRÍCH YẾU</th>
                            <th style={{ padding: '14px 16px', textAlign: 'center', width: '120px' }}>NGÀY BAN HÀNH</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', width: '190px' }}>NGƯỜI RA QUYẾT ĐỊNH</th>
                            <th style={{ padding: '14px 16px', textAlign: 'center', width: '140px' }}>NƠI NHẬN</th>
                            <th style={{ padding: '14px 16px', textAlign: 'center', width: '150px' }}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Đang tải danh sách văn bản...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Không tìm thấy văn bản thông báo nào phù hợp.
                                </td>
                            </tr>
                        ) : filtered.map((item, idx) => {
                            const isDecision = item.category === 'Quyết định' || item.code?.startsWith('QĐ');
                            return (
                                <tr
                                    key={item.id}
                                    style={{ transition: 'background 0.2s', background: item.is_pinned ? '#fefce8' : 'white' }}
                                    onMouseOver={e => e.currentTarget.style.background = item.is_pinned ? '#fef08a' : '#f8fafc'}
                                    onMouseOut={e => e.currentTarget.style.background = item.is_pinned ? '#fefce8' : 'white'}
                                >
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                        {item.is_pinned ? (
                                            <span title="Văn bản đã ghim"><Pin size={15} color="#ca8a04" /></span>
                                        ) : (
                                            idx + 1
                                        )}
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            background: isDecision ? '#fef3c7' : '#eff6ff',
                                            color: isDecision ? '#b45309' : '#1d4ed8',
                                            border: isDecision ? '1px solid #fde68a' : '1px solid #bfdbfe'
                                        }}>
                                            {item.code}
                                        </span>
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div
                                            onClick={() => handleOpenView(item)}
                                            style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', cursor: 'pointer', lineHeight: 1.4 }}
                                            onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                                            onMouseOut={e => e.currentTarget.style.color = '#0f172a'}
                                        >
                                            {item.title}
                                        </div>
                                        {item.summary && (
                                            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.summary}
                                            </div>
                                        )}
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                                        {formatDate(item.issue_date)}
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                                            {item.signer_name || 'NGUYỄN NHẤT VŨ'}
                                        </div>
                                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                            {item.signer_position || 'Giám Đốc'}
                                        </div>
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
                                        {item.recipient_scope || 'Toàn thể CBNV'}
                                    </td>

                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <button
                                                onClick={() => handleOpenView(item)}
                                                title="Xem văn bản"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <Eye size={14} /> Xem
                                            </button>

                                            {canEdit && (
                                                <>
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        title="Chỉnh sửa"
                                                        style={{ padding: '6px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                        onMouseOver={e => e.currentTarget.style.color = '#f59e0b'}
                                                        onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        title="Xóa"
                                                        style={{ padding: '6px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                        onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 2. Mobile Cards View (< 768px) */}
            <div className="announcements-mobile-cards-wrapper">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Đang tải danh sách văn bản...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Không tìm thấy văn bản thông báo nào phù hợp.
                    </div>
                ) : (
                    filtered.map((item) => {
                        const isDecision = item.category === 'Quyết định' || item.code?.startsWith('QĐ');
                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: item.is_pinned ? '#fefce8' : 'white',
                                    border: item.is_pinned ? '1.5px solid #fde047' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                {/* Top Line: Code badge + Pin badge + Issue Date */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '11.5px',
                                            fontWeight: 700,
                                            background: isDecision ? '#fef3c7' : '#eff6ff',
                                            color: isDecision ? '#b45309' : '#1d4ed8',
                                            border: isDecision ? '1px solid #fde68a' : '1px solid #bfdbfe'
                                        }}>
                                            {item.code}
                                        </span>
                                        {item.is_pinned && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ca8a04', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>
                                                <Pin size={9} /> Ghim
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={13} /> {formatDate(item.issue_date)}
                                    </div>
                                </div>

                                {/* Title & Summary */}
                                <div>
                                    <div
                                        onClick={() => handleOpenView(item)}
                                        style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, cursor: 'pointer' }}
                                    >
                                        {item.title}
                                    </div>
                                    {item.summary && (
                                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                                            {item.summary}
                                        </div>
                                    )}
                                </div>

                                {/* Signer & Scope */}
                                <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ color: '#64748b' }}>Ký: </span>
                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.signer_name || 'NGUYỄN NHẤT VŨ'}</span>
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '11px' }}>
                                        {item.recipient_scope ? `Gửi: ${item.recipient_scope}` : ''}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                    <button
                                        onClick={() => handleOpenView(item)}
                                        style={{
                                            flex: 1,
                                            height: '36px',
                                            background: '#2563eb',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Eye size={15} /> Xem Văn Bản A4
                                    </button>

                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={() => openEdit(item)}
                                                style={{ width: '36px', height: '36px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="Sửa"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                style={{ width: '36px', height: '36px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="Xóa"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* View Modal */}
            {viewDoc && (
                <AnnouncementViewModal
                    doc={viewDoc}
                    onClose={handleCloseView}
                    onEdit={openEdit}
                    canEdit={canEdit}
                    addToast={addToast}
                />
            )}

            {/* Edit / Create Modal */}
            {showEditModal && (
                <AnnouncementEditModal
                    item={editDoc}
                    onClose={() => setShowEditModal(false)}
                    onSaved={() => {
                        fetchAnnouncements();
                        if (viewDoc && editDoc && viewDoc.id === editDoc.id) {
                            // Update current viewing doc
                            axios.get(`/api/announcements/${viewDoc.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                                .then(res => setViewDoc(res.data))
                                .catch(() => {});
                        }
                    }}
                    addToast={addToast}
                />
            )}
        </div>
    );
}
