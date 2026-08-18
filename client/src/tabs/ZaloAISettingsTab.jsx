import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Settings, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  FileText,
  Sliders,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  X,
  ShoppingCart,
  Tag,
  RotateCcw
} from 'lucide-react';
import { swalConfirm } from '../utils/swalHelpers';

const ZaloAISettingsTab = ({ currentUser, addToast }) => {
  const [activeSubTab, setActiveSubTab] = useState('basic'); // 'basic' | 'purchase' | 'instructions' | 'knowledge'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    company_name: 'FIT TOUR - Du lịch có GUU',
    description: 'FIT TOUR là thương hiệu tour thiết kế được yêu thích nhất 2024 - 2025, được vinh danh bởi Travellive Magazine & Hotlist 🏆 FIT TOUR - BEST OF BESPOKE TOUR IN VIET NAM 2024-2025 by Travellive Magazine & Hotlist.',
    website: 'https://fittour.vn/',
    phone: '0836999909',
    email: 'info@fittour.com.vn',
    address: 'TP. Hồ Chí Minh'
  });

  // 2. Purchase & Promotion Policy State
  const [purchasePolicy, setPurchasePolicy] = useState({
    purchase_info: 'Để nhận được thông tin chi tiết và lịch trình của các tour du lịch FIT TOUR, khách hàng vui lòng cung cấp số điện thoại hoặc Zalo cá nhân, nhân viên tư vấn sẽ liên hệ để gửi chương trình và lịch khởi hành chi tiết.',
    promotion_info: 'Các chương trình khuyến mãi của FIT TOUR luôn áp dụng với khách đăng ký sớm và đăng ký số lượng nhiều ạaa, để biết thêm mình xin vui lòng chờ nhân viên của FIT TOUR tư vấn cho mình nhé',
    cancellation_info: 'Chính sách hoàn hủy và dời ngày áp dụng theo từng thị trường và quy định của hãng hàng không. Vui lòng để lại số điện thoại để chuyên viên tư vấn chi tiết.'
  });

  // 3. Chat Instructions State
  const [chatInstructions, setChatInstructions] = useState({
    collect_phone: true,
    collect_email: false,
    timing: 'on_interest',
    instructions: `4. Không tự suy diễn\nKhông bao giờ tự tạo ra:\nGiá\nLịch\nChương trình\nVisa\nChính sách\nKhuyến mãi\nDịch vụ\n\nLuôn chào đón lịch sự, tinh tế, mang phong cách Du lịch có GUU. Khéo léo xin số điện thoại hoặc Zalo để chuyên viên gửi file PDF lịch trình chi tiết.`,
    greeting_message: 'Chào Anh/Chị, em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Anh/Chị! 💚\nAnh/Chị đang quan tâm tour nào hoặc cần em tư vấn gì ạ?'
  });

  const [systemConfig, setSystemConfig] = useState({
    is_sandbox_bot_enabled: true,
    mute_on_sales_assigned: true,
    gemini_api_key: '',
    gemini_model: 'gemini-3.7-flash'
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // 4. Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [searchKnowledge, setSearchKnowledge] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({ title: '', category: 'tour', content: '' });

  // Test Chat Simulator State
  const [testMessages, setTestMessages] = useState([
    {
      sender: 'bot',
      text: 'Chào Anh/Chị, em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Anh/Chị! 💚\nAnh/Chị đang quan tâm tour nào hoặc cần em tư vấn gì ạ?'
    }
  ]);
  const [inputTestMessage, setInputTestMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchKnowledge();
  }, []);

  // Tự động đồng bộ Lời chào vào khung Chat Preview nếu chưa có tin nhắn nào khác
  useEffect(() => {
    if (testMessages.length === 1 && chatInstructions.greeting_message) {
      setTestMessages([{
        sender: 'bot',
        text: chatInstructions.greeting_message
      }]);
    }
  }, [chatInstructions.greeting_message]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/zalo-ai/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        if (data.basic_info) setBasicInfo(data.basic_info);
        if (data.purchase_policy) setPurchasePolicy(data.purchase_policy);
        if (data.chat_instructions) setChatInstructions(data.chat_instructions);
        if (data.system_config) setSystemConfig(data.system_config);
      }
    } catch (err) {
      console.error('Lỗi tải cài đặt AI:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/zalo-ai/knowledge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setKnowledgeList(res.data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách kiến thức RAG:', err);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await Promise.all([
        axios.post('/api/zalo-ai/settings', { setting_key: 'basic_info', setting_value: basicInfo }, { headers }),
        axios.post('/api/zalo-ai/settings', { setting_key: 'purchase_policy', setting_value: purchasePolicy }, { headers }),
        axios.post('/api/zalo-ai/settings', { setting_key: 'chat_instructions', setting_value: chatInstructions }, { headers }),
        axios.post('/api/zalo-ai/settings', { setting_key: 'system_config', setting_value: systemConfig }, { headers })
      ]);

      if (addToast) addToast('Đã lưu cấu hình AI Agent thành công!', 'success');
      else alert('Đã lưu cấu hình AI Agent thành công!');
    } catch (err) {
      console.error('Lỗi lưu cấu hình:', err);
      alert('Lỗi khi lưu cấu hình: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKnowledge = async () => {
    if (!modalForm.title.trim() || !modalForm.content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung tài liệu');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingItem) {
        await axios.put(`/api/zalo-ai/knowledge/${editingItem.id}`, modalForm, { headers });
      } else {
        await axios.post('/api/zalo-ai/knowledge', modalForm, { headers });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setModalForm({ title: '', category: 'tour', content: '' });
      fetchKnowledge();
      if (addToast) addToast('Đã cập nhật kiến thức thành công!', 'success');
    } catch (err) {
      console.error('Lỗi lưu tài liệu:', err);
      alert('Lỗi khi lưu tài liệu: ' + err.message);
    }
  };

  const handleDeleteKnowledge = async (id, title) => {
    const isConfirm = await swalConfirm(`Bạn có chắc muốn xóa tài liệu "${title}" khỏi bộ nhớ AI?`);
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/zalo-ai/knowledge/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKnowledge();
      if (addToast) addToast('Đã xóa tài liệu', 'info');
    } catch (err) {
      console.error('Lỗi xóa tài liệu:', err);
      alert('Lỗi xóa tài liệu: ' + err.message);
    }
  };

  const handleToggleActiveKnowledge = async (item) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/zalo-ai/knowledge/${item.id}`, {
        is_active: !item.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKnowledge();
    } catch (err) {
      console.error('Lỗi bật/tắt tài liệu:', err);
    }
  };

  const handleSendTestMessage = async (msgText = null) => {
    const textToSend = msgText || inputTestMessage;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setTestMessages(prev => [...prev, userMsg]);
    if (!msgText) setInputTestMessage('');
    setIsAiThinking(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/zalo-ai/test-chat', {
        message: textToSend.trim(),
        conversationHistory: testMessages
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && res.data?.data) {
        const botReply = res.data.data.reply || 'Dạ em chào Anh/Chị, em có thể hỗ trợ gì ạ?';
        setTestMessages(prev => [...prev, {
          sender: 'bot',
          text: botReply,
          tool_used: res.data.data.tool_used
        }]);
      }
    } catch (err) {
      console.error('Lỗi test chat AI:', err);
      setTestMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Xin lỗi, không thể kết nối tới Gemini AI Agent lúc này. Vui lòng kiểm tra lại GEMINI_API_KEY.'
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const filteredKnowledge = knowledgeList.filter(k => {
    const matchCategory = selectedCategory === 'all' || k.category === selectedCategory;
    const matchSearch = !searchKnowledge || 
      k.title.toLowerCase().includes(searchKnowledge.toLowerCase()) || 
      k.content.toLowerCase().includes(searchKnowledge.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100%', padding: '20px 24px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)' }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Zalo AI Agent (Zalo Chat Copilot)
              </h1>
              <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '12px' }}>
                Meta Business Agent Style
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Tự động hóa tư vấn, trả lời câu hỏi và thu thập số điện thoại khách hàng trên Zalo Chat với Gemini 2.5 Flash
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>AI Trực Zalo:</span>
            <button
              onClick={() => setSystemConfig(prev => ({ ...prev, is_sandbox_bot_enabled: !prev.is_sandbox_bot_enabled }))}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: systemConfig.is_sandbox_bot_enabled ? '#10b981' : '#cbd5e1',
                color: '#ffffff',
                transition: 'all 0.2s'
              }}
            >
              {systemConfig.is_sandbox_bot_enabled ? 'Đang Bật 🟢' : 'Đang Tắt ⚪'}
            </button>
          </div>

          <button
            onClick={saveAllSettings}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Lưu Cấu Hình</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Settings (60%) + Right Phone Simulator (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Settings Form & RAG Knowledge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Sub Navigation Bar (4 Styled Tabs) */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '5px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveSubTab('basic')}
              style={{
                flex: 1,
                minWidth: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'basic' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'basic' ? '#0f172a' : '#64748b',
                boxShadow: activeSubTab === 'basic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Building size={15} color={activeSubTab === 'basic' ? '#0284c7' : '#64748b'} />
              <span>1. Thông tin cơ bản</span>
            </button>

            <button
              onClick={() => setActiveSubTab('purchase')}
              style={{
                flex: 1,
                minWidth: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'purchase' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'purchase' ? '#0f172a' : '#64748b',
                boxShadow: activeSubTab === 'purchase' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <ShoppingCart size={15} color={activeSubTab === 'purchase' ? '#0284c7' : '#64748b'} />
              <span>2. Mua hàng & Khuyến mãi</span>
            </button>

            <button
              onClick={() => setActiveSubTab('instructions')}
              style={{
                flex: 1,
                minWidth: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'instructions' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'instructions' ? '#0f172a' : '#64748b',
                boxShadow: activeSubTab === 'instructions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={15} color={activeSubTab === 'instructions' ? '#0284c7' : '#64748b'} />
              <span>3. Hướng dẫn Chat</span>
            </button>

            <button
              onClick={() => setActiveSubTab('knowledge')}
              style={{
                flex: 1,
                minWidth: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 10px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeSubTab === 'knowledge' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'knowledge' ? '#0f172a' : '#64748b',
                boxShadow: activeSubTab === 'knowledge' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpen size={15} color={activeSubTab === 'knowledge' ? '#0284c7' : '#64748b'} />
              <span>4. Thông tin khác (RAG)</span>
              <span style={{ backgroundColor: '#0284c7', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '3px' }}>
                {knowledgeList.length}
              </span>
            </button>
          </div>

          {/* TAB 1: THÔNG TIN CƠ BẢN */}
          {activeSubTab === 'basic' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={18} color="#0284c7" /> Giới thiệu Doanh nghiệp
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Giới thiệu với mọi người về doanh nghiệp và điểm khác biệt của bạn, đồng thời cung cấp thông tin liên hệ với bạn.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Tên doanh nghiệp</label>
                <input
                  type="text"
                  value={basicInfo.company_name}
                  onChange={e => setBasicInfo({ ...basicInfo, company_name: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none' }}
                  placeholder="FIT TOUR - Du lịch có GUU"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Mô tả doanh nghiệp</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{basicInfo.description?.length || 0}/600</span>
                </div>
                <textarea
                  rows={4}
                  value={basicInfo.description}
                  onChange={e => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  maxLength={600}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', lineHeight: '1.5' }}
                  placeholder="Nhập mô tả thương hiệu, giải thưởng, phong cách tour..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Trang web chính thức</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                  <Globe size={16} color="#94a3b8" />
                  <input
                    type="text"
                    value={basicInfo.website}
                    onChange={e => setBasicInfo({ ...basicInfo, website: e.target.value })}
                    style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                    placeholder="https://fittour.vn/"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Số điện thoại hotline</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                    <Phone size={16} color="#94a3b8" />
                    <input
                      type="text"
                      value={basicInfo.phone}
                      onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                      placeholder="0836999909"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Email liên hệ</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                    <Mail size={16} color="#94a3b8" />
                    <input
                      type="text"
                      value={basicInfo.email}
                      onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                      placeholder="info@fittour.com.vn"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Địa chỉ văn phòng</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                    <input
                      type="text"
                      value={basicInfo.address || ''}
                      onChange={e => setBasicInfo({ ...basicInfo, address: e.target.value })}
                      style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                      placeholder="19 Lương Hữu Khánh, Phường Bến Thành, TP. HCM"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Giờ làm việc</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                    <input
                      type="text"
                      value={basicInfo.working_hours || ''}
                      onChange={e => setBasicInfo({ ...basicInfo, working_hours: e.target.value })}
                      style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                      placeholder="Thứ 2 - Thứ 7: 9:00 AM - 6:30 PM | Chủ nhật: 7:00 AM - 8:00 PM"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MUA HÀNG VÀ VẬN CHUYỂN / KHUYẾN MÃI */}
          {activeSubTab === 'purchase' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={18} color="#0284c7" /> Mua hàng và Khuyến mãi (Chiến lược AI)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Thêm chi tiết về chính sách của bạn để khách hàng biết cách mua hàng và chính sách ưu đãi từ FIT TOUR.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Thông tin mua hàng (Hướng dẫn nhận lịch trình / Xin SĐT)</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{purchasePolicy.purchase_info?.length || 0}/800</span>
                </div>
                <textarea
                  rows={4}
                  value={purchasePolicy.purchase_info}
                  onChange={e => setPurchasePolicy({ ...purchasePolicy, purchase_info: e.target.value })}
                  maxLength={800}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', lineHeight: '1.5' }}
                  placeholder="Sử dụng link website (fittour.vn) để gửi lịch trình chi tiết nếu khách yêu cầu..."
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Khuyến mãi và giảm giá</label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{purchasePolicy.promotion_info?.length || 0}/1000</span>
                </div>
                <textarea
                  rows={4}
                  value={purchasePolicy.promotion_info}
                  onChange={e => setPurchasePolicy({ ...purchasePolicy, promotion_info: e.target.value })}
                  maxLength={1000}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', lineHeight: '1.5' }}
                  placeholder="Các chương trình khuyến mãi của FIT Tour luôn áp dụng với khách đăng ký sớm..."
                />
              </div>


            </div>
          )}

          {/* TAB 3: HƯỚNG DẪN CHAT & THU THẬP LEAD */}
          {activeSubTab === 'instructions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Collect Leads Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#10b981" /> Thu thập khách hàng tiềm năng (Collect Leads)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Hỏi thông tin để tìm và kết nối với khách hàng tiềm năng.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={chatInstructions.collect_phone}
                      onChange={e => setChatInstructions({ ...chatInstructions, collect_phone: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                      Số điện thoại / Zalo (Bắt buộc)
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', opacity: 0.6 }}>
                    <input
                      type="checkbox"
                      checked={chatInstructions.collect_email}
                      onChange={e => setChatInstructions({ ...chatInstructions, collect_email: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                      Email
                    </span>
                  </label>
                </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Thời điểm thu thập</label>
                    <select
                      value={chatInstructions.timing}
                      onChange={e => setChatInstructions({ ...chatInstructions, timing: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    >
                      <option value="on_interest">Khi khách hàng thể hiện sự quan tâm đến sản phẩm/dịch vụ</option>
                      <option value="immediately">Ngay trong câu chào đầu tiên</option>
                      <option value="after_price">Sau khi báo sơ bộ thông tin tour</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      Giới hạn số tin nhắn AI tự trả lời trước khi chuyển giao Sales (Mặc định: 10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={systemConfig.max_ai_turns || 10}
                      onChange={e => setSystemConfig({ ...systemConfig, max_ai_turns: parseInt(e.target.value) || 10 })}
                      style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Khi khách hàng chat đủ {systemConfig.max_ai_turns || 10} tin nhắn, AI sẽ tự động gửi lời nhắn chuyển giao cho Chuyên viên tư vấn và ngắt tự động (Auto-Mute).
                    </span>
                  </div>
                </div>

              {/* Instructions & Guardrails */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={18} color="#8b5cf6" /> Hướng dẫn & Luật cấm (Guardrails)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Cấu hình phong cách trả lời và những quy tắc AI tuyệt đối không được vi phạm.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Lời chào mở màn (Greeting Message)</label>
                  <textarea
                    rows={3}
                    value={chatInstructions.greeting_message}
                    onChange={e => setChatInstructions({ ...chatInstructions, greeting_message: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', lineHeight: '1.5' }}
                    placeholder="Nhập câu chào mở màn khi khách nhắn vào Zalo..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Hướng dẫn chi tiết (Persona & Rules)</label>
                  <textarea
                    rows={8}
                    value={chatInstructions.instructions}
                    onChange={e => setChatInstructions({ ...chatInstructions, instructions: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#047857', fontFamily: 'monospace', outline: 'none', lineHeight: '1.6' }}
                    placeholder="Nhập luật cấm, cách xưng hô, quy tắc báo giá..."
                  />
                </div>
              </div>

              {/* Gemini API Key & Model Configuration Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#0284c7" /> Cấu hình Gemini AI API Key (Tùy chọn)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Bạn có thể nhập trực tiếp Google Gemini API Key tại đây để chạy thử nghiệm hoặc đổi sang Model khác.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Google Gemini API Key</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={systemConfig.gemini_api_key || ''}
                      onChange={e => setSystemConfig({ ...systemConfig, gemini_api_key: e.target.value })}
                      style={{ flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none', fontFamily: 'monospace' }}
                      placeholder="Dán mã AIzaSy... (Nếu để trống sẽ dùng Key mặc định của server)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    Lấy API key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>Google AI Studio</a>.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Gemini Model</label>
                  <select
                    value={systemConfig.gemini_model || 'gemini-3.7-flash'}
                    onChange={e => setSystemConfig({ ...systemConfig, gemini_model: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none' }}
                  >
                    <option value="gemini-3.7-flash">gemini-3.7-flash (Khuyên dùng - Nhanh, thông minh, giá rẻ nhất hiện nay)</option>
                    <option value="gemini-3.1-pro">gemini-3.1-pro (Tư duy siêu sâu, phân tích phức tạp, đắt hơn)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Model cũ tốc độ cao)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Model cũ tư duy sâu)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: THÔNG TIN KHÁC (RAG KNOWLEDGE BASE) */}
          {activeSubTab === 'knowledge' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="#0284c7" /> Bộ Não Kiến Thức RAG (Tài Liệu & Tour Mới)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Nạp các cẩm nang, tour mới mở (chưa kịp lên lịch khởi hành), dịch vụ visa để AI học và tư vấn chuẩn xác.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setModalForm({
                        title: '[TOUR MỚI] - ',
                        category: 'new_tour',
                        content: `### THÔNG TIN TOUR MỚI & CẨM NANG TƯ VẤN SALES:\n- Tên tour: \n- Tình trạng: FIT TOUR đang mở bán / nhận đăng ký\n- Thời gian dự kiến: \n- Thời lượng: ... Ngày ... Đêm\n- Mức giá dự kiến: ... VNĐ / khách\n- Trải nghiệm độc bản & Điểm nổi bật:\n  + \n  + \n- Link website / Lịch trình tham khảo: https://fittour.vn/\n- Hướng dẫn tư vấn: Cung cấp giá dự kiến, điểm nổi bật và link website, sau đó hỏi số lượng người hoặc thời gian khách dự định đi.`
                      });
                      setIsModalOpen(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(249,115,22,0.2)' }}
                  >
                    <Sparkles size={15} /> + Nạp Tour Mới Chưa Có Lịch
                  </button>

                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setModalForm({ title: '', category: 'tour', content: '' });
                      setIsModalOpen(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <Plus size={15} /> Thêm tài liệu khác
                  </button>
                </div>
              </div>

              {/* Quick Highlight Box for New Tour Drafts */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    🔥
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>
                      Nhiều tour mới mở chưa kịp lên bảng Lịch Khởi Hành trên CRM?
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#7c2d12', marginTop: '2px' }}>
                      Chỉ cần nạp thông tin Tour & Giá dự kiến vào mục <strong>Tour Mới</strong>, AI sẽ ưu tiên tư vấn và trả lời khách ngay lập tức!
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('new_tour');
                  }}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #fdba74',
                    color: '#ea580c',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Xem Tour Mới ({knowledgeList.filter(k => k.category === 'new_tour').length})
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0 10px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    value={searchKnowledge}
                    onChange={e => setSearchKnowledge(e.target.value)}
                    style={{ flex: 1, border: 'none', padding: '8px 8px', fontSize: '12px', backgroundColor: 'transparent', color: '#0f172a', outline: 'none' }}
                    placeholder="Tìm kiếm thông tin theo tiêu đề, nội dung..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'new_tour', label: '🔥 TOUR MỚI' },
                    { key: 'tour', label: 'TOUR & LỊCH TRÌNH' },
                    { key: 'visa', label: 'VISA' },
                    { key: 'policy', label: 'CHÍNH SÁCH' },
                    { key: 'general', label: 'CẨM NANG' }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        backgroundColor: selectedCategory === cat.key ? (cat.key === 'new_tour' ? '#ea580c' : '#0284c7') : '#f8fafc',
                        color: selectedCategory === cat.key ? '#ffffff' : '#64748b'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Knowledge List Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {filteredKnowledge.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8', fontSize: '13px' }}>
                    Chưa có tài liệu nào. Bấm "Thêm thông tin" để nạp tài liệu vào bộ não AI.
                  </div>
                ) : (
                  filteredKnowledge.map(item => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: item.is_active ? '#f8fafc' : '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        opacity: item.is_active ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', marginTop: '2px' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                              {item.title}
                            </h4>
                            <span style={{ fontSize: '10px', fontWeight: '600', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {item.category}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.content}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleActiveKnowledge(item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: item.is_active ? '#10b981' : '#94a3b8' }}
                          title={item.is_active ? 'Đang bật trong RAG' : 'Đang tắt'}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setModalForm({ title: item.title, category: item.category || 'general', content: item.content });
                            setIsModalOpen(true);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#0284c7' }}
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteKnowledge(item.id, item.title)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Interactive Phone Simulator */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: '640px' }}>
            
            {/* Phone Notch Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#0284c7" /> Xem trước phản hồi của AI
                </h3>
              </div>
              <button
                onClick={() => setTestMessages([{
                  sender: 'bot',
                  text: chatInstructions.greeting_message || 'Chào Anh/Chị, em là tư vấn viên FIT TOUR.'
                }])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Làm mới cuộc trò chuyện"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>

            {/* Quick Chips Sample Inquiries */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
              {[
                'Bên em có tour Ai Cập không?',
                'Có ưu đãi hay giảm giá gì không em?',
                'Làm sao để nhận lịch trình tour?',
                '0849164037 ạ'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTestMessage(chip)}
                  style={{ whiteSpace: 'nowrap', fontSize: '11px', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  ✨ {chip}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
              {testMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      fontSize: '12.5px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word',
                      backgroundColor: msg.sender === 'user' ? '#0284c7' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                      border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px'
                    }}
                  >
                    {String(msg.text || '').split('\n').map((line, lIdx, arr) => {
                      const urlRegex = /(https?:\/\/[^\s]+)/g;
                      const parts = line.split(urlRegex);
                      return (
                        <React.Fragment key={lIdx}>
                          {parts.map((part, pIdx) => 
                            part.match(urlRegex) ? (
                              <a 
                                key={pIdx} 
                                href={part} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: msg.sender === 'user' ? '#bae6fd' : '#0284c7', textDecoration: 'underline', wordBreak: 'break-all' }}
                              >
                                {part}
                              </a>
                            ) : part
                          )}
                          {lIdx < arr.length - 1 && <br />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  {msg.tool_used && (
                    <span style={{ fontSize: '10px', color: '#0284c7', marginTop: '4px', fontWeight: '500' }}>
                      ⚙️ Tool: {msg.tool_used}
                    </span>
                  )}
                </div>
              ))}

              {isAiThinking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', fontStyle: 'italic', padding: '6px' }}>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Gemini đang suy nghĩ & tra cứu dữ liệu...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendTestMessage(); }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <input
                type="text"
                value={inputTestMessage}
                onChange={e => setInputTestMessage(e.target.value)}
                placeholder="Khách hàng của bạn sẽ hỏi gì?..."
                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', backgroundColor: '#f8fafc', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!inputTestMessage.trim() || isAiThinking}
                style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', cursor: (!inputTestMessage.trim() || isAiThinking) ? 'not-allowed' : 'pointer', opacity: (!inputTestMessage.trim() || isAiThinking) ? 0.5 : 1 }}
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Modal: Thêm / Sửa Kiến thức RAG */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#0284c7" /> {editingItem ? 'Chỉnh sửa tài liệu RAG' : 'Thêm tài liệu RAG mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Tiêu đề tài liệu</label>
                <input
                  type="text"
                  value={modalForm.title}
                  onChange={e => setModalForm({ ...modalForm, title: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', backgroundColor: '#f8fafc', outline: 'none' }}
                  placeholder="Ví dụ: [BU5] - AI CẬP - TOUR AI CẬP"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Phân loại danh mục</label>
                <select
                  value={modalForm.category}
                  onChange={e => setModalForm({ ...modalForm, category: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', backgroundColor: '#f8fafc', outline: 'none' }}
                >
                  <option value="new_tour">🔥 Tour Mới / Chưa Lên Lịch Khởi Hành</option>
                  <option value="tour">Tour & Lịch Trình Công Bố</option>
                  <option value="visa">Dịch vụ Visa & Thủ Tục</option>
                  <option value="policy">Chính sách & Khuyến Mãi</option>
                  <option value="general">Cẩm nang tư vấn chung</option>
                </select>
              </div>

              {/* Quick Template Fillers */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  ⚡ Hoặc chọn mẫu định dạng sẵn để điền nhanh:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalForm({
                        title: modalForm.title || '[TOUR MỚI] - Tên Tour Tuyến Điểm',
                        category: 'new_tour',
                        content: `### THÔNG TIN TOUR MỚI & CẨM NANG TƯ VẤN SALES:\n- Tên tour: \n- Tình trạng: FIT TOUR đang mở bán / nhận đăng ký\n- Thời gian dự kiến: \n- Thời lượng: ... Ngày ... Đêm\n- Mức giá dự kiến: ... VNĐ / khách\n- Trải nghiệm độc bản & Điểm nổi bật:\n  + \n  + \n- Link website / Lịch trình tham khảo: https://fittour.vn/\n- Hướng dẫn tư vấn: Cung cấp giá dự kiến, điểm nổi bật và link website, sau đó hỏi số lượng người hoặc thời gian khách dự định đi.`
                      });
                    }}
                    style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '600', backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#ea580c', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    🔥 Mẫu Tour Mới
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalForm({
                        title: modalForm.title || 'Cẩm Nang Tư Vấn Tuyến ...',
                        category: 'tour',
                        content: `### CẨM NANG TƯ VẤN TUYẾN ...:\n- Thời điểm đẹp nhất để đi: \n- Điều kiện thể lực & Sức khỏe: \n- Khách hàng mục tiêu: \n- Trang phục & Vật dụng cần chuẩn bị: \n- Các câu hỏi khách thường hỏi và câu trả lời:`
                      });
                    }}
                    style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '600', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    🏔️ Mẫu Cẩm Nang Tuyến
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalForm({
                        title: modalForm.title || '[VISA] - Hồ Sơ Visa ...',
                        category: 'visa',
                        content: `### HỒ SƠ & THỦ TỤC VISA ...:\n- Thời gian xét duyệt: \n- Giấy tờ nhân thân cần thiết: \n- Chứng minh công việc & tài chính: \n- Lưu ý quan trọng:`
                      });
                    }}
                    style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '600', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    🛂 Mẫu Visa
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Nội dung kiến thức (Cho AI đọc & tư vấn)</label>
                <textarea
                  rows={6}
                  value={modalForm.content}
                  onChange={e => setModalForm({ ...modalForm, content: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontSize: '13px', backgroundColor: '#f8fafc', outline: 'none', lineHeight: '1.5' }}
                  placeholder="Nhập thông tin tour, giá dự kiến, điểm nhấn, lưu ý..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveKnowledge}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {editingItem ? 'Lưu cập nhật' : 'Thêm vào bộ nhớ'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ZaloAISettingsTab;
