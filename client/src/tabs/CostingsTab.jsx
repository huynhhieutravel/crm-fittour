import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, DollarSign, X, Save, TrendingUp, TrendingDown, FileText, CheckCircle, PieChart } from 'lucide-react';

const CostingsTab = ({ user }) => {
  const [costings, setCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  const [selectedDepartureId, setSelectedDepartureId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ costs: [], status: 'Draft', total_cost: 0 });

  const fetchCostings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/costings', { headers: { Authorization: `Bearer ${token}` } });
      setCostings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostings();
  }, []);

  const openCostingModal = async (depId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/costings/${depId}`, { headers: { Authorization: `Bearer ${token}` } });
      
      let initialCosts = res.data.costs || [];
      
      setEditData({
        costs: initialCosts,
        status: res.data.status || 'Draft',
        total_cost: res.data.total_cost || 0
      });
      setSelectedDepartureId(depId);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu dự toán (Costings)!');
    }
  };

  const calculateSum = (items) => {
    return items.reduce((sum, c) => sum + (c.price * (c.qty || 1)), 0);
  };

  const handleSaveCosting = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/costings/${selectedDepartureId}`, editData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchCostings(); // Reload to update table with new total
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu bản Dự toán!');
    }
  };

  const handleAddCostRow = () => {
    setEditData({
      ...editData,
      costs: [...editData.costs, { id: Math.random().toString(), category: 'Chi phí Khác', name: '', price: 0, qty: 1 }]
    });
  };

  if (user?.role !== 'admin' && user?.role !== 'operations' && user?.role !== 'manager') {
    return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem', color: '#ef4444' }}><b>KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY</b> <br/>Bảng Dự Toán (Chỉ dành riêng cho Admin & Trưởng nhóm Điều Hành).</div>;
  }

  const filteredData = costings.filter(c => (c.departure_code || '').toLowerCase().includes(filter.toLowerCase()) || (c.template_name || '').toLowerCase().includes(filter.toLowerCase()));

  // Lấy dữ liệu item đang chọn để dùng cho các Card Stats trên Modal
  const activeCostingItem = costings.find(c => c.tour_departure_id === selectedDepartureId);
  const activeRevenue = activeCostingItem?.total_revenue || 0;
  const activeCost = calculateSum(editData.costs);
  const activeProfit = activeRevenue - activeCost;
  const activeProfitMargin = activeRevenue > 0 ? ((activeProfit / activeRevenue) * 100).toFixed(1) : 0;

  const CATEGORY_OPTIONS = ['Vé Máy Bay', 'Landtour / Dịch vụ bến', 'Khách sạn / Lưu trú', 'Xe / Di chuyển', 'Hướng dẫn viên', 'Vé tham quan', 'Nhà hàng / Ăn uống', 'Bảo hiểm', 'Quà tặng', 'Visa', 'Chi phí Khác'];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={28} color="#2563eb" /> Bảng Tính & Dự Toán Hành Trình (Tour Costing)
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Tự động ánh xạ Lịch Khởi Hành & Doanh thu chuẩn.</p>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              className="filter-input" 
              style={{ width: '100%', paddingLeft: '36px' }} 
              placeholder="Nhập mã code lịch khởi hành..." 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu quyết toán từ máy chủ...</div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>MÃ LỊCH / SẢN PHẨM</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>DOANH THU (KHÁCH)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#dc2626' }}>TỔNG CHI PHÍ</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#16a34a' }}>LỢI NHUẬN GỘP</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(c => {
                const totalRev = Number(c.total_revenue) || 0;
                const totalCost = Number(c.total_cost) || 0;
                const profit = totalRev - totalCost;
                
                return (
                  <tr key={c.tour_departure_id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', ':hover': {background: '#f8fafc'} }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{c.departure_code || '---'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.template_name} • <span style={{color: '#2563eb'}}>{new Date(c.start_date).toLocaleDateString('vi-VN')}</span></div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{totalRev.toLocaleString('vi-VN')} đ</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.sold_pax || 0} pax (Booked)</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {c.costing_id ? (
                        <div style={{ fontWeight: 700, color: '#ef4444' }}>- {totalCost.toLocaleString('vi-VN')} đ</div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {c.costing_id ? (
                        <div style={{ fontWeight: 800, color: profit >= 0 ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          {profit >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} 
                          {profit.toLocaleString('vi-VN')} đ
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {c.costing_status === 'Approved' ? (
                        <span className="status-badge badge-won" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>Đã Duyệt (Approved)</span>
                      ) : c.costing_status === 'Draft' ? (
                        <span className="status-badge badge-potential" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Bản Nháp (Draft)</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button className="action-btn" onClick={() => openCostingModal(c.tour_departure_id)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} /> Chỉnh Sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>💰 DỰ TOÁN CHI PHÍ: {activeCostingItem?.departure_code}</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>TỔNG THU (BOOKED)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{activeRevenue.toLocaleString('vi-VN')} ₫</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>TỔNG CHI DỰ TOÁN</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>{activeCost.toLocaleString('vi-VN')} ₫</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>LỢI NHUẬN GỘP</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: activeProfit >= 0 ? '#10b981' : '#f43f5e' }}>
                  {activeProfit > 0 && '+'}{activeProfit.toLocaleString('vi-VN')} ₫ ({activeProfitMargin}%)
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                <div className="modal-form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'none' }}>TRẠNG THÁI</label>
                  <select 
                    className="modal-select" 
                    value={editData.status} 
                    onChange={e => setEditData({...editData, status: e.target.value})}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="Draft">Bản Nháp (Draft)</option>
                    <option value="Approved">Đã Duyệt (Approved)</option>
                    <option value="Completed">Quyết Toán (Completed)</option>
                  </select>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>BẢNG CHI PHÍ & DỊCH VỤ</h3>
            <table className="data-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%', textAlign: 'left' }}>KHOẢN MỤC / NHÓM PHÍ</th>
                  <th style={{ width: '30%', textAlign: 'left' }}>DIỄN GIẢI CHI TIẾT (NCC)</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>ĐƠN GIÁ (VNĐ)</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>SL</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>TỔNG</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {editData.costs.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ padding: '8px' }}>
                      <select 
                        className="modal-select"
                        style={{ padding: '6px', width: '100%', height: 'auto' }}
                        value={c.category}
                        onChange={e => { const newC = [...editData.costs]; newC[idx].category = e.target.value; setEditData({...editData, costs: newC}); }}
                      >
                        {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input 
                        className="modal-input"
                        style={{ padding: '6px', width: '100%', height: 'auto' }}
                        placeholder="Tên xe, vé, nhà hàng..." 
                        value={c.name} 
                        onChange={e => { const newC = [...editData.costs]; newC[idx].name = e.target.value; setEditData({...editData, costs: newC}); }} 
                      />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input 
                        className="modal-input"
                        style={{ padding: '6px', textAlign: 'right', fontWeight: 600, width: '100%', height: 'auto' }}
                        type="number" min="0" 
                        value={c.price || ''} 
                        onChange={e => { const newC = [...editData.costs]; newC[idx].price = parseInt(e.target.value) || 0; setEditData({...editData, costs: newC}); }} 
                      />
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <input 
                        className="modal-input"
                        style={{ padding: '6px', textAlign: 'center', width: '60px', height: 'auto', margin: '0 auto' }}
                        type="number" min="1"
                        value={c.qty || 1} 
                        onChange={e => { const newC = [...editData.costs]; newC[idx].qty = parseInt(e.target.value) || 0; setEditData({...editData, costs: newC}); }} 
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444', padding: '8px' }}>
                      {((c.price || 0) * (c.qty || 1)).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>
                      <button type="button" onClick={() => { setEditData({...editData, costs: editData.costs.filter((_, i) => i !== idx)}); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={handleAddCostRow} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem' }}>
              + Thêm dịch vụ
            </button>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button type="button" className="action-btn" onClick={handleSaveCosting} style={{ background: '#2563eb', color: 'white', flex: 1, padding: '10px' }}><Save size={18} /> LƯU BẢNG DỰ TOÁN</button>
              <button type="button" className="action-btn" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '10px', flex: 1 }}>TRỞ VỀ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostingsTab;
