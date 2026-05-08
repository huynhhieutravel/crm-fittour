import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ManualReviewModal({ isOpen, onClose, onSuccess, initialData }) {
  const [loading, setLoading] = useState(false);
  const [buList, setBuList] = useState([]);
  const [formData, setFormData] = useState({
    reviewer_name: '',
    rating: 5,
    comment: '',
    review_date: new Date().toISOString().split('T')[0],
    source: 'other',
    guide_name: '',
    bu_id: ''
  });
  const [file, setFile] = useState(null);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchBUs();
      fetchGuides();
      if (initialData) {
        setFormData({
          reviewer_name: initialData.reviewer_name || '',
          rating: initialData.rating || 5,
          comment: initialData.comment || '',
          review_date: initialData.review_date_str || (initialData.review_date ? initialData.review_date.split('T')[0] : ''),
          source: initialData.source || 'other',
          guide_name: initialData.guide_name || '',
          bu_id: initialData.bu_id || ''
        });
      } else {
        setFormData({
          reviewer_name: '',
          rating: 5,
          comment: '',
          review_date: new Date().toISOString().split('T')[0],
          source: 'google',
          guide_name: '',
          bu_id: ''
        });
      }
      setFile(null);
    }
  }, [isOpen]);

  const fetchBUs = async () => {
    try {
      const res = await axios.get('/api/business-units', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBuList(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách BU:', err);
    }
  };

  const fetchGuides = async () => {
    try {
      const res = await axios.get('/api/guides', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGuides(res.data);
    } catch (err) {
      console.error('Lỗi lấy danh sách HDV:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reviewer_name) return toast.error('Vui lòng nhập tên người đánh giá!');
    if (!formData.comment) return toast.error('Vui lòng nhập nội dung đánh giá!');
    
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
    <div className="cr-modal-overlay" onClick={onClose}>
      <div className="cr-modal-content" onClick={e => e.stopPropagation()}>
        <div className="cr-modal-header">
          <h2 className="cr-title" style={{ fontSize: 18 }}>{initialData ? 'Cập Nhật Đánh Giá' : 'Tạo Đánh Giá Khách Hàng (Thủ Công)'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cr-modal-body">
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
              <label className="cr-filter-label">Nội dung đánh giá *</label>
              <textarea name="comment" value={formData.comment} onChange={handleChange} required rows="3" className="cr-input" placeholder="Khách nói gì về tour..." />
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

            <div className="cr-filter-item">
              <label className="cr-filter-label">Tên HDV</label>
              <input type="text" name="guide_name" list="guide-list" value={formData.guide_name} onChange={handleChange} className="cr-input" placeholder="Chọn HDV hoặc nhập tay..." />
              <datalist id="guide-list">
                {guides.map(g => (
                  <option key={g.id} value={g.name} />
                ))}
              </datalist>
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
            <button type="button" onClick={onClose} className="cr-btn-outline">
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
