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
  Send,
  Clock,
} from "lucide-react";

const InboxTab = ({ leads, setEditingLead }) => {
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

  // Send Message State
  const [newMessage, setNewMessage] = useState("");
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
    } catch (err) {
      console.error("Fetch Conversations Error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchKey]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const token = localStorage.getItem("token");
      const tempMsg = {
        id: Date.now(),
        sender_type: "user",
        content: newMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);
      setNewMessage("");

      await axios.post(
        "/api/messages/send",
        {
          conversationId: selectedConv.id,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchConversations(); // refresh last message
    } catch (err) {
      console.error("Send Message Error:", err);
      alert("Lỗi gửi tin nhắn: " + err.message);
    }
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
    <div className="animate-fade-in" style={{ height: "calc(100vh - 180px)" }}>
      {/* Container */}
      <div className="bg-white rounded-3xl h-full shadow-sm border border-slate-100 flex overflow-hidden">
        {/* LEFT COLUMN: LIST */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50 relative">
          {/* List Header */}
          <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-10">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-between">
              Hộp thư đến
              <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs">
                {totalRows}
              </span>
            </h2>
            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                placeholder="Tìm tin nhắn, tên khách..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                size={15}
                className="absolute left-3 top-2.5 text-slate-400"
              />
            </form>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 relative">
            {loading && conversations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                Đang tải...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-medium">
                Không tìm thấy hội thoại.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {conversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const isChecked = selectedIds.includes(conv.id);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`
                        p-3 rounded-2xl cursor-pointer transition-all border group
                        ${isSelected ? "bg-indigo-50/50 border-indigo-200 shadow-sm" : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox wrapper */}
                        <div
                          className="pt-1 select-none"
                          onClick={(e) => toggleSelect(e, conv.id)}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${isChecked ? "bg-indigo-500 border-indigo-500" : "border-slate-300 group-hover:border-slate-400"}`}
                          >
                            {isChecked && (
                              <CheckSquare size={12} color="white" />
                            )}
                          </div>
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
                        >
                          {(conv.lead_name || "K").charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4
                              className={`text-sm truncate pr-2 ${isSelected ? "font-bold text-indigo-900" : "font-semibold text-slate-700"}`}
                            >
                              {conv.lead_name || "Khách vãng lai"}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                              {new Date(conv.updated_at).toLocaleDateString(
                                "vi-VN",
                                { day: "2-digit", month: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${isSelected ? "text-indigo-600 font-medium" : "text-slate-500"}`}
                          >
                            {conv.last_message || "..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Action Bar (Floating) */}
          {selectedIds.length > 0 && (
            <div className="absolute bottom-16 left-3 right-3 bg-slate-800 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between z-20 animate-fade-in">
              <span className="text-xs font-bold pl-2">
                Đã chọn {selectedIds.length}
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-rose-400 bg-slate-700 hover:bg-rose-500 hover:text-white p-1.5 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between text-sm font-medium">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-slate-500 text-xs font-bold">
              Trang {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT PANEL */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="h-[76px] px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                    {(selectedConv.lead_name || "K").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                      {selectedConv.lead_name || "Khách vãng lai"}
                    </h2>
                    <div className="text-xs text-indigo-500 font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                      Meta Messenger
                    </div>
                  </div>
                </div>

                {/* Lead Connect Button */}
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
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <User size={15} /> XEM HỒ SƠ LEAD
                </button>
              </div>

              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto px-6 py-6"
                style={{
                  backgroundImage:
                    "radial-gradient(#e2e8f0 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="flex flex-col gap-6">
                  {messages.map((msg, idx) => {
                    const isStaff = msg.sender_type !== "customer";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`
                            relative max-w-[75%] px-5 py-3.5 rounded-3xl shadow-sm text-[14px] leading-relaxed
                            ${isStaff ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white text-slate-800 rounded-tl-sm border border-slate-100"}
                          `}
                        >
                          {msg.content}
                        </div>
                        <div
                          className={`text-[10px] font-bold text-slate-400 mt-1.5 px-2 flex items-center gap-1 ${isStaff ? "flex-row-reverse" : ""}`}
                        >
                          <Clock size={10} /> {formatTime(msg.created_at)}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-5 bg-white border-t border-slate-100">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 relative">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder-slate-400 shadow-inner"
                      placeholder="Viết tin nhắn phản hồi..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-14 h-14 shrink-0 bg-indigo-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    <Send size={20} className="ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Send size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-400">
                Chưa chọn hội thoại
              </h3>
              <p className="text-sm font-medium mt-2">
                Nhấp vào một khách hàng bên trái để bắt đầu chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxTab;
