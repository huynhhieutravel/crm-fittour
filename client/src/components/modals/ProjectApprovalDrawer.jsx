import React from 'react';
import { X, Printer, CheckCircle2, Circle, Link as LinkIcon, Edit3 } from 'lucide-react';

// The same checklists used in ProjectExecutionDrawer for mapping data
const chkTab1_discovery = [
    {
        group: '5. Yêu cầu đặc thù & Tư vấn sơ bộ',
        items: [
            { id: 'req_1', label: 'Mục tiêu chuyến đi', hasDoubleNote: true },
            { id: 'req_2', label: 'Đối tượng khách (Gia đình / Nhân viên / Khách VIP)', hasDoubleNote: true },
            { id: 'req_3', label: 'Khẩu phần ăn', hasDoubleNote: true },
            { id: 'req_4', label: 'Lưu trú', hasDoubleNote: true },
            { id: 'req_5', label: 'Gala Dinner', hasDoubleNote: true },
            { id: 'req_6', label: 'Teambuilding', hasDoubleNote: true },
            { id: 'req_7', label: 'Yếu tố check-in / Chụp ảnh', hasDoubleNote: true },
            { id: 'req_8', label: 'Yếu tố sức khoẻ', hasDoubleNote: true },
            { id: 'req_9', label: 'Khác', hasDoubleNote: true }
        ]
    },
    {
        group: 'Bước 4. Chốt thời gian phản hồi chương trình',
        items: [
            { id: 'c4_date', label: 'Ngày giờ phản hồi dự kiến:', isDateInput: true },
            { id: 'c4_1', label: 'Thống nhất thời điểm gửi chương trình dự kiến.' },
            { id: 'c4_2', label: 'Cam kết thời gian phản hồi: tối đa 48 giờ kể từ lúc đủ thông tin đầu vào.' }
        ]
    }
];

const chkTab2_init = [
    {
        group: '(1) Chuẩn nội dung',
        items: [
            { id: 'c1_1', label: 'Không lỗi chính tả, trình bày rõ, logic.' },
            { id: 'c1_2', label: 'Lộ trình di chuyển hợp lý, thời lượng di chuyển phù hợp.' }
        ]
    },
    {
        groupId: 'group_2',
        group: '(2) Chuẩn trải nghiệm & chất lượng điểm',
        hasGroupNote: true,
        items: [
            { id: 'c2_1', label: 'Hạn chế điểm mua sắm; nếu có, phải hợp lý hoặc thay bằng điểm chất lượng.' },
            { id: 'c2_2', label: 'Ưu tiên điểm dừng có nhà vệ sinh sạch sẽ.' },
            { id: 'c2_3', label: 'Nhà hàng ăn trưa: ưu tiên có máy lạnh hoặc không gian đẹp/view biển, đảm bảo tiêu chuẩn vệ sinh – an toàn thực phẩm và giấy phép liên quan.' },
            { id: 'c2_4', label: 'Gala dinner: set up chuẩn, không gian riêng; tối thiểu gồm 01 đơn vị bia (theo đoàn).' },
            { id: 'c2_5', label: 'MC và khối HDV chuyên nghiệp, bài bản.' }
        ]
    },
    {
        groupId: 'group_3',
        group: '(3) Chuẩn lưu trú & vận chuyển cơ bản',
        hasGroupNote: true,
        items: [
            { id: 'c3_1', label: 'Resort/khách sạn nội địa: từ 4 sao trở lên.' },
            { id: 'c3_2', label: 'Ưu tiên vị trí trung tâm hoặc các vị trí “đặc biệt” theo tính chất đoàn.' },
            { id: 'c3_3', label: 'Xe di chuyển: ưu tiên đời 2023–2025, hoặc tối thiểu 2020.' },
            { id: 'c3_4', label: 'Số lượng khách tối đa 90% chỗ ngồi đáp ứng cơ bản của phương tiện.' }
        ]
    }
];

const chkTab3_event = [
    {
        groupId: 'group_4',
        group: '(4) Teambuilding/Event – checklist tối thiểu',
        hasGroupNote: true,
        items: [
            { id: 'c4_1', label: 'Cờ phướn, cổng phao.' },
            { id: 'c4_2', label: 'Media quay/chụp/flycam.' },
            { id: 'c4_3', label: 'Nhân sự event tối thiểu 02 người trở lên, cho đoàn từ 40 khách (có thể dùng nhân sự tại điểm tuỳ tính chất & số lượng).' }
        ]
    },
    {
        groupId: 'group_5',
        group: '(5) Gói thiết kế tối thiểu',
        hasGroupDriveLink: true,
        items: [
            { id: 'c5_1', label: '01 bandroll chụp ảnh tập thể.' },
            { id: 'c5_2', label: '01 backdrop teambuilding đóng khung tại bãi biển.' },
            { id: 'c5_3', label: '01 backdrop hoặc màn hình LED gala dinner.' },
            { id: 'c5_4', label: '01 backdrop chụp ảnh tại sảnh nhà hàng gala bao gồm thảm đỏ, hoặc photobooth thiết kế phối hộp.' },
            { id: 'c5_5', label: 'Bộ hashtag cầm tay từ 04 cái trở lên/đoàn.' }
        ]
    }
];

export default function ProjectApprovalDrawer({ formData, setFormData, onClose, currentUser, project }) {
    const process = formData.metadata?.sales_process || {};
    const step3 = process.step_3_discovery || {};
    const step5p = process.step_5_proposal || {};
    const step5e = process.step_5_event || {};

    const handlePrint = () => {
        window.print();
    };

    // Render helper for checklists
    const renderChecklist = (groups, processData) => {
        if (!processData) return null;
        return (
            <div className="print-checklist">
                {groups.map((g, idx) => {
                    return (
                        <div key={idx} style={{ marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#1e293b' }}>{g.group}</h5>
                            <div style={{ paddingLeft: '8px' }}>
                                {g.items.map(item => {
                                    if (item.isDateInput) {
                                        const val = processData?.notes?.[item.id];
                                        return val ? (
                                            <div key={item.id} style={{ marginBottom: '6px', fontSize: '0.8rem', color: '#334155' }}>
                                                <strong>{item.label}</strong> {val}
                                            </div>
                                        ) : null;
                                    }
                                    const checked = processData?.checklists?.[item.id];
                                    if (!checked) return null;
                                    
                                    return (
                                        <div key={item.id} style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                                <CheckCircle2 size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.8rem', color: '#1e293b' }}>{item.label}</span>
                                            </div>
                                            
                                            {item.hasDoubleNote && (
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', paddingLeft: '20px' }}>
                                                    <div style={{ flex: 1, background: '#ffedd5', padding: '6px', borderRadius: '4px', borderLeft: '2px solid #f97316' }}>
                                                        <strong style={{ fontSize: '0.7rem', color: '#c2410c', display: 'block', marginBottom: '2px' }}>KHÁCH YÊU CẦU:</strong>
                                                        <div style={{ fontSize: '0.75rem', color: '#431407', whiteSpace: 'pre-wrap' }}>
                                                            {processData?.notes?.[item.id + '_req'] || 'Không có ghi chú'}
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, background: '#e0f2fe', padding: '6px', borderRadius: '4px', borderLeft: '2px solid #0ea5e9' }}>
                                                        <strong style={{ fontSize: '0.7rem', color: '#0369a1', display: 'block', marginBottom: '2px' }}>SALES TƯ VẤN:</strong>
                                                        <div style={{ fontSize: '0.75rem', color: '#0c4a6e', whiteSpace: 'pre-wrap' }}>
                                                            {processData?.notes?.[item.id + '_adv'] || 'Không có tư vấn'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                
                                {g.hasGroupNote && processData?.notes?.[g.groupId + '_note'] && (
                                    <div style={{ marginTop: '8px', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                        <strong style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>Ghi chú chung:</strong>
                                        <div style={{ fontSize: '0.8rem', color: '#334155', whiteSpace: 'pre-wrap', marginTop: '2px' }}>
                                            {processData?.notes?.[g.groupId + '_note']}
                                        </div>
                                    </div>
                                )}
                                {g.hasGroupDriveLink && processData?.notes?.[g.groupId + '_drive'] && (
                                    <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <LinkIcon size={14} color="#16a34a" />
                                        <a href={processData?.notes?.[g.groupId + '_drive']} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#16a34a', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                            {processData?.notes?.[g.groupId + '_drive']}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    };


    return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 10005, display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '2rem 1rem' }}>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .a4-print-container, .a4-print-container * {
                        visibility: visible;
                    }
                    .a4-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .only-print {
                        display: block !important;
                    }
                    .drawer-overlay {
                        background: white !important;
                        position: static;
                        padding: 0;
                        display: block;
                    }
                }
                .only-print {
                    display: none;
                }
                `}
            </style>

            <div style={{ display: 'flex', gap: '30px', width: '100%', maxWidth: '1200px', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div className="a4-print-container" style={{ width: '800px', background: '#ffffff', minHeight: '1122px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', padding: '40px 50px', position: 'relative', flexShrink: 0 }}>
                    
                    {/* Print & Close Buttons */}
                    <div className="no-print" style={{ position: 'absolute', top: '20px', left: '-60px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={onClose} style={{ background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} title="Đóng">
                            <X size={20} color="#475569" />
                        </button>
                        <button onClick={handlePrint} style={{ background: '#2563eb', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} title="In văn bản">
                            <Printer size={20} color="white" />
                        </button>
                    </div>

                    {/* Header */}
                    <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: 800, letterSpacing: '1px' }}>FIT TOUR</h1>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>HỒ SƠ YÊU CẦU & TRIỂN KHAI DỰ ÁN</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '2px' }}>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#475569' }}>Mã dự án: <strong>{project?._id?.substring(0,6).toUpperCase() || 'N/A'}</strong></div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>Dự án: {formData.name}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                            <div><strong style={{ color: '#475569' }}>Khách hàng:</strong> {project?.company_name || project?.leader_name || 'Khách Lẻ'}</div>
                            <div><strong style={{ color: '#475569' }}>Sales phụ trách:</strong> {project?.company_assigned_name || project?.assigned_name || 'Chưa rõ'}</div>
                            <div><strong style={{ color: '#475569' }}>Điểm đến:</strong> {formData.destination || 'Chưa cập nhật'}</div>
                            <div><strong style={{ color: '#475569' }}>Số lượng:</strong> {formData.expected_pax ? `${formData.expected_pax} pax` : 'Chưa cập nhật'}</div>
                            <div><strong style={{ color: '#475569' }}>Thời gian:</strong> {formData.departure_date ? `${new Date(formData.departure_date).toLocaleDateString('vi-VN')}` : 'Chưa cập nhật'} {formData.return_date ? `- ${new Date(formData.return_date).toLocaleDateString('vi-VN')}` : ''}</div>
                            <div><strong style={{ color: '#475569' }}>Ngân sách:</strong> {formData.total_revenue ? `${new Intl.NumberFormat('vi-VN').format(formData.total_revenue)} đ` : 'Chưa cập nhật'}</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px' }}>PHẦN 1. YÊU CẦU ĐẶC THÙ & TƯ VẤN SƠ BỘ</h3>
                        {renderChecklist(chkTab1_discovery, step3)}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px' }}>PHẦN 2. TIÊU CHUẨN NỘI DUNG & TRẢI NGHIỆM</h3>
                        {renderChecklist(chkTab2_init, step5p)}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '10px' }}>PHẦN 3. EVENT & PROPOSAL</h3>
                        {renderChecklist(chkTab3_event, step5e)}
                        
                        {step5p.link_drive && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                <strong style={{ display: 'block', color: '#166534', marginBottom: '2px', fontSize: '0.75rem' }}>Link Drive Proposal / Báo giá chung:</strong>
                                <a href={step5p.link_drive} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', wordBreak: 'break-all', fontSize: '0.75rem' }}>{step5p.link_drive}</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

