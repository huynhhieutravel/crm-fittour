import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Save, X, FileText, Image as ImageIcon, Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';
import { swalConfirm } from '../../utils/swalHelpers';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const RagDocsManager = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);

    const CATEGORY_OPTIONS = [
        { value: 'Tất cả', label: 'Tất cả (Mọi phòng ban)' },
        { value: 'Sale', label: 'Sale' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Điều Hành', label: 'Điều Hành' },
        { value: 'HDV', label: 'HDV' },
        { value: 'Kế Toán', label: 'Kế Toán' },
        { value: 'Khác', label: 'Khác' }
    ];

    const BU_OPTIONS = [
        { value: 'BU1', label: 'BU1' },
        { value: 'BU2', label: 'BU2' },
        { value: 'BU3', label: 'BU3' },
        { value: 'BU4', label: 'BU4' },
        { value: 'BU5', label: 'BU5' }
    ];

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        visibility: 'private',
        content_type: 'text',
        text_url: '',
        attachment_url: '',
        website_url: '',
        display_priority: 'text',
        status: 'active',
        target_bus: [],
        content_text: ''
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/rag-docs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
        } catch (err) {
            console.error('Error fetching documents:', err);
            Swal.fire('Lỗi', 'Không thể tải danh sách tài liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (doc = null) => {
        if (doc) {
            setEditingDoc(doc);
            setFormData({
                title: doc.title,
                category: doc.category || '',
                visibility: doc.visibility || 'private',
                content_type: doc.content_type || 'text',
                text_url: doc.text_url || '',
                attachment_url: doc.attachment_url || '',
                website_url: doc.website_url || '',
                drive_url: doc.drive_url || '',
                display_priority: doc.display_priority || 'text',
                status: doc.status || 'active',
                target_bus: doc.target_bus || [],
                content_text: doc.content_text || ''
            });
        } else {
            setEditingDoc(null);
            setFormData({
                title: '',
                category: '',
                visibility: 'private',
                content_type: 'text',
                text_url: '',
                attachment_url: '',
                website_url: '',
                drive_url: '',
                display_priority: 'text',
                status: 'active',
                target_bus: [],
                content_text: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDoc(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (editingDoc) {
                await axios.put(`/api/rag-docs/${editingDoc.id}`, formData, config);
                Swal.fire('Thành công', 'Đã cập nhật tài liệu', 'success');
            } else {
                await axios.post('/api/rag-docs', formData, config);
                Swal.fire('Thành công', 'Đã tạo tài liệu mới', 'success');
            }
            handleCloseModal();
            fetchDocuments();
        } catch (err) {
            console.error('Error saving document:', err);
            Swal.fire('Lỗi', 'Không thể lưu tài liệu', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await swalConfirm('Bạn có chắc chắn muốn xóa tài liệu này?');
        if (confirm) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/rag-docs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchDocuments();
                Swal.fire('Đã xóa!', 'Tài liệu đã bị xóa.', 'success');
            } catch (err) {
                console.error('Error deleting document:', err);
                Swal.fire('Lỗi', 'Không thể xóa tài liệu', 'error');
            }
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()));
        let matchCat = true;
        if (filterCategory) {
            matchCat = doc.category && doc.category.includes(filterCategory);
        }
        return matchSearch && matchCat;
    });

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc', minHeight: '100vh' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <button onClick={() => navigate('/tai-lieu')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                        <ArrowLeft size={16} /> Quay lại Tài Liệu Nội Bộ
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="text-blue-400" /> Quản Lý Bài Viết (RAG CMS)
                    </h1>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}
                >
                    <Plus size={18} /> Đăng bài mới
                </button>
            </div>

            {/* Filter Area */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên bài viết, phòng ban..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '10px 12px 10px 40px', borderRadius: '6px' }}
                    />
                </div>
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '10px 16px', borderRadius: '6px', minWidth: '150px' }}
                >
                    <option value="">Tất cả phòng ban</option>
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button onClick={fetchDocuments} style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Table */}
            <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#94a3b8', fontWeight: '500' }}>Tiêu đề</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#94a3b8', fontWeight: '500' }}>Phòng Ban</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Quyền xem</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Loại nội dung</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Trạng thái</th>
                            <th style={{ padding: '16px', textAlign: 'right', color: '#94a3b8', fontWeight: '500' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
                        ) : filteredDocs.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy tài liệu nào.</td></tr>
                        ) : (
                            filteredDocs.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>
                                        {doc.title}
                                        {doc.display_priority === 'media' && <ImageIcon size={14} style={{ display: 'inline-block', marginLeft: '8px', color: '#a855f7' }} title="Ưu tiên hiển thị Ảnh" />}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: '#334155', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                                            {doc.category || 'Khác'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {doc.visibility === 'public' ? (
                                            <span style={{ color: '#22c55e', fontSize: '13px', border: '1px solid #22c55e', padding: '2px 8px', borderRadius: '12px', marginRight: '4px' }}>Công khai</span>
                                        ) : (
                                            <span style={{ color: '#f59e0b', fontSize: '13px', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: '12px', marginRight: '4px' }}>Nội bộ</span>
                                        )}
                                        {doc.target_bus && doc.target_bus.length > 0 && (
                                            <span style={{ color: '#8b5cf6', fontSize: '13px', border: '1px solid #8b5cf6', padding: '2px 8px', borderRadius: '12px' }}>{doc.target_bus.join(', ')}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {doc.content_type === 'text' ? 'Văn bản' : 'Link Đính Kèm'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {doc.status === 'active' ? (
                                            <span style={{ color: '#3b82f6' }}>Hoạt động</span>
                                        ) : (
                                            <span style={{ color: '#64748b' }}>Đã ẩn</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button onClick={() => handleOpenModal(doc)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px 8px' }}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(doc.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Editor Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1e293b', width: '100%', maxWidth: '800px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                                {editingDoc ? 'Chỉnh sửa Bài Viết' : 'Đăng Bài Mới'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            <form id="ragDocForm" onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Tiêu đề (Bắt buộc)</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                            placeholder="Ví dụ: Quy định tính lương Sale"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Phòng Ban (Danh mục)</label>
                                        <Select
                                            isMulti
                                            options={CATEGORY_OPTIONS}
                                            value={formData.category ? formData.category.split(', ').map(c => ({ value: c, label: c })) : []}
                                            onChange={selected => setFormData({...formData, category: selected ? selected.map(s => s.value).join(', ') : ''})}
                                            placeholder="Chọn phòng ban..."
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    background: '#0f172a',
                                                    borderColor: '#334155',
                                                    color: 'white',
                                                    minHeight: '42px',
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    background: '#1e293b',
                                                    color: 'white',
                                                    zIndex: 100
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    background: state.isFocused ? '#334155' : '#1e293b',
                                                    color: 'white',
                                                }),
                                                multiValue: (base) => ({
                                                    ...base,
                                                    background: '#334155',
                                                }),
                                                multiValueLabel: (base) => ({
                                                    ...base,
                                                    color: 'white',
                                                }),
                                                multiValueRemove: (base) => ({
                                                    ...base,
                                                    color: '#94a3b8',
                                                    ':hover': {
                                                        background: '#ef4444',
                                                        color: 'white',
                                                    }
                                                })
                                            }}
                                        />
                                        <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>Dùng làm bộ lọc Context cho AI</small>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Quyền Truy Cập (Auth)</label>
                                        <select 
                                            value={formData.visibility} 
                                            onChange={e => setFormData({...formData, visibility: e.target.value})}
                                            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                        >
                                            <option value="private">Nội bộ (Yêu cầu đăng nhập CRM)</option>
                                            <option value="public">Công khai (Ai cũng xem được)</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Phân quyền theo BU (Tuỳ chọn)</label>
                                    <Select
                                        isMulti
                                        options={BU_OPTIONS}
                                        value={formData.target_bus ? formData.target_bus.map(bu => ({ value: bu, label: bu })) : []}
                                        onChange={selected => setFormData({...formData, target_bus: selected ? selected.map(s => s.value) : []})}
                                        placeholder="Chọn BU được phép xem (Để trống là tất cả)..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                background: '#0f172a',
                                                borderColor: '#334155',
                                                color: 'white',
                                                minHeight: '42px',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                background: '#1e293b',
                                                color: 'white',
                                                zIndex: 100
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                background: state.isFocused ? '#334155' : '#1e293b',
                                                color: 'white',
                                            }),
                                            multiValue: (base) => ({
                                                ...base,
                                                background: '#334155',
                                            }),
                                            multiValueLabel: (base) => ({
                                                ...base,
                                                color: 'white',
                                            }),
                                            multiValueRemove: (base) => ({
                                                ...base,
                                                color: '#94a3b8',
                                                ':hover': {
                                                    background: '#ef4444',
                                                    color: 'white',
                                                }
                                            })
                                        }}
                                    />
                                </div>

                                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Eye size={18} /> Chế độ Hiển thị & Nội dung (Dual-Content)
                                    </h3>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Tab Mặc định hiển thị cho Nhân viên</label>
                                        <select 
                                            value={formData.display_priority} 
                                            onChange={e => setFormData({...formData, display_priority: e.target.value})}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '10px', borderRadius: '6px' }}
                                        >
                                            <option value="web">Ưu tiên Trang Web Thiết kế (A2)</option>
                                            <option value="media">Ưu tiên Ảnh Đồ họa (A3)</option>
                                            <option value="drive">Ưu tiên Tài liệu Đính kèm (A4)</option>
                                            <option value="text">Ưu tiên Link Văn bản thô (A1)</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>
                                            <span>Link Văn Bản thô - A1 (Chỉ dành cho AI cào & đọc)</span>
                                            <span style={{ fontSize: '12px', color: '#f59e0b' }}>*Bắt buộc nạp Link Text để AI có kiến thức</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.text_url} 
                                            onChange={e => setFormData({...formData, text_url: e.target.value})}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                            placeholder="VD: https://.../marketing.md (Link Markdown hoặc txt thô)"
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Hoặc nhập trực tiếp Nội dung (Markdown / Text thô)</label>
                                        <textarea 
                                            value={formData.content_text} 
                                            onChange={e => setFormData({...formData, content_text: e.target.value})}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px', minHeight: '150px', fontFamily: 'monospace' }}
                                            placeholder="Bạn có thể gõ trực tiếp kịch bản, quy định vào đây..."
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Link Giao Diện Web - A2</label>
                                            <input 
                                                type="text" 
                                                value={formData.website_url} 
                                                onChange={e => setFormData({...formData, website_url: e.target.value})}
                                                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                                placeholder="VD: https://erp.fittour.vn/tai-lieu/..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Link Ảnh Đồ Họa - A3</label>
                                            <input 
                                                type="text" 
                                                value={formData.attachment_url} 
                                                onChange={e => setFormData({...formData, attachment_url: e.target.value})}
                                                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                                placeholder="VD: Link hình ảnh đuôi .jpg, .png..."
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: '500' }}>Link Tài Liệu Đính Kèm - A4 (File Word/Excel/PDF/Drive)</label>
                                        <input 
                                            type="text" 
                                            value={formData.drive_url} 
                                            onChange={e => setFormData({...formData, drive_url: e.target.value})}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '12px', borderRadius: '6px' }}
                                            placeholder="VD: Link thư mục Google Drive..."
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.status === 'active'}
                                            onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                                        />
                                        <span style={{ color: '#e2e8f0' }}>Cho phép hoạt động (Hiển thị)</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div style={{ padding: '20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#0f172a', borderRadius: '0 0 12px 12px' }}>
                            <button type="button" onClick={handleCloseModal} style={{ background: 'transparent', border: '1px solid #334155', color: '#e2e8f0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                                Hủy bỏ
                            </button>
                            <button type="submit" form="ragDocForm" style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> Lưu Bài Viết
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RagDocsManager;
