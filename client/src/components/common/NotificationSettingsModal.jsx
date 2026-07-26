import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Bell, Save } from 'lucide-react';

const NotificationSettingsModal = ({ onClose, currentUser }) => {
    const [preferences, setPreferences] = useState({
        push_bu_message: true,
        push_personal_assignment: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.notification_preferences) {
            setPreferences(currentUser.notification_preferences);
        } else {
            // Fetch if not present in currentUser
            setIsLoading(true);
            axios.get('/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(res => {
                    if (res.data && res.data.notification_preferences) {
                        setPreferences(res.data.notification_preferences);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [currentUser]);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('/api/users/me/notification-preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cập nhật cài đặt thông báo thành công!');
            onClose();
            // Force reload to apply new settings in currentUser context if needed
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi lưu cài đặt.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '400px',
                maxWidth: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={18} /> Cài đặt thông báo (Push)
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải cấu hình...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1, paddingRight: '16px' }}>
                                    <div style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Tin nhắn từ BU</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Nhận Push khi có Lead được phân bổ vào nhóm BU của bạn.</div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <div style={{
                                        position: 'relative',
                                        width: '40px',
                                        height: '24px',
                                        backgroundColor: preferences.push_bu_message ? '#10b981' : '#e2e8f0',
                                        borderRadius: '12px',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px',
                                            left: preferences.push_bu_message ? '18px' : '2px',
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            transition: 'left 0.2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        style={{ display: 'none' }} 
                                        checked={preferences.push_bu_message} 
                                        onChange={() => handleToggle('push_bu_message')} 
                                    />
                                </label>
                            </div>

                            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1, paddingRight: '16px' }}>
                                    <div style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Tin nhắn phân công cá nhân</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Nhận Push khi bạn được gắn thẻ (assign) trực tiếp vào 1 Lead.</div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <div style={{
                                        position: 'relative',
                                        width: '40px',
                                        height: '24px',
                                        backgroundColor: preferences.push_personal_assignment ? '#10b981' : '#e2e8f0',
                                        borderRadius: '12px',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px',
                                            left: preferences.push_personal_assignment ? '18px' : '2px',
                                            width: '20px',
                                            height: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            transition: 'left 0.2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        style={{ display: 'none' }} 
                                        checked={preferences.push_personal_assignment} 
                                        onChange={() => handleToggle('push_personal_assignment')} 
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button 
                        onClick={onClose}
                        style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', color: '#475569', fontWeight: '500', cursor: 'pointer' }}
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        style={{ padding: '8px 16px', border: 'none', backgroundColor: '#3b82f6', borderRadius: '6px', color: 'white', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
