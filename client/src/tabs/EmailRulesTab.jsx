import React, { useState, useEffect, useRef } from 'react';
import { Mail, Edit2, ShieldAlert, CheckCircle, XCircle, Sliders, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';

const EVENT_VARIABLES = {
  LEAVE_REQUEST_CREATED: [
    { code: 'employee_name', label: 'Tên nhân sự' },
    { code: 'leave_type', label: 'Loại nghỉ' },
    { code: 'reason', label: 'Lý do nghỉ' },
    { code: 'leave_dates', label: 'Chi tiết các ngày nghỉ' },
    { code: 'total_days', label: 'Số ngày' },
    { code: 'handover_to', label: 'Người nhận bàn giao' },
    { code: 'handover_note', label: 'Ghi chú bàn giao' },
    { code: 'contact_phone', label: 'SĐT liên hệ' },
    { code: 'created_at', label: 'Ngày tạo' }
  ],
  LEAVE_REQUEST_APPROVED: [
    { code: 'employee_name', label: 'Tên nhân sự' },
    { code: 'leave_type', label: 'Loại nghỉ' },
    { code: 'leave_dates', label: 'Chi tiết các ngày nghỉ' },
    { code: 'status', label: 'Trạng thái' },
    { code: 'processed_by', label: 'Người duyệt' },
    { code: 'updated_at', label: 'Ngày duyệt' }
  ],
  LEAVE_REQUEST_REJECTED: [
    { code: 'employee_name', label: 'Tên nhân sự' },
    { code: 'leave_type', label: 'Loại nghỉ' },
    { code: 'leave_dates', label: 'Chi tiết các ngày nghỉ' },
    { code: 'status', label: 'Trạng thái' },
    { code: 'processed_by', label: 'Người duyệt' },
    { code: 'reject_reason', label: 'Lý do từ chối' },
    { code: 'updated_at', label: 'Ngày duyệt' }
  ],
  LEAD_CREATED: [
    { code: 'lead_name', label: 'Tên Lead' },
    { code: 'phone', label: 'SĐT' },
    { code: 'email', label: 'Email' },
    { code: 'source', label: 'Nguồn' }
  ],
  LEAD_ASSIGNED: [
    { code: 'lead_name', label: 'Tên Lead' },
    { code: 'assigned_to', label: 'Người nhận' },
    { code: 'assigned_by', label: 'Người giao' }
  ],
  LEAD_STATUS_CHANGED: [
    { code: 'lead_name', label: 'Tên Lead' },
    { code: 'old_status', label: 'Trạng thái cũ' },
    { code: 'new_status', label: 'Trạng thái mới' },
    { code: 'updated_by', label: 'Người cập nhật' }
  ],
  BOOKING_CREATED: [
    { code: 'customer_name', label: 'Tên khách' },
    { code: 'tour_code', label: 'Mã Tour' },
    { code: 'total_amount', label: 'Tổng tiền' },
    { code: 'booking_date', label: 'Ngày đặt' }
  ],
  BOOKING_CONFIRMED: [
    { code: 'customer_name', label: 'Tên khách' },
    { code: 'tour_code', label: 'Mã Tour' },
    { code: 'total_amount', label: 'Tổng tiền' }
  ],
  BOOKING_CANCELLED: [
    { code: 'customer_name', label: 'Tên khách' },
    { code: 'tour_code', label: 'Mã Tour' },
    { code: 'reason', label: 'Lý do hủy' }
  ],
  TOUR_CREATED: [
    { code: 'tour_code', label: 'Mã Tour' },
    { code: 'tour_name', label: 'Tên Tour' },
    { code: 'start_date', label: 'Ngày đi' },
    { code: 'end_date', label: 'Ngày về' }
  ],
  INVOICE_CREATED: [
    { code: 'invoice_code', label: 'Mã Hóa đơn' },
    { code: 'amount', label: 'Số tiền' },
    { code: 'customer_name', label: 'Tên khách' }
  ],
  PAYMENT_RECEIVED: [
    { code: 'invoice_code', label: 'Mã Hóa đơn' },
    { code: 'amount', label: 'Số tiền' },
    { code: 'customer_name', label: 'Tên khách' }
  ],
  USER_CREATED: [
    { code: 'username', label: 'Tài khoản' },
    { code: 'email', label: 'Email' }
  ],
  PASSWORD_RESET: [
    { code: 'username', label: 'Tài khoản' },
    { code: 'email', label: 'Email' }
  ],
  MEETING_ROOM_BOOKED: [
    { code: 'organizer_name', label: 'Người đặt' },
    { code: 'title', label: 'Tiêu đề' },
    { code: 'meeting_date', label: 'Ngày họp' },
    { code: 'start_time', label: 'Giờ bắt đầu' },
    { code: 'end_time', label: 'Giờ kết thúc' },
    { code: 'description', label: 'Mô tả' },
    { code: 'bu', label: 'Business Unit' },
    { code: 'created_at', label: 'Ngày tạo' }
  ],
  DEFAULT: [
    { code: 'user_name', label: 'Tên người dùng' },
    { code: 'action', label: 'Hành động' },
    { code: 'date', label: 'Ngày tháng' },
    { code: 'status', label: 'Trạng thái' },
    { code: 'amount', label: 'Số tiền' },
    { code: 'reason', label: 'Lý do' },
    { code: 'code', label: 'Mã code' },
    { code: 'name', label: 'Tên chung' }
  ]
};

function EmailRulesTab({ user, addToast }) {
  const [rules, setRules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [systemEvents, setSystemEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const bodyRef = useRef(null);

  const [formData, setFormData] = useState({
    event_code: '',
    event_name: '',
    description: '',
    email_groups: [], // Array of { value, label }
    external_emails: '',
    cc_groups: [],
    cc_external_emails: '',
    bcc_groups: [],
    bcc_external_emails: '',
    subject_template: '',
    body_template: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'manager') return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [rulesRes, groupsRes, eventsRes] = await Promise.all([
        axios.get('/api/email-rules', config),
        axios.get('/api/email-groups', config),
        axios.get('/api/email-rules/events', config)
      ]);
      
      setRules(rulesRes.data);
      setGroups(groupsRes.data);
      setSystemEvents(eventsRes.data);
    } catch (err) {
      addToast('Lỗi khi tải cấu hình gửi email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setCurrentRule(rule);
      const ruleGroups = rule.email_groups || [];
      const selectedOptions = groups
        .filter(g => ruleGroups.includes(g.code))
        .map(g => ({ value: g.code, label: `${g.name} (${g.code})` }));

      const ccRuleGroups = rule.cc_groups || [];
      const ccSelectedOptions = groups
        .filter(g => ccRuleGroups.includes(g.code))
        .map(g => ({ value: g.code, label: `${g.name} (${g.code})` }));

      const bccRuleGroups = rule.bcc_groups || [];
      const bccSelectedOptions = groups
        .filter(g => bccRuleGroups.includes(g.code))
        .map(g => ({ value: g.code, label: `${g.name} (${g.code})` }));

      setFormData({
        event_code: rule.event_code,
        event_name: rule.event_name,
        description: rule.description || '',
        email_groups: selectedOptions,
        external_emails: (rule.external_emails || []).join(', '),
        cc_groups: ccSelectedOptions,
        cc_external_emails: (rule.cc_external_emails || []).join(', '),
        bcc_groups: bccSelectedOptions,
        bcc_external_emails: (rule.bcc_external_emails || []).join(', '),
        subject_template: rule.subject_template || '',
        body_template: rule.body_template || '',
        is_active: rule.is_active !== undefined ? rule.is_active : true
      });
    } else {
      setCurrentRule(null);
      setFormData({
        event_code: '',
        event_name: '',
        description: '',
        email_groups: [],
        external_emails: '',
        cc_groups: [],
        cc_external_emails: '',
        bcc_groups: [],
        bcc_external_emails: '',
        subject_template: '',
        body_template: '',
        is_active: true
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        event_code: formData.event_code.toUpperCase().replace(/\s+/g, '_'),
        event_name: formData.event_name,
        description: formData.description,
        email_groups: formData.email_groups.map(o => o.value),
        external_emails: formData.external_emails.split(',').map(e => e.trim()).filter(e => e),
        cc_groups: formData.cc_groups.map(o => o.value),
        cc_external_emails: formData.cc_external_emails.split(',').map(e => e.trim()).filter(e => e),
        bcc_groups: formData.bcc_groups.map(o => o.value),
        bcc_external_emails: formData.bcc_external_emails.split(',').map(e => e.trim()).filter(e => e),
        subject_template: formData.subject_template,
        body_template: formData.body_template,
        is_active: formData.is_active
      };

      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (currentRule) {
        await axios.put(`/api/email-rules/${currentRule.id}`, payload, config);
        addToast('Cập nhật cấu hình email thành công', 'success');
      } else {
        await axios.post('/api/email-rules', payload, config);
        addToast('Thêm rule email thành công', 'success');
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Lỗi khi lưu cấu hình', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa rule này không? Hệ thống sẽ ngừng tự động gửi email cho sự kiện này.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/email-rules/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Xóa rule thành công', 'success');
      fetchData();
    } catch (err) {
      addToast('Lỗi khi xóa rule', 'error');
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <div className="p-6">Bạn không có quyền truy cập trang này.</div>;
  }

  // Map groups to select options
  const groupOptions = groups.map(g => ({
    value: g.code,
    label: `${g.name} (${g.code})`
  }));

  // Map system events to grouped select options
  const eventOptions = Object.entries(
    systemEvents.reduce((acc, ev) => {
      const cat = ev.category || 'Khác';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ value: ev.code, label: `${ev.label} (${ev.code})`, meta: ev });
      return acc;
    }, {})
  ).map(([category, options]) => ({ label: category, options }));

  const availableVars = EVENT_VARIABLES[formData.event_code] || EVENT_VARIABLES.DEFAULT;

  const insertVariable = (variable) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.body_template || '';
    const insertText = `{{${variable}}}`;
    
    const newText = currentText.substring(0, start) + insertText + currentText.substring(end);
    
    setFormData(prev => ({
      ...prev,
      body_template: newText
    }));

    // Đặt lại con trỏ chuột ngay sau chuỗi vừa chèn
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length, start + insertText.length);
    }, 0);
  };

  return (
    <div className="tab-pane active" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={24} /> Cấu hình Gửi Email Tự động (Triggers & Rules)
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Thiết lập khi nào hệ thống tự động gửi email, gửi cho nhóm email nào, và bật/tắt trigger gửi.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Thêm Rule Mới
        </button>
      </div>

      <div className="table-responsive">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>SỰ KIỆN (TRIGGER)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Chi tiết sự kiện</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Nhận bởi Nhóm (Email Groups)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Email ngoài nhận</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Trạng thái gửi</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa cấu hình rule gửi email nào.</td></tr>
            ) : (
              rules.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#ef4444' }}>{r.event_code}</code>
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.event_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{r.description}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {r.email_groups && r.email_groups.length > 0 ? (
                        r.email_groups.map(gcode => {
                          const grp = groups.find(g => g.code === gcode);
                          return (
                            <span key={gcode} style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                              {grp ? grp.name : gcode}
                            </span>
                          );
                        })
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>- Không chọn nhóm -</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569' }}>
                    {r.external_emails && r.external_emails.length > 0 ? (
                      r.external_emails.join(', ')
                    ) : (
                      <span style={{ color: '#94a3b8' }}>- Không có -</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: r.is_active ? '#dcfce7' : '#fee2e2',
                      color: r.is_active ? '#166534' : '#991b1b'
                    }}>
                      {r.is_active ? 'Kích hoạt' : 'Tạm tắt'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => handleOpenModal(r)} title="Cấu hình gửi">
                      <Edit2 size={16} color="#3b82f6" />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(r.id)} title="Xóa">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {currentRule ? 'Cấu hình Gửi Email' : 'Thêm Rule Email Mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Sự kiện (Event Code) *</label>
                {currentRule ? (
                  <>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.event_code || ''}
                      disabled
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f1f5f9' }}
                    />
                    <small style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <ShieldAlert size={12}/> Event Code là API Contract, không được phép sửa.
                    </small>
                  </>
                ) : (
                  <Select
                    options={eventOptions}
                    value={eventOptions.flatMap(g => g.options).find(o => o.value === formData.event_code) || null}
                    onChange={selected => {
                      setFormData({
                        ...formData, 
                        event_code: selected ? selected.value : '',
                        event_name: selected ? selected.meta.label : ''
                      });
                    }}
                    placeholder="Chọn sự kiện hệ thống..."
                    noOptionsMessage={() => "Không tìm thấy sự kiện nào"}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  />
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Tên sự kiện *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.event_name || ''}
                  onChange={e => setFormData({...formData, event_name: e.target.value})}
                  required
                  placeholder="VD: Gửi thông báo khi tạo module"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mô tả</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Gửi đến Nhóm Email (Email Groups)</label>
                <Select
                  isMulti
                  options={groupOptions}
                  value={formData.email_groups}
                  onChange={selected => setFormData({...formData, email_groups: selected || []})}
                  placeholder="Chọn nhóm email..."
                  noOptionsMessage={() => "Không tìm thấy nhóm email nào"}
                  menuPortalTarget={document.body}
                  styles={{ 
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    valueContainer: base => ({ ...base, maxHeight: '120px', overflowY: 'auto' })
                  }}
                />
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>Hệ thống sẽ tự động gửi email cho tất cả thành viên trong nhóm được chọn.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email nhận trực tiếp (ngoài hệ thống)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.external_emails}
                  onChange={e => setFormData({...formData, external_emails: e.target.value})}
                  placeholder="Ví dụ: ceo@fittour.vn, admin@fittour.vn"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>Các địa chỉ email ngoài hệ thống cách nhau bằng dấu phẩy.</small>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Đồng gửi (CC)</h4>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>CC Nhóm Email</label>
                    <Select
                      isMulti
                      options={groupOptions}
                      value={formData.cc_groups}
                      onChange={selected => setFormData({...formData, cc_groups: selected || []})}
                      placeholder="Chọn nhóm..."
                      menuPortalTarget={document.body}
                      styles={{ 
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        valueContainer: base => ({ ...base, maxHeight: '100px', overflowY: 'auto' })
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>CC Email ngoài</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.cc_external_emails}
                      onChange={e => setFormData({...formData, cc_external_emails: e.target.value})}
                      placeholder="vd: cc@domain.com"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Gửi ẩn danh (BCC)</h4>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>BCC Nhóm Email</label>
                    <Select
                      isMulti
                      options={groupOptions}
                      value={formData.bcc_groups}
                      onChange={selected => setFormData({...formData, bcc_groups: selected || []})}
                      placeholder="Chọn nhóm..."
                      menuPortalTarget={document.body}
                      styles={{ 
                        menuPortal: base => ({ ...base, zIndex: 9999 }),
                        valueContainer: base => ({ ...base, maxHeight: '100px', overflowY: 'auto' })
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px' }}>BCC Email ngoài</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.bcc_external_emails}
                      onChange={e => setFormData({...formData, bcc_external_emails: e.target.value})}
                      placeholder="vd: bcc@domain.com"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Nội dung Tùy chỉnh (Templates)</h4>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Tiêu đề Email (Subject Template)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.subject_template}
                    onChange={e => setFormData({...formData, subject_template: e.target.value})}
                    placeholder="VD: [FIT Tour] Có đơn nghỉ phép mới từ {{user_name}}"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>Để trống để dùng tiêu đề mặc định. Có thể dùng biến động như <code>{`{{ten_truong}}`}</code>.</small>
                </div>
                
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Lời mở đầu (Body Template)</label>
                  <textarea 
                    ref={bodyRef}
                    className="form-control" 
                    value={formData.body_template}
                    onChange={e => setFormData({...formData, body_template: e.target.value})}
                    placeholder="Kính gửi ban giám đốc,\n\nNhân sự {{user_name}} vừa tạo đơn xin nghỉ phép..."
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', marginRight: '8px' }}>Biến động có sẵn (nhấn để chèn vào vị trí con trỏ):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {availableVars.map(v => (
                        <span 
                          key={v.code} 
                          onClick={() => insertVariable(v.code)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#334155', display: 'inline-flex', alignItems: 'center' }}
                          title={v.label}
                        >
                          <Plus size={12} style={{ marginRight: '4px' }} /> {`{{${v.code}}}`} <span style={{color: '#94a3b8', marginLeft: '4px', fontSize: '11px'}}>({v.label})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <small style={{ color: '#64748b', marginTop: '8px', display: 'block' }}>Nội dung này sẽ xuất hiện phía trên Bảng chi tiết sự kiện mặc định.</small>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isRuleActiveToggle"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isRuleActiveToggle" style={{ margin: 0, fontWeight: 500, cursor: 'pointer' }}>
                  Kích hoạt tự động gửi cho sự kiện này (Active)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailRulesTab;
