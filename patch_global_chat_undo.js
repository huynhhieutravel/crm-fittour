const fs = require('fs');

let content = fs.readFileSync('client/src/tabs/GlobalChatTab.jsx', 'utf8');

// 1. Add useNavigate import
if (!content.includes("useNavigate")) {
    content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { useNavigate } from 'react-router-dom';");
}

// 2. Add navigate and states to component
if (!content.includes("const navigate = useNavigate()")) {
    const componentStart = content.indexOf("const GlobalChatTab = () => {") + "const GlobalChatTab = () => {".length;
    content = content.slice(0, componentStart) + "\n    const navigate = useNavigate();\n    const [claimingId, setClaimingId] = useState(null);\n    const [claimTimer, setClaimTimer] = useState(null);" + content.slice(componentStart);
}

// 3. Replace handleClaim with undo logic
const handleClaimRegex = /const handleClaim = async \([\s\S]*?\}\n    \};\n/m;
const newHandleClaim = `    const handleClaimStart = (leadId, notifId) => {
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
            await axios.post(\`/api/leads/\${leadId}/claim\`, {}, {
                headers: { Authorization: \`Bearer \${token}\` }
            });
            toast.success('Tiếp nhận thành công!');
            axios.get(\`/api/notifications/global-center?timeRange=\${timeRange}&category=\${category}\`, { headers: { Authorization: \`Bearer \${token}\` } })
                .then(res => setNotifications(res.data.notifications || []));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };
`;
content = content.replace(handleClaimRegex, newHandleClaim);

// 4. Update the BU select and the claim button rendering
const getBUColorFunc = `
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
`;

if (!content.includes("getBUColor")) {
    const messageEndRefIdx = content.indexOf("const messagesEndRef = useRef(null);");
    content = content.slice(0, messageEndRefIdx) + getBUColorFunc + "\n    " + content.slice(messageEndRefIdx);
}

// Update the render part for BU select
const oldBUSelectRegex = /<span style={{ fontWeight: '500' }}>BU:<\/span>[\s\S]*?<\/select>/m;
const newBUSelect = `{(() => {
                                                const colors = getBUColor(notif.bu_group);
                                                return (
                                                    <select 
                                                        value={notif.bu_group || ''}
                                                        onChange={(e) => handleBUChange(notif.reference_id, e.target.value)}
                                                        style={{ 
                                                            padding: '4px 10px', 
                                                            fontSize: '12px', 
                                                            fontWeight: '600',
                                                            borderRadius: '12px', 
                                                            border: \`1px solid \${colors.border}\`, 
                                                            background: colors.bg,
                                                            color: colors.text,
                                                            cursor: 'pointer',
                                                            outline: 'none',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none'
                                                        }}
                                                    >
                                                        <option value="">Chưa phân bổ</option>
                                                        <option value="BU1">BU1</option>
                                                        <option value="BU2">BU2</option>
                                                        <option value="BU3">BU3</option>
                                                        <option value="BU4">BU4</option>
                                                        <option value="BU5">BU5</option>
                                                    </select>
                                                );
                                            })()}`;
content = content.replace(oldBUSelectRegex, newBUSelect);

// Update Claim button to show Undo
const oldClaimButtonRegex = /<button[\s\S]*?onClick=\{\(\) => handleClaim\(notif.reference_id, notif.id\)\}[\s\S]*?<\/button>/m;
const newClaimButton = `{claimingId === notif.reference_id ? (
                                            <button 
                                                onClick={handleClaimUndo}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 0',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                Hoàn tác (3s)...
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleClaimStart(notif.reference_id, notif.id)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 0',
                                                    background: '#0ea5e9',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <CheckCircle2 size={16} /> Nhận Lead ngay
                                            </button>
                                        )}`;
content = content.replace(oldClaimButtonRegex, newClaimButton);

fs.writeFileSync('client/src/tabs/GlobalChatTab.jsx', content);
