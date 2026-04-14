import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Calendar,
  MapPin,
  CheckCircle
} from 'lucide-react';

const GuidesTab = ({ 
  guides, 
  guideFilters,
  setGuideFilters,
  guideActiveTab, 
  setGuideActiveTab, 
  fetchGuideTimeline, 
  setShowAddGuideModal, 
  handleEditGuide, 
  handleDeleteGuide, 
  guideTimeFilter, 
  setGuideTimeFilter, 
  guideTimelineData,
  guideStats,
  fetchGuideStats,
  hoveredNote,
  setHoveredNote,
  tourDepartures,
  handleEditDeparture
}) => {
  const [dashFilter, setDashFilter] = React.useState({ timeRange: 'this_month', startDate: '', endDate: '' });
  const [localStats, setLocalStats] = React.useState(null);

  React.useEffect(() => {
    if (guideActiveTab === 'dashboard') {
      let calcStart = '', calcEnd = '';
      const today = new Date();
      if (dashFilter.timeRange === 'all') {
         calcStart = '2000-01-01';
         calcEnd = '2100-12-31';
      } else if (dashFilter.timeRange === 'this_month') {
         calcStart = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
         calcEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString('en-CA');
      } else if (dashFilter.timeRange === 'next_month') {
         calcStart = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString('en-CA');
         calcEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0).toLocaleDateString('en-CA');
      } else if (dashFilter.timeRange === 'this_quarter') {
         const q = Math.floor(today.getMonth() / 3);
         calcStart = new Date(today.getFullYear(), q * 3, 1).toLocaleDateString('en-CA');
         calcEnd = new Date(today.getFullYear(), (q + 1) * 3, 0).toLocaleDateString('en-CA');
      } else if (dashFilter.timeRange === 'upcoming') {
         calcStart = new Date().toLocaleDateString('en-CA');
         calcEnd = new Date(today.setDate(today.getDate() + 30)).toLocaleDateString('en-CA');
      } else if (dashFilter.timeRange === 'custom') {
         if (dashFilter.startDate && dashFilter.endDate) {
           calcStart = dashFilter.startDate;
           calcEnd = dashFilter.endDate;
         }
      }
      
      if (calcStart && calcEnd) {
         try {
            const activeCount = guides ? guides.filter(g => g.status === 'Active').length : 0;
            const inRangeTours = tourDepartures ? tourDepartures.filter(td => {
                 if (!td.start_date) return false;
                 const sd = new Date(td.start_date).toLocaleDateString('en-CA');
                 return sd >= calcStart && sd <= calcEnd;
            }) : [];
            const tCount = inRangeTours.length;
            
            const gMap = {};
            inRangeTours.forEach(td => {
               if (td.guide_id) {
                  gMap[td.guide_id] = (gMap[td.guide_id] || 0) + 1;
               }
            });
            let cData = Object.keys(gMap).map(gid => {
               const gItem = guides.find(g => g.id === parseInt(gid));
               return {
                  name: gItem ? gItem.name : `HDV #${gid}`,
                  tours_count: gMap[gid]
               };
            }).sort((a,b) => b.tours_count - a.tours_count).slice(0, 15);
            
            setLocalStats({
               totalActiveGuides: activeCount,
               totalTours: tCount,
               chartData: cData
            });
         } catch(err) {
            setLocalStats({ error: err.message });
         }
      }
    }
  }, [guideActiveTab, dashFilter, guides, tourDepartures]);

  React.useEffect(() => {
    fetchGuideTimeline();
  }, [fetchGuideTimeline]);

  const getDaysInPeriod = (type, date, start, end) => {
    const days = [];
    let curr = new Date();
    let last = new Date();

    if (type === 'month') {
      curr = new Date(date.getFullYear(), date.getMonth(), 1);
      last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else if (type === 'quarter') {
      const q = Math.floor(date.getMonth() / 3);
      curr = new Date(date.getFullYear(), q * 3, 1);
      last = new Date(date.getFullYear(), (q + 1) * 3, 0);
    } else {
      curr = new Date(start);
      last = new Date(end);
    }

    const iter = new Date(curr);
    while (iter <= last) {
      days.push(new Date(iter));
      iter.setDate(iter.getDate() + 1);
    }
    return days;
  };

  return (
    <div className="animate-fade-in">


      {guideActiveTab === 'list' ? (
        <>
          <div className="filter-bar mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 130px 150px 150px 180px auto', gap: '1rem', alignItems: 'end' }}>
            <div className="filter-group">
              <label>DANH SÁCH HƯỚNG DẪN VIÊN</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  className="filter-input" 
                  style={{ width: '100%', paddingLeft: '36px' }} 
                  placeholder="Tìm tên, SĐT..." 
                  value={guideFilters.search || ''} 
                  onChange={e => setGuideFilters({...guideFilters, search: e.target.value})} 
                />
              </div>
            </div>
            <div className="filter-group">
              <label>TÌNH TRẠNG</label>
              <select className="filter-select" value={guideFilters.status || ''} onChange={e => setGuideFilters({...guideFilters, status: e.target.value})}>
                <option value="">-- Tất cả --</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Tạm nghỉ</option>
              </select>
            </div>
            <div className="filter-group">
              <label>GIAO VIỆC</label>
              <select className="filter-select" value={guideFilters.assignment || ''} onChange={e => setGuideFilters({...guideFilters, assignment: e.target.value})}>
                <option value="">-- Thuộc tính --</option>
                <option value="has_tour">Có tour đang/sắp chạy</option>
                <option value="no_tour">Đang rảnh / Chưa có tour</option>
              </select>
            </div>
            <div className="filter-group">
              <label>NGÔN NGỮ</label>
              <select className="filter-select" value={guideFilters.language || ''} onChange={e => setGuideFilters({...guideFilters, language: e.target.value})}>
                <option value="">-- Loại ngôn ngữ --</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Tiếng Pháp">Tiếng Pháp</option>
                <option value="Tiếng Nhật">Tiếng Nhật</option>
                <option value="Tiếng Trung">Tiếng Trung</option>
              </select>
            </div>
            <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddGuideModal(true)}>
              <Plus size={18} strokeWidth={3} /> THÊM MỚI
            </button>
          </div>
          <div className="data-table-container">
            <table className="data-table mt-4">
              <thead>
                <tr>
                  <th>HỌ VÀ TÊN</th>
                  <th>NGÔN NGỮ & LIÊN HỆ</th>
                  <th>TOUR ĐANG/SẮP CHẠY</th>
                  <th style={{ textAlign: 'center' }}>SỐ LƯỢT</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {guides.filter(g => {
                  const safeSearch = guideFilters.search || '';
                  const matchesSearch = (g.name || '').toLowerCase().includes(safeSearch.toLowerCase()) || (g.phone || '').includes(safeSearch);
                  const matchesLang = !guideFilters.language || (g.languages || '').includes(guideFilters.language);
                  const matchesStatus = !guideFilters.status || g.status === guideFilters.status;

                  let matchesAssignment = true;
                  if (guideFilters.assignment === 'has_tour') matchesAssignment = !!g.next_tour;
                  if (guideFilters.assignment === 'no_tour') matchesAssignment = !g.next_tour;

                  return matchesSearch && matchesStatus && matchesLang && matchesAssignment;
                }).map(guide => {
                  const now = new Date();
                  const isBusyWithTour = guide.next_tour && new Date(guide.next_tour.start_date) <= now && new Date(guide.next_tour.end_date) >= now;

                  return (
                  <tr key={guide.id} style={{ opacity: guide.status === 'Inactive' ? 0.6 : 1 }}>
                    <td 
                      style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', position: 'relative' }}
                      onMouseEnter={() => setHoveredNote && setHoveredNote(guide.id)}
                      onMouseLeave={() => setHoveredNote && setHoveredNote(null)}
                    >
                      {guide.name}
                      {guide.bio && (
                         <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', marginLeft: '6px', cursor: 'help' }}>i</div>
                      )}
                      {hoveredNote === guide.id && guide.bio && (
                        <div className="hover-note" style={{
                           position: 'absolute', top: '100%', left: 0, zIndex: 100,
                           background: 'white', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                           boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '250px',
                           fontSize: '0.8rem', fontWeight: 500, color: '#475569'
                        }}>
                          <strong>📝 Ghi chú / Tiểu sử:</strong><br/>
                          {guide.bio}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(guide.languages || '').split(',').map((l, i) => l.trim() && (
                            <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{l.trim()}</span>
                          ))}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{guide.phone}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{guide.email}</span>
                      </div>
                    </td>
                    <td>
                      {guide.next_tour ? (
                        <div style={{ background: '#fdf4ff', border: '1px solid #fbcfe8', padding: '0.5rem', borderRadius: '8px', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 700, color: '#be185d', fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                            <span style={{ lineHeight: '1.2' }}>{guide.next_tour.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#831843', fontWeight: 600 }}>
                            <Calendar size={12} /> 
                            {new Date(guide.next_tour.start_date).toLocaleDateString('vi-VN')} - {new Date(guide.next_tour.end_date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Chưa nhận lịch mới
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e0e7ff', color: '#4f46e5', minWidth: '28px', padding: '0 8px', height: '28px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem' }}>
                        {guide.total_tours || 0}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="icon-btn-small btn-edit" onClick={() => handleEditGuide(guide)} title="Xem & Sửa thông tin">
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn-small btn-delete" onClick={() => handleDeleteGuide(guide.id)} title="Xóa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : guideActiveTab === 'dashboard' ? (
        <div className="animate-fade-in">
          {/* Dashboard Timeline Controls Duplicate */}
          <div className="gantt-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>THỜI GIAN KHỞI HÀNH:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'this_month', label: 'Tháng này' },
                { id: 'next_month', label: 'Tháng sau' },
                { id: 'this_quarter', label: 'Quý này' },
                { id: 'upcoming', label: 'Sắp tới (30 ngày)' }
              ].map(p => (
                <button 
                  key={p.id} 
                  className={`preset-btn ${(dashFilter.timeRange === p.id && !dashFilter.startDate && !dashFilter.endDate) ? 'active' : ''}`} 
                  onClick={() => setDashFilter({...dashFilter, timeRange: p.id, startDate: '', endDate: ''})}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #e2e8f0',
                    background: dashFilter.timeRange === p.id && !dashFilter.startDate ? '#3b82f6' : 'white',
                    color: dashFilter.timeRange === p.id && !dashFilter.startDate ? 'white' : '#475569'
                  }}
                >
                  {p.label}
                </button>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
                <input type="date" className="filter-input" style={{ padding: '8px 12px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={dashFilter.startDate || ''} onChange={e => setDashFilter({...dashFilter, timeRange: 'custom', startDate: e.target.value})} />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input type="date" className="filter-input" style={{ padding: '8px 12px', height: '38px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={dashFilter.endDate || ''} onChange={e => setDashFilter({...dashFilter, timeRange: 'custom', endDate: e.target.value})} />
              </div>
            </div>
          </div>

          {localStats && localStats.error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
              🔴 Lỗi Tính Toán: {localStats.error}.
            </div>
          )}
          {(!localStats || JSON.stringify(localStats) === '{}') && (
            <div style={{ padding: '1rem', background: '#fef3c7', color: '#b45309', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
              ⚠️ Đang lọc dữ liệu từ Local...
            </div>
          )}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="stat-card" style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', padding: '1.5rem', borderRadius: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginBottom: '8px' }}>TỔNG HDV ACTIVE</div>
              <div style={{ fontSize: '2rem', fontWeight: 900 }}>{localStats?.totalActiveGuides !== undefined ? localStats.totalActiveGuides : '-'}</div>
            </div>
            <div className="stat-card" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white', padding: '1.5rem', borderRadius: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginBottom: '8px' }}>TOUR TRONG KỲ NÀY</div>
              <div style={{ fontSize: '2rem', fontWeight: 900 }}>{localStats?.totalTours !== undefined ? localStats.totalTours : '-'}</div>
            </div>
            <div className="stat-card" style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', padding: '1.5rem', borderRadius: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, marginBottom: '8px' }}>SỐ TOUR CAO NHẤT (1 HDV)</div>
              <div style={{ fontSize: '2rem', fontWeight: 900 }}>
                {localStats?.chartData?.length > 0 ? (
                  <>{localStats.chartData[0].tours_count}</>
                ) : '-'}
              </div>
            </div>
          </div>

          <div className="analytics-card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1e293b' }}>
                KHỐI LƯỢNG CÔNG VIỆC THEO HƯỚNG DẪN VIÊN
             </h3>
             <div style={{ height: '500px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart 
                     data={localStats ? localStats.chartData : []}
                     margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis 
                       dataKey="name" 
                       tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                       axisLine={false}
                       tickLine={false}
                       interval={0}
                       angle={-45}
                       textAnchor="end"
                     />
                     <YAxis 
                       tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                       axisLine={false}
                       tickLine={false}
                       allowDecimals={false}
                     />
                     <RechartsTooltip 
                       cursor={{ fill: '#f1f5f9' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                       labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                     />
                     <Bar dataKey="tours_count" name="Số lượng Tour" radius={[6, 6, 0, 0]}>
                        {localStats && Array.isArray(localStats.chartData) && localStats.chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={`url(#colorG${index % 3})`} />
                        ))}
                     </Bar>
                     <defs>
                        <linearGradient id="colorG0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0.9}/>
                        </linearGradient>
                        <linearGradient id="colorG1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.9}/>
                        </linearGradient>
                        <linearGradient id="colorG2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.9}/>
                        </linearGradient>
                     </defs>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Timeline Controls */}
          <div className="gantt-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            <div className="gantt-view-toggle" style={{ margin: 0 }}>
              {[
                { id: 'month', label: 'THÁNG' },
                { id: 'quarter', label: 'QUÝ' },
                { id: 'long_period', label: 'DÀI NGÀY' }
              ].map(v => (
                <button 
                  key={v.id} 
                  className={`gantt-view-btn ${guideTimeFilter.type === v.id ? 'active' : ''}`}
                  onClick={() => setGuideTimeFilter({ ...guideTimeFilter, type: v.id })}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {guideTimeFilter.type === 'month' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="gantt-nav-btn" onClick={() => {
                  const d = new Date(guideTimeFilter.date);
                  d.setMonth(d.getMonth() - 1);
                  setGuideTimeFilter({ ...guideTimeFilter, date: d });
                }}><ChevronLeft size={18} /></button>
                <span style={{ fontWeight: 800, color: '#1e293b', minWidth: '150px', textAlign: 'center' }}>
                  Tháng {guideTimeFilter.date.getMonth() + 1}, {guideTimeFilter.date.getFullYear()}
                </span>
                <button className="gantt-nav-btn" onClick={() => {
                  const d = new Date(guideTimeFilter.date);
                  d.setMonth(d.getMonth() + 1);
                  setGuideTimeFilter({ ...guideTimeFilter, date: d });
                }}><ChevronRight size={18} /></button>
              </div>
            )}

            {guideTimeFilter.type === 'quarter' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select 
                  className="filter-select" 
                  style={{ width: '100px' }}
                  value={Math.floor(guideTimeFilter.date.getMonth() / 3)}
                  onChange={(e) => {
                    const d = new Date(guideTimeFilter.date);
                    d.setMonth(parseInt(e.target.value) * 3);
                    setGuideTimeFilter({ ...guideTimeFilter, date: d });
                  }}
                >
                  <option value="0">Quý 1</option>
                  <option value="1">Quý 2</option>
                  <option value="2">Quý 3</option>
                  <option value="3">Quý 4</option>
                </select>
                <select 
                  className="filter-select" 
                  style={{ width: '100px' }}
                  value={guideTimeFilter.date.getFullYear()}
                  onChange={(e) => {
                    const d = new Date(guideTimeFilter.date);
                    d.setFullYear(parseInt(e.target.value));
                    setGuideTimeFilter({ ...guideTimeFilter, date: d });
                  }}
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 1 + i).map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>
              </div>
            )}

            {guideTimeFilter.type === 'long_period' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="date" 
                  className="filter-input" 
                  value={guideTimeFilter.startDate ? new Date(guideTimeFilter.startDate).toLocaleDateString('en-CA') : ''} 
                  onChange={(e) => setGuideTimeFilter({ ...guideTimeFilter, startDate: new Date(e.target.value) })}
                />
                <ChevronRight size={16} color="#94a3b8" />
                <input 
                  type="date" 
                  className="filter-input" 
                  value={guideTimeFilter.endDate ? new Date(guideTimeFilter.endDate).toLocaleDateString('en-CA') : ''} 
                  onChange={(e) => setGuideTimeFilter({ ...guideTimeFilter, endDate: new Date(e.target.value) })}
                />
              </div>
            )}
            
            <button className="gantt-nav-btn" style={{ marginLeft: 'auto', width: 'auto', padding: '0 1rem' }} onClick={() => setGuideTimeFilter({ ...guideTimeFilter, date: new Date(), type: 'month' })}>HÔM NAY</button>
          </div>

          <div className="gantt-container" style={{ '--gantt-columns': getDaysInPeriod(guideTimeFilter.type, guideTimeFilter.date, guideTimeFilter.startDate, guideTimeFilter.endDate).length }}>
            <div className="gantt-header-row">
              <div className="gantt-sidebar-header">PHÒNG / CA</div>
              <div className="gantt-time-grid">
                {(() => {
                  const days = getDaysInPeriod(guideTimeFilter.type, guideTimeFilter.date, guideTimeFilter.startDate, guideTimeFilter.endDate);
                  const headerGroups = [];

                  if (guideTimeFilter.type === 'month') {
                    const weekRanges = [
                      { start: 1, end: 7, label: 'TUẦN 1' },
                      { start: 8, end: 14, label: 'TUẦN 2' },
                      { start: 15, end: 21, label: 'TUẦN 3' },
                      { start: 22, end: 28, label: 'TUẦN 4' },
                      { start: 29, end: 31, label: 'TUẦN 5' }
                    ];
                    weekRanges.forEach((range, idx) => {
                      const weekDays = days.filter(d => d.getDate() >= range.start && d.getDate() <= range.end);
                      if (weekDays.length > 0) {
                        headerGroups.push({
                          label: range.label,
                          subLabel: `${weekDays[0].getDate().toString().padStart(2, '0')} - ${weekDays[weekDays.length - 1].getDate().toString().padStart(2, '0')}`,
                          span: weekDays.length
                        });
                      }
                    });
                  } else {
                    let lastHeaderKey = '';
                    let currentSpan = 0;
                    let firstDateInMonth = null;
                    
                    days.forEach((day, idx) => {
                      const headerKey = `${day.getFullYear()}-${day.getMonth()}`;
                      if (headerKey !== lastHeaderKey) {
                        if (lastHeaderKey !== '') {
                          headerGroups.push({
                            label: `THÁNG ${firstDateInMonth.getMonth() + 1}`,
                            subLabel: `NĂM ${firstDateInMonth.getFullYear()}`,
                            span: currentSpan
                          });
                        }
                        lastHeaderKey = headerKey;
                        currentSpan = 1;
                        firstDateInMonth = day;
                      } else {
                        currentSpan++;
                      }

                      if (idx === days.length - 1) {
                        headerGroups.push({
                          label: `THÁNG ${day.getMonth() + 1}`,
                          subLabel: `NĂM ${day.getFullYear()}`,
                          span: currentSpan
                        });
                      }
                    });
                  }

                  return headerGroups.map((group, idx) => (
                    <div 
                      key={idx} 
                      className="gantt-header-group" 
                      style={{ 
                        gridColumn: `span ${group.span}`,
                        borderLeft: idx > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 0'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{group.label}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 500 }}>{group.subLabel}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
            
            <div className="gantt-time-grid-subheader">
              <div className="gantt-sidebar-header">HƯỚNG DẪN VIÊN</div>
              <div className="gantt-time-grid" style={{ height: 'auto', background: '#f8fafc' }}>
                {getDaysInPeriod(guideTimeFilter.type, guideTimeFilter.date, guideTimeFilter.startDate, guideTimeFilter.endDate).map((day, idx) => (
                  <div key={idx} className="gantt-time-cell" style={{ 
                    height: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.65rem', 
                    fontWeight: 800,
                    color: day.getDay() === 0 || day.getDay() === 6 ? '#ef4444' : '#64748b',
                    background: day.toDateString() === new Date().toDateString() ? '#fef9c3' : 'transparent',
                    borderLeft: '1px solid #e2e8f0'
                  }}>
                    {day.getDate()}
                  </div>
                ))}
              </div>
            </div>

            <div className="gantt-body">
              {guides.map(guide => {
                const days = getDaysInPeriod(guideTimeFilter.type, guideTimeFilter.date, guideTimeFilter.startDate, guideTimeFilter.endDate);
                const myData = guideTimelineData.find(d => d.id === guide.id);
                const guideAssignments = myData ? myData.assignments : [];
                
                return (
                  <div key={guide.id} className="gantt-row">
                    <div className="gantt-guide-cell">
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                           {guide.name.charAt(0)}
                         </div>
                         <div style={{ overflow: 'hidden' }}>
                           <div style={{ fontWeight: 800, fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guide.name}</div>
                           <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{guide.languages}</div>
                         </div>
                       </div>
                    </div>
                    <div className="gantt-content-cell">
                      <div className="gantt-time-grid" style={{ position: 'relative', height: '100%' }}>
                        {guideAssignments.map((asg, idx) => {
                          const start = new Date(asg.start);
                          const end = new Date(asg.end);
                          
                          const startIndex = days.findIndex(d => d.toDateString() === start.toDateString());
                          const endIndex = days.findIndex(d => d.toDateString() === end.toDateString());
                          
                          if (startIndex === -1 && endIndex === -1) return null;
                          
                          const gridStart = startIndex === -1 ? 1 : startIndex + 1;
                          const gridEnd = endIndex === -1 ? days.length + 1 : endIndex + 2;
                          const isMice = asg.source === 'mice';
                          
                          return (
                            <div 
                              key={idx}
                              className={`gantt-bar ${isMice ? 'gantt-bar-mice' : `gantt-bar-${(asg.status || 'draft').toLowerCase()}`}`}
                              style={{ 
                                gridColumn: `${gridStart} / ${gridEnd}`,
                                zIndex: 10,
                                cursor: isMice ? 'default' : 'pointer',
                                ...(isMice ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderColor: '#b45309' } : {})
                              }}
                              onClick={() => {
                                if (isMice) return;
                                const dep = tourDepartures.find(d => d.id === asg.id);
                                if (dep && handleEditDeparture) handleEditDeparture(dep);
                              }}
                            >
                              <div className="gantt-bar-content">
                                <span className="gantt-bar-label">{asg.tourName}</span>
                              </div>
                              <div className="gantt-tooltip">
                                <div style={{ fontWeight: 800, marginBottom: '6px', fontSize: '0.8rem', color: isMice ? '#f59e0b' : '#60a5fa' }}>
                                  {isMice ? '🏢 TOUR ĐOÀN (MICE)' : (asg.status || 'N/A').toUpperCase()}
                                </div>
                                <div style={{ fontWeight: 600, marginBottom: '6px' }}>{asg.tourName}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                  <span style={{ color: '#cbd5e1' }}>Khởi hành: </span> 
                                  {start.toLocaleDateString('vi-VN')} - {end.toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidesTab;
