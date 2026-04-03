import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  PieChart as PieChartIcon,
  Bell,
  CalendarCheck,
  User,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const DashboardTab = ({ 
  leads, 
  setEditingLead 
}) => {
  const [reminders, setReminders] = useState([]);
  const [overview, setOverview] = useState(null);
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [dateFilter]);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      let params = new URLSearchParams();
      
      const now = new Date();
      let start, end;
      switch(dateFilter) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0,0,0,0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23,59,59,999);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          break;
        case 'all':
        default:
          // Không set start/end → API trả toàn bộ data all-time
          break;
      }

      if (start && end) {
        params.append('startDate', start.toISOString()); // Backend matches ISO strings nicely
        params.append('endDate', end.toISOString());
      }

      const res = await axios.get(`/api/dashboard/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOverview(res.data);
    } catch (err) {
      console.error('Lỗi khi tải tổng quan:', err);
    }
  };

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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="animate-fade-in">
      {/* Global Filter Bar */}
      <div className="executive-filter-panel mb-12">
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row">
            <div className="segmented-control glass text-white">
              {['today', 'week', 'month', 'year', 'all'].map(f => (
                 <button
                   key={f}
                   onClick={() => setDateFilter(f)}
                   className={`segment-btn ${dateFilter === f ? 'active' : ''}`}
                 >
                   {f === 'today' ? 'Hôm nay' : f === 'week' ? 'Tuần này' : f === 'month' ? 'Tháng này' : f === 'year' ? 'Năm nay' : 'Tất cả'}
                 </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card purple" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="stat-icon-bg"><DollarSign size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TỔNG DOANH THU</span>
            <div className="stat-value">
              {(overview?.stats?.total_revenue || 0).toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon-bg"><UserPlus size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">HỒ SƠ MỚI</span>
            <div className="stat-value">
              {overview?.stats?.new_leads || 0}
            </div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon-bg"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">CHỐT ĐƠN</span>
            <div className="stat-value">
              {overview?.stats?.won_leads || 0}
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
              {overview?.stats?.total_leads > 0 
                ? Math.round((overview.stats.won_leads / overview.stats.total_leads) * 100) 
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
        <div className="analytics-card flex flex-col justify-between" style={{ minHeight: '350px' }}>
          <div>
            <h3><PieChartIcon size={20} color="#f59e0b" /> Phân bổ nguồn khách</h3>
            <p className="card-subtitle mt-1 text-slate-400 text-sm">Thống kê tự động theo kênh tiếp cận</p>
          </div>
          <div style={{ height: "280px", width: "100%", marginTop: "1rem" }}>
            {overview?.sourceDistribution && overview.sourceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.sourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="source"
                    labelLine={false}
                  >
                    {overview.sourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                       const total = overview.stats.total_leads;
                       const percent = total > 0 ? ((value/total)*100).toFixed(1) : 0;
                       return [`${value} lead (${percent}%)`, name];
                    }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
                Không có dữ liệu nguồn khách
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="analytics-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={20} color="#f59e0b" /> Lịch Chăm sóc Hôm nay ⚡</h3>
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
      <style>{`
        .executive-filter-panel {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 40;
          padding: 1rem;
        }
        .filter-scroll-container {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filter-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .horizontal-filter-row {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          min-width: max-content;
          justify-content: flex-start;
          width: 100%;
        }
        .segmented-control.glass {
          display: flex;
          background: #f8fafc;
          padding: 5px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
          gap: 4px;
        }
        .segment-btn {
          padding: 7px 15px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          border-radius: 10px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        .segment-btn:hover {
          color: #6366f1;
          background: rgba(255, 255, 255, 0.6);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
        }
        .segment-btn.active {
          color: #ffffff;
          background: #6366f1;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        }
      `}</style>
    </div>
  );
};

export default DashboardTab;
