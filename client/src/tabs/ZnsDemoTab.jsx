import React, { useState } from 'react';
import axios from 'axios';
import { MessageCircle, Send, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

const ZnsDemoTab = () => {
    const [phone, setPhone] = useState('');
    const [templateType, setTemplateType] = useState('REQUEST_PAYMENT');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSend = async () => {
        if (!phone) {
            setError('Vui lòng nhập số điện thoại');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.post('/api/zalo-v2/zns/demo-send', {
                phone,
                templateType
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setResult(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px', color: '#0284c7' }}>
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Mô Phỏng Gửi Zalo ZNS</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Công cụ test gửi ZNS Notification không chạm tới Database. Mọi log sẽ hiển thị trên Terminal.
                        </p>
                    </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Số điện thoại nhận (Zalo)</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                            <Phone size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09xxxx hoặc 849xxxx"
                                style={{ border: 'none', background: 'transparent', padding: '12px', outline: 'none', width: '100%', fontSize: '1rem', color: '#0f172a' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Loại Mẫu (Template ZNS)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div 
                                onClick={() => setTemplateType('REQUEST_PAYMENT')}
                                style={{
                                    border: templateType === 'REQUEST_PAYMENT' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                    backgroundColor: templateType === 'REQUEST_PAYMENT' ? '#eff6ff' : '#fff',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: templateType === 'REQUEST_PAYMENT' ? '#1d4ed8' : '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: templateType === 'REQUEST_PAYMENT' ? '4px solid #3b82f6' : '2px solid #cbd5e1', backgroundColor: '#fff' }}></div>
                                    Yêu cầu Thanh toán
                                </div>
                                <p style={{ margin: '8px 0 0 24px', fontSize: '0.85rem', color: '#64748b' }}>Gửi link Hóa đơn kèm số tiền nhắc nợ.</p>
                            </div>

                            <div 
                                onClick={() => setTemplateType('CONFIRM_PAYMENT')}
                                style={{
                                    border: templateType === 'CONFIRM_PAYMENT' ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                    backgroundColor: templateType === 'CONFIRM_PAYMENT' ? '#f0fdf4' : '#fff',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: templateType === 'CONFIRM_PAYMENT' ? '#15803d' : '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: templateType === 'CONFIRM_PAYMENT' ? '4px solid #22c55e' : '2px solid #cbd5e1', backgroundColor: '#fff' }}></div>
                                    Xác nhận Thanh toán
                                </div>
                                <p style={{ margin: '8px 0 0 24px', fontSize: '0.85rem', color: '#64748b' }}>Cảm ơn và xác nhận đã thu tiền thành công.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSend} 
                        disabled={loading}
                        style={{ 
                            marginTop: '12px',
                            backgroundColor: loading ? '#94a3b8' : '#0ea5e9', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            fontSize: '1.05rem', 
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={18} /> {loading ? 'Đang gửi...' : 'Gửi Tin Nhắn ZNS Demo'}
                    </button>

                    {/* Result Alerts */}
                    {error && (
                        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '12px' }}>
                            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>Lỗi Gửi ZNS</strong>
                                <span style={{ fontSize: '0.9rem' }}>{error}</span>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '12px' }}>
                            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>{result.message}</strong>
                                <pre style={{ margin: '8px 0 0 0', backgroundColor: '#dcfce7', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', color: '#166534' }}>
                                    {JSON.stringify(result.data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ZnsDemoTab;
