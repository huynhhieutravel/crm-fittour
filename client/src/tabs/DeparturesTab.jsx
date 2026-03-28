import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  Search, 
  PlusCircle 
} from 'lucide-react';

const DeparturesTab = ({ 
  tourDepartures, 
  tourFilters, 
  setTourFilters, 
  setShowAddDepartureModal 
}) => {
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
              {tourDepartures.filter(d => d.status === 'Guaranteed').length}
            </div>
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>LỊCH TRÌNH KHỞI HÀNH</label>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8' 
              }} 
            />
            <input 
              className="filter-input" 
              style={{ width: '100%', paddingLeft: '36px' }} 
              placeholder="Tìm theo tên tour..." 
              value={tourFilters.search} 
              onChange={e => setTourFilters({...tourFilters, search: e.target.value})} 
            />
          </div>
        </div>
        <button 
          className="btn-pro-save" 
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }} 
          onClick={() => setShowAddDepartureModal(true)}
        >
          <PlusCircle size={18} strokeWidth={3} /> LÊN LỊCH KHỞI HÀNH
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NGÀY KHỞI HÀNH</th>
              <th>TOUR / SẢN PHẨM</th>
              <th>SL KHÁCH / MAX</th>
              <th>LOAD FACTOR</th>
              <th>HƯỚNG DẪN VIÊN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {tourDepartures.filter(d => (d.template_name || '').toLowerCase().includes(tourFilters.search.toLowerCase())).map(dep => {
              const lf = Math.round((dep.sold_pax / (dep.max_participants || 1)) * 100);
              return (
                <tr key={dep.id}>
                  <td style={{ fontWeight: 800, color: '#1e293b' }}>
                    {new Date(dep.start_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{dep.template_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dep.template_duration}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{dep.sold_pax} / {dep.max_participants}</td>
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
                    {dep.guide_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '24px', height: '24px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#6366f1' }}>
                          {dep.guide_name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{dep.guide_name}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa gán HDV</span>
                    )}
                  </td>
                  <td>
                    <div className={`status-badge badge-${dep.status === 'Open' ? 'potential' : (dep.status === 'Guaranteed' ? 'won' : 'lost')}`}>
                      {dep.status === 'Open' ? 'Đang nhận khách' : (dep.status === 'Guaranteed' ? 'Chắc chắn khởi hành' : dep.status)}
                    </div>
                  </td>
                </tr>
              );
            })}
            {tourDepartures.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có lịch khởi hành nào.
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
