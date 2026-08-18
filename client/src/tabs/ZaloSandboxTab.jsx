import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, User, RefreshCw, MessageCircle, Paperclip, X, File, FileText, AlertTriangle, Trash2, CheckSquare, ChevronLeft, Search, Loader2, Bot, Sparkles } from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';
import { swalConfirm } from '../utils/swalHelpers';
import ZaloAISettingsTab from './ZaloAISettingsTab';

const ZaloSandboxTab = ({ setEditingLead, handleConvertLead, leads = [], users = [], tours = [], currentUser, bus = [], fetchLeads }) => {
  const [messages, setMessages] = useState([]);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' | 'ai_settings'
  const [inputText, setInputText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [aiSession, setAiSession] = useState({ is_ai_active: true });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [localLeadData, setLocalLeadData] = useState(null);
  const [converting, setConverting] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAiSession = async (uid) => {
    if (!uid) return;
    try {
      const res = await axios.get(`/api/zalo-v2/ai-session/${uid}`);
      if (res.data?.success && res.data?.data) {
        setAiSession(res.data.data);
      }
    } catch (e) {
      console.warn('Không lấy được trạng thái AI session:', e.message);
    }
  };

  const handleToggleAi = async () => {
    if (!selectedUser) return;
    try {
      const nextState = !aiSession.is_ai_active;
      const res = await axios.post('/api/zalo-v2/ai-session/toggle', {
        zaloUid: selectedUser,
        isAiActive: nextState
      });
      if (res.data?.success) {
        setAiSession(prev => ({ ...prev, is_ai_active: res.data.is_ai_active, muted_by: res.data.muted_by }));
      }
    } catch (err) {
      alert('Lỗi chuyển trạng thái AI: ' + err.message);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      const l = leads?.find(l => String(l.zalo_uid) === String(selectedUser));
      setLocalLeadData(l ? { ...l } : null);
      fetchAiSession(selectedUser);
    } else {
      setLocalLeadData(null);
    }
  }, [selectedUser, leads]);

  const handleUpdateAssignment = async (field, value) => {
    let targetLead = localLeadData;
    if (!targetLead || !targetLead.id) {
      try {
        const token = localStorage.getItem("token");
        const profile = senderProfiles.find(p => p.uid === selectedUser);
        const res = await axios.post('/api/leads', {
          name: profile?.name || `Zalo Guest ${String(selectedUser).substring(0, 5)}`,
          source: 'Zalo',
          status: 'Mới',
          zalo_uid: String(selectedUser),
          [field]: value || null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        targetLead = res.data;
        setLocalLeadData(targetLead);
        if (fetchLeads) fetchLeads(true);
        return;
      } catch (err) {
        console.error("Auto create lead error:", err);
        alert("Khách hàng này chưa có hồ sơ Lead. Lỗi tạo tự động: " + err.message);
        return;
      }
    }
    try {
      const payload = { [field]: value || '' };
      const token = localStorage.getItem("token");
      await axios.put(`/api/leads/${targetLead.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newLead = { ...targetLead };
      if (field === 'bu_group') newLead.bu_group = value || null;
      else if (field === 'assigned_to') newLead.assigned_to = value || null;
      else if (field === 'tour_id') newLead.tour_id = value || null;
      
      setLocalLeadData(newLead);
      if (fetchLeads) {
        fetchLeads(true);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  const getSaleOptions = (targetBU) => {
    return users.filter(u => 
      u.is_active !== false && 
      (['admin', 'manager', 'sales', 'marketing'].includes(u.role_name) || u.permissions?.leads?.can_view || u.permissions?.leads?.can_edit)
    ).sort((a, b) => {
      if (currentUser) {
         if (a.id === currentUser.id) return -1;
         if (b.id === currentUser.id) return 1;
      }
      if (targetBU) {
        const aHasBU = a.bus && (Array.isArray(a.bus) ? a.bus.includes(targetBU) : String(a.bus).includes(targetBU));
        const bHasBU = b.bus && (Array.isArray(b.bus) ? b.bus.includes(targetBU) : String(b.bus).includes(targetBU));
        if (aHasBU && !bHasBU) return -1;
        if (bHasBU && !aHasBU) return 1;
      }
      return (a.username || '').localeCompare(b.username || '');
    }).map(u => ({
      id: u.id,
      name: u.full_name || u.username,
      code: u.username
    }));
  };

  const handleDeleteSingle = async () => {
    if (await swalConfirm('Bạn có chắc chắn muốn xóa hội thoại Zalo Chat này?', 'warning')) {
      try {
        await axios.delete(`/api/zalo-v2/sandbox/messages/${selectedUser}`);
        setSelectedUser(null);
        fetchMessages();
      } catch (err) {
        alert("Lỗi xóa hội thoại");
      }
    }
  };

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const hasInitialSelected = useRef(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/zalo-v2/sandbox/messages');
      setMessages(res.data || []);
      
      // Auto-select latest user ONLY on initial desktop load (never on mobile or when user explicitly navigated back)
      if (!isMobile && !hasInitialSelected.current && !selectedUserRef.current) {
        hasInitialSelected.current = true;
        if (res.data && res.data.length > 0) {
          const uniqueSenders = [...new Set(res.data.map(m => m.senderId))];
          if (uniqueSenders.length > 0) {
            setSelectedUser(uniqueSenders[uniqueSenders.length - 1]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin;
    const socket = io(serverUrl);
    socket.on('zalo_message_update', fetchMessages);
    socket.on('zalo_ai_session_update', (data) => {
      if (data && String(data.zalo_uid) === String(selectedUserRef.current)) {
        setAiSession(prev => ({ ...prev, is_ai_active: data.is_ai_active, muted_by: data.muted_by }));
      }
    });
    
    return () => {
      socket.off('zalo_message_update', fetchMessages);
      socket.off('zalo_ai_session_update');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedUser]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước file vượt quá 10MB');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview('file'); // Flag to render file icon instead of image
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || !selectedUser) return;
    
    try {
      setLoading(true);
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // Upload to local media endpoint first
        const uploadRes = await axios.post('/api/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (uploadRes.data?.url) {
           attachmentUrl = uploadRes.data.url;
           attachmentType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
           attachmentName = selectedFile.name;
        }
      }

      await axios.post('/api/zalo-v2/sandbox/reply', {
        recipientId: selectedUser,
        text: inputText.trim(),
        attachmentUrl,
        attachmentType,
        attachmentName
      });
      
      setInputText('');
      removeFile();
      fetchMessages(); // refresh immediately
    } catch (error) {
      const errData = error.response?.data;
      let errMsg = errData?.error || error.message;
      if (errData?.details) {
         if (typeof errData.details === 'object') {
             errMsg += ' - ' + JSON.stringify(errData.details);
         } else {
             errMsg += ' - ' + errData.details;
         }
      }
      swalConfirm(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group by sender and calculate last message timestamp
  const uniqueSenders = [...new Set(messages.map(m => m.senderId))];
  const senderProfiles = uniqueSenders.map(uid => {
    const msgs = messages.filter(m => m.senderId === uid);
    const matchedLead = leads.find(l => String(l.zalo_uid) === String(uid));
    // Tìm tên khách hàng thật (ưu tiên matchedLead nếu không phải tên tạm, sau đó là tin nhắn có senderName)
    const hasRealLeadName = matchedLead?.name && !matchedLead.name.startsWith('Zalo Guest') && !matchedLead.name.startsWith('Zalo User');
    const msgWithCustomerName = msgs.slice().reverse().find(m => m.senderName && !m.senderName.includes('AI Agent') && !m.senderName.startsWith('Zalo Guest') && !m.senderName.startsWith('Zalo User'));
    
    const customerName = hasRealLeadName 
      ? matchedLead.name 
      : (msgWithCustomerName?.senderName || matchedLead?.name || `Zalo User (${uid.substring(0, 8)}...)`);
    const customerAvatar = (msgWithCustomerName && msgWithCustomerName.senderAvatar) || (matchedLead?.avatar_url) || null;
    
    const lastMessageTimestamp = msgs.length > 0 ? new Date(msgs[msgs.length - 1].timestamp).getTime() : 0;
    
    const incomingMsgs = msgs.filter(m => m.type === 'incoming');
    const lastIncomingTimestamp = incomingMsgs.length > 0 ? new Date(incomingMsgs[incomingMsgs.length - 1].timestamp).getTime() : 0;
    
    // Determine last message text
    let lastMessageText = '';
    if (msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg.attachmentType === 'image' || lastMsg.type === 'image') {
         lastMessageText = '[Hình ảnh]';
      } else if (lastMsg.attachmentType === 'file' || lastMsg.type === 'file') {
         lastMessageText = '[Tập tin]';
      } else {
         lastMessageText = lastMsg.text || '...';
      }
    }

    return {
      uid,
      name: customerName,
      avatar: customerAvatar,
      lastMessageTimestamp,
      lastIncomingTimestamp,
      matchedLead,
      lastMessageText
    };
  }).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

  const activeMessages = messages.filter(m => m.senderId === selectedUser).slice(-30);
  const selectedUserProfile = senderProfiles.find(p => p.uid === selectedUser);
  const isWindowClosed = selectedUserProfile && (Date.now() - selectedUserProfile.lastIncomingTimestamp > 7 * 24 * 60 * 60 * 1000 || selectedUserProfile.lastIncomingTimestamp === 0);

  const filteredSenderProfiles = senderProfiles.filter(profile => {
     if (!searchTerm) return true;
     const searchLower = searchTerm.toLowerCase();
     return profile.name.toLowerCase().includes(searchLower) ||
            profile.uid.toLowerCase().includes(searchLower) ||
            (profile.lastMessageText && profile.lastMessageText.toLowerCase().includes(searchLower));
  });

  return (
    <div style={{ height: 'calc(100vh - 75px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6', padding: '12px 16px', fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* Top Header Navigation: Sub-menu between Chat Sandbox & AI Settings */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', background: '#fff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentView('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: currentView === 'chat' ? '#2563eb' : 'transparent',
              color: currentView === 'chat' ? '#fff' : '#4b5563',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageCircle size={16} /> 💬 Zalo Chat ({uniqueSenders.length})
          </button>

          <button
            onClick={() => setCurrentView('ai_settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: currentView === 'ai_settings' ? '#2563eb' : 'transparent',
              color: currentView === 'ai_settings' ? '#fff' : '#4b5563',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={16} /> 🤖 Cài Đặt AI Agent & RAG (Meta Style)
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            Gemini 2.5 Flash • RAG Engine
          </span>
          <button 
            onClick={fetchMessages} 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontSize: '12px', fontWeight: 500 }}
            title="Làm mới tin nhắn"
          >
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {currentView === 'ai_settings' ? (
        <div style={{ flex: 1, borderRadius: '12px', overflow: 'auto', minHeight: 0 }}>
          <ZaloAISettingsTab currentUser={currentUser} />
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        
        {/* Sidebar (Users) */}
        <div style={{ 
          width: isMobile ? '100%' : '340px', 
          minWidth: isMobile ? '100%' : '300px', 
          maxWidth: isMobile ? '100%' : '360px', 
          flexShrink: 0, 
          borderRight: isMobile ? 'none' : '1px solid #e5e7eb', 
          backgroundColor: '#f9fafb', 
          display: (isMobile && selectedUser) ? 'none' : 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          overflow: 'hidden' 
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <button 
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                window.history.back();
              }} 
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ffe4e6', color: '#e11d48', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', alignSelf: 'flex-start' }}
            >
              <ChevronLeft size={16} /> Quay lại
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Zalo Chat <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{uniqueSenders.length}</span>
              </h2>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <a 
                  href="/zalo-ai-settings"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    background: '#eff6ff', 
                    color: '#2563eb', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    border: '1px solid #bfdbfe'
                  }}
                >
                  🤖 Cài đặt AI
                </a>
                <button onClick={fetchMessages} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }} title="Làm mới">
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
               <input
                 type="text"
                 placeholder="Tìm tin nhắn, tên khách..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px' }}
               />
               <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {filteredSenderProfiles.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                {searchTerm ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có tin nhắn nào.\\n\\nHãy dùng Zalo cá nhân nhắn "Alo" vào OA để bắt đầu.'}
              </div>
            ) : (
              filteredSenderProfiles.map(profile => {
                const lead = profile.matchedLead;
                return (
                <div 
                  key={profile.uid}
                  onClick={() => setSelectedUser(profile.uid)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid #f3f4f6', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    backgroundColor: selectedUser === profile.uid ? '#eff6ff' : '#fff',
                    borderLeft: selectedUser === profile.uid ? '4px solid #3b82f6' : '4px solid transparent',
                    transition: 'background-color 0.2s',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '600', color: selectedUser === profile.uid ? '#1d4ed8' : '#1f2937', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {profile.name}
                        {lead && lead.is_returning_customer && (
                            <span style={{ fontSize: '0.55rem', background: '#f3e8ff', color: '#9333ea', padding: '1px 4px', borderRadius: '4px', fontWeight: 800, whiteSpace: 'nowrap' }} title="Khách VVIP đã từng booking.">
                                🎖️ KHÁCH QUEN
                            </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(profile.lastMessageTimestamp).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', padding: '1px 4px', borderRadius: '4px', background: (lead && lead.bu_group) ? '#e0e7ff' : '#4338ca', color: (lead && lead.bu_group) ? '#4338ca' : '#e0e7ff', fontWeight: 'bold' }}>BU: {(lead && lead.bu_group) ? bus.find(b => b.id === lead.bu_group)?.name || lead.bu_group : 'Chưa phân'}</span>
                      <span style={{ fontSize: '10px', padding: '1px 4px', borderRadius: '4px', background: (lead && (lead.assigned_to || lead.sale_id)) ? '#dcfce7' : '#fee2e2', color: (lead && (lead.assigned_to || lead.sale_id)) ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>Sale: {(lead && (lead.assigned_to || lead.sale_id)) ? users.find(u => u.id === (lead.assigned_to || lead.sale_id))?.full_name || 'Đã phân' : 'Chưa phân'}</span>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: selectedUser === profile.uid ? '#3b82f6' : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.lastMessageText || `Zalo ID: ${profile.uid}`}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ 
          flex: 1, 
          minWidth: 0, 
          display: (isMobile && !selectedUser) ? 'none' : 'flex', 
          flexDirection: 'column', 
          backgroundColor: '#fff', 
          position: 'relative', 
          height: '100%', 
          overflow: 'hidden' 
        }}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', borderBottom: '1px solid #e2e8f0', padding: isMobile ? '10px 12px' : '16px', backgroundColor: '#fff', zIndex: 10, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                {isMobile && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '10px', alignSelf: 'flex-start' }}
                  >
                    <ChevronLeft size={16} /> Danh sách hội thoại
                  </button>
                )}
                <div className="chat-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div>
                      <h3 className="chat-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: 0, fontWeight: 'bold', color: '#1f2937', fontSize: '16px' }}>
                        {selectedUserProfile?.name || 'Loading...'}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span> Đang kết nối API
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="chat-action-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['admin', 'SALES_LEAD'].includes(currentUser?.role) && (
                      <button onClick={handleDeleteSingle} className="inbox-danger-btn" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <Trash2 size={15} /> XÓA
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (localLeadData) {
                          setEditingLead(localLeadData);
                        } else {
                          try {
                            const token = localStorage.getItem("token");
                            const profile = senderProfiles.find(p => p.uid === selectedUser);
                            const res = await axios.post('/api/leads', {
                              name: profile?.name || `Zalo Guest ${String(selectedUser).substring(0, 5)}`,
                              source: 'Zalo',
                              status: 'Mới',
                              zalo_uid: String(selectedUser)
                            }, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            setLocalLeadData(res.data);
                            if (fetchLeads) fetchLeads(true);
                            setEditingLead(res.data);
                          } catch (err) {
                            alert("Không thể tạo hồ sơ Lead: " + err.message);
                          }
                        }
                      }}
                      className="inbox-action-btn"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <User size={15} /> XEM PROFILE
                    </button>
                    {handleConvertLead && (
                      <button
                        disabled={converting}
                        onClick={async () => {
                           if (!localLeadData) {
                              alert("Khách hàng này chưa có hồ sơ Lead.");
                              return;
                           }
                           if (await swalConfirm(`Bạn có chắc chắn muốn chuyển khách này sang Chốt Đơn & Tạo Khách Hàng?`)) {
                              setConverting(true);
                              await handleConvertLead(localLeadData.id);
                              setConverting(false);
                           }
                        }}
                        className="btn-pro-save"
                        style={{ background: '#10b981', opacity: converting ? 0.7 : 1, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', border: 'none', color: 'white', cursor: converting ? 'not-allowed' : 'pointer' }}
                      >
                        <CheckSquare size={15} /> {converting ? 'ĐANG XỬ LÝ...' : 'CHỐT ĐƠN'}
                      </button>
                    )}
                  </div>
                </div>

                {/* ROW 2: Source & Selectors */}
                <div className="chat-source" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#2563eb', fontWeight: 600 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span> Zalo OA Sandbox
                  </div>
                  <div className="chat-assignment-selectors" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="assignment-badge" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b', marginRight: '4px', fontWeight: 600 }}>BU:</span>
                      <select 
                        value={localLeadData?.bu_group || ""} 
                        onChange={(e) => handleUpdateAssignment('bu_group', e.target.value)}
                        className="assignment-select"
                        style={{ color: localLeadData?.bu_group ? '#0f172a' : '#ef4444', background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <option value="">Chưa phân</option>
                        {bus.map(b => <option key={b.id} value={b.id}>{b.label || b.id}</option>)}
                      </select>
                    </div>
                    <div className="assignment-badge" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b', marginRight: '4px', fontWeight: 600 }}>Sale:</span>
                      <div className="inbox-assignee-select" style={{ minWidth: '130px', height: '22px', marginLeft: '5px' }}>
                        <SearchableSelect
                          options={getSaleOptions(localLeadData?.bu_group)}
                          value={localLeadData?.assigned_to || ""}
                          onChange={(val) => handleUpdateAssignment('assigned_to', val)}
                          placeholder="Chưa phân"
                          emptyText="Không tìm thấy sale"
                          style={{ color: localLeadData?.assigned_to ? '#0f172a' : '#ef4444', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                    <div className="assignment-badge" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b', marginRight: '4px', fontWeight: 600 }}>Tour:</span>
                      <div className="inbox-assignee-select" style={{ minWidth: '150px', height: '22px', marginLeft: '5px' }}>
                        <SearchableSelect
                          options={tours}
                          value={localLeadData?.tour_id || ""}
                          onChange={(val) => handleUpdateAssignment('tour_id', val)}
                          placeholder="Chưa chọn Tour"
                          emptyText="Không tìm thấy tour"
                          shortLabel={true}
                          style={{ color: localLeadData?.tour_id ? '#0f172a' : '#ef4444', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI AGENT STATUS & HUMAN TAKEOVER BANNER */}
                <div style={{
                  padding: isMobile ? '6px 10px' : '8px 16px',
                  marginTop: isMobile ? '6px' : '10px',
                  borderRadius: '8px',
                  backgroundColor: aiSession.is_ai_active ? '#f0fdf4' : '#fffbeb',
                  border: aiSession.is_ai_active ? '1px solid #bbf7d0' : '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    <span style={{ 
                      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: aiSession.is_ai_active ? '#22c55e' : '#f59e0b',
                      boxShadow: aiSession.is_ai_active ? '0 0 8px #22c55e' : 'none'
                    }}></span>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ 
                        fontSize: isMobile ? '11px' : '12.5px', 
                        fontWeight: 700, 
                        color: aiSession.is_ai_active ? '#15803d' : '#b45309',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {aiSession.is_ai_active ? '🟢 AI Agent Đang Tự Động Trực & Tư Vấn' : '🟠 Nhân Viên Tiếp Quản (AI Tắt)'}
                      </div>
                      {!isMobile && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {aiSession.is_ai_active 
                            ? '• AI sẽ tự động trả lời tin nhắn của khách' 
                            : `• ${aiSession.muted_by === 'human_message' ? 'Đã ngắt khi nhân viên gửi tin' : aiSession.muted_by === 'sales_assigned' ? 'Đã gán cho Sales' : 'Đã tắt thủ công'}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleAi}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: isMobile ? '4px 8px' : '5px 12px',
                      borderRadius: '6px',
                      fontSize: isMobile ? '10.5px' : '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: aiSession.is_ai_active ? '#ef4444' : '#0284c7',
                      color: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {aiSession.is_ai_active ? '🛑 Dừng AI' : '⚡ Bật Lại AI'}
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, minHeight: 0, padding: '16px 20px', overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
                {activeMessages.map(msg => (
                  <div key={msg.id || msg.timestamp} style={{ display: 'flex', justifyContent: msg.type === 'outgoing' ? 'flex-end' : 'flex-start', width: '100%' }}>
                    <div style={{ 
                      maxWidth: '75%', 
                      padding: '12px 16px', 
                      borderRadius: '16px', 
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      backgroundColor: msg.type === 'outgoing' ? '#3b82f6' : '#fff',
                      color: msg.type === 'outgoing' ? '#fff' : '#1f2937',
                      border: msg.type === 'outgoing' ? 'none' : '1px solid #e5e7eb',
                      borderBottomRightRadius: msg.type === 'outgoing' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.type === 'outgoing' ? '16px' : '4px'
                    }}>
                      {/* Sender Badge */}
                      {msg.type === 'outgoing' && (
                        <div style={{ fontSize: '10.5px', color: '#bfdbfe', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {msg.senderType === 'ai' || msg.senderId === 'zalo_ai_agent' 
                            ? '🤖 FIT TOUR AI Agent' 
                            : `👤 ${msg.senderStaffName || 'Tư vấn viên'}`}
                        </div>
                      )}
                      <div style={{ fontSize: '15px', lineHeight: '1.6', wordBreak: 'break-word' }}>
                        {String(msg.text || '').split('\n').map((line, lIdx, arr) => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g;
                          const parts = line.split(urlRegex);
                          return (
                            <React.Fragment key={lIdx}>
                              {parts.map((part, pIdx) => {
                                if (part.match(urlRegex)) {
                                  return (
                                    <a 
                                      key={pIdx} 
                                      href={part} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      style={{ color: msg.type === 'outgoing' ? '#bae6fd' : '#0284c7', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: 600 }}
                                    >
                                      {part}
                                    </a>
                                  );
                                }
                                const boldRegex = /(\*\*[^*]+\*\*)/g;
                                const subParts = part.split(boldRegex);
                                return subParts.map((sub, sIdx) => {
                                  if (sub.startsWith('**') && sub.endsWith('**') && sub.length > 4) {
                                    return (
                                      <strong key={`${pIdx}-${sIdx}`} style={{ fontWeight: 700, color: msg.type === 'outgoing' ? '#ffffff' : '#111827' }}>
                                        {sub.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return sub;
                                });
                              })}
                              {lIdx < arr.length - 1 && <br />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                      
                      {/* Hiển thị đính kèm */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: msg.text ? '8px' : '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} style={{ 
                              border: msg.type === 'outgoing' ? '1px solid #60a5fa' : '1px solid #d1d5db',
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              backgroundColor: msg.type === 'outgoing' ? '#2563eb' : '#f3f4f6'
                            }}>
                              {att.type === 'image' ? (
                                <img src={att.url} alt="attachment" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <a href={att.url} target="_blank" rel="noreferrer" style={{ 
                                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', 
                                  color: msg.type === 'outgoing' ? '#fff' : '#1f2937', 
                                  textDecoration: 'none' 
                                }}>
                                  <FileText size={24} />
                                  <span style={{ fontSize: '13px', wordBreak: 'break-all' }}>{att.name || 'Tải xuống tệp'}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ 
                        fontSize: '11px', 
                        marginTop: '6px', 
                        textAlign: 'right',
                        color: msg.type === 'outgoing' ? '#dbeafe' : '#9ca3af'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: isMobile ? '8px 12px' : '16px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', position: 'relative' }}>
                
                {isWindowClosed && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>
                      Cửa sổ tương tác miễn phí (7 ngày) đã đóng. Khách hàng cần nhắn lại để mở khóa.
                    </span>
                  </div>
                )}

                {filePreview && (
                  <div style={{ 
                    position: 'absolute', top: '-60px', left: '12px', 
                    padding: '6px 10px', backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    {filePreview === 'file' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563' }}>
                        <File size={20} />
                        <span style={{ fontSize: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile?.name}</span>
                      </div>
                    ) : (
                      <img src={filePreview} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    )}
                    <button onClick={removeFile} style={{ 
                      background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', 
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      cursor: 'pointer' 
                    }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleSend} style={{ display: 'flex', gap: isMobile ? '8px' : '12px', position: 'relative', alignItems: 'center' }}>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect} 
                    style={{ display: 'none' }} 
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: selectedFile ? '#3b82f6' : '#6b7280',
                      padding: '4px'
                    }}
                    title="Đính kèm Ảnh / File PDF"
                  >
                    <Paperclip size={isMobile ? 20 : 22} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập câu trả lời test (VD: Xin chào)..."
                    style={{ 
                      flex: 1, 
                      border: '1px solid #d1d5db', 
                      borderRadius: '9999px', 
                      padding: isMobile ? '8px 14px' : '12px 20px', 
                      outline: 'none',
                      fontSize: isMobile ? '13.5px' : '15px'
                    }}
                  />
                  
                  <button 
                    type="submit"
                    disabled={(!inputText.trim() && !selectedFile) || loading}
                    style={{ 
                      backgroundColor: (inputText.trim() || selectedFile) ? '#2563eb' : '#9ca3af',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: isMobile ? '38px' : '48px',
                      height: isMobile ? '38px' : '48px',
                      minWidth: isMobile ? '38px' : '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (inputText.trim() || selectedFile) ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <Send size={isMobile ? 16 : 20} style={{ marginLeft: '2px' }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#f9fafb', flexDirection: 'column', gap: '16px' }}>
              <MessageCircle size={64} color="#d1d5db" />
              <p>Chọn một khách hàng ở cột trái để bắt đầu test</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default ZaloSandboxTab;
