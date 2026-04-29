import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Save, LayoutTemplate, Star, Eye } from 'lucide-react';

const MarketingEditor = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Guideline');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Quill Modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const handleSave = () => {
    // Tạm thời chỉ alert
    alert('Đã lưu bài viết (Mockup)!');
    navigate('/tai-lieu/marketing');
  };

  const insertTemplateBlock = () => {
    const templateHtml = `
      <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0;">
        <strong>📌 TÊN MẪU (TEMPLATE)</strong><br/><br/>
        [Nhập nội dung mẫu vào đây. Team có thể copy đoạn này dễ dàng]<br/>
      </div><p><br/></p>
    `;
    setContent(prev => prev + templateHtml);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Header */}
      <header style={{ height: 64, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/tai-lieu/marketing')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
            Soạn thảo nội dung
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Eye size={16} /> Xem trước
          </button>
          <button onClick={handleSave} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
            <Save size={16} /> Lưu bài viết
          </button>
        </div>
      </header>

      {/* Editor Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Main Editor Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 800 }}>
            <input 
              type="text" 
              placeholder="Nhập tiêu đề bài viết..." 
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', fontSize: '36px', fontWeight: 800, color: '#0f172a', border: 'none', outline: 'none', backgroundColor: 'transparent', marginBottom: '24px' }}
            />
            
            {/* Custom Tools for Marketing Block */}
            <div style={{ display: 'flex', gap: 12, marginBottom: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: 8, border: '1px dashed #bfdbfe' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', marginRight: 16 }}>Công cụ Block:</div>
              <button onClick={insertTemplateBlock} style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <LayoutTemplate size={14} /> Chèn box Template
              </button>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, minHeight: '500px' }}>
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                style={{ height: '500px', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
              />
            </div>
            
            {/* Inline CSS to fix Quill borders */}
            <style>{`
              .ql-toolbar.ql-snow { border-top: none; border-left: none; border-right: none; border-top-left-radius: 8px; border-top-right-radius: 8px; background: #f8fafc; }
              .ql-container.ql-snow { border: none; font-size: 15px; font-family: "Inter", sans-serif; }
            `}</style>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div style={{ width: 320, backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0', padding: '24px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cài đặt bài viết</h3>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Chuyên mục</label>
            <select 
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#1e293b' }}
            >
              <option value="Guideline">Guideline (Quy chuẩn)</option>
              <option value="Template">Template (Mẫu copy)</option>
              <option value="Best Content">Best Content (Thực chiến)</option>
              <option value="Asset">Asset (Tài nguyên)</option>
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} color="#f59e0b" /> Nổi bật (Ghim lên đầu)</span>
            </label>
          </div>

          <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Mô tả ngắn (Hiển thị ở trang chủ)</label>
            <textarea 
              rows={4}
              placeholder="VD: Cách viết caption Facebook chuẩn 3 phần..."
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', color: '#1e293b', resize: 'vertical' }}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default MarketingEditor;
