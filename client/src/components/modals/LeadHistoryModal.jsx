import React, { useState, useEffect } from 'react';
import { History, X, User, Calendar, MapPin, Tag, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';

const LeadHistoryModal = ({
  isOpen,
  onClose,
  leadId,
  customerName,
  onOpenLeadProfile
}) => {
  const [historyLeads, setHistoryLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/leads/${leadId}/related-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistoryLeads(res.data.leads || []);
      } catch (err) {
        console.error('Error fetching lead history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chốt đơn':
        return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
      case 'Đang tư vấn':
      case 'Đang liên hệ':
        return { bg: '#fef9c3', color: '#a16207', border: '#fde047' };
      case 'Thất bại':
        return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
      case 'Mới':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '85vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Lịch Sử Các Lần Hỏi Tour (Leads)
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Khách hàng: <strong style={{ color: '#0f172a' }}>{customerName || 'Khách hàng'}</strong> ({historyLeads.length} hồ sơ Lead)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content List */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Đang tải lịch sử các Lead...
            </div>
          ) : historyLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
              Chưa có lịch sử Lead nào khác của khách hàng này.
            </div>
          ) : (
            historyLeads.map((lead, idx) => {
              const isCurrent = lead.id === leadId;
              const badgeStyle = getStatusBadge(lead.status);

              return (
                <div
                  key={lead.id}
                  style={{
                    border: isCurrent ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    background: isCurrent ? '#f5f3ff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  {/* Top line: ID, Date, Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                        Lead #{lead.id}
                      </span>
                      {isCurrent ? (
                        <span style={{ fontSize: '11px', background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          Đang hoạt động (Hiện tại)
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          Lần hỏi trước
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Ngày tạo: {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Tour and BU */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      <MapPin size={14} color="#6366f1" />
                      <span>{lead.tour_name || 'Chưa chọn Tour cụ thể'}</span>
                    </div>
                    {lead.bu_group && (
                      <span style={{ fontSize: '11px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, color: '#334155' }}>
                        BU: {lead.bu_group}
                      </span>
                    )}
                  </div>

                  {/* Status & Sale Info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        {lead.status || 'Mới'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        Sale: <strong style={{ color: lead.assigned_to_name ? '#0f172a' : '#ef4444' }}>{lead.assigned_to_name || 'Chưa phân'}</strong>
                      </span>
                    </div>

                    {onOpenLeadProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenLeadProfile(lead);
                          onClose();
                        }}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#2563eb',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <User size={13} /> Xem Profile Lead
                      </button>
                    )}
                  </div>

                  {/* Latest Note preview */}
                  {lead.latest_note && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '11.5px',
                      color: '#475569',
                      background: 'rgba(255, 255, 255, 0.7)',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      borderLeft: '3px solid #cbd5e1'
                    }}>
                      <strong>Ghi chú gần nhất:</strong> {lead.latest_note}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadHistoryModal;
