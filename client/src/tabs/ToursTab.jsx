import React from 'react';
import { Search, Plus } from 'lucide-react';

const ToursTab = ({ 
  tourTemplates, 
  tourFilters, 
  setTourFilters, 
  setShowAddTemplateModal 
}) => {
  return (
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>DANH MỤC SẢN PHẨM TOUR</label>
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
              placeholder="Tìm tên tour, điểm đến..." 
              value={tourFilters.search} 
              onChange={e => setTourFilters({...tourFilters, search: e.target.value})} 
            />
          </div>
        </div>
        <button 
          className="btn-pro-save" 
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }} 
          onClick={() => setShowAddTemplateModal(true)}
        >
          <Plus size={18} strokeWidth={3} /> THIẾT KẾ SẢN PHẨM MỚI
        </button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN SẢN PHẨM</th>
              <th>ĐIỂM ĐẾN</th>
              <th>THỜI LƯỢNG</th>
              <th>LOẠI TOUR</th>
              <th>GIÁ NIÊM YẾT</th>
              <th>TAGS</th>
            </tr>
          </thead>
          <tbody>
            {tourTemplates.filter(t => (t.name || '').toLowerCase().includes(tourFilters.search.toLowerCase())).map(template => (
              <tr key={template.id}>
                <td style={{ fontWeight: 700 }}>{template.name}</td>
                <td>{template.destination}</td>
                <td>{template.duration}</td>
                <td>
                  <span 
                    className="status-badge badge-potential" 
                    style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                  >
                    {template.tour_type || 'Standard'}
                  </span>
                </td>
                <td style={{ color: 'var(--secondary)', fontWeight: 700 }}>
                  {Number(template.base_price || template.price).toLocaleString('vi-VN')}đ
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(template.tags || '').split(',').map(tag => tag.trim() && (
                      <span 
                        key={tag} 
                        style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 8px', 
                          background: '#eef2ff', 
                          color: '#6366f1', 
                          borderRadius: '4px', 
                          fontWeight: 600 
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {tourTemplates.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có sản phẩm tour nào. Hãy thiết kế sản phẩm đầu tiên!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToursTab;
