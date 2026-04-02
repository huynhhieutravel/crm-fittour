import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, Clock, CalendarClock, PhoneOutgoing, MessageCircle, AlertTriangle, AlertCircle, RefreshCw, Eye, ChevronDown, ChevronRight, Search } from 'lucide-react';

const RemindersTab = ({ handleViewDeparture }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [progressFilter, setProgressFilter] = useState('ALL');
  const [expandedGroups, setExpandedGroups] = useState({});

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reminders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
      
      // Auto-expand all by default initially
      const initialExp = {};
      const grouped = groupReminders(res.data);
      Object.keys(grouped).forEach(k => initialExp[k] = true);
      setExpandedGroups(initialExp);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/reminders/${id}/done`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const getReminderLabel = (r) => {
    if (r.custom_title) return r.custom_title;
    switch(r.type) {
      case 'PREPARE_DOCS': return 'Nhắc chuẩn bị giấy tờ/Visa';
      case 'PAYMENT': return 'Thanh toán & Hành lý';
      case 'ITINERARY': return 'Gửi Lịch trình chi tiết';
      case 'FEEDBACK': return 'Hỏi thăm / Xin Feedback';
      case 'REBOOK': return 'Gợi ý Tour tương tự / Upsell';
      default: return r.type;
    }
  };

  const uniqueAssignees = Array.from(new Set(reminders.map(r => r.staff_name).filter(Boolean)));

  // Grouping logic
  const groupReminders = (data) => {
    const acc = {};
    data.forEach(r => {
      // Apply Filter first
      if (filter === 'PENDING' && r.status !== 'PENDING') return;
      if (filter === 'COMPLETED' && r.status !== 'COMPLETED') return;
      if (filter === 'OVERDUE' && (r.status === 'COMPLETED' || !r.due_date || new Date(r.due_date) >= new Date(new Date().setHours(0,0,0,0)))) return;
      
      if (searchQuery && (!r.tour_name || !r.tour_name.toLowerCase().includes(searchQuery.toLowerCase()))) return;
      
      if (assigneeFilter === 'UNASSIGNED' && r.staff_name) return;
      if (assigneeFilter !== 'ALL' && assigneeFilter !== 'UNASSIGNED' && r.staff_name !== assigneeFilter) return;

      if (timeRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let keep = true;
        
        if (r.due_date) {
            const due = new Date(r.due_date);
            due.setHours(0, 0, 0, 0);
            
            if (timeRange === 'today') {
               keep = due.getTime() === today.getTime();
            } else if (timeRange === 'week') {
               const dayOfWeek = today.getDay();
               const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
               const monday = new Date(today.setDate(diffToMonday));
               const sunday = new Date(monday);
               sunday.setDate(monday.getDate() + 6);
               keep = due >= monday && due <= sunday;
            } else if (timeRange === 'month') {
               keep = due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
            } else if (timeRange === 'custom' && startDate && endDate) {
               const start = new Date(startDate);
               start.setHours(0,0,0,0);
               const end = new Date(endDate);
               end.setHours(23,59,59,999);
               keep = due >= start && due <= end;
            }
        } else {
            keep = false; // If filtering by due date, no due date drops it
        }
        if (!keep) return;
      }
      
      const key = r.tour_departure_id;
      if (!acc[key]) {
        acc[key] = {
           tour_departure_id: key,
           tour_name: r.tour_name,
           tour_code: r.tour_code,
           tour_start_date: r.tour_start_date,
           total_pax: r.total_pax,
           reminders: [],
           completedCount: 0,
           totalCount: 0
        };
      }
      acc[key].reminders.push(r);
      acc[key].totalCount++;
      if (r.status === 'COMPLETED') acc[key].completedCount++;
    });
    return acc;
  };

  let groupedData = Object.values(groupReminders(reminders));
  // Apply progress filter on the generated groups
  if (progressFilter === 'INCOMPLETE') {
      groupedData = groupedData.filter(g => g.completedCount < g.totalCount);
  } else if (progressFilter === 'COMPLETED') {
      groupedData = groupedData.filter(g => g.completedCount === g.totalCount && g.totalCount > 0);
  }

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={24} color="#6366f1" /> Bảng Theo Dõi Chăm Sóc Khách (Tour Care)
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              Quét nhanh độ trễ tiến độ thủ tục, giấy tờ, checklist của từng đoàn.
            </p>
          </div>
          <button onClick={fetchReminders} style={{ padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
             <RefreshCw size={16} /> Làm mới
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
           <div style={{ position: 'relative' }}>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>TÌM KIẾM THEO TOUR</label>
             <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', bottom: '10px' }} />
             <input type="text" placeholder="Tìm tên Lịch khởi hành..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }} />
           </div>
           
           <div>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>TRẠNG THÁI TASK</label>
             <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
               <option value="ALL">-- Tất Cả Trạng Thái --</option>
               <option value="PENDING">🕒 Chờ Xử Lý</option>
               <option value="OVERDUE">⚠️ Đã Quá Hạn</option>
               <option value="COMPLETED">✅ Đã Hoàn Tất</option>
             </select>
           </div>
           
           <div>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>NGƯỜI PHỤ TRÁCH</label>
             <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
               <option value="ALL">-- Tất cả nhân sự --</option>
               <option value="UNASSIGNED">Chưa phân công (Mồ côi)</option>
               {uniqueAssignees.map(u => <option key={u} value={u}>{u}</option>)}
             </select>
           </div>
           
           <div>
             <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>TIẾN ĐỘ CHUNG (TOUR)</label>
             <select value={progressFilter} onChange={(e) => setProgressFilter(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
               <option value="ALL">-- Tất cả Tiến độ --</option>
               <option value="INCOMPLETE">Đang chạy (Chưa hoàn tất)</option>
               <option value="COMPLETED">Đã đóng sổ (Xong 100%)</option>
             </select>
           </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>HẠN CHÓT (DUE DATE):</span>
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' },
            { id: 'all', label: 'Tất cả' }
          ].map(p => (
             <button title={`Lọc các Task theo thời hạn: ${p.label}`} key={p.id} onClick={() => { setTimeRange(p.id); setStartDate(''); setEndDate(''); }} style={{ padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: (timeRange === p.id && !startDate && !endDate) ? '#3b82f6' : 'transparent', color: (timeRange === p.id && !startDate && !endDate) ? 'white' : '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {p.label}
             </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
             <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
             <input type="date" value={startDate} onChange={e => { setTimeRange('custom'); setStartDate(e.target.value); }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', height: '28px', outline: 'none' }} />
             <span style={{ color: '#94a3b8' }}>-</span>
             <input type="date" value={endDate} onChange={e => { setTimeRange('custom'); setEndDate(e.target.value); }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', height: '28px', outline: 'none' }} />
          </div>
          
          <div style={{ marginLeft: 'auto', background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px', fontWeight: 600, color: '#475569' }}>
            Hiển thị {groupedData.length} Lịch khởi hành
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'white', borderRadius: '10px' }}>Đang tải danh sách Nhắc nhở...</div>
        ) : groupedData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '10px' }}>Chưa có lịch trình nào cần chăm sóc.</div>
        ) : (
          groupedData.map(group => {
            const isExpanded = expandedGroups[group.tour_departure_id] !== false;
            const isAllDone = group.completedCount === group.totalCount;

            return (
              <div key={group.tour_departure_id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.2s' }}>
                
                {/* GROUP HEADER */}
                <div 
                  onClick={() => toggleGroup(group.tour_departure_id)}
                  style={{ 
                    padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                    background: isAllDone ? '#f8fafc' : '#ffffff', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: '#cbd5e1' }}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>{group.tour_name}</div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '6px' }}>{new Date(group.tour_start_date).toLocaleDateString('vi-VN')}</div>
                         {group.tour_code && <div style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '6px' }}>{group.tour_code}</div>}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                         Tổng số {group.total_pax || 0} khách trên tuyến này.
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                     <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isAllDone ? '#10b981' : '#f59e0b' }}>
                           TIẾN ĐỘ: {group.completedCount}/{group.totalCount} HOÀN TẤT
                        </div>
                        <div style={{ width: '120px', height: '6px', background: '#e2e8f0', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                           <div style={{ width: `${(group.completedCount / group.totalCount) * 100}%`, height: '100%', background: isAllDone ? '#10b981' : '#f59e0b', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                        </div>
                     </div>
                     <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDeparture(group);
                        }}
                        style={{ padding: '8px 16px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                        title="Vào sửa chi tiết Lịch khởi hành"
                      >
                        <Eye size={16} /> VÀO KHOANG TOUR
                      </button>
                  </div>
                </div>

                {/* GROUP ITEMS */}
                {isExpanded && (
                  <div style={{ padding: '16px 20px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {group.reminders.map(r => {
                         const isOverdue = r.status === 'PENDING' && new Date(r.due_date) < new Date(new Date().setHours(0,0,0,0));
                         
                         return (
                           <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: r.status === 'COMPLETED' ? '#ffffff' : '#ffffff', border: '1px solid', borderColor: r.status === 'COMPLETED' ? '#f1f5f9' : '#e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                               <div 
                                 onClick={() => handleMarkDone(r.id)}
                                 style={{ width: '22px', height: '22px', borderRadius: '6px', border: '2px solid', borderColor: r.status === 'COMPLETED' ? '#10b981' : '#cbd5e1', background: r.status === 'COMPLETED' ? '#10b981' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: r.status === 'PENDING' ? 'pointer' : 'default' }}
                               >
                                 {r.status === 'COMPLETED' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                               </div>
                               <div>
                                 <div style={{ fontSize: '0.95rem', fontWeight: 700, color: r.status === 'COMPLETED' ? '#94a3b8' : '#334155', textDecoration: r.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                                   {getReminderLabel(r)}
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                                    <span style={{ color: isOverdue ? '#ef4444' : 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Hạn chót: {new Date(r.due_date).toLocaleDateString('vi-VN')} {isOverdue && '(Quá hạn)'}</span>
                                    <span>•</span>
                                    <span>Phụ trách: {r.staff_name || 'Chưa gán'}</span>
                                 </div>
                               </div>
                             </div>
                             
                             {r.status === 'COMPLETED' ? (
                               <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '4px 10px', borderRadius: '20px' }}>Đã Hoàn Tất</span>
                             ) : (
                               <button 
                                 onClick={() => handleMarkDone(r.id)}
                                 style={{ padding: '6px 14px', background: '#1e293b', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                 onMouseEnter={(e) => { e.currentTarget.style.background = '#0f172a'; }}
                                 onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; }}
                               >
                                 Hoàn Tất Nhắc Nhở
                               </button>
                             )}
                           </div>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RemindersTab;
