import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Bell, Save, Volume2, VolumeX, MessageSquare, Play, Sparkles } from 'lucide-react';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  getSoundVolume, 
  setSoundVolume, 
  playMessageChime, 
  playLeadChime 
} from '../../utils/audioNotification';

const NotificationSettingsModal = ({ onClose, currentUser }) => {
    const [preferences, setPreferences] = useState({
        push_bu_message: true,
        push_personal_assignment: true,
        push_customer_message: true
    });
    const [soundActive, setSoundActive] = useState(isSoundEnabled());
    const [soundVol, setSoundVol] = useState(Math.round(getSoundVolume() * 100));
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.notification_preferences) {
            setPreferences(prev => ({ ...prev, ...currentUser.notification_preferences }));
        } else {
            setIsLoading(true);
            axios.get('/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                .then(res => {
                    if (res.data && res.data.notification_preferences) {
                        setPreferences(prev => ({ ...prev, ...res.data.notification_preferences }));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoading(false));
        }
    }, [currentUser]);

    const handleToggle = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSoundToggle = () => {
        const next = !soundActive;
        setSoundActive(next);
        setSoundEnabled(next);
        if (next) {
            playMessageChime();
        }
    };

    const handleVolumeChange = (e) => {
        const volVal = parseInt(e.target.value, 10);
        setSoundVol(volVal);
        setSoundVolume(volVal / 100);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            setSoundEnabled(soundActive);
            setSoundVolume(soundVol / 100);

            const token = localStorage.getItem('token');
            await axios.put('/api/users/me/notification-preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cập nhật cài đặt thông báo thành công!');
            onClose();
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
                width: '460px',
                maxWidth: '92%',
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
                        <Bell size={18} color="#2563eb" /> Cài đặt Thông báo & Chuông Báo
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải cấu hình...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* SECTION: SOUND SETTINGS */}
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: soundActive ? '12px' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {soundActive ? <Volume2 size={18} color="#16a34a" /> : <VolumeX size={18} color="#94a3b8" />}
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>Âm thanh chuông thông báo</div>
                                            <div style={{ fontSize: '12px', color: '#15803d' }}>Phát chuông khi có tin nhắn hoặc Lead mới</div>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '40px',
                                            height: '24px',
                                            backgroundColor: soundActive ? '#16a34a' : '#cbd5e1',
                                            borderRadius: '12px',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: soundActive ? '18px' : '2px',
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
                                            checked={soundActive} 
                                            onChange={handleSoundToggle} 
                                        />
                                    </label>
                                </div>

                                {soundActive && (
                                    <div style={{ borderTop: '1px dashed #86efac', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>Âm lượng: {soundVol}%</span>
                                            <input 
                                                type="range" 
                                                min="10" 
                                                max="100" 
                                                value={soundVol} 
                                                onChange={handleVolumeChange}
                                                style={{ flex: 1, maxWidth: '160px', accentColor: '#16a34a', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                type="button"
                                                onClick={() => playMessageChime()} 
                                                style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: 600, background: '#fff', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Play size={12} /> Nghe chuông tin nhắn
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => playLeadChime()} 
                                                style={{ flex: 1, padding: '6px 10px', fontSize: '11px', fontWeight: 600, background: '#fff', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                            >
                                                <Play size={12} /> Nghe chuông Lead mới
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION: EVENT PREFERENCES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1, paddingRight: '16px' }}>
                                        <div style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Khách hàng nhắn tin tiếp (Zalo / FB)</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Nhận chuông & thông báo khi khách trong Lead của bạn gửi tin nhắn tiếp theo.</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '40px',
                                            height: '24px',
                                            backgroundColor: preferences.push_customer_message !== false ? '#3b82f6' : '#e2e8f0',
                                            borderRadius: '12px',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: preferences.push_customer_message !== false ? '18px' : '2px',
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
                                            checked={preferences.push_customer_message !== false} 
                                            onChange={() => handleToggle('push_customer_message')} 
                                        />
                                    </label>
                                </div>

                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1, paddingRight: '16px' }}>
                                        <div style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Phân công Lead cá nhân</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Nhận chuông & Push khi bạn được phân công (assign) trực tiếp vào 1 Lead.</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '40px',
                                            height: '24px',
                                            backgroundColor: preferences.push_personal_assignment ? '#3b82f6' : '#e2e8f0',
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

                                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1, paddingRight: '16px' }}>
                                        <div style={{ fontWeight: '500', color: '#334155', fontSize: '14px' }}>Lead mới vào nhóm BU</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Nhận thông báo khi có Lead mới được phân bổ vào nhóm BU của bạn.</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '40px',
                                            height: '24px',
                                            backgroundColor: preferences.push_bu_message ? '#3b82f6' : '#e2e8f0',
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

