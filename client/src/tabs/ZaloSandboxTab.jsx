import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, RefreshCw, MessageCircle } from 'lucide-react';

const ZaloSandboxTab = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/zalo-v2/sandbox/messages');
      setMessages(res.data || []);
      
      // Auto-select latest user if none selected
      if (!selectedUser && res.data && res.data.length > 0) {
        const uniqueSenders = [...new Set(res.data.map(m => m.senderId))];
        if (uniqueSenders.length > 0) {
          setSelectedUser(uniqueSenders[uniqueSenders.length - 1]);
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
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for PoC
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser) return;
    
    try {
      await axios.post('/api/zalo-v2/sandbox/reply', {
        recipientId: selectedUser,
        text: inputText
      });
      setInputText('');
      fetchMessages(); // refresh immediately
    } catch (error) {
      alert('Lỗi khi gửi tin nhắn: ' + (error.response?.data?.error || error.message));
    }
  };

  // Group by sender
  const uniqueSenders = [...new Set(messages.map(m => m.senderId))];
  const activeMessages = messages.filter(m => m.senderId === selectedUser);

  return (
    <div style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', flex: 1, backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        
        {/* Sidebar (Users) */}
        <div style={{ width: '30%', borderRight: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Khách Hàng (PoC)</h2>
            <button onClick={fetchMessages} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <RefreshCw size={20} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {uniqueSenders.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Chưa có tin nhắn nào.<br/><br/>Hãy dùng Zalo cá nhân nhắn "Alo" vào OA để bắt đầu.
              </div>
            ) : (
              uniqueSenders.map(uid => (
                <div 
                  key={uid}
                  onClick={() => setSelectedUser(uid)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid #f3f4f6', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    backgroundColor: selectedUser === uid ? '#eff6ff' : 'transparent',
                    borderLeft: selectedUser === uid ? '4px solid #3b82f6' : '4px solid transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#d1d5db', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>UID: {uid.substring(0, 8)}...</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Click để xem tin nhắn</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ width: '70%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 'bold', color: '#1f2937', fontSize: '16px' }}>Zalo User ({selectedUser})</h3>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span> Đang kết nối API
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeMessages.map(msg => (
                  <div key={msg.id || msg.timestamp} style={{ display: 'flex', justifyContent: msg.type === 'outgoing' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '12px 16px', 
                      borderRadius: '16px', 
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      backgroundColor: msg.type === 'outgoing' ? '#3b82f6' : '#fff',
                      color: msg.type === 'outgoing' ? '#fff' : '#1f2937',
                      border: msg.type === 'outgoing' ? 'none' : '1px solid #e5e7eb',
                      borderBottomRightRadius: msg.type === 'outgoing' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.type === 'outgoing' ? '16px' : '4px'
                    }}>
                      <div style={{ fontSize: '15px', lineHeight: '1.4' }}>{msg.text}</div>
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
              <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập câu trả lời test (VD: Xin chào, ERP đã nhận được)..."
                    style={{ 
                      flex: 1, 
                      border: '1px solid #d1d5db', 
                      borderRadius: '9999px', 
                      padding: '12px 20px', 
                      outline: 'none',
                      fontSize: '15px'
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    style={{ 
                      backgroundColor: inputText.trim() ? '#2563eb' : '#9ca3af',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Send size={20} style={{ marginLeft: '4px' }} />
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
    </div>
  );
};

export default ZaloSandboxTab;
