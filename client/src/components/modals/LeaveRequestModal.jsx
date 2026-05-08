import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, XCircle, User, Phone, MessageCircle, Users, Send, Calculator } from 'lucide-react';
import Swal from 'sweetalert2';
import Select, { components } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function LeaveRequestModal({ currentUser, users = [], editData, onClose, onSuccess }) {
  const [form, setForm] = useState({
    target_user_id: currentUser?.id || '',
    leave_type: 'annual',
    leave_dates: [], // { date: string, duration: number, session: string }
    total_days: 0,
    reason: '',
    contact_phone: currentUser?.phone || '',
    handover_user_id: '',
    handover_note: '',
    approved_by: ''
  });

  useEffect(() => {
    if (editData) {
      const formattedDates = (editData.dates || []).map(d => {
          const dateObj = new Date(d.date);
          const y = dateObj.getFullYear();
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const d_val = String(dateObj.getDate()).padStart(2, '0');
          return {
              date: `${y}-${m}-${d_val}`,
              duration: d.session === 'full' ? 1 : 0.5,
              session: d.session
          };
      });

      setForm({
        target_user_id: editData.user_id || currentUser?.id,
        leave_type: editData.leave_type || 'annual',
        leave_dates: formattedDates,
        total_days: editData.total_days || 0,
        reason: editData.reason || '',
        contact_phone: editData.contact_phone || '',
        handover_user_id: editData.handover_user_id || '',
        handover_note: editData.handover_note || '',
        approved_by: editData.approved_by || ''
      });
    }
  }, [editData, currentUser]);

  const [leaveBalance, setLeaveBalance] = useState(null);
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
    if (form.leave_dates) {
        const totalUnits = form.leave_dates.reduce((sum, d) => {
            if (d.session === 'full') return sum + 2;
            return sum + 1; // morning or afternoon
        }, 0);
        setForm(prev => ({ ...prev, total_days: totalUnits / 2 }));
    }
  }, [form.leave_dates]);

  const handleToggleDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d_val = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d_val}`;

      if (date.getDay() === 0 || date.getDay() === 6) {
          Swal.fire('Cảnh báo', 'Vui lòng không chọn ngày Thứ 7 hoặc Chủ Nhật', 'warning');
          return;
      }

      const currentDates = form.leave_dates || [];
      const existingIdx = currentDates.findIndex(item => item.date === dateStr);
      
      if (existingIdx >= 0) {
          // Bỏ chọn nếu đã có
          const newDates = [...currentDates];
          newDates.splice(existingIdx, 1);
          setForm({ ...form, leave_dates: newDates });
      } else {
          // Thêm mới
          const newDates = [...currentDates, { date: dateStr, duration: 1, session: 'full' }].sort((a,b) => a.date.localeCompare(b.date));
          setForm({ ...form, leave_dates: newDates });
      }
  };

  const handleUpdateSession = (dateStr, sessionVal) => {
      let duration = 1;
      if (sessionVal === 'morning' || sessionVal === 'afternoon') duration = 0.5;
      
      const newDates = form.leave_dates.map(item => {
          if (item.date === dateStr) {
              return { ...item, session: sessionVal, duration: duration };
          }
          return item;
      });
      setForm({ ...form, leave_dates: newDates });
  };

  const handleRemoveDate = (dateToRemove) => {
      setForm({ ...form, leave_dates: (form.leave_dates || []).filter(item => item.date !== dateToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.total_days <= 0) {
        Swal.fire('Lỗi', 'Tổng số ngày nghỉ phải lớn hơn 0', 'error');
        return;
    }
    setSaving(true);
    try {
       const token = localStorage.getItem('token');
       if (editData) {
           await axios.put(`/api/leaves/${editData.id}`, form, {
               headers: { Authorization: `Bearer ${token}` }
           });
       } else {
           await axios.post('/api/leaves', form, {
               headers: { Authorization: `Bearer ${token}` }
           });
       }
       Swal.fire({
           toast: true, position: 'top-end', icon: 'success',
           title: editData ? 'Đã cập nhật đơn xin nghỉ' : 'Đã gửi đơn xin nghỉ phép', showConfirmButton: false, timer: 3000
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
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#0f172a' }}>{editData ? 'Sửa Đơn Xin Nghỉ Phép' : 'Tạo Đơn Xin Nghỉ Phép'}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Vui lòng điền đầy đủ thông tin để {editData ? 'cập nhật' : 'gửi'} đơn xin nghỉ phép.</p>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                        <label style={inputStyles.label}>Chọn ngày nghỉ <span style={{color: '#ef4444'}}>*</span></label>
                        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                            <style>{`
                                .custom-datepicker .react-datepicker__day--selected {
                                    background-color: #3b82f6 !important;
                                    color: white !important;
                                    border-radius: 50%;
                                }
                                .custom-datepicker .react-datepicker__day:hover {
                                    border-radius: 50%;
                                }
                                .custom-datepicker .react-datepicker {
                                    border: none;
                                    font-family: inherit;
                                }
                                .custom-datepicker .react-datepicker__header {
                                    background: white;
                                    border-bottom: none;
                                }
                            `}</style>
                            <DatePicker
                                inline
                                wrapperClassName="custom-datepicker"
                                onChange={handleToggleDate}
                                dayClassName={(date) => {
                                    const y = date.getFullYear();
                                    const m = String(date.getMonth() + 1).padStart(2, '0');
                                    const d_val = String(date.getDate()).padStart(2, '0');
                                    const dateStr = `${y}-${m}-${d_val}`;
                                    
                                    if (form.leave_dates?.find(item => item.date === dateStr)) {
                                        return "react-datepicker__day--selected";
                                    }
                                    return null;
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                            Bấm vào ngày để <b>chọn</b> hoặc <b>bỏ chọn</b>. Hệ thống tự khóa T7, CN.
                        </div>
                        {leaveBalance && (
                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                <strong style={{ color: '#059669', fontSize: '12px', background: '#d1fae5', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>
                                    Phép dư: {leaveBalance.available} ngày
                                </strong>
                            </div>
                        )}
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
                    </div>
                </div>

                {form.leave_dates && form.leave_dates.length > 0 && (
                    <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Các ngày đã chọn ({form.leave_dates.length}):</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {form.leave_dates.map(item => {
                                const [y, m, d_val] = item.date.split('-');
                                const d = new Date(y, m - 1, d_val);
                                const dayStr = d.toLocaleDateString('vi-VN');
                                const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
                                return (
                                    <div key={item.date} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: '#1e293b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#3b82f6', fontWeight: 'bold', minWidth: '30px' }}>{dayOfWeek}</span>
                                            <span>{dayStr}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <select 
                                                value={item.session} 
                                                onChange={(e) => handleUpdateSession(item.date, e.target.value)}
                                                style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            >
                                                <option value="full">Cả ngày (1.0)</option>
                                                <option value="morning">Buổi sáng (0.5)</option>
                                                <option value="afternoon">Buổi chiều (0.5)</option>
                                            </select>
                                            <button type="button" onClick={() => handleRemoveDate(item.date)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

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
