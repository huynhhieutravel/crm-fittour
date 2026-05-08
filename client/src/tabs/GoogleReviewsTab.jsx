import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Star, RefreshCw, LogIn, Filter, AlertTriangle, MessageCircle, User, MapPin, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi');

const GoogleReviewsTab = ({ users = [] }) => {
  const [status, setStatus] = useState({ connected: false, updated_at: null, is_syncing: false });
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/google/status');
      setStatus(res.data);
      if (res.data.is_syncing) {
        setSyncing(true);
      } else {
        setSyncing(false);
      }
    } catch (error) {
      console.error('Error fetching status', error);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/google/reviews', {
        params: { filterPriority, filterStatus }
      });
      if (res.data.success) {
        setReviews(res.data.reviews);
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto refresh status every 30s if syncing
    const interval = setInterval(() => {
      if (syncing) {
        fetchStatus();
        fetchReviews();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [syncing]);

  useEffect(() => {
    fetchReviews();
  }, [filterPriority, filterStatus]);

  const handleConnect = async () => {
    try {
      const res = await axios.get('/api/google/auth');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Lỗi khi tạo link kết nối');
      }
    } catch (error) {
      toast.error('Lỗi server khi tạo link kết nối');
    }
  };

  const handleSync = async () => {
    if (!status.connected) return toast.error('Vui lòng kết nối Google trước!');
    setSyncing(true);
    try {
      const res = await axios.post('/api/google/sync');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
        fetchStatus();
      } else {
        toast.error(res.data.message || 'Lỗi khi đồng bộ');
      }
    } catch (error) {
      // Check for 403 Forbidden specifically
      if (error.response?.status === 403) {
        toast.error('Lỗi 403: Google từ chối truy cập API. Vui lòng kiểm tra quyền truy cập Google Business Profile API.', { duration: 8000 });
      } else if (error.response?.status === 423) {
        toast.error('Hệ thống đang đồng bộ (Job đang chạy). Vui lòng đợi trong giây lát.', { duration: 5000 });
      } else {
        toast.error(error.response?.data?.message || 'Lỗi hệ thống khi đồng bộ');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      // Assume current user is assigned_to if moving to in_progress
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const payload = {
        status: newStatus,
        assigned_to: newStatus === 'new' ? null : currentUser.id
      };
      
      const res = await axios.put(`/api/google/reviews/${reviewId}/status`, payload);
      if (res.data.success) {
        toast.success('Đã cập nhật trạng thái');
        // Update local state without refetching
        setReviews(prev => prev.map(r => r.review_id === reviewId ? { ...r, status: newStatus, assigned_to: payload.assigned_to } : r));
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const getPriorityLabel = (rating) => {
    if (rating === 1) return { text: 'HIGH', color: '#ef4444', bg: '#fee2e2' };
    if (rating === 2 || rating === 3) return { text: 'MEDIUM', color: '#f59e0b', bg: '#fef3c7' };
    return { text: 'LOW', color: '#10b981', bg: '#d1fae5' };
  };

  const getStatusLabel = (s) => {
    if (s === 'resolved') return { text: 'Đã xử lý', color: '#10b981', icon: <CheckCircle size={14}/> };
    if (s === 'in_progress') return { text: 'Đang xử lý', color: '#3b82f6', icon: <RefreshCw size={14}/> };
    return { text: 'Mới', color: '#64748b', icon: <Clock size={14}/> };
  };

  return (
    <div className="google-reviews-tab" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>Đánh giá Google Maps</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Quản trị danh tiếng và giám sát chất lượng dịch vụ trên Google Business Profile</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {!status.connected ? (
            <button 
              onClick={handleConnect}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              <LogIn size={18} />
              Kết nối Google Maps
            </button>
          ) : (
            <button 
              onClick={handleSync}
              disabled={syncing}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: syncing ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              <RefreshCw size={18} className={syncing ? 'spin-animation' : ''} />
              {syncing ? 'Hệ thống đang đồng bộ...' : 'Đồng bộ ngay'}
            </button>
          )}
        </div>
      </div>

      {!status.connected && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertTriangle color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '15px' }}>Chưa kết nối Google Business Profile</h4>
            <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>Vui lòng bấm nút "Kết nối Google Maps" ở góc trên để bắt đầu lấy dữ liệu đánh giá của khách hàng. Lưu ý: Cần sử dụng tài khoản chủ sở hữu Map.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Tổng số đánh giá</p>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{stats.total || 0}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Điểm trung bình</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{stats.average_rating || '0.0'}</div>
            <Star color="#eab308" fill="#eab308" size={24} />
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Lần đồng bộ cuối</p>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginTop: '10px' }}>
            {status.updated_at ? dayjs(status.updated_at).format('DD/MM/YYYY HH:mm') : 'Chưa đồng bộ'}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={18} color="#64748b" />
          <span style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Mức độ (Priority):</span>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#f8fafc', fontSize: '14px' }}
          >
            <option value="">Tất cả mức độ</option>
            <option value="high">🔴 High (1 Sao)</option>
            <option value="medium">🟠 Medium (2-3 Sao)</option>
            <option value="low">🟢 Low (4-5 Sao)</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
          <span style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Trạng thái xử lý:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#f8fafc', fontSize: '14px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="new">⚪ Mới (Chưa xem)</option>
            <option value="in_progress">🔵 Đang xử lý</option>
            <option value="resolved">🟢 Đã xử lý</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Không có đánh giá nào phù hợp.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Reviewer & Priority</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', width: '45%' }}>Nội dung đánh giá</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Thông tin Map</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Xử lý CSKH</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => {
                const priority = getPriorityLabel(review.rating);
                const currentStatus = getStatusLabel(review.status);
                
                return (
                  <tr key={review.review_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {review.reviewer_profile_photo_url ? (
                          <img src={review.reviewer_profile_photo_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {review.reviewer_name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{review.reviewer_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {dayjs(review.create_time).format('DD/MM/YYYY HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Priority Badge */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', background: priority.bg, color: priority.color, borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>
                        PRIORITY: {priority.text}
                      </span>
                    </td>

                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={16} fill={star <= review.rating ? "#eab308" : "none"} color={star <= review.rating ? "#eab308" : "#cbd5e1"} />
                        ))}
                      </div>
                      <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' }}>
                        {review.comment || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Khách chỉ chấm sao, không để lại lời bình luận.</span>}
                      </div>

                      {/* Reply Box */}
                      {review.reply_comment && (
                        <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#3b82f6', marginBottom: '6px' }}>
                            <MessageCircle size={14}/>
                            Doanh nghiệp đã phản hồi:
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{review.reply_comment}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Cập nhật: {dayjs(review.reply_updated_time).format('DD/MM/YYYY HH:mm')}</div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#475569' }}>
                          <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
                          <div>
                            <div style={{ fontWeight: '500', color: '#334155' }}>Cơ sở (Location):</div>
                            <div>{review.location_name || 'Đang cập nhật'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#475569' }}>
                          <User size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
                          <div>
                            <div style={{ fontWeight: '500', color: '#334155' }}>Tài khoản Map:</div>
                            <div>{review.account_name || 'Đang cập nhật'}</div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      {/* Status Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: currentStatus.color, fontWeight: '600', fontSize: '13px', marginBottom: '12px' }}>
                        {currentStatus.icon} {currentStatus.text}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {review.status === 'new' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.review_id, 'in_progress')}
                            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Nhận xử lý
                          </button>
                        )}
                        {review.status === 'in_progress' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.review_id, 'resolved')}
                            style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Đánh dấu Hoàn tất
                          </button>
                        )}
                        {review.status === 'resolved' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.review_id, 'in_progress')}
                            style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Mở lại Ticket
                          </button>
                        )}
                      </div>

                      {review.assigned_to && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                          Phụ trách: {users?.find(u => u.id === review.assigned_to)?.name || `User ID ${review.assigned_to}`}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleReviewsTab;
