import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  PieChart,
  Bell,
  CalendarCheck,
  User
} from 'lucide-react';
import axios from 'axios';

const DashboardTab = ({ 
  leads, 
  setEditingLead 
}) => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reminders/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (err) {
      console.error('Lỗi khi tải nhắc nhở:', err);
    }
  };

  const markReminderDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reminders/${id}/done`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const getReminderLabel = (type) => {
    switch(type) {
      case 'PREPARE_DOCS': return 'Nhắc chuẩn bị giấy tờ/Visa';
      case 'PAYMENT': return 'Nhắc thanh toán & Hành lý';
      case 'ITINERARY': return 'Gửi Lịch trình chi tiết';
      case 'FEEDBACK': return 'Xin Feedback chuyến đi';
      case 'REBOOK': return 'Chăm sóc / Gợi ý Upsell';
      default: return 'Nhắc nhở khác';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon-bg"><UserPlus size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">HỒ SƠ MỚI</span>
            <div className="stat-value">
              {leads.filter(l => l.status === 'Mới').length}
            </div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-bg"><MessageSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">ĐÃ LIÊN HỆ</span>
            <div className="stat-value">
              {leads.filter(l => l.status === 'Đã tư vấn' || l.status === 'Tư vấn lần 2').length}
            </div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon-bg"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">CHỐT ĐƠN</span>
            <div className="stat-value">
              {leads.filter(l => l.status === 'Chốt đơn').length}
            </div>
          </div>
        </div>
        <div 
          className="stat-card pink" 
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}
        >
          <div className="stat-icon-bg"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TỈ LỆ CHỐT ĐƠN</span>
            <div className="stat-value">
              {leads.length > 0 
                ? Math.round((leads.filter(l => l.status === 'Chốt đơn').length / leads.length) * 100) 
                : 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity Feed */}
        <div className="analytics-card">
          <h3><Clock size={20} color="#6366f1" /> Hoạt động gần đây</h3>
          <div className="activity-list">
            {leads.slice(0, 5).map(lead => (
              <div 
                key={lead.id} 
                className="activity-item" 
                onClick={() => { setEditingLead(lead); }}
              >
                <div 
                  className="activity-icon" 
                  style={{ background: lead.status === 'Chốt đơn' ? '#dcfce7' : '#f1f5f9' }}
                >
                  {lead.status === 'Chốt đơn' ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <User size={20} color="#64748b" />
                  )}
                </div>
                <div className="activity-details">
                  <div className="activity-name">{lead.name}</div>
                  <div className="activity-meta">
                    {lead.source} • {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className={`activity-status badge-${lead.status}`}>
                  {lead.status}
                </div>
              </div>
            ))}
            {leads.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Chưa có hoạt động nào.
              </div>
            )}
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="analytics-card">
          <h3><PieChart size={20} color="#f59e0b" /> Phân bổ nguồn khách</h3>
          <div className="source-distribution">
            {['Messenger', 'Zalo', 'Khách giới thiệu', 'Hotline'].map(source => {
              const count = leads.filter(l => l.source === source).length;
              const percent = leads.length > 0 ? (count / leads.length) * 100 : 0;
              const barColors = {
                'Messenger': '#3b82f6',
                'Zalo': '#2563eb',
                'Khách giới thiệu': '#10b981',
                'Hotline': '#f59e0b'
              };
              return (
                <div key={source} className="source-row">
                  <div className="source-info">
                    <span>{source}</span>
                    <span>{count} ({Math.round(percent)}%)</span>
                  </div>
                  <div className="source-bar-bg">
                    <div 
                      className="source-bar-fill" 
                      style={{ 
                        width: `${percent}%`, 
                        background: barColors[source] || '#64748b' 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="analytics-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={20} color="#f59e0b" /> Lịch Chăm Sóc Hôm Nay ⚡</h3>
          {reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '1rem' }}>
              Bạn đã hoàn thành mọi task chăm sóc hôm nay. Quá tuyệt vời! 🎉
            </div>
          ) : (
            <div className="activity-list" style={{ marginTop: '1rem' }}>
              {reminders.map(r => (
                <div key={r.id} className="activity-item" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="activity-icon" style={{ background: '#fef3c7', flexShrink: 0 }}>
                      <CalendarCheck size={20} color="#d97706" />
                    </div>
                    <div className="activity-details">
                      <div className="activity-name" style={{ color: '#0f172a', fontWeight: 'bold' }}>{getReminderLabel(r.type)}</div>
                      <div className="activity-meta" style={{ marginTop: '4px', lineHeight: '1.5' }}>
                        <strong style={{color:'#64748b'}}>Khách:</strong> {r.customer_name} ({r.customer_phone}) &nbsp;•&nbsp; <strong style={{color:'#64748b'}}>Tour:</strong> {r.tour_name} &nbsp;•&nbsp; <strong style={{color:'#64748b'}}>Code:</strong> {r.booking_code}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-pro-save" 
                    style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}
                    onClick={() => markReminderDone(r.id)}
                  >
                    Đã xong ✅
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
