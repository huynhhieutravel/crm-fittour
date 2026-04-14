import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ViewDeparturePage = ({ departureId, handleOpenCustomer, guides, handleEditDeparture }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [linkedBookings, setLinkedBookings] = useState([]);
  const [fullDeparture, setFullDeparture] = useState(null);
  
  // Costing stats for Financial Box
  const [costingStats, setCostingStats] = useState(null);

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('info');
  
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [editReminderTitle, setEditReminderTitle] = useState('');
  const [editReminderDate, setEditReminderDate] = useState('');

  useEffect(() => {
    if (!departureId) return;
    
    const token = localStorage.getItem('token');
    
    // Fetch bookings
    setLoadingBookings(true);
    axios.get(`/api/departures/${departureId}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setLinkedBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingBookings(false));

    // Fetch departure
    setLoading(true);
    axios.get(`/api/departures/${departureId}`, {
       headers: { Authorization: `Bearer ${token}` }
    }).then(res => setFullDeparture(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch Costings for Financial Dashboard
    axios.get(`/api/costings/${departureId}`, {
       headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCostingStats(res.data))
      .catch(err => console.error(err));

    // Fetch reminders
    setLoadingReminders(true);
    fetchReminders(departureId, token);
  }, [departureId]);

  const fetchReminders = (id, token) => {
    axios.get(`/api/reminders/departure/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setReminders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingReminders(false));
  };

  const handleUpdateNote = async (bookingId, newNote) => {
      const token = localStorage.getItem('token');
      const originalBookings = [...linkedBookings];
      setLinkedBookings(linkedBookings.map(bk => bk.id === bookingId ? { ...bk, notes: newNote } : bk));
      try {
         await axios.put(`/api/bookings/${bookingId}`, { notes: newNote }, {
             headers: { Authorization: `Bearer ${token}` }
         });
      } catch (err) {
         console.error('Failed to update booking note:', err);
         setLinkedBookings(originalBookings);
         alert('Ghi chú lưu thất bại, vui lòng làm lại.');
      }
  };

  const handleToggleReminder = async (id, currentStatus) => {
    if (currentStatus === 'COMPLETED') return; // For now only allow marking as done
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reminders/${id}/done`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders(departureId, token);
    } catch (err) {
      alert('Không thể cập nhật trạng thái nhắc nhở.');
    }
  };

  const handleAddCustomReminder = async () => {
    if (!newReminderTitle || !newReminderDate) return alert('Vui lòng nhập Tên và Hạn chót!');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post('/api/reminders/custom', {
        tour_departure_id: departureId,
        custom_title: newReminderTitle,
        due_date: newReminderDate,
        assigned_to: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddReminder(false);
      setNewReminderTitle('');
      setNewReminderDate('');
      fetchReminders(departureId, token);
    } catch (err) {
      alert('Tạo nhắc nhở thất bại.');
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhắc nhở này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders(departureId, token);
    } catch (err) {
      alert('Xóa nhắc nhở thất bại');
    }
  };

  const handleStartEditReminder = (r, label) => {
    setEditingReminderId(r.id);
    setEditReminderTitle(label);
    setEditReminderDate(r.due_date ? new Date(r.due_date).toLocaleDateString('en-CA') : '');
  };

  const handleSaveEditReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reminders/${id}`, { custom_title: editReminderTitle, due_date: editReminderDate }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingReminderId(null);
      fetchReminders(departureId, token);
    } catch (err) {
      alert('Sửa thất bại.');
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Đang tải thông tin chi tiết Lịch khởi hành...</div>;
  }

  if (!fullDeparture) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>Không tìm thấy dữ liệu Lịch khởi hành.</div>;
  }

  const currentDep = fullDeparture;
  const guideName = guides?.find(g => g.id === currentDep.guide_id)?.name || "Chưa có HDV";
  const nameDisplay = currentDep.name || currentDep.template_name || currentDep.tour_name || 'Khuyết tên Tour';

  const formatStatus = (st) => {
    switch(st) {
       case 'Mở bán': return { label: '🟢 Mở bán', color: '#16a34a' };
       case 'Chắc chắn đi': return { label: '🔵 Chắc chắn đi', color: '#2563eb' };
       case 'Đã đầy': return { label: '🟠 Đã đầy', color: '#ea580c' };
       case 'Hoàn thành': return { label: '✅ Hoàn thành', color: '#475569' };
       case 'Huỷ': return { label: '🔴 Huỷ', color: '#dc2626' };
       default: return { label: st || '🟢 Mở bán', color: '#16a34a' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/departures')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            background: 'transparent', border: 'none', 
            color: '#3b82f6', fontWeight: 600, fontSize: '0.95rem',
            cursor: 'pointer', padding: '0'
          }}
        >
          <ChevronLeft size={20} /> Quay lại danh sách Lịch khởi hành
        </button>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
             onClick={() => navigate('/costings', { state: { autoOpenDepId: currentDep.id } })}
             style={{ 
               display: 'flex', alignItems: 'center', gap: '6px', 
               background: '#10b981', border: 'none', borderRadius: '6px',
               color: '#fff', fontWeight: 600, fontSize: '0.85rem',
               cursor: 'pointer', padding: '6px 12px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
             }}
             onMouseEnter={e => e.currentTarget.style.background = '#059669'}
             onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
             💰 Bảng Dự Toán - P&L
          </button>
          
          {handleEditDeparture && (
            <button 
              onClick={() => handleEditDeparture(currentDep)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                color: '#334155', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', padding: '6px 12px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
            >
              <Edit2 size={16} /> Chỉnh sửa thông tin
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.025em' }}>👁️ XEM CHI TIẾT LỊCH KHỞI HÀNH</h2>
            <div style={{ color: '#2563eb', fontSize: '1.1rem', fontWeight: 700 }}>
              {nameDisplay} 
              <span style={{ color: '#64748b', fontWeight: 600, marginLeft: '8px' }}>{currentDep.code ? `(${currentDep.code})` : ''}</span>
            </div>
          </div>
        </div>

        {/* --- TABS NAVIGATION (TOP LEVEL) --- */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
          <div 
            onClick={() => setActiveSubTab('info')}
            style={{ paddingBottom: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', color: activeSubTab === 'info' ? '#3b82f6' : '#64748b', borderBottom: activeSubTab === 'info' ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all 0.2s' }}
          >
            Thông Tin Chi Tiết
          </div>
          <div 
            onClick={() => setActiveSubTab('reminders')}
            style={{ paddingBottom: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', color: activeSubTab === 'reminders' ? '#3b82f6' : '#64748b', borderBottom: activeSubTab === 'reminders' ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Tiến Độ Chăm Sóc Khách
            {reminders.filter(r => r.status === 'PENDING').length > 0 && (
              <span style={{ fontSize: '0.75rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{reminders.filter(r => r.status === 'PENDING').length}</span>
            )}
          </div>
        </div>

        {/* --- TAB CONTENT: INFO & BOOKINGS --- */}
        {activeSubTab === 'info' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', background: '#f8fafc', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>NGÀY KHỞI HÀNH</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {currentDep.start_date ? new Date(currentDep.start_date || currentDep.tour_start_date).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
            {currentDep.end_date && (
              <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
                Đến: {new Date(currentDep.end_date).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>TỔNG THU & SỐ KHÁCH (PAX)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  <span style={{ color: '#3b82f6' }}>{currentDep.sold_pax || 0}</span> 
                  <span style={{ color: '#cbd5e1', margin: '0 6px' }}>/</span> 
                  <span style={{ color: '#64748b' }}>{currentDep.max_participants || '?'}</span> <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>Pax</span>
                </span>
                {costingStats && (
                  <span style={{ color: '#10b981', fontSize: '1.1rem' }}>
                    {costingStats.total_revenue.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>
            </div>
            
            {costingStats ? (
               <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                 <div>
                   <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Dự toán LPL (Lãi/Lỗ):</div>
                   <div style={{ fontWeight: 700, color: (costingStats.total_revenue - costingStats.total_estimated_cost) >= 0 ? '#10b981' : '#ef4444' }}>
                     {((costingStats.total_revenue - costingStats.total_estimated_cost) >= 0 ? '+' : '')}{(costingStats.total_revenue - costingStats.total_estimated_cost).toLocaleString('vi-VN')} đ
                   </div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Hòa vốn (Pax):</div>
                   <div style={{ fontWeight: 700, color: '#f59e0b' }}>
                     {currentDep.break_even_pax || '?'}
                   </div>
                 </div>
               </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                 Hòa vốn: {currentDep.break_even_pax || '?'} Pax
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>TRẠNG THÁI (STATUS)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: formatStatus(currentDep.status).color, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formatStatus(currentDep.status).label}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>GHI CHÚ / NOTES LỊCH KHỞI HÀNH</div>
            <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 500, fontStyle: currentDep.notes ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {currentDep.notes || 'Không có ghi chú nào cho Lịch khởi hành này.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>HƯỚNG DẪN VIÊN</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', background: '#e2e8f0', display: 'inline-block', padding: '6px 14px', borderRadius: '20px' }}>
              {guideName}
            </div>
          </div>
        </div>
        
        {/* Display Price Rules if available */}
        {currentDep.price_rules && currentDep.price_rules.length > 0 && (
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ flex: 1, background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🎫 BẢNG GIÁ VÉ</h4>
              {currentDep.price_rules.map((pr, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{pr.name}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>{new Intl.NumberFormat('vi-VN').format(pr.price)} <u>đ</u></span>
                </div>
              ))}
            </div>
            {(currentDep.additional_services && currentDep.additional_services.length > 0) ? (
              <div style={{ flex: 1, background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>➕ PHỤ THU & DỊCH VỤ</h4>
                {currentDep.additional_services.map((srv, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{srv.name}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>{new Intl.NumberFormat('vi-VN').format(srv.price)} <u>đ</u></span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>DANH SÁCH KHÁCH ĐÃ ĐẶT CHỖ</h3>
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loadingBookings ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>Đang tải danh sách...</div>
          ) : linkedBookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>Chưa có khách hàng/booking nào cho tuyến này.</div>
          ) : (
            <table className="data-table" style={{ margin: 0, fontSize: '0.95rem', tableLayout: 'fixed' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '14px 16px', width: '22%', color: '#475569', fontWeight: 700 }}>MÃ BOOKING / ĐẠI DIỆN</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '10%', color: '#475569', fontWeight: 700 }}>SỐ PAX</th>
                  <th style={{ padding: '14px 16px', width: '53%', color: '#475569', fontWeight: 700 }}>GHI CHÚ / YÊU CẦU ĐẶC BIỆT (TỰ ĐỘNG LƯU)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', width: '15%', color: '#475569', fontWeight: 700 }}>THANH TOÁN</th>
                </tr>
              </thead>
              <tbody>
                {linkedBookings.map(bk => (
                  <tr key={bk.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}>{bk.booking_code}</div>
                      <div 
                        style={{ fontWeight: 700, color: '#10b981', cursor: 'pointer', textDecoration: 'underline', marginBottom: '2px' }}
                        onClick={() => handleOpenCustomer && handleOpenCustomer(bk.customer_id)}
                      >
                        {bk.customer_name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>{bk.customer_phone}</div>
                      {(bk.customer_segment || bk.past_trip_count > 0) && (
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: (bk.customer_segment || '').toLowerCase().includes('vip') ? '#fef08a' : '#f1f5f9', 
                          color: (bk.customer_segment || '').toLowerCase().includes('vip') ? '#854d0e' : '#475569', 
                          padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 
                        }}>
                          {bk.customer_segment && bk.customer_segment !== 'Tất cả' ? bk.customer_segment : 'Khách'}
                          {bk.past_trip_count > 0 && <span style={{opacity: 0.8}}>• Đi {bk.past_trip_count} lần</span>}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                      <span style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px' }}>{bk.pax_count}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                       <textarea 
                          placeholder="Ghi chú chỗ ngồi, ăn mặc, hỗ trợ riêng biệt..." 
                          defaultValue={bk.notes || ''}
                          onBlur={e => {
                             if(e.target.value !== bk.notes) {
                               handleUpdateNote(bk.id, e.target.value);
                             }
                          }}
                          style={{ 
                             width: '100%', 
                             minHeight: '70px', 
                             maxHeight: '140px', 
                             resize: 'vertical',
                             padding: '10px 12px', 
                             borderRadius: '8px', 
                             border: '1px solid #cbd5e1', 
                             fontSize: '0.9rem',
                             fontFamily: 'inherit',
                             background: '#fafafa',
                             outline: 'none',
                             transition: 'border-color 0.2s'
                          }} 
                          onFocus={e => e.target.style.borderColor = '#3b82f6'}
                       />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800,
                        background: bk.payment_status === 'paid' ? '#dcfce7' : '#fef9c3',
                        color: bk.payment_status === 'paid' ? '#166534' : '#854d0e',
                        display: 'inline-block'
                      }}>
                        {bk.payment_status === 'paid' ? 'Đã Thanh Toán' : 'Chưa thu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        </>
        )}
        
        {/* --- TAB CONTENT: REMINDERS --- */}
        {activeSubTab === 'reminders' && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 BẢNG CÔNG VIỆC CHĂM SÓC KHÁCH
              <span style={{ fontSize: '0.85rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px' }}>
                Hoàn tất: {reminders.filter(r => r.status === 'COMPLETED').length}/{reminders.length || 0}
              </span>
            </h3>
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loadingReminders ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>Đang tải danh sách công việc...</div>
            ) : reminders.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>Chưa có nhiệm vụ/nhắc nhở nào. Sẽ được hệ thống tự động sinh ra vào ban đêm.</div>
            ) : (
              reminders.map(r => {
                const getLabel = (r) => {
                  if (r.custom_title) return r.custom_title;
                  switch(r.type) {
                    case 'PREPARE_DOCS': return 'Nhắc chuẩn bị giấy tờ/Visa';
                    case 'ITINERARY': return 'Gửi Lịch trình chi tiết';
                    case 'FEEDBACK': return 'Hỏi thăm / Xin Feedback';
                    case 'REBOOK': return 'Gợi ý Tour tương tự / Upsell';
                    default: return r.type;
                  }
                };

                const label = getLabel(r);

                if (editingReminderId === r.id) {
                   return (
                     <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #3b82f6', background: '#f8fafc' }}>
                       <input type="text" value={editReminderTitle} onChange={e => setEditReminderTitle(e.target.value)} style={{ flex: 2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Tên nhắc nhở..." />
                       <input type="date" value={editReminderDate} onChange={e => setEditReminderDate(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                       <button onClick={() => handleSaveEditReminder(r.id)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Lưu</button>
                       <button onClick={() => setEditingReminderId(null)} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                     </div>
                   );
                }

                return (
                  <div key={r.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '12px 16px', borderRadius: '8px', 
                    background: r.status === 'COMPLETED' ? '#f8fafc' : '#ffffff',
                    border: '1px solid', borderColor: r.status === 'COMPLETED' ? '#f1f5f9' : '#e2e8f0',
                    transition: 'all 0.2s',
                    opacity: r.status === 'CANCELLED' ? 0.5 : 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div 
                        onClick={() => handleToggleReminder(r.id, r.status)}
                        style={{ 
                          width: '22px', height: '22px', borderRadius: '6px', cursor: r.status === 'PENDING' ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid', borderColor: r.status === 'COMPLETED' ? '#10b981' : '#cbd5e1',
                          background: r.status === 'COMPLETED' ? '#10b981' : 'transparent',
                          color: 'white'
                        }}
                      >
                        {r.status === 'COMPLETED' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: r.status === 'COMPLETED' ? '#94a3b8' : '#334155', textDecoration: r.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                          {label}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                          <span>Hạn chót: <span style={{ color: (r.status === 'PENDING' && new Date(r.due_date) < new Date(new Date().setHours(0,0,0,0))) ? '#ef4444' : 'inherit' }}>{new Date(r.due_date).toLocaleDateString('vi-VN')}</span></span>
                          <span>•</span>
                          <span>Phụ trách: {r.staff_name || 'Hệ thống/Chưa gán'}</span>
                          {r.status === 'CANCELLED' && <span style={{ color: '#ef4444' }}>(Đã hủy)</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {r.status === 'PENDING' && (
                        <button 
                           onClick={() => handleStartEditReminder(r, label)}
                           style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}
                        >Sửa</button>
                      )}
                      {r.type.startsWith('CUSTOM_') && (
                        <button 
                           onClick={() => handleDeleteReminder(r.id)}
                           style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '6px 12px' }}
                        >Xóa</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* INLINE ADD REMINDER ROW */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderTop: '1px dashed #e2e8f0', marginTop: '8px', paddingTop: '16px' }}>
               <input 
                 type="text" 
                 value={newReminderTitle} 
                 onChange={e => setNewReminderTitle(e.target.value)} 
                 placeholder="Thêm nhiệm vụ mới (VD: Gọi điện khách hỏi Visa...)" 
                 style={{ flex: 2, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} 
               />
               <input 
                 type="date" 
                 value={newReminderDate} 
                 onChange={e => setNewReminderDate(e.target.value)} 
                 style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} 
               />
               <button 
                 onClick={handleAddCustomReminder} 
                 style={{ padding: '10px 20px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
               >
                 + Thêm
               </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ViewDeparturePage;
