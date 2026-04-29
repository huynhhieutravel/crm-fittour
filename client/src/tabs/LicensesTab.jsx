import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, Plus, Edit2, Trash2, FileText, Search, X, Save } from 'lucide-react';

export default function LicensesTab({ currentUser, addToast }) {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', link: '', description: '' });

    const canEdit = ['admin', 'manager'].includes(currentUser?.role);

    useEffect(() => { fetchLicenses(); }, []);

    const fetchLicenses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } });
            setLicenses(res.data);
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi tải dữ liệu giấy phép', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return addToast ? addToast('Tên là bắt buộc!', 'warning') : alert('Tên là bắt buộc!');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editingItem) {
                await axios.put(`/api/licenses/${editingItem.id}`, formData, config);
                if (addToast) addToast('Cập nhật thành công!', 'success');
            } else {
                await axios.post('/api/licenses', formData, config);
                if (addToast) addToast('Thêm giấy phép thành công!', 'success');
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', link: '', description: '' });
            fetchLicenses();
        } catch (err) {
            if (addToast) addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!await swalConfirm('Bạn có chắc muốn xóa giấy phép này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/licenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (addToast) addToast('Đã xóa', 'success');
            fetchLicenses();
        } catch (err) {
            if (addToast) addToast('Lỗi xóa: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const openAdd = () => {
        setEditingItem(null);
        setFormData({ name: '', link: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({ name: item.name, link: item.link || '', description: item.description || '' });
        setShowModal(true);
    };

    const filtered = licenses.filter(l => 
        l.name.toLowerCase().includes(search.toLowerCase()) || 
        (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ padding: '0 2rem' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.25rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text" placeholder="Tìm kiếm giấy phép, mô tả..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '40px', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>
                {canEdit && (
                    <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', cursor: 'pointer' }}>
                        <Plus size={18} /> Thêm Mới
                    </button>
                )}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr style={{ color: '#475569', fontSize: '0.8rem' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '60px' }}>#</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left' }}>TÊN GIẤY PHÉP / TÀI LIỆU</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '120px' }}>LINK</th>
                            {canEdit && <th style={{ padding: '16px 20px', textAlign: 'center', width: '120px' }}>THAO TÁC</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={canEdit ? 4 : 3} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={canEdit ? 4 : 3} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Không có giấy phép nào.</td></tr>
                        ) : filtered.map((item, idx) => (
                            <tr key={item.id} style={{ transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                                <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                        <div style={{ marginTop: '2px' }}><FileText size={18} color="#6366f1" /></div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                                            {item.description && (
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>{item.description}</div>
                                            )}
                                            {item.updated_at && (
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                                                    Cập nhật: {formatDate(item.updated_at)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                    {item.link ? (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 14px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'} onMouseOut={e => e.currentTarget.style.background = '#2563eb'}>
                                            <ExternalLink size={14} /> Mở
                                        </a>
                                    ) : (
                                        <span style={{ color: '#cbd5e1' }}>—</span>
                                    )}
                                </td>
                                {canEdit && (
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button title="Sửa" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }} onClick={() => openEdit(item)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button title="Xoá" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '500px', maxWidth: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                {editingItem ? 'Chỉnh sửa Giấy phép' : 'Thêm Giấy phép mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Tên giấy phép / tài liệu *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: GPKD FIT Tour..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                                    Mô tả ngắn <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Tối đa 255 ký tự)</span>
                                </label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                    placeholder="Mô tả nội dung để dễ tìm kiếm sau này..." 
                                    maxLength={255}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'none' }} 
                                />
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                                    {formData.description.length}/255
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Link tài liệu (Drive, URL...)</label>
                                <input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={16} /> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
