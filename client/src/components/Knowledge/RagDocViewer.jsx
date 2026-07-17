import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, Image as ImageIcon, Globe, File } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RagDocViewer = ({ idProp }) => {
    const { id: paramId } = useParams();
    const id = idProp || paramId || window.location.pathname.split('/').pop();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        const fetchDoc = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`/api/rag-docs/${id}`, config);
                
                const data = res.data;
                setDoc(data);

                if (data.display_priority === 'web' && data.website_url) setActiveTab('web');
                else if (data.display_priority === 'media' && data.attachment_url) setActiveTab('media');
                else if (data.display_priority === 'drive' && data.drive_url) setActiveTab('drive');
                else if (data.display_priority === 'text' && (data.text_url || data.content_text)) setActiveTab('text');
                else if (data.website_url) setActiveTab('web');
                else if (data.attachment_url) setActiveTab('media');
                else if (data.drive_url) setActiveTab('drive');
                else setActiveTab('text');
            } catch (err) {
                console.error('Error fetching document:', err);
                setError('Không tìm thấy tài liệu hoặc bạn không có quyền xem.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 20px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ fontWeight: 500 }}>Đang tải tài liệu...</p>
            </div>
        </div>
    );
    if (error || !doc) return <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444', background: '#fef2f2', borderRadius: '12px', margin: '40px' }}>{error}</div>;

    const availableTabs = [];
    if (doc.text_url || doc.content_text) availableTabs.push({ id: 'text', label: 'Nội dung', icon: FileText });
    if (doc.website_url) availableTabs.push({ id: 'web', label: 'Giao diện Web', icon: Globe });
    if (doc.attachment_url) availableTabs.push({ id: 'media', label: 'Ảnh & Đồ hoạ', icon: ImageIcon });
    if (doc.drive_url) availableTabs.push({ id: 'drive', label: 'Tài liệu đính kèm', icon: File });

    return (
        <div style={{ padding: '0 20px 60px', maxWidth: '850px', margin: '0 auto', color: '#1e293b', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
            
            {/* Navigation / Breadcrumb */}
            <div style={{ padding: '24px 0', marginBottom: '10px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 0', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                    onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>

            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {doc.category ? doc.category.split(',').map((cat, idx) => (
                        <span key={idx} style={{ background: '#fff7ed', color: '#ea580c', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px', border: '1px solid #fdba74' }}>
                            {cat.trim()}
                        </span>
                    )) : (
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>Chưa phân loại</span>
                    )}
                    {doc.target_bus && doc.target_bus.map((bu, idx) => (
                        <span key={idx} style={{ background: '#f5f3ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid #c4b5fd' }}>
                            {bu}
                        </span>
                    ))}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a', lineHeight: '1.2', letterSpacing: '-0.5px' }}>{doc.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                    Cập nhật lần cuối: {new Date(doc.updated_at || doc.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
            </div>

            {/* Tabs */}
            {availableTabs.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {availableTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    padding: '12px 20px', 
                                    background: isActive ? '#fff' : 'transparent', 
                                    border: 'none', 
                                    borderBottom: isActive ? '3px solid #f97316' : '3px solid transparent',
                                    color: isActive ? '#f97316' : '#64748b',
                                    fontWeight: isActive ? '700' : '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                    marginBottom: '-2px'
                                }}
                            >
                                <Icon size={18} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Content Section */}
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                
                {activeTab === 'text' && (
                    <div style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#334155' }}>
                        {doc.content_text ? (
                            <div className="blog-prose" style={{ background: '#fff', padding: '32px 40px', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {doc.content_text}
                                </ReactMarkdown>
                            </div>
                        ) : doc.text_url ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                <FileText size={56} color="#94a3b8" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Tài liệu được lưu trữ trên nền tảng khác</h3>
                                <p style={{ marginBottom: '24px', color: '#64748b' }}>Nhấn vào nút bên dưới để mở tài liệu thô.</p>
                                <a 
                                    href={doc.text_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: '600', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)' }}
                                >
                                    Mở Link Văn Bản
                                </a>
                            </div>
                        ) : null}
                    </div>
                )}

                {activeTab === 'web' && doc.website_url && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <Globe size={56} color="#3b82f6" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Giao diện Web Tối Ưu</h3>
                        <p style={{ marginBottom: '24px', color: '#64748b' }}>Tài liệu này có phiên bản Web được thiết kế dành riêng cho trải nghiệm đọc tốt nhất.</p>
                        <a 
                            href={doc.website_url} 
                            target={doc.website_url.startsWith('http') ? '_blank' : '_self'}
                            rel="noreferrer"
                            style={{ background: '#3b82f6', color: 'white', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: '600', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
                        >
                            Đọc trên Web
                        </a>
                    </div>
                )}

                {activeTab === 'media' && doc.attachment_url && (
                    <div style={{ textAlign: 'center', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
                        <img src={doc.attachment_url} alt={doc.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                )}

                {activeTab === 'drive' && doc.drive_url && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <File size={56} color="#f59e0b" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Tài liệu Đính kèm</h3>
                        <p style={{ marginBottom: '24px', color: '#64748b' }}>Tài liệu này được lưu trữ dưới dạng File (Google Drive, PDF, Word, v.v.).</p>
                        <a 
                            href={doc.drive_url} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ background: '#f59e0b', color: 'white', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: '600', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
                        >
                            Mở Tài Liệu
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RagDocViewer;
