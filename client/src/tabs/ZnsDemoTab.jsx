import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    MessageCircle, 
    Send, 
    Phone, 
    CheckCircle, 
    AlertTriangle, 
    User, 
    Tag, 
    Compass, 
    DollarSign, 
    Sparkles, 
    Smartphone, 
    Building2, 
    CreditCard, 
    RefreshCw, 
    ExternalLink 
} from 'lucide-react';

const PRESETS = [
    {
        name: '🇧🇹 Tour Bhutan 5N4Đ (Cọc đợt 1, nhắc 15tr)',
        data: {
            customer_name: 'Nguyễn Văn An',
            booking_code: 'BKBHU202601',
            tour_name: 'Tour Bhutan - Tây Tạng Huyền Bí 5N4Đ',
            total_price: 25000000,
            paid_amount: 10000000,
            amount: 15000000,
            templateType: 'REQUEST_PAYMENT'
        }
    },
    {
        name: '🇲🇳 Tour Mông Cổ 8N7Đ (Xác nhận cọc 30tr)',
        data: {
            customer_name: 'Trần Thị Thảo',
            booking_code: 'BKMGC202688',
            tour_name: 'Tour Mông Cổ - Thảo Nguyên Bất Tận 8N7Đ',
            total_price: 65000000,
            paid_amount: 30000000,
            amount: 35000000,
            templateType: 'CONFIRM_PAYMENT'
        }
    },
    {
        name: '🇮🇳 Tour Ladakh 9N8Đ (Nhắc tất toán 25tr)',
        data: {
            customer_name: 'Lê Hoàng Long',
            booking_code: 'BKLAD202699',
            tour_name: 'Tour Ladakh - Tiểu Tây Tạng Ấn Độ 9N8Đ',
            total_price: 55000000,
            paid_amount: 30000000,
            amount: 25000000,
            templateType: 'REQUEST_PAYMENT'
        }
    }
];

const formatCurrency = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
};

const ZnsDemoTab = () => {
    const [phone, setPhone] = useState('');
    const [templateType, setTemplateType] = useState('REQUEST_PAYMENT');
    const [customerName, setCustomerName] = useState('Huỳnh Trọng Hiếu');
    const [bookingCode, setBookingCode] = useState('BKMSYHPP3M');
    const [tourName, setTourName] = useState('Tour Bhutan 5 ngày 4 đêm');
    const [totalPrice, setTotalPrice] = useState(25000000);
    const [paidAmount, setPaidAmount] = useState(10000000);
    const [amount, setAmount] = useState(15000000);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Tự động tính số tiền cần đóng khi thay đổi tổng tiền hoặc đã thanh toán
    const handleTotalPriceChange = (e) => {
        const val = Number(e.target.value) || 0;
        setTotalPrice(val);
        setAmount(Math.max(0, val - paidAmount));
    };

    const handlePaidAmountChange = (e) => {
        const val = Number(e.target.value) || 0;
        setPaidAmount(val);
        setAmount(Math.max(0, totalPrice - val));
    };

    const applyPreset = (preset) => {
        setCustomerName(preset.data.customer_name);
        setBookingCode(preset.data.booking_code);
        setTourName(preset.data.tour_name);
        setTotalPrice(preset.data.total_price);
        setPaidAmount(preset.data.paid_amount);
        setAmount(preset.data.amount);
        setTemplateType(preset.data.templateType);
    };

    const handleSend = async () => {
        if (!phone) {
            setError('Vui lòng nhập số điện thoại nhận Zalo.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.post('/api/zalo-v2/zns/demo-send', {
                phone,
                templateType,
                customer_name: customerName,
                booking_code: bookingCode,
                tour_name: tourName,
                total_price: totalPrice,
                paid_amount: paidAmount,
                amount: amount
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setResult(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Lỗi kết nối khi gửi ZNS');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', 
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                marginBottom: '24px'
            }}>
                <div style={{ 
                    padding: '24px 32px', 
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#fff',
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                            <MessageCircle size={28} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Kiểm Thử & Mô Phỏng Gửi Zalo ZBS
                            </h1>
                            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                                Bắn thông báo ZBS Thanh toán thật qua Zalo Cloud OpenAPI với đầy đủ tham số động.
                            </p>
                        </div>
                    </div>
                    <div style={{ 
                        background: 'rgba(255,255,255,0.15)', 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
                        ZBS Template API 2026
                    </div>
                </div>

                {/* Preset Fast Fill */}
                <div style={{ padding: '16px 32px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} color="#0284c7" /> Mẫu dữ liệu nhanh:
                    </span>
                    {PRESETS.map((p, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPreset(p)}
                            style={{
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#fff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.color = '#0284c7'; }}
                            onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Column 1: Input Form */}
                <div style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    padding: '28px', 
                    boxShadow: '0 4px 16px -2px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={20} color="#0284c7" /> Cấu hình tham số gửi tin
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Số điện thoại */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.9rem', marginBottom: '6px' }}>
                                Số điện thoại nhận tin (Zalo) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 12px', border: '1px solid #cbd5e1' }}>
                                <Phone size={18} color="#64748b" />
                                <input 
                                    type="text" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="09xxxx hoặc 849xxxx"
                                    style={{ border: 'none', background: 'transparent', padding: '10px 12px', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}
                                />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Nhập số Zalo cá nhân của bạn để nhận tin nhắn kiểm thử.</span>
                        </div>

                        {/* Chọn loại Template */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.9rem', marginBottom: '6px' }}>
                                Chọn Loại Mẫu ZBS (Template) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div 
                                    onClick={() => setTemplateType('REQUEST_PAYMENT')}
                                    style={{
                                        border: templateType === 'REQUEST_PAYMENT' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                        backgroundColor: templateType === 'REQUEST_PAYMENT' ? '#f0f9ff' : '#fff',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, color: templateType === 'REQUEST_PAYMENT' ? '#0369a1' : '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: templateType === 'REQUEST_PAYMENT' ? '5px solid #0284c7' : '2px solid #cbd5e1', backgroundColor: '#fff' }}></div>
                                        1. Yêu cầu Thanh toán
                                    </div>
                                    <p style={{ margin: '6px 0 0 24px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                                        ID <strong>625192</strong> • Kèm nút "Chuyển khoản ngay" & số tiền nhắc đóng.
                                    </p>
                                </div>

                                <div 
                                    onClick={() => setTemplateType('CONFIRM_PAYMENT')}
                                    style={{
                                        border: templateType === 'CONFIRM_PAYMENT' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                                        backgroundColor: templateType === 'CONFIRM_PAYMENT' ? '#f0fdf4' : '#fff',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, color: templateType === 'CONFIRM_PAYMENT' ? '#15803d' : '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: templateType === 'CONFIRM_PAYMENT' ? '5px solid #16a34a' : '2px solid #cbd5e1', backgroundColor: '#fff' }}></div>
                                        2. Xác nhận Đã Thu
                                    </div>
                                    <p style={{ margin: '6px 0 0 24px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                                        ID <strong>625193</strong> • Báo đã nhận được khoản thanh toán thành công.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hàng: Tên khách hàng & Mã Booking */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    Tên khách hàng (<code style={{ color: '#0284c7' }}>customer_name</code>)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 10px', border: '1px solid #cbd5e1' }}>
                                    <User size={16} color="#64748b" />
                                    <input 
                                        type="text" 
                                        value={customerName} 
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        style={{ border: 'none', background: 'transparent', padding: '9px 10px', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    Mã Booking / Ghi chú CK (<code style={{ color: '#0284c7' }}>booking_code</code>)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 10px', border: '1px solid #cbd5e1' }}>
                                    <Tag size={16} color="#64748b" />
                                    <input 
                                        type="text" 
                                        value={bookingCode} 
                                        onChange={(e) => setBookingCode(e.target.value)}
                                        placeholder="BKMSYHPP3M"
                                        style={{ border: 'none', background: 'transparent', padding: '9px 10px', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', display: 'block' }}>Zalo cấm dấu gạch (-) ở mục này, hệ thống sẽ tự động lọc sạch.</span>
                            </div>
                        </div>

                        {/* Tên Tour */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                                Tên Tour / Sản phẩm (<code style={{ color: '#0284c7' }}>tour_name</code>)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 10px', border: '1px solid #cbd5e1' }}>
                                <Compass size={16} color="#64748b" />
                                <input 
                                    type="text" 
                                    value={tourName} 
                                    onChange={(e) => setTourName(e.target.value)}
                                    placeholder="Tên tour hoặc gói dịch vụ"
                                    style={{ border: 'none', background: 'transparent', padding: '9px 10px', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
                                />
                            </div>
                        </div>

                        {/* Hàng Số tiền: Tổng tiền & Đã thanh toán */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    Tổng giá trị Tour (<code style={{ color: '#0284c7' }}>total_price</code>)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 10px', border: '1px solid #cbd5e1' }}>
                                    <DollarSign size={16} color="#64748b" />
                                    <input 
                                        type="number" 
                                        value={totalPrice} 
                                        onChange={handleTotalPriceChange}
                                        style={{ border: 'none', background: 'transparent', padding: '9px 10px', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>{formatCurrency(totalPrice)}</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.85rem', marginBottom: '4px' }}>
                                    Đã thanh toán (<code style={{ color: '#0284c7' }}>paid_amount</code>)
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '0 10px', border: '1px solid #cbd5e1' }}>
                                    <DollarSign size={16} color="#64748b" />
                                    <input 
                                        type="number" 
                                        value={paidAmount} 
                                        onChange={handlePaidAmountChange}
                                        style={{ border: 'none', background: 'transparent', padding: '9px 10px', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>{formatCurrency(paidAmount)}</span>
                            </div>
                        </div>

                        {/* Số tiền cần đóng đợt này (amount) - Chỉ hiển thị hoặc tô nổi bật khi là REQUEST_PAYMENT */}
                        {templateType === 'REQUEST_PAYMENT' && (
                            <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <label style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.88rem' }}>
                                        Số tiền CẦN ĐÓNG đợt này (<code style={{ color: '#1d4ed8' }}>amount</code>) <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Tự động: Tổng - Đã thu</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: '8px', padding: '0 10px', border: '1px solid #93c5fd' }}>
                                    <DollarSign size={16} color="#2563eb" />
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                                        style={{ border: 'none', background: 'transparent', padding: '10px 10px', outline: 'none', width: '100%', fontSize: '1rem', color: '#1e40af', fontWeight: 800 }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#1d4ed8', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                                    Hiển thị trên ZBS: <strong>{formatCurrency(amount)}</strong>
                                </span>
                            </div>
                        )}

                        {/* Action Button */}
                        <button 
                            onClick={handleSend} 
                            disabled={loading}
                            style={{ 
                                marginTop: '10px',
                                backgroundColor: loading ? '#94a3b8' : '#0284c7', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '15px', 
                                borderRadius: '10px', 
                                fontSize: '1.05rem', 
                                fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(2, 132, 199, 0.35)'
                            }}
                        >
                            {loading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />} 
                            {loading ? 'Đang gửi tới máy chủ Zalo...' : 'Bắn Tin Nhắn ZBS Thật'}
                        </button>
                    </div>

                    {/* Result Logs */}
                    {error && (
                        <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '18px' }}>
                            <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>Lỗi Gửi ZBS (Zalo API)</strong>
                                <span style={{ fontSize: '0.9rem' }}>{error}</span>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '18px' }}>
                            <CheckCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ width: '100%' }}>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>{result.message}</strong>
                                <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '8px' }}>
                                    Mã tin nhắn (msg_id): <strong>{result.data?.data?.msg_id || 'N/A'}</strong>
                                </div>
                                <details style={{ backgroundColor: '#dcfce7', padding: '10px', borderRadius: '8px', fontSize: '0.78rem' }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Xem Chi Tiết Payload & Phản Hồi JSON</summary>
                                    <pre style={{ margin: '8px 0 0 0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column 2: Live Zalo Visual Preview */}
                <div>
                    <div style={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '16px', 
                        padding: '24px', 
                        boxShadow: '0 4px 16px -2px rgba(0,0,0,0.05)',
                        border: '1px solid #e2e8f0',
                        position: 'sticky',
                        top: '24px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Smartphone size={18} color="#0284c7" /> Mô phỏng Tin nhắn Zalo
                            </h3>
                            <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#64748b', fontWeight: 600 }}>
                                Live Preview
                            </span>
                        </div>

                        {/* Zalo Mock Card */}
                        <div style={{ 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '16px', 
                            padding: '16px',
                            border: '1px solid #cbd5e1',
                            maxWidth: '360px',
                            margin: '0 auto'
                        }}>
                            {/* Zalo Message Bubble */}
                            <div style={{ 
                                backgroundColor: '#fff', 
                                borderRadius: '12px', 
                                padding: '16px', 
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid #e2e8f0'
                            }}>
                                {/* OA Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                                        FIT
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>FIT Tour - Du lịch có Guu</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hôm nay • Tin nhắn từ OA</div>
                                    </div>
                                </div>

                                {/* Message Title */}
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '8px' }}>
                                    {templateType === 'REQUEST_PAYMENT' ? 'FIT TOUR - Yêu cầu thanh toán' : 'FIT TOUR - Xác nhận thanh toán dịch vụ'}
                                </div>

                                <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                                    {templateType === 'REQUEST_PAYMENT' 
                                        ? `Kính gửi Quý khách ${customerName || '...'}, FIT Tour xin thông báo khoản thanh toán dịch vụ như sau:` 
                                        : `Kính gửi Quý khách ${customerName || '...'}, FIT Tour xin xác nhận đã nhận được khoản thanh toán dịch vụ của Quý khách.`
                                    }
                                </p>

                                {/* Key-Value Table */}
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Mã đặt chỗ:</span>
                                        <strong style={{ color: '#0f172a' }}>{bookingCode || '...'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Tên tour:</span>
                                        <strong style={{ color: '#0f172a', maxWidth: '180px', textAlign: 'right' }}>{tourName || '...'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Tổng giá trị:</span>
                                        <strong style={{ color: '#0f172a' }}>{formatCurrency(totalPrice)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Đã thanh toán:</span>
                                        <strong style={{ color: '#16a34a' }}>{formatCurrency(paidAmount)}</strong>
                                    </div>
                                    {templateType === 'REQUEST_PAYMENT' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                                            <span style={{ color: '#1e40af', fontWeight: 700 }}>Cần thanh toán:</span>
                                            <strong style={{ color: '#dc2626', fontSize: '0.9rem' }}>{formatCurrency(amount)}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Bank Transfer Info Box for REQUEST_PAYMENT */}
                                {templateType === 'REQUEST_PAYMENT' ? (
                                    <div style={{ marginTop: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', padding: '12px', border: '1px solid #bfdbfe' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                                            <Building2 size={14} /> NGÂN HÀNG TMCP Á CHÂU (ACB)
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                                            <div>Số TK: <strong>8888678968</strong></div>
                                            <div>Chủ TK: <strong>CÔNG TY CP DU LỊCH VÀ TRUYỀN THÔNG FIT TOUR</strong></div>
                                            <div>Nội dung CK: <strong style={{ color: '#dc2626' }}>{bookingCode || 'BK-MSYHPP3M'}</strong></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.78rem', color: '#15803d', backgroundColor: '#f0fdf4', padding: '8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                                        ✅ Cảm ơn Quý khách đã tin tưởng và đồng hành cùng FIT Tour!
                                    </div>
                                )}

                                {/* CTA Button */}
                                <div style={{ marginTop: '14px' }}>
                                    <div style={{ 
                                        backgroundColor: templateType === 'REQUEST_PAYMENT' ? '#0068ff' : '#0068ff', 
                                        color: '#fff', 
                                        textAlign: 'center', 
                                        padding: '10px', 
                                        borderRadius: '8px', 
                                        fontWeight: 700, 
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}>
                                        {templateType === 'REQUEST_PAYMENT' ? 'Chuyển khoản ngay' : 'Quan tâm OA'}
                                        <ExternalLink size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                            Mẫu ZBS được hiển thị theo thiết kế chính thức đã được Zalo phê duyệt (Template ID: <strong>{templateType === 'REQUEST_PAYMENT' ? '625192' : '625193'}</strong>).
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ZnsDemoTab;
