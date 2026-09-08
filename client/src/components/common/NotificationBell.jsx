import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Settings, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import NotificationSettingsModal from './NotificationSettingsModal';
import { playMessageChime, playLeadChime, isSoundEnabled } from '../../utils/audioNotification';

const NotificationBell = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications/in-app', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin;
      const socket = io(serverUrl);

      // Tham gia room của user hiện tại
      socket.emit('join', `user_${currentUser.id}`);

      // Lắng nghe thông báo cá nhân (phân công lead, tin nhắn từ khách...)
      socket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // PHÁT CHUÔNG ÂM THANH
        if (notif.sound_type === 'message' || notif.type === 'CUSTOMER_MESSAGE') {
          playMessageChime();
        } else {
          playLeadChime();
        }

        // POPUP TOAST THÔNG BÁO TỨC THÌ
        toast(
          (t) => (
            <div 
              style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer' }}
              onClick={() => {
                toast.dismiss(t.id);
                if (notif.link) navigate(notif.link);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>
                  {notif.sound_type === 'message' ? '💬 ' : '🔔 '}{notif.title}
                </span>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Xem ngay &rarr;</span>
              </div>
              <span style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                {notif.message ? notif.message.replace(/<[^>]+>/g, '') : 'Có cập nhật mới'}
              </span>
            </div>
          ),
          { duration: 6000, position: 'top-right', style: { border: '1px solid #bfdbfe', background: '#f0f9ff' } }
        );

        // NATIVE BROWSER DESKTOP NOTIFICATION (kể cả khi ẩn tab)
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const plainText = notif.message ? notif.message.replace(/<[^>]+>/g, '') : 'Bạn có thông báo mới từ FIT Tour CRM';
            const n = new Notification(notif.title || 'FIT Tour CRM', {
              body: plainText,
              icon: '/favicon.ico',
            });
            n.onclick = () => {
              window.focus();
              if (notif.link) {
                navigate(notif.link);
              }
              n.close();
            };
          } catch (e) {
            console.error('Desktop notification error', e);
          }
        }
      });

      // Lắng nghe sự kiện khách nhắn tin mới toàn cục (để hỗ trợ backup nếu unassigned / BU)
      socket.on('customer_new_message', (msg) => {
        const isMyLead = msg.assigned_to && String(msg.assigned_to) === String(currentUser.id);
        const isAdmin = ['admin', 'manager'].includes(currentUser.role_name || currentUser.role);
        const isMyBU = !msg.assigned_to && msg.bu_group && currentUser.bus && (
          Array.isArray(currentUser.bus) ? currentUser.bus.includes(msg.bu_group) : String(currentUser.bus).includes(msg.bu_group)
        );

        // Nếu là lead chưa phân công của BU mình hoặc admin, mà chưa có thông báo cá nhân thì phát chuông
        if (!isMyLead && (isMyBU || (isAdmin && !msg.assigned_to))) {
          playMessageChime();
        }
      });

      return () => {
        socket.off('new_notification');
        socket.off('customer_new_message');
        socket.disconnect();
      };
    }
  }, [currentUser, navigate]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.put(`/api/notifications/in-app/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`/api/notifications/in-app/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Trình duyệt của bạn không hỗ trợ thông báo màn hình');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Đã bật thông báo màn hình thành công!');
      } else {
        toast.error('Bạn đã từ chối nhận thông báo màn hình');
      }
    } catch (error) {
      console.error('Error requesting notification permission', error);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', marginRight: '16px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 6px',
            lineHeight: 1
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '-10px',
          width: '320px',
          background: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Thông báo</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {notificationPermission === 'default' && (
                <button 
                  onClick={requestNotificationPermission}
                  style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', color: '#4f46e5', fontSize: '11px', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  🔔 Bật thông báo
                </button>
              )}
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0
                  }}
                >
                  Đã đọc tất cả
                </button>
              )}
              <button
                  onClick={(e) => { e.stopPropagation(); setShowSettings(true); setIsOpen(false); }}
                  title="Cài đặt thông báo"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center' }}
              >
                  <Settings size={16} />
              </button>
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: notif.is_read ? 'white' : '#eff6ff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? '#f8fafc' : '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : '#eff6ff'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#1e293b', lineHeight: 1.4 }}>{notif.title}</strong>
                      {!notif.is_read && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0, marginTop: '4px' }}></div>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '6px' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{new Date(notif.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</span>
                      {notif.link && <ExternalLink size={12} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <NotificationSettingsModal 
            currentUser={currentUser} 
            onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};

export default NotificationBell;
