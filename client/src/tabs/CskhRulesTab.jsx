import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, ToggleLeft, ToggleRight, Save, RefreshCw, AlertTriangle, Clock, Zap, Info } from 'lucide-react';

const TRIGGERS_MAP = {
  departure_upcoming: { label: 'Trước khởi hành', icon: '✈️', desc: 'Task được tạo N ngày TRƯỚC ngày khởi hành' },
  departure_completed: { label: 'Sau kết thúc tour', icon: '🏁', desc: 'Task được tạo N ngày SAU khi tour kết thúc' },
  customer_reactivation: { label: 'Khách không hoạt động', icon: '💤', desc: 'Quét khách đã N ngày chưa book tour mới' },
  birthday_upcoming: { label: 'Sinh nhật sắp tới', icon: '🎂', desc: 'Task chúc mừng sinh nhật N ngày trước' },
};

const COLOR_MAP = {
  red: { label: '🔴 Đỏ — Cần gấp', style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } },
  yellow: { label: '🟡 Vàng — Bình thường', style: { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } },
  green: { label: '🟢 Xanh — Thấp', style: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' } },
  gray: { label: '⚪ Xám — Ghi chú', style: { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' } },
};

const CskhRulesTab = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/cskh/rules', { headers });
      setRules(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleUpdate = async (ruleId, updates) => {
    try {
      setSaving(ruleId);
      await axios.put(`/api/cskh/rules/${ruleId}`, updates, { headers });
      fetchRules();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(null);
    }
  };

  const handleFieldChange = (ruleId, field, value) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, [field]: value } : r));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={22} color="#6366f1" /> Cấu Hình Rules Tự Động
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Điều chỉnh thời gian, số lần retry, bật/tắt từng rule — Hệ thống Cron quét mỗi 15 phút.</p>
          </div>
          <button onClick={fetchRules}
            style={{ padding: '0.5rem 1rem', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          ><RefreshCw size={16} /> Tải lại</button>
        </div>
      </div>

      {/* Rules Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rules.map(rule => {
            const trigger = TRIGGERS_MAP[rule.trigger_event] || { label: rule.trigger_event, icon: '⚙️', desc: '' };
            const color = COLOR_MAP[rule.default_color] || COLOR_MAP.yellow;
            const isSaving = saving === rule.id;

            return (
              <div key={rule.id} style={{
                background: '#fff', borderRadius: '16px', padding: '1.5rem',
                border: '1px solid #f1f5f9', transition: 'all 0.25s',
                opacity: rule.is_active ? 1 : 0.6
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Row 1: Name + Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{trigger.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{rule.rule_name}</span>
                      <span style={{ ...color.style, padding: '2px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>{COLOR_MAP[rule.default_color]?.label || rule.default_color}</span>
                      {(rule.active_tasks || 0) > 0 && (
                        <span style={{ background: '#dbeafe', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>{rule.active_tasks} task đang chạy</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', marginRight: '8px' }}>{trigger.label}</span>
                      {rule.description || trigger.desc}
                    </div>
                  </div>

                  {/* Toggle Active */}
                  <button
                    onClick={() => handleUpdate(rule.id, { is_active: !rule.is_active })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    title={rule.is_active ? 'Đang bật — bấm để tắt' : 'Đang tắt — bấm để bật'}
                  >
                    {rule.is_active ?
                      <ToggleRight size={36} color="#22c55e" /> :
                      <ToggleLeft size={36} color="#cbd5e1" />
                    }
                  </button>
                </div>

                {/* Row 2: Editable fields */}
                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      <Clock size={11} /> Offset (ngày)
                    </label>
                    <input type="number" value={rule.offset_days}
                      onChange={e => handleFieldChange(rule.id, 'offset_days', parseInt(e.target.value) || 0)}
                      style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}
                    />
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px', textAlign: 'center' }}>
                      {rule.offset_days < 0 ? `Trước ${Math.abs(rule.offset_days)} ngày` : `Sau ${rule.offset_days} ngày`}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      <Zap size={11} /> Retry tối đa
                    </label>
                    <input type="number" min={0} max={10} value={rule.retry_max}
                      onChange={e => handleFieldChange(rule.id, 'retry_max', parseInt(e.target.value) || 0)}
                      style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      <Clock size={11} /> Giãn cách retry (ngày)
                    </label>
                    <input type="number" min={1} max={30} value={rule.retry_interval_days}
                      onChange={e => handleFieldChange(rule.id, 'retry_interval_days', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Màu ưu tiên
                    </label>
                    <select value={rule.default_color}
                      onChange={e => handleFieldChange(rule.id, 'default_color', e.target.value)}
                      style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      {Object.entries(COLOR_MAP).map(([val, info]) => (
                        <option key={val} value={val}>{info.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={() => handleUpdate(rule.id, {
                      offset_days: rule.offset_days,
                      retry_max: rule.retry_max,
                      retry_interval_days: rule.retry_interval_days,
                      default_color: rule.default_color
                    })}
                      disabled={isSaving}
                      style={{
                        width: '100%', height: '38px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                        border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                        background: isSaving ? '#e2e8f0' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    ><Save size={14} /> {isSaving ? 'Đang lưu...' : 'Lưu'}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div style={{ marginTop: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: '1.5' }}>
          <strong>Cách hoạt động:</strong> Hệ thống Cron quét dữ liệu tour/bookings mỗi <strong>15 phút</strong>.
          Khi tìm thấy khách hàng phù hợp với rule (VD: tour khởi hành sau 7 ngày), hệ thống tự tạo task CSKH.
          Task không bị trùng lặp (Unique constraint). Thay đổi cấu hình sẽ áp dụng cho các task <strong>mới</strong> từ lần quét tiếp theo.
        </div>
      </div>
    </div>
  );
};

export default CskhRulesTab;
