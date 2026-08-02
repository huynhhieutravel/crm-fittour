const fs = require('fs');

let content = fs.readFileSync('client/src/tabs/GlobalChatTab.jsx', 'utf8');

// Update imports
content = content.replace("import { Bot, CheckCircle2, UserPlus, Info, Bell, Send, Search, MoreVertical, ShieldAlert } from 'lucide-react';",
"import { Bot, CheckCircle2, UserPlus, Info, Bell, Send, Search, MoreVertical, ShieldAlert, MessageCircle, Phone, Copy } from 'lucide-react';");

// Insert handleBUChange
const handleClaimIndex = content.indexOf("const handleClaim = async");
const handleBUChange = `
    const handleBUChange = async (leadId, newBU) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(\`/api/leads/\${leadId}\`, { bu_group: newBU }, {
                headers: { Authorization: \`Bearer \${token}\` }
            });
            toast.success('Đã cập nhật BU thành công');
            setNotifications(prev => prev.map(n => n.reference_id === leadId ? { ...n, bu_group: newBU } : n));
        } catch (error) {
            toast.error('Lỗi cập nhật BU');
        }
    };
`;
content = content.slice(0, handleClaimIndex) + handleBUChange + "\n    " + content.slice(handleClaimIndex);

// Add the extra buttons under message
const messageRenderIndex = content.indexOf("{notif.type === 'NEW_LEAD' && notif.assigned_to_name && (");
const extraButtons = `
                                {notif.type === 'NEW_LEAD' && (
                                    <div style={{ marginTop: '5px', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: '500' }}>BU:</span>
                                            <select 
                                                value={notif.bu_group || ''}
                                                onChange={(e) => handleBUChange(notif.reference_id, e.target.value)}
                                                style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white' }}
                                            >
                                                <option value="">Chưa phân bổ</option>
                                                <option value="BU1">BU1</option>
                                                <option value="BU2">BU2</option>
                                                <option value="BU3">BU3</option>
                                                <option value="BU4">BU4</option>
                                                <option value="BU5">BU5</option>
                                            </select>
                                        </div>
                                        {notif.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Phone size={14} /> 
                                                <span>{notif.phone}</span>
                                                <button 
                                                    onClick={() => { navigator.clipboard.writeText(notif.phone); toast.success('Đã copy số điện thoại!'); }} 
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                                >
                                                    <Copy size={12} /> Copy
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => navigate(\`/leads/\${notif.reference_id}\`)}
                                            style={{
                                                marginTop: '5px',
                                                width: '100%',
                                                padding: '8px 0',
                                                background: '#f1f5f9',
                                                color: '#334155',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <MessageCircle size={16} /> Xem Chi Tiết Lead (Inbox)
                                        </button>
                                    </div>
                                )}
`;
content = content.slice(0, messageRenderIndex) + extraButtons + "\n                                " + content.slice(messageRenderIndex);

fs.writeFileSync('client/src/tabs/GlobalChatTab.jsx', content);
