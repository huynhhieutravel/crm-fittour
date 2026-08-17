import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, User, RefreshCw, MessageCircle, Paperclip, X, File, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';

const ZaloChatDrawer = ({ initialZaloUid, onClose, leads = [] }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(initialZaloUid || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/zalo-v2/sandbox/messages');
      setMessages(res.data || []);
      
      setSelectedUser(prev => {
        if (initialZaloUid) return initialZaloUid;
        if (!prev && res.data && res.data.length > 0) {
          const uniqueSenders = [...new Set(res.data.map(m => m.senderId))];
          if (uniqueSenders.length > 0) {
            return uniqueSenders[uniqueSenders.length - 1];
          }
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching Zalo messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin;
    const socket = io(serverUrl);
    socket.on('zalo_message_update', fetchMessages);
    
    return () => {
      socket.off('zalo_message_update', fetchMessages);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (initialZaloUid) {
      setSelectedUser(initialZaloUid);
    }
  }, [initialZaloUid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedUser]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
      setFilePreview('file');
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
      fetchMessages();
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
      alert('Lỗi: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Group by sender and calculate last message timestamp
  const uniqueSenders = [...new Set(messages.map(m => m.senderId))];
  const senderProfiles = uniqueSenders.map(uid => {
    const msgs = messages.filter(m => m.senderId === uid);
    const msgWithName = msgs.slice().reverse().find(m => m.senderName);
    const lastMessageTimestamp = msgs.length > 0 ? new Date(msgs[msgs.length - 1].timestamp).getTime() : 0;
    
    const incomingMsgs = msgs.filter(m => m.type === 'incoming');
    const lastIncomingTimestamp = incomingMsgs.length > 0 ? new Date(incomingMsgs[incomingMsgs.length - 1].timestamp).getTime() : 0;
    
    // Check if linked to lead
    const matchedLead = leads.find(l => l.zalo_uid === uid);

    return {
      uid,
      name: matchedLead?.name || (msgWithName ? msgWithName.senderName : `Zalo User (${uid.substring(0, 8)}...)`),
      avatar: msgWithName ? msgWithName.senderAvatar : null,
      lastMessageTimestamp,
      lastIncomingTimestamp,
      matchedLead
    };
  }).sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

  const activeMessages = messages.filter(m => m.senderId === selectedUser).slice(-50);
  const selectedUserProfile = senderProfiles.find(p => p.uid === selectedUser);
  const isWindowClosed = selectedUserProfile && (Date.now() - selectedUserProfile.lastIncomingTimestamp > 7 * 24 * 60 * 60 * 1000 || selectedUserProfile.lastIncomingTimestamp === 0);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Header */}
      <div style={{ 
        padding: '12px 20px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0068ff 0%, #004ecc 100%)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={22} color="#0068ff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Zalo OA Chat</h2>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.9 }}>Tương tác trực tiếp khách hàng Zalo Official Account</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchMessages} 
            title="Làm mới tin nhắn"
            style={{ 
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', 
              cursor: 'pointer', color: '#fff', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button 
            onClick={onClose} 
            title="Đóng cửa sổ"
            style={{ 
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', 
              cursor: 'pointer', color: '#fff', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar (Users) */}
        <div style={{ width: '320px', minWidth: '280px', borderRight: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
            Danh sách hội thoại ({uniqueSenders.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {uniqueSenders.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Chưa có tin nhắn Zalo nào.
              </div>
            ) : (
              senderProfiles.map(profile => (
                <div 
                  key={profile.uid}
                  onClick={() => setSelectedUser(profile.uid)}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f1f5f9', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    backgroundColor: selectedUser === profile.uid ? '#eff6ff' : 'transparent',
                    borderLeft: selectedUser === profile.uid ? '4px solid #0068ff' : '4px solid transparent',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '38px', height: '38px', backgroundColor: '#cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <User size={18} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ 
                        display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                        backgroundColor: (Date.now() - profile.lastIncomingTimestamp <= 7 * 24 * 60 * 60 * 1000) ? '#10b981' : '#f59e0b'
                      }}></span>
                      {new Date(profile.lastMessageTimestamp).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
          {selectedUser ? (
            <>
              {/* Active User Header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedUserProfile?.avatar ? (
                    <img src={selectedUserProfile.avatar} alt="avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '38px', height: '38px', backgroundColor: '#0068ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                      {selectedUserProfile?.name || 'Zalo User'}
                    </h3>
                    <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>UID: {selectedUser}</span>
                      {selectedUserProfile?.matchedLead && (
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '10.5px' }}>
                          Lead #{selectedUserProfile.matchedLead.id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeMessages.map(msg => (
                  <div key={msg.id || msg.timestamp} style={{ display: 'flex', justifyContent: msg.type === 'outgoing' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '75%', 
                      padding: '10px 14px', 
                      borderRadius: '14px', 
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      backgroundColor: msg.type === 'outgoing' ? '#0068ff' : '#fff',
                      color: msg.type === 'outgoing' ? '#fff' : '#1e293b',
                      border: msg.type === 'outgoing' ? 'none' : '1px solid #e2e8f0',
                      borderBottomRightRadius: msg.type === 'outgoing' ? '3px' : '14px',
                      borderBottomLeftRadius: msg.type === 'outgoing' ? '14px' : '3px'
                    }}>
                      <div style={{ fontSize: '14px', lineHeight: '1.45', wordBreak: 'break-word' }}>{msg.text}</div>
                      
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: msg.text ? '8px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} style={{ 
                              border: msg.type === 'outgoing' ? '1px solid #60a5fa' : '1px solid #cbd5e1',
                              borderRadius: '8px', 
                              overflow: 'hidden',
                              backgroundColor: msg.type === 'outgoing' ? '#0052cc' : '#f8fafc'
                            }}>
                              {att.type === 'image' ? (
                                <img src={att.url} alt="attachment" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <a href={att.url} target="_blank" rel="noreferrer" style={{ 
                                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', 
                                  color: msg.type === 'outgoing' ? '#fff' : '#1e293b', 
                                  textDecoration: 'none' 
                                }}>
                                  <FileText size={20} />
                                  <span style={{ fontSize: '12.5px', wordBreak: 'break-all' }}>{att.name || 'Tải xuống tệp'}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ 
                        fontSize: '10.5px', 
                        marginTop: '4px', 
                        textAlign: 'right',
                        color: msg.type === 'outgoing' ? '#bfdbfe' : '#94a3b8'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div style={{ padding: '14px 20px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', position: 'relative' }}>
                {isWindowClosed && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '12.5px', fontWeight: 500 }}>
                      Cửa sổ tương tác 7 ngày đã đóng. Khách hàng cần nhắn lại để mở khóa hệ thống Zalo OA.
                    </span>
                  </div>
                )}

                {filePreview && (
                  <div style={{ 
                    position: 'absolute', top: '-65px', left: '20px', 
                    padding: '6px 12px', backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0', borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    {filePreview === 'file' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                        <File size={20} />
                        <span style={{ fontSize: '12px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile?.name}</span>
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

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                      color: selectedFile ? '#0068ff' : '#64748b',
                      padding: '6px'
                    }}
                    title="Đính kèm Ảnh / File PDF"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn phản hồi Zalo..."
                    style={{ 
                      flex: 1, 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '9999px', 
                      padding: '10px 18px', 
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                  
                  <button 
                    type="submit"
                    disabled={(!inputText.trim() && !selectedFile) || loading}
                    style={{ 
                      backgroundColor: (inputText.trim() || selectedFile) ? '#0068ff' : '#94a3b8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: (inputText.trim() || selectedFile) ? 'pointer' : 'not-allowed',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    <Send size={18} style={{ marginLeft: '2px' }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '12px' }}>
              <MessageCircle size={48} color="#cbd5e1" />
              <p style={{ margin: 0, fontSize: '14px' }}>Chọn một hội thoại Zalo ở danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZaloChatDrawer;
