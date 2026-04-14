import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Edit3, Trash2, Eye, Filter, MessageSquareText, Building, Phone, Mail } from 'lucide-react';
import GroupLeaderProfileSlider from '../components/GroupLeaderProfileSlider';
import GroupLeaderCalendarView from '../components/GroupLeaderCalendarView';
import GroupLeaderAddModal from '../components/GroupLeaderAddModal';
import { Users, Plus } from 'lucide-react';

export default function GroupLeadersTab({ currentUser, addToast, users = [], activeView = 'list', handleDeleteLeader }) {
    const [leaders, setLeaders] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [assignedFilter, setAssignedFilter] = useState('');
    const [hoveredNoteId, setHoveredNoteId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Profile slider
    const [selectedLeaderFull, setSelectedLeaderFull] = useState(null);
    const [autoEditOnOpen, setAutoEditOnOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    useEffect(() => {
        fetchLeaders();
        fetchCompanies();

        const handleReload = () => fetchLeaders();
        window.addEventListener('reloadGroupLeaders', handleReload);
        return () => window.removeEventListener('reloadGroupLeaders', handleReload);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, assignedFilter]);

    useEffect(() => {
        const pending = sessionStorage.getItem('pendingLeaderOpen');
        if (pending && leaders.length > 0) {
            handleViewProfile(pending);
            sessionStorage.removeItem('pendingLeaderOpen');
        }
    }, [leaders]);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/b2b-companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(res.data);
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    const fetchLeaders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/group-leaders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaders(res.data);
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi tải danh sách B2B', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        if (handleDeleteLeader) handleDeleteLeader(id);
    };

    const handleViewProfile = async (id, autoEdit = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/group-leaders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedLeaderFull(res.data);
            if (autoEdit) setAutoEditOnOpen(true);
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi tải hồ sơ B2B', 'error');
        }
    };

    const handleAddNote = async (leaderId, content) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/group-leaders/${leaderId}/notes`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const newNote = res.data;
            setSelectedLeaderFull(prev => ({
                ...prev,
                interaction_history: [newNote, ...(prev.interaction_history || [])]
            }));
            // Also update the latest_note in the list
            setLeaders(prev => prev.map(l => l.id === leaderId ? { ...l, latest_note: content } : l));
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi thêm ghi chú', 'error');
        }
    };

    const filtered = leaders.filter(l => {
        const searchText = search.toLowerCase();
        const matchSearch = (l.name || '').toLowerCase().includes(searchText) ||
            (l.company_name || '').toLowerCase().includes(searchText) ||
            (l.phone || '').includes(searchText) ||
            (l.email || '').toLowerCase().includes(searchText);
        const matchAssigned = assignedFilter
            ? (assignedFilter === 'NO_STAFF' ? !l.assigned_to : l.assigned_to === parseInt(assignedFilter))
            : true;
        return matchSearch && matchAssigned;
    });

    const actualItemsPerPage = itemsPerPage === 'all' ? Math.max(1, filtered.length) : itemsPerPage;
    const totalPages = Math.ceil(filtered.length / actualItemsPerPage) || 1;
    const currentLeaders = filtered.slice((currentPage - 1) * actualItemsPerPage, currentPage * actualItemsPerPage);

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <>
            <div className="animate-fade-in">
                {/* Header section with Add Button - HIDE IN CALENDAR VIEW */}
                {activeView !== 'calendar' && (
                    <div className="section-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Users size={22} color="#6366f1" /> DANH SÁCH TRƯỞNG ĐOÀN
                        </h2>
                        <button className="btn-pro-save" style={{ background: '#6366f1', padding: '8px 16px', borderRadius: '8px', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowCreateModal(true)}>
                            <Plus size={16} /> THÊM TRƯỞNG ĐOÀN
                        </button>
                    </div>
                )}

                {/* Filter Bar */}
                <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={18} className="text-secondary" /> {activeView === 'calendar' ? 'BỘ LỌC LỊCH HẸN' : 'BỘ LỌC TRƯỞNG ĐOÀN'}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {(search || assignedFilter) && (
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '0.5rem 1rem', color: '#ef4444' }}
                                    onClick={() => { setSearch(''); setAssignedFilter(''); }}
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="filter-group" style={{ flex: 1, minWidth: '250px', margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>TỪ KHÓA TÌM KIẾM</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    className="filter-input"
                                    style={{ paddingLeft: '36px', height: '42px', borderRadius: '8px' }}
                                    placeholder="Tên, Công ty, SĐT, Email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-group" style={{ flex: 1, minWidth: '180px', margin: 0 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>NHÂN VIÊN CHĂM SÓC</label>
                            <select
                                className="filter-select"
                                style={{ height: '42px', borderRadius: '8px' }}
                                value={assignedFilter}
                                onChange={e => setAssignedFilter(e.target.value)}
                            >
                                <option value="">Tất cả nhân viên</option>
                                <option value="NO_STAFF">⚠ Chưa giao ai</option>
                                {users.filter(u => u.is_active !== false && (
                                    (u.teams || []).some(t => String(t.name || '').toLowerCase().includes('đoàn') || String(t.name || '').toLowerCase().includes('mice')) ||
                                    ['admin', 'manager', 'group_manager', 'group_staff'].includes(u.role_name) ||
                                    u.role === 'admin' || u.role === 'manager'
                                )).map(u => (
                                    <option key={u.id} value={u.id}>{u.username || u.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {activeView === 'calendar' ? (
                    <GroupLeaderCalendarView users={users} leaders={filtered} companies={companies} onLeaderClick={handleViewProfile} />
                ) : (
                <>
                {/* Data Table */}
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>CÔNG TY / ĐẠI DIỆN</th>
                                <th>LIÊN HỆ</th>
                                <th>NHÂN VIÊN</th>
                                <th>SỐ DỰ ÁN</th>
                                <th>LTV (DOANH THU)</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
                            ) : currentLeaders.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Không tìm thấy Trưởng đoàn nào.</td></tr>
                            ) : (
                                currentLeaders.map(leader => (
                                    <tr key={leader.id}>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{leader.name}</span>
                                                    {leader.latest_note && (
                                                        <div
                                                            style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}
                                                            onMouseEnter={() => setHoveredNoteId(leader.id)}
                                                            onMouseLeave={() => setHoveredNoteId(null)}
                                                        >
                                                            <MessageSquareText size={16} color="#f59e0b" />
                                                            {hoveredNoteId === leader.id && (
                                                                <div style={{
                                                                    position: 'absolute', left: '24px', top: '-50%', width: '260px',
                                                                    background: '#1e293b', color: '#f8fafc', padding: '12px', borderRadius: '6px',
                                                                    fontSize: '0.75rem', fontWeight: 500, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                                                                    zIndex: 100, whiteSpace: 'pre-wrap', lineHeight: '1.4'
                                                                }}>
                                                                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fbbf24' }}>GHI CHÚ MỚI NHẤT</div>
                                                                    {leader.latest_note}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                                        🏢 {leader.company_display_name || leader.company_name || 'Chưa gắn DN'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: 600 }}>{leader.phone || 'Chưa cập nhật SĐT'}</span>
                                                {leader.email && <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{leader.email}</span>}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {leader.assigned_name || leader.assigned_username || 'Chưa gán'}
                                        </td>
                                        <td style={{ fontWeight: 700, textAlign: 'center' }}>
                                            {leader.total_projects || 0}
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#10b981' }}>
                                            {formatMoney(leader.total_revenue)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button className="icon-btn" title="Xem hồ sơ" onClick={() => handleViewProfile(leader.id)}>
                                                    <Eye size={16} className="text-blue-500" />
                                                </button>
                                                <button className="icon-btn" title="Sửa" onClick={() => handleViewProfile(leader.id, true)}>
                                                    <Edit3 size={16} color="#3b82f6" />
                                                </button>
                                                <button className="icon-btn danger" style={{ color: '#ef4444' }} title="Xóa" onClick={() => handleDelete(leader.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Hiển thị:</span>
                        <select
                            className="filter-select"
                            style={{ padding: '4px 24px 4px 12px', height: '32px', fontSize: '0.85rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', minWidth: '70px', margin: 0 }}
                            value={itemsPerPage}
                            onChange={(e) => {
                                const val = e.target.value;
                                setItemsPerPage(val === 'all' ? 'all' : parseInt(val, 10));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={30}>30 dòng</option>
                            <option value={50}>50 dòng</option>
                            <option value={100}>100 dòng</option>
                            <option value="all">Tất cả</option>
                        </select>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                            Hiển thị {currentLeaders.length} / {filtered.length} đại diện B2B
                        </span>
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? '#cbd5e1' : '#475569', fontSize: '0.85rem' }}
                            >
                                Trang trước
                            </button>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: '0 8px' }}>
                                Trang {currentPage} / {totalPages}
                            </div>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? '#cbd5e1' : '#475569', fontSize: '0.85rem' }}
                            >
                                Trang sau
                            </button>
                        </div>
                    )}
                </div>
                </>
                )}
            </div>

            <GroupLeaderProfileSlider
                leader={selectedLeaderFull}
                users={users}
                companies={companies}
                onClose={() => { setSelectedLeaderFull(null); setAutoEditOnOpen(false); }}
                onAddNote={handleAddNote}
                onLeaderUpdated={() => { fetchLeaders(); handleViewProfile(selectedLeaderFull.id); }}
                autoEdit={autoEditOnOpen}
                onAutoEditConsumed={() => setAutoEditOnOpen(false)}
            />

            <GroupLeaderAddModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => { setShowCreateModal(false); fetchLeaders(); }}
                companies={companies}
                users={users}
                currentUser={currentUser}
                addToast={addToast}
            />
        </>
    );
}
