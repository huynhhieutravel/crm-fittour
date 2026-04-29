import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Phone, X, Building } from 'lucide-react';
import SearchableSelect from './common/SearchableSelect';

const formatDateLocal = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const GroupLeaderCalendarView = ({ users = [], leaders = [], companies = [], onLeaderClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({ group_leader_id: '', company_id: '', title: '', event_type: 'CALL', event_date: '', description: '' });

  useEffect(() => {
    fetchEvents();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const res = await axios.get('/api/group-leaders/events/all', {
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

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const days = [];
  const actualOffset = firstDay;
  for (let i = 0; i < actualOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleUpdateStatus = async (eventId, newStatus) => {
    try {
      await axios.put(`/api/group-leaders/events/${eventId}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEvents();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const [formError, setFormError] = useState('');

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEvent.title || !newEvent.event_date || (!newEvent.group_leader_id && !newEvent.company_id)) {
      setFormError('Vui lòng điền đủ Tiêu đề, Ngày hẹn và chọn Doanh nghiệp hoặc Trưởng Đoàn!');
      return;
    }
    try {
      if (editingEventId) {
        await axios.put(`/api/group-leaders/events/${editingEventId}`, newEvent, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/group-leaders/events', newEvent, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setShowEventModal(false);
      setNewEvent({ group_leader_id: '', company_id: '', title: '', event_type: 'CALL', event_date: '', description: '' });
      setEditingEventId(null);
      fetchEvents();
    } catch (err) {
      setFormError('Lỗi từ Server: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteEvent = async () => {
    if (!await swalConfirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return;
    try {
      await axios.delete(`/api/group-leaders/events/${editingEventId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setShowEventModal(false);
      setEditingEventId(null);
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
    const leader = leaders.find(l => l.id === ev.group_leader_id);
    
    let bgColor = '#eff6ff';
    let color = '#3b82f6';
    let borderColor = '#bfdbfe';
    let icon = null;
    
    if (isBirthday) {
      bgColor = '#fef3c7';
      color = '#92400e';
      borderColor = '#fcd34d';
      icon = '🎂';
    } else if (ev.event_type === 'FOUNDING') {
      bgColor = '#ede9fe';
      color = '#5b21b6';
      borderColor = '#c4b5fd';
      icon = '🏢';
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

    let companyBadge = null;
    if (ev.company_name) {
      companyBadge = <span style={{fontSize:'0.6rem', marginLeft:'4px', padding: '0px 4px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', border: `1px solid ${borderColor}`, color: color}} title={ev.company_name}>🏢 {ev.company_name}</span>;
    } else if (leader && leader.company_name) {
      companyBadge = <span style={{fontSize:'0.6rem', marginLeft:'4px', padding: '0px 4px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', border: '1px solid #d97706', color: '#d97706'}} title={leader.company_name}>🏢</span>;
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
          if (ev.id) {
            setNewEvent({
              group_leader_id: ev.group_leader_id || '',
              company_id: ev.company_id || '',
              title: ev.title || '',
              event_type: ev.event_type || 'CALL',
              event_date: ev.event_date ? formatDateLocal(ev.event_date) : '',
              description: ev.description || '',
              isAutoEvent: false
            });
            setEditingEventId(ev.id);
            setFormError('');
            setShowEventModal(true);
          } else if (ev.event_type === 'BIRTHDAY' || ev.event_type === 'FOUNDING') {
            setNewEvent({
              group_leader_id: ev.group_leader_id || '',
              company_id: ev.company_id || '',
              title: ev.title || '',
              event_type: ev.event_type,
              event_date: ev.event_date ? formatDateLocal(ev.event_date) : '',
              description: ev.event_type === 'FOUNDING' ? `Kỷ niệm thành lập ${ev.company_name}` : `Sinh nhật ${ev.name}`,
              isAutoEvent: true
            });
            setEditingEventId('auto');
            setFormError('');
            setShowEventModal(true);
          }
        }}
        title={`${ev.title}\n${ev.description || ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ marginRight: '2px' }}>{icon}</span>}
          <span style={{overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{ev.title.replace(/Sinh nh[ậa]t/ig, 'SN')}</span>
        </div>
        {companyBadge}
        {leader && (
          <div style={{ fontSize: '0.6rem', color, opacity: 0.9, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px', marginTop: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={8} /> {leader.phone || 'N/A'}</span>
            <span>{leader.total_projects || 0} dự án</span>
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
          <CalendarIcon size={20} color="#d97706" />
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
          <button className="btn-pro-save" style={{ padding: '6px 16px', marginLeft: '12px', background: '#d97706' }} onClick={() => {
            setEditingEventId(null);
            setNewEvent({ group_leader_id: '', company_id: '', title: '', event_type: 'CALL', event_date: '', description: '' });
            setFormError('');
            setShowEventModal(true);
          }}>
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
            <div key={day} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
              {day}
            </div>
          ))}
          
          {/* Days */}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: '120px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }} />;
            }
            
            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = new Date().toDateString() === cellDate.toDateString();
            
            const dayEvents = events.filter(e => {
              const hasLeader = !!e.group_leader_id && leaders.findIndex(l => l.id === e.group_leader_id) !== -1;
              const hasCompany = !!e.company_id && companies.findIndex(c => c.id === e.company_id) !== -1;
              if (e.event_type !== 'FOUNDING' && !hasLeader && !hasCompany) return false;
              const eDate = new Date(e.event_date);
              return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
            });

            return (
              <div key={`day-${day}`} style={{ 
                minHeight: '120px', 
                borderRight: '1px solid #e2e8f0', 
                borderBottom: '1px solid #e2e8f0',
                padding: '8px',
                backgroundColor: isToday ? '#fef3c7' : '#fff'
              }}>
                <div style={{ 
                  fontWeight: isToday ? 'bold' : 'normal', 
                  color: isToday ? '#d97706' : '#64748b',
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
                    backgroundColor: isToday ? '#d97706' : 'transparent',
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

      {showEventModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={24} color="#d97706" /> {newEvent.isAutoEvent ? 'CHI TIẾT SỰ KIỆN TỰ ĐỘNG' : (editingEventId ? 'CẬP NHẬT LỊCH CHĂM SÓC' : 'THÊM LỊCH CHĂM SÓC B2B')}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ marginBottom: 0 }}>CHỌN DOANH NGHIỆP</label>
                  {newEvent.company_id && (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowEventModal(false);
                        window.dispatchEvent(new CustomEvent('switchAndOpenCompany', { detail: newEvent.company_id }));
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Xem Doanh nghiệp ↗
                    </button>
                  )}
                </div>
                <SearchableSelect 
                  options={companies.map(c => ({ id: c.id, name: c.name }))}
                  value={newEvent.company_id}
                  onChange={(val) => setNewEvent({...newEvent, company_id: val, group_leader_id: ''})}
                  placeholder="-- Chọn doanh nghiệp B2B (nếu có) --"
                  disabled={newEvent.isAutoEvent}
                />
              </div>

              <div className="modal-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ marginBottom: 0 }}>CHỌN TRƯỞNG ĐOÀN ĐẠI DIỆN</label>
                  {newEvent.group_leader_id && (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowEventModal(false);
                        if (onLeaderClick) onLeaderClick(newEvent.group_leader_id);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Xem Hồ sơ ↗
                    </button>
                  )}
                </div>
                <SearchableSelect 
                  options={leaders
                    .filter(l => !newEvent.company_id || l.company_id === newEvent.company_id)
                    .map(l => ({ id: l.id, name: `${l.name} - ${l.phone || 'Chưa có SĐT'}` }))}
                  value={newEvent.group_leader_id}
                  onChange={(val) => {
                    const l = leaders.find(ld => ld.id === val);
                    setNewEvent({...newEvent, group_leader_id: val, company_id: l?.company_id || newEvent.company_id});
                  }}
                  placeholder="-- Chọn trưởng đoàn (nếu có) --"
                  disabled={newEvent.isAutoEvent}
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
                <input className="modal-input" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Vd: Gọi follow-up hợp đồng mới" disabled={newEvent.isAutoEvent} />
              </div>

              <div className="modal-form-group">
                <label>GHI CHÚ CHI TIẾT</label>
                <textarea className="modal-textarea" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Nội dung cần trao đổi..." rows={3} disabled={newEvent.isAutoEvent} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                {!newEvent.isAutoEvent && (
                  <button type="button" className="btn-pro-save" style={{ flex: 2, background: '#d97706' }} onClick={handleCreateOrUpdateEvent}>
                    {editingEventId && editingEventId !== 'auto' ? 'LƯU THAY ĐỔI' : 'LƯU LỊCH HẸN'}
                  </button>
                )}
                {!newEvent.isAutoEvent && editingEventId && editingEventId !== 'auto' && (
                  <button type="button" className="btn-pro-cancel" style={{ border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 600, flex: 1 }} onClick={handleDeleteEvent}>
                    XÓA
                  </button>
                )}
                <button type="button" className="btn-pro-cancel" style={{ width: 'auto', flex: newEvent.isAutoEvent ? 1 : 'unset' }} onClick={() => setShowEventModal(false)}>ĐÓNG</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default GroupLeaderCalendarView;
