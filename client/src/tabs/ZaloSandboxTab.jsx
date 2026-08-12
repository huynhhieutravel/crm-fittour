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
    <div className="flex h-full bg-gray-50 p-4 font-sans" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Sidebar (Users) */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800">Khách Hàng (PoC)</h2>
            <button onClick={fetchMessages} className="text-gray-500 hover:text-blue-500">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {uniqueSenders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Chưa có tin nhắn nào.<br/>Hãy dùng Zalo cá nhân nhắn "Alo" vào OA để bắt đầu.
              </div>
            ) : (
              uniqueSenders.map(uid => (
                <div 
                  key={uid}
                  onClick={() => setSelectedUser(uid)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-3 ${selectedUser === uid ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">UID: {uid.substring(0, 8)}...</div>
                    <div className="text-xs text-gray-500">Click để xem tin nhắn</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-white relative">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm z-10">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Zalo User ({selectedUser})</h3>
                  <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đang kết nối API
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {activeMessages.map(msg => (
                  <div key={msg.id || msg.timestamp} className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.type === 'outgoing' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                      <div className="text-[15px]">{msg.text}</div>
                      <div className={`text-[10px] mt-1 text-right ${msg.type === 'outgoing' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập câu trả lời test (VD: Xin chào, ERP đã nhận được)..."
                    className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 flex-col gap-4">
              <MessageCircle size={64} className="text-gray-300" />
              <p>Chọn một khách hàng ở cột trái để bắt đầu test</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ZaloSandboxTab;
