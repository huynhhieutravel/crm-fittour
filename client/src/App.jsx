import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Map, 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  UserPlus,
  LogOut,
  Lock
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
      fetchTours();
      fetchBookings();
      fetchConversations();
    }
  }, [isLoggedIn]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/messages/send', {
        conversationId: selectedConv.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations(); // Để cập nhật last message
    } catch (err) { console.error(err); }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Cập nhật state local để UI phản hồi nhanh
      setLeads(leads.map(lead => lead.id === id ? { ...lead, [field]: value } : lead));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>FIT TOUR CRM</div>
          <h2>Đăng nhập hệ thống</h2>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              required 
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              required 
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">FIT TOUR CRM</div>
        <nav>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard /> Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <MessageSquare /> Inbox
          </div>
          <div 
            className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <UserPlus /> Quản lý Lead
          </div>
          <div 
            className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar /> Bookings
          </div>
          <div 
            className={`nav-item ${activeTab === 'tours' ? 'active' : ''}`}
            onClick={() => setActiveTab('tours')}
          >
            <Map /> Quản lý Tour
          </div>
          <div 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users /> Khách hàng
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff8a8a' }}>
            <LogOut /> Đăng xuất
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">
            Chào, {user?.full_name} ({user?.role})
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-view">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Tổng Lead mới</span>
                <span className="stat-value">{leads.length}</span>
                <span className="stat-trend trend-up">↑ 12% so với tuần trước</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Booking đang chờ</span>
                <span className="stat-value">24</span>
                <span className="stat-trend trend-down">↓ 5% so với tuần trước</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Doanh thu tháng này</span>
                <span className="stat-value">1.250.000.000 đ</span>
                <span className="stat-trend trend-up">↑ 8% so với tuần trước</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Tỉ lệ chuyển đổi</span>
                <span className="stat-value">18.5%</span>
                <span className="stat-trend trend-up">↑ 2.1% so với tuần trước</span>
              </div>
            </div>

            <section>
              <h2 className="section-title">Bookings gần đây</h2>
              <div className="recent-bookings">
                <table>
                  <thead>
                    <tr>
                      <th>Mã Booking</th>
                      <th>Khách hàng</th>
                      <th>Tour</th>
                      <th>Ngày khởi hành</th>
                      <th>Giá trị</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#FT1025</td>
                      <td>Nguyễn Văn A</td>
                      <td>Tibet Tour 8N7Đ</td>
                      <td>15/04/2026</td>
                      <td>45.000.000 đ</td>
                      <td><span className="badge badge-confirmed">Đã xác nhận</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="section-title">Quản lý Lead (Marketing)</h2>
              <button className="login-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ Thêm Lead mới</button>
            </div>
            <div className="recent-bookings excel-mode">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Họ tên</th>
                    <th style={{ width: '150px' }}>Số điện thoại</th>
                    <th style={{ width: '150px' }}>Nguồn</th>
                    <th style={{ width: '200px' }}>Tour quan tâm</th>
                    <th style={{ width: '180px' }}>Trạng thái</th>
                    <th style={{ width: '300px' }}>Ghi chú tư vấn</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <input 
                          className="cell-input"
                          defaultValue={lead.name}
                          onBlur={(e) => handleInlineUpdate(lead.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          className="cell-input"
                          defaultValue={lead.phone}
                          onBlur={(e) => handleInlineUpdate(lead.id, 'phone', e.target.value)}
                          placeholder="Chưa có SĐT..."
                        />
                      </td>
                      <td>
                        <select 
                          className="cell-select"
                          defaultValue={lead.source}
                          onChange={(e) => handleInlineUpdate(lead.id, 'source', e.target.value)}
                        >
                          <option value="messenger">Messenger</option>
                          <option value="facebook_ads">Facebook Ads</option>
                          <option value="tiktok">Tik Tok</option>
                          <option value="website">Website</option>
                          <option value="hotline">Hotline</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          className="cell-select"
                          defaultValue={lead.tour_id}
                          onChange={(e) => handleInlineUpdate(lead.id, 'tour_id', e.target.value)}
                        >
                          <option value="">Chọn tour...</option>
                          {tours.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select 
                          className={`cell-select status-${lead.status}`}
                          defaultValue={lead.status}
                          onChange={(e) => handleInlineUpdate(lead.id, 'status', e.target.value)}
                        >
                          <option value="new">✨ Mới</option>
                          <option value="potential">💎 Tiềm năng</option>
                          <option value="high_opportunity">🔥 Cơ hội cao</option>
                          <option value="returning">🔄 Khách quay lại</option>
                          <option value="non_potential">⚪ Không tiềm năng</option>
                          <option value="junk">🗑️ Lead rác</option>
                          <option value="won">✅ Chốt đơn</option>
                          <option value="lost">❌ Thất bại</option>
                        </select>
                      </td>
                      <td>
                        <input 
                          className="cell-input"
                          defaultValue={lead.consultation_note}
                          onBlur={(e) => handleInlineUpdate(lead.id, 'consultation_note', e.target.value)}
                          placeholder="Nhập ghi chú..."
                        />
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && !loading && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có lead nào</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tours' && (
          <div className="tours-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="section-title">Quản lý Tour</h2>
              <button className="login-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ Tạo Tour mới</button>
            </div>
            <div className="recent-bookings">
              <table>
                <thead>
                  <tr>
                    <th>Tên Tour</th>
                    <th>Điểm đến</th>
                    <th>Thời lượng</th>
                    <th>Giá niêm yết</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map(tour => (
                    <tr key={tour.id}>
                      <td style={{ fontWeight: 'bold' }}>{tour.name}</td>
                      <td>{tour.destination}</td>
                      <td>{tour.duration}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tour.price)}
                      </td>
                      <td><span className={`badge badge-${tour.status === 'active' ? 'confirmed' : 'pending'}`}>{tour.status}</span></td>
                      <td>
                        <button style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '10px' }}>Sửa</button>
                        <button style={{ border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer' }}>Xoá</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 className="section-title">Danh sách Booking</h2>
            </div>
            <div className="recent-bookings">
              <table>
                <thead>
                  <tr>
                    <th>Mã Booking</th>
                    <th>Khách hàng</th>
                    <th>Tour</th>
                    <th>Số khách</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: 'bold' }}>#{booking.booking_code}</td>
                      <td>{booking.customer_name}</td>
                      <td>{booking.tour_name}</td>
                      <td>{booking.pax_count} khách</td>
                      <td style={{ fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total_price)}
                      </td>
                      <td><span className={`badge badge-${booking.payment_status === 'paid' ? 'confirmed' : 'pending'}`}>{booking.payment_status}</span></td>
                      <td><span className="badge badge-paid">{booking.booking_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inbox' && (
          <div className="inbox-view" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 160px)', background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div className="chat-list" style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Hội thoại (Messenger)</div>
              {conversations.map(conv => (
                <div 
                  key={conv.id}
                  onClick={() => {
                    setSelectedConv(conv);
                    fetchMessages(conv.id);
                  }}
                  style={{ 
                    padding: '1rem', 
                    background: selectedConv?.id === conv.id ? '#edf2f7' : 'transparent', 
                    borderLeft: selectedConv?.id === conv.id ? '4px solid var(--primary)' : '4px solid transparent',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{conv.lead_name || `Guest #${conv.external_id.substring(0, 5)}`}</div>
                  <div style={{ fontSize: '0.8rem', color: 'gray', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.last_message}
                  </div>
                </div>
              ))}
              {conversations.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'gray' }}>Chưa có hội thoại nào</div>}
            </div>
            
            {selectedConv ? (
              <div className="chat-window" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tin nhắn: {selectedConv.lead_name || 'Khách Facebook'}</span>
                  <button 
                    onClick={() => setActiveTab('leads')}
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Xem Chi tiết Lead
                  </button>
                </div>
                <div className="messages" style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ marginBottom: '1rem', textAlign: msg.sender_type === 'customer' ? 'left' : 'right' }}>
                      <div style={{ 
                        display: 'inline-block', 
                        padding: '0.75rem 1rem', 
                        background: msg.sender_type === 'customer' ? 'white' : 'var(--primary)', 
                        color: msg.sender_type === 'customer' ? 'inherit' : 'white', 
                        borderRadius: '1rem', 
                        border: msg.sender_type === 'customer' ? '1px solid var(--border)' : 'none', 
                        maxWidth: '80%' 
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'gray', marginTop: '0.2rem' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..." 
                    style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', outline: 'none' }} 
                  />
                  <button type="submit" className="login-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>Gửi</button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'gray' }}>
                Chọn một hội thoại để bắt đầu
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
