import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, CreditCard, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import Select from 'react-select';
import VisaTemplateDrawer from '../components/modals/VisaTemplateDrawer';
import VisaChecklistConfigDrawer from '../components/modals/VisaChecklistConfigDrawer';
import { canCreate, canEdit } from '../utils/permissions';
import { useMarkets } from '../hooks/useMarkets';

const VisaTemplatesTab = ({ currentUser, checkPerm, addToast }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [marketFilter, setMarketFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const marketOptions = useMarkets();

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/visa-templates', {
                params: { search, market: marketFilter, page: currentPage, limit: 30 }
            });
            setTemplates(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotalItems(res.data.total);
        } catch (error) {
            console.error(error);
            addToast('Lỗi khi tải Sản phẩm Visa', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTemplates();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, marketFilter, currentPage]);

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={28} color="#3b82f6" /> Sản Phẩm Visa (Catalog)
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                        Cấu hình Checklist hồ sơ chuẩn cho từng thị trường / quốc gia
                    </p>
                </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', backgroundColor: 'white', padding: '1rem 1.25rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: '1 1 280px' }}>
                    <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Tìm kiếm</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Tên Visa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '34px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                <div style={{ flex: '0 0 200px' }}>
                    <label style={{ marginBottom: '6px', display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Thị trường</label>
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
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || (checkPerm && checkPerm('settings', 'edit'))) && (
                        <button onClick={() => setIsConfigOpen(true)} style={{ height: '38px', fontSize: '0.85rem', padding: '0 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <Settings size={16} /> Cấu hình Giấy tờ
                        </button>
                    )}
                    {(checkPerm ? checkPerm('visas', 'create') : canCreate(currentUser?.role, 'visas')) && (
                        <button className="btn-pro-save" onClick={() => { setSelectedId(null); setIsDrawerOpen(true); }} style={{ height: '38px', fontSize: '0.85rem', padding: '0 16px' }}>
                            <Plus size={16} /> Thêm Sản Phẩm
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="data-table-container" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                <table className="data-table mobile-card-table" style={{ fontSize: '0.85rem', width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tên Sản phẩm</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Thị trường</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Loại Visa</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cấu hình Checklist</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Trạng thái</th>
                            <th style={{ padding: '12px 10px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Người tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Đang tải...</td></tr>
                        ) : templates.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chưa có sản phẩm nào.</td></tr>
                        ) : (
                            (templates || []).map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                    onClick={() => { setSelectedId(item.id); setIsDrawerOpen(true); }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                >
                                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b' }}>
                                        {item.name}
                                    </td>
                                    <td style={{ padding: '12px 10px', color: '#475569' }}>{item.market || '--'}</td>
                                    <td style={{ padding: '12px 10px', color: '#475569' }}>
                                        {item.visa_type ? (
                                            <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {item.visa_type}
                                            </span>
                                        ) : '--'}
                                    </td>
                                    <td style={{ padding: '12px 10px', color: '#475569' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Settings size={14} color="#64748b" />
                                            <span>Đã cấu hình {(item.checklist_config || []).length} mục</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 10px' }}>
                                        {item.is_active ? 
                                            <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><ToggleRight size={16} /> Hoạt động</span> : 
                                            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><ToggleLeft size={16} /> Tạm ngưng</span>
                                        }
                                    </td>
                                    <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '0.8rem' }}>{item.created_by_name || 'System'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {isDrawerOpen && (
                <VisaTemplateDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => setIsDrawerOpen(false)} 
                    templateId={selectedId} 
                    refreshData={fetchTemplates} 
                    checkPerm={checkPerm}
                    currentUser={currentUser}
                />
            )}

            {isConfigOpen && (
                <VisaChecklistConfigDrawer
                    isOpen={isConfigOpen}
                    onClose={() => setIsConfigOpen(false)}
                />
            )}
        </div>
    );
};

export default VisaTemplatesTab;
