import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Building, Users, Briefcase, MapPin, Calendar, DollarSign, Activity, Plus, ExternalLink } from 'lucide-react';
import Select from 'react-select';
import { MARKET_OPTIONS } from '../../constants/markets';
import { isViewOnly as checkViewOnly } from '../../utils/permissions';

export default function GroupProjectDetailDrawer({ project, onClose, refreshList, currentUser, addToast, users }) {
    const [formData, setFormData] = useState({
        name: '', group_leader_id: '', source: '', status: 'Báo giá', destination: '',
        expected_pax: 0, price_per_pax: 0, departure_date: '', return_date: '', expected_month: '', total_revenue: 0, assigned_to: ''
    });
    
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddingLeader, setIsAddingLeader] = useState(false);
    const [newLeaderName, setNewLeaderName] = useState('');

    useEffect(() => {
        fetchLeaders();
        if (project) {
            setFormData({
                ...project,
                departure_date: project.departure_date ? String(project.departure_date).split('T')[0] : '',
                return_date: project.return_date ? String(project.return_date).split('T')[0] : '',
                price_per_pax: project.price_per_pax ? Number(project.price_per_pax) : 0,
                total_revenue: project.total_revenue ? Number(project.total_revenue) : 0
            });
        }
    }, [project]);
    
    // Auto-calculate Doanh Thu if Pax or Price change
    useEffect(() => {
        if (!project) {
            const pax = Number(formData.expected_pax) || 0;
            const price = Number(formData.price_per_pax) || 0;
            if (pax > 0 && price > 0) {
                setFormData(prev => ({ ...prev, total_revenue: pax * price }));
            }
        }
    }, [formData.expected_pax, formData.price_per_pax, project]);

    const fetchLeaders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/group-leaders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return addToast ? addToast('Tên Dự án là bắt buộc!', 'warning') : alert('Tên Dự án là bắt buộc!');
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (payload.departure_date && !payload.expected_month) {
                payload.expected_month = payload.departure_date.substring(0, 7);
            }

            // Create new leader on the fly if needed
            if (isAddingLeader && newLeaderName.trim()) {
                const leaderRes = await axios.post('/api/group-leaders', 
                    { name: newLeaderName.trim(), source: 'Dự án MICE', status: 'Tiềm năng' }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                payload.group_leader_id = leaderRes.data.id;
            } else if (isAddingLeader && !newLeaderName.trim()) {
                if (addToast) addToast('Vui lòng nhập tên người đại diện!', 'warning');
                setLoading(false);
                return;
            }

            if (project?.id) {
                await axios.put(`/api/group-projects/${project.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (addToast) addToast('Cập nhật Dự án thành công!', 'success');
            } else {
                await axios.post('/api/group-projects', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (addToast) addToast('Tạo mới Dự án thành công!', 'success');
            }
            refreshList();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (addToast) addToast('Lỗi: ' + msg, 'error'); else alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const isViewOnly = checkViewOnly(currentUser?.role, 'group');

    const drawerInputStyle = { 
        padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', 
        fontSize: '14px', width: '100%', outline: 'none', background: 'white', transition: 'border 0.2s' 
    };

    const reactSelectStyles = {
        control: (base) => ({
            ...base, height: '40px', minHeight: '40px', borderRadius: '8px', 
            borderColor: '#cbd5e1', boxShadow: 'none', '&:hover': { borderColor: '#94a3b8' }
        }),
        valueContainer: (base) => ({ ...base, padding: '0 12px', height: '38px', display: 'flex', alignItems: 'center' })
    };

    const leaderOptions = leaders.map(l => ({ value: l.id, label: `${l.name} - ${l.company_name || 'Khách Lẻ'}` }));
    const userOptions = (users || []).filter(u => u.status === 'Active' || u.status === 'Hoạt động').map(u => ({
        value: u.id, label: u.full_name
    }));

    const handleRevenueChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, total_revenue: rawValue ? parseInt(rawValue, 10) : 0 });
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, price_per_pax: rawValue ? parseInt(rawValue, 10) : 0 });
    };

    const formattedRevenue = formData.total_revenue && !isNaN(Number(formData.total_revenue)) 
        ? new Intl.NumberFormat('vi-VN').format(Number(formData.total_revenue)) 
        : '';
        
    const formattedPrice = formData.price_per_pax && !isNaN(Number(formData.price_per_pax)) 
        ? new Intl.NumberFormat('vi-VN').format(Number(formData.price_per_pax)) 
        : '';

    return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
            <div className="drawer-content" style={{ width: '1000px', maxWidth: '100%', background: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s' }}>
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2.5rem', background: 'linear-gradient(to right, #1e293b, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Briefcase size={24} color="#38bdf8"/> {project ? `Dự Án: ${project.name}` : 'Thêm mới Dự Án MICE'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', color: 'white', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2rem', alignContent: 'start' }}>
                    <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#94a3b8" /> THÔNG TIN CƠ BẢN
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>TÊN ĐOÀN / DỰ ÁN *</label>
                                <input type="text" style={{ ...drawerInputStyle, color: '#0f172a', fontWeight: 600, borderColor: '#94a3b8' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên dự án..." />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        ĐẠI DIỆN ĐOÀN (B2B)
                                        {formData.group_leader_id && (
                                            <button 
                                                title="Mở hồ sơ Trưởng đoàn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    sessionStorage.setItem('pendingLeaderOpen', formData.group_leader_id);
                                                    window.history.pushState({}, '', '/group/leaders');
                                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                                    onClose();
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#3b82f6', display: 'flex', alignItems: 'center' }}
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        )}
                                    </label>
                                    <button 
                                        onClick={() => setIsAddingLeader(!isAddingLeader)} 
                                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        {isAddingLeader ? 'Hủy thêm mới' : <><Plus size={14} /> B2B Mới</>}
                                    </button>
                                </div>
                                {isAddingLeader ? (
                                    <input type="text" style={{ ...drawerInputStyle, borderColor: '#3b82f6', backgroundColor: '#eff6ff' }} value={newLeaderName} onChange={e => setNewLeaderName(e.target.value)} disabled={isViewOnly} placeholder="Nhập tên người đại diện mới..." autoFocus />
                                ) : (
                                    <Select 
                                        options={leaderOptions}
                                        value={leaderOptions.find(o => o.value === formData.group_leader_id) || null}
                                        onChange={o => setFormData({...formData, group_leader_id: o ? o.value : null})}
                                        styles={reactSelectStyles}
                                        isClearable
                                        isDisabled={isViewOnly}
                                        placeholder="Tìm đại diện..."
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>TÌNH TRẠNG</label>
                                <select style={drawerInputStyle} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={isViewOnly}>
                                    <option value="Báo giá">Báo giá</option>
                                    <option value="Đang theo dõi">Đang theo dõi</option>
                                    <option value="Thành công">Thành công</option>
                                    <option value="Chưa thành công">Chưa thành công</option>
                                    <option value="Đã quyết toán">Đã quyết toán</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>SALE PHỤ TRÁCH</label>
                                <Select 
                                    options={userOptions}
                                    value={userOptions.find(o => o.value === formData.assigned_to) || null}
                                    onChange={o => setFormData({...formData, assigned_to: o ? o.value : null})}
                                    styles={reactSelectStyles}
                                    isClearable
                                    isDisabled={isViewOnly}
                                    placeholder="Chọn Sale..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} color="#94a3b8" /> CHI TIẾT DỊCH VỤ
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>TUYẾN ĐIỂM (DESTINATION)</label>
                                <Select 
                                    options={MARKET_OPTIONS}
                                    value={formData.destination ? { label: formData.destination, value: formData.destination } : null}
                                    onChange={o => setFormData({...formData, destination: o ? o.value : ''})}
                                    styles={reactSelectStyles}
                                    isClearable
                                    isDisabled={isViewOnly}
                                    placeholder="Chọn Tuyến điểm MICE..."
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>SỐ LƯỢNG (PAX)</label>
                                <input type="number" style={drawerInputStyle} value={formData.expected_pax} onChange={e => setFormData({...formData, expected_pax: e.target.value})} disabled={isViewOnly} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>GIÁ BÁN GỢI Ý / PAX</label>
                                <input type="text" style={drawerInputStyle} value={formattedPrice} onChange={handlePriceChange} disabled={isViewOnly} placeholder="Nhập giá bán..." />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>NGÀY ĐI (DỰ KIẾN)</label>
                                <input type="date" style={drawerInputStyle} value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} disabled={isViewOnly} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>NGÀY VỀ (DỰ KIẾN)</label>
                                <input type="date" style={drawerInputStyle} value={formData.return_date} onChange={e => setFormData({...formData, return_date: e.target.value})} disabled={isViewOnly} />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block' }}>DOANH THU ĐỀ XUẤT (VNĐ)</label>
                                <input type="text" style={{ ...drawerInputStyle, color: '#16a34a', fontWeight: 'bold' }} value={formattedRevenue} onChange={handleRevenueChange} disabled={isViewOnly} placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ background: 'white', padding: '1.25rem 2.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexShrink: 0 }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>HỦY</button>
                    {!isViewOnly && (
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 2rem', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
                            <Save size={18} /> LƯU DỰ ÁN
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
