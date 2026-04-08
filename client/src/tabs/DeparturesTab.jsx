import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Search, 
  PlusCircle,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Eye
} from 'lucide-react';

const DeparturesTab = ({ 
  tourDepartures, 
  tourFilters, 
  setTourFilters, 
  setShowAddDepartureModal,
  handleEditDeparture,
  handleDeleteDeparture,
  handleDuplicateDeparture,
  handleUpdateDeparture,
  handleViewDeparture,
  handleViewBookingsForDeparture,
  guides,
  currentUser
}) => {
  const [hoveredNotePath, setHoveredNotePath] = useState(null);

  const getDisplayPrice = (dep) => {
    if (dep.price_rules && dep.price_rules.length > 0) {
      const defaultPrice = dep.price_rules.find(r => r.is_default);
      return defaultPrice ? defaultPrice.price : dep.price_rules[0].price;
    }
    return dep.actual_price || 0;
  };

  const filteredDepartures = tourDepartures.filter(d => {
    // 1. Search
    if (tourFilters.search) {
      const searchTerms = tourFilters.search.toLowerCase();
      if (!(d.template_name || '').toLowerCase().includes(searchTerms) && 
          !(d.code || '').toLowerCase().includes(searchTerms)) {
        return false;
      }
    }
    // 2. Status
    if (tourFilters.status && d.status !== tourFilters.status) return false;
    // 3. Guide
    if (tourFilters.guide_id && String(d.guide_id) !== String(tourFilters.guide_id)) return false;
    
    // 4. Time range
    const depDate = new Date(d.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tourFilters.timeRange === 'this_month') {
      if (depDate.getMonth() !== today.getMonth() || depDate.getFullYear() !== today.getFullYear()) return false;
    } else if (tourFilters.timeRange === 'next_month') {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      if (depDate.getMonth() !== nextMonth.getMonth() || depDate.getFullYear() !== nextMonth.getFullYear()) return false;
    } else if (tourFilters.timeRange === 'this_quarter') {
      const quarter = Math.floor(today.getMonth() / 3);
      const depQuarter = Math.floor(depDate.getMonth() / 3);
      if (quarter !== depQuarter || depDate.getFullYear() !== today.getFullYear()) return false;
    } else if (tourFilters.timeRange === 'upcoming') {
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      if (depDate < today || depDate > thirtyDaysFromNow) return false;
    } else if (tourFilters.timeRange === 'custom') {
      if (tourFilters.startDate && depDate < new Date(tourFilters.startDate)) return false;
      if (tourFilters.endDate && depDate > new Date(tourFilters.endDate)) return false;
    }
    
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card purple">
          <div className="stat-icon-bg"><Calendar size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TOUR SẮP KHỞI HÀNH</span>
            <div className="stat-value">
              {tourDepartures.filter(d => new Date(d.start_date) > new Date()).length}
            </div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon-bg"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">LOAD FACTOR TB</span>
            <div className="stat-value">
              {tourDepartures.length > 0 
                ? Math.round(tourDepartures.reduce((acc, d) => acc + (d.sold_pax / (d.max_participants || 1) * 100), 0) / tourDepartures.length) 
                : 0}%
            </div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-bg"><UserCheck size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">TOUR ĐÃ CHỐT (GUARANTEED)</span>
            <div className="stat-value">
              {tourDepartures.filter(d => d.status === 'Chắc chắn đi').length}
            </div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                className="filter-input" 
                style={{ width: '100%', paddingLeft: '36px' }} 
                placeholder="Tìm tên tour, mã code..." 
                value={tourFilters.search} 
                onChange={e => setTourFilters({...tourFilters, search: e.target.value})} 
              />
            </div>
          </div>
          <div className="filter-group">
            <label>TRẠNG THÁI</label>
            <select className="filter-select" value={tourFilters.status || ''} onChange={e => setTourFilters({...tourFilters, status: e.target.value})}>
              <option value="">-- Tất cả trạng thái --</option>
              <option value="Mở bán">Mở bán</option>
              <option value="Chắc chắn đi">Chắc chắn đi</option>
              <option value="Đã đầy">Đã đầy</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Huỷ">Huỷ</option>
            </select>
          </div>
          <div className="filter-group">
            <label>HƯỚNG DẪN VIÊN</label>
            <select className="filter-select" value={tourFilters.guide_id || ''} onChange={e => setTourFilters({...tourFilters, guide_id: e.target.value})}>
              <option value="">-- Tất cả HDV --</option>
              {guides?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <button 
            className="login-btn" 
            style={{ 
              width: 'auto', 
              height: '42px', 
              padding: '0 1.5rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              background: '#2563eb', 
              color: 'white', 
              fontWeight: '800',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }} 
            onClick={() => setShowAddDepartureModal(true)}
          >
            <PlusCircle size={18} strokeWidth={3} /> <span style={{ letterSpacing: '0.5px' }}>LÊN LỊCH KHỞI HÀNH</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN KHỞI HÀNH:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'this_month', label: 'Tháng này' },
            { id: 'next_month', label: 'Tháng sau' },
            { id: 'this_quarter', label: 'Quý này' },
            { id: 'upcoming', label: 'Sắp tới (30 ngày)' }
          ].map(p => (
            <button key={p.id} className={`preset-btn ${(tourFilters.timeRange === p.id && !tourFilters.startDate && !tourFilters.endDate) ? 'active' : ''}`} onClick={() => setTourFilters({...tourFilters, timeRange: p.id, startDate: '', endDate: ''})}>
              {p.label}
            </button>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={tourFilters.startDate || ''} onChange={e => setTourFilters({...tourFilters, timeRange: 'custom', startDate: e.target.value})} />
            <span style={{ color: '#94a3b8' }}>-</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={tourFilters.endDate || ''} onChange={e => setTourFilters({...tourFilters, timeRange: 'custom', endDate: e.target.value})} />
          </div>

          <div style={{ marginLeft: 'auto', color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px' }}>
            {filteredDepartures.length} Lịch
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="data-table" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ width: '130px' }}>THỜI GIAN</th>
              <th>TOUR / SẢN PHẨM</th>
              <th>GIÁ BÁN (VND)</th>
              <th style={{ width: '100px' }}>PAX / TỐI ĐA</th>
              <th style={{ width: '120px' }}>LOAD FACTOR</th>
              <th>HƯỚNG DẪN VIÊN</th>
              <th style={{ width: '130px' }}>TRẠNG THÁI</th>
              <th style={{ textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartures.map(dep => {
              const lf = Math.round((dep.sold_pax / (dep.max_participants || 1)) * 100);
              return (
                <tr key={dep.id}>
                  <td style={{ color: '#1e293b' }}>
                    {dep.notes && (
                      <div 
                        style={{ position: 'relative', display: 'inline-flex', marginBottom: '4px', cursor: 'help' }}
                        onMouseEnter={() => setHoveredNotePath(dep.id)}
                        onMouseLeave={() => setHoveredNotePath(null)}
                      >
                        <FileText size={16} color="#f59e0b" />
                        {hoveredNotePath === dep.id && (
                          <div style={{
                            position: 'absolute',
                            left: '24px',
                            top: '-4px',
                            width: '260px',
                            background: '#1e293b',
                            color: '#f8fafc',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                            zIndex: 100,
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.4'
                          }}>
                            <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fbbf24' }}>GHI CHÚ LỊCH TRÌNH</div>
                            {dep.notes}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ fontWeight: 800 }}>{new Date(dep.start_date).toLocaleDateString('vi-VN')}</div>
                    {dep.end_date && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
                        đến {new Date(dep.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleViewBookingsForDeparture(dep.code); }}
                      style={{ 
                        marginTop: '4px',
                        display: 'inline-block',
                        padding: '2px 6px', 
                        background: '#f8fafc', 
                        color: '#2563eb', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 800,
                        border: '1px solid #bfdbfe',
                        letterSpacing: '-0.3px',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#60a5fa'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                      title="Nhấn để Lọc và Xem danh sách Khách hàng trong Lịch khởi hành này"
                    >{dep.code || 'N/A'}</button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dep.template_name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{dep.template_duration}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    {new Intl.NumberFormat('vi-VN').format(getDisplayPrice(dep))}
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dep.sold_pax} / {dep.max_participants}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(lf, 100)}%`, 
                            height: '100%', 
                            background: lf >= 100 ? '#10b981' : (lf >= 70 ? '#3b82f6' : '#f59e0b') 
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: lf >= 70 ? '#10b981' : '#64748b' }}>{lf}%</span>
                    </div>
                    {dep.break_even_pax > 0 && (
                      <div style={{ fontSize: '0.7rem', color: dep.sold_pax >= dep.break_even_pax ? '#10b981' : '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
                        {dep.sold_pax >= dep.break_even_pax ? '✓ ĐÃ HÒA VỐN' : `Thiếu ${dep.break_even_pax - dep.sold_pax} khách để hòa vốn`}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      style={{ 
                        padding: '6px 8px', 
                        fontSize: '0.85rem', 
                        minWidth: '140px', 
                        maxWidth: '180px',
                        borderColor: '#e2e8f0', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: '#ffffff',
                        color: '#334155',
                        fontWeight: 500,
                        outline: 'none',
                        border: '1px solid #cbd5e1'
                      }}
                      value={dep.guide_id || ''}
                      onChange={(e) => handleUpdateDeparture({ ...dep, guide_id: e.target.value })}
                    >
                      <option value="">Chưa gán HDV</option>
                      {guides?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <select
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderColor: 'transparent',
                        minWidth: '120px',
                        appearance: 'none',
                        background: dep.status === 'Mở bán' ? '#dcfce7' : 
                                    dep.status === 'Chắc chắn đi' ? '#dbeafe' : 
                                    dep.status === 'Đã đầy' ? '#fef3c7' : 
                                    dep.status === 'Hoàn thành' ? '#f1f5f9' : '#fee2e2',
                        color: dep.status === 'Mở bán' ? '#166534' : 
                               dep.status === 'Chắc chắn đi' ? '#1e40af' : 
                               dep.status === 'Đã đầy' ? '#b45309' : 
                               dep.status === 'Hoàn thành' ? '#475569' : '#b91c1c',
                        borderRadius: '6px',
                        outline: 'none',
                        textAlign: 'center'
                      }}
                      value={dep.status || 'Mở bán'}
                      onChange={(e) => handleUpdateDeparture({ ...dep, status: e.target.value })}
                    >
                      <option value="Mở bán">Mở bán</option>
                      <option value="Chắc chắn đi">Chắc chắn đi</option>
                      <option value="Đã đầy">Đã đầy</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Huỷ">Huỷ</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        className="icon-btn" 
                        style={{ color: '#0284c7', background: '#e0f2fe' }}
                        onClick={(e) => { e.stopPropagation(); handleViewDeparture(dep); }} 
                        title="Xem chi tiết & Khách"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        type="button"
                        className="icon-btn edit" 
                        onClick={(e) => { e.stopPropagation(); handleEditDeparture(dep); }} 
                        title="Sửa Lịch khởi hành"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        className="icon-btn add" 
                        onClick={(e) => { e.stopPropagation(); handleDuplicateDeparture(dep.id); }} 
                        title="Nhân bản Lịch khởi hành"
                        style={{ color: '#10b981', background: '#ecfdf5' }}
                      >
                        <Copy size={16} />
                      </button>
                      {['admin', 'manager'].includes(currentUser?.role) && (
                        <button 
                          type="button"
                          className="icon-btn delete" 
                          onClick={(e) => { e.stopPropagation(); handleDeleteDeparture(dep.id); }} 
                          title="Xoá Lịch khởi hành"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredDepartures.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  {tourDepartures.length === 0 ? 'Chưa có lịch khởi hành nào.' : 'Không tìm thấy lịch khởi hành phù hợp với bộ lọc.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeparturesTab;
