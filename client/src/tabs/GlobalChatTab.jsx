import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2, UserPlus, Info, Bell, Send, Search, MoreVertical, ShieldAlert, MessageCircle, Phone, Copy, BarChart3, Users, UserCheck, Menu, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import usePushNotifications from '../hooks/usePushNotifications';
import SearchableSelect from '../components/common/SearchableSelect';
import BUStatsTab from '../components/dispatcher/BUStatsTab';
import './GlobalChatTab.css';

const GlobalChatTab = ({ users = [], tours = [], leads = [], bus = [], setEditingLead, navigateToInbox, openZaloDrawer, handleConvertLead, fetchLeads }) => {
    const navigate = useNavigate();
    const { requestSubscription, isSubscribing } = usePushNotifications(localStorage.getItem('token'));
    const [activeMainTab, setActiveMainTab] = useState('chat');
    const [notifications, setNotifications] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [timeRange, setTimeRange] = useState("today");
    const [filterBU, setFilterBU] = useState("all");
    const [filterAssignment, setFilterAssignment] = useState("all");
    const [filterHasPhone, setFilterHasPhone] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const isScrolledUpRef = useRef(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const myBU = Array.isArray(currentUser?.bus) 
        ? (currentUser.bus[0] || 'BU1') 
        : (typeof currentUser?.bus === 'string' && currentUser.bus 
            ? currentUser.bus.split(',')[0].trim() 
            : 'BU1');

    const [claimingId, setClaimingId] = useState(null);
    const [claimTimer, setClaimTimer] = useState(null);

    const getSourceBadgeConfig = (source, notif) => {
        let s = (source || '').toLowerCase().trim();
        if (!s) {
            if (notif?.facebook_psid) s = 'messenger';
            else if (notif?.zalo_uid) s = 'zalo';
        }

        if (s.includes('tiktok')) {
            return {
                label: 'TikTok',
                bg: '#0f172a',
                color: '#ffffff',
                border: '#1e293b',
                icon: (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block' }}>
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.04-.52 4.77 4.77 0 0 1-2-2.31 4.75 4.75 0 0 1-.36-2.09V6.69h5.36z"/>
                    </svg>
                )
            };
        }
        if (s.includes('zalo')) {
            return {
                label: 'Zalo',
                bg: '#eff6ff',
                color: '#0068ff',
                border: '#93c5fd',
                icon: <span style={{ fontSize: '9px', fontWeight: 900, color: '#0068ff', lineHeight: 1 }}>Z</span>
            };
        }
        if (s.includes('messenger') || s.includes('fb') || s.includes('facebook')) {
            return {
                label: 'Messenger',
                bg: '#f0f9ff',
                color: '#0284c7',
                border: '#bae6fd',
                icon: <MessageCircle size={10} />
            };
        }
        if (s.includes('hotline') || s.includes('phone') || s.includes('điện thoại')) {
            return {
                label: 'Hotline',
                bg: '#f0fdf4',
                color: '#16a34a',
                border: '#bbf7d0',
                icon: <Phone size={10} />
            };
        }
        if (s.includes('giới thiệu') || s.includes('referral')) {
            return {
                label: 'Khách giới thiệu',
                bg: '#faf5ff',
                color: '#9333ea',
                border: '#e9d5ff',
                icon: <UserCheck size={10} />
            };
        }
        if (s.includes('web') || s.includes('landing')) {
            return {
                label: 'Website',
                bg: '#fff7ed',
                color: '#ea580c',
                border: '#fed7aa',
                icon: <Globe size={10} />
            };
        }
        return {
            label: source || 'Khác',
            bg: '#f8fafc',
            color: '#64748b',
            border: '#e2e8f0',
            icon: null
        };
    };

    const formatLeadMessage = (msg, bu, name) => {
        if (name && typeof name === 'string' && name.trim()) return name.trim();
        if (!msg) return 'Khách hàng';
        let clean = msg.replace(/^(Có\s+Lead\s+mới\s+vào|Lead\s+Mới)\s*/i, '');
        clean = clean.replace(/^(BU\d+|Hệ\s*thống)\s*:\s*/i, '');
        clean = clean.replace(/^:\s*/, '');
        return clean.trim() || 'Khách hàng';
    };

    const scrollToBottom = () => {
        if (!isScrolledUpRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchNotifs = () => {
            axios.get(`/api/notifications/global-center?timeRange=${timeRange}&bu=${filterBU}&assignment=${filterAssignment}&hasPhone=${filterHasPhone}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications((res.data.notifications || []).reverse()))
                .catch(err => console.error(err));
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000);
        return () => clearInterval(interval);
    }, [timeRange, filterBU, filterAssignment, filterHasPhone]);

    useEffect(() => {
        scrollToBottom();
    }, [notifications]);

    const handleClaimStart = (leadId, notifId) => {
        if (claimingId === leadId) return;
        setClaimingId(leadId);
        const timer = setTimeout(() => {
            executeClaim(leadId, notifId);
        }, 3000);
        setClaimTimer(timer);
    };

    const handleClaimUndo = () => {
        if (claimTimer) clearTimeout(claimTimer);
        setClaimingId(null);
        setClaimTimer(null);
    };

    const executeClaim = async (leadId, notifId) => {
        setClaimingId(null);
        setClaimTimer(null);
        const token = localStorage.getItem('token');
        try {
            await axios.post(`/api/leads/${leadId}/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Tiếp nhận thành công!');
            
            axios.get(`/api/notifications/global-center?timeRange=${timeRange}&bu=${filterBU}&assignment=${filterAssignment}&hasPhone=${filterHasPhone}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setNotifications((res.data.notifications || []).reverse()));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleBUChange = async (leadId, newBU) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/leads/${leadId}`, { bu_group: newBU }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã chuyển BU thành công');
            setNotifications(prev => prev.map(n => n.reference_id === leadId ? { ...n, bu_group: newBU } : n));
            if (typeof fetchLeads === 'function') fetchLeads();
        } catch (error) {
            toast.error('Lỗi cập nhật BU');
        }
    };

    const handleTourChange = async (leadId, newTourId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/leads/${leadId}`, { tour_id: newTourId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã cập nhật sản phẩm thành công');
            setNotifications(prev => prev.map(n => n.reference_id === leadId ? { ...n, tour_id: newTourId } : n));
            if (typeof fetchLeads === 'function') fetchLeads();
        } catch (error) {
            toast.error('Lỗi cập nhật sản phẩm');
        }
    };

    const handleAssignUser = async (leadId, newAssigneeId, newAssigneeName) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/leads/${leadId}`, { assigned_to: newAssigneeId, assigned_to_name: newAssigneeName }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Đã phân công thành công');
            setNotifications(prev => prev.map(n => n.reference_id === leadId ? { ...n, assigned_to: newAssigneeId, assigned_to_name: newAssigneeName } : n));
            if (typeof fetchLeads === 'function') fetchLeads();
        } catch (error) {
            toast.error('Lỗi phân công nhân viên');
        }
    };

    const getBUColor = (bu) => {
        switch (bu) {
            case 'BU1': return { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd' };
            case 'BU2': return { bg: '#fef08a', text: '#a16207', border: '#fde047' };
            case 'BU3': return { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' };
            case 'BU4': return { bg: '#ffedd5', text: '#ea580c', border: '#fed7aa' };
            case 'BU5': return { bg: '#f3e8ff', text: '#9333ea', border: '#e9d5ff' };
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    return (
        <div className="global-chat-container">
            <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
                <div className="global-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <div className="global-chat-title-group">
                                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>Trung Tâm Điều Phối BU</h2>
                                <button 
                                    onClick={requestSubscription} 
                                    disabled={isSubscribing}
                                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', outline: 'none' }}
                                >
                                    <Bell size={14} /> {isSubscribing ? 'Đang bật...' : 'Bật thông báo đẩy'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="global-chat-time-filters">
                        {[
                            { id: 'today', label: 'Hôm nay' },
                            { id: 'yesterday', label: 'Hôm qua' },
                            { id: 'this_week', label: 'Tuần này' },
                            { id: 'this_month', label: 'Tháng này' },
                            { id: 'all', label: 'Tất cả' }
                        ].map(p => (
                            <button key={p.id} className={timeRange === p.id ? 'active' : ''} onClick={() => setTimeRange(p.id)} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', background: timeRange === p.id ? '#3b82f6' : '#fff', color: timeRange === p.id ? '#fff' : '#475569', fontSize: '12px', cursor: 'pointer', outline: 'none' }}>{p.label}</button>
                        ))}
                        <MoreVertical size={20} style={{ cursor: 'pointer', color: '#6b7280', marginLeft: '8px' }} />
                    </div>
                </div>

                <div className="global-chat-tabs-container" style={{ display: 'flex', gap: '24px', padding: '0 20px' }}>
                    <div 
                        onClick={() => setActiveMainTab('chat')} 
                        style={{ cursor: 'pointer', borderBottom: activeMainTab === 'chat' ? '2px solid #4f46e5' : '2px solid transparent', paddingBottom: '10px', color: activeMainTab === 'chat' ? '#4f46e5' : '#64748b', fontWeight: activeMainTab === 'chat' ? 600 : 500 }}
                    >
                        Giám Sát Cảnh Báo
                    </div>
                    <div 
                        onClick={() => setActiveMainTab('stats')} 
                        style={{ cursor: 'pointer', borderBottom: activeMainTab === 'stats' ? '2px solid #4f46e5' : '2px solid transparent', paddingBottom: '10px', color: activeMainTab === 'stats' ? '#4f46e5' : '#64748b', fontWeight: activeMainTab === 'stats' ? 600 : 500, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <BarChart3 size={16} /> Số Lượng Theo BU
                    </div>
                </div>
            </div>

            {activeMainTab === 'stats' ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <BUStatsTab timeRange={timeRange} />
                </div>
            ) : (
                <>
                    <div className="filter-options-container" style={{ marginTop: 0, padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Hàng 1: Lọc Đơn vị BU & Tìm kiếm */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Đơn vị BU:</span>
                                {[
                                    { id: 'all', label: 'Tất cả BU' },
                                    { id: 'unassigned_bu', label: 'Chưa phân BU' },
                                    { id: 'BU1', label: 'BU1' },
                                    { id: 'BU2', label: 'BU2' },
                                    { id: 'BU3', label: 'BU3' },
                                    { id: 'BU4', label: 'BU4' },
                                    { id: 'BU5', label: 'BU5' }
                                ].map(p => (
                                    <button 
                                        key={p.id} 
                                        className={filterBU === p.id ? 'active' : ''} 
                                        onClick={() => setFilterBU(p.id)} 
                                        style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            border: '1px solid',
                                            borderColor: filterBU === p.id ? '#8b5cf6' : '#e2e8f0', 
                                            background: filterBU === p.id ? '#8b5cf6' : '#fff', 
                                            color: filterBU === p.id ? '#fff' : '#475569', 
                                            fontSize: '12px', 
                                            fontWeight: filterBU === p.id ? '600' : '500',
                                            cursor: 'pointer', 
                                            outline: 'none',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo tên, SĐT, BU..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ padding: '6px 10px 6px 28px', borderRadius: '20px', border: '1px solid #e2e8f0', fontSize: '12px', width: '220px', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Hàng 2: Lọc Phân bổ Sale */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Phân bổ Sale:</span>
                            {[
                                { id: 'all', label: 'Tất cả trạng thái' },
                                { id: 'has_phone', label: '📞 Đã có SĐT' },
                                { id: 'unassigned', label: '⚡ Chưa phân Sale (Chờ nhận)' },
                                { id: 'my_leads', label: '👤 Lead của tôi' },
                                { id: 'assigned', label: '✓ Đã có Sale tiếp nhận' }
                            ].map(p => {
                                const isHasPhone = p.id === 'has_phone';
                                const isActive = isHasPhone 
                                    ? filterHasPhone 
                                    : (p.id === 'all' ? (filterAssignment === 'all' && !filterHasPhone) : filterAssignment === p.id);
                                const isUnassigned = p.id === 'unassigned';
                                const activeBg = isUnassigned ? '#ea580c' : (isHasPhone ? '#059669' : '#3b82f6');
                                const activeBorder = isUnassigned ? '#c2410c' : (isHasPhone ? '#047857' : '#2563eb');
                                const inactiveColor = isUnassigned ? '#c2410c' : (isHasPhone ? '#059669' : '#475569');

                                const handleFilterClick = () => {
                                    if (isHasPhone) {
                                        setFilterHasPhone(prev => !prev);
                                    } else if (p.id === 'all') {
                                        setFilterAssignment('all');
                                        setFilterHasPhone(false);
                                    } else {
                                        setFilterAssignment(prev => prev === p.id ? 'all' : p.id);
                                    }
                                };

                                return (
                                    <button 
                                        key={p.id} 
                                        className={isActive ? 'active' : ''} 
                                        onClick={handleFilterClick} 
                                        style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            border: '1px solid',
                                            borderColor: isActive ? activeBorder : '#e2e8f0', 
                                            background: isActive ? activeBg : '#fff', 
                                            color: isActive ? '#fff' : inactiveColor, 
                                            fontSize: '12px', 
                                            fontWeight: isActive ? '600' : ((isUnassigned || isHasPhone) ? '600' : '500'),
                                            cursor: 'pointer', 
                                            outline: 'none',
                                            transition: 'all 0.15s',
                                            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
                 onScroll={(e) => {
                     const { scrollTop, scrollHeight, clientHeight } = e.target;
                     const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
                     isScrolledUpRef.current = !isAtBottom;
                 }}
            >
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                    <span style={{ background: '#e5e7eb', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#4b5563' }}>
                        {timeRange === 'today' ? 'Hôm nay' : timeRange === 'yesterday' ? 'Hôm qua' : timeRange === 'this_week' ? 'Tuần này' : timeRange === 'this_month' ? 'Tháng này' : 'Tất cả'}
                    </span>
                </div>

                {notifications.filter(n => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    const currentLead = leads.find(l => l.id === n.reference_id);
                    const phoneDisplay = n.phone || currentLead?.phone;
                    const sourceDisplay = n.source || currentLead?.source;
                    return (
                        n.title?.toLowerCase().includes(q) ||
                        n.name?.toLowerCase().includes(q) ||
                        n.message?.toLowerCase().includes(q) ||
                        n.bu_group?.toLowerCase().includes(q) ||
                        phoneDisplay?.toLowerCase().includes(q) ||
                        sourceDisplay?.toLowerCase().includes(q) ||
                        n.assigned_to_name?.toLowerCase().includes(q)
                    );
                }).length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                        <Bell size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '10px' }} />
                        <p>Hệ thống chưa ghi nhận thông báo nào phù hợp.</p>
                    </div>
                ) : notifications.filter(n => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    const currentLead = leads.find(l => l.id === n.reference_id);
                    const phoneDisplay = n.phone || currentLead?.phone;
                    const sourceDisplay = n.source || currentLead?.source;
                    return (
                        n.title?.toLowerCase().includes(q) ||
                        n.name?.toLowerCase().includes(q) ||
                        n.message?.toLowerCase().includes(q) ||
                        n.bu_group?.toLowerCase().includes(q) ||
                        phoneDisplay?.toLowerCase().includes(q) ||
                        sourceDisplay?.toLowerCase().includes(q) ||
                        n.assigned_to_name?.toLowerCase().includes(q)
                    );
                }).map((notif, index) => {
                    const currentLead = leads.find(l => l.id === notif.reference_id);
                    const sourceDisplay = notif.source || currentLead?.source;
                    const badgeConfig = getSourceBadgeConfig(sourceDisplay, notif);
                    return (
                    <div key={notif.id} className="chat-message-wrapper" style={{ maxWidth: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                    {new Date(notif.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {badgeConfig && (
                                    <span 
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            padding: '1px 6px',
                                            borderRadius: '6px',
                                            background: badgeConfig.bg,
                                            color: badgeConfig.color,
                                            border: `1px solid ${badgeConfig.border}`,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                            lineHeight: 1.2
                                        }}
                                        title={`Kênh nguồn: ${badgeConfig.label}`}
                                    >
                                        {badgeConfig.icon}
                                        {badgeConfig.label}
                                    </span>
                                )}
                                {notif.last_contacted_at && new Date(notif.last_contacted_at).toDateString() !== new Date(notif.created_at).toDateString() && (
                                    <span style={{ fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                        🔥 Khách cũ nhắn lại: {new Date(notif.last_contacted_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            
                            <div style={{ 
                                background: '#fff', 
                                padding: '15px', 
                                borderRadius: '16px', 
                                borderBottomLeftRadius: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div 
                                            onClick={() => window.dispatchEvent(new CustomEvent('open-edit-lead-modal-from-chat', { detail: notif.reference_id }))}
                                            style={{ fontSize: '15px', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
                                            title="Nhấn để xem chi tiết Lead"
                                        >
                                            {formatLeadMessage(notif.message, notif.bu_group, notif.name || notif.customer_name)}
                                        </div>
                                        {notif.is_returning_customer && (
                                            <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#9333ea', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }} title="Khách VVIP đã từng booking.">
                                                🎖️ KHÁCH QUEN {notif.total_spent > 0 ? `(Đã chi ${new Intl.NumberFormat('vi-VN').format(notif.total_spent)}đ)` : ''}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {notif.type === 'NEW_LEAD' && (() => {
                                        const colors = getBUColor(notif.bu_group);
                                        return (
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <select 
                                                    value={notif.bu_group || ''}
                                                    onChange={(e) => handleBUChange(notif.reference_id, e.target.value)}
                                                    style={{ 
                                                        padding: '2px 8px', 
                                                        fontSize: '11px', 
                                                        fontWeight: '600',
                                                        borderRadius: '12px', 
                                                        border: `1px solid ${colors.border}`, 
                                                        background: colors.bg,
                                                        color: colors.text,
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        height: '22px'
                                                    }}
                                                >
                                                    <option value="">Chưa phân bổ</option>
                                                    <option value="BU1">BU1</option>
                                                    <option value="BU2">BU2</option>
                                                    <option value="BU3">BU3</option>
                                                    <option value="BU4">BU4</option>
                                                    <option value="BU5">BU5</option>
                                                </select>

                                                <div className="chat-tour-select" style={{ minWidth: '180px', height: '22px' }}>
                                                    <SearchableSelect 
                                                        options={tours}
                                                        value={notif.tour_id || ''}
                                                        onChange={(val) => handleTourChange(notif.reference_id, val)}
                                                        placeholder="Chọn sản phẩm quan tâm..."
                                                        shortLabel={true}
                                                    />
                                                </div>

                                                <div className="chat-assignee-select" style={{ minWidth: '130px', height: '22px' }}>
                                                    <SearchableSelect 
                                                        options={(() => {
                                                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                                                            return users
                                                                .filter(u => u.is_active !== false)
                                                                .sort((a, b) => {
                                                                    if (a.id === currentUser?.id) return -1;
                                                                    if (b.id === currentUser?.id) return 1;
                                                                    
                                                                    const aHasBU = notif.bu_group && a.bus && (Array.isArray(a.bus) ? a.bus.includes(notif.bu_group) : a.bus.includes(notif.bu_group));
                                                                    const bHasBU = notif.bu_group && b.bus && (Array.isArray(b.bus) ? b.bus.includes(notif.bu_group) : b.bus.includes(notif.bu_group));
                                                                    
                                                                    if (aHasBU && !bHasBU) return -1;
                                                                    if (bHasBU && !aHasBU) return 1;
                                                                    return 0;
                                                                })
                                                                .map(u => ({ id: u.id, name: u.full_name || u.username || "Không tên" }));
                                                        })()}
                                                        value={notif.assigned_to || ''}
                                                        onChange={(val) => {
                                                            if (!val || val === '') {
                                                                handleAssignUser(notif.reference_id, null, null);
                                                            } else {
                                                                const user = users.find(u => u.id.toString() === val.toString());
                                                                if (user) {
                                                                    handleAssignUser(notif.reference_id, user.id, user.full_name || user.username);
                                                                }
                                                            }
                                                        }}
                                                        placeholder="Chọn nhân viên..."
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {(() => {
                                        const currentLead = leads.find(l => l.id === notif.reference_id);
                                        const phoneDisplay = notif.phone || currentLead?.phone;
                                        if (!phoneDisplay) return null;
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '2px 8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <Phone size={12} color="#64748b" /> 
                                                <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{phoneDisplay}</span>
                                                <Copy size={12} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(phoneDisplay); toast.success('Đã copy SĐT!'); }} />
                                            </div>
                                        );
                                    })()}
                                    
                                    {notif.type === 'NEW_LEAD' && (
                                        <div className="chat-actions-wrapper">
                                            {(() => {
                                                const currentLead = leads.find(l => l.id === notif.reference_id);
                                                const targetSourceId = notif.source_id || (currentLead ? (currentLead.facebook_psid || currentLead.psid || currentLead.zalo_uid) : null);
                                                
                                                if (!targetSourceId) return null;
                                                
                                                return (
                                                    <button
                                                        onClick={() => {
                                                            const isZalo = currentLead?.source === 'Zalo' || currentLead?.zalo_uid || notif?.source === 'Zalo';
                                                            if (isZalo && openZaloDrawer) {
                                                                openZaloDrawer(targetSourceId);
                                                            } else if (navigateToInbox) {
                                                                navigateToInbox(targetSourceId);
                                                            }
                                                        }}
                                                        style={{
                                                            padding: '4px 10px',
                                                            background: '#f1f5f9',
                                                            color: '#334155',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '500',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <MessageCircle size={14} /> Xem Inbox
                                                    </button>
                                                );
                                            })()}
                                            
                                            {(() => {
                                                const currentLead = leads.find(l => l.id === notif.reference_id);
                                                if (currentLead && !currentLead.is_locked && !currentLead.won_at) {
                                                    return (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(typeof handleConvertLead === 'function') handleConvertLead(currentLead.id); }}
                                                            style={{
                                                                padding: '4px 10px',
                                                                background: '#dcfce7',
                                                                color: '#10b981',
                                                                border: '1px solid #bbf7d0',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '4px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            <UserCheck size={14} /> Chuyển Khách Hàng
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {!notif.assigned_to_name && (
                                                claimingId === notif.reference_id ? (
                                                    <button 
                                                        onClick={handleClaimUndo}
                                                        style={{
                                                            padding: '4px 10px',
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            fontSize: '12px',
                                                            animation: 'pulse 1s infinite'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={14} /> Hoàn tác (3s)...
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleClaimStart(notif.reference_id, notif.id)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            background: '#0ea5e9',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={14} /> Nhận Lead
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {notif.type === 'NEW_LEAD' && notif.assigned_to_name && (
                                    <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb', fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>
                                        ✓ Đã tiếp nhận bởi: {notif.assigned_to_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
                <div ref={messagesEndRef} />
            </div>
            </>
            )}
            
            {/* Mobile Bottom Navigation Bar */}
            <div className="mobile-bottom-nav">
                <div 
                    className={`mobile-bottom-nav-item ${activeMainTab === 'chat' && filterBU === 'all' && filterAssignment === 'all' ? 'active' : ''}`}
                    onClick={() => { setActiveMainTab('chat'); setFilterBU('all'); setFilterAssignment('all'); }}
                >
                    <Bell size={20} />
                    <span>Tất cả</span>
                </div>
                <div 
                    className={`mobile-bottom-nav-item ${activeMainTab === 'chat' && filterAssignment === 'my_leads' ? 'active' : ''}`}
                    onClick={() => { setActiveMainTab('chat'); setFilterAssignment('my_leads'); }}
                >
                    <UserCheck size={20} />
                    <span>Của Tôi</span>
                </div>
                <div 
                    className={`mobile-bottom-nav-item ${activeMainTab === 'chat' && filterBU === myBU ? 'active' : ''}`}
                    onClick={() => { setActiveMainTab('chat'); setFilterBU(myBU); }}
                >
                    <Users size={20} />
                    <span>{myBU}</span>
                </div>
                <div 
                    className={`mobile-bottom-nav-item ${activeMainTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveMainTab('stats')}
                >
                    <BarChart3 size={20} />
                    <span>SL BU</span>
                </div>
                <div 
                    className="mobile-bottom-nav-item"
                    onClick={() => window.dispatchEvent(new Event('open-mobile-menu'))}
                >
                    <Menu size={20} />
                    <span>Menu</span>
                </div>
            </div>
            
        </div>
    );
};

export default GlobalChatTab;
