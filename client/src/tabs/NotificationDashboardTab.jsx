import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, CheckCircle2, AlertTriangle, ShieldAlert, Clock, RefreshCw, Trash2, Eye } from 'lucide-react';

const NotificationDashboardTab = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('sent');
  const [dlqList, setDlqList] = useState([]);
  const [suppressionList, setSuppressionList] = useState([]);
  const [sentList, setSentList] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, suppressed: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await axios.get('/api/notifications/stats', { headers });
      setStats(statsRes.data);

      if (activeTab === 'dlq') {
        const res = await axios.get('/api/notifications/dlq', { headers });
        setDlqList(res.data);
      } else if (activeTab === 'suppression') {
        const res = await axios.get('/api/notifications/suppression', { headers });
        setSuppressionList(res.data);
      } else if (activeTab === 'sent') {
        const res = await axios.get('/api/notifications/sent', { headers });
        setSentList(res.data);
      }
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Lỗi khi tải dữ liệu nhật ký email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (logId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`/api/notifications/dlq/${logId}/replay`, {}, { headers });
      if (addToast) addToast('Đã đưa vào hàng đợi gửi lại thành công', 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Lỗi khi gửi lại email', 'error');
    }
  };

  const handleUnban = async (email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn mở khóa email ${email}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/notifications/suppression/${email}`, { headers });
      if (addToast) addToast(`Đã mở khóa email ${email} thành công.`, 'success');
      fetchData();
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Lỗi khi mở khóa email', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="tab-pane active" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <Mail size={24} /> Nhật ký & Logs Gửi Email (System Outbox)
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Kiểm tra trạng thái, xem lại lịch sử email đã gửi và cấu hình xử lý email lỗi.
          </p>
        </div>
        <button 
          className="btn-secondary" 
          onClick={fetchData} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', background: 'white' }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Tải lại dữ liệu
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px', borderRadius: '10px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Đã gửi thành công (Sent)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#166534', marginTop: '4px' }}>{stats.sent}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '10px' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Email lỗi / DLQ (Failed)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#991b1b', marginTop: '4px' }}>{stats.failed}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ffedd5', color: '#c2410c', padding: '12px', borderRadius: '10px' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Bị chặn gửi (Suppressed)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#9a3412', marginTop: '4px' }}>{stats.suppressed}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '12px', borderRadius: '10px' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Đang chờ gửi (Pending)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#075985', marginTop: '4px' }}>{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu & Table Container */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fafafa', padding: '10px 20px 0 20px' }}>
          <button 
            style={{ 
              padding: '12px 20px', fontSize: '14px', fontWeight: 600, border: 'none', borderBottom: activeTab === 'sent' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'sent' ? '#3b82f6' : '#64748b', background: 'none', cursor: 'pointer', marginRight: '16px', transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('sent')}
          >
            Lịch sử đã gửi
          </button>
          <button 
            style={{ 
              padding: '12px 20px', fontSize: '14px', fontWeight: 600, border: 'none', borderBottom: activeTab === 'dlq' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'dlq' ? '#3b82f6' : '#64748b', background: 'none', cursor: 'pointer', marginRight: '16px', transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('dlq')}
          >
            Email lỗi (DLQ)
          </button>
          <button 
            style={{ 
              padding: '12px 20px', fontSize: '14px', fontWeight: 600, border: 'none', borderBottom: activeTab === 'suppression' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'suppression' ? '#3b82f6' : '#64748b', background: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('suppression')}
          >
            Email bị chặn (Suppression)
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
              <div className="loader" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
            </div>
          )}

          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                  {activeTab === 'sent' && (
                    <>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Người nhận</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Tiêu đề</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Kênh</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Trạng thái</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Thời gian gửi</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Chi tiết</th>
                    </>
                  )}
                  {activeTab === 'dlq' && (
                    <>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Người nhận</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Tiêu đề</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Lỗi xảy ra</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Số lần thử</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Thử lại lúc</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                    </>
                  )}
                  {activeTab === 'suppression' && (
                    <>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Địa chỉ Email</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Lý do chặn</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Chi tiết kỹ thuật</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Thời gian bị chặn</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Mở khóa</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {activeTab === 'sent' && (
                  sentList.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không có lịch sử gửi email thành công nào.</td></tr>
                  ) : (
                    sentList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{item.recipient_email}</td>
                        <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subject}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                            {item.channel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            background: item.status === 'sent' ? '#dcfce7' : '#fee2e2', 
                            color: item.status === 'sent' ? '#15803d' : '#b91c1c', 
                            padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{formatDate(item.created_at)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => { setSelectedLog(item); setShowDetailModal(true); }}
                            title="Xem chi tiết nội dung gửi"
                          >
                            <Eye size={16} color="#3b82f6" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}

                {activeTab === 'dlq' && (
                  dlqList.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Tuyệt vời! Không có email lỗi nào bị kẹt trong hàng đợi. 🎉</td></tr>
                  ) : (
                    dlqList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{item.recipient_email}</td>
                        <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subject}</td>
                        <td style={{ padding: '12px 16px', color: '#b91c1c', fontSize: '13px', maxWidth: '300px' }}>
                          <div style={{ fontWeight: 600 }}>{item.error_type}</div>
                          <div style={{ color: '#ef4444', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.error_message}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                            {item.retry_count} lần
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{formatDate(item.next_retry_at)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleReplay(item.id)}
                            title="Gửi lại ngay lập tức"
                          >
                            <RefreshCw size={12} /> Thử lại
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}

                {activeTab === 'suppression' && (
                  suppressionList.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không có địa chỉ email nào bị chặn gửi (Suppression list sạch).</td></tr>
                  ) : (
                    suppressionList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#b91c1c' }}>{item.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                            {item.reason}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.details || '-'}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{formatDate(item.created_at)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleUnban(item.email)}
                            title="Mở chặn để gửi lại bình thường"
                          >
                            <CheckCircle2 size={12} /> Mở chặn
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '700px', maxWidth: '90%', display: 'flex', flexDirection: 'column', maxHeight: '85%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Nội dung Email Đã gửi</h3>
              <button 
                onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', fontSize: '14px' }}>
              <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Người nhận:</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog.recipient_email}</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Tiêu đề:</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{selectedLog.subject}</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px' }}>
                <span style={{ fontWeight: 600, color: '#64748b' }}>Thời gian:</span>
                <span style={{ color: '#475569' }}>{formatDate(selectedLog.created_at)}</span>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fafafa', marginTop: '16px', minHeight: '150px' }}>
                {selectedLog.metadata?.html_body ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedLog.metadata.html_body }} />
                ) : (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Không lưu nội dung HTML mẫu</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => { setShowDetailModal(false); setSelectedLog(null); }}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDashboardTab;
