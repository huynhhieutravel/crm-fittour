import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Edit2, Trash2, Calendar, Users, Briefcase } from 'lucide-react';
import Select from 'react-select';
import GroupProjectDetailDrawer from '../components/modals/GroupProjectDetailDrawer';

const STATUS_OPTIONS = [
    { value: 'Báo giá', label: 'Báo giá' },
    { value: 'Đang theo dõi', label: 'Đang theo dõi' },
    { value: 'Thành công', label: 'Thành công' },
    { value: 'Đã quyết toán', label: 'Đã quyết toán' },
    { value: 'Chưa thành công', label: 'Chưa thành công' },
    { value: '__ALL__', label: '⚡ Tất cả (kể cả thất bại)' }
];

// Build time filter options: months + quarters + years
const buildTimeOptions = () => {
    const opts = [];
    const now = new Date();
    const y = now.getFullYear();
    // Current + next months (6 months forward, 3 back)
    for (let i = -3; i <= 8; i++) {
        const d = new Date(y, now.getMonth() + i, 1);
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const yy = d.getFullYear();
        opts.push({ value: `${yy}-${mm}`, label: `Tháng ${mm}/${yy}`, type: 'month' });
    }
    // Quarters for current year
    for (let q = 1; q <= 4; q++) {
        opts.push({ value: `Q${q}-${y}`, label: `Quý ${q}/${y}`, type: 'quarter' });
    }
    // Full years
    opts.push({ value: `Y-${y-1}`, label: `Năm ${y-1}`, type: 'year' });
    opts.push({ value: `Y-${y}`, label: `Năm ${y}`, type: 'year' });
    opts.push({ value: `Y-${y+1}`, label: `Năm ${y+1}`, type: 'year' });
    return opts;
};
const TIME_OPTIONS = buildTimeOptions();

const reactSelectStyles = {
    control: (base) => ({
        ...base, height: '44px', minHeight: '44px', borderRadius: '8px', 
        borderColor: '#cbd5e1', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' }
    }),
    valueContainer: (base) => ({ ...base, padding: '0 12px', height: '42px', display: 'flex', alignItems: 'center' })
};

export default function GroupProjectsTab({ currentUser, addToast, users }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');  // empty = auto-exclude 'Chưa thành công'
    const [userFilter, setUserFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    
    // Modal state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/group-projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi tải danh sách dự án', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đoàn này không?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/group-projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(addToast) addToast("Xóa Thành Công", "success");
            fetchProjects();
        } catch(err) {
            if(addToast) addToast("Lỗi khi xóa", "error");
        }
    };

    const handleOpenProject = (project) => {
        setSelectedProject(project);
        setIsDrawerOpen(true);
    };

    const handleAddProject = () => {
        setSelectedProject(null);
        setIsDrawerOpen(true);
    };

    const handleInlineStatusChange = async (projectId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const proj = projects.find(p => p.id === projectId);
            if (!proj) return;
            await axios.put(`/api/group-projects/${projectId}`, {
                ...proj, status: newStatus
            }, { headers: { Authorization: `Bearer ${token}` } });
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi cập nhật trạng thái', 'error');
        }
    };

    const filtered = projects.filter(p => {
        const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
                             (p.leader_name || '').toLowerCase().includes(search.toLowerCase());
        // Status: empty = auto-exclude 'Chưa thành công', '__ALL__' = show everything
        let matchStatus = true;
        if (statusFilter === '__ALL__') {
            matchStatus = true;
        } else if (statusFilter) {
            matchStatus = p.status === statusFilter;
        } else {
            matchStatus = p.status !== 'Chưa thành công';
        }
        const matchUser = userFilter ? p.assigned_to === parseInt(userFilter) : true;
        // Time filter: month (2026-01), quarter (Q1-2026), year (Y-2026)
        let matchTime = true;
        if (timeFilter) {
            const depDate = p.departure_date ? p.departure_date.substring(0, 10) : null;
            if (timeFilter.startsWith('Q')) {
                // Quarter: Q1-2026
                const [qPart, yPart] = timeFilter.split('-');
                const quarter = parseInt(qPart.replace('Q', ''));
                const qYear = parseInt(yPart);
                if (depDate) {
                    const dMonth = parseInt(depDate.substring(5, 7));
                    const dYear = parseInt(depDate.substring(0, 4));
                    const dQuarter = Math.ceil(dMonth / 3);
                    matchTime = dYear === qYear && dQuarter === quarter;
                } else { matchTime = false; }
            } else if (timeFilter.startsWith('Y-')) {
                // Year: Y-2026
                const yr = timeFilter.replace('Y-', '');
                matchTime = depDate ? depDate.startsWith(yr) : false;
            } else {
                // Month: 2026-01
                matchTime = depDate ? depDate.startsWith(timeFilter) : false;
            }
        }
        return matchSearch && matchStatus && matchUser && matchTime;
    }).sort((a, b) => {
        // Null dates first, then newest (closest) date first = DESC
        if (!a.departure_date && !b.departure_date) return 0;
        if (!a.departure_date) return -1;
        if (!b.departure_date) return 1;
        return new Date(b.departure_date) - new Date(a.departure_date);
    });

    const userOptions = (users || []).filter(u => u.status === 'Active' || u.status === 'Hoạt động').map(u => ({
        value: u.id.toString(), label: u.full_name
    }));

    const getStatusColor = (status) => {
        switch(status) {
            case 'Báo giá': return { bg: '#e0e7ff', color: '#4f46e5' };
            case 'Đang theo dõi': return { bg: '#fef3c7', color: '#d97706' };
            case 'Thành công': return { bg: '#dcfce7', color: '#16a34a' };
            case 'Đã quyết toán': return { bg: '#f1f5f9', color: '#475569' };
            case 'Chưa thành công': return { bg: '#fee2e2', color: '#dc2626' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <div style={{ padding: '0 2rem' }}>
            <div className="filter-bar" style={{ 
                display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', 
                backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', 
                boxShadow: 'var(--shadow)', marginBottom: '2rem'
            }}>
                <div className="filter-group" style={{ flex: '1 1 250px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>TÌM KIẾM ĐOÀN / ĐẠI DIỆN</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Nhập tên đoàn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '40px', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ flex: '0 0 170px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>TÌNH TRẠNG</label>
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter === '' ? { value: '', label: '🚫 Trừ thất bại' } : STATUS_OPTIONS.find(o => o.value === statusFilter) || null}
                        onChange={option => setStatusFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Trừ thất bại"
                    />
                </div>

                <div className="filter-group" style={{ flex: '0 0 180px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>NHÂN VIÊN</label>
                    <Select
                        options={userOptions}
                        value={userOptions.find(o => o.value === userFilter) || null}
                        onChange={option => setUserFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Chọn Sales"
                    />
                </div>

                <div className="filter-group" style={{ flex: '0 0 180px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>THỜI GIAN</label>
                    <Select
                        options={[
                            { label: '📅 Tháng', options: TIME_OPTIONS.filter(o => o.type === 'month') },
                            { label: '📊 Quý', options: TIME_OPTIONS.filter(o => o.type === 'quarter') },
                            { label: '📆 Năm', options: TIME_OPTIONS.filter(o => o.type === 'year') }
                        ]}
                        value={TIME_OPTIONS.find(o => o.value === timeFilter) || null}
                        onChange={option => setTimeFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Tháng / Quý / Năm"
                    />
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.4rem' }}>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations') && (
                        <button className="btn btn-primary" onClick={handleAddProject} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)', cursor: 'pointer' }}>
                            <Plus size={18} /> Thêm Dự Án
                        </button>
                    )}
                </div>
            </div>

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr style={{ color: '#475569', fontSize: '0.8rem' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>NGÀY ĐI - VỀ</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>TÊN ĐOÀN (DỰ ÁN)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', width: '150px' }}>GIAI ĐOẠN</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>TUYẾN ĐIỂM</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>QUY MÔ</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>DỰ KIẾN THU</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>B2B / ĐẠI DIỆN</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>SALE</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Không có dự án MICE nào.</td></tr>
                        ) : (
                            filtered.map(p => {
                                const stColors = getStatusColor(p.status);
                                return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ color: '#1e293b', fontWeight: 600 }}>
                                            {p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '---'}
                                        </div>
                                        {p.return_date && String(p.return_date).split('T')[0] !== String(p.departure_date).split('T')[0] && (
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                → {new Date(p.return_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600 }}>
                                            <Briefcase size={16} color="#3b82f6" />
                                            {p.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                        <select
                                            value={p.status || 'Báo giá'}
                                            onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                                                border: '1px solid transparent', cursor: 'pointer', width: '100%',
                                                background: stColors.bg, color: stColors.color,
                                                outline: 'none', appearance: 'auto'
                                            }}
                                        >
                                            <option value="Báo giá">Báo giá</option>
                                            <option value="Đang theo dõi">Đang theo dõi</option>
                                            <option value="Thành công">Thành công</option>
                                            <option value="Đã quyết toán">Đã quyết toán</option>
                                            <option value="Chưa thành công">Chưa thành công</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                                            <MapPin size={14} color="#94a3b8" />
                                            {p.destination || 'Chưa xác định'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {p.expected_pax} Pax
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatMoney(p.total_revenue)}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatMoney(p.price_per_pax)} / Pax</div>
                                    </td>
                                    <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.company_name || 'Khách Lẻ'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', marginTop: '4px', fontSize: '0.75rem' }}>
                                            <Users size={12} /> {p.leader_name || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{p.assigned_name || '-'}</span>
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button className="btn-icon" onClick={() => handleOpenProject(p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon" onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            {isDrawerOpen && (
                <GroupProjectDetailDrawer 
                    project={selectedProject} 
                    onClose={() => setIsDrawerOpen(false)} 
                    refreshList={fetchProjects}
                    currentUser={currentUser}
                    addToast={addToast}
                    users={users}
                />
            )}
        </div>
    );
}
