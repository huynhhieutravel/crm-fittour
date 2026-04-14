import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Download, FileText, CheckCircle, RefreshCw, X, Calendar, DollarSign, Filter, Grid } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

export default function PaymentVouchersTab() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '' });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVoucher = async (id, code, amount) => {
    if (!window.confirm(`XÁC NHẬN HỦY PHIẾU THU: ${code}?\n\nSố tiền ${Number(amount).toLocaleString('vi-VN')} vnđ sẽ MẤT khỏi mục "Đã thanh toán" của Booking hiện tại.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/vouchers/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchVouchers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy phiếu thu');
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (v.voucher_code || '').toLowerCase().includes(q) ||
             (v.title || '').toLowerCase().includes(q) ||
             (v.payer_name || '').toLowerCase().includes(q) ||
             (v.tour_code || '').toLowerCase().includes(q);
    }
    return true;
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredVouchers.map((v, i) => ({
      'STT': i + 1,
      'Số chứng từ': v.voucher_code,
      'Ngày chứng từ': new Date(v.created_at).toLocaleString('vi-VN'),
      'Thuộc Tour': v.tour_code,
      'Tên phiếu thu': v.title,
      'Số tiền thu': Number(v.amount),
      'Người đóng': v.payer_name,
      'SĐT': v.payer_phone,
      'HT Thanh toán': v.payment_method,
      'Trạng thái': v.status,
      'Người tạo': v.created_by_name
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Phiếu Thu");
    XLSX.writeFile(wb, "DanhSachPhieuThu.xlsx");
  };

  const totalAmount = filteredVouchers.filter(v => v.status !== 'Đã hủy').reduce((sum, v) => sum + Number(v.amount || 0), 0);

  // MOCK STATS to match screenshot initially
  const box1 = filteredVouchers.length;
  const box2 = totalAmount;
  const box3 = filteredVouchers.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length;
  const box4 = filteredVouchers.filter(v => v.booking_status !== 'Hoàn thành' && v.booking_status !== 'Đã thanh toán').length;
  const box5 = filteredVouchers.filter(v => ['Hoàn thành', 'Đã thanh toán', 'Kết thúc'].includes(v.booking_status)).length;

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          Phiếu Thu
        </h2>
      </div>

      {/* Basic Filters row similar to Screenshot 2 */}
      <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr)', gap: '15px', marginBottom: '15px' }}>
            <div>
               <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Tìm kiếm:</label>
               <input 
                 type="text" 
                 placeholder="Tên, SĐT, Email, Số chứng từ" 
                 value={filters.search}
                 onChange={e => setFilters({...filters, search: e.target.value})}
                 style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
               />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Tìm mã tour:</label>
               <input type="text" placeholder="Nhập mã tour" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Ngày chứng từ:</label>
               <input type="text" placeholder="Chọn thời gian chứng từ" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Trạng thái:</label>
               <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                  <option>-- Chọn trạng thái --</option>
               </select>
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Loại phiếu thu:</label>
               <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                  <option>-- Chọn --</option>
               </select>
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Tìm kiếm theo số tiền:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Từ" style={{ width: '100px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
              <input type="text" placeholder="Đến" style={{ width: '100px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
              <button style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}><Search size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards matching Screenshot */}
      <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#f59e0b', color: '#fff', padding: '20px', borderRadius: '8px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <div style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'right' }}>{box1}</div>
             <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>Chứng Từ</div>
           </div>
        </div>
        <div style={{ background: '#38bdf8', color: '#fff', padding: '20px', borderRadius: '8px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <div style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'right' }}>{Number(box2).toLocaleString('vi-VN')}</div>
             <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>Tổng Tiền Thu</div>
           </div>
        </div>
        <div style={{ background: '#f472b6', color: '#fff', padding: '20px', borderRadius: '8px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <div style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'right' }}>{box3}</div>
             <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>Tạo mới</div>
           </div>
        </div>
        <div style={{ background: '#a3e635', color: '#fff', padding: '20px', borderRadius: '8px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <div style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'right' }}>{box4}</div>
             <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>Đặt Cọc</div>
           </div>
        </div>
        <div style={{ background: '#ff7c43', color: '#fff', padding: '20px', borderRadius: '8px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
           <div style={{ position: 'relative', zIndex: 2 }}>
             <div style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'right' }}>{box5}</div>
             <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>Hoàn Thành</div>
           </div>
        </div>
      </div>

      {/* List Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
         <button style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Tạo phiếu thu</button>
         <button style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Import phiếu thu</button>
         <button onClick={exportExcel} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Export phiếu thu</button>
         
         <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
             <select style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', outline: 'none' }}>
                <option>Tất cả</option>
             </select>
             <button style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>File</button>
         </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
         <div style={{ padding: '12px 20px', borderBottom: '3px solid #14b8a6', color: '#0f766e', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Tất cả Phiếu thu ({filteredVouchers.length})</div>
         <div style={{ padding: '12px 20px', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>Chưa duyệt (0)</div>
         <div style={{ padding: '12px 20px', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>Đã duyệt ({filteredVouchers.length})</div>
         <div style={{ padding: '12px 20px', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>Không duyệt (0)</div>
         <div style={{ padding: '12px 20px', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}>Tất cả PT/PTC ({filteredVouchers.length})</div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', width: '40px' }}><input type="checkbox" /></th>
              <th style={{ padding: '12px', color: '#334155' }}>STT</th>
              <th style={{ padding: '12px', color: '#334155' }}>Số chứng từ</th>
              <th style={{ padding: '12px', color: '#334155' }}>Tên phiếu thu</th>
              <th style={{ padding: '12px', color: '#334155' }}>Mã tour</th>
              <th style={{ padding: '12px', color: '#334155' }}>Ngày chuyển</th>
              <th style={{ padding: '12px', color: '#334155' }}>Ngày chứng từ</th>
              <th style={{ padding: '12px', color: '#334155' }}>Ngày thanh toán</th>
              <th style={{ padding: '12px', color: '#334155' }}>Số tiền thu</th>
              <th style={{ padding: '12px', color: '#334155' }}>Người đóng</th>
              <th style={{ padding: '12px', color: '#334155' }}>Số điện thoại</th>
              <th style={{ padding: '12px', color: '#334155', maxWidth: '80px' }}>NV phụ trách</th>
              <th style={{ padding: '12px', color: '#334155', maxWidth: '80px' }}>PT Thanh toán</th>
              <th style={{ padding: '12px', color: '#334155' }}>Trạng thái</th>
              <th style={{ padding: '12px', color: '#334155' }}>Trạng thái duyệt</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="15" style={{ padding: '30px', color: '#64748b' }}>Đang tải biểu mẫu...</td></tr>
            ) : filteredVouchers.length === 0 ? (
              <tr><td colSpan="15" style={{ padding: '30px', color: '#64748b' }}>Không tìm thấy phiếu thu nào.</td></tr>
            ) : (
              filteredVouchers.map((v, i) => {
                const dateStr = new Date(v.created_at).toLocaleDateString('vi-VN');
                const timeStr = new Date(v.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                return (
                 <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                  <td style={{ padding: '15px 12px' }}><input type="checkbox" /></td>
                  <td style={{ padding: '15px 12px', color: '#475569' }}>{i + 1}</td>
                  
                  <td style={{ padding: '15px 12px', textAlign: 'left' }}>
                     <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{v.voucher_code}</div>
                     <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>{v.title}</div>
                  </td>
                  
                  <td style={{ padding: '15px 12px', textAlign: 'left' }}>
                     <div style={{ fontWeight: '500', color: '#334155', whiteSpace: 'nowrap' }}>{v.tour_name || 'Khách lẻ'}</div>
                  </td>

                  <td style={{ padding: '15px 12px', textAlign: 'left' }}>
                     <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{v.tour_code}</div>
                  </td>

                  <td style={{ padding: '15px 12px', color: '#475569' }}>
                     {dateStr}<br/>
                     <span style={{ fontSize: '11px' }}>{timeStr}</span>
                  </td>
                  
                  <td style={{ padding: '15px 12px', color: '#475569' }}>{dateStr}</td>
                  <td style={{ padding: '15px 12px', color: '#475569' }}>{dateStr}</td>

                  <td style={{ padding: '15px 12px', color: '#16a34a', fontWeight: 'bold', fontSize: '14px', textAlign: 'right' }}>
                     {Number(v.amount).toLocaleString('vi-VN')}
                  </td>

                  <td style={{ padding: '15px 12px', color: '#334155', fontWeight: '500', textTransform: 'uppercase' }}>
                     {v.payer_name || 'Khách lẻ'}
                  </td>

                  <td style={{ padding: '15px 12px', color: '#2563eb' }}>
                     {v.payer_phone || '---'}
                  </td>

                  <td style={{ padding: '15px 12px', color: '#334155' }}>
                     <div style={{ wordBreak: 'break-word', maxWidth: '80px' }}>{v.created_by_name}</div>
                  </td>

                  <td style={{ padding: '15px 12px', color: '#334155' }}>
                     <div style={{ wordBreak: 'break-word', maxWidth: '80px' }}>{v.payment_method}</div>
                  </td>

                  <td style={{ padding: '15px 12px' }}>
                     {v.booking_status === 'Hoàn thành' ? (
                       <span style={{ background: '#0ea5e9', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>HOÀN THÀNH</span>
                     ) : (
                       <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{v.booking_status || 'ĐẶT CỌC'}</span>
                     )}
                  </td>

                  <td style={{ padding: '15px 12px' }}>
                     <div style={{ fontSize: '12px', fontWeight: 'bold', color: v.status === 'Đã hủy' ? '#ef4444' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                         {v.status === 'Đã hủy' ? <><X size={14} color="#ef4444" /> ĐÃ HỦY</> : <>admin - <CheckCircle size={14} color="#16a34a" /></>}
                     </div>
                     {v.status !== 'Đã hủy' && (
                       <button onClick={() => handleCancelVoucher(v.id, v.voucher_code, v.amount)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #f87171', background: '#fff', color: '#ef4444', fontWeight: 'bold', padding: '3px 8px', borderRadius: '15px', marginTop: '6px', fontSize: '11px', cursor: 'pointer', margin: '6px auto 0' }}>
                           <X size={11} /> Hủy Phiếu
                       </button>
                     )}
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
        
        {/* Footer Sum */}
        {filteredVouchers.length > 0 && (
          <div style={{ padding: '15px', borderTop: '2px solid #e2e8f0', display: 'flex', background: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
             <div style={{ marginLeft: '150px' }}>Tổng cộng(chỉ trang này)</div>
             <div style={{ marginLeft: 'auto', marginRight: '400px' }}>Tổng thu : {totalAmount.toLocaleString('vi-VN')}</div>
          </div>
        )}
      </div>

    </div>
  );
}
