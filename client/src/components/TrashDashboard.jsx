import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TrashDashboard({ type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/audit-logs/trash?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể lấy dữ liệu thùng rác', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [type]);

  const handleRestore = async (id) => {
    const result = await Swal.fire({
      title: 'Khôi phục dữ liệu?',
      text: 'Dữ liệu này sẽ xuất hiện trở lại trên hệ thống.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Khôi phục',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#3b82f6'
    });

    if (result.isConfirmed) {
      try {
        await axios.post('/api/audit-logs/restore', { type, id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã khôi phục dữ liệu', 'success');
        fetchTrash();
      } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể khôi phục dữ liệu', 'error');
      }
    }
  };

  const filteredData = data.filter(item => {
    const search = searchTerm.toLowerCase();
    if (type === 'OP_TOUR') {
      return (item.code || '').toLowerCase().includes(search) || (item.tour_name || '').toLowerCase().includes(search);
    } else {
      return (item.booking_code || '').toLowerCase().includes(search) || (item.customer_name || '').toLowerCase().includes(search);
    }
  });

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px 8px 35px', border: '1px solid #cbd5e1', borderRadius: '4px', width: '300px' }}
          />
        </div>
        <button onClick={fetchTrash} style={{ padding: '8px 15px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px' }}>Mã</th>
              <th style={{ padding: '12px' }}>{type === 'OP_TOUR' ? 'Tên Tour' : 'Khách hàng'}</th>
              <th style={{ padding: '12px' }}>{type === 'OP_TOUR' ? 'Ngày khởi hành' : 'Số khách'}</th>
              <th style={{ padding: '12px' }}>{type === 'OP_TOUR' ? 'Trạng thái' : 'Doanh thu'}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Thùng rác trống</td>
              </tr>
            ) : filteredData.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{type === 'OP_TOUR' ? item.code : item.booking_code}</td>
                <td style={{ padding: '12px' }}>{type === 'OP_TOUR' ? item.tour_name : item.customer_name}</td>
                <td style={{ padding: '12px' }}>
                  {type === 'OP_TOUR' 
                    ? new Date(item.start_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }) 
                    : `${item.pax_count} khách`}
                </td>
                <td style={{ padding: '12px' }}>
                  {type === 'OP_TOUR' 
                    ? <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{item.status}</span>
                    : `${Number(item.total_price).toLocaleString()} đ`}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleRestore(item.id)}
                    style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Khôi phục
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
