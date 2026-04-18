import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function AgencySharePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [limit, setLimit] = useState(50);
  const [activeMarket, setActiveMarket] = useState('Tất cả');
  const [activeStatus, setActiveStatus] = useState('Tất cả');

  useEffect(() => {
    fetchPublicTours();
  }, []);

  const fetchPublicTours = async () => {
    try {
      const response = await axios.get('/api/op-tours/public');
      setTours(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching public tours:', err);
      setError('Lỗi khi tải dữ liệu tour.');
      setLoading(false);
    }
  };

  const fmtMoney = (v) => Number(v || 0).toLocaleString('vi-VN');
  const formatDateSafe = (d) => {
    if (!d) return '';
    try {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return String(d);
      return parsed.toLocaleDateString('vi-VN');
    } catch (e) { return String(d); }
  };

  const uniqueMarkets = ['Tất cả', ...new Set(tours.map(t => t.market).filter(Boolean))];

  const filteredTours = tours.filter(t => {
    const matchSearch = t.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.tour_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMarket = activeMarket === 'Tất cả' || t.market === activeMarket;
    const matchStatus = activeStatus === 'Tất cả' || t.status === activeStatus || (activeStatus === 'Đang chạy' && !t.status);
    const matchStart = filterStartDate ? new Date(t.start_date) >= new Date(filterStartDate) : true;
    
    return matchSearch && matchMarket && matchStatus && matchStart;
  });

  const displayedTours = filteredTours.slice(0, limit);

  const countAll = tours.length;
  const countRunning = tours.filter(t => t.status === 'Đang chạy' || !t.status).length;
  const countUpcoming = tours.filter(t => t.status === 'Sắp chạy').length;
  const countCancelled = tours.filter(t => t.status === 'Hủy' || t.status === 'Huỷ').length;
  const totalSlots = tours.reduce((acc, t) => acc + (Number(t.tour_info?.total_seats) || 0), 0);
  const outOfStock = tours.filter(t => {
    const total = Number(t.tour_info?.total_seats) || 0;
    const sold = t.public_stats?.soldCount || 0;
    const held = t.public_stats?.heldCount || 0;
    return (total - sold - held) <= 0 && total > 0;
  }).length;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Đang tải danh sách...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      
      {/* Header Info */}
      <div style={{ marginBottom: '30px' }}>
        <img src="/logo.png" alt="FIT TOUR" style={{ height: '80px', marginBottom: '20px' }} />
        <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR</h2>
        <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Địa chỉ: 19 Lương Hữu Khánh, Phường Bến Thành, Tp. Hồ Chí Minh, Việt Nam</p>
        <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Điện thoại: 0836999909</p>
        <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Email: info@fittour.com.vn</p>
        <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>Website: https://www.dulichcoguu.com</p>
      </div>

      <h1 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline', marginBottom: '30px' }}>
        DANH SÁCH LỊCH KHỞI HÀNH TOUR
      </h1>

      {/* Filter Row 1 */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div style={{ flex: '1', maxWidth: '300px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tìm kiếm:</label>
          <input 
            type="text" 
            placeholder="Mã, tên tour.." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
          />
        </div>
        <div style={{ flex: '1', maxWidth: '250px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Ngày Khởi hành:</label>
          <input 
            type="date" 
            value={filterStartDate} 
            onChange={(e) => setFilterStartDate(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
          />
        </div>
        <div style={{ flex: '1', maxWidth: '100px' }}>
          <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>Số lượng:</label>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={1000}>Tất cả</option>
          </select>
        </div>
        <button style={{ background: '#2196f3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Search size={16} />
        </button>
      </div>

      {/* Market Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {uniqueMarkets.map(m => (
          <button
            key={m}
            onClick={() => setActiveMarket(m)}
            style={{
              padding: '6px 15px',
              border: '1px solid #ccc',
              borderRadius: '20px',
              background: activeMarket === m ? '#ff5722' : 'white',
              color: activeMarket === m ? 'white' : '#555',
              fontWeight: activeMarket === m ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Status Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
        <span onClick={() => setActiveStatus('Tất cả')} style={{ cursor: 'pointer', color: activeStatus === 'Tất cả' ? '#333' : '#666' }}>Tất cả ({countAll})</span>
        <span onClick={() => setActiveStatus('Sắp chạy')} style={{ cursor: 'pointer', color: activeStatus === 'Sắp chạy' ? '#333' : '#666' }}>Sắp chạy ({countUpcoming})</span>
        <span onClick={() => setActiveStatus('Đang chạy')} style={{ cursor: 'pointer', color: activeStatus === 'Đang chạy' ? '#333' : '#666' }}>Đang chạy ({countRunning})</span>
        <span style={{ color: '#2196f3' }}>Còn chỗ ({totalSlots})</span>
        <span style={{ color: 'red' }}>Hết chỗ ({outOfStock})</span>
      </div>

      <hr style={{ borderTop: '1px solid #ddd', marginBottom: '20px' }} />

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px 5px', textAlign: 'left', width: '40px' }}>STT</th>
              <th style={{ padding: '10px 5px', textAlign: 'left' }}>Sản phẩm Tour</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Ngày<br/>khởi hành</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Ngày đóng<br/>chỗ</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Tổng</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Giữ<br/>chỗ</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Đã<br/>bán</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Còn<br/>lại</th>
              <th style={{ padding: '10px 5px', textAlign: 'right' }}>Giá</th>
              <th style={{ padding: '10px 5px', textAlign: 'right' }}>Hoa hồng</th>
              <th style={{ padding: '10px 5px', textAlign: 'left' }}>Ghi chú</th>
              <th style={{ padding: '10px 5px', textAlign: 'center' }}>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {displayedTours.map((t, index) => {
              const totalSeats = Number(t.tour_info?.total_seats) || 0;
              const soldCount = t.public_stats?.soldCount || 0;
              const heldCount = t.public_stats?.heldCount || 0;
              const remain = totalSeats - soldCount - heldCount;

              let flightDetailsHtml = '';
              if (t.tour_info?.flight_details) {
                // simple split by newline for visual identicalness
                flightDetailsHtml = String(t.tour_info.flight_details).split('\\n').map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '11px', color: '#555' }}>
                     {/* Giả icon hãng bay dựa trên text (nếu có logo thì show, đây xài emoji tạm) */}
                     <span style={{color: '#d32f2f', fontWeight: 'bold'}}>{line}</span>
                  </div>
                ));
              }

              return (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top' }}>{index + 1}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top' }}>
                    <div style={{ color: '#2196f3', fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>{t.tour_code}</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px', color: '#1e293b' }}>{t.tour_name}</div>
                    {flightDetailsHtml}
                  </td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold' }}>{formatDateSafe(t.start_date)}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center' }}>
                     {t.tour_info?.deadline_date ? formatDateSafe(t.tour_info.deadline_date) : ''}
                  </td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold' }}>{totalSeats}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold' }}>{heldCount}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center', color: '#2196f3', fontWeight: 'bold' }}>{soldCount}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center', color: '#e53935', fontWeight: 'bold' }}>{remain}</td>
                  {/* Public prices are 0 normally to be safe unless specified explicitly for agencies, using DB values or 0 */}
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold' }}>
                    {t.tour_info?.b2b_price ? fmtMoney(t.tour_info.b2b_price) : '0'}
                  </td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'right', color: '#4caf50' }}>{t.tour_info?.b2b_commission ? fmtMoney(t.tour_info.b2b_commission) : '0'}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top' }} className="text-gray-500 text-xs">{t.tour_info?.internal_notes || ''}</td>
                  <td style={{ padding: '15px 5px', verticalAlign: 'top', textAlign: 'center' }}>
                    <button style={{ background: '#4caf50', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Giữ chỗ</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
