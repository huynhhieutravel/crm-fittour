import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, DollarSign, X, Save, TrendingUp, TrendingDown, FileText, CheckCircle, PieChart, Plus, CreditCard, Filter, Printer } from 'lucide-react';

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
  const location = useLocation();
  const navigate = useNavigate();

  const [costings, setCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [templateFilter, setTemplateFilter] = useState('ALL');
  const [profitFilter, setProfitFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [periodFilter, setPeriodFilter] = useState('ALL');
  
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

  useEffect(() => {
    if (location.state?.autoOpenDepId) {
      setTimeout(() => {
        openCostingModal(location.state.autoOpenDepId);
      }, 100); // 100ms delay to ensure the component is fully mounted and avoids conflict with Router
    }
  }, [location.state?.autoOpenDepId]);

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
        note: c.note || '',
        currency: c.currency || 'VND',
        exchange_rate: c.exchange_rate || 1,
        payment_status: c.payment_status || 'UNPAID',
        deposit_date: c.deposit_date || '',
        due_date: c.due_date || ''
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
        deposit: 0, note: '',
        currency: 'VND', exchange_rate: 1,
        payment_status: 'UNPAID', deposit_date: '', due_date: ''
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

  const filteredData = costings.filter(c => {
    const matchText = (c.departure_code || '').toLowerCase().includes(filter.toLowerCase()) || (c.template_name || '').toLowerCase().includes(filter.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter === 'EMPTY') matchStatus = (!c.costing_status || c.costing_status === 'Draft');
    else if (statusFilter !== 'ALL') matchStatus = c.costing_status === statusFilter;

    let matchTemplate = true;
    if (templateFilter !== 'ALL') matchTemplate = c.template_name === templateFilter;

    let matchProfit = true;
    if (profitFilter !== 'ALL') {
        const rev = Number(c.saved_revenue) || 0;
        const actCost = Number(c.total_actual_cost) || 0;
        const profit = rev - actCost;
        if (profitFilter === 'PROFIT') matchProfit = profit > 0;
        else if (profitFilter === 'LOSS') matchProfit = profit < 0;
    }

    let matchTime = true;
    if (yearFilter !== 'ALL' || periodFilter !== 'ALL') {
        if (!c.start_date) {
            matchTime = false;
        } else {
            const d = new Date(c.start_date);
            const y = d.getFullYear();
            const m = d.getMonth() + 1; // 1-12
            
            if (yearFilter !== 'ALL' && y.toString() !== yearFilter) matchTime = false;
            
            if (periodFilter !== 'ALL') {
                if (periodFilter.startsWith('Q')) {
                    const qNum = parseInt(periodFilter.substring(1));
                    const qTargetOpts = [[1,2,3], [4,5,6], [7,8,9], [10,11,12]];
                    if (!qTargetOpts[qNum-1].includes(m)) matchTime = false;
                } else if (periodFilter.startsWith('M')) {
                    const targetM = parseInt(periodFilter.substring(1));
                    if (m !== targetM) matchTime = false;
                }
            }
        }
    }

    return matchText && matchStatus && matchTemplate && matchProfit && matchTime;
  });

  const uniqueTemplates = [...new Set(costings.map(c => c.template_name).filter(Boolean))];
  const uniqueYears = [...new Set(costings.map(c => {
      if (!c.start_date) return null;
      const d = new Date(c.start_date);
      if(isNaN(d)) return null;
      return d.getFullYear().toString();
  }).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  
  // React Select templates map
  const templateOptions = [
    { value: 'ALL', label: 'Tất cả Tuyến Đi' },
    ...uniqueTemplates.map(t => ({ value: t, label: t }))
  ];

  // Active calculations for Modal
  const activeItem = costings.find(c => c.tour_departure_id === selectedDepartureId);
  const activeRev = editData.total_revenue || 0;
  const activePax = editData.sold_pax || 1;
  const activeEstCost = editData?.costs?.reduce((sum, c) => sum + (c.estimated_price * c.estimated_qty * (c.exchange_rate || 1)), 0) || 0;
  const activeActCost = editData?.costs?.reduce((sum, c) => sum + (c.actual_price * c.actual_qty * (c.exchange_rate || 1)), 0) || 0;
  const activeDeposit = editData?.costs?.reduce((sum, c) => sum + ((Number(c.deposit) || 0) * (c.exchange_rate || 1)), 0) || 0;
  
  const estProfit = activeRev - activeEstCost;
  const actProfit = activeRev - activeActCost;

  const handlePrintCosting = () => {
    if (!activeItem) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker đã chặn cửa sổ. Vui lòng cho phép popup để hiển thị trang In!");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>BẢNG KÊ QUYẾT TOÁN P&L - ${activeItem.departure_code}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #1e293b; font-size: 14px; margin: 0; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            .header h1 { margin: 5px 0; font-size: 22px; color: #1e3a8a; text-transform: uppercase; }
            .header h2 { margin: 0; font-size: 16px; color: #475569; }
            .header p { margin: 8px 0 0 0; color: #334155; font-size: 15px; }
            .summary { margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; }
            .summary table { width: 100%; border-collapse: collapse; }
            .summary td { padding: 6px; vertical-align: top; }
            .summary td.bold { font-weight: bold; width: 180px; }
            .cost-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            .cost-table th, .cost-table td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: center; }
            .cost-table th { background: #e2e8f0; font-weight: bold; color: #1e293b; }
            .cost-table td.left { text-align: left; }
            .cost-table td.right { text-align: right; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
            .signature { width: 33%; }
            .signature h3 { font-size: 14px; margin-bottom: 80px; font-weight: bolder; }
            .signature p { font-style: italic; color: #64748b; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; size: A4 portrait; }
              .summary { border: 1px solid #000; background: transparent; }
              .cost-table th { background: transparent; }
              .cost-table th, .cost-table td { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>CÔNG TY TNHH FIT TOUR</h2>
            <h1>BẢNG DỰ TOÁN / QUYẾT TOÁN P&L</h1>
            <p><strong>Mã Lịch:</strong> ${activeItem.departure_code} &nbsp;|&nbsp; <strong>Sản Phẩm:</strong> ${activeItem.template_name}</p>
          </div>
          
          <div class="summary">
            <table>
              <tr>
                <td class="bold">DOANH THU THỰC TẾ:</td>
                <td class="right" style="font-size: 16px; width: 150px;"><b>${activeRev.toLocaleString('vi-VN')}</b> đ</td>
                <td class="bold" style="padding-left: 40px;">SỐ KHÁCH CHỐT:</td>
                <td class="right" style="width: 100px;"><b>${activePax}</b> pax</td>
              </tr>
              <tr>
                <td class="bold">TỔNG CHI (DỰ TOÁN):</td>
                <td class="right"><b>${activeEstCost.toLocaleString('vi-VN')}</b> đ</td>
                <td class="bold" style="padding-left: 40px;">LỢI NHUẬN GỘP:</td>
                <td class="right" style="font-size: 16px;"><b>${(actProfit > 0 ? '+' : '')}${actProfit.toLocaleString('vi-VN')}</b> đ</td>
              </tr>
              <tr>
                <td class="bold">TỔNG CHI (THỰC TẾ):</td>
                <td class="right"><b>${activeActCost.toLocaleString('vi-VN')}</b> đ</td>
                <td class="bold" style="padding-left: 40px;">LỢI NHUẬN BIẾN ĐÀI:</td>
                <td class="right"><b>${activePax > 0 ? (actProfit/activePax).toLocaleString('vi-VN') : 0}</b> đ/pax</td>
              </tr>
            </table>
          </div>

          <table class="cost-table">
            <thead>
              <tr>
                <th style="width: 5%">STT</th>
                <th style="width: 25%">HẠNG MỤC / DV</th>
                <th style="width: 25%">NHÀ CUNG CẤP</th>
                <th style="width: 20%">DỰ TOÁN (VND)</th>
                <th style="width: 20%">THỰC TẾ (VND)</th>
                <th style="width: 5%">HT</th>
              </tr>
            </thead>
            <tbody>
              ${editData?.costs?.length > 0 ? editData.costs.map((c, idx) => {
                const estTotalVND = c.estimated_price * c.estimated_qty * (c.exchange_rate || 1);
                const actTotalVND = c.actual_price * c.actual_qty * (c.exchange_rate || 1);
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td class="left"><b>${c.category}</b></td>
                    <td class="left">${c.name} ${(c.currency && c.currency !== 'VND') ? ('<br/><span style="font-size:11px; color:#475569;">(Ngoại tệ: ' + (c.actual_price * c.actual_qty) + ' ' + c.currency + ')</span>') : ''}</td>
                    <td class="right">${estTotalVND.toLocaleString('vi-VN')}</td>
                    <td class="right" style="font-weight: bold;">${actTotalVND.toLocaleString('vi-VN')}</td>
                    <td style="font-size: 16px;">${c.payment_status === 'PAID' ? '☑' : '☐'}</td>
                  </tr>
                `
              }).join('') : '<tr><td colspan="6">Chưa có dữ liệu</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <div class="signature">
              <h3>NGƯỜI LẬP BIỂU</h3>
              <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div class="signature">
              <h3>KẾ TOÁN TRƯỞNG</h3>
              <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div class="signature">
              <h3>GIÁM ĐỐC PHÊ DUYỆT</h3>
              <p>(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Dự Toán & Quyết Toán Bảng Kê (P&L)
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Hệ thống theo dõi chi phí Dự kiến vs Thực tế và quản lý Công nợ.</p>
        </div>
      </div>

      {/* COMPREHENSIVE FILTER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc' }} 
              placeholder="Nhập mã code lịch hoặc tên tour..." 
              value={filter} 
              onChange={e => setFilter(e.target.value)} 
            />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="ALL">Tất cả Năm</option>
                {uniqueYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="ALL">Cả Năm</option>
                <optgroup label="Theo Quý">
                  <option value="Q1">Quý 1</option>
                  <option value="Q2">Quý 2</option>
                  <option value="Q3">Quý 3</option>
                  <option value="Q4">Quý 4</option>
                </optgroup>
                <optgroup label="Theo Tháng">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={`M${m}`} value={`M${m}`}>Tháng {m}</option>
                  ))}
                </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '8px' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="ALL">Trạng thái (Tất cả)</option>
                <option value="EMPTY">📝 Bản Nháp / Trống</option>
                <option value="Approved">✔️ Đã Duyệt</option>
                <option value="Completed">🔒 Đã Quyết Toán</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '8px' }}>
            <select value={profitFilter} onChange={e => setProfitFilter(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                <option value="ALL">P&L: Tất cả</option>
                <option value="PROFIT">📈 Báo CÓ LÃI</option>
                <option value="LOSS">📉 Báo LỖ MỐC</option>
            </select>
          </div>

          <div style={{ minWidth: '280px' }}>
            <Select 
                options={templateOptions}
                value={templateOptions.find(o => o.value === templateFilter)}
                onChange={opt => setTemplateFilter(opt.value)}
                placeholder="Tìm Tuyến Đi (Gõ tên...)"
                isSearchable={true}
                styles={{
                    control: (base) => ({
                        ...base,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        minHeight: '38px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        '&:hover': {
                            borderColor: '#cbd5e1'
                        }
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        fontSize: '0.9rem'
                    })
                }}
            />
          </div>
          
          {(filter || yearFilter !== 'ALL' || periodFilter !== 'ALL' || statusFilter !== 'ALL' || profitFilter !== 'ALL' || templateFilter !== 'ALL') && (
              <button 
                type="button"
                onClick={() => {
                  setFilter('');
                  setStatusFilter('ALL');
                  setTemplateFilter('ALL');
                  setProfitFilter('ALL');
                  setYearFilter('ALL');
                  setPeriodFilter('ALL');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s', marginLeft: 'auto' }}
                onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={16} /> Xóa Lọc
              </button>
          )}

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
                        <FileText size={14} /> Xem sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COSTING MODAL via Portal */}
      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 99999 }}>
          <style>{`
            .costing-wide-modal {
              background: #ffffff;
              color: #1e293b;
              border: none;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
              padding: 0;
              border-radius: 16px;
              max-width: 1280px !important;
              width: 96vw !important;
              max-height: 94vh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              position: relative;
            }
            .costing-wide-modal .modal-header {
              padding: 1.5rem 2rem;
              border-bottom: 1px solid #e2e8f0;
              background: #f8fafc;
            }
            .costing-wide-modal .modal-body {
              padding: 1.5rem 2rem;
              overflow-y: auto;
              flex: 1;
            }
            .costing-wide-modal .modal-footer {
              padding: 1rem 2rem;
              border-top: 1px solid #e2e8f0;
              background: #f8fafc;
              display: flex;
              gap: 1rem;
            }
            .cost-stat-card {
              padding: 1.25rem;
              border-radius: 12px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .cost-stat-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            }
            .table-clean { width: 100%; border-collapse: separate; border-spacing: 0; }
            .table-clean th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
            .table-clean td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            .cost-input-group { position: relative; display: flex; align-items: center; background: white; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; transition: border-color 0.2s; }
            .cost-input-group:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
            .cost-input-group input { border: none; outline: none; padding: 8px 10px; width: 100%; font-size: 0.85rem; }
            .cost-input-group .prefix { padding: 8px 10px; background: #f8fafc; border-right: 1px solid #cbd5e1; color: #64748b; font-size: 0.8rem; font-weight: 600; }
          `}</style>

          <div className="costing-wide-modal animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     BẢNG DỰ TOÁN QUYẾT TOÁN P&L
                  </h2>
                  <div style={{ color: '#475569', fontSize: '0.95rem', marginTop: '6px' }}>
                    Lịch Khởi Hành:{' '}
                    <span 
                      onClick={() => {
                        setShowModal(false);
                        navigate(`/departures/view/${selectedDepartureId}`);
                      }}
                      style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseOut={e => e.currentTarget.style.color = '#2563eb'}
                      title="Quay lại Màn hình Xem Chuyến"
                    >
                      {activeItem?.departure_code}
                    </span>
                     &nbsp;•&nbsp; Khách: <strong>{activePax}</strong> pax
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handlePrintCosting}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#1e293b', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <Printer size={16} /> In Bảng Kê
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-body">
              {/* DASHBOARD CARDS - Dàn 4 cột 1 hàng */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="cost-stat-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>DOANH THU THỰC TẾ</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{activeRev.toLocaleString('vi-VN')} ₫</div>
                </div>
                <div className="cost-stat-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>TỔNG CHI (DỰ TOÁN)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{activeEstCost.toLocaleString('vi-VN')} ₫</div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '6px', fontWeight: 600 }}>LN Dự kiến: {estProfit.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="cost-stat-card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>TỔNG CHI (THỰC TẾ)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c' }}>{activeActCost.toLocaleString('vi-VN')} ₫</div>
                  <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>Chênh lệch: {(activeActCost - activeEstCost).toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="cost-stat-card" style={{ background: actProfit >= 0 ? '#ecfdf5' : '#fff1f2', border: `1px solid ${actProfit >= 0 ? '#6ee7b7' : '#fda4af'}` }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: actProfit >= 0 ? '#059669' : '#e11d48', marginBottom: '6px' }}>LỢI NHUẬN THỰC TẾ (ACTUAL P&L)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: actProfit >= 0 ? '#047857' : '#be123c' }}>
                    {actProfit > 0 && '+'}{actProfit.toLocaleString('vi-VN')} ₫
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '6px', color: actProfit >= 0 ? '#10b981' : '#f43f5e' }}>
                      Margin: {activeRev > 0 ? ((actProfit / activeRev) * 100).toFixed(1) : 0}% &nbsp;|&nbsp; Lãi TB: {activePax > 0 ? (actProfit/activePax).toLocaleString('vi-VN') : 0} ₫/pax
                  </div>
                </div>
              </div>

              {/* STATUS & ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '10px 16px', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.85rem', textTransform: 'uppercase' }}>Trạng thái hồ sơ:</span>
                    <select 
                      className="modal-select" 
                      value={editData.status} 
                      onChange={e => setEditData({...editData, status: e.target.value})}
                      style={{ width: '220px', background: 'white', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}
                    >
                      <option value="Draft">📝 Bản Nháp (Draft)</option>
                      <option value="Pending Approval">⏳ Chờ Duyệt (Pending)</option>
                      <option value="Approved">✔️ Đã Duyệt (Approved)</option>
                      <option value="Completed">🔒 Quyết Toán (Completed - Khóa)</option>
                    </select>
                </div>
                
                <button type="button" onClick={handleAddCostRow} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2563eb'} onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}>
                  <Plus size={18} /> Thêm Dịch Vụ Mới
                </button>
              </div>

              {/* MAIN TABLE */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto', background: 'white' }}>
                <table className="table-clean" style={{ minWidth: '1100px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>HẠNG MỤC DỊCH VỤ</th>
                      <th style={{ width: '20%' }}>NHÀ CUNG CẤP / MÔ TẢ</th>
                      <th style={{ width: '20%', textAlign: 'center' }}>DỰ TOÁN (EST)</th>
                      <th style={{ width: '20%', textAlign: 'center' }}>THỰC TẾ (ACT)</th>
                      <th style={{ width: '20%' }}>THEO DÕI CÔNG NỢ</th>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editData.costs.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chưa có hạng mục chi phí nào. Bấm "Thêm Dịch Vụ Mới" để bắt đầu.</td></tr>
                    ) : editData.costs.map((c, idx) => {
                      const estTotal = c.estimated_price * c.estimated_qty;
                      const actTotal = c.actual_price * c.actual_qty;
                      const remaining = actTotal - c.deposit;

                      return (
                        <React.Fragment key={c.id}>
                          <tr>
                            
                            {/* Hạng Mục */}
                            <td style={{ borderBottom: 'none' }}>
                            <select 
                              style={{ padding: '8px 12px', width: '100%', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#f8fafc' }}
                              value={c.category}
                              onChange={e => updateCostRow(idx, 'category', e.target.value)}
                            >
                              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </td>

                            <td style={{ borderBottom: 'none' }}>
                            <input 
                              style={{ padding: '8px 12px', width: '100%', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', marginBottom: '8px' }}
                              placeholder="Nhà xe, Tên KS..." 
                              value={c.name} 
                              onChange={e => updateCostRow(idx, 'name', e.target.value)} 
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select 
                                    style={{ padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#f8fafc', fontWeight: 700, color: '#334155' }}
                                    value={c.currency || 'VND'}
                                    onChange={e => updateCostRow(idx, 'currency', e.target.value)}
                                >
                                    <option value="VND">₫ VND</option>
                                    <option value="USD">$ USD</option>
                                    <option value="EUR">€ EUR</option>
                                    <option value="THB">฿ THB</option>
                                    <option value="AUD">A$ AUD</option>
                                    <option value="JPY">¥ JPY</option>
                                    <option value="KRW">₩ KRW</option>
                                </select>
                                {(c.currency && c.currency !== 'VND') && (
                                    <div className="cost-input-group" style={{ flex: 1 }}>
                                        <div className="prefix" style={{ padding: '6px 8px', fontSize: '0.75rem', width: '55px', textAlign: 'center' }}>Tỉ giá</div>
                                        <input 
                                            type="text" 
                                            style={{ padding: '6px 8px', fontSize: '0.85rem', textAlign: 'right', border: 'none', outline: 'none', width: '100%' }}
                                            placeholder="25,000"
                                            value={c.exchange_rate ? c.exchange_rate.toLocaleString('vi-VN') : ''}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                updateCostRow(idx, 'exchange_rate', val ? parseInt(val, 10) : 0);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                          </td>

                            <td style={{ background: '#f8fafc', borderLeft: '1px dashed #cbd5e1', borderBottom: 'none' }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                  <div className="cost-input-group" style={{ flex: 2 }}>
                                    <input 
                                        style={{ padding: '8px 10px', width: '100%', textAlign: 'right', fontSize: '0.85rem', border: 'none', outline: 'none' }}
                                        type="text" placeholder="Đơn giá" title="Đơn giá Dự kiến"
                                        value={c.estimated_price ? c.estimated_price.toLocaleString('vi-VN') : ''} 
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            updateCostRow(idx, 'estimated_price', val ? parseInt(val, 10) : 0);
                                        }} 
                                    />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>×</div>
                                  <div className="cost-input-group" style={{ flex: 1 }}>
                                    <input type="number" min="0" placeholder="SL" title="Số lượng Dự kiến" style={{ textAlign: 'center' }} value={c.estimated_qty || ''} onChange={e => updateCostRow(idx, 'estimated_qty', parseInt(e.target.value) || 0)} />
                                  </div>
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>
                                  = {estTotal.toLocaleString('vi-VN')} {c.currency !== 'VND' ? c.currency : '₫'}
                                  {c.currency !== 'VND' && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginTop: '2px' }}>Quy đổi: {(estTotal * (c.exchange_rate || 1)).toLocaleString('vi-VN')} ₫</div>}
                              </div>
                          </td>

                            <td style={{ background: '#fff', borderLeft: '1px dashed #cbd5e1', borderBottom: 'none' }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                  <div className="cost-input-group" style={{ flex: 2, borderColor: '#fca5a5' }}>
                                    <input 
                                        style={{ padding: '8px 10px', width: '100%', textAlign: 'right', fontSize: '0.85rem', border: 'none', outline: 'none' }}
                                        type="text" placeholder="Đơn giá" title="Đơn giá Thực tế"
                                        value={c.actual_price ? c.actual_price.toLocaleString('vi-VN') : ''} 
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            updateCostRow(idx, 'actual_price', val ? parseInt(val, 10) : 0);
                                        }} 
                                    />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', color: '#f87171' }}>×</div>
                                  <div className="cost-input-group" style={{ flex: 1, borderColor: '#fca5a5' }}>
                                    <input type="number" min="0" placeholder="SL" title="Số lượng Thực tế" style={{ textAlign: 'center' }} value={c.actual_qty || ''} onChange={e => updateCostRow(idx, 'actual_qty', parseInt(e.target.value) || 0)} />
                                  </div>
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: '0.95rem' }}>
                                  = {actTotal.toLocaleString('vi-VN')} {c.currency !== 'VND' ? c.currency : '₫'}
                                  {c.currency !== 'VND' && <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 500, marginTop: '2px' }}>Quy đổi: {(actTotal * (c.exchange_rate || 1)).toLocaleString('vi-VN')} ₫</div>}
                              </div>
                          </td>

                            <td style={{ background: '#f8fafc', borderLeft: '1px dashed #cbd5e1', borderBottom: 'none' }}>
                              <div className="cost-input-group" style={{ marginBottom: '8px', borderColor: '#86efac' }}>
                                  <div className="prefix" style={{ color: '#15803d', width: '60px' }}>Cọc</div>
                                  <input 
                                    type="text" 
                                    placeholder="0" 
                                    style={{ textAlign: 'right', padding: '8px 10px', width: '100%', border: 'none', outline: 'none' }} 
                                    value={c.deposit ? c.deposit.toLocaleString('vi-VN') : ''} 
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        updateCostRow(idx, 'deposit', val ? parseInt(val, 10) : 0);
                                    }} 
                                  />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>CÒN NỢ:</span>
                                  <div style={{ textAlign: 'right', fontWeight: 800, color: remaining > 0 ? '#ea580c' : '#16a34a', fontSize: '0.95rem' }}>
                                      {remaining.toLocaleString('vi-VN')} {c.currency !== 'VND' ? c.currency : '₫'}
                                      {c.currency !== 'VND' && <div style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '2px', opacity: 0.8 }}>{(remaining * (c.exchange_rate || 1)).toLocaleString('vi-VN')} ₫</div>}
                                  </div>
                              </div>
                          </td>

                          {/* Action */}
                          <td style={{ textAlign: 'center', verticalAlign: 'middle', borderBottom: 'none' }}>
                            <button 
                              type="button" 
                              onClick={() => removeCostRow(idx)} 
                              title="Xóa hạng mục"
                              style={{ background: '#fee2e2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                        {/* Ghi chú Full Width Row */}
                        <tr>
                          <td colSpan="6" style={{ padding: '0 16px 16px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', borderTop: 'none' }}>
                              <div style={{ display: 'flex', gap: '24px' }}>
                                  {/* Tiết mục Ghi chú */}
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', minWidth: '60px', paddingTop: '8px' }}>Ghi chú:</span>
                                      <textarea 
                                          style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', background: '#f8fafc', minHeight: '80px', resize: 'vertical' }}
                                          placeholder="Nhập ghi chú chi tiết cho hạng mục này (có thể kéo giãn dòng)..." 
                                          value={c.note || ''} 
                                          onChange={e => updateCostRow(idx, 'note', e.target.value)} 
                                      />
                                  </div>

                                  {/* Tiết mục Thanh toán */}
                                  <div style={{ width: '320px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>TT Thanh toán:</span>
                                          <select 
                                              style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', border: '1px solid', borderColor: c.payment_status === 'PAID' ? '#86efac' : c.payment_status === 'PARTIAL' ? '#fde047' : '#fca5a5', background: c.payment_status === 'PAID' ? '#dcfce7' : c.payment_status === 'PARTIAL' ? '#fef08a' : '#fee2e2', color: c.payment_status === 'PAID' ? '#166534' : c.payment_status === 'PARTIAL' ? '#854d0e' : '#991b1b', outline: 'none', cursor: 'pointer' }}
                                              value={c.payment_status || 'UNPAID'}
                                              onChange={e => updateCostRow(idx, 'payment_status', e.target.value)}
                                          >
                                              <option value="UNPAID">Chưa thanh toán (0%)</option>
                                              <option value="PARTIAL">Đã cọc một phần</option>
                                              <option value="PAID">Đã thanh toán đủ (100%)</option>
                                          </select>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Ngày lập cọc:</span>
                                          <input type="date" style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', width: '130px', color: '#334155' }} value={c.deposit_date || ''} onChange={e => updateCostRow(idx, 'deposit_date', e.target.value)} />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '0.8rem', fontWeight: c.payment_status !== 'PAID' && c.due_date && new Date(c.due_date) < new Date() ? 800 : 700, color: c.payment_status !== 'PAID' && c.due_date && new Date(c.due_date) < new Date() ? '#ef4444' : '#f59e0b' }}>Hạn chót (Due):</span>
                                          <input type="date" style={{ padding: '4px 8px', fontSize: '0.8rem', border: `1px solid ${c.payment_status !== 'PAID' && c.due_date && new Date(c.due_date) < new Date() ? '#ef4444' : '#cbd5e1'}`, borderRadius: '4px', outline: 'none', width: '130px', color: '#334155', background: c.payment_status !== 'PAID' && c.due_date && new Date(c.due_date) < new Date() ? '#fee2e2' : '#ffffff' }} value={c.due_date || ''} onChange={e => updateCostRow(idx, 'due_date', e.target.value)} />
                                      </div>
                                  </div>
                              </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowModal(false)} style={{ background: '#fff', color: '#475569', padding: '12px 24px', flex: 1, fontSize: '0.95rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
                  HỦY BỎ
              </button>
              <button type="button" onClick={handleSaveCosting} style={{ background: '#2563eb', color: 'white', flex: 2, padding: '12px 24px', border: 'none', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)' }}>
                <Save size={18} /> LƯU BẢNG KÊ QUYẾT TOÁN
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CostingsTab;
