import React from 'react';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
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
  guideTimelineData 
}) => {
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
      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setGuideActiveTab('list')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.9rem', color: guideActiveTab === 'list' ? '#6366f1' : '#94a3b8',
            borderBottom: guideActiveTab === 'list' ? '2px solid #6366f1' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          DANH SÁCH HDV
        </button>
        <button 
          onClick={() => { setGuideActiveTab('timeline'); fetchGuideTimeline(); }}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.9rem', color: guideActiveTab === 'timeline' ? '#6366f1' : '#94a3b8',
            borderBottom: guideActiveTab === 'timeline' ? '2px solid #6366f1' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          LỊCH GANTT (TIMELINE)
        </button>
      </div>

      {guideActiveTab === 'list' ? (
        <>
          <div className="filter-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px auto', gap: '1rem', alignItems: 'end' }}>
            <div className="filter-group">
              <label>DANH SÁCH HƯỚNG DẪN VIÊN</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  className="filter-input" 
                  style={{ width: '100%', paddingLeft: '36px' }} 
                  placeholder="Tìm tên, SĐT..." 
                  value={guideFilters.search} 
                  onChange={e => setGuideFilters({...guideFilters, search: e.target.value})} 
                />
              </div>
            </div>
            <div className="filter-group">
              <label>TRẠNG THÁI</label>
              <select className="filter-select" value={guideFilters.status} onChange={e => setGuideFilters({...guideFilters, status: e.target.value})}>
                <option value="">-- Tất cả --</option>
                <option value="Available">Sẵn sàng</option>
                <option value="Busy">Đang đi tour</option>
              </select>
            </div>
            <div className="filter-group">
              <label>NGÔN NGỮ</label>
              <select className="filter-select" value={guideFilters.language} onChange={e => setGuideFilters({...guideFilters, language: e.target.value})}>
                <option value="">-- Tất cả --</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Tiếng Pháp">Tiếng Pháp</option>
                <option value="Tiếng Nhật">Tiếng Nhật</option>
                <option value="Tiếng Trung">Tiếng Trung</option>
              </select>
            </div>
            <button className="btn-pro-save" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddGuideModal(true)}>
              <Plus size={18} strokeWidth={3} /> THÊM HDV MỚI
            </button>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>HỌ VÀ TÊN</th>
                  <th>LIÊN HỆ</th>
                  <th>ĐÁNH GIÁ</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {guides.filter(g => {
                  const matchesSearch = (g.name || '').toLowerCase().includes(guideFilters.search.toLowerCase()) || (g.phone || '').includes(guideFilters.search);
                  const matchesStatus = !guideFilters.status || g.status === guideFilters.status;
                  const matchesLang = !guideFilters.language || (g.languages || '').includes(guideFilters.language);
                  return matchesSearch && matchesStatus && matchesLang;
                }).map(guide => (
                  <tr key={guide.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {guide.name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{guide.phone}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{guide.email}</span>
                      </div>
                    </td>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800 }}>
                          <TrendingUp size={14} /> {guide.rating}
                        </div>
                    </td>
                    <td>
                      <div className={`status-badge badge-${guide.status === 'Available' ? 'won' : 'lost'}`}>
                        {guide.status === 'Available' ? 'Sẵn sàng' : guide.status}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="icon-btn-small btn-view" onClick={() => handleEditGuide(guide)} title="Sửa thông tin">
                          <Eye size={14} />
                        </button>
                        <button className="icon-btn-small btn-edit" onClick={() => handleEditGuide(guide)} title="Sửa thông tin">
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn-small btn-delete" onClick={() => handleDeleteGuide(guide.id)} title="Xóa">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>
              </div>
            )}

            {guideTimeFilter.type === 'long_period' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="date" 
                  className="filter-input" 
                  value={guideTimeFilter.startDate.toISOString().split('T')[0]} 
                  onChange={(e) => setGuideTimeFilter({ ...guideTimeFilter, startDate: new Date(e.target.value) })}
                />
                <ChevronRight size={16} color="#94a3b8" />
                <input 
                  type="date" 
                  className="filter-input" 
                  value={guideTimeFilter.endDate.toISOString().split('T')[0]} 
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
                const guideAssignments = guideTimelineData.filter(a => a.guide_id === guide.id);
                
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
                          const start = new Date(asg.start_date);
                          const end = new Date(asg.end_date);
                          
                          const startIndex = days.findIndex(d => d.toDateString() === start.toDateString());
                          const endIndex = days.findIndex(d => d.toDateString() === end.toDateString());
                          
                          if (startIndex === -1 && endIndex === -1) return null;
                          
                          const gridStart = startIndex === -1 ? 1 : startIndex + 1;
                          const gridEnd = endIndex === -1 ? days.length + 1 : endIndex + 2;
                          
                          return (
                            <div 
                              key={idx}
                              className={`gantt-bar gantt-bar-${asg.status.toLowerCase()}`}
                              style={{ 
                                gridColumn: `${gridStart} / ${gridEnd}`,
                                zIndex: 10
                              }}
                              title={`${asg.tour_name} (${asg.status})`}
                            >
                              <div className="gantt-bar-content">
                                <span className="gantt-bar-label">{asg.tour_name}</span>
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
