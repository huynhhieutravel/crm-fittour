import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, FileText, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Select from 'react-select';
import VisaDetailDrawer from '../components/modals/VisaDetailDrawer';
import { canCreate, canDelete } from '../utils/permissions';
import { useMarkets } from '../hooks/useMarkets';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
};

const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

// Parse finance_data (which may be string, array, or object) and extract totals
const parseFinanceTotals = (raw) => {
    let suppliers = [];
    try {
        if (typeof raw === 'string') {
            const parsed = JSON.parse(raw || '[]');
            suppliers = Array.isArray(parsed) ? parsed : (parsed.suppliers || []);
        } else if (Array.isArray(raw)) {
            suppliers = raw;
        } else if (raw && typeof raw === 'object') {
            suppliers = raw.suppliers || [];
        }
    } catch { suppliers = []; }

    let totalRevenue = 0;
    let totalCost = 0;
    for (const sup of suppliers) {
        const svcs = sup.services || [];
        for (const svc of svcs) {
            const rev = toNum(svc.sale_price) * toNum(svc.fx || 1) * toNum(svc.quantity || 1) + toNum(svc.surcharge) + toNum(svc.vat);
            totalRevenue += rev;
            const cost = toNum(svc.net_price) * toNum(svc.fx || 1) * toNum(svc.quantity || 1);
            totalCost += cost;
        }
        // supplier-level surcharge + VAT
        const baseCost = svcs.reduce((s, svc) => s + toNum(svc.net_price) * toNum(svc.fx || 1) * toNum(svc.quantity || 1), 0);
        totalCost += toNum(sup.cost_surcharge) + (baseCost * toNum(sup.cost_vat) / 100);
    }
    return { totalRevenue, totalCost };
};

const VISA_STATUS_OPTIONS = [
    'Tạo mới', 'Đã duyệt', 'Không duyệt', 'Chờ xin', 'Đến hạn xin', 'Quá hạn xin', 'Thành công', 'Rớt Visa'
];

const STATUS_STYLES = {
    'Tạo mới':      { bg: '#e0e7ff', color: '#3730a3' },
    'Đã duyệt':     { bg: '#dcfce7', color: '#166534' },
    'Không duyệt':  { bg: '#fee2e2', color: '#991b1b' },
    'Chờ xin':       { bg: '#fef9c3', color: '#854d0e' },
    'Đến hạn xin':   { bg: '#ffedd5', color: '#c2410c' },
    'Quá hạn xin':   { bg: '#fee2e2', color: '#b91c1c' },
    'Thành công':    { bg: '#dcfce7', color: '#166534' },
    'Rớt Visa':     { bg: '#fce7f3', color: '#9d174d' }
};

export default function VisasTab({ currentUser, addToast }) {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [marketFilter, setMarketFilter] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [statusCounts, setStatusCounts] = useState({});
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    const marketOptions = useMarkets();
    
    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedVisaId, setSelectedVisaId] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, marketFilter]);

    useEffect(() => {
        fetchVisas();
    }, [currentPage, search, statusFilter, marketFilter]);

    const fetchVisas = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/visas', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: {
                    search,
                    status: statusFilter,
                    market: marketFilter,
                    page: currentPage,
                    limit: 30
                }
            });
            setVisas(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.total || 0);
            if (res.data.statusCounts) setStatusCounts(res.data.statusCounts);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi lấy danh sách Visa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalAllStatuses = Object.values(statusCounts).reduce((s, c) => s + c, 0);

    const handleExportExcel = () => {
        if (visas.length === 0) {
            if(addToast) addToast('Không có dữ liệu để xuất', 'error');
            return;
        }
        const headers = ['STT', 'Mã hệ thống', 'Tên đơn', 'Khách hàng', 'SĐT', 'Loại KH', 'Thị trường', 'Trạng thái', 'Ngày nhận', 'Tổng thu', 'Tổng chi', 'Lợi nhuận'];
        const rows = visas.map((v, i) => {
            const ft = parseFinanceTotals(v.finance_data);
            return [
                i + 1, v.code, v.name || '', v.customer_name || '', v.customer_phone || '',
                v.customer_type || '', v.market || '', v.status || '',
                v.receipt_date ? new Date(v.receipt_date).toLocaleDateString('vi-VN') : '',
                ft.totalRevenue, ft.totalCost, ft.totalRevenue - ft.totalCost
            ];
        });
        
        const BOM = '\uFEFF';
        const csv = BOM + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Visa_Export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        if(addToast) addToast('Xuất file thành công!', 'success');
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/visas/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if(addToast) addToast('Xóa hồ sơ thành công', 'success');
            setShowDeleteConfirm(null);
            fetchVisas();
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi xóa hồ sơ', 'error');
        }
    };

    const handleQuickStatus = async (id, newStatus) => {
        try {
            await axios.patch(`/api/visas/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if(addToast) addToast(`Đã cập nhật → ${newStatus}`, 'success');
            // Update local state immediately for snappy UX
            setVisas(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi cập nhật trạng thái', 'error');
        }
    };
    
    return (
        <div style={{ padding: '0 2rem' }}>

            {/* Delete Confirm Modal */}
            {showDeleteConfirm !== null && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <AlertTriangle size={44} color="#ef4444" style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.1rem' }}>Xóa hồ sơ Visa?</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Mọi dữ liệu liên quan (checklist, tài chính, thành viên) sẽ bị xóa vĩnh viễn.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '8px 28px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>Hủy</button>
                            <button onClick={() => handleDelete(showDeleteConfirm)} style={{ padding: '8px 28px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <button 
                    onClick={() => setStatusFilter('')}
                    style={{ 
                        padding: '8px 16px', 
                        background: statusFilter === '' ? '#1e293b' : 'transparent', 
                        color: statusFilter === '' ? 'white' : '#64748b', 
                        border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Tất cả ({totalAllStatuses || totalItems})
                </button>
                {VISA_STATUS_OPTIONS.map(st => {
                    const style = STATUS_STYLES[st] || { bg: '#f1f5f9', color: '#475569' };
                    return (
                        <button 
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            style={{ 
                                padding: '8px 14px', 
                                background: statusFilter === st ? style.bg : 'transparent', 
                                color: statusFilter === st ? style.color : '#64748b', 
                                border: statusFilter === st ? `1px solid ${style.color}33` : '1px solid transparent',
                                borderRadius: '6px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {st}{statusCounts[st] ? ` (${statusCounts[st]})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'white', padding: '1rem 1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: '1 1 280px' }}>
                    <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tìm kiếm</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Mã, tên đơn, khách hàng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '34px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                <div style={{ flex: '0 0 200px' }}>
                    <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thị trường</label>
                    <Select
                        options={marketOptions}
                        value={marketFilter ? { label: marketFilter, value: marketFilter } : null}
                        onChange={option => setMarketFilter(option ? option.value : '')}
                        isClearable
                        placeholder="Tất cả"
                        styles={{ control: base => ({...base, height: '38px', minHeight: '38px', borderRadius: '8px', borderColor: '#e2e8f0', fontSize: '0.85rem'})}}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleExportExcel} style={{ height: '38px', fontSize: '0.85rem', padding: '0 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={15} /> Xuất Excel
                    </button>
                    {canCreate(currentUser?.role, 'visas') && (
                        <button className="btn-pro-save" onClick={() => { setSelectedVisaId(null); setIsDrawerOpen(true); }} style={{ height: '38px', fontSize: '0.85rem', padding: '0 16px' }}>
                            <Plus size={16} /> Thêm Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="data-table-container" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>

                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>STT</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', minWidth: '200px' }}>Mã hệ thống</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tên đơn</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Khách hàng</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ngày nhận</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'center' }}>Chờ duyệt</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phần thu</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phần chi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
                        ) : visas.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Không có hồ sơ phù hợp.</td></tr>
                        ) : (
                            visas.map((v, index) => {
                                const ft = parseFinanceTotals(v.finance_data);
                                return (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        {/* STT */}
                                        <td style={{ padding: '10px', verticalAlign: 'top', fontWeight: 500, color: '#64748b', textAlign: 'center' }}>
                                            {(currentPage - 1) * 30 + index + 1}
                                        </td>

                                        {/* Mã hệ thống */}
                                        <td style={{ padding: '10px', verticalAlign: 'top' }} onClick={() => { setSelectedVisaId(v.id); setIsDrawerOpen(true); }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', marginBottom: '2px' }}>
                                                <FileText size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#3b82f6' }} />
                                                {v.code}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Người tạo: {v.created_by_name || 'Hệ thống'}</div>
                                            {v.handled_by_name && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Phụ trách: {v.handled_by_name}</div>}
                                        </td>

                                        {/* Tên đơn */}
                                        <td style={{ padding: '10px', verticalAlign: 'top' }} onClick={() => { setSelectedVisaId(v.id); setIsDrawerOpen(true); }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{v.name || '--'}</div>
                                        </td>

                                        {/* Khách hàng */}
                                        <td style={{ padding: '10px', verticalAlign: 'top' }} onClick={() => { setSelectedVisaId(v.id); setIsDrawerOpen(true); }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span>👤 {v.customer_name || '--'}</span>
                                                {v.customer_type && (
                                                    <span style={{ 
                                                        background: v.customer_type === 'CTV' ? '#dbeafe' : '#fef3c7', 
                                                        color: v.customer_type === 'CTV' ? '#2563eb' : '#d97706', 
                                                        padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700
                                                    }}>{v.customer_type}</span>
                                                )}
                                            </div>
                                            {v.customer_phone && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>📞 {v.customer_phone}</div>}
                                            {v.market && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>TT: {v.market}</div>}
                                        </td>

                                        {/* Ngày nhận */}
                                        <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '0.85rem', color: '#475569' }}>
                                            {v.receipt_date ? new Date(v.receipt_date).toLocaleDateString('vi-VN') : '--'}
                                        </td>

                                        {/* Chờ duyệt */}
                                        <td style={{ padding: '10px', verticalAlign: 'top', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleQuickStatus(v.id, 'Đã duyệt'); }}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                                                        background: v.status === 'Đã duyệt' || v.status === 'Thành công' ? '#16a34a' : '#f0fdf4', 
                                                        color: v.status === 'Đã duyệt' || v.status === 'Thành công' ? 'white' : '#16a34a',
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    <CheckCircle size={13} /> Duyệt
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleQuickStatus(v.id, 'Không duyệt'); }}
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                                                        background: v.status === 'Không duyệt' || v.status === 'Rớt Visa' ? '#dc2626' : '#fef2f2', 
                                                        color: v.status === 'Không duyệt' || v.status === 'Rớt Visa' ? 'white' : '#dc2626',
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    <XCircle size={13} /> K.duyệt
                                                </button>
                                            </div>
                                        </td>

                                        {/* Phần thu */}
                                        <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '0.8rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                <div><span style={{ color: '#64748b' }}>Tổng thu: </span><span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(ft.totalRevenue)}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Đã thu: </span><span style={{ fontWeight: 600, color: Number(v.total_collected) >= ft.totalRevenue && ft.totalRevenue > 0 ? '#16a34a' : (Number(v.total_collected) > 0 ? '#f59e0b' : '#64748b') }}>{formatCurrency(Number(v.total_collected))}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Còn thiếu: </span><span style={{ fontWeight: 600, color: ft.totalRevenue - Number(v.total_collected || 0) > 0 ? '#ef4444' : '#1e293b' }}>{formatCurrency(Math.max(0, ft.totalRevenue - Number(v.total_collected || 0)))}</span></div>
                                            </div>
                                        </td>

                                        {/* Phần chi */}
                                        <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '0.8rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                <div><span style={{ color: '#64748b' }}>Tổng chi: </span><span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(ft.totalCost)}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Đã chi: </span><span style={{ fontWeight: 600, color: Number(v.total_paid) > 0 ? '#16a34a' : '#64748b' }}>{formatCurrency(Number(v.total_paid))}</span></div>
                                                <div><span style={{ color: '#64748b' }}>Còn nợ NCC: </span><span style={{ fontWeight: 600, color: ft.totalCost - Number(v.total_paid || 0) > 0 ? '#ef4444' : '#1e293b' }}>{formatCurrency(Math.max(0, ft.totalCost - Number(v.total_paid || 0)))}</span></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Trang <span style={{ fontWeight: 700, color: '#1e293b' }}>{currentPage}</span> / {totalPages} — Tổng {totalItems} hồ sơ
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {isDrawerOpen && (
                <VisaDetailDrawer
                    visaId={selectedVisaId}
                    onClose={() => setIsDrawerOpen(false)}
                    refreshList={fetchVisas}
                    currentUser={currentUser}
                    addToast={addToast}
                />
            )}
        </div>
    );
}
