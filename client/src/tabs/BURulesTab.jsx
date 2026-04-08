import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BURulesTab = ({ currentUser }) => {
    const [bus, setBus] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBUs();
    }, []);

    const fetchBUs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/business-units', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBus(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const buColors = {
        'BU1': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '🇨🇳' },
        'BU2': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '🌍' },
        'BU3': { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', icon: '🏢' },
        'BU4': { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '🏔️' },
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ⚙️ QUY TẮC TỰ ĐỘNG CHỌN BU CHO LEAD
                </h1>
                <p style={{ color: '#64748b' }}>
                    Hệ thống tự động phân loại Khối Kinh Doanh (BU) cho Lead dựa trên từ khóa trong tin nhắn Messenger
                </p>
            </div>

            {/* How it works */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    📋 CÁCH HOẠT ĐỘNG
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bae6fd' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: '#0369a1' }}>Bước 1</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>Khách nhắn tin qua Messenger Fanpage</div>
                    </div>
                    <div style={{ background: '#fefce8', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #fde047' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: '#a16207' }}>Bước 2</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>Hệ thống quét từ khóa trong tin nhắn đầu tiên</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontWeight: 700, marginBottom: '4px', color: '#15803d' }}>Bước 3</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>Tự động gán BU → Nhân viên không cần chọn tay</div>
                    </div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '16px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#1d4ed8' }}>⚡ Quy tắc ưu tiên:</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#334155' }}>
                        <li><strong>Ưu tiên theo thứ tự BU:</strong> BU1 → BU2 → BU3 → BU4 (nào match trước thắng)</li>
                        <li><strong>So khớp không phân biệt dấu:</strong> "nhật bản" = "Nhật Bản" = "NHAT BAN"</li>
                        <li><strong>Quét toàn bộ hội thoại:</strong> Bao gồm cả tin nhắn khách <em>và</em> tin nhắn Fanpage trả lời</li>
                        <li><strong>Chỉ áp dụng cho Lead MỚI:</strong> Nếu nhân viên đã chọn BU thì hệ thống <strong>không ghi đè</strong></li>
                        <li><strong>Không match:</strong> Lead vẫn tạo bình thường, BU = trống (nhân viên chọn tay)</li>
                    </ul>
                </div>

                <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #eab308', marginBottom: '16px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#a16207' }}>🔤 Cách so khớp từ khóa:</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#334155' }}>
                        <li>
                            <strong>Từ khóa dài (trên 3 ký tự):</strong> Tìm kiếm bình thường — chỉ cần xuất hiện trong tin nhắn
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                VD: "nhật bản", "seoul", "team building" → Tìm thấy trong bất kỳ đâu ✅
                            </div>
                        </li>
                        <li style={{ marginTop: '8px' }}>
                            <strong>Từ khóa ngắn (≤3 ký tự):</strong> Phải <strong>đứng riêng như 1 từ</strong>, không nằm giữa từ khác
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                VD: Keyword <code style={{ background: '#fde68a', padding: '1px 5px', borderRadius: '3px' }}>ý</code> hoặc <code style={{ background: '#fde68a', padding: '1px 5px', borderRadius: '3px' }}>mỹ</code>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                <span style={{ color: '#16a34a' }}>✅ "đi tour <strong>ý</strong>, pháp" → Match</span>
                                <span style={{ color: '#16a34a' }}>✅ "muốn đi <strong>mỹ</strong> tháng 6" → Match</span>
                                <span style={{ color: '#dc2626' }}>❌ "stor<strong>y</strong>_fbid=abc..." → Không match</span>
                                <span style={{ color: '#dc2626' }}>❌ "m<strong>y</strong> account" → Không match</span>
                            </div>
                        </li>
                    </ul>
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef9c3', borderRadius: '6px', fontSize: '0.82rem', color: '#854d0e' }}>
                        💡 <strong>Mục đích:</strong> Tránh gán BU sai khi từ khóa ngắn vô tình xuất hiện trong URL hoặc giữa chữ khác.
                        Ví dụ trước đây keyword "y" match chữ "y" trong link Facebook → Lead bị gán BU2 sai!
                    </div>
                </div>
            </div>

            {/* BU Keyword Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    🏷️ BẢNG TỪ KHÓA TỪNG BU
                </h2>
                <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Hệ thống kiểm tra cả <strong>Quốc gia (countries)</strong> và <strong>Từ khóa mở rộng (keywords)</strong> của từng BU.
                    Quản lý có thể cập nhật từ khóa trong mục <strong>Cài đặt → Nhóm BU</strong>.
                </p>

                {bus.map(bu => {
                    const color = buColors[bu.id] || { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', icon: '📦' };
                    return (
                        <div key={bu.id} style={{ 
                            marginBottom: '16px', 
                            border: `2px solid ${color.border}`, 
                            borderRadius: '12px', 
                            overflow: 'hidden' 
                        }}>
                            <div style={{ 
                                background: color.bg, 
                                padding: '12px 20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                borderBottom: `1px solid ${color.border}`
                            }}>
                                <span style={{ fontSize: '24px' }}>{color.icon}</span>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: color.text }}>{bu.id} — {bu.label}</span>
                                {bu.description && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({bu.description})</span>}
                            </div>
                            <div style={{ padding: '16px 20px' }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '8px' }}>
                                        🌐 Quốc gia / Tuyến ({(bu.countries || []).length}):
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {(bu.countries || []).map((c, i) => (
                                            <span key={i} style={{ 
                                                background: color.bg, 
                                                color: color.text, 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.82rem', 
                                                fontWeight: 600,
                                                border: `1px solid ${color.border}`
                                            }}>{c}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', display: 'block', marginBottom: '8px' }}>
                                        🔑 Từ khóa mở rộng ({(bu.keywords || []).length}):
                                    </span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {(bu.keywords || []).length > 0 ? (bu.keywords || []).map((k, i) => (
                                            <span key={i} style={{ 
                                                background: '#f8fafc', 
                                                color: '#475569', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.82rem', 
                                                fontWeight: 500,
                                                border: '1px solid #e2e8f0'
                                            }}>{k}</span>
                                        )) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Chưa có từ khóa mở rộng</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Examples */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    💡 VÍ DỤ MINH HỌA
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left', width: '45%' }}>Tin nhắn khách</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left', width: '25%' }}>Keyword matched</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center', width: '15%' }}>BU</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center', width: '15%' }}>Kết quả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { msg: 'Em muốn đi tour Đài Loan', kw: 'Đài Loan', bu: 'BU1', ok: true },
                                { msg: 'Cho hỏi giá tour Nhật Bản 5N4D', kw: 'Nhật Bản', bu: 'BU2', ok: true },
                                { msg: 'Mình xin giá tour Seoul tháng 6', kw: 'seoul', bu: 'BU2', ok: true },
                                { msg: 'Công ty cần team building 50 người', kw: 'team building', bu: 'BU3', ok: true },
                                { msg: 'Tour Bali giá bao nhiêu?', kw: 'bali', bu: 'BU4', ok: true },
                                { msg: 'Mình xin giá tour ạ', kw: '—', bu: '—', ok: false },
                                { msg: 'Giá tour bao nhiêu?', kw: '—', bu: '—', ok: false },
                            ].map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontStyle: 'italic' }}>"{row.msg}"</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 600, color: row.ok ? '#059669' : '#94a3b8' }}>{row.kw}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', fontWeight: 700, color: row.ok ? '#1d4ed8' : '#94a3b8' }}>{row.bu}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>
                                        {row.ok ? (
                                            <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>✅ Auto</span>
                                        ) : (
                                            <span style={{ background: '#fef2f2', color: '#991b1b', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>⚠ Tay</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>📝 Lưu ý quan trọng:</p>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#78350f' }}>
                    <li>Từ khóa có thể được quản lý trong <strong>Cài đặt → Nhóm BU → Chỉnh sửa</strong></li>
                    <li>Hệ thống ghi log khi match/không match → Kiểm tra trong Server Log với prefix <code style={{ background: '#fde68a', padding: '2px 6px', borderRadius: '4px' }}>[BU-AUTO]</code></li>
                    <li>Áp dụng từ ngày <strong>07/04/2026</strong> cho Lead mới từ Messenger</li>
                </ul>
            </div>
        </div>
    );
};

export default BURulesTab;
