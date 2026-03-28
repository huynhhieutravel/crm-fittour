import React from 'react';
import { 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  User, 
  PieChart 
} from 'lucide-react';

const DashboardTab = ({ 
  leads, 
  setEditingLead 
}) => {
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
    </div>
  );
};

export default DashboardTab;
