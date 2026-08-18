import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Clock, AlertCircle, MapPin, Users, Phone, Mail, CreditCard, Copy, Check, Printer, ShieldCheck, Calendar, FileText } from 'lucide-react';

const PublicReceiptPage = () => {
    const { token } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        axios.get(`/api/bookings/public/receipt/${token}`)
            .then(res => {
                setBooking(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Không tìm thấy thông tin hoá đơn hoặc link đã hết hạn.');
                setLoading(false);
            });
    }, [token]);

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>Đang tải hóa đơn xác nhận...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem' }}>
                <div style={{ maxWidth: '440px', width: '100%', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '2.5rem 2rem', textAlign: 'center', border: '1px solid #fee2e2' }}>
                    <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#ef4444' }}>
                        <AlertCircle size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Không tìm thấy hóa đơn</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{error || 'Đường dẫn xác nhận không tồn tại hoặc đã hết hạn truy cập.'}</p>
                </div>
            </div>
        );
    }

    const total = Number(booking.total_price) || 0;
    const paid = booking.transactions ? booking.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0) : 0;
    const remaining = Math.max(0, total - paid);
    const isFullyPaid = remaining === 0 && total > 0;

    // FIT TOUR Bank Info (ACB Official)
    const bankCode = "ACB";
    const bankName = "Ngân hàng TMCP Á Châu (ACB)";
    const bankAccount = "8888678968";
    const accountName = "CONG TY DU LICH QUOC TE FIT TOUR";
    const transferSyntax = `Thanh toan ${booking.booking_code}`;
    
    // VietQR URL API
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${remaining}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(accountName)}`;

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '2.5rem 1rem 4rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                
                {/* Brand Header */}
                <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '2rem 2rem 1.5rem', textAlign: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <img 
                        src="/logo.png" 
                        alt="FIT TOUR" 
                        style={{ height: '44px', objectFit: 'contain', margin: '0 auto 1rem', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ display: 'inline-block', background: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Phiếu Xác Nhận Đặt Chỗ & Hóa Đơn Dịch Vụ
                    </div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                        {booking.tour_name || 'Hợp Đồng Tour Du Lịch'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                        <span>Mã đơn:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>{booking.booking_code}</span>
                    </div>
                </div>

                {/* Status Bar */}
                <div style={{
                    background: isFullyPaid ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' : (paid > 0 ? 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)' : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'),
                    color: '#fff',
                    padding: '1.25rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isFullyPaid ? <CheckCircle2 size={22} /> : (paid > 0 ? <Clock size={22} /> : <AlertCircle size={22} />)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.3px' }}>
                                {isFullyPaid ? 'ĐÃ HOÀN TẤT THANH TOÁN' : (paid > 0 ? 'ĐÃ ĐẶT CỌC — CÒN LẠI CẦN THANH TOÁN' : 'CHƯA THANH TOÁN')}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
                                {isFullyPaid ? 'FIT TOUR trân trọng cảm ơn Quý khách. Chúc Quý khách một hành trình tuyệt vời!' : 'Vui lòng hoàn tất thanh toán số tiền còn lại theo lịch trình.'}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => window.print()}
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <Printer size={14} /> In phiếu
                    </button>
                </div>

                {/* Main Content Body */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '0 0 20px 20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        
                        {/* LEFT COLUMN: Trip & Customer Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Trip Info Box */}
                            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                    <MapPin size={16} /> THÔNG TIN HÀNH TRÌNH
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Tên tour:</span>
                                        <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '65%' }}>{booking.tour_name}</span>
                                    </div>
                                    {booking.departure_code && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Mã chuyến:</span>
                                            <span style={{ fontWeight: 700, color: '#0369a1' }}>{booking.departure_code}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Ngày khởi hành:</span>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                            {booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Theo thông báo'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Số lượng khách:</span>
                                        <span style={{ fontWeight: 700, color: '#ea580c' }}>{booking.pax_count || 1} khách</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info Box */}
                            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                                    <Users size={16} /> ĐẠI DIỆN ĐẶT CHỖ
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Họ và tên:</span>
                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{booking.customer_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Số điện thoại:</span>
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{booking.customer_phone || '--'}</span>
                                    </div>
                                    {booking.customer_email && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Email:</span>
                                            <span style={{ fontWeight: 500, color: '#0f172a' }}>{booking.customer_email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passengers list if any */}
                            {booking.passengers && booking.passengers.length > 0 && (
                                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                                        Danh sách thành viên ({booking.passengers.length})
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {booking.passengers.map((p, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '6px 0', borderBottom: idx < booking.passengers.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                                                <span style={{ fontWeight: 600, color: '#334155' }}>{idx + 1}. {p.full_name || 'Chưa cập nhật tên'}</span>
                                                <span style={{ color: '#64748b' }}>{p.pax_type || 'Người lớn'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* RIGHT COLUMN: Financials & QR Payment */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Financial Summary Card */}
                            <div style={{ background: '#fafaf9', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e7e5e4' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c1917', marginBottom: '1.25rem', borderBottom: '1px solid #e7e5e4', paddingBottom: '0.5rem' }}>
                                    TỔNG KẾT CHI PHÍ
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#57534e' }}>
                                        <span>Tổng giá trị đơn:</span>
                                        <span style={{ fontWeight: 700, color: '#1c1917' }}>{total.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                                        <span>Đã thanh toán:</span>
                                        <span style={{ fontWeight: 700 }}>{paid.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div style={{ paddingTop: '0.75rem', borderTop: '2px solid #e7e5e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>CÒN LẠI:</span>
                                        <span style={{ fontWeight: 800, color: remaining > 0 ? '#ea580c' : '#16a34a', fontSize: '1.4rem' }}>
                                            {remaining.toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank QR Code & Payment Instructions */}
                            {remaining > 0 && (
                                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '2px solid #fed7aa', boxShadow: '0 4px 20px rgba(234, 88, 12, 0.08)', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                        <ShieldCheck size={14} /> THANH TOÁN NHANH QUA VIETQR
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                        Mở app ngân hàng quét mã QR để thanh toán tự động
                                    </div>

                                    {/* QR Image Box */}
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', display: 'inline-block', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                                        <img 
                                            src={qrUrl} 
                                            alt="VietQR" 
                                            style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
                                        />
                                    </div>

                                    {/* Bank Details Table */}
                                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', textAlign: 'left', fontSize: '0.825rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{bankName}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{bankAccount}</span>
                                                <button 
                                                    onClick={() => handleCopy(bankAccount, 'stk')}
                                                    style={{ border: 'none', background: '#e0f2fe', color: '#0369a1', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', fontWeight: 600 }}
                                                >
                                                    {copiedField === 'stk' ? <Check size={12} /> : <Copy size={12} />}
                                                    {copiedField === 'stk' ? 'Đã chép' : 'Chép'}
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                                            <span style={{ fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{accountName}</span>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                                                <button 
                                                    onClick={() => handleCopy(transferSyntax, 'nd')}
                                                    style={{ border: 'none', background: '#e0f2fe', color: '#0369a1', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.7rem', fontWeight: 600 }}
                                                >
                                                    {copiedField === 'nd' ? <Check size={12} /> : <Copy size={12} />}
                                                    {copiedField === 'nd' ? 'Đã chép' : 'Chép'}
                                                </button>
                                            </div>
                                            <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontWeight: 800, color: '#ea580c', fontFamily: 'monospace', textAlign: 'center', fontSize: '0.9rem' }}>
                                                {transferSyntax}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>

                    {/* Payment History Section */}
                    {booking.transactions && booking.transactions.length > 0 && (
                        <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '1rem' }}>
                                <CreditCard size={18} color="#16a34a" /> LỊCH SỬ GIAO DỊCH ĐÃ GHI NHẬN
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Ngày ghi nhận</th>
                                            <th style={{ padding: '10px 12px', fontWeight: 600 }}>Hình thức</th>
                                            <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Số tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {booking.transactions.map((tx, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '10px 12px', color: '#334155' }}>
                                                    {new Date(tx.transaction_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {tx.payment_method || 'Chuyển khoản'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                                                    +{Number(tx.amount).toLocaleString('vi-VN')} đ
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer note */}
                    <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.6 }}>
                        <div>CÔNG TY DU LỊCH QUỐC TẾ FIT TOUR &bull; Hotline hỗ trợ: 0913 188 967</div>
                        <div style={{ marginTop: '4px' }}>Trân trọng cảm ơn Quý khách đã tin tưởng và đồng hành cùng FIT TOUR.</div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default PublicReceiptPage;
