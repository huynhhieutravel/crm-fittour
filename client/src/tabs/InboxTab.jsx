import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Trash2,
  User,
  Clock,
  MessageCircle,
} from "lucide-react";

const InboxTab = ({ leads, setEditingLead, initialPsid, clearInitialPsid, onGoBack }) => {
  // API Data States
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Bulk Delete States
  const [selectedIds, setSelectedIds] = useState([]);

  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 15, search: searchKey },
      });
      setConversations(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalRows(res.data.pagination.total);
      return res.data.data;
    } catch (err) {
      console.error("Fetch Conversations Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchKey]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-select conversation khi nhận initialPsid từ Lead Chat button
  const psidHandledRef = useRef(false);
  useEffect(() => {
    if (!initialPsid || psidHandledRef.current) return;
    
    if (conversations.length > 0) {
      const matchConv = conversations.find(c => c.external_id === initialPsid);
      if (matchConv) {
        psidHandledRef.current = true;
        handleSelectConv(matchConv);
        if (clearInitialPsid) clearInitialPsid();
      } else if (!searchKey) {
        // Conversation không nằm trong trang hiện tại, search bằng PSID
        setSearchInput(initialPsid);
        setSearchKey(initialPsid);
      } else if (searchKey === initialPsid && conversations.length > 0) {
        // Đã search xong, auto chọn kết quả đầu tiên
        psidHandledRef.current = true;
        handleSelectConv(conversations[0]);
        if (clearInitialPsid) clearInitialPsid();
      }
    }
  }, [conversations, searchKey, initialPsid]);

  // Reset ref khi initialPsid thay đổi (mới click Chat)
  useEffect(() => {
    if (initialPsid) {
      psidHandledRef.current = false;
    }
  }, [initialPsid]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (convId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setSearchKey(searchInput);
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteSingle = async () => {
    if (!selectedConv) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa hội thoại của khách hàng này? Mọi tin nhắn sẽ bị xóa vĩnh viễn.`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/messages/conversations/delete",
        { ids: [selectedConv.id] },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Remove from selected list if there
      if(selectedIds.includes(selectedConv.id)) {
        setSelectedIds(prev => prev.filter(x => x !== selectedConv.id));
      }
      setSelectedConv(null);
      setMessages([]);
      fetchConversations();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa VĨNH VIỄN ${selectedIds.length} hội thoại cùng tất cả tin nhắn bên trong?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/messages/conversations/delete",
        { ids: selectedIds },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSelectedIds([]);
      if (selectedConv && selectedIds.includes(selectedConv.id)) {
        setSelectedConv(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa: " + err.message);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return (
      date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    );
  };

  return (
    <div className="inbox-wrapper">
      <div className="inbox-container">
        {/* LEFT COLUMN: LIST */}
        <div className={`inbox-sidebar ${selectedConv ? 'mobile-hidden' : ''}`}>
          {/* List Header */}
          <div className="inbox-header">
            {onGoBack && (
              <button 
                onClick={onGoBack} 
                style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px', background: '#ffe4e6', color: '#e11d48', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                <ChevronLeft size={16} /> Quay lại Lead Marketing
              </button>
            )}
            <h2 className="title">
              Hộp thư đến
              <span className="badge">{totalRows}</span>
            </h2>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Tìm tin nhắn, tên khách..."
                className="search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search size={15} className="search-icon" />
            </form>
          </div>

          {/* Conversations List */}
          <div className="conv-list">
            {loading && conversations.length === 0 ? (
              <div className="empty-state">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="empty-state">Không tìm thấy hội thoại.</div>
            ) : (
              <div className="conv-items">
                {conversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const isChecked = selectedIds.includes(conv.id);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`conv-item ${isSelected ? "active" : ""}`}
                    >
                      {/* Checkbox wrapper */}
                      <div
                        className="checkbox-wrapper"
                        onClick={(e) => toggleSelect(e, conv.id)}
                      >
                        <div
                          className={`checkbox ${isChecked ? "checked" : ""}`}
                        >
                          {isChecked && <CheckSquare size={12} color="white" />}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className={`avatar ${isSelected ? "active" : ""}`}>
                        {(conv.lead_name || "K").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="conv-info">
                        <div className="info-row">
                          <h4 className={`name ${isSelected ? "active" : ""}`}>
                            {conv.lead_name || "Khách vãng lai"}
                          </h4>
                          <span className="time">
                            {new Date(conv.updated_at).toLocaleDateString(
                              "vi-VN",
                              { day: "2-digit", month: "2-digit" },
                            )}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', padding: '1px 4px', borderRadius: '4px', background: conv.assigned_bu ? '#e0e7ff' : '#fee2e2', color: conv.assigned_bu ? '#4338ca' : '#b91c1c', fontWeight: 'bold' }}>BU: {conv.assigned_bu || 'Chưa phân'}</span>
                                <span style={{ fontSize: '10px', padding: '1px 4px', borderRadius: '4px', background: conv.assigned_to_name ? '#dcfce7' : '#fee2e2', color: conv.assigned_to_name ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>Sale: {conv.assigned_to_name || 'Chưa phân'}</span>
                        </div>
                        <p className={`msg ${isSelected ? "active" : ""}`}>
                          {conv.last_message || "..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Action Bar (Floating) */}
          {selectedIds.length > 0 && (
            <div className="bulk-action-bar">
              <span className="count">Đã chọn {selectedIds.length}</span>
              <button onClick={handleBulkDelete} className="delete-btn">
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="page-btn"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="page-text">
              Trang {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="page-btn"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PANEL */}
        <div className={`inbox-chat ${!selectedConv ? 'mobile-hidden' : ''}`}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-title-group">
                  <button 
                    className="mobile-back-to-list" 
                    onClick={() => setSelectedConv(null)}
                    style={{ background: 'none', border: 'none', padding: '0 8px 0 0', cursor: 'pointer', display: 'none', color: '#4f46e5', fontWeight: 'bold' }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="chat-avatar">
                    {(selectedConv.lead_name || "K").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="chat-name">
                      {selectedConv.lead_name || "Khách vãng lai"}
                    </h2>
                    <div className="chat-source">
                      <span className="dot"></span> Meta Messenger
                            <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span>
                            BU: <span style={{ color: selectedConv?.assigned_bu ? '#334155' : '#ef4444', fontWeight: '800' }}>{selectedConv?.assigned_bu || 'Chưa phân'}</span>
                            <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span>
                            Sale: <span style={{ color: selectedConv?.assigned_to_name ? '#334155' : '#ef4444', fontWeight: '800' }}>{selectedConv?.assigned_to_name || 'Chưa phân'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleDeleteSingle} className="inbox-danger-btn">
                    <Trash2 size={15} /> XÓA
                  </button>
                  <button
                    onClick={() => {
                      const leadLink = leads.find(
                        (l) => l.id === selectedConv.lead_id,
                      );
                      if (leadLink) setEditingLead(leadLink);
                      else
                        alert(
                          "Khách hàng này chưa được gán Lead ID nào. Vui lòng tạo lead mới.",
                        );
                    }}
                    className="inbox-action-btn"
                  >
                    <User size={15} /> XEM HỒ SƠ LEAD
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="chat-messages">
                <div className="messages-list">
                  {messages.map((msg, idx) => {
                    const isStaff = msg.sender_type !== "customer";
                    return (
                      <div
                        key={idx}
                        className={`msg-wrapper ${isStaff ? "staff" : "customer"}`}
                      >
                        <div className="msg-bubble">{msg.content}</div>
                        <div className="msg-time">
                          <Clock size={10} /> {formatTime(msg.created_at)}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              <div className="icon-wrapper">
                <MessageCircle size={40} className="icon" />
              </div>
              <h3 className="title">Chưa chọn hội thoại</h3>
              <p className="subtitle">
                Nhấp vào một khách hàng bên trái để xem lịch sử gửi nhận.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .inbox-wrapper {
          height: calc(100vh - 180px);
          animation: fadeIn 0.3s ease-in-out;
        }

        .inbox-container {
          background-color: white;
          border-radius: 20px;
          height: 100%;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          overflow: hidden;
        }

        /* LEFT SIDEBAR */
        .inbox-sidebar {
          width: 340px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
          position: relative;
        }

        .inbox-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          background-color: white;
          z-index: 10;
        }

        .inbox-header .title {
          font-size: 1.125rem;
          font-weight: 900;
          color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .inbox-header .badge {
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .search-form {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          background-color: white;
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .conv-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          position: relative;
        }

        .empty-state {
          text-align: center;
          padding: 40px 0;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .conv-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .conv-item {
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          background-color: white;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .conv-item:hover {
          border-color: #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .conv-item.active {
          background-color: #eef2ff;
          border-color: #c7d2fe;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .checkbox-wrapper {
          padding-top: 4px;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd5e1;
          transition: all 0.2s;
        }

        .conv-item:hover .checkbox {
          border-color: #94a3b8;
        }

        .checkbox.checked {
          background-color: #6366f1;
          border-color: #6366f1;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: bold;
          flex-shrink: 0;
          background-color: #e2e8f0;
          color: #475569;
        }

        .avatar.active {
          background-color: #4f46e5;
          color: white;
        }

        .conv-info {
          flex: 1;
          min-width: 0;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .info-row .name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 8px;
        }

        .info-row .name.active {
          font-weight: 700;
          color: #312e81;
        }

        .info-row .time {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .conv-info .msg {
          font-size: 0.75rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-info .msg.active {
          color: #4f46e5;
          font-weight: 500;
        }

        .bulk-action-bar {
          position: absolute;
          bottom: 60px;
          left: 12px;
          right: 12px;
          background-color: #1e293b;
          color: white;
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
          animation: fadeIn 0.2s ease-out;
        }

        .bulk-action-bar .count {
          font-size: 0.75rem;
          font-weight: bold;
          padding-left: 8px;
        }

        .bulk-action-bar .delete-btn {
          color: #fb7185;
          background-color: #334155;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bulk-action-bar .delete-btn:hover {
          background-color: #e11d48;
          color: white;
        }

        .pagination {
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .page-btn {
          padding: 6px;
          border-radius: 6px;
          color: #64748b;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-text {
          font-size: 0.75rem;
          font-weight: bold;
          color: #64748b;
        }

        /* RIGHT CHAT PANEL */
        .inbox-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
          position: relative;
        }

        .chat-header {
          height: 76px;
          padding: 0 24px;
          border-bottom: 1px solid #e2e8f0;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
          box-shadow: 0 4px 20px -10px rgba(0, 0, 0, 0.05);
        }

        .chat-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 24px;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.125rem;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .chat-name {
          font-size: 1.125rem;
          font-weight: 900;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .chat-source {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chat-source .dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }

        .inbox-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: bold;
          transition: all 0.2s;
          cursor: pointer;
        }

        .inbox-action-btn:hover {
          background-color: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        .inbox-danger-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background-color: transparent;
          color: #ef4444;
          border: 1px dashed #fca5a5;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: bold;
          transition: all 0.2s;
          cursor: pointer;
        }

        .inbox-danger-btn:hover {
          background-color: #ef4444;
          color: white;
          border-style: solid;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .msg-wrapper {
          display: flex;
          flex-direction: column;
        }

        .msg-wrapper.staff {
          align-items: flex-end;
        }

        .msg-wrapper.customer {
          align-items: flex-start;
        }

        .msg-bubble {
          max-width: 75%;
          padding: 14px 20px;
          border-radius: 24px;
          font-size: 0.875rem;
          line-height: 1.5;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .msg-wrapper.staff .msg-bubble {
          background-color: #4f46e5;
          color: white;
          border-top-right-radius: 4px;
        }

        .msg-wrapper.customer .msg-bubble {
          background-color: white;
          color: #1e293b;
          border-top-left-radius: 4px;
          border: 1px solid #f1f5f9;
        }

        .msg-time {
          font-size: 0.65rem;
          font-weight: bold;
          color: #94a3b8;
          margin-top: 6px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .msg-wrapper.staff .msg-time {
          flex-direction: row-reverse;
        }

        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
        }

        .empty-chat .icon-wrapper {
          width: 96px;
          height: 96px;
          background-color: #f1f5f9;
          border-radius: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .empty-chat .title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #94a3b8;
        }

        .empty-chat .subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          margin-top: 8px;
          color: #94a3b8;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* MOBILE RESPONSIVE OVERRIDES */
        @media screen and (max-width: 768px) {
          .inbox-wrapper {
             height: calc(100vh - 100px);
          }
          .inbox-sidebar.mobile-hidden, .inbox-chat.mobile-hidden {
            display: none !important;
          }
          .inbox-sidebar {
            width: 100% !important;
            border-right: none !important;
          }
          .inbox-chat {
            width: 100% !important;
          }
          .mobile-back-to-list {
            display: flex !important;
            align-items: center;
          }
          .chat-header {
            padding: 10px 15px;
            height: auto;
            min-height: 70px;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 12px;
          }
          .chat-title-group {
            width: 100%;
          }
          .inbox-danger-btn, .inbox-action-btn {
            flex: 1;
            justify-content: center;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default InboxTab;
