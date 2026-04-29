import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft, FileText, ExternalLink, Plus, Edit2, Trash2, X, Save, BookOpen, Users, Briefcase, Calculator, ClipboardList, Star, Award } from 'lucide-react';
import axios from 'axios';
import '../styles/blog.css';
import InternalDocsTab from '../tabs/InternalDocsTab';
import HDVHub from './HDVHub';
import MarketingHub from './MarketingHub';
import MarketingEditor from '../components/Marketing/MarketingEditor';

/* ═══════════════════════════════════════════════════════════════════════════
   Static Document Index — TẤT CẢ tài liệu nội bộ đã biết
   ═══════════════════════════════════════════════════════════════════════════ */
const STATIC_DOCS = [
  { title: 'HUB Hướng Dẫn Viên', description: 'Bàn làm việc của HDV — checklist, SOP, sự cố, case study', category: 'HDV', path: '/tai-lieu/hdv', icon: '👨‍✈️' },
  { title: 'HUB Marketing', description: 'Tài liệu Marketing, chuẩn mực content, format bài đăng & Báo cáo hiệu suất team', category: 'Marketing', path: '/tai-lieu/marketing', icon: '📈' },
  { title: 'HUB Kinh Doanh (Sale)', description: 'Tài liệu dành cho phòng kinh doanh, quy trình bán hàng', category: 'Sale', path: '/tai-lieu/sale', icon: '💼' },
  { title: 'HUB Điều Hành (OP)', description: 'Quy trình điều hành tour, vận hành dịch vụ', category: 'Điều hành', path: '/tai-lieu/dieu-hanh', icon: '🔧' },
  { title: 'HUB Kế Toán', description: 'Nghiệp vụ kế toán, quy trình tài chính nội bộ', category: 'Kế toán', path: '/tai-lieu/ke-toan', icon: '📊' },
  { title: 'Biểu Mẫu Hành Chính', description: 'Giấy phép, biểu mẫu, tài liệu hành chính công ty', category: 'Biểu mẫu', path: '/tai-lieu/bieu-mau', icon: '📋' },
  { title: 'Bộ Nguyên Tắc Hành Xử Nhân Viên Văn Phòng', description: 'Quy tắc ứng xử, giao tiếp, ra quyết định, xử lý sự cố', category: 'Quy tắc', path: '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien', icon: '📓' },
  { title: 'Quy Chế Lương Hướng Dẫn Viên', description: 'Chính sách lương, thưởng, phụ cấp cho HDV', category: 'HDV', path: '/tai-lieu/quy-che-luong-hdv', icon: '💰' },
  { title: 'Overview Đánh Giá FIT Tour', description: 'Tổng quan hệ thống đánh giá hiệu suất và chất lượng dịch vụ HDV', category: 'HDV', path: 'https://drive.google.com/file/d/1s_WBLcpunGLAuHC8JE5MdwPopUR-4Nqe/view', icon: '⭐', external: true },
  { title: 'SOP Hướng Dẫn Viên', description: 'Quy trình chuẩn vận hành dành cho HDV — từ chuẩn bị đến hoàn tất tour', category: 'HDV', path: 'https://drive.google.com/file/d/1ql-COwH3w78L-lHmuKr6D5BaDKz5f46o/view', icon: '📄', external: true },
  { title: 'Giấy Phép Kinh Doanh FIT Tour', description: 'GPKD công ty FIT Tour', category: 'Giấy phép', path: '#', icon: '📜' },
  { title: 'Giấy Phép Lữ Hành Quốc Tế', description: 'GPLH quốc tế FIT Tour', category: 'Giấy phép', path: '#', icon: '📜' },
  { title: 'Checklist Thiết Kế Tour', description: 'Bảng checklist thiết kế sản phẩm tour mới', category: 'Điều hành', path: 'https://docs.google.com/spreadsheets/d/1GcDo5omS19co79Gv3vQ-Naf9v2TudWf9LmMr_w8LFvQ/edit?gid=0#gid=0', icon: '✅', external: true },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Blog Layout Shell — Dùng chung cho TẤT CẢ trang tài liệu nội bộ
   CSS: blog-wrapper, blog-header, blog-main
   ═══════════════════════════════════════════════════════════════════════════ */
const BlogLayout = ({ children }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [bieuMauItems, setBieuMauItems] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch biểu mẫu items once for search
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setBieuMauItems(res.data))
        .catch(() => {});
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const allDocs = [
        ...STATIC_DOCS,
        ...bieuMauItems.map(item => ({
          title: item.name,
          description: item.description || 'Biểu mẫu văn phòng',
          category: 'Biểu mẫu',
          path: item.link || '/tai-lieu/bieu-mau',
          icon: '📋',
          external: item.link ? !item.link.startsWith('/') : false,
        }))
      ];

      const matched = allDocs.filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q)
      ).slice(0, 8); // Max 8 results

      setResults(matched);
      setShowDropdown(true);
      setActiveIndex(-1);
    }, 200); // 200ms debounce

    return () => clearTimeout(timer);
  }, [query, bieuMauItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to selected result
  const handleSelect = useCallback((doc) => {
    setShowDropdown(false);
    setQuery('');
    if (doc.external) {
      window.open(doc.path, '_blank');
    } else {
      navigate(doc.path);
    }
  }, [navigate]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="blog-wrapper">
      <header className="blog-header">
        <div className="blog-header-content">
          <div className="blog-logo">
            <img src="/logo.png" alt="FIT Tour" />
          </div>
          <div className="blog-search" ref={searchRef}>
            <div className="blog-search-input-wrapper">
              <Search size={16} className="blog-search-icon" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Tìm kiếm tài liệu, SOP, biểu mẫu..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {query && (
                <button className="blog-search-clear" onClick={() => { setQuery(''); setShowDropdown(false); inputRef.current?.focus(); }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="blog-search-dropdown">
                {results.length > 0 && (
                  <div className="blog-search-dropdown-header">
                    <span>Kết quả ({results.length})</span>
                    <span className="blog-search-hint">↑↓ di chuyển · Enter chọn · Esc đóng</span>
                  </div>
                )}
                {results.length === 0 && (
                  <div className="blog-search-no-results">
                    <Search size={20} style={{ opacity: 0.3 }} />
                    <span>Không tìm thấy kết quả cho "{query}"</span>
                  </div>
                )}
                {results.map((doc, idx) => (
                  <div 
                    key={idx} 
                    className={`blog-search-result ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => handleSelect(doc)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="blog-search-result-icon">{doc.icon}</span>
                    <div className="blog-search-result-info">
                      <div className="blog-search-result-title">
                        {doc.title}
                        {doc.external && <ExternalLink size={12} style={{ marginLeft: 4, opacity: 0.5 }} />}
                      </div>
                      <div className="blog-search-result-desc">{doc.description}</div>
                    </div>
                    <span className="blog-search-result-cat">{doc.category}</span>
                  </div>
                ))}
              </div>
            )}


          </div>
          <div>
            <Link to="/" className="blog-back-btn">
              <ArrowLeft size={16} /> Về lại CRM
            </Link>
          </div>
        </div>
      </header>
      
      <main className="blog-main">
        {children}
      </main>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   Biểu Mẫu Văn Phòng Sub-page
   ═══════════════════════════════════════════════════════════════════════════ */
const BieuMauPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', link: '', description: '' });

  // Check role from localStorage token
  const currentUser = (() => {
    try { return JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] || '{}')); } catch { return {}; }
  })();
  const canEdit = ['admin', 'manager'].includes(currentUser?.role);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data);
    } catch (err) {
      console.error('Lỗi tải biểu mẫu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) return alert('Tên là bắt buộc!');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingItem) {
        await axios.put(`/api/licenses/${editingItem.id}`, formData, config);
      } else {
        await axios.post('/api/licenses', formData, config);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', link: '', description: '' });
      fetchItems();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!await swalConfirm('Xóa biểu mẫu này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/licenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchItems();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = items.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <BlogLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Link to="/tai-lieu" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f97316', fontWeight: 700, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Quay lại trang chủ Tài Liệu
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              <FileText size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Biểu Mẫu Văn Phòng</h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Danh sách biểu mẫu, giấy phép & tài liệu nội bộ</p>
            </div>
          </div>
          {canEdit && (
            <button onClick={() => { setEditingItem(null); setFormData({ name: '', link: '', description: '' }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'transform 0.2s' }}>
              <Plus size={18} /> Thêm Biểu Mẫu
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text" placeholder="Tìm kiếm biểu mẫu, giấy phép (hỗ trợ tìm theo mô tả)..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'border 0.2s' }}
          />
        </div>

        {/* List */}
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Đang tải biểu mẫu...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy biểu mẫu nào.</div>
          ) : filtered.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 24px', borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s', cursor: 'default' }}
              onMouseOver={e => e.currentTarget.style.background = '#faf5ff'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <FileText size={18} color="#6366f1" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{item.name}</div>
                {item.description && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>{item.description}</div>
                )}
                {item.updated_at && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 6 }}>
                    Cập nhật: {formatDate(item.updated_at)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s' }}>
                    <ExternalLink size={14} /> Mở
                  </a>
                ) : (
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Chưa có link</span>
                )}
                {canEdit && (
                  <>
                    <button title="Sửa" onClick={() => { setEditingItem(item); setFormData({ name: item.name, link: item.link || '', description: item.description || '' }); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 4 }}>
                      <Edit2 size={15} />
                    </button>
                    <button title="Xóa" onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: 500, maxWidth: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{editingItem ? 'Chỉnh sửa Biểu mẫu' : 'Thêm Biểu mẫu mới'}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Tên biểu mẫu / tài liệu *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Mẫu đơn xin phép..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Mô tả ngắn <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Tối đa 150 ký tự)</span>
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Mô tả nội dung để dễ tìm kiếm sau này..." 
                    maxLength={150}
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'none' }} 
                  />
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>
                    {formData.description.length}/150
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Link tài liệu (Drive, URL...)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={16} /> Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BlogLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Documents Home Page
   CSS: blog-top-cards, blog-welcome, blog-columns
   ═══════════════════════════════════════════════════════════════════════════ */
const DocumentsHome = () => {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/licenses', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setLicenses(res.data))
        .catch(() => {});
    }
  }, []);

  // Tìm link theo tên từ danh sách biểu mẫu
  const findLink = (keyword) => {
    const item = licenses.find(l => l.name.toLowerCase().includes(keyword.toLowerCase()));
    return item?.link || '#';
  };

  return (
    <BlogLayout>
      <div className="doc-wp-home">
        {/* 5 Hubs */}
        <div className="blog-top-cards">
          <Link to="/tai-lieu/hdv" className="blog-top-card" style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="HDV" className="blog-icon-img" />
            <span style={{ fontWeight: 600, color: '#1e293b' }}>HUB Hướng Dẫn Viên</span>
          </Link>
          <Link to="/tai-lieu/marketing" className="blog-top-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1998/1998087.png" alt="Marketing" className="blog-icon-img" />
            <span>HUB Marketing</span>
          </Link>
          <Link to="/tai-lieu/sale" className="blog-top-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135673.png" alt="Sale" className="blog-icon-img" />
            <span>HUB Kinh Doanh (Sale)</span>
          </Link>
          <Link to="/tai-lieu/dieu-hanh" className="blog-top-card">
            <img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" alt="Điều hành" className="blog-icon-img" />
            <span>HUB Điều Hành (OP)</span>
          </Link>
          <Link to="/tai-lieu/bieu-mau" className="blog-top-card">
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991108.png" alt="Biểu mẫu" className="blog-icon-img" />
            <span>Biểu Mẫu Hành Chính</span>
          </Link>
          <Link to="/tai-lieu/ke-toan" className="blog-top-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135690.png" alt="Kế toán" className="blog-icon-img" />
            <span>HUB Kế Toán</span>
          </Link>
        </div>

        {/* Welcome Block */}
        <div className="blog-welcome">
          <p>👋 <span className="blog-text-orange">Chào mừng các chiến binh FIT TOUR!</span> Đây là <strong>không gian làm việc chung</strong> dành riêng cho đội ngũ Fit Tour – nơi <span className="blog-text-orange">lưu trữ thông tin, kết nối nội bộ</span> và <span className="blog-text-orange">hỗ trợ bạn chủ động trong công việc</span> mỗi ngày.</p>
          <p style={{ marginTop: '0.75rem' }}>👉 Mục tiêu của chúng ta: <span className="blog-text-orange">làm việc hiệu quả hơn – năng suất cao hơn – thu nhập tốt hơn</span>.</p>
        </div>

        {/* 3 Columns */}
        <div className="blog-columns">
          {/* Col 1 */}
          <div className="blog-column">
            <h2 className="blog-col-title">Hồ sơ công ty</h2>
            
            <h3 className="blog-section-title">Giấy phép hoạt động</h3>
            <ul className="blog-list">
              <li><a href={findLink('GPKD')} target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Giấy phép kinh doanh FIT Tour</a></li>
              <li><a href={findLink('GPLH')} target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Giấy phép lữ hành quốc tế</a></li>
            </ul>

            <h3 className="blog-section-title" style={{ marginTop: '2rem' }}>Hồ sơ doanh nghiệp</h3>
            <ul className="blog-list">
              <li><a href="https://dulichcoguu.com/portfolio/" target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Portfolio</a></li>
              <li><a href="https://dulichcoguu.com/our-team/" target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Our Team</a></li>
              <li><a href="https://dulichcoguu.com/diem-den-fit-tour/" target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Địa điểm và dự án FIT Tour</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="blog-column">
            <h2 className="blog-col-title">Checklist Điều Hành</h2>
            
            <h3 className="blog-section-title">Giấy phép hoạt động</h3>
            <ul className="blog-list">
              <li><a href="https://docs.google.com/spreadsheets/d/1GcDo5omS19co79Gv3vQ-Naf9v2TudWf9LmMr_w8LFvQ/edit?gid=0#gid=0" target="_blank" rel="noreferrer"><span className="blog-list-icon">📓</span> Checklist Thiết kế tour</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="blog-column">
            <h2 className="blog-col-title">Quy tắc hành xử</h2>
            
            <ul className="blog-list" style={{ marginTop: '1.5rem' }}>
              <li><Link to="/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien"><span className="blog-list-icon">📓</span> Bộ quy tắc hành xử Nhân viên văn phòng</Link></li>
              <li><Link to="/tai-lieu/quy-che-luong-hdv"><span className="blog-list-icon">📓</span> Quy chế lương Hướng Dẫn Viên</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </BlogLayout>
  );
};

const PlaceholderPage = () => {
  return (
    <BlogLayout>
      <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2>Nội dung đang được cập nhật</h2>
        <p style={{ marginTop: '1rem', color: '#666' }}>Tài liệu này sẽ sớm được tải lên hệ thống.</p>
        <Link to="/tai-lieu" style={{ display: 'inline-block', marginTop: '2rem', color: '#f97316', fontWeight: 'bold', textDecoration: 'none' }}>&larr; Quay lại trang chủ Tài Liệu</Link>
      </div>
    </BlogLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MarkdownViewer — Article Reader with TOC + Scrollspy + Breadcrumb + Meta
   CSS: blog-reader-wrapper, blog-toc, blog-body, blog-prose, blog-meta,
        blog-breadcrumb, blog-back-to-top
   ═══════════════════════════════════════════════════════════════════════════ */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ChevronUp, User, Calendar, Clock, ChevronRight } from 'lucide-react';

const MarkdownViewer = ({ fileUrl, title, author, updatedDate, breadcrumbs }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const headingIdsRef = useRef([]);

  useEffect(() => {
    setLoading(true);
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('# Lỗi\nKhông thể tải tài liệu này.');
        setLoading(false);
      });
  }, [fileUrl]);

  // Lấy danh sách các Chương (Heading 1) để làm Mục lục
  const headings = content.split('\n').filter(line => line.startsWith('# ')).map(line => line.replace('# ', '').trim());

  // Hàm tạo ID từ text để scroll tới
  const generateId = useCallback((text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/đ/g, 'd')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }, []);

  // Tính thời gian đọc ước tính (200 từ/phút cho tiếng Việt)
  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  // ── Scrollspy: theo dõi heading nào đang hiển thị trên viewport ──
  useEffect(() => {
    if (loading || headings.length === 0) return;

    // Cần delay nhỏ để DOM render xong các heading
    const timer = setTimeout(() => {
      headingIdsRef.current = headings.map(h => generateId(h));
    }, 300);

    const handleScroll = () => {
      // Back to Top visibility
      setShowBackToTop(window.scrollY > 400);

      // Scrollspy
      const ids = headingIdsRef.current;
      if (ids.length === 0) return;

      let currentId = '';
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            currentId = ids[i];
            break;
          }
        }
      }
      setActiveHeadingId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, headings, generateId]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BlogLayout>
      <div className="blog-reader-wrapper">
        
        {/* Sidebar: Mục Lục với Scrollspy */}
        <div className="blog-toc">
          <h3 className="blog-toc-title">Mục Lục</h3>
          <ul className="blog-toc-list">
            <li className={`blog-toc-item ${!activeHeadingId ? 'active' : ''}`}>
              <button className={`blog-toc-btn ${!activeHeadingId ? 'active' : ''}`} onClick={scrollToTop}>
                <span className="blog-toc-arrow">&rsaquo;</span> <strong>{title}</strong>
              </button>
            </li>
            {headings.map((heading, index) => {
              const hId = generateId(heading);
              const isActive = activeHeadingId === hId;
              return (
                <li key={index} className={`blog-toc-item ${isActive ? 'active' : ''}`}>
                  <button className={`blog-toc-btn ${isActive ? 'active' : ''}`} onClick={() => scrollToHeading(hId)}>
                    <span className="blog-toc-arrow">&rsaquo;</span> {heading}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Main Content */}
        <div className="blog-body">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb">
            <Link to="/tai-lieu">Trang chủ Tài Liệu</Link>
            {breadcrumbs && breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} className="blog-breadcrumb-separator" />
                {bc.to ? <Link to={bc.to}>{bc.label}</Link> : <span>{bc.label}</span>}
              </React.Fragment>
            ))}
            <ChevronRight size={14} className="blog-breadcrumb-separator" />
            <span className="blog-breadcrumb-current">{title}</span>
          </nav>

          {/* Title */}
          <h1 className="blog-body-title">{title}</h1>

          {/* Header Metadata */}
          <div className="blog-meta">
            {author && (
              <div className="blog-meta-item">
                <User size={14} className="blog-meta-icon" />
                <span className="blog-meta-label">{author}</span>
              </div>
            )}
            {updatedDate && (
              <div className="blog-meta-item">
                <Calendar size={14} className="blog-meta-icon" />
                <span>Cập nhật: <span className="blog-meta-label">{updatedDate}</span></span>
              </div>
            )}
            <div className="blog-meta-item">
              <Clock size={14} className="blog-meta-icon" />
              <span>⏳ Đọc khoảng <span className="blog-meta-label">{readingTime} phút</span></span>
            </div>
          </div>

          {loading ? (
            <p>Đang tải tài liệu...</p>
          ) : (
            <div className="blog-prose">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, children, ...props}) => {
                     const text = Array.isArray(children) ? children[0] : children;
                     const id = typeof text === 'string' ? generateId(text) : '';
                     return <h1 id={id} {...props}>{children}</h1>;
                  },
                  a: ({node, href, children, ...props}) => {
                    if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
                      // Extract video ID safely
                      let videoId = '';
                      if (href.includes('youtu.be/')) videoId = href.split('youtu.be/')[1].split('?')[0];
                      else if (href.includes('youtube.com/embed/')) videoId = href.split('youtube.com/embed/')[1].split('?')[0];
                      else if (href.includes('youtube.com/watch')) videoId = new URLSearchParams(href.split('?')[1]).get('v');

                      if (videoId) {
                        return (
                          <div className="blog-video-wrapper">
                            <iframe 
                              src={`https://www.youtube.com/embed/${videoId}`} 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                              title="YouTube Video"
                            />
                          </div>
                        );
                      }
                    }
                    return <a href={href} {...props}>{children}</a>;
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

      </div>

      {/* Back to Top Button */}
      <button 
        className={`blog-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Về đầu trang"
      >
        <ChevronUp size={24} />
      </button>
    </BlogLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Router
   ═══════════════════════════════════════════════════════════════════════════ */
const DocumentsPage = () => {
  const location = useLocation();
  const path = location.pathname;

  if (path === '/tai-lieu/bieu-mau') return <BieuMauPage />;
  if (path === '/tai-lieu/hdv') return <HDVHub />;
  if (path === '/tai-lieu/marketing') return <MarketingHub />;
  if (path === '/tai-lieu/marketing/create') return <MarketingEditor />;
  if (path === '/tai-lieu/quy-che-luong-hdv') return <BlogLayout><InternalDocsTab /></BlogLayout>;
  if (path === '/tai-lieu/bo-nguyen-tac-hanh-xu-nhan-vien') return (
    <MarkdownViewer 
      fileUrl="/docs/bo-nguyen-tac.md" 
      title="Bộ Nguyên Tắc Hành Xử"
      author="Ban Giám Đốc FIT Tour"
      updatedDate="23/04/2026"
      breadcrumbs={[{ label: 'Quy tắc hành xử' }]}
    />
  );
  if (path === '/tai-lieu' || path === '/tai-lieu/') return <DocumentsHome />;

  return <PlaceholderPage />;
};

export default DocumentsPage;
