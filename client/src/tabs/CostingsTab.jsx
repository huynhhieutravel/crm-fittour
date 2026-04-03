import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, DollarSign, X, Save, TrendingUp, TrendingDown, FileText, CheckCircle, PieChart, Plus, CreditCard } from 'lucide-react';

const CATEGORY_OPTIONS = [
  '✈️ Cước Vận Chuyển',
  '🏨 Lưu Trú (Khách Sạn)',
  '🍜 Ăn Uống (Nhà Hàng)',
  '🚍 Vận Chuyển Nội Địa',
  '🎫 Vé Tham Quan',
  '👨‍💼 Hướng Dẫn Viên',
  '🛂 Visa / Giấy Phép',
  '🛡️ Bảo Hiểm Du Lịch',
  '🎁 Quà Tặng / Khác',
  '📦 Landtour Đối Tác',
  '🔄 Chi Phí Khác (Dự phòng)'
];

const CostingsTab = ({ user }) => {
  const [costings, setCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  const [selectedDepartureId, setSelectedDepartureId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ 
    costs: [], 
    status: 'Draft',
    total_revenue: 0,
    sold_pax: 0
  });

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
      
      // Upgrade existing simple costs to advanced structure if needed
      initialCosts = initialCosts.map(c => ({
        id: c.id || Math.random().toString(),
        category: c.category || CATEGORY_OPTIONS[10],
        name: c.name || '',
        estimated_price: c.estimated_price !== undefined ? c.estimated_price : (c.price || 0),
        estimated_qty: c.estimated_qty !== undefined ? c.estimated_qty : (c.qty || 1),
        actual_price: c.actual_price !== undefined ? c.actual_price : (c.price || 0),
        actual_qty: c.actual_qty !== undefined ? c.actual_qty : (c.qty || 1),
        deposit: c.deposit || 0,
        note: c.note || ''
      }));
      
      setEditData({
        costs: initialCosts,
        status: res.data.status || 'Draft',
        total_revenue: res.data.total_revenue || 0,
        sold_pax: res.data.sold_pax || 0
      });
      setSelectedDepartureId(depId);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu dự toán!');
    }
  };

  const handleSaveCosting = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/costings/${selectedDepartureId}`, editData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchCostings(); 
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi lưu bản Dự toán!');
    }
  };

  const handleAddCostRow = () => {
    setEditData({
      ...editData,
      costs: [...editData.costs, { 
        id: Math.random().toString(), 
        category: CATEGORY_OPTIONS[10], 
        name: '', 
        estimated_price: 0, estimated_qty: 1, 
        actual_price: 0, actual_qty: 1, 
        deposit: 0, note: ''
      }]
    });
  };

  const updateCostRow = (idx, field, value) => {
    const newCosts = [...editData.costs];
    newCosts[idx][field] = value;
    setEditData({ ...editData, costs: newCosts });
  };

  const removeCostRow = (idx) => {
    // Smooth removal without blocking popup
    const newCosts = editData.costs.filter((_, i) => i !== idx);
    setEditData({ ...editData, costs: newCosts });
  };

  if (user?.role !== 'admin' && user?.role !== 'operations' && user?.role !== 'manager') {
    return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem', color: '#ef4444' }}><b>KHÔNG CÓ QUYỀN TRUY CẬP</b></div>;
  }

  const filteredData = costings.filter(c => (c.departure_code || '').toLowerCase().includes(filter.toLowerCase()) || (c.template_name || '').toLowerCase().includes(filter.toLowerCase()));

  // Active calculations for Modal
  const activeItem = costings.find(c => c.tour_departure_id === selectedDepartureId);
  const activeRev = editData.total_revenue || 0;
  const activePax = editData.sold_pax || 1;
  const activeEstCost = editData.costs.reduce((sum, c) => sum + (c.estimated_price * c.estimated_qty), 0);
  const activeActCost = editData.costs.reduce((sum, c) => sum + (c.actual_price * c.actual_qty), 0);
  const activeDeposit = editData.costs.reduce((sum, c) => sum + (Number(c.deposit) || 0), 0);
  
  const estProfit = activeRev - activeEstCost;
  const actProfit = activeRev - activeActCost;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={28} color="#2563eb" /> Dự Toán & Quyết Toán Bảng Kê (P&L)
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Hệ thống theo dõi chi phí Dự kiến vs Thực tế và quản lý Công nợ.</p>
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
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>TỔNG THU & PAX</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#8b5cf6' }}>DỰ TOÁN (EST)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#dc2626' }}>THỰC TẾ (ACT)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#16a34a' }}>LỢI NHUẬN GỘP</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>TRẠNG THÁI</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(c => {
                // Ensure values are numbers robustly
                const currentRev = Number(c.expected_revenue) || 0;
                
                // Read from DB values saved directly in the table
                const estCost = Number(c.total_estimated_cost) || 0;
                const actCost = Number(c.total_actual_cost) || 0;
                
                const actProfit = currentRev - actCost;
                
                return (
                  <tr key={c.tour_departure_id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s', ':hover': {background: '#f8fafc'} }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>{c.departure_code || '---'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{c.template_name} • <span style={{color: '#2563eb'}}>{new Date(c.start_date).toLocaleDateString('vi-VN')}</span></div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentRev.toLocaleString('vi-VN')} đ</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.sold_pax || 0} pax</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {c.costing_id ? (
                        <div style={{ fontWeight: 600, color: '#8b5cf6' }}>{estCost.toLocaleString('vi-VN')} đ</div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {c.costing_id ? (
                        <div style={{ fontWeight: 700, color: '#ef4444' }}>{actCost.toLocaleString('vi-VN')} đ</div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {c.costing_id ? (
                        <div>
                            <div style={{ fontWeight: 800, color: actProfit >= 0 ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              {actProfit >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} 
                              {actProfit.toLocaleString('vi-VN')} đ
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                {(c.sold_pax > 0) ? `~ ${(actProfit/c.sold_pax).toLocaleString('vi-VN')} đ/khách` : ''}
                            </div>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {c.costing_status === 'Approved' ? (
                        <span className="status-badge badge-won" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>Đã Duyệt</span>
                      ) : c.costing_status === 'Completed' ? (
                        <span className="status-badge" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Quyết Toán</span>
                      ) : c.costing_status === 'Draft' ? (
                        <span className="status-badge badge-potential" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Bản Nháp</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button className="action-btn" onClick={() => openCostingModal(c.tour_departure_id)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} /> Cập Nhật
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COSTING MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slide-up" style={{ width: '95vw', maxWidth: '1400px', maxHeight: '95vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>💰 BẢNG DỰ TOÁN QUYẾT TOÁN</h2>
                <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>Lịch Khởi Hành: <strong style={{ color: '#2563eb' }}>{activeItem?.departure_code}</strong> | Khách: <strong>{activePax}</strong> pax</div>
              </div>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>

            {/* DASHBOARD CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>TỔNG DOANH THU (THỰC TẾ)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{activeRev.toLocaleString('vi-VN')} ₫</div>
              </div>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>TỔNG CHI (DỰ TOÁN)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>{activeEstCost.toLocaleString('vi-VN')} ₫</div>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>LN Dự kiến: {estProfit.toLocaleString('vi-VN')} đ</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>TỔNG CHI (THỰC TẾ)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b91c1c' }}>{activeActCost.toLocaleString('vi-VN')} ₫</div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>Chênh lệch: {(activeActCost - activeEstCost).toLocaleString('vi-VN')} đ</div>
              </div>
              <div style={{ background: actProfit >= 0 ? '#ecfdf5' : '#fff1f2', padding: '1rem', borderRadius: '12px', border: `1px solid ${actProfit >= 0 ? '#a7f3d0' : '#fecdd3'}` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: actProfit >= 0 ? '#059669' : '#e11d48', marginBottom: '4px' }}>LỢI NHUẬN THỰC TẾ (ACTUAL P&L)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: actProfit >= 0 ? '#047857' : '#be123c' }}>
                  {actProfit > 0 && '+'}{actProfit.toLocaleString('vi-VN')} ₫
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', color: actProfit >= 0 ? '#10b981' : '#f43f5e' }}>
                    Tỷ suất: {activeRev > 0 ? ((actProfit / activeRev) * 100).toFixed(1) : 0}% | TB: {activePax > 0 ? (actProfit/activePax).toLocaleString('vi-VN') : 0} ₫/khách
                </div>
              </div>
            </div>

            {/* STATUS SELECTOR */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>TRẠNG THÁI HỒ SƠ:</span>
                <select 
                className="modal-select" 
                value={editData.status} 
                onChange={e => setEditData({...editData, status: e.target.value})}
                style={{ width: '250px', background: 'white' }}
                >
                <option value="Draft">📝 Bản Nháp (Draft)</option>
                <option value="Pending Approval">⏳ Chờ Duyệt (Pending)</option>
                <option value="Approved">✔️ Đã Duyệt (Approved)</option>
                <option value="Completed">🔒 Quyết Toán (Completed - Khóa)</option>
                </select>
            </div>

            {/* MAIN TABLE */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} /> BẢNG CHI TIẾT DỊCH VỤ VÀ CÔNG NỢ
            </h3>
            
            <div style={{ overflowX: 'auto', marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '15%', textAlign: 'left', padding: '12px' }}>HẠNG MỤC</th>
                    <th style={{ width: '15%', textAlign: 'left', padding: '12px' }}>NHÀ CUNG CẤP / MÔ TẢ</th>
                    <th style={{ width: '15%', textAlign: 'center', padding: '12px', borderLeft: '2px solid #cbd5e1' }}>DỰ TOÁN (EST)</th>
                    <th style={{ width: '15%', textAlign: 'center', padding: '12px', borderLeft: '2px solid #cbd5e1' }}>THỰC TẾ (ACT)</th>
                    <th style={{ width: '20%', textAlign: 'center', padding: '12px', borderLeft: '2px solid #cbd5e1' }}>THANH TOÁN / CỌC</th>
                    <th style={{ width: '15%', textAlign: 'left', padding: '12px' }}>GHI CHÚ</th>
                    <th style={{ width: '5%', textAlign: 'center', padding: '12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {editData.costs.map((c, idx) => {
                    const estTotal = c.estimated_price * c.estimated_qty;
                    const actTotal = c.actual_price * c.actual_qty;
                    const remaining = actTotal - c.deposit;

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        
                        {/* Hạng Mục */}
                        <td style={{ padding: '8px' }}>
                          <select 
                            className="modal-select"
                            style={{ padding: '8px', width: '100%', fontSize: '0.85rem' }}
                            value={c.category}
                            onChange={e => updateCostRow(idx, 'category', e.target.value)}
                          >
                            {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>

                        {/* Tên / Nội dung */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="modal-input"
                            style={{ padding: '8px', width: '100%', fontSize: '0.85rem' }}
                            placeholder="Nhà xe, Tên KS..." 
                            value={c.name} 
                            onChange={e => updateCostRow(idx, 'name', e.target.value)} 
                          />
                        </td>

                        {/* Dự toán */}
                        <td style={{ padding: '8px', borderLeft: '2px solid #cbd5e1', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <input 
                                    className="modal-input"
                                    style={{ flex: 2, padding: '4px 8px', textAlign: 'right', fontSize: '0.85rem' }}
                                    type="number" min="0" placeholder="Đơn giá" title="Đơn giá Dự kiến"
                                    value={c.estimated_price || ''} 
                                    onChange={e => updateCostRow(idx, 'estimated_price', parseInt(e.target.value) || 0)} 
                                />
                                <span style={{ padding: '4px' }}>x</span>
                                <input 
                                    className="modal-input"
                                    style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '0.85rem' }}
                                    type="number" min="0" placeholder="SL" title="Số lượng Dự kiến"
                                    value={c.estimated_qty || ''} 
                                    onChange={e => updateCostRow(idx, 'estimated_qty', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                                = {estTotal.toLocaleString('vi-VN')}
                            </div>
                        </td>

                        {/* Thực tế */}
                        <td style={{ padding: '8px', borderLeft: '2px solid #cbd5e1', background: '#fff' }}>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <input 
                                    className="modal-input"
                                    style={{ flex: 2, padding: '4px 8px', textAlign: 'right', fontSize: '0.85rem', borderColor: '#fca5a5' }}
                                    type="number" min="0" placeholder="Đơn giá" title="Đơn giá Thực tế"
                                    value={c.actual_price || ''} 
                                    onChange={e => updateCostRow(idx, 'actual_price', parseInt(e.target.value) || 0)} 
                                />
                                <span style={{ padding: '4px' }}>x</span>
                                <input 
                                    className="modal-input"
                                    style={{ flex: 1, padding: '4px', textAlign: 'center', fontSize: '0.85rem', borderColor: '#fca5a5' }}
                                    type="number" min="0" placeholder="SL" title="Số lượng Thực tế"
                                    value={c.actual_qty || ''} 
                                    onChange={e => updateCostRow(idx, 'actual_qty', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626', fontSize: '0.9rem' }}>
                                = {actTotal.toLocaleString('vi-VN')}
                            </div>
                        </td>

                        {/* Cọc / Còn lại */}
                        <td style={{ padding: '8px', borderLeft: '2px solid #cbd5e1', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', width: '50px' }}>Đã cọc:</span>
                                <input 
                                    className="modal-input"
                                    style={{ flex: 1, padding: '4px 8px', textAlign: 'right', fontSize: '0.85rem', borderColor: '#86efac' }}
                                    type="number" min="0" placeholder="Tiền cọc"
                                    value={c.deposit || ''} 
                                    onChange={e => updateCostRow(idx, 'deposit', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', width: '50px' }}>Còn nợ:</span>
                                <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, color: remaining > 0 ? '#ea580c' : '#16a34a', fontSize: '0.9rem' }}>
                                    {remaining.toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </td>

                        {/* Ghi chú */}
                        <td style={{ padding: '8px' }}>
                          <textarea 
                            className="modal-input"
                            style={{ padding: '6px', width: '100%', fontSize: '0.85rem', height: '56px', resize: 'none' }}
                            placeholder="Ghi chú thêm..." 
                            value={c.note || ''} 
                            onChange={e => updateCostRow(idx, 'note', e.target.value)} 
                          />
                        </td>

                        {/* Action - Smooth Remove without Alert */}
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <button 
                            type="button" 
                            onClick={() => removeCostRow(idx)} 
                            title="Xóa dòng này"
                            style={{ background: '#fee2e2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button type="button" onClick={handleAddCostRow} style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(59,130,246,0.3)' }}>
                <Plus size={18} /> Thêm Dịch Vụ Mới
                </button>
                
                <div style={{ display: 'flex', gap: '2rem', background: '#f8fafc', padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng đã cọc (Deposit):</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>{activeDeposit.toLocaleString('vi-VN')} đ</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tổng chi phí thực tế:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>{activeActCost.toLocaleString('vi-VN')} đ</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', position: 'sticky', bottom: 0, background: 'white', paddingBottom: '1rem', zIndex: 10 }}>
              <button type="button" className="action-btn" onClick={handleSaveCosting} style={{ background: '#2563eb', color: 'white', flex: 1, padding: '14px', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Save size={20} /> LƯU BẢNG KÊ QUYẾT TOÁN
              </button>
              <button type="button" className="action-btn" onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '14px', flex: 1, fontSize: '1rem', fontWeight: 700 }}>
                  HỦY / ĐÓNG
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CostingsTab;
