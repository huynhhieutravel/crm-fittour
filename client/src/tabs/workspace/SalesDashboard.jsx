import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  CheckCircle,
  PhoneCall,
  CalendarCheck,
  Zap,
  Target,
  Plane,
  CreditCard,
  Cake,
  AlertCircle,
  Clock,
  LayoutDashboard,
  ShoppingCart,
  CalendarHeart
} from 'lucide-react';
import LeaveRequestsTab from '../LeaveRequestsTab';

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
  checkPerm
}) => {
  const [activeInternalTab, setActiveInternalTab] = useState('radar');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemAlerts, setSystemAlerts] = useState([]);

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
  const myLeads = leads.filter(l => l.assigned_to === currentUser.id);
  const myNewLeads = myLeads.filter(l => l.status === 'Mới');
  const myCallingLeads = myLeads.filter(l => ['Đang liên hệ', 'Tiềm năng'].includes(l.status));
  const myWonLeads = myLeads.filter(l => l.status === 'Chốt đơn');

  // --- BOOKINGS (Pending Deposits / Debts) ---
  const myBookings = bookings.filter(b => b.assigned_to === currentUser.id);
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
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Không Gian Làm Việc
            <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '12px', fontWeight: 600 }}>WORKSPACE V3.0</span>
          </h2>
          <p style={{ color: '#64748b' }}>Hôm nay bạn có {myNewLeads.length} Lead mới và {totalDebtBookings} Booking đang chờ thu tiền.</p>
        </div>
        <button className="btn-pro-save" onClick={() => setShowAddLeadModal(true)}>
          <Zap size={18} /> THÊM LEAD NHANH
        </button>
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

      {/* INTERNAL TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveInternalTab('radar')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'radar' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'radar' ? '#3b82f6' : 'transparent' }}
        >
          <LayoutDashboard size={18} /> Radar Nóng
        </button>
        <button 
          onClick={() => setActiveInternalTab('bookings')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'bookings' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'bookings' ? '#059669' : 'transparent' }}
        >
          <ShoppingCart size={18} /> Đơn Của Tôi ({myBookings.length})
        </button>
        <button 
          onClick={() => setActiveInternalTab('leaves')} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: activeInternalTab === 'leaves' ? '#fff' : '#64748b', backgroundColor: activeInternalTab === 'leaves' ? '#8b5cf6' : 'transparent' }}
        >
          <CalendarHeart size={18} /> Nghỉ Phép
        </button>
      </div>

      {/* NỘI DUNG TABS */}
      {activeInternalTab === 'radar' && (
        <>
          <div className="stats-grid mb-6">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <div className="stat-icon-bg"><UserPlus size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">LEAD MỚI TRONG GIỎ</span>
                <div className="stat-value">{myNewLeads.length}</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <div className="stat-icon-bg"><PhoneCall size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">KHÁCH ĐANG BÁM SÁT</span>
                <div className="stat-value">{myCallingLeads.length}</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              <div className="stat-icon-bg"><CreditCard size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">CHỜ THU TIỀN BOOKING</span>
                <div className="stat-value">{totalDebtBookings}</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <div className="stat-icon-bg"><Cake size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">SINH NHẬT KHÁCH (TUẦN)</span>
                <div className="stat-value">{upcomingBirthdays.length}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            {/* CỘT 1: ACTION & TO-DO MÀN HÌNH CHÍNH */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="analytics-card" style={{ flex: 1 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} color="#f59e0b" /> Nhắc nhở & To-do list
                </h3>
                {reminders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Không có lịch hẹn nào bị sót.
                  </div>
                ) : (
                  <div className="activity-list" style={{ marginTop: '1rem' }}>
                    {reminders.map(r => (
                      <div key={r.id} className="activity-item" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                          <div className="activity-icon" style={{ background: '#fef3c7', flexShrink: 0, width: '32px', height: '32px' }}>
                            <Clock size={16} color="#d97706" />
                          </div>
                          <div className="activity-details" style={{ flex: 1 }}>
                            <div className="activity-name" style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.85rem' }}>{getReminderLabel(r.type)}</div>
                            <div className="activity-meta" style={{ marginTop: '2px', fontSize: '0.75rem' }}>
                              KH: {r.customer_name}
                            </div>
                          </div>
                          <button 
                            className="btn-pro-save" 
                            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => markReminderDone(r.id)}
                          >
                            Xong
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="analytics-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="#10b981" /> Khách Chờ Tư Vấn
                </h3>
                <div className="activity-list" style={{ marginTop: '1rem' }}>
                  {myLeads.slice(0, 5).map(lead => (
                    <div 
                      key={lead.id} 
                      className="activity-item" 
                      onClick={() => setEditingLead(lead)}
                    >
                      <div className="activity-icon" style={{ background: lead.status === 'Mới' ? '#fee2e2' : '#f1f5f9', width: '32px', height: '32px' }}>
                        <UserPlus size={16} color={lead.status === 'Mới' ? '#ef4444' : '#64748b'} />
                      </div>
                      <div className="activity-details">
                        <div className="activity-name" style={{ fontSize: '0.85rem' }}>{lead.name}</div>
                        <div className="activity-meta" style={{ fontSize: '0.75rem' }}>{lead.phone || 'Không SĐT'}</div>
                      </div>
                      <div className={`activity-status badge-${lead.status}`} style={{ fontSize: '0.65rem' }}>
                        {lead.status}
                      </div>
                    </div>
                  ))}
                  {myLeads.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Giỏ Lead đang trống.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT 2: RỔ HÀNG NGAY TRƯỚC MẮT */}
            <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane size={20} color="#3b82f6" /> Lịch Khởi Hành (Rổ Hàng Nóng)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Sản phẩm sẵn sàng bán, tập trung đẩy số chốt Khách.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingDepartures.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Chưa có Lịch Khởi Hành nào sắp tới.
                  </div>
                ) : (
                  upcomingDepartures.map(dep => {
                    const tourDef = tourTemplates.find(t => t.id === dep.tour_id);
                    const slots = dep.max_participants || 0;
                    const dateStr = new Date(dep.start_date).toLocaleDateString('vi-VN');
                    
                    return (
                      <div key={dep.id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem', marginBottom: '4px' }}>
                          {tourDef?.name || 'Tên tour chưa xác định'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
                            <Plane size={14} /> Khởi hành: {dateStr}
                          </span>
                          <span style={{ padding: '2px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: '12px', fontWeight: 700 }}>
                            Tổng chỗ: {slots}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* CỘT 3: CARE KHÁCH HÀNG & CÔNG NỢ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="analytics-card" style={{ flex: 1, cursor: 'pointer' }} onClick={() => setActiveInternalTab('bookings')}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                  <AlertCircle size={20} /> Cảnh Báo Thu Tiền
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>Sát sao thu tiền, tránh huỷ dịch vụ.</p>
                <div className="activity-list">
                  {[...pendingBookings, ...partialBookings].slice(0,5).map(b => (
                    <div key={b.id} className="activity-item" style={{ cursor: 'pointer', padding: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          Mã: {b.booking_code}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#64748b' }}>Tiền tour: {new Intl.NumberFormat('vi-VN').format(b.total_price)}đ</span>
                          <span style={{ color: b.payment_status === 'Chưa thanh toán' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                            {b.payment_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {totalDebtBookings > 5 && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>
                      Xem tất cả trong tab Đơn Của Tôi ➔
                    </div>
                  )}
                  {totalDebtBookings === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Tuyệt vời! Không có khoản thu nào bị trễ.
                    </div>
                  )}
                </div>
              </div>

              <div className="analytics-card" style={{ flex: 1, background: '#fdf4ff', borderColor: '#fbcfe8' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c026d3' }}>
                  <Cake size={20} /> Sinh Nhật Khách VIP 🎂
                </h3>
                <div className="activity-list" style={{ marginTop: '1rem' }}>
                  {upcomingBirthdays.slice(0, 3).map(c => {
                    const bDateStr = new Date(c.birth_date).toLocaleDateString('vi-VN').substring(0, 5);
                    return (
                      <div key={c.id} className="activity-item" style={{ cursor: 'pointer', background: '#fff', border: '1px solid #fce7f3' }}>
                        <div className="activity-icon" style={{ background: '#fdf4ff', width: '32px', height: '32px' }}>
                          <Cake size={16} color="#d946ef" />
                        </div>
                        <div className="activity-details">
                          <div className="activity-name" style={{ fontSize: '0.85rem' }}>{c.name}</div>
                          <div className="activity-meta" style={{ fontSize: '0.75rem', color: '#d946ef', fontWeight: 600 }}>
                            {bDateStr} - Gửi ngay Voucher!
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {upcomingBirthdays.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#d946ef', fontSize: '0.85rem', opacity: 0.7 }}>
                      Tuần này không có khách sinh nhật.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {activeInternalTab === 'bookings' && (
        <div className="analytics-card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Đơn Giữ Chỗ Của Tôi</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng: {myBookings.length} Đơn hàng</span>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>MÃ GIAO DỊCH</th>
                  <th>KHÁCH HÀNG</th>
                  <th>NGÀY KHÁCH BAY</th>
                  <th>TỔNG TIỀN</th>
                  <th>THANH TOÁN</th>
                  <th>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chưa có đơn hàng nào do bạn quản lý.</td>
                  </tr>
                ) : (
                  myBookings.map(b => {
                    const cust = customers.find(c => c.id === b.customer_id);
                    const dep = departures.find(d => d.id === b.tour_departure_id);
                    const isUrgent = b.payment_status === 'Chưa thanh toán' && b.booking_status !== 'Huỷ';
                    
                    return (
                      <tr key={b.id} style={{ background: isUrgent ? '#fef2f2' : 'transparent' }}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{b.booking_code}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{cust?.name || 'Chưa rõ'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust?.phone || ''}</div>
                        </td>
                        <td>{dep ? new Date(dep.start_date).toLocaleDateString('vi-VN') : (b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : '---')}</td>
                        <td style={{ fontWeight: 600, color: '#dc2626' }}>{new Intl.NumberFormat('vi-VN').format(b.total_price)}đ</td>
                        <td>
                          <span className={`badge ${b.payment_status === 'Đã thanh toán' ? 'badge-success' : (b.payment_status === 'Chưa thanh toán' ? 'badge-danger' : 'badge-warning')}`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: b.booking_status === 'Huỷ' ? '#94a3b8' : '#0ea5e9' }}>{b.booking_status}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeInternalTab === 'leaves' && (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', minHeight: '600px' }}>
          {/* Nhúng toàn bộ Module Nghỉ Phép vào trong Workspace */}
          <LeaveRequestsTab users={users} currentUser={currentUser} checkPerm={checkPerm || (() => true)} />
        </div>
      )}

    </div>
  );
};

export default SalesDashboard;
