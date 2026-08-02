const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/components/modals/EditLeadModal.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect, useRef } from 'react';\nimport { io } from 'socket.io-client';"
);

content = content.replace(
  "  loading\n}) => {",
  "  loading,\n  currentUser\n}) => {"
);

const hookCode = `
  const [activities, setActivities] = useState([]);
  const [activityText, setActivityText] = useState('');
  const [sendingActivity, setSendingActivity] = useState(false);
  const activitiesEndRef = useRef(null);
  
  useEffect(() => {
    if (activeTab === 'history' && editingLead?.id) {
      axios.get(\`/api/leads/\${editingLead.id}/activities\`, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }})
        .then(res => setActivities(res.data))
        .catch(err => console.error(err));
        
      const socket = io({ path: '/socket.io/' });
      socket.on('new_lead_activity', (data) => {
        if (data.lead_id === editingLead.id) {
          setActivities(prev => [...prev, data]);
        }
      });
      return () => socket.disconnect();
    }
  }, [activeTab, editingLead?.id]);

  useEffect(() => {
    if (activitiesEndRef.current) {
      activitiesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities]);

  const handleSendActivity = async (e) => {
    e.preventDefault();
    if (!activityText.trim()) return;
    setSendingActivity(true);
    try {
      await axios.post(\`/api/leads/\${editingLead.id}/activities\`, { content: activityText, type: 'USER_CHAT' }, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }});
      setActivityText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingActivity(false);
    }
  };
`;

content = content.replace(
  "  const [loadingReminders, setLoadingReminders] = useState(false);",
  "  const [loadingReminders, setLoadingReminders] = useState(false);\n" + hookCode
);

const oldHistoryTabStart = "<div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>";
const oldHistoryTabEnd = "        <div className=\"modal-header-actions-group\" style={{ gridColumn: '1 / -1', marginTop: '1.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>";

const beforeHistory = content.substring(0, content.indexOf(oldHistoryTabStart));
const afterHistory = content.substring(content.indexOf(oldHistoryTabEnd));

const newHistoryTab = `
      <div style={{ display: activeTab === 'history' ? 'block' : 'none', height: '500px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
        <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={18} color="#6366f1" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Luồng Hoạt động (Activity Feed)</h3>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Chưa có hoạt động nào.</div>
          ) : (
            activities.map(act => {
              const isMe = act.user_id === currentUser?.id;
              const isSystem = act.type === 'SYSTEM_LOG';
              
              if (isSystem) {
                return (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <div style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                      {act.content} - {new Date(act.created_at).toLocaleString('vi-VN')}
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={act.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', margin: '4px 0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px', padding: '0 4px' }}>
                    {isMe ? 'Bạn' : act.user_name || 'Hệ thống'} • {new Date(act.created_at).toLocaleString('vi-VN')}
                  </div>
                  <div style={{ 
                    background: isMe ? '#3b82f6' : '#ffffff', 
                    color: isMe ? '#ffffff' : '#1e293b', 
                    padding: '8px 12px', 
                    borderRadius: '12px', 
                    borderBottomRightRadius: isMe ? '4px' : '12px',
                    borderBottomLeftRadius: !isMe ? '4px' : '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    maxWidth: '85%',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    wordBreak: 'break-word'
                  }}>
                    {act.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={activitiesEndRef} />
        </div>
        
        <div style={{ padding: '1rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea 
              disabled={editingLead.is_locked || sendingActivity}
              placeholder={editingLead.is_locked ? "Data bị khóa" : "Nhập tin nhắn..."}
              value={activityText}
              onChange={e => setActivityText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendActivity(e);
                }
              }}
              style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '20px', padding: '10px 16px', fontSize: '0.9rem', resize: 'none', height: '44px', background: '#f8fafc', outline: 'none' }}
            />
            <button 
              type="button"
              disabled={editingLead.is_locked || sendingActivity || !activityText.trim()}
              onClick={handleSendActivity}
              style={{ width: '44px', height: '44px', borderRadius: '50%', background: activityText.trim() ? '#3b82f6' : '#e2e8f0', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: activityText.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>Nhấn Enter để gửi, Shift+Enter để xuống dòng</div>
        </div>
      </div>
`;

fs.writeFileSync(file, beforeHistory + newHistoryTab + "\n" + afterHistory);
console.log('Updated EditLeadModal.jsx');
