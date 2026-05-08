import { canCreate, canDelete, canEdit } from '../utils/permissions';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Edit2, Trash2, Calendar, Users, Briefcase, Eye, UserCheck, Rocket } from 'lucide-react';
import Select from 'react-select';
import GroupProjectDetailDrawer from '../components/modals/GroupProjectDetailDrawer';
import { formatRoleDisplayName } from '../utils/roleUtils';

const STATUS_OPTIONS = [
    { value: 'Báo giá', label: 'Báo giá' },
    { value: 'Đang theo dõi', label: 'Đang theo dõi' },
    { value: 'Thành công', label: 'Thành công' },
    { value: 'Đã quyết toán', label: 'Đã quyết toán' },
    { value: 'Chưa thành công', label: 'Chưa thành công' },
    { value: '__ALL__', label: '⚡ Tất cả (kể cả thất bại)' }
];


const reactSelectStyles = {
    control: (base, state) => ({
        ...base,
        height: '44px',
        minHeight: '44px',
        borderRadius: '10px',
        borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
        boxShadow: 'none',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#1e293b',
        backgroundColor: 'white',
        transition: 'all 0.2s',
        '&:hover': { borderColor: state.isFocused ? '#2563eb' : '#cbd5e1' }
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 14px',
        height: '42px',
        display: 'flex',
        alignItems: 'center'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8'
    }),
    singleValue: (base) => ({
        ...base,
        color: '#1e293b'
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        padding: '4px'
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: '8px',
        margin: '2px 0',
        padding: '10px 12px',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        backgroundColor: state.isSelected 
            ? '#2563eb' 
            : state.isFocused 
                ? '#f1f5f9' 
                : 'transparent',
        color: state.isSelected ? 'white' : '#475569',
        '&:active': { backgroundColor: '#e2e8f0' }
    })
};

export default function GroupProjectsTab({ currentUser, addToast, users, handleDeleteProject, canViewProfit = true }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');  // empty = auto-exclude 'Chưa thành công'
    const [userFilter, setUserFilter] = useState('');
    
    // New time filter state
    const [timeFilterMode, setTimeFilterMode] = useState('all'); // 'all', 'month', 'quarter', 'year', 'custom'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    
    // Modal state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [openExecutionInitially, setOpenExecutionInitially] = useState(false);
    const [openApprovalInitially, setOpenApprovalInitially] = useState(false);

    useEffect(() => {
        fetchProjects();

        const handleReload = () => fetchProjects();
        window.addEventListener('reloadGroupProjects', handleReload);
        return () => window.removeEventListener('reloadGroupProjects', handleReload);
    }, []);

    // Try to open a project from sessionStorage link
    useEffect(() => {
        const pending = sessionStorage.getItem('pendingProjectOpen');
        if (pending && projects.length > 0) {
            const p = projects.find(proj => String(proj.id) === String(pending));
            if (p) {
                setSelectedProject(p);
                setIsDrawerOpen(true);
            }
            sessionStorage.removeItem('pendingProjectOpen');
        }
    }, [projects]);

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

    const handleDelete = (id) => {
        if (handleDeleteProject) handleDeleteProject(id);
    };

    const handleOpenProject = (project, openExecution = false, openApproval = false) => {
        setSelectedProject(project);
        setOpenExecutionInitially(openExecution);
        setOpenApprovalInitially(openApproval);
        setIsDrawerOpen(true);
    };

    const handleAddProject = () => {
        setSelectedProject(null);
        setOpenExecutionInitially(false);
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
        let matchTime = true;
        if (timeFilterMode !== 'all') {
            const depDate = p.departure_date ? p.departure_date.substring(0, 10) : null;
            if (!depDate) {
                matchTime = false;
            } else {
                const dYear = parseInt(depDate.substring(0, 4));
                const dMonth = parseInt(depDate.substring(5, 7));
                if (timeFilterMode === 'month') {
                    matchTime = dYear === selectedYear && dMonth === selectedMonth;
                } else if (timeFilterMode === 'quarter') {
                    const dQuarter = Math.ceil(dMonth / 3);
                    matchTime = dYear === selectedYear && dQuarter === selectedQuarter;
                } else if (timeFilterMode === 'year') {
                    matchTime = dYear === selectedYear;
                } else if (timeFilterMode === 'custom') {
                    const dNum = new Date(depDate).getTime();
                    const sNum = customStartDate ? new Date(customStartDate).getTime() : -Infinity;
                    const eNum = customEndDate ? new Date(customEndDate).getTime() : Infinity;
                    matchTime = dNum >= sNum && dNum <= eNum;
                }
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

    const allowedRoles = ['group_staff', 'group_manager', 'group_operations', 'group_operations_lead', 'admin', 'manager'];
    const userOptions = (users || []).filter(u => u.is_active !== false && allowedRoles.includes(u.role_name))
    .map(u => ({
        value: u.id.toString(), 
        label: `${u.full_name || u.username} (${formatRoleDisplayName(u.role_name)})`
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
            <style>
                {`
                .filter-preset-group {
                    display: flex;
                    gap: 8px;
                    padding: 4px;
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .preset-btn {
                    padding: 6px 16px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .preset-btn:hover {
                    color: #1e293b;
                    background: rgba(255,255,255,0.5);
                }
                .preset-btn.active {
                    background: white;
                    color: #2563eb;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .filter-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    display: block;
                }
                `}
            </style>

            <div className="filter-bar" style={{ 
                display: 'flex', flexDirection: 'column', gap: '1.25rem', 
                backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '2rem',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div className="filter-group" style={{ flex: '2 1 300px' }}>
                        <label className="filter-label">Tìm kiếm đoàn / Đại diện</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Tên đoàn, công ty, người đại diện..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '100%', paddingLeft: '44px', height: '44px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    <div className="filter-group" style={{ flex: '1 1 200px' }}>
                        <label className="filter-label">Tình trạng</label>
                        <Select
                            options={STATUS_OPTIONS}
                            value={statusFilter === '' ? { value: '', label: '🚫 Trừ thất bại' } : STATUS_OPTIONS.find(o => o.value === statusFilter) || null}
                            onChange={option => setStatusFilter(option ? option.value : '')}
                            styles={reactSelectStyles}
                            isClearable
                            placeholder="Trừ thất bại"
                        />
                    </div>

                    <div className="filter-group" style={{ flex: '1 1 200px' }}>
                        <label className="filter-label">Nhân viên phụ trách</label>
                        <Select
                            options={userOptions}
                            value={userOptions.find(o => o.value === userFilter) || null}
                            onChange={option => setUserFilter(option ? option.value : '')}
                            styles={reactSelectStyles}
                            isClearable
                            placeholder="Chọn Sales"
                        />
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className="filter-label" style={{ margin: 0 }}>Thời gian:</span>
                        <div className="filter-preset-group">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'month', label: 'Tháng' },
                                { id: 'quarter', label: 'Quý' },
                                { id: 'year', label: 'Năm' },
                                { id: 'custom', label: 'Tùy chọn' }
                            ].map(p => (
                                <button key={p.id} className={`preset-btn ${timeFilterMode === p.id ? 'active' : ''}`} onClick={() => setTimeFilterMode(p.id)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {timeFilterMode === 'month' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                                    {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                                </select>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                            </div>
                        )}

                        {timeFilterMode === 'quarter' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }} value={selectedQuarter} onChange={e => setSelectedQuarter(parseInt(e.target.value))}>
                                    {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
                                </select>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                            </div>
                        )}

                        {timeFilterMode === 'year' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                            </div>
                        )}

                        {timeFilterMode === 'custom' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <input type="date" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: '#475569' }} value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                                <span style={{ color: '#cbd5e1' }}>-</span>
                                <input type="date" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', color: '#475569' }} value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                            <span style={{ color: '#2563eb' }}>{filtered.length}</span> Dự án
                        </div>
                        {canCreate(currentUser?.role, 'group') && (
                            <button className="btn btn-primary" onClick={handleAddProject} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', height: '40px', padding: '0 1.25rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                <Plus size={18} strokeWidth={3} /> Thêm Dự Án
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr style={{ color: '#475569', fontSize: '0.8rem' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>NGÀY ĐI - VỀ</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>TÊN ĐOÀN (DỰ ÁN)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', width: '180px' }}>GIAI ĐOẠN</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>TUYẾN ĐIỂM</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>QUY MÔ</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>DỰ KIẾN THU</th>
                            {canViewProfit && <th style={{ padding: '12px 16px', textAlign: 'right' }}>LỢI NHUẬN</th>}
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>B2B / ĐẠI DIỆN</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>SALE</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>HDV</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Không có dự án MICE nào.</td></tr>
                        ) : (
                            filtered.map(p => {
                                const stColors = getStatusColor(p.status);
                                return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                        <div style={{ color: '#1e293b', fontWeight: 600 }}>
                                            {p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '---'}
                                        </div>
                                        {p.return_date && new Date(p.return_date).toLocaleDateString('en-CA') !== new Date(p.departure_date).toLocaleDateString('en-CA') && (
                                            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                                → {new Date(p.return_date).toLocaleDateString('vi-VN')}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem' }}>
                                            <Briefcase size={16} color="#3b82f6" />
                                            {p.name}
                                        </div>
                                        <div style={{ marginTop: '6px' }}>
                                            <button 
                                                onClick={() => handleOpenProject(p, true)}
                                                style={{
                                                    background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                }}
                                                title="Mở bảng tiến độ thực thi"
                                            >
                                                <Rocket size={12} /> Tiến độ thực thi
                                            </button>
                                            <button 
                                                onClick={() => handleOpenProject(p, false, true)}
                                                style={{
                                                    background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    marginTop: '4px'
                                                }}
                                                title="Mở bản trình duyệt A4"
                                            >
                                                📄 Bản trình duyệt
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                        <select
                                            value={p.status || 'Báo giá'}
                                            onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700,
                                                cursor: 'pointer', borderColor: 'transparent', minWidth: '130px',
                                                appearance: 'none', background: stColors.bg, color: stColors.color,
                                                borderRadius: '6px', outline: 'none', textAlign: 'center'
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
                                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {p.expected_pax} Pax
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '0.85rem' }}>{formatMoney(p.total_revenue)}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatMoney(p.price_per_pax)} / Pax</div>
                                    </td>
                                    {canViewProfit && (
                                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: p.profit > 0 ? '#ea580c' : '#94a3b8', fontSize: '0.85rem' }}>{formatMoney(p.profit)}</div>
                                    </td>
                                    )}
                                    <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: p.company_name ? '#0f172a' : '#94a3b8' }}>{p.company_name || '— Chưa chọn DN —'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', marginTop: '4px', fontSize: '0.75rem' }}>
                                            <Users size={12} /> {p.leader_name || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{p.assigned_name || '-'}</span>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {p.guide_names && p.guide_names.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '160px' }} title={p.guide_names.join(', ')}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', fontWeight: 600, color: '#92400e', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fde68a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                                    <UserCheck size={11} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.guide_names[0]}</span>
                                                </span>
                                                {p.guide_names.length > 1 && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#b45309', background: '#fffbeb', padding: '0 6px', borderRadius: '6px', border: '1px dashed #fcd34d', cursor: 'help' }}>
                                                        +{p.guide_names.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="icon-btn" title="Xem" onClick={() => handleOpenProject(p)} style={{ color: '#0284c7', background: '#e0f2fe' }}>
                                                <Eye size={16} />
                                            </button>
                                            {(canEdit(currentUser?.role, 'group') || p.assigned_to === currentUser?.id) && (
                                                <button className="icon-btn edit" title="Sửa" onClick={() => handleOpenProject(p)}>
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDelete(currentUser?.role, 'group') && (
                                                <button className="icon-btn delete" onClick={() => handleDelete(p.id)} title="Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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
                    canViewProfit={canViewProfit}
                    initialOpenExecution={openExecutionInitially}
                    initialOpenApproval={openApprovalInitially}
                />
            )}
        </div>
    );
}
