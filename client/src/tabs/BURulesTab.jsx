import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BURulesTab = ({ currentUser }) => {
    const [bus, setBus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

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

            {/* Sub-tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', gap: '0' }}>
                {[
                    { key: 'overview', label: '📋 Tổng quan & Ví dụ' },
                    ...(currentUser?.role === 'admin' ? [{ key: 'code-rules', label: '🖥️ Quy tắc Code (Chi tiết)' }] : []),
                ].map(tab => (
                    <button key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            background: 'none', border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                            padding: '12px 24px', fontSize: '15px', fontWeight: 600,
                            color: activeTab === tab.key ? '#3b82f6' : '#64748b',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >{tab.label}</button>
                ))}
            </div>

            {activeTab === 'overview' ? (<>
            {/* How it works */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                    📋 CÁCH HOẠT ĐỘNG
                </h2>
                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
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
                        <li><strong>Smart Matching v5 (2 lượt):</strong> So dấu chính xác trước, chỉ bỏ dấu khi khách gõ không dấu</li>
                        <li><strong>Quét CẢ tin khách + tin Page:</strong> Tin Page tư vấn tour cũng được scan → càng chính xác hơn</li>
                        <li><strong>Lọc greeting tự động:</strong> Tin chào mừng khi comment (<em>"FIT xin chào... lịch trình... SDT"</em>) bị <strong>bỏ qua</strong></li>
                        <li><strong>Chỉ áp dụng cho Lead MỚI:</strong> Nếu nhân viên đã chọn BU thì hệ thống <strong>không ghi đè</strong></li>
                        <li><strong>Không match:</strong> Lead vẫn tạo bình thường, BU = trống (nhân viên chọn tay)</li>
                    </ul>
                </div>

                <div style={{ backgroundColor: '#fefce8', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #eab308', marginBottom: '16px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#a16207' }}>🔤 Smart Matching v5 — So khớp thông minh (Cập nhật 13/04/2026):</p>
                    <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8', color: '#334155' }}>
                        <li>
                            <strong>Lượt 1 (Dấu chính xác):</strong> So keyword GỐC (có dấu) với tin nhắn GỐC
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                VD: Keyword “nhật” → match <strong>“tour nhật”</strong> ✅ | không match “sớm <strong>nhất</strong>” ❌ (nhất ≠ nhật)
                            </div>
                        </li>
                        <li style={{ marginTop: '8px' }}>
                            <strong>Lượt 2 (Không dấu — Fallback):</strong> Nếu lượt 1 fail → bỏ dấu keyword, NHƯNG chỉ chấp nhận nếu từ gốc <strong>KHÔNG có dấu</strong>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                                VD: “tour <strong>nhat</strong>” (khách gõ ko dấu) → match ✅ | “sớm <strong>nhất</strong>” (có dấu) → CHẶN ❌ (dấu khác từ)
                            </div>
                        </li>
                        <li style={{ marginTop: '8px' }}>
                            <strong>Stopwords (chỉ còn 1 ký tự):</strong> Chỉ chặn những từ cực ngắn không thể phân biệt
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                {['ý→y'].map((w, i) => (
                                    <span key={i} style={{ background: '#fecaca', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem' }}>🚫 {w}</span>
                                ))}
                                {['nhất≠nhật', 'nhắn≠nhân', 'lại≠lai'].map((w, i) => (
                                    <span key={i} style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.78rem' }}>✅ Smart Match xử lý</span>
                                ))}
                            </div>
                        </li>
                    </ul>
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.82rem', color: '#065f46', border: '1px solid #86efac' }}>
                        💡 <strong>Lý do cập nhật v5:</strong> Trước đây “nhất” bị bỏ dấu thành “nhat” → trùng “nhật” (Nhật Bản). Phải chặn luôn “nhat” trong Stopwords → mất luôn keyword “nhật” hợp lệ!
                        Giờ smart matching giữ dấu để so: <strong>nhất ≠ nhật</strong> → không cần Stopwords, keyword “nhật” vẫn hoạt động đầy đủ!
                    </div>
                </div>
            </div>

            {/* Highlight: Lead creation flow */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', border: '2px solid #8b5cf6' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#6d28d9' }}>
                    🔄 LUỒNG TẠO LEAD TỪ MESSENGER
                </h2>

                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
                                { msg: 'Khách "Ý Đặng Quốc" hỏi tour Trung Quốc', kw: '⛔ ý→y (tên người)', bu: '—→BU1', ok: false, isFixed: true },
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
                    <li>v1: <strong>07/04</strong> — v2 (stopwords): <strong>09/04</strong> — v3 (scan Page): <strong>09/04</strong> — v4 (chặn ý): <strong>13/04</strong> — v5 (Smart Match): <strong>13/04/2026</strong></li>
                    <li>Tin chào mừng tự động <em>("FIT xin chào... lịch trình...")</em> bị lọc bỏ — Tin Page tư vấn tour vẫn được scan</li>
                    <li><strong>v5:</strong> Smart Matching giữ dấu so trước → "nhất" ≠ "nhật". Không cần Stopwords cho "nhat" nữa, keyword "nhật" hoạt động đầy đủ!</li>
                </ul>
            </div>
            </>) : (
            /* ========== TAB 2: CODE RULES ========== */
            <div style={{ color: '#1e293b' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
                        🖥️ SOURCE CODE: classifyBUFromMessage()
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                        File: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>server/services/facebookService.js</code> — Hàm chính phân loại BU tự động
                    </p>

                    {/* Step-by-step code explanation — v5 */}
                    {[
                        {
                            step: 1,
                            title: 'Normalize + hasDiacritics helper',
                            code: `const normalize = (str) => str.toLowerCase()\n  .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')\n  .replace(/\\u0111/g, 'd');\n\nconst hasDiacritics = (str) =>\n  str.toLowerCase() !== normalize(str);\n// "nhật" → true (có dấu) | "nhat" → false (ko dấu)`,
                            explain: 'normalize() bỏ dấu tiếng Việt. hasDiacritics() kiểm tra từ gốc CÓ dấu hay không — đây là chìa khóa của Smart Matching v5.',
                            impact: '✅ "nhật" có dấu (true) | "nhat" không dấu (false) → dùng để phân biệt Lượt 1 vs Lượt 2',
                            color: '#dbeafe'
                        },
                        {
                            step: 2,
                            title: 'PASS 1: So keyword GỐC với tin nhắn GỐC (có dấu)',
                            code: `// Unicode-aware word boundary (không dùng \\b)\nconst regex = new RegExp(\n  '(?:^|[^\\\\p{L}\\\\p{N}])' + keyword + '(?:$|[^\\\\p{L}\\\\p{N}])',\n  'iu'  // i=case-insensitive, u=unicode\n);\nif (regex.test(' ' + message + ' ')) {\n  return bu.id;  // ✅ Match chính xác có dấu!\n}`,
                            explain: 'So TRỰC TIẾP keyword gốc (có dấu) với tin nhắn gốc. Dùng Unicode boundary [^\\p{L}] thay vì \\b để hỗ trợ tiếng Việt đầy đủ.',
                            impact: '🔑 Phân biệt dấu chính xác:\n• nhất ≠ nhật\n• ức ≠ úc\n• đoạn ≠ đoàn',
                            color: '#f0fdf4'
                        },
                        {
                            step: 3,
                            title: 'PASS 2: So bỏ dấu — CHỈ khi từ gốc KHÔNG có dấu',
                            code: `if (regexNorm.test(normalizedMsg)) {\n  // Strip dấu câu trước khi so\n  const words = msg.split(/\\s+/).map(w =>\n    w.replace(/[^a-zA-Z\\u00C0-\\u1EFF]/g, ''));\n  for (segment of words) {\n    if (normalize(segment) === normalizedKw\n        && !hasDiacritics(segment)) {\n      return bu.id; // ✅ Khách gõ không dấu\n    }\n  }\n  // Có dấu nhưng khác từ → CHẶN!\n}`,
                            explain: 'Nếu Lượt 1 fail → bỏ dấu để so. NHƯNG trước khi chấp nhận, kiểm tra từ gốc: nếu nó CÓ dấu (VD: "nhất") thì khác từ → CHẶN. Chỉ chấp nhận khi gốc KHÔNG dấu.',
                            impact: '✅ "tour nhat" → ko dấu → match\n⛔ "sớm nhất" → CÓ dấu, nhất≠nhật → CHẶN\n✅ "nhat!" → strip dấu câu → match',
                            color: '#fefce8'
                        },
                        {
                            step: 4,
                            title: 'Stopwords v5 (Chỉ còn từ cực ngắn)',
                            code: `const STOPWORDS = new Set([\n  'y',   // ý → y (1 ký tự, trùng tên người)\n  'cho', // cho\n  'ay',  // ấy\n  'an',  // ăn/an\n]);\n// "nhat" KHÔNG còn! Smart Match xử lý nhất≠nhật`,
                            explain: 'v5 giảm Stopwords từ 10+ xuống còn 4. Hầu hết đã được Smart Matching xử lý. Chỉ giữ từ quá ngắn (1-2 ký tự) không thể phân biệt.',
                            impact: '🎯 Trước: chặn "nhat" → MẤT keyword "nhật"\nSau v5: "nhật" hoạt động đầy đủ!',
                            color: '#fef2f2'
                        },
                        {
                            step: 5,
                            title: 'First-match wins + Server Log',
                            code: `// Dò BU theo sort_order ASC\nfor (bu of busResult.rows) {\n  for (keyword of bu.keywords) {\n    // Pass 1 → Pass 2 → next keyword\n  }\n}\nconsole.log('[BU-AUTO] ✅ Pass1 "nhật" -> BU2');\nconsole.log('[BU-AUTO] ⛔ Skip "nhật" - dấu khác');`,
                            explain: 'Keyword đầu tiên match → trả BU ngay. Mọi kết quả đều được log với prefix [BU-AUTO] để debug.',
                            impact: '📝 Kiểm tra Server Log khi cần debug:\n[BU-AUTO] ✅ Pass1 / Pass2 → match\n[BU-AUTO] ⛔ Skip → blocked',
                            color: '#ede9fe'
                        },
                    ].map(rule => (
                        <div key={rule.step} style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ background: rule.color, padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#1e293b', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>{rule.step}</span>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{rule.title}</span>
                            </div>
                            <div style={{ padding: '16px 20px' }}>
                                <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontSize: '0.82rem', lineHeight: '1.7', overflowX: 'auto', margin: '0 0 12px 0', fontFamily: '"Fira Code", "SF Mono", monospace', whiteSpace: 'pre-wrap' }}>{rule.code}</pre>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1d4ed8', marginBottom: '4px' }}>📖 GIẢI THÍCH</div>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>{rule.explain}</div>
                                    </div>
                                    <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#92400e', marginBottom: '4px' }}>⚠️ TÁC ĐỘNG / LƯU Ý</div>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{rule.impact}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Audit Results */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', border: '2px solid #10b981' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#065f46' }}>
                        🔬 KẾT QUẢ AUDIT TOÀN BỘ KEYWORD (13/04/2026)
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1fae5', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#ecfdf5' }}>
                            <tr>
                                <th style={{ border: '1px solid #d1fae5', padding: '10px', textAlign: 'left', width: '35%' }}>Tin nhắn test</th>
                                <th style={{ border: '1px solid #d1fae5', padding: '10px', textAlign: 'center', width: '15%' }}>Keyword</th>
                                <th style={{ border: '1px solid #d1fae5', padding: '10px', textAlign: 'center', width: '15%' }}>Kết quả</th>
                                <th style={{ border: '1px solid #d1fae5', padding: '10px', textAlign: 'left', width: '35%' }}>Giải thích</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { msg: 'tour nhật giá sao', kw: 'nhật', result: '✅ Pass1', note: 'Có dấu → match chính xác' },
                                { msg: 'sớm nhất nhé', kw: 'nhật', result: '⛔ Chặn', note: 'nhất ≠ nhật (dấu khác)' },
                                { msg: 'tour nhat', kw: 'nhật', result: '✅ Pass2', note: 'Ko dấu → fallback match' },
                                { msg: 'nhat!', kw: 'nhật', result: '✅ Pass2', note: 'Strip dấu câu → match' },
                                { msg: 'nhặt điện thoại', kw: 'nhật', result: '⛔ Chặn', note: 'nhặt ≠ nhật (dấu khác)' },
                                { msg: 'ức chế quá', kw: 'úc', result: '⛔ Chặn', note: 'ức ≠ úc (dấu khác)' },
                                { msg: 'tour uc.', kw: 'úc', result: '✅ Pass2', note: 'Strip dấu chấm → match' },
                                { msg: 'giai đoạn tiếp theo', kw: 'đoàn', result: '⛔ Chặn', note: 'đoạn ≠ đoàn (dấu khác)' },
                                { msg: 'mỹ phẩm giảm giá', kw: 'mỹ', result: '⚠️ Pass1', note: '"mỹ" đứng riêng → match (edge case nhẹ)' },
                                { msg: 'Georgia muốn đi tour', kw: 'georgia', result: '⚠️ Pass1', note: 'Tên người = tên nước (cần sale check)' },
                            ].map((row, i) => (
                                <tr key={i} style={{ background: row.result.includes('⛔') ? '#fef2f2' : row.result.includes('⚠') ? '#fffbeb' : (i % 2 === 0 ? 'white' : '#f0fdf4') }}>
                                    <td style={{ border: '1px solid #d1fae5', padding: '8px', fontStyle: 'italic', fontSize: '0.85rem' }}>{row.msg}</td>
                                    <td style={{ border: '1px solid #d1fae5', padding: '8px', textAlign: 'center', fontWeight: 600 }}>{row.kw}</td>
                                    <td style={{ border: '1px solid #d1fae5', padding: '8px', textAlign: 'center', fontWeight: 700, color: row.result.includes('✅') ? '#059669' : row.result.includes('⛔') ? '#dc2626' : '#d97706' }}>{row.result}</td>
                                    <td style={{ border: '1px solid #d1fae5', padding: '8px', fontSize: '0.85rem', color: '#475569' }}>{row.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#059669', fontWeight: 700 }}>✅</span> Match đúng</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#dc2626', fontWeight: 700 }}>⛔</span> Chặn đúng</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#d97706', fontWeight: 700 }}>⚠️</span> Edge case chấp nhận</span>
                    </div>
                </div>

                {/* Quick reference table */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>
                        📌 QUY TẮC NHANH (QUICK REFERENCE)
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left', width: '30%' }}>Quy tắc</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'left', width: '45%' }}>Chi tiết</th>
                                <th style={{ border: '1px solid #e2e8f0', padding: '12px', textAlign: 'center', width: '25%' }}>Ví dụ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { rule: 'Pass 1: Dấu chính xác', detail: 'So keyword gốc (có dấu) với tin nhắn gốc — Unicode boundary', ex: '"nhật" ✅ | "nhất" ❌' },
                                { rule: 'Pass 2: Không dấu (Fallback)', detail: 'Bỏ dấu keyword, CHỈ match nếu từ gốc KHÔNG có dấu', ex: '"nhat" ✅ | "nhất" ⛔' },
                                { rule: 'Strip dấu câu', detail: 'Pass 2 loại bỏ dấu câu (,.!?) gắn từ trước khi so', ex: '"nhat!" → "nhat" ✅' },
                                { rule: 'Stopwords (v5: chỉ 1 ký tự)', detail: 'Chỉ chặn: ý→y, cho, ấy→ay, ăn→an', ex: '"Ý Đặng Quốc" ⛔' },
                                { rule: 'First-match wins', detail: 'BU sort_order nhỏ dò trước, match → dừng ngay', ex: 'sort=0 dò trước sort=1' },
                                { rule: 'Lọc tin greeting', detail: 'Tin "FIT xin chào...lịch trình..." bị skip', ex: 'Auto-reply comment' },
                                { rule: 'Không ghi đè BU', detail: 'Nếu nhân viên đã chọn BU → hệ thống không thay đổi', ex: 'Manual override' },
                            ].map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', fontWeight: 600 }}>{row.rule}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px' }}>{row.detail}</td>
                                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>{row.ex}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bug history */}
                <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', border: '2px solid #fca5a5' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#991b1b' }}>
                        🐛 LỊCH SỬ BUG & FIX
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #fecaca', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#fee2e2' }}>
                            <tr>
                                <th style={{ border: '1px solid #fecaca', padding: '10px', textAlign: 'center', width: '12%' }}>Ngày</th>
                                <th style={{ border: '1px solid #fecaca', padding: '10px', textAlign: 'left', width: '30%' }}>Bug</th>
                                <th style={{ border: '1px solid #fecaca', padding: '10px', textAlign: 'left', width: '35%' }}>Nguyên nhân gốc</th>
                                <th style={{ border: '1px solid #fecaca', padding: '10px', textAlign: 'left', width: '23%' }}>Fix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { date: '07/04', bug: 'Keyword “nhật” match “sớm nhất nhé”', cause: 'Không có word boundary, substring match', fix: 'v1: Thêm regex \\b word boundary' },
                                { date: '09/04', bug: 'Auto-reply “nhắn lại sớm nhất” match BU2', cause: '“nhất” bỏ dấu = “nhat” trùng Nhật Bản', fix: 'v2: Thêm Stopwords, lọc greeting' },
                                { date: '09/04', bug: 'Lead không ghi nhận BU dù tin chứa keyword', cause: 'Chỉ scan tin khách, bỏ sót tin Page tư vấn', fix: 'v3: Scan cả tin Page (không phải greeting)' },
                                { date: '13/04', bug: 'Khách “Ý Đặng Quốc” bị gán BU2 (Italy)', cause: 'Keyword “ý” (1 ký tự) trùng tên khách', fix: 'v4: Xóa “ý” khỏi BU2, thêm “y” vào Stopwords' },
                                { date: '13/04', bug: 'Stopwords chặn "nhat" → mất keyword "nhật"', cause: '"nhất" và "nhật" bỏ dấu đều = "nhat"', fix: 'v5: Smart Matching giữ dấu, bỏ Stopwords' },
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #fecaca', padding: '10px', textAlign: 'center', fontWeight: 700 }}>{row.date}</td>
                                    <td style={{ border: '1px solid #fecaca', padding: '10px' }}>{row.bug}</td>
                                    <td style={{ border: '1px solid #fecaca', padding: '10px', color: '#991b1b' }}>{row.cause}</td>
                                    <td style={{ border: '1px solid #fecaca', padding: '10px', fontWeight: 600, color: '#15803d' }}>{row.fix}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
        </div>
    );
};

export default BURulesTab;
