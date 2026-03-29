import React from 'react';
import { Search } from 'lucide-react';

const BookingsTab = ({ 
  bookings, 
  bookingFilters, 
  setBookingFilters 
}) => {
  return (
    <div className="animate-fade-in">
      <div className="filter-bar">
        <div className="filter-group" style={{ flex: 1 }}>
          <label>TÌM BOOKING</label>
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
              style={{ paddingLeft: '36px' }} 
              placeholder="Mã booking, tên khách..." 
              value={bookingFilters.search} 
              onChange={e => setBookingFilters({...bookingFilters, search: e.target.value})} 
            />
          </div>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>TOUR</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {bookings.filter(b => (b.booking_code || '').toLowerCase().includes(bookingFilters.search.toLowerCase())).map(booking => (
              <tr key={booking.id}>
                <td style={{ fontWeight: 700, color: '#6366f1' }}>{booking.booking_code}</td>
                <td>{booking.customer_name}</td>
                <td style={{ fontSize: '0.85rem' }}>
                  {booking.tour_code ? `[${booking.tour_code}] ` : ''}{booking.tour_name}
                </td>
                <td style={{ fontWeight: 700 }}>{Number(booking.total_price).toLocaleString('vi-VN')}đ</td>
                <td>
                  <div className={`status-badge badge-${booking.booking_status === 'confirmed' ? 'won' : 'potential'}`}>
                    {booking.booking_status}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có dữ liệu booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTab;
