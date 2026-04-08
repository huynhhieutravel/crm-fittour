import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, AlertCircle, Image as ImageIcon, Loader, Info } from 'lucide-react';

export default function MediaSettingsTab({ addToast }) {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
                <ImageIcon size={28} color="#2563eb" /> Quản lý Media (Ảnh Minh Chứng)
            </h2>
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#92400e' }}>
                <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Tất cả hình ảnh minh chứng Phiếu Thu tải lên sẽ được lưu trữ tại đây. 
                    <strong> Hệ thống tự động xóa các ảnh đã tồn tại trên 60 ngày vào lúc 2h sáng hàng ngày</strong> để tránh đầy ổ đĩa nội bộ. Bạn cũng có thể chủ động xoá bằng tay nếu thấy cần thiết.
                </p>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', color: '#475569', fontSize: '14px' }}>
                        <tr>
                            <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>Hình Ảnh</th>
                            <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>Tên File (Path)</th>
                            <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>Ngày Tải Lên</th>
                            <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Dung lượng</th>
                            <th style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}><Loader className="spin" size={24} style={{ marginBottom: '10px' }} /><br/>Đang đọc ổ đĩa...</td></tr>
                        ) : mediaList.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Trống. Chưa có dữ liệu nào lưu trong thư mục.</td></tr>
                        ) : (
                            mediaList.map((m, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <a href={m.url} target="_blank" rel="noopener noreferrer">
                                            <div style={{ width: '60px', height: '60px', backgroundImage: `url(${m.url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </a>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 500, color: '#334155', maxWidth: '300px', wordBreak: 'break-all' }}>{m.filename}</td>
                                    <td style={{ padding: '16px 20px', color: '#475569' }}>{new Date(m.createdAt).toLocaleString('vi-VN')}</td>
                                    <td style={{ padding: '16px 20px', color: '#16a34a', fontWeight: 'bold', textAlign: 'right' }}>{formatBytes(m.size)}</td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleDelete(m.filename)}
                                            style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                                            <Trash2 size={16} /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
