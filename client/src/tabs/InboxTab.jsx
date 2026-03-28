import React from 'react';
import { UserPlus } from 'lucide-react';

const InboxTab = ({ 
  conversations, 
  selectedConv, 
  setSelectedConv, 
  fetchMessages, 
  messages, 
  setEditingLead, 
  leads, 
  handleSendMessage, 
  newMessage, 
  setNewMessage 
}) => {
  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 220px)', background: 'white', borderRadius: '1.25rem', overflow: 'hidden', display: 'grid', gridTemplateColumns: '320px 1fr', border: '1px solid #eaeff4' }}>
      <div style={{ borderRight: '1px solid #eaeff4', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff4', fontWeight: 700 }}>Hội thoại gần đây</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => { setSelectedConv(conv); fetchMessages(conv.id); }} 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                borderBottom: '1px solid #f8fafc', 
                background: selectedConv?.id === conv.id ? '#f1f5f9' : 'transparent', 
                borderLeft: selectedConv?.id === conv.id ? '4px solid #6366f1' : '4px solid transparent' 
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{conv.lead_name || 'Khách Facebook'}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.last_message}</div>
            </div>
          ))}
        </div>
      </div>
      {selectedConv ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eaeff4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>{selectedConv.lead_name || 'Khách vãng lai'}</div>
            <button 
              className="icon-btn" 
              onClick={() => { setEditingLead(leads.find(l => l.id === selectedConv.lead_id)); }}
            >
              <UserPlus size={16} />
            </button>
          </div>
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ marginBottom: '1.5rem', textAlign: msg.sender_type === 'customer' ? 'left' : 'right' }}>
                <div 
                  style={{ 
                    display: 'inline-block', 
                    padding: '0.75rem 1.25rem', 
                    borderRadius: '1rem', 
                    background: msg.sender_type === 'customer' ? 'white' : '#6366f1', 
                    color: msg.sender_type === 'customer' ? '#1e293b' : 'white', 
                    boxShadow: msg.sender_type === 'customer' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', 
                    maxWidth: '70%' 
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <form 
            onSubmit={handleSendMessage} 
            style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #eaeff4', display: 'flex', gap: '1rem' }}
          >
            <input 
              className="filter-input" 
              style={{ flex: 1 }} 
              placeholder="Nhập tin nhắn..." 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
            />
            <button type="submit" className="login-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>GỬI</button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          Chọn một hội thoại để bắt đầu nhắn tin.
        </div>
      )}
    </div>
  );
};

export default InboxTab;
