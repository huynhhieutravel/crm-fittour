import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  CheckCircle,
  PhoneCall,
  CalendarCheck,
  Zap,
  Clock,
  ArrowRight,
  Target,
  Plane,
  CreditCard,
  Cake,
  AlertCircle,
  LayoutDashboard,
  ShoppingCart,
  CalendarHeart,
  Plus,
  MessageSquare,
  MessageCircle,
  X,
  UserCheck,
  Menu
} from 'lucide-react';
import LeaveRequestsTab from '../LeaveRequestsTab';

const renderNoteWithTime = (rawNote) => {
  const timeRegex = /\[(\d{2}:\d{2} \d{2}\/\d{2}\/\d{4})\]/g;
  let text = rawNote;
  let timeStrings = [];
  let match;
  while ((match = timeRegex.exec(rawNote)) !== null) {
    timeStrings.push(match[1]);
  }
  
  if (timeStrings.length > 0) {
    const lastTime = timeStrings[timeStrings.length - 1];
    text = text.replace(timeRegex, '').trim();
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', fontStyle: 'italic', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
          {lastTime}
        </div>
      </div>
    );
  }
  return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
};

const SalesDashboard = ({ 
  leads = [], 
  setEditingLead,
  setShowAddLeadModal,
  reminders = [],
  markReminderDone,
  getReminderLabel,
  currentUser,
  bookings = [],
  customers = [],
  departures = [],
  tourTemplates = [],
  users = [],
  checkPerm,
  setShowLeaveModal,
  fetchLeads,
  navigateToInbox,
  openZaloDrawer,
  handleConvertLead
}) => {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (['bookings', 'myleads', 'leaves', 'reminders'].includes(hash)) {
      return hash;
    }
    return 'bookings';
  };
  const [activeInternalTab, setActiveInternalTab] = useState(getInitialTab());

  useEffect(() => {
    window.location.hash = activeInternalTab;
  }, [activeInternalTab]);
  const [bookingFilterTab, setBookingFilterTab] = useState('ALL');
  const [leadReminders, setLeadReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [reminderFilter, setReminderFilter] = useState('PENDING');

  useEffect(() => {
    if (activeInternalTab === 'reminders') {
      setLoadingReminders(true);
      axios.get('/api/reminders/leads/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
      .then(res => setLeadReminders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingReminders(false));
    }
  }, [activeInternalTab]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [workspaceBookings, setWorkspaceBookings] = useState([]);
  const [inlineNotes, setInlineNotes] = useState({});
  const [activeNoteEdit, setActiveNoteEdit] = useState(null);
  const [inlineReminderDate, setInlineReminderDate] = useState('');
  const [inlineReminderAssignedTo, setInlineReminderAssignedTo] = useState('');
  const [viewingFullNote, setViewingFullNote] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PROCESSING');
  const [timeFilter, setTimeFilter] = useState('all');

  const filterByTime = (lead, timeRange) => {
    if (timeRange === 'all') return true;
    const leadDate = new Date(lead.created_at);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (timeRange === 'today') {
      return leadDate >= startOfToday;
    }
    if (timeRange === 'yesterday') {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      return leadDate >= startOfYesterday && leadDate < startOfToday;
    }
    if (timeRange === 'week') {
      const startOfWeek = new Date(startOfToday);
      const day = startOfWeek.getDay() || 7; 
      if (day !== 1) startOfWeek.setDate(startOfWeek.getDate() - (day - 1)); 
      return leadDate >= startOfWeek;
    }
    if (timeRange === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return leadDate >= startOfMonth;
    }
    if (timeRange === 'quarter') {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      return leadDate >= startOfQuarter;
    }
    return true;
  };

  const saveInlineNote = async (lead, newNote) => {
    try {
      await axios.put(`/api/leads/${lead.id}`, { consultation_note: newNote }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (inlineReminderDate) {
        const noteText = inlineNotes[lead.id] ? inlineNotes[lead.id].substring(0, 100) : 'Lịch hẹn (Không ghi chú)';
        const postData = {
          title: noteText,
          lead_id: lead.id,
          due_date: new Date(inlineReminderDate).toISOString(),
          assigned_to: inlineReminderAssignedTo || lead.assigned_to || null
        };
        await axios.post('/api/reminders/leads', postData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }

      if (typeof fetchLeads === 'function') fetchLeads();
      setInlineNotes(prev => {
        const next = {...prev};
        delete next[lead.id];
        return next;
      });
      setActiveNoteEdit(null);
      setInlineReminderDate('');
      setInlineReminderAssignedTo('');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Lỗi khi lưu ghi chú');
    }
  };

  const updateLeadStatus = async (lead, newStatus) => {
    try {
      await axios.put(`/api/leads/${lead.id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (typeof fetchLeads === 'function') fetchLeads();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Lỗi cập nhật trạng thái');
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      axios.get(`/api/bookings?sale_id=${currentUser.id}&limit=500`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        .then(res => {
          setWorkspaceBookings(Array.isArray(res.data) ? res.data : res.data.data || []);
        })
        .catch(err => console.error('Error fetching workspace bookings:', err));
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    fetchAlerts();
    return () => clearInterval(timer);
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get('/api/system-alerts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSystemAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const resolveAlert = async (id) => {
    try {
      await axios.put(`/api/system-alerts/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSystemAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // --- LEADS ---
  const myLeads = leads.filter(l => l.assigned_to === currentUser?.id);
  const myNewLeads = myLeads.filter(l => l.status === 'Mới');
  const myCallingLeads = myLeads.filter(l => ['Đang liên hệ', 'Liên hệ lần 2'].includes(l.status));
  const myWonLeads = myLeads.filter(l => l.status === 'Chốt đơn');

  const finalMyLeads = myLeads.filter(l => {
    if (statusFilter === 'PROCESSING') {
      if (l.status === 'Fail' || l.won_at) return false;
    } else if (statusFilter !== 'ALL') {
      if (l.status !== statusFilter) return false;
    }
    return filterByTime(l, timeFilter);
  });

  // --- BOOKINGS (Pending Deposits / Debts) ---
  const myBookings = workspaceBookings.length > 0 ? workspaceBookings : bookings.filter(b => b.assigned_to === currentUser?.id || b.created_by === currentUser?.id || b.sale_id === currentUser?.id);
  const pendingBookings = myBookings.filter(b => b.booking_status !== 'Huỷ' && b.payment_status === 'Chưa thanh toán');
  const partialBookings = myBookings.filter(b => b.booking_status !== 'Huỷ' && b.payment_status === 'Thanh toán 1 phần');
  const totalDebtBookings = pendingBookings.length + partialBookings.length;

  // --- DEPARTURES (Hot Inventory) ---
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingDepartures = departures
    .filter(d => d.start_date >= todayStr && d.status !== 'Huỷ')
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5); 

  // --- CUSTOMERS (Birthdays) ---
  const myCustomers = customers; // TEMPORARY BYPASS
  
  const upcomingBirthdays = myCustomers.filter(c => {
    if (!c.birth_date) return false;
    const bDate = new Date(c.birth_date);
    const today = new Date();
    const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
    
    if (bThisYear < new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)) {
        bThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = bThisYear - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).sort((a,b) => {
    const dA = new Date(a.birth_date); const dB = new Date(b.birth_date);
    return dA.getMonth() - dB.getMonth() || dA.getDate() - dB.getDate();
  });


  return (
    <>
      <div className="animate-fade-in workspace-container" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: '#64748b' }}>Hôm nay bạn có {myNewLeads.length} Lead mới và {totalDebtBookings} Booking đang chờ thu tiền.</p>
        </div>
      </div>

      {/* --- RED ALERT ZONE (V4) --- */}
      {systemAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FFEBEB 0%, #FFD6D6 100%)',
          border: '1px solid #FF4D4F',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#CF1322', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <span style={{ animation: 'blink 1s infinite' }}>🚨</span> CẢNH BÁO TỪ HỆ THỐNG
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {systemAlerts.map(alert => (
              <div key={alert.id} style={{
                background: '#FFF',
                borderLeft: '4px solid #FF4D4F',
                padding: '10px 15px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ display: 'block', color: '#A8071A', marginBottom: '4px' }}>{alert.title}</strong>
                  <span style={{ fontSize: '13px', color: '#595959' }}>{alert.message}</span>
                </div>
                <button 
                  onClick={() => resolveAlert(alert.id)}
                  className="btn btn-sm"
                  style={{
                    background: '#FF4D4F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '6px 14px'
                  }}
                >
                  Xác nhận Khớp lệnh
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="workspace-tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveInternalTab('bookings')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'bookings' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'bookings' ? '#059669' : 'transparent' }}
        >
          <ShoppingCart size={18} /> Đơn Của Tôi ({myBookings.length})
        </button>
        <button 
          onClick={() => setActiveInternalTab('myleads')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'myleads' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'myleads' ? '#3b82f6' : 'transparent' }}
        >
          <UserPlus size={18} /> Lead Đang Quản Lý
        </button>

        <button 
          onClick={() => setActiveInternalTab('reminders')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'reminders' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'reminders' ? '#eab308' : 'transparent' }}
        >
          <Clock size={18} /> Lịch Hẹn & C.Việc
        </button>
      </div>

      {/* NỘI DUNG TABS */}
      {activeInternalTab === 'myleads' && (
        <div className="analytics-card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Danh Sách Lead Đang Quản Lý</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng: {finalMyLeads.length} Lead</span>
          </div>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginRight: '4px', textTransform: 'uppercase' }}>Thời gian:</span>
              {[
                { id: 'today', label: 'Hôm nay' },
                { id: 'yesterday', label: 'Hôm qua' },
                { id: 'week', label: 'Tuần này' },
                { id: 'month', label: 'Tháng này' },
                { id: 'quarter', label: 'Quý này' },
                { id: 'all', label: 'Tất cả' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setTimeFilter(p.id)}
                  style={{
                    padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s',
                    background: timeFilter === p.id ? '#3b82f6' : '#fff', color: timeFilter === p.id ? '#fff' : '#475569', boxShadow: timeFilter === p.id ? '0 2px 4px rgba(59,130,246,0.3)' : 'none'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginRight: '4px', textTransform: 'uppercase' }}>Trạng thái:</span>
              {[
                { id: 'PROCESSING', label: 'Tất cả (Đang xử lý)' },
                { id: 'ALL', label: 'Tất cả' },
                { id: 'Mới', label: 'Mới' },
                { id: 'Đang liên hệ', label: 'Đang liên hệ' },
                { id: 'Liên hệ lần 2', label: 'Liên hệ lần 2' },
                { id: 'Chốt đơn', label: 'Chốt đơn' },
                { id: 'Thất bại', label: 'Thất bại' },
                { id: 'Không phản hồi', label: 'Không phản hồi' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  style={{
                    padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s',
                    background: statusFilter === status.id ? '#3b82f6' : '#fff', color: statusFilter === status.id ? '#fff' : '#475569', boxShadow: statusFilter === status.id ? '0 2px 4px rgba(59,130,246,0.3)' : 'none'
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>KHÁCH HÀNG</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ width: '40%' }}>GHI CHÚ / TƯ VẤN</th>
                  <th>CẬP NHẬT LẦN CUỐI</th>
                </tr>
              </thead>
              <tbody>
                {myLeads.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Giỏ Lead đang trống.</td>
                  </tr>
                ) : (
                  finalMyLeads.sort((a,b) => new Date(b.last_contacted_at || b.created_at) - new Date(a.last_contacted_at || a.created_at)).map(lead => (
                    <tr key={lead.id} style={{ transition: 'background 0.2s' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <div 
                            style={{ fontWeight: 700, color: '#2563eb', cursor: 'pointer' }} 
                            onClick={() => setEditingLead(lead)}
                          >
                            {lead.name}
                          </div>
                          {lead.source && (
                            <div style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#64748b', fontWeight: 600 }}>
                              {lead.source}
                            </div>
                          )}
                          {(lead.facebook_psid || lead.meta_lead_id || (lead.source && lead.source.toLowerCase().includes('messenger'))) && (
                            <button
                              style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (typeof navigateToInbox === 'function') navigateToInbox(lead.facebook_psid || lead.meta_lead_id || lead.phone); }}
                            >
                              <MessageSquare size={10} /> Chat
                            </button>
                          )}
                          {(lead.zalo_uid || (lead.source && lead.source.toLowerCase().includes('zalo'))) && (
                            <button
                              style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#0068ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (typeof openZaloDrawer === 'function') openZaloDrawer(lead.zalo_uid); }}
                            >
                              <MessageCircle size={10} /> Zalo
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>{lead.phone || 'Không SĐT'}</div>
                        {(!lead.is_locked && !lead.won_at) && (
                          <div style={{ marginTop: '8px' }}>
                            <button
                              style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#10b981', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(typeof handleConvertLead === 'function') handleConvertLead(lead.id); }}
                            >
                              <UserCheck size={12} /> Chuyển thành Khách Hàng
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ fontSize: '0.8rem', padding: '4px 8px', height: 'auto', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', outline: 'none' }}
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead, e.target.value)}
                        >
                          <option value="Mới">Mới</option>
                          <option value="Đang liên hệ">Đang liên hệ</option>
                          <option value="Liên hệ lần 2">Liên hệ lần 2</option>
                          <option value="Chốt đơn">Chốt đơn</option>
                          <option value="Thất bại">Thất bại</option>
                          <option value="Không phản hồi">Không phản hồi</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                          {(() => {
                            if (!lead.consultation_note) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có ghi chú</span>;
                            const notesList = lead.consultation_note.split(/\n\s*\n/).filter(n => n.trim());
                            if (notesList.length === 0) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có ghi chú</span>;
                            return (
                              <>
                                <div>{renderNoteWithTime(notesList[notesList.length - 1])}</div>
                                {notesList.length > 1 && (
                                  <button onClick={() => setViewingFullNote(lead)} style={{ background: 'none', border: 'none', padding: 0, color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '6px', fontWeight: 600 }}>
                                    Xem tất cả ({notesList.length} ghi chú)
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        {activeNoteEdit === lead.id ? (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                              <textarea
                                style={{ flex: 1, minHeight: '60px', padding: '8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                                placeholder="Nhập ghi chú mới để thêm vào..."
                                value={inlineNotes[lead.id] !== undefined ? inlineNotes[lead.id] : ''}
                                onChange={(e) => setInlineNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                  onClick={() => {
                                    const currentNote = inlineNotes[lead.id] || '';
                                    if (!currentNote.trim()) return;
                                    const now = new Date();
                                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                                    const noteWithTime = `${currentNote}\n[${timeStr}]`;
                                    saveInlineNote(lead, (lead.consultation_note ? lead.consultation_note + '\n\n' : '') + noteWithTime);
                                  }}
                                  style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => { setActiveNoteEdit(null); setInlineNotes(prev => ({...prev, [lead.id]: ''})); setInlineReminderDate(''); setInlineReminderAssignedTo(''); }}
                                  style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> KÈM LỊCH HẸN NHẮC NHỞ (Tùy chọn)
                                </div>
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                   <button type="button" onClick={() => {
                                      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9,0,0,0);
                                      setInlineReminderDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
                                   }} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' }}>Sáng mai (9h)</button>
                                   <button type="button" onClick={() => {
                                      const d = new Date(); d.setDate(d.getDate() + 3);
                                      setInlineReminderDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
                                   }} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' }}>Sau 3 ngày</button>
                                   <button type="button" onClick={() => {
                                      const d = new Date(); d.setDate(d.getDate() + 7);
                                      setInlineReminderDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16));
                                   }} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: '#334155' }}>Sau 7 ngày</button>
                                </div>
                                 <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                   <input type="datetime-local" value={inlineReminderDate} onChange={e => setInlineReminderDate(e.target.value)} className="modal-input" style={{ background: 'white', maxWidth: '160px', padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                   <select value={inlineReminderAssignedTo} onChange={e => setInlineReminderAssignedTo(e.target.value)} className="modal-select" style={{ background: 'white', maxWidth: '140px', padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                     <option value="">-- Nhắc bản thân --</option>
                                     {users && users
                                        .filter(u => u.is_active !== false)
                                        .sort((a, b) => {
                                            const aInBU = lead.bu_group && (a.bus || []).includes(lead.bu_group);
                                            const bInBU = lead.bu_group && (b.bus || []).includes(lead.bu_group);
                                            if (aInBU && !bInBU) return -1;
                                            if (!aInBU && bInBU) return 1;
                                            return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
                                        })
                                        .map(u => (
                                       <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} (${u.username})` : u.username}</option>
                                     ))}
                                   </select>
                                 </div>
                              </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveNoteEdit(lead.id); setInlineNotes(prev => ({...prev, [lead.id]: ''})); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '0', marginTop: '4px' }}
                          >
                            <Plus size={14} /> Thêm Ghi chú mới
                          </button>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(lead.last_contacted_at || lead.created_at).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeInternalTab === 'bookings' && (
        <div className="analytics-card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Đơn Giữ Chỗ Của Tôi</h3>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setBookingFilterTab('ALL')}
                  style={{ border: 'none', background: bookingFilterTab === 'ALL' ? '#fff' : 'transparent', color: bookingFilterTab === 'ALL' ? '#0f172a' : '#64748b', padding: '4px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: bookingFilterTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >Tất cả</button>
                <button 
                  onClick={() => setBookingFilterTab('PENDING')}
                  style={{ border: 'none', background: bookingFilterTab === 'PENDING' ? '#fff' : 'transparent', color: bookingFilterTab === 'PENDING' ? '#eab308' : '#64748b', padding: '4px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: bookingFilterTab === 'PENDING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >Chưa chốt</button>
                <button 
                  onClick={() => setBookingFilterTab('CLOSED')}
                  style={{ border: 'none', background: bookingFilterTab === 'CLOSED' ? '#fff' : 'transparent', color: bookingFilterTab === 'CLOSED' ? '#10b981' : '#64748b', padding: '4px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: bookingFilterTab === 'CLOSED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >Đã chốt</button>
                <button 
                  onClick={() => setBookingFilterTab('CANCELLED')}
                  style={{ border: 'none', background: bookingFilterTab === 'CANCELLED' ? '#fff' : 'transparent', color: bookingFilterTab === 'CANCELLED' ? '#ef4444' : '#64748b', padding: '4px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', boxShadow: bookingFilterTab === 'CANCELLED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >Đã huỷ</button>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng: {myBookings.filter(b => {
              const isClosed = ['Hoàn thành', 'Xác nhận', 'Đã đặt cọc', 'Đã thanh toán', 'Thành công'].includes(b.booking_status) || b.payment_status === 'paid' || b.payment_status === 'Thanh toán 1 phần' || b.payment_status === 'partial';
              if (bookingFilterTab === 'CLOSED') return isClosed && b.booking_status !== 'Huỷ';
              if (bookingFilterTab === 'PENDING') return !isClosed && b.booking_status !== 'Huỷ';
              if (bookingFilterTab === 'CANCELLED') return b.booking_status === 'Huỷ';
              return true;
            }).length} Đơn hàng</span>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>MÃ GIAO DỊCH</th>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>KHÁCH HÀNG</th>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>NGÀY KHÁCH BAY</th>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>TÀI CHÍNH</th>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>GIẤY TỜ</th>
                  <th style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const displayBookings = myBookings.filter(b => {
                    const isClosed = ['Hoàn thành', 'Xác nhận', 'Đã đặt cọc', 'Đã thanh toán', 'Thành công'].includes(b.booking_status) || b.payment_status === 'paid' || b.payment_status === 'Thanh toán 1 phần' || b.payment_status === 'partial';
                    if (bookingFilterTab === 'CLOSED') return isClosed && b.booking_status !== 'Huỷ';
                    if (bookingFilterTab === 'PENDING') return !isClosed && b.booking_status !== 'Huỷ';
                    if (bookingFilterTab === 'CANCELLED') return b.booking_status === 'Huỷ';
                    return true;
                  });

                  if (displayBookings.length === 0) {
                    return (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chưa có đơn hàng nào do bạn quản lý.</td>
                      </tr>
                    );
                  }

                  return displayBookings.map(b => {
                    const cust = customers.find(c => c.id === b.customer_id);
                    const dep = departures.find(d => d.id === b.tour_departure_id);
                    const tourTemplate = dep ? tourTemplates.find(t => t.id === dep.tour_template_id) : null;
                    const tourName = tourTemplate?.name || dep?.tour_name || dep?.name || '';
                    const isUrgent = b.payment_status === 'Chưa thanh toán' && b.booking_status !== 'Huỷ';
                    
                    const paidAmount = Number(b.paid) || Number(b.paid_amount) || 0;
                    const totalPrice = Number(b.total_price) || 0;
                    const debtAmount = totalPrice - paidAmount;
                    
                    let isInternational = false;
                    let missingPassportsCount = 0;
                    const bu = String(b.bu_group || '').replace(/\s+/g, '').toUpperCase();
                    if (['BU1', 'BU2', 'BU4'].includes(bu)) {
                        isInternational = true;
                        let collectedCount = 0;
                        try {
                            const pax = typeof b.pax_details === 'string' ? JSON.parse(b.pax_details) : (b.pax_details || {});
                            if (pax && pax.members && Array.isArray(pax.members)) {
                                pax.members.forEach(m => {
                                    if ((m.docId && String(m.docId).trim() !== '') || (m.passportUrl && String(m.passportUrl).trim() !== '')) {
                                        collectedCount++;
                                    }
                                });
                            }
                            
                            // Check raw_details for OpTours
                            const raw = typeof b.raw_details === 'string' ? JSON.parse(b.raw_details) : (b.raw_details || {});
                            if (raw && raw.members && Array.isArray(raw.members)) {
                                raw.members.forEach(m => {
                                    if ((m.docId && String(m.docId).trim() !== '') || (m.passportUrl && String(m.passportUrl).trim() !== '')) {
                                        collectedCount++;
                                    }
                                });
                            }
                        } catch(e) {}
                        missingPassportsCount = (b.pax_count || 1) - collectedCount;
                        if (missingPassportsCount < 0) missingPassportsCount = 0;
                    }

                    return (
                      <tr key={b.id} style={{ background: isUrgent ? '#fef2f2' : 'transparent' }}>
                        <td>
                          <div
                            style={b.raw_details ? { fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' } : { fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}
                            onClick={() => {
                               if (b.raw_details) {
                                  localStorage.setItem('open_op_tour_departure', b.tour_departure_id);
                                  window.open('/op-tours', '_blank');
                               }
                            }}
                          >
                            {b.booking_code}
                          </div>
                          {tourName && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', maxWidth: '180px', whiteSpace: 'normal' }}>{tourName}</div>}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cust?.name || 'Chưa rõ'} ({b.pax_count || 1} khách)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust?.phone || ''}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{dep ? new Date(dep.start_date).toLocaleDateString('vi-VN') : (b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : '---')}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>Tổng: <b>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</b></div>
                          <div style={{ fontSize: '0.85rem', color: '#0284c7' }}>Đã thu: {new Intl.NumberFormat('vi-VN').format(paidAmount)}đ</div>
                          {debtAmount > 0 ? (
                            <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>Còn nợ: {new Intl.NumberFormat('vi-VN').format(debtAmount)}đ</div>
                          ) : (
                            <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>Đã thu đủ</div>
                          )}
                        </td>
                        <td>
                          {isInternational ? (
                             missingPassportsCount > 0 ? (
                               <span className="badge badge-danger">⚠️ Thiếu {missingPassportsCount} Hộ chiếu</span>
                             ) : (
                               <span className="badge badge-success">✓ Đã đủ HC</span>
                             )
                          ) : (
                             <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nội địa (Không y/c)</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: b.booking_status === 'Huỷ' ? '#94a3b8' : '#0ea5e9' }}>{b.booking_status}</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {activeInternalTab === 'reminders' && (
        <div className="analytics-card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Công việc & Lịch Hẹn</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setReminderFilter('PENDING')}
                  style={{ padding: '4px 12px', border: 'none', background: reminderFilter === 'PENDING' ? 'white' : 'transparent', color: reminderFilter === 'PENDING' ? '#3b82f6' : '#64748b', fontWeight: 700, borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', boxShadow: reminderFilter === 'PENDING' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >Chờ xử lý</button>
                <button
                  onClick={() => setReminderFilter('ALL')}
                  style={{ padding: '4px 12px', border: 'none', background: reminderFilter === 'ALL' ? 'white' : 'transparent', color: reminderFilter === 'ALL' ? '#3b82f6' : '#64748b', fontWeight: 700, borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', boxShadow: reminderFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                >Tất cả</button>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng: {leadReminders.length} nhắc nhở</span>
            </div>
          </div>
          
          <div style={{ padding: '0' }}>
             {loadingReminders ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Đang tải dữ liệu...</div>
             ) : leadReminders.filter(r => reminderFilter === 'ALL' || r.status === reminderFilter).length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8', margin: '2rem' }}>
                   Không có lịch hẹn nào.
                </div>
             ) : (
                <div className="data-table-container" style={{ border: 'none', margin: 0, borderRadius: 0, boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '130px' }}>THỜI GIAN</th>
                        <th style={{ width: '250px' }}>KHÁCH HÀNG</th>
                        <th>NỘI DUNG NHẮC NHỞ</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadReminders.filter(r => reminderFilter === 'ALL' || r.status === reminderFilter)
                        .sort((a,b) => new Date(a.due_date) - new Date(b.due_date))
                        .map(r => {
                        const isOverdue = new Date(r.due_date) < new Date() && r.status === 'PENDING';
                        const d = new Date(r.due_date);
                        const timeStr = d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                        const dateStr = d.toLocaleDateString('vi-VN');
                        
                        return (
                           <tr key={r.id} style={{ background: r.status === 'DONE' ? '#f8fafc' : (isOverdue ? '#fff1f2' : 'white'), opacity: r.status === 'DONE' ? 0.7 : 1 }}>
                              <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Clock size={14} color={r.status === 'DONE' ? '#94a3b8' : (isOverdue ? '#ef4444' : '#eab308')} />
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: r.status === 'DONE' ? '#64748b' : (isOverdue ? '#e11d48' : '#d97706') }}>
                                         {timeStr}
                                      </span>
                                   </div>
                                   <div style={{ fontSize: '0.8rem', color: '#64748b', paddingLeft: '20px' }}>
                                      {dateStr}
                                   </div>
                                 </div>
                                 {isOverdue && <div style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '6px', fontWeight: 700 }}>QUÁ HẠN</div>}
                              </td>
                              <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', cursor: 'pointer', display: 'inline-block' }} 
                                      onClick={() => {
                                         const lead = leads.find(l => l.id === r.lead_id);
                                         if(lead) setEditingLead({...lead, openTab: 'reminders'});
                                      }}
                                      onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                                      onMouseOut={(e) => e.target.style.color = '#1e293b'}
                                 >{r.lead_name}</div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.lead_phone}</span>
                                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>{r.lead_status}</span>
                                 </div>
                              </td>
                              <td style={{ verticalAlign: 'top', padding: '1rem' }}>
                                 <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    {r.title || 'Không có ghi chú'}
                                 </div>
                              </td>
                              <td style={{ verticalAlign: 'top', textAlign: 'center', padding: '1rem' }}>
                                 {r.status === 'PENDING' ? (
                                   <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }} 
                                           onMouseOver={(e) => { e.target.style.background = '#10b981'; e.target.style.color = 'white'; }}
                                           onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#10b981'; }}
                                           onClick={async () => {
                                      try {
                                         await axios.put(`/api/reminders/leads/${r.id}/done`, {}, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                                         setLeadReminders(leadReminders.map(x => x.id === r.id ? {...x, status: 'DONE'} : x));
                                      } catch(e) { alert('Lỗi'); }
                                   }}>
                                      <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Xong
                                   </button>
                                 ) : (
                                   <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                      <CheckCircle size={14} /> Đã xong
                                   </div>
                                 )}
                              </td>
                           </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             )}
          </div>
        </div>
      )}
      {viewingFullNote && (
        <div className="modal-overlay" onClick={() => setViewingFullNote(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close-btn" onClick={() => setViewingFullNote(null)}>
              <X size={18} strokeWidth={3} />
            </button>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Khách hàng: {viewingFullNote.name || 'Chưa cập nhật'} {viewingFullNote.phone ? `- ${viewingFullNote.phone}` : ''}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Lịch sử Ghi chú Tư vấn</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {viewingFullNote.consultation_note ? viewingFullNote.consultation_note.split(/\n\s*\n/).filter(n => n.trim()).map((note, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                  {renderNoteWithTime(note)}
                </div>
              )) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>Không có ghi chú nào</div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="workspace-bottom-nav">
          <div 
              className={`workspace-bottom-nav-item ${activeInternalTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveInternalTab('bookings')}
          >
              <ShoppingCart size={20} />
              <span>Đơn Của Tôi ({myBookings.length})</span>
          </div>
          <div 
              className={`workspace-bottom-nav-item ${activeInternalTab === 'myleads' ? 'active' : ''}`}
              onClick={() => setActiveInternalTab('myleads')}
          >
              <UserPlus size={20} />
              <span>Lead Đang Quản Lý</span>
          </div>
          <div 
              className={`workspace-bottom-nav-item ${activeInternalTab === 'reminders' ? 'active' : ''}`}
              onClick={() => setActiveInternalTab('reminders')}
          >
              <Clock size={20} />
              <span>Lịch Hẹn & C.Việc</span>
          </div>
          <div 
              className="workspace-bottom-nav-item"
              onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
          >
              <Menu size={20} />
              <span>Menu</span>
          </div>
      </div>
    </>
  );
};

export default SalesDashboard;
