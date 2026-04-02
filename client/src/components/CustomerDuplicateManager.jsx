import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Check, X, AlertTriangle } from 'lucide-react';

const CustomerDuplicateManager = ({ onClose, onMerged }) => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const res = await axios.get('/api/customers/utils/duplicates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDuplicates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (group) => {
    // By default, make the older one the primary, delete others
    const sorted = [...group.customers].sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    const primaryId = sorted[0].id;
    const secondaryIds = sorted.slice(1).map(c => c.id);

    if(!window.confirm(`Gộp ${secondaryIds.length} bản ghi rác vào hồ sơ gốc (${sorted[0].name})? Không thể hoàn tác!`)) return;

    try {
      await axios.post('/api/customers/utils/merge', {
        primaryId,
        secondaryIds
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Gộp thành công!');
      fetchDuplicates();
      if(onMerged) onMerged();
    } catch (err) {
      alert('Lỗi khi gộp: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content animate-fade-in" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network className="text-orange-500" /> Quản lý Dữ liệu Trùng lặp
          </h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <div className="alert-warning" style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '12px', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
          <AlertTriangle size={18} />
          <div>Hệ thống phát hiện trùng lặp dựa trên <b>Số điện thoại</b>. Khi gộp, hồ sơ CŨ NHẤT sẽ được giữ lại, các hồ sơ khác sẽ bị xóa nhưng <b>lịch sử Mua Hàng & Ghi chú</b> sẽ được dồn về hồ sơ gốc.</div>
        </div>

        {loading ? (
          <div>Đang quét hệ thống...</div>
        ) : duplicates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#10b981', fontWeight: 600 }}>Dữ liệu sạch sẽ! Không tìm thấy bản ghi trùng lặp nào.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {duplicates.map((group, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1e293b' }}>
                    SĐT: {group.phone} <span className="badge badge-priority-medium">{group.count} hồ sơ</span>
                  </div>
                  <button className="btn-pro-save" onClick={() => handleMerge(group)}>
                    GỘP HỒ SƠ NÀY
                  </button>
                </div>
                
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Ngày gia nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.customers.map((c, i) => (
                      <tr key={c.id}>
                        <td>{c.name} {i===0 && <span className="badge badge-priority-low" style={{marginLeft:'8px'}}>Gốc</span>}</td>
                        <td>{c.email || 'N/A'}</td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDuplicateManager;
