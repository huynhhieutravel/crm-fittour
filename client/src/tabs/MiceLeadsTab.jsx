import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, ExternalLink, Calendar, MapPin, CheckCircle, XCircle, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import Select from 'react-select';
import MiceLeadDetailDrawer from '../components/modals/MiceLeadDetailDrawer';
import ConvertLeadModal from '../components/modals/ConvertLeadModal';

const STATUS_OPTIONS = [
    { value: 'New', label: 'Mới' },
    { value: 'Contacted', label: 'Đang xác minh' },
    { value: 'Qualified', label: 'Đã lọc (Qualified)' },
    { value: 'Lost', label: 'Không phù hợp (Lost)' },
    { value: 'Converted', label: 'Đã chuyển đổi' }
];

export default function MiceLeadsTab({ currentUser, addToast, users }) {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active'); // Active = not Lost/Converted
    
    // Drawers & Modals
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [leadToConvert, setLeadToConvert] = useState(null);
    const [leadToDelete, setLeadToDelete] = useState(null);

    // Inline Edit State
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/mice-leads', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(res.data);
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi khi tải danh sách Leads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInlineChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleInlineSave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === id ? { ...l, ...editData } : l));
            setEditingId(null);
            
            await axios.put(`/api/mice-leads/${id}`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(addToast) addToast('Cập nhật thành công', 'success');
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi khi cập nhật Lead', 'error');
            fetchLeads(); // Revert
        }
    };

    const handleDeleteClick = (id) => {
        setLeadToDelete(id);
    };

    const executeDelete = async () => {
        if (!leadToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/mice-leads/${leadToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(prev => prev.filter(l => l.id !== leadToDelete));
            if(addToast) addToast('Đã xóa Lead', 'success');
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi khi xóa Lead', 'error');
        } finally {
            setLeadToDelete(null);
        }
    };

    const handleConvertClick = (lead) => {
        setLeadToConvert(lead);
        setIsConvertModalOpen(true);
    };

    // Filter Logic
    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.name?.toLowerCase().includes(search.toLowerCase()) || 
                              l.phone?.includes(search) || 
                              l.destination?.toLowerCase().includes(search.toLowerCase());
        
        if (statusFilter === 'Active') {
            return matchesSearch && l.status !== 'Lost' && l.status !== 'Converted';
        }
        if (statusFilter) {
            return matchesSearch && l.status === statusFilter;
        }
        return matchesSearch;
    });

    // Check 24h Alert
    const isOver24h = (createdAt, status) => {
        if (status !== 'New') return false;
        const now = new Date();
        const created = new Date(createdAt);
        return (now - created) > 24 * 60 * 60 * 1000;
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Quản lý MICE Leads</h2>
                <button 
                    onClick={() => { setSelectedLead(null); setIsDrawerOpen(true); }}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Thêm Lead Mới
                </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm tên, SĐT, tuyến điểm..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                </div>
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '150px' }}
                >
                    <option value="Active">Đang xử lý (Active)</option>
                    <option value="">Tất cả trạng thái</option>
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                            <th style={{ padding: '16px 20px' }}>TÊN KHÁCH / CÔNG TY</th>
                            <th style={{ padding: '16px 20px' }}>LIÊN HỆ</th>
                            <th style={{ padding: '16px 20px' }}>NHU CẦU SƠ BỘ</th>
                            <th style={{ padding: '16px 20px', width: '180px' }}>TRẠNG THÁI</th>
                            <th style={{ padding: '16px 20px' }}>HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải dữ liệu...</td></tr>
                        ) : filteredLeads.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Không tìm thấy Leads nào.</td></tr>
                        ) : (
                            filteredLeads.map(lead => {
                                const isEditing = editingId === lead.id;
                                const isWarning = isOver24h(lead.created_at, lead.status);
                                
                                return (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', background: isWarning ? '#fef2f2' : 'white', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '12px 20px' }}>
                                            {isEditing ? (
                                                <input 
                                                    value={editData.name} 
                                                    onChange={e => handleInlineChange('name', e.target.value)}
                                                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                />
                                            ) : (
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {lead.name}
                                                        {isWarning && <AlertCircle size={14} color="#ef4444" title="Chưa liên hệ quá 24h" />}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Nguồn: {lead.source || 'Chưa rõ'}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            {isEditing ? (
                                                <input 
                                                    value={editData.phone} 
                                                    onChange={e => handleInlineChange('phone', e.target.value)}
                                                    placeholder="SĐT"
                                                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '4px' }}
                                                />
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                                                    <div>📞 {lead.phone || '--'}</div>
                                                    {lead.zalo_name && <div style={{ color: '#0ea5e9', fontSize: '0.8rem' }}>Zalo: {lead.zalo_name}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <input 
                                                        value={editData.expected_pax} 
                                                        onChange={e => handleInlineChange('expected_pax', e.target.value)}
                                                        placeholder="Pax"
                                                        style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                    />
                                                    <input 
                                                        value={editData.destination} 
                                                        onChange={e => handleInlineChange('destination', e.target.value)}
                                                        placeholder="Điểm đến"
                                                        style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                                                    <span style={{ fontWeight: 600 }}>{lead.expected_pax || '?'}</span> pax 
                                                    {lead.destination && <span> ➔ <span style={{ color: '#0ea5e9' }}>{lead.destination}</span></span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            {isEditing ? (
                                                <select 
                                                    value={editData.status} 
                                                    onChange={e => handleInlineChange('status', e.target.value)}
                                                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                >
                                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            ) : (
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                                                    background: lead.status === 'New' ? '#dbeafe' : 
                                                                lead.status === 'Contacted' ? '#fef3c7' : 
                                                                lead.status === 'Qualified' ? '#dcfce3' : 
                                                                lead.status === 'Lost' ? '#f1f5f9' : '#e0e7ff',
                                                    color: lead.status === 'New' ? '#2563eb' : 
                                                           lead.status === 'Contacted' ? '#d97706' : 
                                                           lead.status === 'Qualified' ? '#16a34a' : 
                                                           lead.status === 'Lost' ? '#64748b' : '#4f46e5'
                                                }}>
                                                    {STATUS_OPTIONS.find(o => o.value === lead.status)?.label || lead.status}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleInlineSave(lead.id)} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Lưu</button>
                                                    <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Hủy</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {lead.status === 'Qualified' && (
                                                        <button 
                                                            title="Convert thành Dự án"
                                                            onClick={() => handleConvertClick(lead)}
                                                            style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <ArrowRight size={14} /> Convert
                                                        </button>
                                                    )}
                                                    {lead.status === 'Converted' ? (
                                                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Đã chuyển</span>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                title="Chỉnh sửa nhanh"
                                                                onClick={() => { setEditData(lead); setEditingId(lead.id); }}
                                                                style={{ background: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                <AlertCircle size={18} />
                                                            </button>
                                                            <button 
                                                                title="Xem/Sửa chi tiết (4 Bước)"
                                                                onClick={() => { setSelectedLead(lead); setIsDrawerOpen(true); }}
                                                                style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                <ExternalLink size={18} />
                                                            </button>
                                                            <button 
                                                                title="Xóa Lead"
                                                                onClick={() => handleDeleteClick(lead.id)}
                                                                style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isDrawerOpen && (
                <MiceLeadDetailDrawer 
                    lead={selectedLead} 
                    onClose={() => setIsDrawerOpen(false)} 
                    refreshList={fetchLeads} 
                    addToast={addToast}
                    currentUser={currentUser}
                />
            )}

            {isConvertModalOpen && (
                <ConvertLeadModal 
                    lead={leadToConvert} 
                    onClose={() => setIsConvertModalOpen(false)} 
                    onConverted={() => { setIsConvertModalOpen(false); fetchLeads(); }}
                    addToast={addToast}
                />
            )}

            {/* CUSTOM DELETE CONFIRM MODAL */}
            {leadToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#ef4444' }}>
                            <AlertCircle size={24} />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Xác nhận xóa Lead</h3>
                        </div>
                        <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Bạn có chắc chắn muốn xóa Lead này không? Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị mất.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setLeadToDelete(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>Hủy bỏ</button>
                            <button onClick={executeDelete} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Xóa Lead</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
