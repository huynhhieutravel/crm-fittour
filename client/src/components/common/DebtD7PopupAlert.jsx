import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Flame, X, Users, AlertCircle, ArrowRight } from 'lucide-react';

const formatMoney = (val) => {
  const num = Number(val) || 0;
  return Math.round(num).toLocaleString('vi-VN') + ' đ';
};

export default function DebtD7PopupAlert({ currentUser, isLoggedIn }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const fetchPendingAlerts = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !isLoggedIn) return;

    try {
      setLoading(true);
      const res = await axios.get('/api/debt-alerts/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && Array.isArray(res.data.alerts)) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra cảnh báo nợ D-7:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchPendingAlerts();

    // Socket real-time listener for newly dispatched debt alerts
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin;
    const socket = io(serverUrl);

    socket.on('debt_d7_alert_refresh', (data) => {
      if (!data) return;
      const myId = currentUser?.id;
      const isTarget = Array.isArray(data.target_user_ids) && (data.target_user_ids.includes(myId) || currentUser?.role === 'admin');
      if (isTarget) {
        fetchPendingAlerts();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, currentUser?.role, fetchPendingAlerts]);

  const handleDismissAll = async () => {
    const token = localStorage.getItem('token');
    setDismissed(true);
    setAlerts([]);

    if (token) {
      try {
        await axios.post('/api/debt-alerts/acknowledge', { all: true }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Lỗi acknowledge alerts:', err);
      }
    }
  };

  const handleOpenBookingList = async (alertItem) => {
    const token = localStorage.getItem('token');
    const { tour_departure_id, booking_id, id: alert_id } = alertItem;

    // Acknowledge this alert single-fire in DB so it never reappears
    if (token && alert_id) {
      try {
        await axios.post('/api/debt-alerts/acknowledge', { alert_ids: [alert_id] }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Lỗi acknowledge alert:', err);
      }
    }

    // Update local state
    setAlerts(prev => prev.filter(a => a.id !== alert_id));

    // Deep link directly to OpTour booking list modal
    sessionStorage.setItem('pendingOpenBookingListId', String(tour_departure_id));
    if (booking_id) {
      sessionStorage.setItem('pendingHighlightBookingId', String(booking_id));
    }
    navigate(`/op-tours?open_departure_id=${tour_departure_id}&highlight_booking_id=${booking_id || ''}`);
  };

  if (!isLoggedIn || dismissed || alerts.length === 0) {
    return null;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? '80px' : '24px',
        right: isMobile ? '12px' : '24px',
        left: isMobile ? '12px' : 'auto',
        width: isMobile ? 'auto' : '420px',
        maxWidth: 'calc(100vw - 24px)',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #fed7aa',
        borderLeft: '5px solid #ea580c',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 9998,
        overflow: 'hidden',
        animation: 'slideInDebtAlert 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'inherit'
      }}
    >
      <style>{`
        @keyframes slideInDebtAlert {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          borderBottom: '1px solid #fed7aa'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: '#ea580c',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Flame size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#9a3412', lineHeight: 1.2 }}>
              Thu Nợ D-Day (≤ 7 Ngày Đi)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 500 }}>
              {alerts.length} khách hàng sắp đi tour còn nợ tiền
            </div>
          </div>
        </div>

        <button
          onClick={handleDismissAll}
          title="Đóng thông báo (Không hiện lại)"
          style={{
            border: 'none',
            background: 'transparent',
            color: '#9a3412',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Booking Items List */}
      <div
        style={{
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: '#fafaf9'
        }}
      >
        {alerts.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '10px 12px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e7e5e4',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1c1917' }}>
                  {item.customer_name || 'Khách hàng'}
                  {item.customer_phone ? (
                    <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 600, marginLeft: '6px' }}>
                      ({item.customer_phone})
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#57534e', marginTop: '2px' }} title={item.tour_name}>
                  {item.tour_code ? <b>[{item.tour_code}] </b> : null}
                  {item.tour_name || 'Tour khởi hành'}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 7px',
                  borderRadius: '12px',
                  backgroundColor: item.days_until_departure <= 3 ? '#fee2e2' : '#ffedd5',
                  color: item.days_until_departure <= 3 ? '#b91c1c' : '#c2410c',
                  border: item.days_until_departure <= 3 ? '1px solid #fca5a5' : '1px solid #fdba74',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.days_until_departure <= 0
                  ? '🔥 Khởi hành hôm nay'
                  : `🔥 Còn ${item.days_until_departure} ngày`}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '4px',
                paddingTop: '6px',
                borderTop: '1px dashed #e7e5e4'
              }}
            >
              <div style={{ fontSize: '0.78rem' }}>
                <span style={{ color: '#78716c' }}>Còn nợ: </span>
                <span style={{ fontWeight: 800, color: '#ea580c' }}>
                  {formatMoney(item.remaining_debt)}
                </span>
              </div>

              <button
                onClick={() => handleOpenBookingList(item)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Users size={12} />
                <span>Khách đặt chỗ</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: '#f5f5f4',
          borderTop: '1px solid #e7e5e4'
        }}
      >
        <span style={{ fontSize: '0.68rem', color: '#78716c' }}>
          * Chỉ hiện 1 lần duy nhất & đã gửi email nhắc nợ.
        </span>
        <button
          onClick={handleDismissAll}
          style={{
            border: 'none',
            background: 'none',
            color: '#ea580c',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          Đã nắm thông tin
        </button>
      </div>
    </div>
  );
}

