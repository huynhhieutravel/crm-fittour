import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationBell = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
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
      
      const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://erp.fittour.vn';
      const socket = io(serverUrl);

      // Tham gia room của user hiện tại
      socket.emit('join', `user_${currentUser.id}`);

      socket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast(
          (t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>🔔 {notif.title}</span>
              <span style={{ fontSize: '0.85em' }}>{notif.message}</span>
            </div>
          ),
          { duration: 4000, position: 'top-right' }
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser]);

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
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', padding: 0
                }}
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
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
                      <span>{new Date(notif.created_at).toLocaleString('vi-VN')}</span>
                      {notif.link && <ExternalLink size={12} />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
