import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, MapPin, Search, X } from 'lucide-react';
import SearchableSelect from './common/SearchableSelect';

const formatDateLocal = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CustomerCalendarView = ({ users = [], customers = [], onCustomerClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ customer_id: '', title: '', event_type: 'CALL', event_date: '', description: '' });
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Get first and last day of month
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const res = await axios.get('/api/customers/events/all', {
        params: {
          start_date: formatDateLocal(start),
          end_date: formatDateLocal(end)
        },
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  // Format days array with padding for grid
  const days = [];
  // For Sunday start
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // 0 is Sunday, we want Monday to be 0
  const actualOffset = firstDay; // If starting Sunday
  
  for (let i = 0; i < actualOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleUpdateStatus = async (eventId, newStatus) => {
    try {
      await axios.put(`/api/customers/events/${eventId}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const [formError, setFormError] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEvent.customer_id || !newEvent.title || !newEvent.event_date) {
      setFormError('Vui lòng điền đủ thông tin bắt buộc (Khách hàng, Tiêu đề, Ngày)!');
      return;
    }
    try {
      await axios.post('/api/customers/events', newEvent, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setShowEventModal(false);
      setNewEvent({ customer_id: '', title: '', event_type: 'CALL', event_date: '', description: '' });
      setCustomerSearch('');
      fetchEvents();
    } catch (err) {
      setFormError('Lỗi từ Server: ' + (err.response?.data?.message || err.message));
    }
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const renderEventChip = (ev, index) => {
    const isBirthday = ev.event_type === 'BIRTHDAY';
    const isPending = ev.status === 'pending';
    const cust = customers.find(c => c.id === ev.customer_id);
    
    let bgColor = '#eff6ff';
    let color = '#3b82f6';
    let borderColor = '#bfdbfe';
    let icon = null;
    
    if (isBirthday) {
      bgColor = '#fef08a';
      color = '#854d0e';
      borderColor = '#fde047';
      icon = '🎂';
      
      // Override colors based on VIP segment if it's a birthday
      if (cust && cust.customer_segment) {
        if (cust.customer_segment === 'VIP 1') {
          bgColor = '#fee2e2'; color = '#991b1b'; borderColor = '#fca5a5';
        } else if (cust.customer_segment === 'VIP 2') {
          bgColor = '#ffedd5'; color = '#9a3412'; borderColor = '#fdba74';
        } else if (cust.customer_segment === 'VIP 3') {
          bgColor = '#f3e8ff'; color = '#6b21a8'; borderColor = '#d8b4fe';
        } else if (cust.customer_segment === 'Repeat Customer') {
          bgColor = '#e0f2fe'; color = '#075985'; borderColor = '#bae6fd';
        }
      }
    } else if (ev.status === 'completed') {
      bgColor = '#dcfce7'; color = '#166534'; borderColor = '#bbf7d0';
    } else if (ev.event_type === 'MEETING') {
      bgColor = '#fce7f3'; color = '#be185d'; borderColor = '#fbcfe8'; icon = '🤝';
    } else if (ev.event_type === 'CALL') {
      bgColor = '#e0f2fe'; color = '#0369a1'; borderColor = '#bae6fd'; icon = '📞';
    } else if (ev.event_type === 'PAYMENT') {
      bgColor = '#fef2f2'; color = '#b91c1c'; borderColor = '#fecaca'; icon = '💰';
    } else if (ev.event_type === 'EMAIL') {
      bgColor = '#dcfce7'; color = '#15803d'; borderColor = '#bbf7d0'; icon = '✉️';
    } else {
      bgColor = '#f3f4f6'; color = '#4b5563'; borderColor = '#e5e7eb'; icon = '🤔';
    }

    let vipBadge = null;
    if (cust && cust.customer_segment) {
      const seg = cust.customer_segment;
      let sColor = '#64748b';
      let sText = seg;
      if (seg === 'VIP 1') { sColor = '#dc2626'; sText = '⭐⭐⭐'; }
      else if (seg === 'VIP 2') { sColor = '#d97706'; sText = '⭐⭐'; }
      else if (seg === 'VIP 3') { sColor = '#7c3aed'; sText = '⭐'; }
      else if (seg === 'Repeat Customer') { sColor = '#2563eb'; sText = '🏅'; }
      if (sText !== seg) {
        vipBadge = <span style={{fontSize:'0.6rem', marginLeft:'4px', padding: '0px 4px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', border: `1px solid ${sColor}`, color: sColor}} title={seg}>{sText}</span>;
      }
    }

    return (
      <div 
        key={index}
        className="calendar-event-chip"
        style={{
          backgroundColor: bgColor,
          color: color,
          border: `1px solid ${borderColor}`,
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 600,
          marginBottom: '2px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onCustomerClick(ev.customer_id);
        }}
        title={`${ev.title}\n${ev.description || ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ marginRight: '2px' }}>{icon}</span>}
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{ev.title.replace(/Sinh nh[ậa]t/ig, 'SN')}</span>
          {vipBadge}
        </div>
        {cust && (
          <div style={{ fontSize: '0.6rem', color, opacity: 0.9, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={8} /> {cust.phone || 'N/A'}</span>
            <span>{cust.total_trip_count || 0} chuyến</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Calendar Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={20} className="text-secondary" />
          <span className="notranslate" translate="no">{`${monthNames[currentDate.getMonth()]} năm ${currentDate.getFullYear()}`}</span>
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={prevMonth} style={{ padding: '6px 10px' }}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-outline" onClick={() => setCurrentDate(new Date())} style={{ padding: '6px 12px' }}>
            Hôm nay
          </button>
          <button className="btn btn-outline" onClick={nextMonth} style={{ padding: '6px 10px' }}>
            <ChevronRight size={16} />
          </button>
          <button className="btn-pro-save" style={{ padding: '6px 16px', marginLeft: '12px' }} onClick={() => setShowEventModal(true)}>
            + LÊN LỊCH NHẮC NHỞ
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>...Đang tải lịch...</div>}

      {/* Calendar Grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
          {/* Weekdays */}
          {['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map(day => (
            <div key={day} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              {day}
            </div>
          ))}
          
          {/* Days */}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: '120px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} />;
            }
            
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = new Date().toDateString() === cellDate.toDateString();
            
            // Filter events for this day
            const dayEvents = events.filter(e => {
              if (customers.findIndex(c => c.id === e.customer_id) === -1) return false;
              const eDate = new Date(e.event_date);
              return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
            });

            return (
              <div key={`day-${day}`} style={{ 
                minHeight: '120px', 
                borderRight: '1px solid #e2e8f0', 
                borderBottom: '1px solid #e2e8f0',
                padding: '8px',
                backgroundColor: isToday ? '#eff6ff' : '#fff'
              }}>
                <div style={{ 
                  fontWeight: isToday ? 'bold' : 'normal', 
                  color: isToday ? '#3b82f6' : '#64748b',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isToday ? '#3b82f6' : 'transparent',
                    color: isToday ? '#fff' : 'inherit'
                  }}>
                    {day}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayEvents.map((ev, evIdx) => renderEventChip(ev, evIdx))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEventModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={24} color="#3b82f6" /> THÊM LỊCH CHĂM SÓC
              </h2>
              <button className="icon-btn" onClick={() => setShowEventModal(false)}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem' }}>
                  {formError}
                </div>
              )}
              <div className="modal-form-group">
                <label>CHỌN KHÁCH HÀNG *</label>
                <SearchableSelect 
                  options={customers.map(c => ({ id: c.id, name: `${c.name} - ${c.phone || 'Chưa có SĐT'}` }))}
                  value={newEvent.customer_id}
                  onChange={(val) => setNewEvent({...newEvent, customer_id: val})}
                  placeholder="-- Nhấp để chọn hoặc tìm kiếm khách hàng --"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>LOẠI SỰ KIỆN *</label>
                  <select className="modal-select" required value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}>
                    <option value="CALL">📞 Gọi điện chăm sóc</option>
                    <option value="MEETING">🤝 Hẹn gặp mặt</option>
                    <option value="PAYMENT">💰 Nhắc thanh toán</option>
                    <option value="EMAIL">✉️ Gửi Email/Tài liệu</option>
                    <option value="OTHER">🤔 Khác</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>NGÀY HẸN *</label>
                  <input className="modal-input" type="date" required value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} />
                </div>
              </div>

              <div className="modal-form-group">
                <label>TIÊU ĐỀ NGẮN GỌN (Hiện trên lịch) *</label>
                <input className="modal-input" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Vd: Gọi hỏi thăm sức khỏe sau tour" />
              </div>

              <div className="modal-form-group">
                <label>GHI CHÚ CHI TIẾT</label>
                <textarea className="modal-textarea" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Nội dung cần trao đổi với khách..." rows={3} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-pro-save" style={{ flex: 1 }} onClick={handleCreateEvent}>LƯU LỊCH HẸN</button>
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowEventModal(false)}>HỦY</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCalendarView;
