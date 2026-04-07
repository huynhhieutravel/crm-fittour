import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, CalendarDays } from 'lucide-react';
import OpTourDetailDrawer from '../components/modals/OpTourDetailDrawer';
import OpTourAddCustomerModal from '../components/modals/OpTourAddCustomerModal';
import OpTourBookingListModal from '../components/modals/OpTourBookingListModal';

export default function OpToursTab({ currentUser }) {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMarket, setActiveMarket] = useState('Tất cả');
  const [activeStatus, setActiveStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingBookingData, setEditingBookingData] = useState(null);
  const [selectedCustomerTour, setSelectedCustomerTour] = useState(null);
  const [isBookingListOpen, setIsBookingListOpen] = useState(false);
  const [selectedBookingTour, setSelectedBookingTour] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/op-tours', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTours(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching OP tours:', error);
      setLoading(false);
    }
  };

  const handleOpenDrawer = (tour = null) => {
    setSelectedTour(tour);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTour(null);
    fetchTours(); // Refresh after edit
  };

  const handleOpenCustomerModal = () => {
    setEditingBookingData(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setEditingBookingData(booking);
    setIsCustomerModalOpen(true);
  };

  const handleOpenBookingList = (tour) => {
    setSelectedBookingTour(tour);
    setIsBookingListOpen(true);
  };


  const handleDeleteTour = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tour này?')) {
      try {
        await axios.delete(`http://localhost:5001/api/op-tours/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchTours();
      } catch (error) {
        console.error('Lỗi khi xóa', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  }

  // Derive unique markets from data dynamically
  const uniqueMarkets = ['Tất cả', ...new Set(tours.map(t => t.market).filter(Boolean))];
  const uniqueStatuses = ['Tất cả', ...new Set(tours.map(t => t.status).filter(Boolean))];

  // Filtering
  const filteredTours = tours.filter(t => {
    const matchSearch = t.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.tour_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMarket = activeMarket === 'Tất cả' || t.market === activeMarket;
    const matchStatus = activeStatus === 'Tất cả' || t.status === activeStatus;
    
    return matchSearch && matchMarket && matchStatus;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="tab-pane active" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>Tour Nhanh (Điều hành)</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Bản demo kiến trúc JSONB phẳng</p>
        </div>
        <button 
          onClick={() => handleOpenDrawer(null)}
          style={{
            background: '#ff5722',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Plus size={18} /> TẠO TOUR MỚI
        </button>
      </div>

      {/* Top Filter Bar (Markets) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
        {uniqueMarkets.map(m => (
          <button 
            key={m}
            onClick={() => setActiveMarket(m)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeMarket === m ? '1px solid #ff5722' : '1px solid #e2e8f0',
              background: activeMarket === m ? '#fff3e0' : 'white',
              color: activeMarket === m ? '#ff5722' : '#64748b',
              fontWeight: activeMarket === m ? '600' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar (Status & Search) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
            {uniqueStatuses.map(s => {
                const count = s === 'Tất cả' ? tours.length : tours.filter(t => t.status === s).length;
                return (
                    <button 
                        key={s}
                        onClick={() => setActiveStatus(s)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            color: activeStatus === s ? '#1e293b' : '#94a3b8',
                            fontWeight: activeStatus === s ? '600' : 'normal',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '5px'
                        }}
                    >
                        {s} ({count})
                    </button>
                )
            })}
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text"
            placeholder="Tìm kiếm khách hàng, Tour nhanh..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Primary Table - Compact Design */}
      <div style={{ background: 'white', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', color: '#1e293b', borderTop: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 8px', width: '30px' }}><input type="checkbox" /></th>
              <th style={{ padding: '12px 8px', width: '30px', fontWeight: 'bold' }}>STT</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Mã Tour</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold' }}>Tên Tour</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ngày khởi hành</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'right' }}>Giá</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Hoa<br/>Hồng</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Đã thu<br/>(Cọc)</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Tổng<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Giữ<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Đã<br/>bán</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Còn lại</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ngày đóng<br/>chỗ</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'center' }}>Ghi chú</th>
              <th style={{ padding: '12px 8px', fontWeight: 'bold', textAlign: 'right' }}>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map((tour, index) => {
              const total = Number(tour.tour_info?.total_seats || 0);
              
              // Lấy số liệu thật từ Data JSONB revenues
              let bookings = [];
              try {
                if (tour.revenues) {
                  bookings = typeof tour.revenues === 'string' ? JSON.parse(tour.revenues) : tour.revenues;
                  if (!Array.isArray(bookings)) bookings = [];
                }
              } catch (e) { bookings = []; }

              let reservedQty = 0;
              let soldQty = 0;
              let totalComm = 0;
              let totalPaid = 0;

              bookings.forEach(b => {
                 const st = b.status || 'Giữ chỗ';
                 const bQty = Number(b.qty || 0);

                 if (st === 'Huỷ' || st === 'Hủy' || st.includes('huỷ') || st.includes('hủy')) return;

                 if (st.includes('Giữ chỗ') || st.includes('Mới')) {
                     reservedQty += bQty;
                 } else {
                     soldQty += bQty;
                 }
                 
                 totalPaid += Number(b.paid || 0);

                 const pRows = b.raw_details?.pricingRows || [];
                 pRows.forEach(r => {
                     totalComm += (Number(r.comPerPax || 0) * Number(r.qty || 0)) + Number(r.comCTV || 0);
                 });
              });

              const remaining = total - soldQty - reservedQty;
              
              return (
              <tr key={tour.id} style={{ borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                <td style={{ padding: '12px 8px', borderLeft: '5px solid #fbbf24' }}><input type="checkbox" /></td>
                <td style={{ padding: '12px 8px', color: '#64748b' }}>{index + 1}</td>
                <td style={{ padding: '12px 8px' }}>
                   <div style={{ color: '#2563eb', fontWeight: '500', cursor: 'pointer' }} onClick={() => handleOpenDrawer(tour)}>
                      {tour.tour_code}
                   </div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                   <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#1e293b' }}>{tour.tour_name}</div>
                   <div style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span role="img" aria-label="plane">✈️</span> {tour.tour_info?.vehicle || 'Hàng không'} 
                   </div>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold' }}>
                   {tour.start_date ? new Date(tour.start_date).toLocaleDateString('vi-VN') : '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                    {tour.tour_info?.price_adult?.toLocaleString() || '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    {totalComm.toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#22c55e', fontWeight: 'bold' }}>
                    {totalPaid.toLocaleString()}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                    {total}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' }}>
                    {reservedQty}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
                    {soldQty}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
                    {remaining}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b' }}>
                    {tour.tour_info?.closing_date ? new Date(tour.tour_info.closing_date).toLocaleDateString('vi-VN') : '---'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b' }}>
                    {tour.notes || ''}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleOpenBookingList(tour)}
                    style={{ background: '#22c55e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '5px', fontSize: '11px' }}
                  >
                    + Giữ chỗ
                  </button>
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                     {currentUser?.role_name === 'admin' && (
                       <button onClick={() => handleDeleteTour(tour.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>Xóa</button>
                     )}
                  </div>
                </td>
              </tr>
            )})}
            {filteredTours.length === 0 && (
              <tr>
                <td colSpan="14" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy tour nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDrawerOpen && (
        <OpTourDetailDrawer 
          onClose={handleCloseDrawer} 
          tour={selectedTour} 
        />
      )}

      <OpTourBookingListModal
        isOpen={isBookingListOpen}
        onClose={() => setIsBookingListOpen(false)}
        tour={selectedBookingTour}
        onOpenAddCustomer={handleOpenCustomerModal}
        onEditBooking={handleEditBooking}
      />

      <OpTourAddCustomerModal 
        isOpen={isCustomerModalOpen} 
        initialData={editingBookingData}
        onClose={() => setIsCustomerModalOpen(false)} 
        onSave={async (data) => {
          try {
            await axios.post(`/api/op-tours/${selectedBookingTour.id}/bookings`, data, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Saved booking successfully!');
            setIsCustomerModalOpen(false);
            
            // Fetch single tour and update modal instantly
            const tourRes = await axios.get(`http://localhost:5001/api/op-tours/${selectedBookingTour.id}`, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedBookingTour(tourRes.data);
            
            // Update outer list in background
            fetchTours();
          } catch (err) {
            console.error('Lỗi khi lưu Booking:', err);
            alert('Lỗi khi lưu Booking. Vui lòng thử lại!');
          }
        }}
      />
    </div>
  );
}
