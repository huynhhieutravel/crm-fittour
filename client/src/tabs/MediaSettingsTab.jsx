import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, AlertCircle, Image as ImageIcon, Loader, Info, CheckSquare, Calendar } from 'lucide-react';

export default function MediaSettingsTab({ addToast }) {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    
    // Bulk Select
    const [selectedMedia, setSelectedMedia] = useState([]);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/media', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMediaList(res.data);
            setSelectedMedia([]); // Reset selection on fetch
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi lấy danh sách Media', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn hình ảnh này không? Phiếu thu chứa hình này sẽ không gọi được ảnh lên nữa.')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/media/${filename}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(addToast) addToast('Xóa ảnh thành công', 'success');
            fetchMedia();
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi xóa Media', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedMedia.length === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedMedia.length} tập tin đã chọn không?`)) return;
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/media/bulk-delete', { filenames: selectedMedia }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(addToast) addToast(res.data.message || 'Xóa hàng loạt thành công', 'success');
            fetchMedia();
        } catch (err) {
            console.error(err);
            if(addToast) addToast('Lỗi xóa media hàng loạt', 'error');
            setLoading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredMediaList = mediaList.filter(m => {
        if (filterStartDate || filterEndDate) {
            const mDate = new Date(m.createdAt);
            mDate.setHours(0,0,0,0);
            
            if (filterStartDate) {
                const sDate = new Date(filterStartDate);
                sDate.setHours(0,0,0,0);
                if (mDate < sDate) return false;
            }
            if (filterEndDate) {
                const eDate = new Date(filterEndDate);
                eDate.setHours(0,0,0,0);
                if (mDate > eDate) return false;
            }
        }
        return true;
    });

    const isAllSelected = filteredMediaList.length > 0 && selectedMedia.length === filteredMediaList.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedMedia([]);
        } else {
            setSelectedMedia(filteredMediaList.map(m => m.filename));
        }
    };
    
    const toggleSelect = (filename) => {
        setSelectedMedia(prev => prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
                    <ImageIcon size={28} color="#2563eb" /> Quản lý Media (Kho chứng từ)
                </h2>
                
                {selectedMedia.length > 0 && (
                    <button 
                        onClick={handleBulkDelete}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}
                    >
                        <Trash2 size={18} /> XÓA {selectedMedia.length} MỤC ĐÃ CHỌN
                    </button>
                )}
            </div>
            
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#92400e' }}>
                <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Tất cả hình ảnh minh chứng Phiếu Thu tải lên sẽ được lưu trữ tại đây.
                    Hệ thống sẽ <strong> tự động quét các file cũ (không có mã Phiếu Chi/Thu) trên 60 ngày vào 2h sáng hàng ngày</strong> để xoá, tránh đầy máy chủ.
                </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Calendar size={18} color="#64748b" />
                   <span style={{ fontWeight: 600, color: '#334155' }}>Lọc thời gian:</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <label style={{ fontSize: '14px', color: '#64748b' }}>Từ ngày</label>
                   <input type="date" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <label style={{ fontSize: '14px', color: '#64748b' }}>Đến ngày</label>
                   <input type="date" style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
               </div>
               {(filterStartDate || filterEndDate) && (
                   <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Xóa bộ lọc</button>
               )}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                        <tr>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', width: '50px', textAlign: 'center' }}>
                                <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            </th>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Hình Ảnh</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Tên File (Path)</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Ngày Tải Lên</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Thuộc Phiếu Thu/Chi</th>
                            <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Dung lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}><Loader className="spin" size={24} style={{ marginBottom: '10px' }} /><br/>Đang đọc ổ đĩa...</td></tr>
                        ) : filteredMediaList.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Trống. Không tìm thấy dữ liệu nào phù hợp.</td></tr>
                        ) : (
                            filteredMediaList.map((m, index) => {
                                const isSelected = selectedMedia.includes(m.filename);
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : 'transparent', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); toggleSelect(m.filename); }}>
                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(m.filename)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <a href={m.url} target="_blank" rel="noopener noreferrer">
                                                <div style={{ width: '60px', height: '60px', backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                            </a>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 500, color: '#334155', maxWidth: '250px', wordBreak: 'break-all' }}>{m.filename}</td>
                                        <td style={{ padding: '16px', color: '#475569' }}>{new Date(m.createdAt).toLocaleString('vi-VN')}</td>
                                        <td style={{ padding: '16px' }}>
                                            {m.voucherCode ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                                                    <CheckSquare size={14} /> {m.voucherCode}
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                                                    <AlertCircle size={14} /> Hệ thống không dùng (Rác)
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', color: '#16a34a', fontWeight: 'bold', textAlign: 'right' }}>{formatBytes(m.size)}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
