import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Brain, FileText, Activity, BarChart3, Cpu, RefreshCw, Save, ChevronDown, ChevronRight, Eye, DollarSign, MessageSquare, Zap, Users } from 'lucide-react';

const AgentManagerTab = () => {
  const [activeSection, setActiveSection] = useState('stats');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsMeta, setLogsMeta] = useState({ total: 0, page: 1, total_pages: 1 });
  const [brainFiles, setBrainFiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [reloadMsg, setReloadMsg] = useState('');
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [expandedLog, setExpandedLog] = useState(null);

  // ─── Fetch Stats ────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`/api/ai/admin/stats?period=${statsPeriod}`);
      setStats(res.data);
    } catch (err) { console.error('Stats error:', err); }
  }, [statsPeriod]);

  // ─── Fetch Logs ─────────────────────────
  const fetchLogs = useCallback(async (page = 1) => {
    try {
      const res = await axios.get(`/api/ai/admin/logs?page=${page}&limit=15`);
      setLogs(res.data.logs);
      setLogsMeta({ total: res.data.total, page: res.data.page, total_pages: res.data.total_pages });
    } catch (err) { console.error('Logs error:', err); }
  }, []);

  // ─── Fetch Brain Files ──────────────────
  const fetchBrain = useCallback(async () => {
    try {
      const res = await axios.get('/api/ai/admin/brain');
      setBrainFiles(res.data.files);
    } catch (err) { console.error('Brain error:', err); }
  }, []);

  // ─── Fetch Skills ──────────────────────
  const fetchSkills = useCallback(async () => {
    try {
      const res = await axios.get('/api/ai/admin/skills');
      setSkills(res.data.skills);
    } catch (err) { console.error('Skills error:', err); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBrain();
    fetchSkills();
  }, []);

  useEffect(() => { fetchStats(); }, [statsPeriod]);
  useEffect(() => { if (activeSection === 'logs') fetchLogs(); }, [activeSection]);

  // ─── Edit Brain File ────────────────────
  const openFileEditor = async (file) => {
    try {
      const catPath = file.category === 'core' ? 'core' : file.category;
      const res = await axios.get(`/api/ai/admin/brain/${catPath}/${file.filename}`);
      setEditingFile(file);
      setEditContent(res.data.content);
    } catch (err) { console.error('Read file error:', err); }
  };

  const saveFile = async () => {
    if (!editingFile) return;
    setLoading(true);
    try {
      const catPath = editingFile.category === 'core' ? 'core' : editingFile.category;
      await axios.put(`/api/ai/admin/brain/${catPath}/${editingFile.filename}`, { content: editContent });
      setEditingFile(null);
      fetchBrain();
      setReloadMsg('✅ File đã lưu! Nhấn "Reload Brain" để áp dụng.');
      setTimeout(() => setReloadMsg(''), 5000);
    } catch (err) { console.error('Save error:', err); }
    setLoading(false);
  };

  // ─── Reload Brain ───────────────────────
  const handleReload = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/admin/reload');
      setReloadMsg(`✅ ${res.data.message} (${res.data.brain_tokens_est} tokens, ${res.data.skills_count} skills)`);
      fetchBrain();
      setTimeout(() => setReloadMsg(''), 5000);
    } catch (err) { setReloadMsg('❌ Reload thất bại'); }
    setLoading(false);
  };

  // ─── Format helpers ─────────────────────
  const fmtNum = (n) => (n || 0).toLocaleString('vi-VN');
  const fmtCurrency = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
  const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : 'N/A';
  const fmtMs = (ms) => ms > 1000 ? (ms / 1000).toFixed(1) + 's' : ms + 'ms';

  // ─── RENDER ─────────────────────────────
  return (
    <div className="module-container" style={{ display: 'flex', gap: '0', height: 'calc(100vh - 60px)' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px', minWidth: '220px', background: 'var(--bg-secondary, #1a1a2e)',
        borderRight: '1px solid var(--border-color, #333)', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>AI Agent Manager</div>

        {[
          { id: 'stats', icon: <BarChart3 size={16} />, label: 'Dashboard & Chi phí' },
          { id: 'logs', icon: <Activity size={16} />, label: 'Chat Logs' },
          { id: 'brain', icon: <Brain size={16} />, label: 'Brain Files' },
          { id: 'skills', icon: <Cpu size={16} />, label: 'Skills Registry' },
        ].map(item => (
          <div key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer',
              background: activeSection === item.id ? 'var(--primary-color, #6c5ce7)22' : 'transparent',
              borderLeft: activeSection === item.id ? '3px solid var(--primary-color, #6c5ce7)' : '3px solid transparent',
              color: activeSection === item.id ? 'var(--primary-color, #6c5ce7)' : '#cbd5e1', fontSize: '13px', fontWeight: activeSection === item.id ? 600 : 400,
              transition: 'all 0.15s'
            }}
          >
            {item.icon} {item.label}
          </div>
        ))}

        <div style={{ flex: 1 }} />
        {reloadMsg && <div style={{ padding: '8px 16px', fontSize: '11px', color: 'var(--success-color, #2ed573)', lineHeight: 1.4 }}>{reloadMsg}</div>}
        <div style={{ padding: '8px 16px' }}>
          <button onClick={handleReload} disabled={loading}
            style={{ width: '100%', padding: '8px', background: 'var(--primary-color, #6c5ce7)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Reload Brain
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

        {/* ═══ STATS DASHBOARD ═══ */}
        {activeSection === 'stats' && stats && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>📊 Dashboard FIT AI</h2>
              <select value={statsPeriod} onChange={e => setStatsPeriod(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-tertiary, #2a2a4a)', color: 'inherit', border: '1px solid var(--border-color,#444)', fontSize: '12px' }}>
                <option value="week">7 ngày</option>
                <option value="month">Tháng này</option>
                <option value="all">Tất cả</option>
              </select>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: <MessageSquare size={20} />, label: 'Tổng chat', value: fmtNum(stats.total_chats), color: '#6c5ce7' },
                { icon: <Users size={20} />, label: 'Users', value: fmtNum(stats.unique_users), color: '#00b894' },
                { icon: <Zap size={20} />, label: 'Skill calls', value: fmtNum(stats.skill_calls), color: '#fdcb6e' },
                { icon: <Activity size={20} />, label: 'Avg response', value: fmtMs(stats.avg_response_time_ms), color: '#e17055' },
                { icon: <DollarSign size={20} />, label: 'Chi phí (USD)', value: '$' + stats.estimated_cost_usd, color: '#d63031' },
                { icon: <DollarSign size={20} />, label: 'Chi phí (VNĐ)', value: fmtCurrency(stats.estimated_cost_vnd), color: '#d63031' },
              ].map((card, i) => (
                <div key={i} style={{
                  background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '10px', padding: '16px',
                  border: '1px solid var(--border-color, #333)', position: 'relative', overflow: 'hidden', color: '#e2e8f0'
                }}>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', color: card.color, opacity: 0.3 }}>{card.icon}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '6px' }}>{card.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Top Skills & Users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color,#333)', color: '#e2e8f0' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>🎯 Top Skills</h3>
                {stats.top_skills?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color,#333)22', fontSize: '13px' }}>
                    <span style={{ opacity: 0.8 }}>{s.function_called}</span>
                    <span style={{ fontWeight: 600 }}>{s.count}×</span>
                  </div>
                ))}
                {(!stats.top_skills || stats.top_skills.length === 0) && <div style={{ opacity: 0.4, fontSize: '12px' }}>Chưa có dữ liệu</div>}
              </div>
              <div style={{ background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color,#333)', color: '#e2e8f0' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>👥 Top Users</h3>
                {stats.top_users?.map((u, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color,#333)22', fontSize: '13px' }}>
                    <span style={{ opacity: 0.8 }}>{u.user_name}</span>
                    <span style={{ fontWeight: 600 }}>{u.count}×</span>
                  </div>
                ))}
                {(!stats.top_users || stats.top_users.length === 0) && <div style={{ opacity: 0.4, fontSize: '12px' }}>Chưa có dữ liệu</div>}
              </div>
            </div>

            {/* Token Usage */}
            <div style={{ marginTop: '16px', background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color,#333)', color: '#e2e8f0' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px' }}>🔢 Token Usage</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>Input: <strong>{fmtNum(stats.total_token_input)}</strong></div>
                <div>Output: <strong>{fmtNum(stats.total_token_output)}</strong></div>
                <div>Avg/chat: <strong>{fmtNum(stats.avg_token_input)}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CHAT LOGS ═══ */}
        {activeSection === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>📋 Chat Logs ({logsMeta.total} records)</h2>
              <button onClick={() => fetchLogs(logsMeta.page)} style={{ padding: '6px 12px', background: 'var(--bg-tertiary, #2a2a4a)', color: 'inherit', border: '1px solid var(--border-color,#444)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color,#444)' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'left', width: '130px' }}>Thời gian</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', width: '80px' }}>User</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left' }}>Câu hỏi</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', width: '140px' }}>Skill</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right', width: '70px' }}>Tokens</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right', width: '60px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        style={{ borderBottom: '1px solid var(--border-color,#333)22', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary, #2a2a4a)44'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '8px 6px' }}>{fmtDate(log.created_at)}</td>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{log.user_name}</td>
                        <td style={{ padding: '8px 6px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {expandedLog === log.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          {' '}{log.user_message}
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          {log.function_called ? (
                            <span style={{ background: 'var(--primary-color, #6c5ce7)22', color: 'var(--primary-color, #6c5ce7)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                              {log.function_called}
                            </span>
                          ) : <span style={{ opacity: 0.4 }}>text</span>}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', opacity: 0.7 }}>{fmtNum((log.token_input || 0) + (log.token_output || 0))}</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', opacity: 0.7 }}>{fmtMs(log.response_time_ms)}</td>
                      </tr>
                      {expandedLog === log.id && (
                        <tr><td colSpan={6} style={{ padding: '16px', background: 'var(--bg-tertiary, #2a2a4a)11', fontSize: '12px', borderBottom: '1px solid var(--border-color,#333)22' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <strong style={{ opacity: 0.9 }}>👤 Lệnh của User (Prompt):</strong>
                            <div style={{ whiteSpace: 'pre-wrap', opacity: 0.8, marginTop: '6px', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                              {log.user_message}
                            </div>
                          </div>
                          <div style={{ marginBottom: '8px' }}><strong style={{ opacity: 0.9 }}>🤖 AI Trả lời / Hành động:</strong></div>
                          <div style={{ whiteSpace: 'pre-wrap', opacity: 0.8, maxHeight: '300px', overflow: 'auto', lineHeight: 1.5, padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>{log.ai_reply}</div>
                          <div style={{ marginTop: '8px', display: 'flex', gap: '16px', opacity: 0.5 }}>
                            <span>Model: {log.model_used}</span>
                            <span>In: {fmtNum(log.token_input)}</span>
                            <span>Out: {fmtNum(log.token_output)}</span>
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {logsMeta.total_pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                {Array.from({ length: Math.min(logsMeta.total_pages, 10) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchLogs(p)}
                    style={{
                      padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color,#444)',
                      background: p === logsMeta.page ? 'var(--primary-color, #6c5ce7)' : 'transparent',
                      color: p === logsMeta.page ? '#fff' : 'inherit', cursor: 'pointer', fontSize: '12px'
                    }}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ BRAIN FILES ═══ */}
        {activeSection === 'brain' && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>🧠 Brain Files ({brainFiles.length} files)</h2>
            <div style={{ display: 'grid', gap: '8px' }}>
              {brainFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '8px', padding: '12px 16px',
                  border: '1px solid var(--border-color,#333)', color: '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={16} style={{ color: 'var(--primary-color, #6c5ce7)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{f.filename}</div>
                      <div style={{ fontSize: '11px', opacity: 0.5 }}>{f.category} · {f.size} bytes · ~{f.tokens_est} tokens</div>
                    </div>
                  </div>
                  <button onClick={() => openFileEditor(f)}
                    style={{ padding: '6px 12px', background: 'var(--bg-tertiary,#2a2a4a)', color: 'inherit', border: '1px solid var(--border-color,#444)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} /> Xem & Sửa
                  </button>
                </div>
              ))}
            </div>

            {/* Editor Modal */}
            {editingFile && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ background: 'var(--bg-primary, #16162a)', borderRadius: '12px', width: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color,#444)', color: '#e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color,#333)' }}>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>📝 {editingFile.filename}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={saveFile} disabled={loading}
                        style={{ padding: '6px 16px', background: 'var(--success-color, #2ed573)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Save size={12} /> Lưu
                      </button>
                      <button onClick={() => setEditingFile(null)}
                        style={{ padding: '6px 16px', background: 'var(--bg-tertiary,#2a2a4a)', color: 'inherit', border: '1px solid var(--border-color,#444)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        Đóng
                      </button>
                    </div>
                  </div>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                    style={{
                      flex: 1, padding: '16px 20px', background: 'var(--bg-tertiary, #1a1a2e)', color: '#e2e8f0',
                      border: 'none', resize: 'none', fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.6,
                      minHeight: '400px', outline: 'none'
                    }}
                  />
                  <div style={{ padding: '8px 20px', fontSize: '11px', opacity: 0.5, borderTop: '1px solid var(--border-color,#333)' }}>
                    {editContent.length} chars · ~{Math.round(editContent.length / 3.5)} tokens
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SKILLS ═══ */}
        {activeSection === 'skills' && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>⚡ Skills Registry ({skills.length} skills)</h2>
            <div style={{ display: 'grid', gap: '8px' }}>
              {skills.map((s, i) => (
                <div key={i} style={{
                  background: 'var(--bg-secondary, #1e1e3f)', borderRadius: '8px', padding: '14px 16px',
                  border: '1px solid var(--border-color,#333)', color: '#e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Cpu size={14} style={{ color: 'var(--primary-color, #6c5ce7)' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '6px', lineHeight: 1.4 }}>{s.description?.substring(0, 150)}...</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {s.params.map((p, j) => (
                      <span key={j} style={{ background: 'var(--bg-tertiary,#2a2a4a)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManagerTab;
