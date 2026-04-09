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
                        <li><strong>Ưu tiên theo Sort Order:</strong> BU nào có sort_order nhỏ hơn sẽ được kiểm tra trước (cài đặt trong Nhóm BU)</li>
                        <li><strong>So khớp không phân biệt dấu:</strong> "nhật bản" = "Nhật Bản" = "NHAT BAN"</li>
                        <li><strong>Quét CẢ tin khách + tin Page:</strong> Tin Page tư vấn tour cũng được scan → càng chính xác hơn</li>
                        <li><strong>Lọc greeting tự động:</strong> Tin chào mừng khi comment (<em>"FIT xin chào... lịch trình... SDT"</em>) bị <strong>bỏ qua</strong></li>
                        <li><strong>Chỉ áp dụng cho Lead MỚI:</strong> Nếu nhân viên đã chọn BU thì hệ thống <strong>không ghi đè</strong></li>
                        <li><strong>Không match:</strong> Lead vẫn tạo bình thường, BU = trống (nhân viên chọn tay)</li>
                    </ul>
                </div>

                <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #eab308', marginBottom: '16px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#a16207' }}>🔤 Cách so khớp từ khóa (Cập nhật 09/04/2026):</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#334155' }}>
                        <li>
                            <strong>TẤT CẢ từ khóa</strong> đều phải <strong>đứng riêng như 1 từ</strong> (word boundary), không nằm giữa từ khác
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                VD: Keyword "nhat ban" → match "tour <strong>Nhật Bản</strong> 5N4D" ✅ — nhưng KHÔNG match "sớm nhất nhé" ❌
                            </div>
                        </li>
                        <li style={{ marginTop: '8px' }}>
                            <strong>Stopwords tiếng Việt:</strong> Các từ phổ biến bị trùng sau khi bỏ dấu sẽ bị <strong>loại bỏ tự động</strong>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                {['nhất→nhat', 'nhắn→nhan', 'lại→lai', 'chị→chi', 'giá→gia', 'ăn→an'].map((w, i) => (
                                    <span key={i} style={{ background: '#fecaca', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem' }}>🚫 {w}</span>
                                ))}
                            </div>
                        </li>
                    </ul>
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef9c3', borderRadius: '6px', fontSize: '0.82rem', color: '#854d0e' }}>
                        💡 <strong>Lý do cập nhật:</strong> Trước đây tin auto-reply "sớm <strong>nhất</strong> nhé" bị bỏ dấu thành "nhat" → match keyword "nhật" (Nhật Bản) → Lead bị gán <strong>BU2 sai</strong>!
                        Giờ đã fix: chỉ scan tin khách + word boundary + stopwords.
                    </div>
                </div>
            </div>

            {/* Highlight: Lead creation flow */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', border: '2px solid #8b5cf6' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#6d28d9' }}>
                    🔄 LUỒNG TẠO LEAD TỪ MESSENGER
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #86efac' }}>
                        <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '8px', fontSize: '0.95rem' }}>✅ TẠO LEAD MỚI khi:</div>
                        <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.8', color: '#334155', fontSize: '0.85rem' }}>
                            <li>Khách <strong>lần đầu</strong> nhắn tin Messenger</li>
                            <li>Khách cũ nhắn lại nhưng Lead trước đã <strong>"Chốt đơn"</strong> hoặc <strong>"Thất bại"</strong></li>
                            <li>→ Mỗi lần quay lại = 1 <strong>deal mới</strong> (chuẩn CRM)</li>
                        </ul>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '10px', border: '1px solid #93c5fd' }}>
                        <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: '8px', fontSize: '0.95rem' }}>🔁 CHỈ CẬP NHẬT khi:</div>
                        <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: '1.8', color: '#334155', fontSize: '0.85rem' }}>
                            <li>Khách nhắn tiếp nhưng Lead <strong>vẫn đang Active</strong> (Mới, Đang tư vấn...)</li>
                            <li>→ Không tạo Lead trùng, chỉ đẩy <strong>lên đầu</strong> danh sách</li>
                            <li>→ Nếu là khách cũ (customers) thì tự nối <strong>customer_id</strong></li>
                        </ul>
                    </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '10px', border: '2px dashed #f87171' }}>
                    <div style={{ fontWeight: 800, color: '#b91c1c', marginBottom: '8px', fontSize: '0.95rem' }}>
                        ⚠️ LƯU Ý QUAN TRỌNG: Tin chào mừng khi Comment
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.8' }}>
                        <p style={{ margin: '0 0 8px 0' }}>
                            Khi khách <strong>comment bài viết</strong> trên Fanpage, Facebook tự động gửi tin nhắn chào mừng qua Messenger:
                        </p>
                        <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f97316', fontStyle: 'italic', fontSize: '0.82rem', color: '#9a3412', marginBottom: '8px' }}>
                            "FIT xin chào chị <strong>[Tên Khách]</strong> ạ, team FIT sẽ gửi thông tin <strong>lịch trình</strong> cho mình trong thời gian sớm nhất nhé..."
                        </div>
                        <p style={{ margin: 0 }}>
                            → Tin nhắn này <strong>bị lọc bỏ</strong> khi classify BU vì chứa từ phổ biến gây nhầm (nhất→nhật, lại→lai...).
                            <br/>→ Nhưng <strong>vẫn tạo Lead bình thường</strong> — chỉ là BU chưa được gán (nhân viên chọn tay hoặc đợi tin nhắn tiếp theo).
                        </p>
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
                                { msg: '(Auto-reply) Sớm nhất nhé', kw: '⛔ nhat=nhất', bu: '—', ok: false, isFixed: true },
                                { msg: '(Auto-reply) Để lại SĐT nhắn lại', kw: '⛔ lai=lại', bu: '—', ok: false, isFixed: true },
                            ].map((row, i) => (
                                <tr key={i} style={{ background: row.isFixed ? '#fef2f2' : (i % 2 === 0 ? 'white' : '#fafafa') }}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontStyle: 'italic' }}>"{row.msg}"</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 600, color: row.isFixed ? '#dc2626' : (row.ok ? '#059669' : '#94a3b8') }}>{row.kw}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', fontWeight: 700, color: row.ok ? '#1d4ed8' : '#94a3b8' }}>{row.bu}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>
                                        {row.isFixed ? (
                                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>🛡 Đã chặn</span>
                                        ) : row.ok ? (
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
                    <li>Phiên bản v1: <strong>07/04/2026</strong> — v2 (word boundary + stopwords): <strong>09/04/2026</strong> — v3 (scan cả Page + lọc greeting): <strong>09/04/2026</strong></li>
                    <li>Tin chào mừng tự động <em>("FIT xin chào... lịch trình...")</em> bị lọc bỏ — Tin Page tư vấn tour vẫn được scan</li>
                </ul>
            </div>
        </div>
    );
};

export default BURulesTab;
