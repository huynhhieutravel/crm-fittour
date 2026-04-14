import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, Send, Clock, CreditCard, Tag, CalendarPlus } from 'lucide-react';
import axios from 'axios';

const CustomerProfileSlider = ({ customer, onClose, onAddNote, users = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', event_type: 'CALL', event_date: '' });
  const [editingEventId, setEditingEventId] = useState(null);
  const [localEvents, setLocalEvents] = React.useState(customer?.events || []);
  
  React.useEffect(() => {
    setLocalEvents(customer?.events || []);
  }, [customer]);

  const handleAddEventSubmit = async () => {
    if (!newEvent.title || !newEvent.event_date) return alert('Vui lòng nhập đủ thông tin');
    try {
      if (editingEventId) {
        const res = await axios.put(`/api/customers/events/${editingEventId}`, newEvent, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Cập nhật sự kiện thành công!');
        setLocalEvents(localEvents.map(ev => ev.id === editingEventId ? { ...ev, ...res.data } : ev));
        setEditingEventId(null);
      } else {
        const res = await axios.post('/api/customers/events', {
          customer_id: customer.id,
          ...newEvent
        }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        alert('Tạo lịch hẹn thành công!');
        setLocalEvents([res.data, ...localEvents]);
      }
      setNewEvent({ title: '', event_type: 'CALL', event_date: '' });
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu sự kiện');
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await axios.put(`/api/customers/events/${eventId}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setLocalEvents(localEvents.map(ev => ev.id === eventId ? { ...ev, status: newStatus } : ev));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!customer) return null;

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(customer.id, newNote);
      setNewNote('');
    }
  };

  const getArrayValue = (field) => {
      if (Array.isArray(customer[field])) return customer[field];
      if (typeof customer[field] === 'string') {
          try { return JSON.parse(customer[field] || '[]'); } catch(e) { return []; }
      }
      return [];
  };

  const renderTags = (tags, style) => {
      if (!tags || tags.length === 0) return <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Không có thông tin</span>;
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map(t => (
                  <span key={t} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, ...style }}>
                      {t}
                  </span>
              ))}
          </div>
      );
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10002 }}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', 
          width: '100%',
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                {customer.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{customer.name}</h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  ...(customer.customer_segment === 'VIP 1' ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } :
                      customer.customer_segment === 'VIP 2' ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } :
                      customer.customer_segment === 'VIP 3' ? { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' } :
                      customer.customer_segment === 'Repeat Customer' ? { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' } :
                      { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' })
                }}>
                  {customer.customer_segment === 'VIP 1' ? '⭐⭐⭐ VIP 1' :
                   customer.customer_segment === 'VIP 2' ? '⭐⭐ VIP 2' :
                   customer.customer_segment === 'VIP 3' ? '⭐ VIP 3' :
                   customer.customer_segment || 'New Customer'}
                </span>
                {customer.is_birthday_this_week && (
                  <span className="badge" style={{ backgroundColor: '#fef08a', color: '#854d0e', marginLeft: '8px' }}>
                    🎂 Sinh nhật tuần này
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '0 1.5rem' }}>
          {['overview', 'bookings', 'events', 'interactions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                fontWeight: 600,
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? 'Tổng quan' : tab === 'bookings' ? 'Mua hàng' : tab === 'events' ? 'Sự kiện' : 'Tương tác'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} /> Thông tin liên hệ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Phone size={12} style={{marginRight:'4px'}}/> Số điện thoại</div>
                    <div style={{ fontWeight: 500 }}>{customer.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Mail size={12} style={{marginRight:'4px'}}/> Email</div>
                    <div style={{ fontWeight: 500 }}>{customer.email || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><MapPin size={12} style={{marginRight:'4px'}}/> Địa chỉ</div>
                    <div style={{ fontWeight: 500 }}>{customer.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} /> Thông tin cá nhân & Giấy tờ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Ngày sinh</div>
                    <div style={{ fontWeight: 500 }}>{customer.birth_date ? new Date(customer.birth_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Giới tính</div>
                    <div style={{ fontWeight: 500 }}>{customer.gender || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>CCCD/Passport</div>
                    <div style={{ fontWeight: 500 }}>{customer.id_card || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Quốc tịch</div>
                    <div style={{ fontWeight: 500 }}>{customer.nationality || 'Việt Nam'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Ảnh Giấy Tờ</div>
                    <div style={{ fontWeight: 500 }}>
                       {customer.passport_url ? (
                           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                             <a href={customer.passport_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #bae6fd' }}>
                                <FileText size={14} /> Đi tới trang Ảnh/File
                             </a>
                             <img src={customer.passport_url} alt="Hộ chiếu / CCCD" style={{ height: '40px', width: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
                           </div>
                       ) : 'Chưa có ảnh'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} /> Thông tin Sale & Quản lý
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Vai trò đại diện</div>
                    <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{customer.role || 'Booker'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Ngày chốt đơn đầu tiên</div>
                    <div style={{ fontWeight: 500 }}>{customer.first_deal_date ? new Date(customer.first_deal_date).toLocaleDateString('vi-VN') : 'Chưa có'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Nhân viên chăm sóc</div>
                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                      {customer.assigned_to 
                        ? (users.find(u => u.id === customer.assigned_to)?.username || 'Đã nghỉ việc / Ẩn (') + customer.assigned_to + ')'
                        : '--- Chưa gán ---'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} /> Insight & Sở thích nâng cao
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Điểm đến yêu thích</div>
                    {renderTags(getArrayValue('destinations'), { border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8' })}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Trải nghiệm đề cao</div>
                    {renderTags(getArrayValue('experiences'), { border: '1px solid #10b981', background: '#ecfdf5', color: '#047857' })}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Kiểu đi / Nhóm khách</div>
                    {renderTags(getArrayValue('travel_styles'), { border: '1px solid #f59e0b', background: '#fffbeb', color: '#b45309' })}
                  </div>
                  
                  {customer.internal_notes && (
                    <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                       <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Ghi chú Sale (Insight mật)</div>
                       <div style={{ color: '#7f1d1d', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{customer.internal_notes}</div>
                    </div>
                  )}
                  
                  {customer.special_requests && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Yêu cầu đặc biệt khác</div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{customer.special_requests}</div>
                    </div>
                  )}

                  {(customer.tour_interests || customer.travel_season) && (
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Dữ liệu lưu trữ cũ (Cấu trúc cũ)</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {customer.tour_interests && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Điểm đến/Tour tự nhập:</div>
                            <div style={{ fontSize: '0.85rem' }}>{customer.tour_interests}</div>
                          </div>
                        )}
                        {customer.travel_season && (
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mùa hay đi tự nhập:</div>
                            <div style={{ fontSize: '0.85rem' }}>{customer.travel_season}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b' }}>Tổng chi tiêu:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent || 0)}
                  </span>
                </div>
              </div>
              
              {!customer.booking_history || customer.booking_history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có lịch sử mua hàng.</div>
              ) : (
                customer.booking_history.map(b => (
                  <div key={b.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{b.tour_name || 'Tour Custom'}</span>
                      <span className="badge badge-priority-medium">{b.booking_status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                      <Calendar size={12} style={{marginRight:'4px', display:'inline'}} /> Khởi hành: {b.departure_date ? new Date(b.departure_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.85rem' }}>{b.passengers_count} khách</span>
                      <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.total_price || 0)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarPlus size={16} /> {editingEventId ? 'Chỉnh sửa lịch hẹn' : 'Lên lịch nhắc nhở / Hẹn khách'}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="modal-input" placeholder="Tên sự kiện..." style={{ flex: 2 }} value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                  <select className="modal-input" style={{ flex: 1 }} value={newEvent.event_type} onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}>
                    <option value="CALL">Gọi điện</option>
                    <option value="MEETING">Hẹn gặp</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  <input type="date" className="modal-input" style={{ flex: 1 }} value={newEvent.event_date ? new Date(newEvent.event_date).toLocaleDateString('en-CA') : ''} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} />
                  <button className="btn-pro-save" onClick={handleAddEventSubmit}>{editingEventId ? 'Lưu' : 'Tạo'}</button>
                  {editingEventId && (
                    <button className="btn-ghost" style={{ padding: '0 12px' }} onClick={() => { setEditingEventId(null); setNewEvent({ title: '', event_type: 'CALL', event_date: '' }); }}>Hủy</button>
                  )}
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b' }}>Lịch sử sự kiện / Nhắc nhở</h3>
                {!localEvents || localEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có sự kiện nào.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {localEvents.map(event => (
                      <div key={event.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {event.event_type === 'BIRTHDAY' ? '🎂 ' : event.event_type === 'CALL' ? '📞 ' : event.event_type === 'MEETING' ? '☕ ' : '📌 '}
                              {event.title}
                            </span>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: event.status === 'completed' ? '#dcfce7' : '#fef3c7', color: event.status === 'completed' ? '#166534' : '#92400e' }}>
                              {event.status === 'completed' ? 'Hoàn thành' : 'Đang hẹn'}
                            </span>
                          </div>
                          {event.description && <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748b' }}>{event.description}</p>}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '16px' }}>
                            <span>📅 {new Date(event.event_date).toLocaleDateString('vi-VN')}</span>
                            {event.creator_name && <span>👤 Tạo bởi: {event.creator_name}</span>}
                          </div>
                        </div>
                        {event.event_type !== 'BIRTHDAY' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              style={{ padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={() => {
                                setEditingEventId(event.id);
                                setNewEvent({
                                  title: event.title,
                                  event_type: event.event_type,
                                  event_date: event.event_date
                                });
                              }}
                            >
                              Sửa
                            </button>
                            {event.status !== 'completed' && (
                              <button 
                                style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                onClick={() => handleUpdateEventStatus(event.id, 'completed')}
                              >
                                Xác nhận Xong
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="modal-input" 
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  placeholder="Thêm log / ghi chú mới..." 
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddNote()}
                />
                <button className="btn-pro-save" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Send size={16} /> Lưu
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {!customer.interaction_history || customer.interaction_history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có ghi chú tương tác nào.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {customer.interaction_history.map(note => (
                      <div key={note.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ fontWeight: 600, color: '#3b82f6' }}>{note.creator_name || 'Hệ thống'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {new Date(note.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CustomerProfileSlider;
