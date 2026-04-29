import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, XCircle, User, Phone, MessageCircle, Users, Send, Calculator } from 'lucide-react';
import Swal from 'sweetalert2';
import Select, { components } from 'react-select';

export default function LeaveRequestModal({ currentUser, users = [], onClose, onSuccess }) {
  const [form, setForm] = useState({
    target_user_id: currentUser?.id || '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    total_days: 0,
    reason: '',
    contact_phone: currentUser?.phone || '',
    handover_user_id: '',
    handover_note: '',
    approved_by: ''
  });

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!form.target_user_id) return;
      try {
        const res = await axios.get(`/api/leaves/balance/${form.target_user_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLeaveBalance(res.data);
      } catch (err) {
        console.error('Failed to fetch leave balance', err);
      }
    };
    fetchBalance();
  }, [form.target_user_id]);

  useEffect(() => {
    // Auto calculate days when dates change
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (isHalfDay) {
            diffDays -= 0.5;
        }
        setForm(prev => ({ ...prev, total_days: diffDays > 0 ? diffDays : 0 }));
      } else {
        setForm(prev => ({ ...prev, total_days: 0 }));
      }
    }
  }, [form.start_date, form.end_date, isHalfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.total_days <= 0) {
        Swal.fire('Lỗi', 'Tổng số ngày nghỉ phải lớn hơn 0', 'error');
        return;
    }
    setSaving(true);
    try {
       const token = localStorage.getItem('token');
       await axios.post('/api/leaves', form, {
           headers: { Authorization: `Bearer ${token}` }
       });
       Swal.fire({
           toast: true, position: 'top-end', icon: 'success',
           title: 'Đã gửi đơn xin nghỉ phép', showConfirmButton: false, timer: 3000
       });
       if (onSuccess) onSuccess();
       onClose();
    } catch (err) {
       Swal.fire('Lỗi', err.response?.data?.error || err.message, 'error');
    } finally {
       setSaving(false);
    }
  };

  const inputStyles = {
    container: { position: 'relative', width: '100%' },
    icon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
    input: { width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' },
    label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px', color: '#1e293b' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' },
    textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical' }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                    <Calendar size={28} />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' }}>Tạo Đơn Xin Nghỉ Phép</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Vui lòng điền đầy đủ thông tin để gửi đơn xin nghỉ phép.</p>
                </div>
            </div>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* THÔNG TIN NHÂN VIÊN */}
            <div>
                <div style={inputStyles.sectionTitle}><User size={18} /> Thông tin nhân viên</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={inputStyles.label}>Nhân viên xin phép <span style={{color: '#ef4444'}}>*</span></label>
                            <Select
                                isSearchable
                                options={users.map(u => {
                                    return { value: u.id, label: `${u.full_name || u.username}` };
                                })}
                                value={form.target_user_id ? {
                                    value: form.target_user_id,
                                    label: (() => {
                                        const matchedUser = users.find(u => u.id === form.target_user_id);
                                        if (!matchedUser) return currentUser?.full_name || currentUser?.username || 'Bản thân';
                                        return `${matchedUser.full_name || matchedUser.username}`;
                                    })()
                                } : null}
                                onChange={(selected) => {
                                    const newUserId = selected ? selected.value : currentUser?.id;
                                    const selectedUser = users.find(u => u.id === newUserId) || currentUser;
                                    setForm({...form, target_user_id: newUserId, contact_phone: selectedUser?.phone || ''});
                                }}
                                styles={{
                                    control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '40px', paddingLeft: '32px', fontSize: '13px' }),
                                    valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
                                    menu: (base) => ({ ...base, fontSize: '13px' })
                                }}
                                components={{
                                    Control: ({ children, ...props }) => (
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 1 }} />
                                            <components.Control {...props}>{children}</components.Control>
                                        </div>
                                    )
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Mặc định là tài khoản của bạn. Có thể chọn người khác nếu xin phép dùm.</span>
                            </div>
                        </div>

                        <div>
                            <label style={inputStyles.label}>Người duyệt (Leader, Giám đốc, PGĐ)</label>
                            <Select
                                isClearable
                                isSearchable
                                options={[
                                    { value: '', label: 'Khác* (Hoặc tự túc)' },
                                    ...users.filter(u => {
                                        if (u.id === form.target_user_id) return false;
                                        
                                        const role = (u.role_name || u.role || '').toLowerCase();
                                        const pos = (u.position || '').toLowerCase();
                                        
                                        const isManagerRole = ['admin', 'manager', 'group_manager', 'operations_lead'].includes(role) || 
                                                              role.includes('manager') || 
                                                              role.includes('lead');
                                                              
                                        const isManagerPos = pos.includes('giám đốc') || 
                                                             pos.includes('trưởng phòng') || 
                                                             pos.includes('leader') ||
                                                             pos.includes('quản lý') ||
                                                             pos.includes('pgđ');
                                                             
                                        return isManagerRole || isManagerPos;
                                    }).map(u => {
                                        const pos = u.position || u.role_name || '';
                                        return { value: u.id, label: `${u.full_name || u.username} ${pos ? `(${pos})` : ''}` };
                                    })
                                ]}
                                value={form.approved_by ? {
                                    value: form.approved_by,
                                    label: (() => {
                                        const matched = users.find(u => u.id === form.approved_by);
                                        if (!matched) return 'Khác* (Hoặc tự túc)';
                                        const pos = matched.position || matched.role_name || '';
                                        return `${matched.full_name || matched.username} ${pos ? `(${pos})` : ''}`;
                                    })()
                                } : null}
                                onChange={(selected) => setForm({...form, approved_by: selected ? selected.value : ''})}
                                styles={{ 
                                    control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '40px', fontSize: '13px' }),
                                    menu: (base) => ({ ...base, fontSize: '13px' })
                                }}
                                placeholder="Không bắt buộc chọn..."
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={inputStyles.label}>Loại nghỉ phép <span style={{color: '#ef4444'}}>*</span></label>
                            <div style={inputStyles.container}>
                                <Calendar size={16} style={inputStyles.icon} />
                                <select required value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})} style={inputStyles.input}>
                                    <option value="annual">Nghỉ phép năm (trừ vào quĩ phép)</option>
                                    <option value="sick">Nghỉ ốm</option>
                                    <option value="personal">Việc cá nhân</option>
                                    <option value="maternity">Nghỉ thai sản</option>
                                    <option value="other">Loại khác</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={inputStyles.label}>Số điện thoại liên hệ</label>
                            <div style={inputStyles.container}>
                                <Phone size={16} style={inputStyles.icon} />
                                <input type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} style={inputStyles.input} placeholder="+84..."/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* THỜI GIAN NGHỈ */}
            <div>
                <div style={inputStyles.sectionTitle}><Calendar size={18} /> Thời gian nghỉ</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                        <label style={inputStyles.label}>Từ ngày <span style={{color: '#ef4444'}}>*</span></label>
                        <div style={inputStyles.container}>
                            <Calendar size={16} style={inputStyles.icon} />
                            <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={inputStyles.input} />
                        </div>
                        {leaveBalance && (
                            <div style={{ marginTop: '8px' }}>
                                <strong style={{ color: '#059669', fontSize: '11px', background: '#d1fae5', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                    Phép dư: {leaveBalance.available} ngày
                                </strong>
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={inputStyles.label}>Đến ngày <span style={{color: '#ef4444'}}>*</span></label>
                        <div style={inputStyles.container}>
                            <Calendar size={16} style={inputStyles.icon} />
                            <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={inputStyles.input} />
                        </div>
                    </div>
                    <div>
                        <label style={inputStyles.label}>Tổng số ngày <span style={{color: '#ef4444'}}>*</span></label>
                        <div style={inputStyles.container}>
                            <Calculator size={16} style={inputStyles.icon} />
                            <input 
                                required 
                                type="number" 
                                readOnly 
                                value={form.total_days} 
                                style={{ ...inputStyles.input, background: '#f8fafc', color: '#334155', cursor: 'not-allowed', fontWeight: 'bold' }} 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setIsHalfDay(!isHalfDay)}
                            style={{ 
                                marginTop: '8px', fontSize: '11px', background: isHalfDay ? '#fee2e2' : '#f1f5f9', border: `1px solid ${isHalfDay ? '#ef4444' : '#cbd5e1'}`, 
                                color: isHalfDay ? '#ef4444' : '#475569', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                                display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: isHalfDay ? 'bold' : 'normal', transition: 'all 0.2s'
                            }}
                        >
                            {isHalfDay ? "✓ Đã trừ 0.5 ngày" : "+ Trừ 0.5 ngày (Nửa buổi)"}
                        </button>
                    </div>
                </div>

                <div>
                    <label style={inputStyles.sectionTitle}><MessageCircle size={18} /> Lý do nghỉ <span style={{color: '#ef4444'}}>*</span></label>
                    <div style={{ position: 'relative' }}>
                        <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} style={inputStyles.textarea} placeholder="Trình bày lý do xin nghỉ..." maxLength={500} />
                        <span style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '12px', color: '#94a3b8' }}>{form.reason.length}/500</span>
                    </div>
                </div>
            </div>

            {/* BÀN GIAO CÔNG VIỆC */}
            <div>
                <div style={inputStyles.sectionTitle}><Users size={18} /> Bàn giao công việc</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                        <label style={inputStyles.label}>Người nhận bàn giao</label>
                        <Select
                            isClearable
                            isSearchable
                            placeholder="Chọn người nhận bàn giao (tìm kiếm)..."
                            options={users.filter(u => u.id !== currentUser?.id).map(u => {
                                const tName = u.teams && u.teams.length > 0 ? u.teams[0].name : '';
                                return { value: u.id, label: `${u.full_name || u.username} ${tName ? `(${tName})` : ''}` };
                            })}
                            value={form.handover_user_id ? {
                                value: form.handover_user_id,
                                label: users.find(u => u.id === form.handover_user_id)?.full_name || ''
                            } : null}
                            onChange={(selected) => setForm({...form, handover_user_id: selected ? selected.value : ''})}
                            styles={{
                                control: (base) => ({ ...base, borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '40px', paddingLeft: '32px', fontSize: '13px' }),
                                menu: (base) => ({ ...base, fontSize: '13px' })
                            }}
                            components={{
                                Control: ({ children, ...props }) => (
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', zIndex: 1 }} />
                                        <components.Control {...props}>{children}</components.Control>
                                    </div>
                                )
                            }}
                        />
                    </div>
                    <div>
                        <label style={inputStyles.label}>Ghi chú bàn giao</label>
                        <div style={{ position: 'relative' }}>
                            <textarea value={form.handover_note} onChange={e => setForm({...form, handover_note: e.target.value})} style={inputStyles.textarea} placeholder="Đã bàn giao các task..." maxLength={500}/>
                            <span style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '12px', color: '#94a3b8' }}>{form.handover_note.length}/500</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" onClick={onClose} disabled={saving} style={{ padding: '12px 24px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}>
                    Hủy
                </button>
                <button type="submit" disabled={saving} style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}>
                    <Send size={16} /> {saving ? 'Đang gửi...' : 'Gửi Đơn'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
