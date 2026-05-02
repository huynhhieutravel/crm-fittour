import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Mail, Send, FileText, Archive, Trash2, Star, Search, Plus,
  ChevronLeft, Paperclip, Reply, Forward, MoreVertical, User,
  Clock, AlertCircle, CheckCircle, Circle, RefreshCw, X, Inbox,
  Bold, Italic, Underline, List, ListOrdered, Link2, Image, Smile, Type
} from 'lucide-react';
import '../styles/email.css';

const FOLDERS = [
  { id: 'inbox', label: 'Hộp thư đến', icon: Inbox },
  { id: 'sent', label: 'Đã gửi', icon: Send },
  { id: 'draft', label: 'Bản nháp', icon: FileText },
  { id: 'archive', label: 'Lưu trữ', icon: Archive },
  { id: 'trash', label: 'Thùng rác', icon: Trash2 },
];

const STATUS_BADGES = {
  open: { label: 'Mở', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  pending: { label: 'Chờ', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  closed: { label: 'Xong', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 7) return d.toLocaleDateString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function extractName(email) {
  if (!email) return '?';
  const match = email.match(/^(.+?)\s*</);
  if (match) return match[1].trim();
  return email.split('@')[0];
}

function EmailTab({ currentUser, addToast }) {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [threadEmails, setThreadEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showCompose, setShowCompose] = useState(false);
  const [composeMode, setComposeMode] = useState('new'); // new, reply, forward
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '', cc: '', bcc: '' });
  const [mobileView, setMobileView] = useState('list'); // list, detail
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const composeBodyRef = useRef('');

  // Callback ref: sets content when editor mounts
  const setEditorRef = useCallback((node) => {
    editorRef.current = node;
    if (node && composeBodyRef.current) {
      node.innerHTML = composeBodyRef.current;
    }
  }, []);

  // Fetch emails
  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/emails', {
        params: { folder: activeFolder, page, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(res.data.emails || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Fetch emails error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFolder, page]);

  const serverOnlineRef = useRef(true);
  const retryCountRef = useRef(0);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/emails/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCounts(res.data || {});
      // Server is back online — reset retry counter
      if (!serverOnlineRef.current) {
        console.log('[Email] Server is back online, resuming normal polling.');
      }
      serverOnlineRef.current = true;
      retryCountRef.current = 0;
    } catch (err) {
      // Only log once when server goes offline
      if (serverOnlineRef.current) {
        console.warn('[Email] Server offline — pausing unread polling.');
      }
      serverOnlineRef.current = false;
      retryCountRef.current = Math.min(retryCountRef.current + 1, 6);
    }
  }, []);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);
  useEffect(() => { fetchUnreadCounts(); }, [fetchUnreadCounts]);

  // Smart polling: 30s when online, exponential backoff up to ~32min when offline
  useEffect(() => {
    let timeoutId;
    const poll = () => {
      const delay = serverOnlineRef.current
        ? 30000
        : Math.min(30000 * Math.pow(2, retryCountRef.current), 30 * 60 * 1000);
      timeoutId = setTimeout(async () => {
        await fetchUnreadCounts();
        poll();
      }, delay);
    };
    poll();
    return () => clearTimeout(timeoutId);
  }, [fetchUnreadCounts]);

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setMobileView('detail');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/emails/${email.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEmail(res.data);
      // Load thread
      if (email.thread_id) {
        const threadRes = await axios.get(`/api/emails/threads/${email.thread_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setThreadEmails(threadRes.data.emails || []);
      } else {
        setThreadEmails([res.data]);
      }
      // Update unread in list
      if (!email.is_read) {
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, is_read: true } : e));
        fetchUnreadCounts();
      }
    } catch (err) {
      console.error('Get email error:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchEmails(); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/emails/search', { 
        params: { q: searchQuery, folder: activeFolder },
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmails(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeMode('reply');
    const body = `<br/><br/><div style="border-left:2px solid #6366f1;padding-left:12px;color:#64748b">--- Trả lời ---<br/>Từ: ${selectedEmail.sender}<br/>Ngày: ${formatDate(selectedEmail.date)}<br/><br/>${selectedEmail.body_text || ''}</div>`;
    composeBodyRef.current = body;
    setComposeData({
      to: selectedEmail.sender || '',
      subject: selectedEmail.subject?.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body,
      cc: '', bcc: ''
    });
    setShowCompose(true);
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setComposeMode('forward');
    const body = `<br/><br/><div style="border-left:2px solid #94a3b8;padding-left:12px;color:#64748b">---------- Forwarded message ----------<br/>From: ${selectedEmail.sender}<br/>Date: ${formatDate(selectedEmail.date)}<br/>Subject: ${selectedEmail.subject}<br/><br/>${selectedEmail.body_text || ''}</div>`;
    composeBodyRef.current = body;
    setComposeData({
      to: '',
      subject: `Fwd: ${selectedEmail.subject}`,
      body,
      cc: '', bcc: ''
    });
    setShowCompose(true);
  };

  const handleSend = async () => {
    if (!composeData.to || !composeData.subject) {
      addToast?.('Vui lòng điền người nhận và tiêu đề', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const mailbox = currentUser?.email || 'info@fittour.vn';
      if (composeMode === 'reply' && selectedEmail) {
        await axios.post(`/api/emails/reply/${selectedEmail.id}`, {
          body: composeData.body, body_text: composeData.body,
          cc: composeData.cc, bcc: composeData.bcc, mailbox_address: mailbox
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (composeMode === 'forward' && selectedEmail) {
        await axios.post(`/api/emails/forward/${selectedEmail.id}`, {
          to: composeData.to, body_prefix: composeData.body, mailbox_address: mailbox
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/emails/send', {
          to: composeData.to, subject: composeData.subject,
          body: composeData.body, body_text: composeData.body,
          cc: composeData.cc, bcc: composeData.bcc, mailbox_address: mailbox
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      addToast?.('Email đã được gửi!');
      setShowCompose(false);
      setComposeData({ to: '', subject: '', body: '', cc: '', bcc: '' });
      fetchEmails();
    } catch (err) {
      addToast?.('Lỗi gửi email: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleUpdateStatus = async (emailId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/emails/${emailId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedEmail(prev => prev ? { ...prev, status } : prev);
      fetchEmails();
      addToast?.(`Đã cập nhật trạng thái: ${STATUS_BADGES[status]?.label}`);
    } catch (err) {
      addToast?.('Lỗi cập nhật: ' + err.message, 'error');
    }
  };

  const handleToggleStar = async (emailId, current) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/emails/${emailId}`, { is_starred: !current }, { headers: { Authorization: `Bearer ${token}` } });
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_starred: !current } : e));
    } catch (err) { console.error(err); }
  };

  const handleMoveToTrash = async (emailId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/emails/${emailId}/move`, { folder: 'trash' }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedEmail(null);
      setMobileView('list');
      fetchEmails();
      addToast?.('Đã chuyển vào thùng rác');
    } catch (err) { addToast?.('Lỗi xóa: ' + err.message, 'error'); }
  };

  // Rich text toolbar
  const execCmd = (e, cmd, val = null) => {
    e.preventDefault();
    document.execCommand(cmd, false, val);
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    const url = prompt('Nhập URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════
  return (
    <div className="email-container">
      {/* ═══ SIDEBAR ═══ */}
      <div className={`email-sidebar ${mobileView !== 'list' ? 'hide-mobile' : ''}`}>
        <button className="email-compose-btn" onClick={() => {
          setComposeMode('new');
          composeBodyRef.current = '';
          setComposeData({ to: '', subject: '', body: '', cc: '', bcc: '' });
          setShowCompose(true);
        }}>
          <Plus size={18} /> Soạn thư
        </button>

        <div className="email-folders">
          {FOLDERS.map(f => (
            <div
              key={f.id}
              className={`email-folder-item ${activeFolder === f.id ? 'active' : ''}`}
              onClick={() => { setActiveFolder(f.id); setPage(1); setSelectedEmail(null); setMobileView('list'); }}
            >
              <f.icon size={18} />
              <span>{f.label}</span>
              {unreadCounts[f.id] > 0 && (
                <span className="email-badge">{unreadCounts[f.id]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ EMAIL LIST ═══ */}
      <div className={`email-list ${mobileView === 'detail' ? 'hide-mobile' : ''}`}>
        <div className="email-list-header">
          <div className="email-search-bar">
            <Search size={16} />
            <input
              placeholder="Tìm kiếm email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && <X size={14} className="email-search-clear" onClick={() => { setSearchQuery(''); fetchEmails(); }} />}
          </div>
          <button className="email-refresh-btn" onClick={fetchEmails} title="Làm mới">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="email-list-items">
          {loading && emails.length === 0 ? (
            <div className="email-empty">Đang tải...</div>
          ) : emails.length === 0 ? (
            <div className="email-empty">
              <Mail size={40} strokeWidth={1} />
              <p>Không có email nào</p>
            </div>
          ) : (
            emails.map(email => (
              <div
                key={email.id}
                className={`email-list-item ${!email.is_read ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                onClick={() => handleSelectEmail(email)}
              >
                <div className="email-item-star" onClick={e => { e.stopPropagation(); handleToggleStar(email.id, email.is_starred); }}>
                  <Star size={16} className={email.is_starred ? 'starred' : ''} />
                </div>
                <div className="email-item-content">
                  <div className="email-item-top">
                    <span className="email-item-sender">{extractName(email.sender)}</span>
                    <span className="email-item-date">{formatDate(email.date)}</span>
                  </div>
                  <div className="email-item-subject">{email.subject || '(Không có tiêu đề)'}</div>
                  <div className="email-item-preview">{(email.body_text || '').substring(0, 80)}</div>
                  <div className="email-item-meta">
                    {email.status && email.status !== 'closed' && (
                      <span className="email-status-dot" style={{ background: STATUS_BADGES[email.status]?.color }}>
                        {STATUS_BADGES[email.status]?.label}
                      </span>
                    )}
                    {email.attachment_count > 0 && <Paperclip size={12} />}
                    {email.thread_count > 1 && <span className="email-thread-count">{email.thread_count}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {total > 20 && (
          <div className="email-pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
            <span>Trang {page}</span>
            <button disabled={emails.length < 20} onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>

      {/* ═══ EMAIL DETAIL ═══ */}
      <div className={`email-detail ${mobileView === 'list' ? 'hide-mobile' : ''}`}>
        {!selectedEmail ? (
          <div className="email-empty">
            <Mail size={48} strokeWidth={1} />
            <p>Chọn email để xem</p>
          </div>
        ) : (
          <>
            <div className="email-detail-header">
              <button className="email-back-btn show-mobile" onClick={() => { setMobileView('list'); setSelectedEmail(null); }}>
                <ChevronLeft size={20} /> Quay lại
              </button>
              <div className="email-detail-actions">
                <button onClick={handleReply} title="Trả lời"><Reply size={18} /></button>
                <button onClick={handleForward} title="Chuyển tiếp"><Forward size={18} /></button>
                <button onClick={() => handleMoveToTrash(selectedEmail.id)} title="Xóa"><Trash2 size={18} /></button>
                <div className="email-status-actions">
                  {Object.entries(STATUS_BADGES).map(([key, val]) => (
                    <button
                      key={key}
                      className={`email-status-btn ${selectedEmail.status === key ? 'active' : ''}`}
                      style={{ color: val.color, background: selectedEmail.status === key ? val.bg : 'transparent' }}
                      onClick={() => handleUpdateStatus(selectedEmail.id, key)}
                      title={val.label}
                    >
                      {key === 'open' && <Circle size={14} />}
                      {key === 'pending' && <Clock size={14} />}
                      {key === 'closed' && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="email-detail-body">
              <h2 className="email-detail-subject">{selectedEmail.subject}</h2>
              
              {/* Thread view */}
              {threadEmails.map((email, idx) => (
                <div key={email.id} className={`email-thread-item ${idx === threadEmails.length - 1 ? 'latest' : 'collapsed'}`}>
                  <div className="email-thread-header">
                    <div className="email-avatar">{(email.sender || '?')[0].toUpperCase()}</div>
                    <div className="email-thread-meta">
                      <strong>{extractName(email.sender)}</strong>
                      <span className="email-thread-to">→ {extractName(email.recipient)}</span>
                      <span className="email-thread-date">{formatDate(email.date)}</span>
                    </div>
                  </div>
                  <div className="email-thread-body">
                    {email.body ? (
                      <div dangerouslySetInnerHTML={{ __html: email.body || '' }} />
                    ) : (
                      <pre className="email-plain-text">{email.body_text || ''}</pre>
                    )}
                  </div>
                  {email.attachments && email.attachments.length > 0 && (
                    <div className="email-attachments">
                      <Paperclip size={14} /> {email.attachments.length} file đính kèm
                      {email.attachments.map(att => (
                        <span key={att.id} className="email-att-name">{att.filename} ({Math.round(att.size / 1024)}KB)</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══ COMPOSE MODAL — Full Width + Rich Text ═══ */}
      {showCompose && (
        <div className="email-compose-overlay" onClick={(e) => e.target === e.currentTarget && setShowCompose(false)}>
          <div className="email-compose-modal">
            <div className="email-compose-header">
              <h3>{composeMode === 'reply' ? '✉️ Trả lời' : composeMode === 'forward' ? '➡️ Chuyển tiếp' : '✉️ Soạn thư mới'}</h3>
              <button onClick={() => setShowCompose(false)}><X size={20} /></button>
            </div>
            <div className="email-compose-fields">
              <div className="email-field">
                <label>Đến:</label>
                <input value={composeData.to} onChange={e => setComposeData(d => ({ ...d, to: e.target.value }))} placeholder="email@example.com" autoFocus />
                <button className="email-ccbcc-toggle" onClick={() => setShowCcBcc(!showCcBcc)}>{showCcBcc ? 'Ẩn' : 'CC/BCC'}</button>
              </div>
              {showCcBcc && (
                <>
                  <div className="email-field">
                    <label>CC:</label>
                    <input value={composeData.cc} onChange={e => setComposeData(d => ({ ...d, cc: e.target.value }))} placeholder="Nhiều địa chỉ cách nhau bằng dấu phẩy" />
                  </div>
                  <div className="email-field">
                    <label>BCC:</label>
                    <input value={composeData.bcc} onChange={e => setComposeData(d => ({ ...d, bcc: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="email-field">
                <label>Tiêu đề:</label>
                <input value={composeData.subject} onChange={e => setComposeData(d => ({ ...d, subject: e.target.value }))} placeholder="Tiêu đề email" />
              </div>

              {/* Rich Text Toolbar */}
              <div className="email-toolbar">
                <button onMouseDown={(e) => execCmd(e, 'bold')} title="In đậm (Ctrl+B)"><Bold size={15} /></button>
                <button onMouseDown={(e) => execCmd(e, 'italic')} title="In nghiêng (Ctrl+I)"><Italic size={15} /></button>
                <button onMouseDown={(e) => execCmd(e, 'underline')} title="Gạch chân (Ctrl+U)"><Underline size={15} /></button>
                <span className="email-toolbar-sep" />
                <button onMouseDown={(e) => execCmd(e, 'insertUnorderedList')} title="Danh sách"><List size={15} /></button>
                <button onMouseDown={(e) => execCmd(e, 'insertOrderedList')} title="Danh sách số"><ListOrdered size={15} /></button>
                <span className="email-toolbar-sep" />
                <button onMouseDown={handleInsertLink} title="Chèn link"><Link2 size={15} /></button>
                <button onMouseDown={(e) => execCmd(e, 'formatBlock', 'h3')} title="Tiêu đề"><Type size={15} /></button>
                <span className="email-toolbar-sep" />
                <button onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} title="Đính kèm file">
                  <Paperclip size={15} />
                </button>
                <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />
              </div>

              {/* Rich Text Editor */}
              <div
                ref={setEditorRef}
                className="email-compose-editor"
                contentEditable
                suppressContentEditableWarning
                onBlur={() => {
                  if (editorRef.current) {
                    const html = editorRef.current.innerHTML;
                    setComposeData(d => ({ ...d, body: html }));
                  }
                }}
                data-placeholder="Nội dung email..."
              />

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="email-compose-attachments">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="email-compose-att-item">
                      <Paperclip size={13} />
                      <span className="email-att-file-name">{file.name}</span>
                      <span className="email-att-file-size">{formatFileSize(file.size)}</span>
                      <button onClick={() => removeAttachment(idx)}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="email-compose-footer">
              <button className="email-send-btn" onClick={handleSend}>
                <Send size={16} /> Gửi
              </button>
              <button className="email-attach-btn" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={16} /> Đính kèm
              </button>
              <div style={{ flex: 1 }} />
              <button className="email-discard-btn" onClick={() => { setShowCompose(false); setAttachments([]); }}>
                <Trash2 size={14} /> Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailTab;
