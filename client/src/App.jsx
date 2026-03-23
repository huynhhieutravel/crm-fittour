import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
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
  Lock,
  ShieldCheck,
  Settings
} from 'lucide-react';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletion from './pages/DataDeletion';

// [Các hàm helper giữ nguyên bên ngoài component chính nếu cần]
const addToastGlobal = (message, setToasts) => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message }]);
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 3000);
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [toasts, setToasts] = useState([]);
  const [testLoading, setTestLoading] = useState(false);
  const [metaToken, setMetaToken] = useState('');
  const [metaSettings, setMetaSettings] = useState({
    meta_app_id: '',
    meta_app_secret: '',
    meta_verify_token: '',
    meta_page_access_token: '',
    meta_page_id: ''
  });
  const [leadFilters, setLeadFilters] = useState({ status: '', source: '', search: '' });
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', source: 'hotline', tour_id: '', consultation_note: '' });
  const [fastLead, setFastLead] = useState({ name: '', phone: '', source: 'facebook_ads', tour_id: '', status: 'new' });
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState(null);
  const [leadNotes, setLeadNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [hoveredNote, setHoveredNote] = useState({ id: null, content: '', x: 0, y: 0 });

  const addToast = (msg) => addToastGlobal(msg, setToasts);

  // Restore Session
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Session restore failed", err);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchLeads();
      fetchTours();
      fetchBookings();
      fetchConversations();
      fetchSettings();
    }
  }, [isLoggedIn]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetaSettings(res.data);
      if (res.data.meta_page_access_token) setMetaToken(res.data.meta_page_access_token);
    } catch (err) { console.error('Fetch settings failed', err); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/settings/update', { settings: metaSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã lưu cài đặt Meta thành công!');
    } catch (err) {
      addToast('Lỗi khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    await createLead(newLead);
    setShowAddLeadModal(false);
    setNewLead({ name: '', phone: '', source: 'hotline', tour_id: '', consultation_note: '' });
  };

  const handleFastAddLead = async () => {
    if (!fastLead.name) { addToast('Vui lòng nhập tên khách'); return; }
    await createLead(fastLead);
    setFastLead({ name: '', phone: '', source: 'facebook_ads', tour_id: '', status: 'new' });
  };

  const createLead = async (leadData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leads', leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Đã thêm Lead mới thành công!');
      fetchLeads();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi thêm Lead mới');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/notes/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeadNotes(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notes', { lead_id: selectedLeadForNotes.id, content: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNote('');
      fetchNotes(selectedLeadForNotes.id);
      addToast('Đã lưu ghi chú mới');
    } catch (err) { console.error(err); }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = !leadFilters.status || lead.status === leadFilters.status;
    const matchesSource = !leadFilters.source || lead.source === leadFilters.source;
    const matchesSearch = !leadFilters.search || 
      (lead.name?.toLowerCase().includes(leadFilters.search.toLowerCase())) ||
      (lead.phone?.includes(leadFilters.search));
    return matchesStatus && matchesSource && matchesSearch;
  });

  const fetchConversations = async () => { /* Giữ nguyên logic fetch */
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (convId) => { /* Giữ nguyên logic fetch */
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => { /* Giữ nguyên logic gửi tin */
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
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leads/${id}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, [field]: value } : lead));
      addToast(`Đã tự động lưu ${field}`);
    } catch (err) {
      console.error('Update failed:', err);
      addToast('Lỗi khi lưu dữ liệu');
    }
  };

  const fetchTours = async () => { /* Giữ nguyên */
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBookings = async () => { /* Giữ nguyên */
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLeads = async () => { /* Giữ nguyên */
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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleTestMeta = async () => {
    if (!metaToken) {
      addToast('Vui lòng dán Page Access Token vào ô bên dưới.');
      return;
    }
    setTestLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/messages/test-meta', 
        { token: metaToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        addToast(res.data.note || 'Kích hoạt API thành công! Trạng thái Meta sẽ sớm cập nhật.');
      } else {
        // Trường hợp server trả về success: false kèm message hướng dẫn
        addToast(res.data.message || 'Kích hoạt chưa hoàn tất. Kiểm tra lại quyền của Token.');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối Meta. Kiểm tra lại Token của bạn.';
      addToast(errorMsg);
    } finally {
      setTestLoading(false);
      fetchSettings(); // Refresh to get any updated info if needed
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  // Component Logic Render Dashboard/Admin
  const renderDashboard = () => (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">
          <div style={{ width: '40px', height: '40px', background: 'var(--secondary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Map size={24} />
          </div>
          FIT TOUR
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard /> Dashboard</div>
          <div className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}><MessageSquare /> Inbox</div>
          <div className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}><UserPlus /> Quản lý Lead</div>
          <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}><Calendar /> Bookings</div>
          <div className={`nav-item ${activeTab === 'tours' ? 'active' : ''}`} onClick={() => setActiveTab('tours')}><Map /> Quản lý Tour</div>
          <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users /> Khách hàng</div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings /> Cài đặt Meta</div>
          <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff8a8a' }}><LogOut /> Đăng xuất</div>
        </nav>
      </div>

      <main className="main-content">
        <header className="header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">Chào, {user?.full_name} ({user?.role})</div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-view animate-fade-in">
            <div className="stats-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-label">Tổng Lead mới</div>
                  <div style={{ padding: '0.5rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '0.75rem', color: '#34d399' }}><UserPlus size={20} /></div>
                </div>
                <div className="stat-value">{leads.length}</div>
                <div className="stat-trend trend-up"><TrendingUp size={14} /> ↑ 12% <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>so với tuần trước</span></div>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-label">Booking đang chờ</div>
                  <div style={{ padding: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '0.75rem', color: '#fbbf24' }}><Calendar size={20} /></div>
                </div>
                <div className="stat-value">24</div>
                <div className="stat-trend trend-down"><TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> ↓ 5% <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>so với tuần trước</span></div>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-label">Doanh thu tháng này</div>
                  <div style={{ padding: '0.5rem', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '0.75rem', color: '#60a5fa' }}><TrendingUp size={20} /></div>
                </div>
                <div className="stat-value">1.25B đ</div>
                <div className="stat-trend trend-up"><TrendingUp size={14} /> ↑ 8% <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>so với tuần trước</span></div>
              </div>
              <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(251, 191, 36, 0.05)', border: '1px dashed var(--secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--secondary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Kích hoạt API Xét duyệt</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Dán Page Token để gọi 0/1 API</div>
                </div>
                <input 
                  type="password"
                  placeholder="Dán Page Access Token..." 
                  value={metaToken}
                  onChange={(e) => setMetaToken(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white', fontSize: '0.8rem' }}
                />
                <button 
                  onClick={handleTestMeta} 
                  disabled={testLoading}
                  className="login-btn hover-glow" 
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                >
                  {testLoading ? 'Đang kích hoạt...' : 'Bấm để hoàn tất 0/1 API call'}
                </button>
              </div>
            </div>

            <section>
              <h2 className="section-title">Bookings gần đây</h2>
              <div className="recent-bookings">
                <table>
                  <thead><tr><th>Mã Booking</th><th>Khách hàng</th><th>Tour</th><th>Ngày khởi hành</th><th>Giá trị</th><th>Trạng thái</th></tr></thead>
                  <tbody><tr><td>#FT1025</td><td>Nguyễn Văn A</td><td>Tibet Tour 8N7Đ</td><td>15/04/2026</td><td>45M đ</td><td><span className="badge badge-confirmed">Đã xác nhận</span></td></tr></tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="leads-view animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Quản lý Lead (Marketing)</h2>
              
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
                <input 
                  type="text" 
                  placeholder="Tìm tên hoặc SĐT..." 
                  value={leadFilters.search}
                  onChange={(e) => setLeadFilters({...leadFilters, search: e.target.value})}
                  style={{ width: '200px', padding: '0.5rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                />
                <select 
                  value={leadFilters.status}
                  onChange={(e) => setLeadFilters({...leadFilters, status: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="new">Mới</option>
                  <option value="potential">Tiềm năng</option>
                  <option value="won">Chốt đơn</option>
                  <option value="lost">Thất bại</option>
                </select>
                <select 
                  value={leadFilters.source}
                  onChange={(e) => setLeadFilters({...leadFilters, source: e.target.value})}
                  style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                >
                  <option value="">Tất cả nguồn</option>
                  <option value="messenger">Messenger</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="hotline">Hotline</option>
                  <option value="website">Website</option>
                </select>
                <button className="login-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => setShowAddLeadModal(true)}>+ Thêm Lead</button>
              </div>
            </div>

            <div className="recent-bookings excel-mode">
              <table>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Số điện thoại</th>
                    <th>Nguồn</th>
                    <th>Tour quan tâm</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú tư vấn</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dòng nhập nhanh (Fast Add) */}
                  <tr style={{ background: 'rgba(251, 191, 36, 0.1)', border: '2px solid var(--secondary)' }}>
                    <td><input className="cell-input" placeholder="Nhập tên nhanh..." value={fastLead.name} onChange={e => setFastLead({...fastLead, name: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleFastAddLead()} /></td>
                    <td><input className="cell-input" placeholder="SĐT..." value={fastLead.phone} onChange={e => setFastLead({...fastLead, phone: e.target.value})} /></td>
                    <td>
                      <select className="cell-select" value={fastLead.source} onChange={e => setFastLead({...fastLead, source: e.target.value})}>
                        <option value="facebook_ads">Facebook Ads</option>
                        <option value="messenger">Messenger</option>
                        <option value="website">Website</option>
                        <option value="hotline">Hotline</option>
                      </select>
                    </td>
                    <td>
                      <select className="cell-select" value={fastLead.tour_id} onChange={e => setFastLead({...fastLead, tour_id: e.target.value})}>
                        <option value="">Chọn tour...</option>
                        {tours.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                      </select>
                    </td>
                    <td>
                      <select className="cell-select" value={fastLead.status} onChange={e => setFastLead({...fastLead, status: e.target.value})}>
                        <option value="new">✨ Mới</option>
                        <option value="potential">💎 Tiềm năng</option>
                      </select>
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <button className="login-btn" style={{ width: '80%', padding: '0.4rem', fontSize: '0.8rem' }} onClick={handleFastAddLead}>LƯU</button>
                    </td>
                  </tr>

                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input className="cell-input" defaultValue={lead.name} onBlur={(e) => handleInlineUpdate(lead.id, 'name', e.target.value)} />
                        {lead.consultation_note && (
                          <div 
                            style={{ cursor: 'help', color: 'var(--secondary)', position: 'relative' }}
                            onMouseEnter={(e) => setHoveredNote({ id: lead.id, content: lead.consultation_note, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredNote({ id: null, content: '', x: 0, y: 0 })}
                            onClick={() => { setSelectedLeadForNotes(lead); fetchNotes(lead.id); }}
                          >
                            <MessageSquare size={16} />
                          </div>
                        )}
                      </td>
                      <td><input className="cell-input" defaultValue={lead.phone} onBlur={(e) => handleInlineUpdate(lead.id, 'phone', e.target.value)} placeholder="Trống..." /></td>
                      <td>
                        <select className="cell-select" defaultValue={lead.source} onChange={(e) => handleInlineUpdate(lead.id, 'source', e.target.value)}>
                          <option value="messenger">Messenger</option>
                          <option value="facebook_ads">Facebook Ads</option>
                          <option value="tiktok">Tik Tok</option>
                          <option value="website">Website</option>
                          <option value="hotline">Hotline</option>
                        </select>
                      </td>
                      <td>
                        <select className="cell-select" defaultValue={lead.tour_id} onChange={(e) => handleInlineUpdate(lead.id, 'tour_id', e.target.value)}>
                          <option value="">Chọn tour...</option>
                          {tours.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                        </select>
                      </td>
                      <td>
                        <select className={`cell-select status-${lead.status}`} defaultValue={lead.status} onChange={(e) => handleInlineUpdate(lead.id, 'status', e.target.value)}>
                          <option value="new">✨ Mới</option>
                          <option value="potential">💎 Tiềm năng</option>
                          <option value="high_opportunity">🔥 Cơ hội cao</option>
                          <option value="returning">🔄 Quay lại</option>
                          <option value="non_potential">⚪ Thấp</option>
                          <option value="won">✅ Chốt</option>
                          <option value="lost">❌ Lost</option>
                        </select>
                      </td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input className="cell-input" defaultValue={lead.consultation_note} onBlur={(e) => handleInlineUpdate(lead.id, 'consultation_note', e.target.value)} placeholder="Ghi chú..." />
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px' }}
                          onClick={() => { setSelectedLeadForNotes(lead); fetchNotes(lead.id); }}
                        >
                          <Settings size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)', opacity: 0.5 }}>Không tìm thấy Lead nào khớp với bộ lọc.</div>
              )}
            </div>
          </div>
        )}

        {/* Modal Thêm Lead Mới */}
        {showAddLeadModal && (
          <div className="modal-overlay" onClick={() => setShowAddLeadModal(false)}>
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '1.5rem' }}>Thêm Lead mới</h3>
              <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Họ tên khách hàng</label>
                  <input type="text" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Nguyễn Văn A..." />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="090..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Nguồn</label>
                    <select value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
                      <option value="hotline">Hotline</option>
                      <option value="messenger">Messenger</option>
                      <option value="website">Website</option>
                      <option value="walk_in">Khách vãng lai</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tour quan tâm</label>
                    <select value={newLead.tour_id} onChange={e => setNewLead({...newLead, tour_id: e.target.value})}>
                      <option value="">Chọn tour...</option>
                      {tours.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Ghi chú ban đầu</label>
                  <textarea 
                    value={newLead.consultation_note} 
                    onChange={e => setNewLead({...newLead, consultation_note: e.target.value})}
                    placeholder="Khách cần tư vấn tour Tây Tạng..."
                    style={{ minHeight: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="login-btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => setShowAddLeadModal(false)}>Hủy</button>
                  <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu Lead'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Lịch sử tư vấn */}
        {selectedLeadForNotes && (
          <div className="modal-overlay" onClick={() => setSelectedLeadForNotes(null)}>
            <div className="modal-content animate-fade-in" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Lịch sử tư vấn: {selectedLeadForNotes.name}</h3>
                <button onClick={() => setSelectedLeadForNotes(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
              </div>
              
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Ghi chú chi tiết hiện tại</label>
                <textarea 
                  defaultValue={selectedLeadForNotes.consultation_note} 
                  onBlur={(e) => handleInlineUpdate(selectedLeadForNotes.id, 'consultation_note', e.target.value)}
                  style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', width: '100%', border: '1px solid var(--glass-border)', padding: '1rem', color: 'white', borderRadius: '0.75rem' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Timeline chăm sóc</h4>
                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input 
                    className="cell-input" 
                    placeholder="Nhập nội dung tư vấn mới..." 
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem' }}
                  />
                  <button type="submit" className="login-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>Gửi</button>
                </form>

                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {leadNotes.map(note => (
                    <div key={note.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', borderLeft: '3px solid var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                        <span>{note.creator_name}</span>
                        <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                      <div>{note.content}</div>
                    </div>
                  ))}
                  {leadNotes.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5 }}>Chưa có lịch sử tư vấn.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note Tooltip */}
        {hoveredNote.id && (
          <div style={{ 
            position: 'fixed', top: hoveredNote.y + 20, left: hoveredNote.x, 
            background: '#1a1d21', border: '1px solid var(--secondary)', padding: '1rem', borderRadius: '1rem', 
            zIndex: 2000, maxWidth: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(251, 191, 36, 0.2)', paddingBottom: '0.25rem' }}>Ghi chú mới nhất</div>
            <div style={{ fontSize: '0.9rem', color: 'white' }}>{hoveredNote.content}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.5rem', textAlign: 'right' }}>Di chuột ra ngoài để đóng</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-view animate-fade-in" style={{ maxWidth: '800px' }}>
            <h2 className="section-title">Cấu hình kết nối Meta (Facebook)</h2>
            <div className="stat-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>App ID</label>
                  <input 
                    type="text" 
                    value={metaSettings.meta_app_id} 
                    onChange={(e) => setMetaSettings({...metaSettings, meta_app_id: e.target.value})} 
                    placeholder="Nhập Meta App ID..."
                  />
                </div>
                <div className="form-group">
                  <label>App Secret</label>
                  <input 
                    type="password" 
                    value={metaSettings.meta_app_secret} 
                    onChange={(e) => setMetaSettings({...metaSettings, meta_app_secret: e.target.value})} 
                    placeholder="Nhập App Secret..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Verify Token (Tự đặt)</label>
                  <input 
                    type="text" 
                    value={metaSettings.meta_verify_token} 
                    onChange={(e) => setMetaSettings({...metaSettings, meta_verify_token: e.target.value})} 
                    placeholder="Ví dụ: fittour_verify_2026"
                  />
                </div>
                <div className="form-group">
                  <label>Page ID</label>
                  <input 
                    type="text" 
                    value={metaSettings.meta_page_id} 
                    onChange={(e) => setMetaSettings({...metaSettings, meta_page_id: e.target.value})} 
                    placeholder="ID của Fanpage..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Page Access Token (Vĩnh viễn)</label>
                <textarea 
                  value={metaSettings.meta_page_access_token} 
                  onChange={(e) => {
                    setMetaSettings({...metaSettings, meta_page_access_token: e.target.value});
                    setMetaToken(e.target.value);
                  }} 
                  placeholder="Dán Long-lived Page Access Token ở đây..."
                  style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', padding: '1rem', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={handleUpdateSettings} 
                  disabled={loading}
                  className="login-btn" 
                  style={{ flex: 1 }}
                >
                  {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
                <button 
                  onClick={handleTestMeta} 
                  disabled={testLoading}
                  className="login-btn hover-glow" 
                  style={{ flex: 1, background: 'var(--secondary)', color: 'var(--primary)' }}
                >
                  {testLoading ? 'Đang kích hoạt...' : 'Kích hoạt & Đăng ký Webhook'}
                </button>
              </div>

              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--secondary)', fontSize: '0.85rem' }}>
                <strong>Lưu ý quan trọng:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.2rem' }}>
                  <li>Webhook URL: <code>https://{window.location.hostname}/api/webhook/facebook</code></li>
                  <li>Cần cài đặt Webhook trong Meta App Dashboard trước khi bấm Kích hoạt.</li>
                  <li>Hãy đảm bảo Page Token có quyền <code>pages_messaging</code> và <code>pages_manage_metadata</code>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* [Các tab Tours, Bookings tương tự...] */}
        {(activeTab === 'inbox') && (
          <div className="inbox-view" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 200px)', background: 'var(--card-bg)', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
             {/* Logic Inbox giữ nguyên... */}
             <div className="chat-list" style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Hội thoại</div>
              {conversations.map(conv => (
                <div key={conv.id} onClick={() => { setSelectedConv(conv); fetchMessages(conv.id); }} style={{ padding: '1.25rem', background: selectedConv?.id === conv.id ? 'rgba(251, 191, 36, 0.05)' : 'transparent', borderLeft: selectedConv?.id === conv.id ? '4px solid var(--secondary)' : '4px solid transparent', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 'bold' }}>{conv.lead_name || `Khách #${conv.external_id.substring(0,5)}`}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.last_message}</div>
                </div>
              ))}
            </div>
            {selectedConv ? (
              <div className="chat-window" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedConv.lead_name || 'Khách Facebook'}</span>
                  <button onClick={() => setActiveTab('leads')} style={{ color: 'var(--secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Chi tiết Lead</button>
                </div>
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ marginBottom: '1.25rem', textAlign: msg.sender_type === 'customer' ? 'left' : 'right' }}>
                      <div style={{ display: 'inline-block', padding: '0.85rem 1.25rem', background: msg.sender_type === 'customer' ? 'var(--primary-light)' : 'var(--secondary)', color: msg.sender_type === 'customer' ? 'white' : 'var(--primary)', borderRadius: '1.25rem', maxWidth: '75%' }}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="cell-input" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '0.75rem' }} />
                  <button type="submit" className="login-btn" style={{ width: 'auto' }}>Gửi</button>
                </form>
              </div>
            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-light)' }}>Chọn hội thoại để bắt đầu</div>}
          </div>
        )}
      </main>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast"><CheckCircle size={18} />{toast.message}</div>
        ))}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/deletion" element={<DataDeletion />} />
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/" /> : (
          <div className="login-container">
            <form className="login-form pulse-glow" onSubmit={handleLogin}>
              <div className="logo" style={{ justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--gold-glow)' }}>
                  <Map size={30} />
                </div>
                FIT TOUR
              </div>
              <h2>Đăng nhập hệ thống</h2>
              {error && <div className="error-msg">{error}</div>}
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" required value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" required value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
              </div>
              <button type="submit" className="login-btn">Đăng nhập</button>
              <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button type="button" onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}>
                  Chính sách bảo mật
                </button>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <button type="button" onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6 }}>
                    Điều khoản dịch vụ
                  </button>
                  <button type="button" onClick={() => navigate('/deletion')} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6 }}>
                    Xóa dữ liệu
                  </button>
                </div>
              </div>
            </form>
          </div>
        )} 
      />
      <Route 
        path="/" 
        element={isLoggedIn ? renderDashboard() : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
