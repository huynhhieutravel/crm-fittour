import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Star, Upload, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';
import { matchesVietnamese } from '../../utils/textUtils';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DRAFT_STORAGE_KEY = 'crm_manual_review_draft';

const defaultFormState = {
  reviewer_name: '',
  rating: 5,
  comment: '',
  photo_count: '',
  review_date: getLocalDateString(),
  source: 'google',
  guide_name: '',
  bu_id: ''
};

export default function ManualReviewModal({ isOpen, onClose, onSuccess, initialData }) {
  const [loading, setLoading] = useState(false);
  const [buList, setBuList] = useState([]);
  const [formData, setFormData] = useState(defaultFormState);
  const [file, setFile] = useState(null);
  const [guides, setGuides] = useState([]);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  
  // Custom Autocomplete Combobox state for Tên HDV
  const [isGuideDropdownOpen, setIsGuideDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const guideDropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchBUs();
      fetchGuides();
      if (initialData) {
        setFormData({
          reviewer_name: initialData.reviewer_name || '',
          rating: initialData.rating || 5,
          comment: initialData.comment || '',
          photo_count: initialData.photo_count != null ? String(initialData.photo_count) : '',
          review_date: initialData.review_date_str || (initialData.review_date ? initialData.review_date.split('T')[0] : getLocalDateString()),
          source: initialData.source || 'other',
          guide_name: initialData.guide_name || '',
          bu_id: initialData.bu_id || ''
        });
        setHasRestoredDraft(false);
      } else {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setFormData({
              reviewer_name: parsed.reviewer_name || '',
              rating: parsed.rating || 5,
              comment: parsed.comment || '',
              photo_count: parsed.photo_count || '',
              review_date: parsed.review_date || getLocalDateString(),
              source: parsed.source || 'google',
              guide_name: parsed.guide_name || '',
              bu_id: parsed.bu_id || ''
            });
            const hasContent = Boolean(
              parsed.reviewer_name?.trim() ||
              parsed.comment?.trim() ||
              parsed.guide_name?.trim() ||
              parsed.photo_count !== '' ||
              parsed.bu_id !== ''
            );
            setHasRestoredDraft(hasContent);
          } catch (e) {
            console.error('Lỗi đọc bản nháp review:', e);
            setFormData({ ...defaultFormState, review_date: getLocalDateString() });
            setHasRestoredDraft(false);
          }
        } else {
          setFormData({ ...defaultFormState, review_date: getLocalDateString() });
          setHasRestoredDraft(false);
        }
      }
      setFile(null);
      setIsGuideDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen, initialData]);

  const fetchBUs = async () => {
    try {
      const res = await axios.get('/api/business-units', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const allowedBUs = ['BU1', 'BU2', 'BU3', 'BU4', 'BU5'];
      const filtered = (res.data || []).filter(b => allowedBUs.includes(b.id?.toUpperCase()));
      setBuList(filtered);
    } catch (err) {
      console.error('Lỗi lấy danh sách BU:', err);
    }
  };

  const fetchGuides = async () => {
    try {
      const res = await axios.get('/api/guides', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGuides(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách HDV:', err);
    }
  };

  // Close guide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guideDropdownRef.current && !guideDropdownRef.current.contains(e.target)) {
        setIsGuideDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter guides with Vietnamese accent-insensitive matching
  const filteredGuides = useMemo(() => {
    const query = formData.guide_name?.trim() || '';
    if (!query) {
      return guides.slice(0, 40);
    }
    return guides.filter(g => matchesVietnamese(g.name, query));
  }, [guides, formData.guide_name]);

  const selectGuide = (guideName) => {
    setFormData(prev => {
      const next = { ...prev, guide_name: guideName };
      try {
        if (!initialData) {
          const hasContent = Boolean(
            next.reviewer_name?.trim() ||
            next.comment?.trim() ||
            next.guide_name?.trim() ||
            next.photo_count !== '' ||
            next.bu_id !== ''
          );
          if (hasContent) {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
          }
        }
      } catch (err) {}
      return next;
    });
    setIsGuideDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleGuideKeyDown = (e) => {
    if (!isGuideDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsGuideDropdownOpen(true);
      return;
    }
    if (!isGuideDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredGuides.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredGuides.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredGuides.length) {
        e.preventDefault();
        selectGuide(filteredGuides[highlightedIndex].name);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsGuideDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const hasUnsavedChanges = useCallback(() => {
    if (file) return true;
    if (initialData) {
      return (
        (formData.reviewer_name || '') !== (initialData.reviewer_name || '') ||
        String(formData.rating || 5) !== String(initialData.rating || 5) ||
        (formData.comment || '') !== (initialData.comment || '') ||
        String(formData.photo_count || '') !== String(initialData.photo_count ?? '') ||
        (formData.source || 'other') !== (initialData.source || 'other') ||
        (formData.guide_name || '') !== (initialData.guide_name || '') ||
        (formData.bu_id || '') !== (initialData.bu_id || '')
      );
    }
    return Boolean(
      formData.reviewer_name?.trim() ||
      formData.comment?.trim() ||
      formData.guide_name?.trim() ||
      formData.photo_count !== '' ||
      formData.bu_id !== '' ||
      Number(formData.rating) !== 5 ||
      formData.source !== 'google'
    );
  }, [formData, file, initialData]);

  const handleRequestClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'Bạn đang nhập dở đánh giá. Bạn có chắc chắn muốn thoát không? Dữ liệu chưa lưu sẽ bị xóa.'
      );
      if (!confirmed) return;

      if (!initialData) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasRestoredDraft(false);
      }
    }
    onClose();
  }, [hasUnsavedChanges, initialData, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        // If guide dropdown is open, Escape should close the dropdown first, not the modal
        if (isGuideDropdownOpen) {
          setIsGuideDropdownOpen(false);
          setHighlightedIndex(-1);
          return;
        }
        handleRequestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGuideDropdownOpen, handleRequestClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (!initialData) {
        try {
          const hasContent = Boolean(
            next.reviewer_name?.trim() ||
            next.comment?.trim() ||
            next.guide_name?.trim() ||
            next.photo_count !== '' ||
            next.bu_id !== ''
          );
          if (hasContent) {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
          } else {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        } catch (err) {
          console.error('Lỗi lưu nháp review:', err);
        }
      }
      return next;
    });
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData({ ...defaultFormState, review_date: getLocalDateString() });
    setFile(null);
    setHasRestoredDraft(false);
    toast.success('Đã xóa bản nháp');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reviewer_name) return toast.error('Vui lòng nhập tên người đánh giá!');
    
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });
      if (file) {
        payload.append('proof_image', file);
      }

      const url = initialData ? `/api/customer-reviews/${initialData.id}` : '/api/customer-reviews';
      const method = initialData ? 'put' : 'post';

      const res = await axios[method](url, payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.data.success) {
        if (!initialData) {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          setHasRestoredDraft(false);
        }
        toast.success(initialData ? 'Cập nhật đánh giá thành công!' : 'Tạo đánh giá thành công! Đang chờ duyệt.');
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || 'Lỗi khi lưu đánh giá');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi hệ thống');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cr-modal-overlay">
      <div className="cr-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cr-modal-header">
          <h2 className="cr-title" style={{ fontSize: 18 }}>{initialData ? 'Cập Nhật Đánh Giá' : 'Tạo Đánh Giá Khách Hàng (Thủ Công)'}</h2>
          <button 
            type="button" 
            onClick={handleRequestClose} 
            title="Đóng"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cr-modal-body">
          {hasRestoredDraft && !initialData && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#16a34a" />
                <span>Đã tự động khôi phục nội dung bạn đang nhập dở từ trước đó.</span>
              </div>
              <button
                type="button"
                onClick={handleClearDraft}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Xóa nháp
              </button>
            </div>
          )}

          <div className="cr-form-grid">
            
            <div className="cr-filter-item cr-col-span-2">
              <label className="cr-filter-label">Tên khách hàng *</label>
              <input type="text" name="reviewer_name" value={formData.reviewer_name} onChange={handleChange} required className="cr-input" placeholder="Ví dụ: Anh Tuấn" />
            </div>

            <div className="cr-filter-item cr-col-span-2">
              <label className="cr-filter-label">Số sao *</label>
              <select name="rating" value={formData.rating} onChange={handleChange} className="cr-select" style={{ background: '#fef9c3' }}>
                <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                <option value="3">⭐⭐⭐ (3 sao)</option>
                <option value="2">⭐⭐ (2 sao)</option>
                <option value="1">⭐ (1 sao)</option>
              </select>
            </div>

            <div className="cr-filter-item cr-col-span-2">
              <label className="cr-filter-label">Nội dung đánh giá</label>
              <textarea name="comment" value={formData.comment} onChange={handleChange} rows="3" className="cr-input" placeholder="Khách nói gì về tour... (Không bắt buộc)" />
            </div>

            <div className="cr-filter-item cr-col-span-2">
              <label className="cr-filter-label">Số lượng ảnh</label>
              <input type="number" name="photo_count" value={formData.photo_count} onChange={handleChange} min="0" className="cr-input" placeholder="Ví dụ: 5" />
            </div>

            <div className="cr-filter-item">
              <label className="cr-filter-label">Ngày đánh giá</label>
              <input type="date" name="review_date" value={formData.review_date} onChange={handleChange} className="cr-input" />
            </div>

            <div className="cr-filter-item">
              <label className="cr-filter-label">Nguồn</label>
              <select name="source" value={formData.source} onChange={handleChange} className="cr-select">
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="thread">Threads</option>
                <option value="khác">Khác</option>
              </select>
            </div>

            <div className="cr-filter-item">
              <label className="cr-filter-label">Thuộc Business Unit</label>
              <select name="bu_id" value={formData.bu_id} onChange={handleChange} className="cr-select">
                <option value="">-- Chọn BU (Không bắt buộc) --</option>
                {buList.map(bu => (
                  <option key={bu.id} value={bu.id}>{bu.label}</option>
                ))}
              </select>
            </div>

            <div className="cr-filter-item" ref={guideDropdownRef} style={{ position: 'relative' }}>
              <label className="cr-filter-label">Tên HDV</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  name="guide_name" 
                  value={formData.guide_name} 
                  onChange={(e) => {
                    handleChange(e);
                    setIsGuideDropdownOpen(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setIsGuideDropdownOpen(true)}
                  onKeyDown={handleGuideKeyDown}
                  className="cr-input" 
                  placeholder="Chọn HDV hoặc nhập tay..." 
                  autoComplete="off"
                  style={{ paddingRight: formData.guide_name ? '54px' : '32px' }}
                />
                <div style={{ position: 'absolute', right: '6px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {formData.guide_name && (
                    <button
                      type="button"
                      onClick={() => selectGuide('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '4px'
                      }}
                      title="Xóa tên HDV"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsGuideDropdownOpen(prev => !prev)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px'
                    }}
                    title="Mở danh sách HDV"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* Custom Autocomplete Dropdown supporting Accent-insensitive search */}
              {isGuideDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1050,
                  marginTop: '4px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                  padding: '4px 0'
                }}>
                  {filteredGuides.length > 0 ? (
                    filteredGuides.map((g, idx) => {
                      const isHighlighted = idx === highlightedIndex;
                      const isSelected = formData.guide_name === g.name;
                      return (
                        <div
                          key={g.id || idx}
                          onClick={() => selectGuide(g.name)}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            color: isSelected ? '#4f46e5' : '#1e293b',
                            fontWeight: isSelected ? 600 : 400,
                            backgroundColor: isHighlighted ? '#f1f5f9' : (isSelected ? '#eef2ff' : 'transparent'),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <span>{g.name}</span>
                          {isSelected && <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>Đã chọn</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '10px 12px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      Không có HDV khớp với "{formData.guide_name}". Bạn vẫn có thể giữ tên nhập tay này.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="cr-filter-item cr-col-span-2">
              <label className="cr-filter-label">Ảnh bằng chứng (Screenshot)</label>
              <div className="cr-file-drop">
                <div style={{ textAlign: 'center' }}>
                  <svg style={{ margin: '0 auto', height: 48, width: 48, color: '#94a3b8' }} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <label htmlFor="file-upload" className="cr-file-label">
                      <span>Tải ảnh lên (Optional)</span>
                      <input id="file-upload" name="file-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {file && <p style={{ marginTop: 8, fontSize: 13, color: '#16a34a', fontWeight: 500 }}>Đã chọn: {file.name}</p>}
            </div>

          </div>
          
          <div className="cr-modal-footer">
            <button type="button" onClick={handleRequestClose} className="cr-btn-outline">
              Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="cr-btn-primary">
              {loading && <svg style={{ animation: 'spin 1s linear infinite', marginLeft: -4, marginRight: 8, height: 16, width: 16, color: 'white' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo đánh giá')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
