import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, CheckCircle, XCircle, Clock, Trash2, User, AlertCircle, Plus, Eye, Settings, Edit, Undo2
} from 'lucide-react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import LeaveRequestModal from '../components/modals/LeaveRequestModal';

const LeaveRequestsTab = ({ currentUser, users = [], checkPerm }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const [myBalance, setMyBalance] = useState({ total_days: 12, used_days: 0, available: 12 });
  const [todayLeaves, setTodayLeaves] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'config'
  const [allBalances, setAllBalances] = useState([]);
  const [globalDefault, setGlobalDefault] = useState(12);

  // Bulk Edit States
  const [selectedConfigIds, setSelectedConfigIds] = useState([]);
  const [filterConfigDept, setFilterConfigDept] = useState('');
  const [bulkDays, setBulkDays] = useState(12);
  
  const isManager = ['admin', 'manager', 'group_manager', 'operations_lead'].includes(currentUser?.role) || 
                    String(currentUser?.role || '').includes('manager') || 
                    String(currentUser?.role || '').includes('lead');

  const [form, setForm] = useState({
    target_user_id: currentUser?.id || '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    total_days: 1,
    reason: '',
    contact_phone: currentUser?.phone || '',
    handover_user_id: '',
    handover_note: ''
  });

  const handleOpenModal = (editData = null) => {
    if (editData) {
      setEditingLeave(editData);
    } else {
      setEditingLeave(null);
      setForm({
        target_user_id: currentUser?.id || '',
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        total_days: 1,
        reason: '',
        contact_phone: currentUser?.phone || '',
        handover_user_id: '',
        handover_note: ''
      });
    }
    setShowModal(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: 15, status: filterStatus, month: filterMonth, year: filterYear };
      if (filterUserId) params.user_id = filterUserId;

      const res = await axios.get('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalRows(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leaves/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBalance(res.data);
    } catch (err) { }
  };

  const fetchTodayLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/leaves/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayLeaves(res.data);
    } catch (err) {}
  };

  const fetchAllBalances = async () => {
    try {
      const token = localStorage.getItem('token');

      // Async fetch global setting
      axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
             if (r.data && r.data.leave_default_days) setGlobalDefault(parseFloat(r.data.leave_default_days));
        }).catch(()=>{});

      const res = await axios.get('/api/leaves/balance/all', {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: filterYear }
      });
      setAllBalances(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
  }, [page, filterStatus, filterUserId, filterMonth, filterYear]);

  useEffect(() => {
    fetchBalance();
    fetchTodayLeaves();
    if (isManager && viewMode === 'config') fetchAllBalances();
  }, [viewMode, filterYear]);

  useEffect(() => {
    // Auto calculate days when dates change
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setForm(prev => ({ ...prev, total_days: diffDays }));
      }
    }
  }, [form.start_date, form.end_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       const token = localStorage.getItem('token');
       await axios.post('/api/leaves', form, {
           headers: { Authorization: `Bearer ${token}` }
       });
       Swal.fire({
           toast: true, position: 'top-end', icon: 'success',
           title: 'Đã gửi đơn xin nghỉ phép', showConfirmButton: false, timer: 3000
       });
       setShowModal(false);
       fetchData();
       setForm({ ...form, reason: '', total_days: 1 });
    } catch (err) {
       Swal.fire('Lỗi', err.response?.data?.error || err.message, 'error');
    }
  };

  const handleAction = async (id, action) => {
      let rejectReason = '';
      if (action === 'reject') {
          const { value: text } = await Swal.fire({
              title: 'Lý do từ chối',
              input: 'textarea',
              inputPlaceholder: 'Nhập lý do...',
              showCancelButton: true
          });
          if (text === undefined) return;
          rejectReason = text;
      } else if (action === 'delete') {
          const result = await Swal.fire({
              title: 'Hủy đơn nghỉ phép?',
              text: 'Bạn có chắc chắn muốn hủy đơn này không?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33'
          });
          if (!result.isConfirmed) return;
      } else if (action === 'approve') {
          const result = await Swal.fire({
              title: 'Duyệt đơn?',
              text: 'Xác nhận duyệt đơn nghỉ phép này?',
              icon: 'question',
              showCancelButton: true
          });
          if (!result.isConfirmed) return;
      } else if (action === 'pending') {
          const result = await Swal.fire({
              title: 'Hủy duyệt đơn?',
              text: 'Bạn có chắc muốn chuyển đơn này về trạng thái chờ duyệt?',
              icon: 'warning',
              showCancelButton: true
          });
          if (!result.isConfirmed) return;
      }

      try {
          const token = localStorage.getItem('token');
          if (action === 'delete') {
              await axios.delete(`/api/leaves/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          } else {
              await axios.put(`/api/leaves/${id}/${action}`, { reject_reason: rejectReason }, { headers: { Authorization: `Bearer ${token}` } });
          }
          
          Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Thao tác thành công', showConfirmButton: false, timer: 3000
          });
          fetchData();
          fetchBalance();
      } catch (err) {
          Swal.fire('Lỗi', err.response?.data?.error || err.message, 'error');
      }
  };

  const updateBalance = async (userId, val) => {
      try {
          const token = localStorage.getItem('token');
          await axios.put('/api/leaves/balance', {
              user_id: userId, year: filterYear, total_days: val
          }, { headers: { Authorization: `Bearer ${token}` } });
          Swal.fire({
              toast: true, position: 'top-end', icon: 'success',
              title: 'Đã cập nhật phép năm', showConfirmButton: false, timer: 2000
          });
          fetchAllBalances();
      } catch (err) {
          Swal.fire('Lỗi', 'Không thể cập nhật: ' + err.message, 'error');
      }
  };

  const saveGlobalDefault = async () => {
      try {
          const token = localStorage.getItem('token');
          await axios.post('/api/settings/update', {
              settings: { leave_default_days: globalDefault.toString() }
          }, { headers: { Authorization: `Bearer ${token}` } });
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã lưu cấu hình mặc định (Áp dụng cho NV mới)', showConfirmButton: false, timer: 2000 });
          fetchAllBalances(); // To refresh DB coalesce and UI
      } catch (err) {
          Swal.fire('Lỗi', 'Không thể lưu mặc định: ' + err.message, 'error');
      }
  };

  const executeBulkUpdate = async () => {
      if (selectedConfigIds.length === 0) return Swal.fire('Lưu ý', 'Vui lòng chọn ít nhất 1 nhân viên để cập nhật', 'warning');
      Swal.fire({
          title: 'Cập nhật hàng loạt',
          text: `Áp mức ${bulkDays} ngày phép cho ${selectedConfigIds.length} nhân viên đã chọn trong năm ${filterYear}? Các mức cũ sẽ bị đè.`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Hủy'
      }).then(async (result) => {
          if (result.isConfirmed) {
              try {
                  const token = localStorage.getItem('token');
                  await axios.post('/api/leaves/balance/bulk', {
                      total_days: bulkDays, year: filterYear, userIds: selectedConfigIds
                  }, { headers: { Authorization: `Bearer ${token}` } });
                  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Đã cập nhật hàng loạt thành công', showConfirmButton: false, timer: 2000 });
                  setSelectedConfigIds([]);
                  fetchAllBalances();
              } catch (err) {
                  Swal.fire('Lỗi', 'Lỗi: ' + err.message, 'error');
              }
          }
      });
  };

  const renderStatus = (s) => {
      if (s === 'approved') return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 'bold' }}>Đã duyệt</span>;
      if (s === 'rejected') return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: 'bold' }}>Từ chối</span>;
      return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 'bold' }}>Chờ duyệt</span>;
  };

  const leaveTypes = {
      'annual': 'Nghỉ phép năm',
      'sick': 'Nghỉ ốm',
      'personal': 'Việc cá nhân',
      'maternity': 'Thai sản',
      'other': 'Khác'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Dashboard Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Quản lý Nghỉ Phép</h2>
              <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Phép năm khả dụng của bạn: <strong style={{ color: '#0f172a' }}>{myBalance.available} ngày</strong> (Tổng: {myBalance.total_days} - Đã dùng: {myBalance.used_days})</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
              {isManager && (
                  <button 
                      onClick={() => setViewMode(viewMode === 'list' ? 'config' : 'list')}
                      style={{ padding: '8px 16px', background: viewMode === 'list' ? '#f1f5f9' : '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#334155' }}
                  >
                      <Settings size={18} /> {viewMode === 'list' ? 'Cấu hình Phép' : 'Danh sách Đơn'}
                  </button>
              )}
              <button 
                  onClick={handleOpenModal}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
              >
                  <Plus size={18} /> Tạo đơn xin nghỉ
              </button>
          </div>
      </div>

      {todayLeaves.length > 0 && viewMode === 'list' && (
          <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <strong style={{ color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={18}/> Nhân sự vắng mặt hôm nay ({new Date().toLocaleDateString('vi-VN')}):</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {todayLeaves.map(l => (
                      <div key={l.id} style={{ background: 'white', padding: '5px 10px', borderRadius: '15px', border: '1px solid #bfdbfe', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <User size={14} color="#3b82f6"/> <b>{l.full_name}</b> {l.total_days < 1 ? `(${l.total_days} ngày)` : ''} {l.handover_name ? `(Bàn giao: ${l.handover_name})` : ''}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {viewMode === 'list' ? (
          <>
            {/* Filters */}
            <div className="lead-filter-grid" style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div className="filter-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Năm</label>
                    <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Tháng</label>
                    <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="">Tất cả các tháng</option>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Trạng thái</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
                {isManager && (
                    <div className="filter-group">
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Nhân viên</label>
                        <select value={filterUserId} onChange={e => setFilterUserId(e.target.value)} style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <option value="">Tất cả nhân viên</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{width: 50}}>ID</th>
                            <th>Nhân viên</th>
                            <th>Thời gian</th>
                            <th style={{textAlign: 'center'}}>Số ngày</th>
                            <th>Lý do & Bàn giao</th>
                            <th>Trạng thái</th>
                            <th style={{textAlign: 'right'}}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id}>
                                <td>#{item.id}</td>
                                <td>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.user_name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.team_name || 'NV'}</div>
                                    <div style={{ fontSize: '11px', color: '#3b82f6' }}>{leaveTypes[item.leave_type]}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px' }}>
                                        {item.dates?.map((d, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Calendar size={13} color="#64748b"/>
                                                {new Date(d.date).toLocaleDateString('vi-VN')}
                                                {d.session !== 'full' && (
                                                    <span style={{ fontSize: '11px', color: '#f59e0b', background: '#fef3c7', padding: '1px 4px', borderRadius: '4px' }}>
                                                        {d.session === 'morning' ? 'Sáng' : 'Chiều'}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                        Gửi lúc: {new Date(item.created_at).toLocaleString('vi-VN')}
                                    </div>
                                </td>
                                <td align="center">
                                    <div style={{ background: '#f8fafc', display: 'inline-block', padding: '4px 10px', borderRadius: '15px', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a' }}>{item.total_days}</div>
                                    {item.available_days !== null && item.available_days !== undefined && (() => {
                                        const avail = parseFloat(item.available_days);
                                        let color = '#10b981'; // Green
                                        if (avail < 0) color = '#ef4444'; // Red
                                        else if (avail <= 5) color = '#f97316'; // Orange
                                        
                                        return (
                                            <div style={{ fontSize: '11px', color: color, marginTop: '6px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                (Tồn: {avail})
                                            </div>
                                        );
                                    })()}
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px', whiteSpace: 'pre-line', maxWidth: '300px' }}>{item.reason}</div>
                                    {item.handover_name && (
                                        <div style={{ fontSize: '12px', background: '#f8fafc', padding: '5px', borderRadius: '4px', marginTop: '5px', borderLeft: '2px solid #cbd5e1' }}>
                                            <strong>Bàn giao:</strong> {item.handover_name}<br/>
                                            {item.handover_note && <span style={{ color: '#64748b' }}>"{item.handover_note}"</span>}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {renderStatus(item.status)}
                                    {item.status === 'rejected' && item.reject_reason && (
                                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>"{item.reject_reason}"</div>
                                    )}
                                    {item.status !== 'pending' && item.approved_by_name && (
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Bởi: {item.approved_by_name}</div>
                                    )}
                                </td>
                                <td align="right">
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                        {item.status === 'pending' && isManager && (
                                            <>
                                                <button onClick={() => handleAction(item.id, 'approve')} style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Duyệt">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button onClick={() => handleAction(item.id, 'reject')} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Từ chối">
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                        {item.status !== 'pending' && isManager && (
                                            <button onClick={() => handleAction(item.id, 'pending')} style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Hủy duyệt (Chuyển về Chờ duyệt)">
                                                <Undo2 size={16} />
                                            </button>
                                        )}
                                        {(() => {
                                            const today = new Date();
                                            today.setHours(0,0,0,0);
                                            const startDate = new Date(item.first_leave_date);
                                            const canEdit = (item.user_id === currentUser?.id && item.status === 'pending') || currentUser?.role === 'admin';
                                            const canDelete = (item.user_id === currentUser?.id || currentUser?.role === 'admin') && 
                                                              (startDate >= today || currentUser?.role === 'admin');
                                            
                                            return (
                                                <>
                                                    {canEdit && (
                                                        <button onClick={() => handleOpenModal(item)} style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Sửa đơn">
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => handleAction(item.id, 'delete')} style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Xóa">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && !loading && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Không có đơn nào</td></tr>
                        )}
                        {loading && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Đang tải...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination" style={{ marginTop: '20px' }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Truớc</button>
              <span>Trang {page} / {totalPages || 1}</span>
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>Sau</button>
            </div>
          </>
      ) : (
          /* CONFIG MODE */
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Cấu hình số phép năm <span style={{ color: '#3b82f6' }}>{filterYear}</span></h3>
                      <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={filterConfigDept} onChange={e => setFilterConfigDept(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <option value="">Tất cả phòng ban</option>
                            {[...new Set(allBalances.map(b => b.team_name).filter(Boolean))].map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                      </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Mức chung mặc định (Mới):</span>
                      <input 
                          type="number" step="0.5" value={globalDefault}
                          onChange={e => setGlobalDefault(e.target.value)}
                          style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <button onClick={saveGlobalDefault} style={{ padding: '6px 15px', background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Lưu mẫu
                      </button>
                  </div>
              </div>

              {/* Bulk Action Bar */}
              {selectedConfigIds.length > 0 && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: '#1e40af', fontWeight: 'bold' }}>
                          Đã chọn <span style={{ fontSize: '16px' }}>{selectedConfigIds.length}</span> nhân viên
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af' }}>Áp dụng mức phép:</span>
                          <input 
                              type="number" step="0.5" value={bulkDays}
                              onChange={e => setBulkDays(e.target.value)}
                              style={{ width: '70px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                          <button onClick={executeBulkUpdate} style={{ padding: '6px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                              Cập nhật hàng loạt
                          </button>
                      </div>
                  </div>
              )}
              
              <table className="data-table">
                  <thead>
                      <tr>
                          <th style={{ width: 40, textAlign: 'center' }}>
                              <input 
                                  type="checkbox" 
                                  checked={selectedConfigIds.length === allBalances.filter(b => !filterConfigDept || b.team_name === filterConfigDept).length && selectedConfigIds.length > 0}
                                  onChange={e => {
                                      const filtered = allBalances.filter(b => !filterConfigDept || b.team_name === filterConfigDept);
                                      if (e.target.checked) setSelectedConfigIds(filtered.map(b => b.user_id));
                                      else setSelectedConfigIds([]);
                                  }} 
                              />
                          </th>
                          <th>Phòng ban</th>
                          <th>Nhân viên</th>
                          <th>Số phép cấp (Ngày)</th>
                          <th>Đã dùng</th>
                          <th>Còn lại</th>
                          <th style={{maxWidth: 100}}>Thao tác</th>
                      </tr>
                  </thead>
                  <tbody>
                      {allBalances.filter(b => !filterConfigDept || b.team_name === filterConfigDept).map(b => (
                          <tr key={b.balance_id || b.user_id} style={{ background: selectedConfigIds.includes(b.user_id) ? '#f0f9ff' : 'transparent' }}>
                              <td style={{ textAlign: 'center' }}>
                                  <input 
                                      type="checkbox" 
                                      checked={selectedConfigIds.includes(b.user_id)}
                                      onChange={e => {
                                          if (e.target.checked) setSelectedConfigIds([...selectedConfigIds, b.user_id]);
                                          else setSelectedConfigIds(selectedConfigIds.filter(id => id !== b.user_id));
                                      }}
                                  />
                              </td>
                              <td>{b.team_name || '-'}</td>
                              <td><b>{b.full_name}</b> ({b.username})</td>
                              <td>
                                  <input 
                                      type="number" step="0.5" 
                                      defaultValue={b.total_days}
                                      onChange={(e) => { b._temp_days = parseFloat(e.target.value); }}
                                      style={{ padding: '5px 10px', width: '80px', borderRadius: '4px', border: '1px solid #cbd5e1', background: selectedConfigIds.includes(b.user_id) ? 'white' : '' }}
                                  />
                              </td>
                              <td style={{ color: '#ef4444' }}>{b.used_days}</td>
                              <td style={{ color: '#10b981', fontWeight: 'bold' }}>{parseFloat(b.total_days) - parseFloat(b.used_days)}</td>
                              <td>
                                  <button onClick={() => {
                                      if (b._temp_days !== undefined && b._temp_days !== parseFloat(b.total_days)) {
                                          updateBalance(b.user_id, b._temp_days);
                                      }
                                  }} style={{ padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {allBalances.length === 0 && (
                          <tr><td colSpan="6" style={{ textAlign: 'center' }}>Không có dữ liệu, hãy thử F5 trang.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <LeaveRequestModal 
            currentUser={currentUser} 
            users={users} 
            editData={editingLeave}
            onClose={() => setShowModal(false)} 
            onSuccess={() => { fetchData(); fetchBalance(); }} 
        />
      )}
    </div>
  );
};

export default LeaveRequestsTab;
