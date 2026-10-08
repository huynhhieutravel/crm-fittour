import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Sparkles, AlertCircle, CheckCircle2, X, MessageSquare, Info } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const CreateLeadFromInboxModal = ({
  isOpen,
  onClose,
  conversation,
  recentMessages = [],
  tours = [],
  bus = [],
  users = [],
  currentUser,
  onSuccess
}) => {
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [consultationNote, setConsultationNote] = useState('');
  const [detectedSuggestion, setDetectedSuggestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phím tắt ESC để đóng modal
  useEscapeKey(onClose, isOpen && !isSubmitting);

  // Ref theo dõi việc khởi tạo để không bị reset khi background polling fetch tin nhắn mỗi 5s
  const hasInitializedRef = useRef(false);
  const userManuallyChangedRef = useRef(false);

  // Gợi ý tour & BU tự động từ tin nhắn gần nhất — CHỈ CHẠY 1 LẦN khi mở modal
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      userManuallyChangedRef.current = false;
      return;
    }

    if (!conversation || hasInitializedRef.current || userManuallyChangedRef.current) return;
    hasInitializedRef.current = true;

    // Reset form
    setSelectedTourId('');
    setSelectedBU('');
    setSelectedSaleId(conversation.assigned_to_id || '');
    setConsultationNote('');
    setDetectedSuggestion(null);

    // Quét tin nhắn của khách hàng gần nhất
    const customerMessages = (recentMessages || [])
      .filter(m => m.sender_type === 'customer' || !m.sender_type)
      .slice(-6);
    
    const textCorpus = customerMessages.map(m => m.content || '').join(' ').toLowerCase();

    if (textCorpus.trim()) {
      let matchedTour = null;
      let matchedKeyword = '';

      // 1. Quét tên tour hoặc điểm đến chính xác trong DB
      for (const tour of tours) {
        const tName = (tour.name || '').toLowerCase();
        const tDest = (tour.destination || '').toLowerCase();

        // Bỏ qua các từ quá ngắn như 'đi', 'tour'
        if (tDest && tDest.length >= 3 && textCorpus.includes(tDest)) {
          matchedTour = tour;
          matchedKeyword = tour.destination;
          break;
        }
        if (tName && tName.length >= 4 && textCorpus.includes(tName)) {
          matchedTour = tour;
          matchedKeyword = tour.name;
          break;
        }
      }

      // 2. Quét từ khoá địa danh / tour phổ biến nếu chưa khớp trực tiếp
      if (!matchedTour) {
        const commonKeywords = [
          { kw: 'nhật bản', bu: 'BU2' },
          { kw: 'nhật', bu: 'BU2' },
          { kw: 'lệ giang', bu: 'BU1' },
          { kw: 'trung quốc', bu: 'BU1' },
          { kw: 'mông cổ', bu: 'BU5' },
          { kw: 'pakistan', bu: 'BU5' },
          { kw: 'hàn quốc', bu: 'BU2' },
          { kw: 'châu âu', bu: 'BU2' },
          { kw: 'úc', bu: 'BU2' },
          { kw: 'mỹ', bu: 'BU2' },
          { kw: 'mice', bu: 'BU3' },
          { kw: 'công ty', bu: 'BU3' },
          { kw: 'đoàn', bu: 'BU3' },
          { kw: 'thái lan', bu: 'BU4' },
          { kw: 'singapore', bu: 'BU4' },
          { kw: 'bali', bu: 'BU4' }
        ];

        for (const item of commonKeywords) {
          if (textCorpus.includes(item.kw)) {
            matchedKeyword = item.kw;
            // Tìm tour đại diện thuộc BU hoặc có tên khớp
            matchedTour = tours.find(t => 
              (t.name || '').toLowerCase().includes(item.kw) || 
              (t.destination || '').toLowerCase().includes(item.kw) ||
              t.bu_group === item.bu
            );
            if (!matchedTour && item.bu) {
              setSelectedBU(item.bu);
            }
            break;
          }
        }
      }

      if (matchedTour) {
        setSelectedTourId(matchedTour.id);
        if (matchedTour.bu_group) {
          setSelectedBU(matchedTour.bu_group);
        }
        setDetectedSuggestion({
          keyword: matchedKeyword || matchedTour.name,
          tourName: matchedTour.name,
          bu: matchedTour.bu_group
        });
      }
    }
  }, [isOpen, conversation, recentMessages, tours]);

  // Khi chọn tour, tự động điền BU của tour nếu có
  const handleTourChange = (tourId) => {
    userManuallyChangedRef.current = true;
    setSelectedTourId(tourId);
    if (tourId) {
      const found = tours.find(t => t.id === tourId || t.id === parseInt(tourId));
      if (found && found.bu_group) {
        setSelectedBU(found.bu_group);
      }
    }
  };

  const getSaleOptions = (targetBU) => {
    return (users || []).filter(u => 
      u.is_active !== false && 
      (['admin', 'manager', 'sales', 'marketing'].includes(u.role_name) || u.permissions?.leads?.can_view || u.permissions?.leads?.can_edit)
    ).sort((a, b) => {
      if (currentUser) {
         if (a.id === currentUser.id) return -1;
         if (b.id === currentUser.id) return 1;
      }
      if (targetBU) {
        const aHasBU = a.bus && (Array.isArray(a.bus) ? a.bus.includes(targetBU) : String(a.bus).includes(targetBU));
        const bHasBU = b.bus && (Array.isArray(b.bus) ? b.bus.includes(targetBU) : String(b.bus).includes(targetBU));
        if (aHasBU && !bHasBU) return -1;
        if (bHasBU && !aHasBU) return 1;
      }
      return (a.username || '').localeCompare(b.username || '');
    }).map(u => ({
      id: u.id,
      name: u.full_name || u.username,
      code: u.username
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!conversation || !conversation.id) return;
    if (!conversation.lead_id) {
      toast.error('Hội thoại này chưa liên kết với Lead ID nào.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        conversationId: conversation.id,
        oldLeadId: conversation.lead_id,
        tour_id: selectedTourId || null,
        bu_group: selectedBU || null,
        assigned_to: selectedSaleId || null,
        note: consultationNote
      };

      const res = await axios.post('/api/leads/recreate-from-conversation', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('🎉 Đã tạo Lead Marketing mới thành công!');
      if (onSuccess) {
        onSuccess(res.data.lead);
      }
      onClose();
    } catch (err) {
      console.error('Error recreating lead:', err);
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra khi tạo Lead mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeInScale 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#ede9fe',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Tạo Lead Mới Từ Khách Cũ
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Khách hàng: <strong style={{ color: '#0f172a' }}>{conversation?.lead_name || 'Khách Facebook'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            title="Đóng (ESC)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* AI / Keyword Suggestion Alert */}
          {detectedSuggestion && (
            <div style={{
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#5b21b6', lineHeight: 1.4 }}>
                <strong>Gợi ý thông minh từ tin nhắn khách:</strong> Phát hiện từ khoá <em>"{detectedSuggestion.keyword}"</em>. Hệ thống đã tự động chọn Tour & BU tương ứng.
              </div>
            </div>
          )}

          {/* Policy Information Alert */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Info size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.4 }}>
              Lead cũ (Lead #{conversation?.lead_id}) sẽ được <strong>bảo lưu nguyên vẹn trạng thái</strong> trong danh sách của Sale cũ. Hội thoại Messenger này sẽ chuyển sang Lead mới và xuất hiện trên <strong>Khung Điều phối</strong>.
            </div>
          </div>

          {/* Tour Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Tour mới khách quan tâm:
            </label>
            <SearchableSelect
              options={tours}
              value={selectedTourId}
              onChange={handleTourChange}
              placeholder="Chọn hoặc tìm kiếm Tour..."
              emptyText="Không tìm thấy tour phù hợp"
              excludePrivate={true}
              style={{ width: '100%' }}
            />
          </div>

          {/* BU & Sale Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Đơn vị phụ trách (BU):
              </label>
              <select
                value={selectedBU}
                onChange={(e) => {
                  userManuallyChangedRef.current = true;
                  setSelectedBU(e.target.value);
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  padding: '0 10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  background: '#fff'
                }}
              >
                <option value="">Chưa phân BU</option>
                {bus.map(b => (
                  <option key={b.id} value={b.id}>{b.label || b.id}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Sale chăm sóc:
              </label>
              <SearchableSelect
                options={getSaleOptions(selectedBU)}
                value={selectedSaleId}
                onChange={(val) => {
                  userManuallyChangedRef.current = true;
                  setSelectedSaleId(val);
                }}
                placeholder="Chưa phân (Điều phối sau)"
                emptyText="Không tìm thấy sale"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Initial Note */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Ghi chú tư vấn ban đầu (tuỳ chọn):
            </label>
            <textarea
              rows={3}
              value={consultationNote}
              onChange={(e) => {
                userManuallyChangedRef.current = true;
                setConsultationNote(e.target.value);
              }}
              placeholder="Ví dụ: Khách hỏi lịch khởi hành mùng 2 Tết, đi 4 người lớn..."
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                padding: '8px 10px',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={16} />
              {isSubmitting ? 'ĐANG TẠO LEAD...' : 'XÁC NHẬN TẠO LEAD MỚI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadFromInboxModal;
