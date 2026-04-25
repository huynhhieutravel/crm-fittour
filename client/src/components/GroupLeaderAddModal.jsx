import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export default function GroupLeaderAddModal({ open, onClose, onSuccess, companies = [], users = [], currentUser, addToast }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', company_id: '', phone: '', email: '', dob: '', preferences: '', assigned_to: currentUser?.id || ''
    });

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const dataToSubmit = {
                ...formData,
                company_name: formData.company_id ? companies.find(c => c.id === parseInt(formData.company_id))?.name : '',
                assigned_to: formData.assigned_to
            };
            await axios.post('/api/group-leaders', dataToSubmit, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (addToast) addToast('Thêm Trưởng đoàn thành công', 'success');
            onSuccess();
        } catch (err) {
            console.error(err);
            if (addToast) addToast(err.response?.data?.message || 'Lỗi khi thêm', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1, transition: 'all 0.3s ease' }}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', animation: 'slideUp 0.3s ease-out' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Thêm Trưởng Đoàn</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Tên Trưởng đoàn *</label>
                                <input required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Gắn với Doanh nghiệp</label>
                                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })}>
                                    <option value="">-- Doanh nghiệp lẻ --</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Số điện thoại</label>
                                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Email</label>
                                <input type="email" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Nhân viên chăm sóc</label>
                                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}>
                                    <option value="">-- Chưa gán --</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.username || u.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Ngày sinh</label>
                                <DatePicker
                                    selected={formData.dob ? new Date(formData.dob) : null}
                                    onChange={date => setFormData({ ...formData, dob: date ? format(date, 'yyyy-MM-dd') : '' })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="dd/mm/yyyy"
                                    className="modal-input"
                                    showYearDropdown
                                    showMonthDropdown
                                    dropdownMode="select"
                                    isClearable
                                    autoComplete="off"
                                    wrapperClassName="datepicker-full-width"
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Sở thích / Ghi chú</label>
                            <textarea rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} value={formData.preferences} onChange={e => setFormData({ ...formData, preferences: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Đang lưu...' : 'Lưu thông tin'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
