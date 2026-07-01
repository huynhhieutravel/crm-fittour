import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Stamp, ChevronLeft, ChevronRight, Edit3, Trash2, Eye } from 'lucide-react';
import VisaProviderDetailDrawer from '../components/modals/VisaProviderDetailDrawer';

const VisaProvidersTab = ({ checkPerm, checkView, currentUser, setVisaProviderToDelete, addToast }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [drawerMode, setDrawerMode] = useState('edit');

    const LIMIT = 30;

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/visa-providers', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: searchTerm, page, limit: LIMIT }
            });
            setProviders(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotalItems(res.data.total);
            setPage(res.data.page);
        } catch (err) {
            console.error('Lỗi khi tải Nhà Cung Cấp Visa:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (checkView('suppliers')) fetchProviders();
    }, [page, searchTerm]);

    useEffect(() => {
        const handleReload = () => { fetchProviders(); };
        window.addEventListener('reloadVisaProviders', handleReload);
        return () => window.removeEventListener('reloadVisaProviders', handleReload);
    }, [page, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleOpenDrawer = (provider = null, mode = 'edit') => {
        setEditingProvider(provider);
        setDrawerMode(mode);
        setDrawerOpen(true);
    };

    if (!checkView('suppliers')) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không có quyền truy cập module này.</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Stamp size={24} color="#0ea5e9" />
                        Quản lý Nhà Cung Cấp Visa
                    </h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Tổng số: {totalItems} nhà cung cấp</p>
                </div>
                {checkPerm('suppliers', 'create') && (
                    <button onClick={() => handleOpenDrawer()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.2)' }}>
                        <Plus size={18} /> Thêm Mới
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 6' }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>TÌM KIẾM NHÀ CUNG CẤP</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                        <input type="text" placeholder="Mã, Tên nhà cung cấp..." value={searchTerm} onChange={handleSearch} style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Đang tải...</div>
            ) : providers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    <Stamp size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <h3>Chưa có nhà cung cấp nào</h3>
                    <p>Hãy thêm nhà cung cấp đầu tiên để bắt đầu quản lý</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#0f172a', color: 'white', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '16px', fontWeight: 600, width: '15%' }}>MÃ NCC</th>
                                <th style={{ padding: '16px', fontWeight: 600, width: '30%' }}>TÊN NHÀ CUNG CẤP</th>
                                <th style={{ padding: '16px', fontWeight: 600, width: '25%' }}>PHONE / EMAIL</th>
                                <th style={{ padding: '16px', fontWeight: 600, width: '20%' }}>QUỐC GIA</th>
                                <th style={{ padding: '16px', fontWeight: 600, width: '10%', textAlign: 'center' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map((p, idx) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#f8fafc', transition: 'background 0.2s', ':hover': { background: '#f1f5f9' } }}>
                                    <td 
                                        style={{ padding: '16px', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}
                                        onClick={() => handleOpenDrawer(p, 'view')}
                                        title="Click để xem chi tiết"
                                    >
                                        <span style={{ borderBottom: '1px dashed #3b82f6' }}>{p.code}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>TGXL: {p.processing_time || 'Chưa cập nhật'}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 500, color: '#334155' }}>{p.phone || '-'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.email || '-'}</div>
                                    </td>
                                    <td style={{ padding: '16px', color: '#475569', fontSize: '0.9rem' }}>{p.country || 'Chưa phân loại'}</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button onClick={() => handleOpenDrawer(p, 'view')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }} title="Xem chi tiết">
                                                <Eye size={16} />
                                            </button>
                                            {checkPerm('suppliers', 'edit') && (
                                                <button onClick={() => handleOpenDrawer(p, 'edit')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Sửa">
                                                    <Edit3 size={16} />
                                                </button>
                                            )}
                                            {checkPerm('suppliers', 'delete') && (
                                                <button onClick={() => setVisaProviderToDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Hiển thị trang {page} / {totalPages}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {drawerOpen && (
                <VisaProviderDetailDrawer 
                    provider={editingProvider} 
                    mode={drawerMode}
                    onClose={() => setDrawerOpen(false)} 
                    onSuccess={() => { setDrawerOpen(false); fetchProviders(); }} 
                    onEdit={() => handleOpenDrawer(editingProvider, 'edit')}
                    onDelete={() => { setDrawerOpen(false); setVisaProviderToDelete(editingProvider.id); }}
                    addToast={addToast}
                    currentUser={currentUser}
                    checkPerm={checkPerm}
                />
            )}
        </div>
    );
};

export default VisaProvidersTab;
