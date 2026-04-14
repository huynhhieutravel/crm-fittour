import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Select from 'react-select';

export default function AuditLogDashboard({ moduleType }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 30;

  // Filters
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  
  // Diff viewer state
  const [expandedLogId, setExpandedLogId] = useState(null);

  const actionOptions = [
    { value: 'CREATE', label: 'Tạo mới' },
    { value: 'UPDATE', label: 'Cập nhật' },
    { value: 'DELETE', label: 'Xóa' },
    { value: 'CONVERT', label: 'Thao tác nâng cao' }
  ];

  useEffect(() => {
    // Fetch users for filter dropdown
    axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
        if(Array.isArray(res.data)) {
           setUsers(res.data.map(u => ({ value: u.id, label: u.full_name })));
        }
    }).catch(console.error);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (moduleType) params.append('module', moduleType);
      if (selectedUser) params.append('user_id', selectedUser.value);
      if (actionType) params.append('action_type', actionType.value);

      const res = await axios.get(`/api/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleType, selectedUser, actionType]);

  const renderBadge = (action) => {
    if (action === 'CREATE') return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>TẠO MỚI</span>;
    if (action === 'UPDATE') return <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>CẬP NHẬT</span>;
    if (action === 'DELETE') return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>XÓA</span>;
    return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{action}</span>;
  };

  const renderDiff = (oldData, newData) => {
    if (!oldData && !newData) return <i>Không có dữ liệu json ghi nhận.</i>;
    if (!oldData && newData) return <i>Đã tạo mới bản ghi với đầy đủ các trường.</i>;
    if (oldData && !newData) return <i>Bản ghi đã bị xóa hoàn toàn khỏi hệ thống.</i>;

    // Compare objects
    const changes = [];
    const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    keys.forEach(key => {
        // Skip noisy fields
        if (key === 'updated_at' || key === 'created_at') return;

        let oval = oldData[key];
        let nval = newData[key];

        // Format dates if they look like ISO dates
        const isIsoString = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
        if (isIsoString(oval)) oval = new Date(oval).toLocaleDateString('vi-VN');
        if (isIsoString(nval)) nval = new Date(nval).toLocaleDateString('vi-VN');
        
        // Handle nested arrays/objects loosely
        if (typeof oval === 'object') oval = JSON.stringify(oval);
        if (typeof nval === 'object') nval = JSON.stringify(nval);

        if (oval !== nval && !(oval == null && nval === '') && !(oval === '' && nval == null)) {
            changes.push(
                <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <strong style={{ width: '120px', color: '#64748b' }}>{key}:</strong>
                    <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{oval == null || oval === 'null' ? 'Trống' : String(oval)}</span>
                    <span style={{ color: '#94a3b8' }}>➡️</span>
                    <span style={{ color: '#10b981', fontWeight: 500 }}>{nval == null || nval === 'null' ? 'Trống' : String(nval)}</span>
                </div>
            );
        }
    });

    if (changes.length === 0) return <i>Cập nhật nhưng không làm thay đổi giá trị của các trường.</i>;
    return <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '10px' }}>{changes}</div>;
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      
      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '15px', padding: '15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px' }}>
            <Filter size={18} color="#64748b" />
            <div style={{ width: '100%' }}>
                <Select
                    isClearable
                    placeholder="Lọc người thực hiện..."
                    options={users}
                    value={selectedUser}
                    onChange={setSelectedUser}
                />
            </div>
        </div>
        <div style={{ width: '200px' }}>
            <Select
                isClearable
                placeholder="Loại thao tác..."
                options={actionOptions}
                value={actionType}
                onChange={setActionType}
            />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px' }}>
              <th style={{ padding: '12px 15px', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Thời gian</th>
              <th style={{ padding: '12px 15px', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Nhân sự</th>
              <th style={{ padding: '12px 15px', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Hành động</th>
              <th style={{ padding: '12px 15px', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Chi tiết (Tóm tắt)</th>
              <th style={{ padding: '12px 15px', fontWeight: 600, borderBottom: '2px solid #e2e8f0', textAlign: 'center' }}>Tra cứu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải nhật ký...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy lịch sử hoạt động nào phù hợp.</td></tr>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: expandedLogId === log.id ? '#fcfcfc' : 'white' }}>
                    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#64748b' }}>
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 15px', fontSize: '14px', fontWeight: 500 }}>
                        {log.full_name || log.username || 'System Admin'}
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                        {renderBadge(log.action_type)}
                    </td>
                    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#334155' }}>
                        {log.details || `Đã thực hiện thao tác trên module ${log.entity_type}`}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        {(log.old_data || log.new_data) ? (
                            <button 
                                onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                style={{
                                    border: '1px solid #cbd5e1', background: expandedLogId === log.id ? '#e2e8f0' : 'white', cursor: 'pointer',
                                    padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, color: '#475569'
                                }}>
                                {expandedLogId === log.id ? 'Đóng ^' : 'Xem biến động'}
                            </button>
                        ) : (
                            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Không có JSON</span>
                        )}
                    </td>
                    </tr>
                    
                    {expandedLogId === log.id && (
                        <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                            <td colSpan="5" style={{ padding: '15px 30px' }}>
                                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Tra cứu lịch sử chỉnh sửa bản ghi (ID: {log.entity_id})
                                </div>
                                {renderDiff(log.old_data, log.new_data)}
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', borderTop: '1px solid #e2e8f0', gap: '15px' }}>
          <button 
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Trang {page} / {totalPages}</div>
          <button 
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
