import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Smartphone, BedDouble, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickLogisticsDrawer({ isOpen, onClose, tourId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Category + Quantity state
  const [simCounts, setSimCounts] = useState({ physical: 0, esim: 0, none: 0 });
  const [roomCounts, setRoomCounts] = useState({ dbl: 0, twin: 0, trip: 0, sgl: 0, odd: 0 });
  const [demographics, setDemographics] = useState({ adult: 0, child: 0 });
  const [surcharges, setSurcharges] = useState([]);

  useEffect(() => {
    if (isOpen && tourId) {
      loadData();
    }
  }, [isOpen, tourId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/departure-cashflow/departures/${tourId}/quick-logistics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTourData(res.data.tour);
      setBookings(res.data.bookings || []);
      
      const log = res.data.logistics || {};
      setSimCounts(log.sim_counts || { physical: 0, esim: 0, none: 0 });
      setRoomCounts(log.room_counts || { dbl: 0, twin: 0, trip: 0, sgl: 0, odd: 0 });
      setDemographics(log.demographics || { adult: 0, child: 0 });
      setSurcharges(Array.isArray(log.surcharges) ? log.surcharges : []);
    } catch (err) {
      console.error('Error loading quick logistics:', err);
      toast.error('Không thể tải thông tin sổ tay hậu cần');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSurcharge = () => {
    setSurcharges(prev => [...prev, { title: '', amount: 0, note: '' }]);
  };

  const handleRemoveSurcharge = (index) => {
    setSurcharges(prev => prev.filter((_, i) => i !== index));
  };

  const handleSurchargeChange = (index, field, value) => {
    setSurcharges(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/departure-cashflow/departures/${tourId}/quick-logistics`, {
        sim_counts: simCounts,
        room_counts: roomCounts,
        demographics: demographics,
        surcharges: surcharges
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Đã lưu sổ tay ghi nhận hậu cần thành công!');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving quick logistics:', err);
      toast.error('Lỗi lưu sổ tay hậu cần: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalPax = bookings.reduce((sum, b) => sum + (parseInt(b.pax_count) || 0), 0);
  const totalSimAssigned = (parseInt(simCounts.physical) || 0) + (parseInt(simCounts.esim) || 0) + (parseInt(simCounts.none) || 0);
  const totalSurchargesAmount = surcharges.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '580px',
        height: '100%',
        backgroundColor: 'var(--card-bg, #ffffff)',
        color: 'var(--text, #0f172a)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--card-bg, #ffffff)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text, #0f172a)' }}>
              Sổ Tay Hậu Cần Đoàn
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-light, #64748b)', margin: '4px 0 0' }}>
              {tourData?.code} &bull; {totalPax} khách đã ghi nhận
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light, #64748b)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light, #64748b)' }}>
            Đang tải dữ liệu sổ tay...
          </div>
        ) : (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            
            {/* 1. TỶ LỆ SIM DU LỊCH */}
            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg, #f8fbfd)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Smartphone size={18} color="#3b82f6" />
                  <span>Nhu Cầu SIM Du Lịch</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: totalSimAssigned !== totalPax ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  Đã xếp: {totalSimAssigned}/{totalPax} SIM
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    SIM Vật lý
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={simCounts.physical}
                    onChange={(e) => setSimCounts(p => ({ ...p, physical: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    eSIM
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={simCounts.esim}
                    onChange={(e) => setSimCounts(p => ({ ...p, esim: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    Không lấy SIM
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={simCounts.none}
                    onChange={(e) => setSimCounts(p => ({ ...p, none: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 2. CƠ CẤU XẾP PHÒNG */}
            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg, #f8fbfd)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <BedDouble size={18} color="#10b981" />
                <span>Cơ Cấu Xếp Phòng (Số phòng)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    DBL (Đôi)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts.dbl}
                    onChange={(e) => setRoomCounts(p => ({ ...p, dbl: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    TWIN (2G)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts.twin}
                    onChange={(e) => setRoomCounts(p => ({ ...p, twin: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    TRIP (Phòng 3)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts.trip}
                    onChange={(e) => setRoomCounts(p => ({ ...p, trip: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    SGL (Đơn)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts.sgl}
                    onChange={(e) => setRoomCounts(p => ({ ...p, sgl: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    Lẻ Nam/Nữ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts.odd}
                    onChange={(e) => setRoomCounts(p => ({ ...p, odd: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. CƠ CẤU ĐỐI TƯỢNG */}
            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg, #f8fbfd)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                <Users size={18} color="#8b5cf6" />
                <span>Cơ Cấu Đối Tượng Hành Khách</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    Người lớn (ADL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={demographics.adult}
                    onChange={(e) => setDemographics(p => ({ ...p, adult: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light, #64748b)', display: 'block', marginBottom: '4px' }}>
                    Trẻ em (CHD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={demographics.child}
                    onChange={(e) => setDemographics(p => ({ ...p, child: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--card-bg, #fff)',
                      color: 'var(--text, #0f172a)',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4. CƠ CẤU PHỤ PHÍ PHÁT SINH */}
            <div style={{
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg, #f8fbfd)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
                  <DollarSign size={18} color="#f59e0b" />
                  <span>Phụ Phí Phát Sinh Đoàn</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSurcharge}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Thêm khoản thu
                </button>
              </div>

              {surcharges.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light, #94a3b8)', fontStyle: 'italic', margin: 0 }}>
                  Chưa có khoản phụ thu nào. Bấm nút "Thêm khoản thu" nếu có phụ thu phòng đơn, nâng ghế, moto, land...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {surcharges.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Tên phụ thu (VD: Phòng đơn, Up ghế...)"
                        value={s.title}
                        onChange={(e) => handleSurchargeChange(idx, 'title', e.target.value)}
                        style={{
                          flex: 2,
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border, #cbd5e1)',
                          backgroundColor: 'var(--card-bg, #fff)',
                          color: 'var(--text, #0f172a)',
                          fontSize: '0.85rem'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Số tiền (VNĐ)"
                        value={s.amount}
                        onChange={(e) => handleSurchargeChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        style={{
                          flex: 1.5,
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border, #cbd5e1)',
                          backgroundColor: 'var(--card-bg, #fff)',
                          color: 'var(--text, #0f172a)',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSurcharge(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div style={{ marginTop: '6px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                    Tổng phụ thu: +{totalSurchargesAmount.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: 'var(--card-bg, #ffffff)',
          position: 'sticky',
          bottom: 0,
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border, #cbd5e1)',
              backgroundColor: 'transparent',
              color: 'var(--text, #0f172a)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ff4b2b',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.875rem',
              boxShadow: '0 2px 6px rgba(255, 75, 43, 0.3)'
            }}
          >
            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu Sổ Tay'}
          </button>
        </div>

      </div>
    </div>
  );
}
