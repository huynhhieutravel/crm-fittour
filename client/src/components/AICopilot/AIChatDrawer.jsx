import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AIChatDrawer.css';

const AIChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const defaultMessages = [
    { role: 'ai', text: 'Chào sếp! Em là Trợ lý AI của FIT Tour 🤖\nSếp có thể gõ lệnh như:\n• "Tạo lead khách Tuấn 0901234567 muốn đi Thái"\n• "Tour Giang Nam tháng 6 còn mấy slot?"\n• "Doanh thu tháng này bao nhiêu?"\n• "Ai sinh nhật tháng này?"' }
  ];

  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('fit_ai_chat');
    return saved ? JSON.parse(saved) : defaultMessages;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingExecution, setPendingExecution] = useState(null); // { actionId, timer }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    sessionStorage.setItem('fit_ai_chat', JSON.stringify(messages));
  }, [messages]);

  // Timer logic for 5-Second Undo
  useEffect(() => {
    if (pendingExecution && pendingExecution.timer > 0) {
      const timerId = setTimeout(() => {
        setPendingExecution(prev => prev ? { ...prev, timer: prev.timer - 1 } : null);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (pendingExecution && pendingExecution.timer === 0) {
      // Execute the deferred action
      sendMessage(pendingExecution.actionId);
      setPendingExecution(null);
    }
  }, [pendingExecution]);

  const handleActionClick = (actionId, label, isQuickReply) => {
    if (isQuickReply) {
       // Khong delay quick reply, gui text di ngay lap tuc
       sendMessage(actionId);
    } else {
       // Confirm Action (Tao/Sua/Xoa) -> Delay 5s
       if (pendingExecution && pendingExecution.actionId === actionId) {
          // Bấm lần 2 -> Hủy (Cancel Timer)
          setPendingExecution(null);
       } else {
          // Start Timer 5s
          setPendingExecution({ actionId, label, timer: 5 });
       }
    }
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (overrideText = null) => {
    const text = typeof overrideText === 'string' ? overrideText.trim() : input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    if (typeof overrideText !== 'string') {
      setInput('');
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/chat', { message: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, {
        role: 'ai',
        text: res.data.reply,
        action: res.data.action,
        functionName: res.data.functionName,
        data: res.data.data
      }]);

      // Nạp đạn: Bắn sự kiện xé gió ra toàn cục nếu AI vừa sửa dữ liệu
      const writeActions = ['CREATE', 'WRITE', 'UPDATE', 'DELETE'];
      if (!res.data.needs_confirmation && writeActions.includes(res.data.action)) {
        window.dispatchEvent(new CustomEvent('AI_DATA_CHANGED', { detail: res.data.functionName }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setMessages(prev => [...prev, { role: 'ai', text: `❌ Lỗi: ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/ai/clear', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem('fit_ai_chat');
    setMessages([{ role: 'ai', text: 'Đã xóa lịch sử. Sếp cần gì cứ hỏi em nhé! 🤖' }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format markdown-like text
  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Hỗ trợ Markdown Link: [Text](URL)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #6366f1; text-decoration: underline; font-weight: 600;">$1</a>')
      // Hỗ trợ bọc các thẻ a có sẵn (nếu server lỡ trả về raw HTML)
      .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '<span class="ai-bullet">•</span> ')
      .replace(/\| /g, '<span class="ai-pipe">│</span> ');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-fab ${isOpen ? 'ai-fab--hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="FIT AI"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
          <path d="M18 14h.01"/>
          <path d="M6 14h.01"/>
          <path d="M12 18v4"/>
          <path d="M8 22h8"/>
          <rect x="3" y="10" width="18" height="8" rx="3"/>
        </svg>
        <span className="ai-fab__pulse"></span>
      </button>

      {/* Drawer */}
      <div className={`ai-drawer ${isOpen ? 'ai-drawer--open' : ''}`}>
        {/* Header */}
        <div className="ai-drawer__header">
          <div className="ai-drawer__title">
            <span className="ai-drawer__icon">🤖</span>
            <div>
              <h3>FIT AI</h3>
              <span className="ai-drawer__subtitle">Gemini Flash · FIT Tour</span>
            </div>
          </div>
          <div className="ai-drawer__actions">
            <button onClick={clearChat} className="ai-drawer__btn" title="Xóa lịch sử">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button onClick={() => setIsOpen(false)} className="ai-drawer__btn" title="Đóng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-drawer__messages">
          {messages.map((msg, i) => {
            // Check confirm button(s)
            let textWithoutConfirm = msg.text || '';
            const confirmMatches = [...textWithoutConfirm.matchAll(/\[confirm_action:([^\]|]+)(?:\|([^\]]+))?\]/g)];
            if (confirmMatches.length > 0) {
              textWithoutConfirm = textWithoutConfirm.replace(/\[confirm_action:[^\]]+\]/g, '').trim();
            }

            // Check quick_reply button(s)
            const quickReplyMatches = [...textWithoutConfirm.matchAll(/\[quick_reply:([^\]|]+)(?:\|([^\]]+))?\]/g)];
            if (quickReplyMatches.length > 0) {
              textWithoutConfirm = textWithoutConfirm.replace(/\[quick_reply:[^\]]+\]/g, '').trim();
            }

            return (
              <div key={i} className={`ai-msg ai-msg--${msg.role}`}>
                {msg.role === 'ai' && <span className="ai-msg__avatar">🤖</span>}
                <div className="ai-msg__bubble">
                  <div dangerouslySetInnerHTML={{ __html: formatText(textWithoutConfirm) }} />
                  
                  {/* Nút bấm Interactive cho Action Configuration (Đa nút) */}
                  {msg.role === 'ai' && confirmMatches.length > 0 && i === messages.length - 1 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {confirmMatches.map((match, idx) => {
                        const actionId = match[1];
                        const actionLabel = match[2] || `Xác nhận: "${actionId}"`;
                        const isAllBtn = actionId === 'action_all';

                        // Check pending state
                        const isPending = pendingExecution?.actionId === actionId;

                        return (
                          <button 
                            key={idx}
                            onClick={() => handleActionClick(actionId, actionLabel, false)}
                            style={{ 
                              display: 'flex', alignItems: 'center', 
                              background: isPending ? '#f59e0b' : (isAllBtn ? 'var(--primary-color, #6366f1)' : '#10b981'), 
                              color: 'white', 
                              border: 'none', 
                              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', 
                              fontWeight: '600', fontSize: '13px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {isPending ? `⏳ Đang xử lý... Hủy (${pendingExecution.timer}s)` : (
                              <>
                                {isAllBtn && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                )}
                                {actionLabel}
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Nút bấm Quick Reply (Lựa chọn) */}
                  {msg.role === 'ai' && quickReplyMatches.length > 0 && i === messages.length - 1 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {quickReplyMatches.map((match, idx) => {
                        const actionId = match[1];
                        const actionLabel = match[2] || `Chọn: "${actionId}"`;

                        return (
                          <button 
                            key={`qr-${idx}`}
                            onClick={() => handleActionClick(actionId, actionLabel, true)}
                            style={{ 
                               display: 'flex', alignItems: 'center', 
                               background: 'transparent', 
                               color: 'var(--primary-color, #6366f1)', 
                               border: '1px solid var(--primary-color, #6366f1)', 
                               padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', 
                               fontWeight: '600', fontSize: '12px',
                               transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            {actionLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {msg.action && (
                    <span className={`ai-msg__badge ai-msg__badge--${msg.action}`}>
                      {msg.action === 'WRITE' ? '✏️ Đã thao tác' : '📊 Truy vấn'}
                      {msg.functionName && ` · ${msg.functionName}`}
                    </span>
                  )}
                </div>
                {msg.role === 'user' && <span className="ai-msg__avatar ai-msg__avatar--user">👤</span>}
              </div>
            );
          })}
          {loading && (
            <div className="ai-msg ai-msg--ai">
              <span className="ai-msg__avatar">🤖</span>
              <div className="ai-msg__bubble ai-msg__bubble--loading">
                <div className="ai-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-drawer__input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Gõ lệnh cho AI... (Enter để gửi)"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="ai-drawer__send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChatDrawer;
