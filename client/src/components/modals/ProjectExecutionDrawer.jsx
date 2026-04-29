import React, { useState } from 'react';
import { X, Save, CheckCircle2, Circle, Link as LinkIcon, FileText, CheckSquare, Calendar, DollarSign, Users, UserCheck, AlertTriangle, Clock, Award } from 'lucide-react';
import Select from 'react-select';

const InstructionBox = ({ title, children, type = 'info' }) => {
    const bg = type === 'warning' ? '#fffbeb' : '#eff6ff';
    const border = type === 'warning' ? '#fde68a' : '#bfdbfe';
    const color = type === 'warning' ? '#b45309' : '#1e3a8a';
    return (
        <div style={{ background: bg, padding: '16px', borderRadius: '8px', border: `1px solid ${border}`, marginBottom: '16px' }}>
            {title && <h5 style={{ margin: '0 0 8px 0', color: color, fontSize: '0.9rem' }}>{type === 'warning' ? '⚠️' : 'ℹ️'} {title}</h5>}
            <div style={{ fontSize: '0.85rem', color: color, lineHeight: '1.6' }}>
                {children}
            </div>
        </div>
    )
};

const StepCard = ({ id, title, icon: Icon, children, process, isViewOnly, toggleStep }) => {
    const isChecked = process[id]?.checked;
    return (
        <div style={{ 
            background: isChecked ? '#f0fdf4' : 'white', 
            border: isChecked ? '1px solid #86efac' : '1px solid #e2e8f0', 
            borderRadius: '12px', padding: '20px', marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', cursor: isViewOnly ? 'default' : 'pointer' }} onClick={() => toggleStep(id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: isChecked ? '#10b981' : '#f1f5f9', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                        <Icon size={20} color={isChecked ? 'white' : '#64748b'} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isChecked ? '#065f46' : '#1e293b' }}>{title}</h4>
                </div>
                <div>
                    {isChecked ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                </div>
            </div>
            <div style={{ borderTop: isChecked ? '1px solid #bbf7d0' : '1px solid #f1f5f9', paddingTop: '16px' }}>
                {children}
            </div>
        </div>
    );
};

const SOPChecklist = ({ groups, processKey, process, isViewOnly, updateStep }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
            {groups.map((group, gIdx) => {
                const totalItems = group.items.length;
                const checkedItems = group.items.filter(item => process[processKey]?.checklists?.[item.id]).length;
                const isAllChecked = checkedItems === totalItems;

                return (
                    <div key={gIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h5 style={{ margin: 0, color: '#1e293b', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isAllChecked ? <CheckCircle2 size={16} color="#10b981" /> : <Circle size={16} color="#94a3b8" />}
                                {group.group}
                            </h5>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: isAllChecked ? '#d1fae5' : '#e2e8f0', color: isAllChecked ? '#059669' : '#64748b' }}>
                                {checkedItems}/{totalItems}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.items.map(item => {
                            if (item.isDateInput) {
                                return (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', minWidth: '180px' }}>
                                            <Calendar size={18} color="#3b82f6" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                                        </div>
                                        <input 
                                            type="datetime-local" 
                                            value={process[processKey]?.notes?.[item.id] || ''}
                                            onChange={(e) => {
                                                const newNotes = { ...(process[processKey]?.notes || {}), [item.id]: e.target.value };
                                                updateStep(processKey, { notes: newNotes });
                                            }}
                                            disabled={isViewOnly}
                                            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', color: '#1e293b', cursor: isViewOnly ? 'default' : 'pointer' }}
                                        />
                                    </div>
                                )
                            }
                            const checked = process[processKey]?.checklists?.[item.id] || false;
                            const noteValue = process[processKey]?.notes?.[item.id] || '';
                            return (
                                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: isViewOnly ? 'default' : 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={checked}
                                            disabled={isViewOnly}
                                            onChange={(e) => {
                                                const newChecklists = { ...(process[processKey]?.checklists || {}), [item.id]: e.target.checked };
                                                updateStep(processKey, { checklists: newChecklists });
                                            }}
                                            style={{ marginTop: '4px', width: '16px', height: '16px', cursor: isViewOnly ? 'default' : 'pointer', flexShrink: 0 }}
                                        />
                                        <span style={{ fontSize: '0.85rem', lineHeight: '1.5', color: checked ? '#64748b' : '#334155', textDecoration: 'none' }}>
                                            {item.label}
                                        </span>
                                    </label>
                                    {item.hasNote && checked && !item.hasDoubleNote && (
                                        <textarea 
                                            value={noteValue}
                                            onChange={(e) => {
                                                const newNotes = { ...(process[processKey]?.notes || {}), [item.id]: e.target.value };
                                                updateStep(processKey, { notes: newNotes });
                                            }}
                                            placeholder={item.notePlaceholder || "Ghi chú chi tiết..."}
                                            disabled={isViewOnly}
                                            style={{ marginLeft: '26px', padding: '8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                                        />
                                    )}
                                    {item.hasDoubleNote && checked && (
                                        <div style={{ display: 'flex', gap: '12px', marginLeft: '26px', marginTop: '4px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c2410c', marginBottom: '4px', display: 'block' }}>Khách yêu cầu gì?</label>
                                                <textarea 
                                                    value={process[processKey]?.notes?.[item.id + '_req'] || ''}
                                                    onChange={(e) => {
                                                        const newNotes = { ...(process[processKey]?.notes || {}), [item.id + '_req']: e.target.value };
                                                        updateStep(processKey, { notes: newNotes });
                                                    }}
                                                    placeholder="Ghi nhận yêu cầu..."
                                                    disabled={isViewOnly}
                                                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #fdba74', background: '#ffedd5', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '4px', display: 'block' }}>Sales tư vấn / Hướng đi</label>
                                                <textarea 
                                                    value={process[processKey]?.notes?.[item.id + '_adv'] || ''}
                                                    onChange={(e) => {
                                                        const newNotes = { ...(process[processKey]?.notes || {}), [item.id + '_adv']: e.target.value };
                                                        updateStep(processKey, { notes: newNotes });
                                                    }}
                                                    placeholder="Hướng xử lý, đề xuất..."
                                                    disabled={isViewOnly}
                                                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #7dd3fc', background: '#e0f2fe', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        </div>
                        {group.hasGroupNote && (
                            <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Ghi chú / Thông tin bổ sung cho phần này:</label>
                                <textarea 
                                    value={process[processKey]?.notes?.[group.groupId + '_note'] || ''}
                                    onChange={(e) => {
                                        const newNotes = { ...(process[processKey]?.notes || {}), [group.groupId + '_note']: e.target.value };
                                        updateStep(processKey, { notes: newNotes });
                                    }}
                                    placeholder="Điền thông tin này nọ nếu cần..."
                                    disabled={isViewOnly}
                                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                                />
                            </div>
                        )}
                        {group.hasGroupDriveLink && (
                            <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <LinkIcon size={14}/> Link Drive ấn phẩm cho phần này
                                </label>
                                <input 
                                    type="text"
                                    value={process[processKey]?.notes?.[group.groupId + '_drive'] || ''}
                                    onChange={(e) => {
                                        const newNotes = { ...(process[processKey]?.notes || {}), [group.groupId + '_drive']: e.target.value };
                                        updateStep(processKey, { notes: newNotes });
                                    }}
                                    placeholder="Dán link Google Drive vào đây..."
                                    disabled={isViewOnly}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
};

export default function ProjectExecutionDrawer({ formData, setFormData, onClose, isViewOnly }) {
    // The sales_process object from formData.metadata
    const process = formData.metadata?.sales_process || {};

    const updateStep = (stepId, data) => {
        if (isViewOnly) return;
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                sales_process: {
                    ...(prev.metadata?.sales_process || {}),
                    [stepId]: { 
                        ...(prev.metadata?.sales_process?.[stepId] || {}), 
                        ...data, 
                        updated_at: new Date().toISOString() 
                    }
                }
            }
        }));
    };

    const toggleStep = (stepId) => {
        if (isViewOnly) return;
        const currentChecked = process[stepId]?.checked;
        updateStep(stepId, { checked: !currentChecked });
    };

    const inputStyle = {
        padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', 
        fontSize: '0.9rem', width: '100%', outline: 'none', background: 'white'
    };

    const selectStyles = {
        control: (base) => ({ ...base, minHeight: '36px', borderRadius: '6px', borderColor: '#cbd5e1', boxShadow: 'none' })
    };

    const [activeTab, setActiveTab] = useState('tab_1_discovery');

    const TABS = [
        { id: 'tab_1_discovery', label: '1. Discovery & Needs', icon: Users },
        { id: 'tab_2_init', label: '2. Tiêu chuẩn Nội dung', icon: FileText },
        { id: 'tab_3_event', label: '3. Event & Proposal', icon: CheckSquare }
    ];

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

    const chkTab3_b8 = [
        {
            group: 'Bước 8. Chốt dịch vụ lần cuối (Critical Check)',
            items: [
                { id: 'c8_1', label: 'Sale và điều hành kiểm tra đồng loạt lần nữa toàn bộ dịch vụ: khách sạn, nhà hàng, xe, điểm, timing, kịch bản, media, nhân sự…' }
            ]
        }
    ];

    const chkTab3_b10 = [
        {
            group: 'Bước 10. Đi tour',
            items: [
                { id: 'c10_1', label: 'Nhân sự sale/điều hành đi theo tour phải thông báo và xin duyệt PGD trước khi xác nhận với khách.' }
            ]
        }
    ];

    const chkTab4_b12 = [
        {
            group: 'Bước 12. Gửi khách bản Final',
            items: [
                { id: 'c12_1', label: 'Bảng final gửi cho khách CC Kế toán trưởng và Leader.' }
            ]
        }
    ];

    return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 10001, display: 'flex', justifyContent: 'flex-end' }}>
            <div className="drawer-content" style={{ width: '100%', maxWidth: '100%', background: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', animation: 'slideInRight 0.3s' }}>
                
                <div style={{ padding: '1.25rem 2rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🚀 TIẾN ĐỘ THỰC THI DỰ ÁN (SOP)
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Dự án: <strong>{formData.name}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', borderRadius: '50%', padding: '8px', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* TABS BAR */}
                <div style={{ padding: '0 2rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 16px',
                                    background: isActive ? 'white' : 'transparent',
                                    border: 'none',
                                    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                    color: isActive ? '#3b82f6' : '#64748b',
                                    fontWeight: isActive ? 700 : 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={16} /> 
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    
                    {activeTab === 'tab_1_discovery' && (
                        <StepCard id="step_3_discovery" title="Bước 3 & Bước 4: Phân loại & Tiếp nhận nhu cầu" icon={Users} process={process} isViewOnly={isViewOnly} toggleStep={toggleStep}>
                            
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                <h5 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Circle size={16} color="#94a3b8" /> Bước 3. Tiếp nhận thông tin cơ bản bắt buộc
                                </h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>1. Số lượng khách (min/max)</label>
                                        <input type="text" style={inputStyle} value={process.step_3_discovery?.guest_count || ''} onChange={e => updateStep('step_3_discovery', { guest_count: e.target.value })} disabled={isViewOnly} placeholder="VD: 50 - 70 khách" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>2. Điểm đến mong muốn</label>
                                        <input type="text" style={inputStyle} value={process.step_3_discovery?.destination || ''} onChange={e => updateStep('step_3_discovery', { destination: e.target.value })} disabled={isViewOnly} placeholder="VD: Phú Quốc / Đà Nẵng" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>3. Thời gian dự kiến</label>
                                        <input type="text" style={inputStyle} value={process.step_3_discovery?.duration || ''} onChange={e => updateStep('step_3_discovery', { duration: e.target.value })} disabled={isViewOnly} placeholder="VD: Tháng 6 (3N2D)" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>4. Ngân sách dự kiến</label>
                                        <input type="text" style={inputStyle} value={process.step_3_discovery?.budget || ''} onChange={e => updateStep('step_3_discovery', { budget: e.target.value })} disabled={isViewOnly} placeholder="VD: 5tr/khách hoặc 300tr tổng" />
                                    </div>
                                </div>
                            </div>

                            <SOPChecklist groups={chkTab1_discovery} processKey="step_3_discovery" process={process} isViewOnly={isViewOnly} updateStep={updateStep} />
                        </StepCard>
                    )}

                    {activeTab === 'tab_2_init' && (
                        <>
                            <StepCard id="step_5_proposal" title="Bước 5. Xử lý thông tin – lên chương trình & chiết tính" icon={Users} process={process} isViewOnly={isViewOnly} toggleStep={toggleStep}>
                                <InstructionBox title="Làm việc với Điều hành để lấy giá & cấu hình dịch vụ">
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        <li><strong>Nội địa:</strong> Đức Mẫn (phân công) và Phạm Thụy</li>
                                        <li><strong>Châu Á/Châu Âu:</strong> Minh Tuấn (phân công) và Thái Hà</li>
                                        <li><strong>Trung Quốc/Tây Tạng:</strong> Trần Thịnh (phân công), Đông Hải, Minh Dũng</li>
                                        <li><strong>Pakistan/Bromo:</strong> Hồng Trang</li>
                                        <li><strong>Visa:</strong> Thanh Tâm, Tường Vi</li>
                                    </ul>
                                </InstructionBox>
                                
                                <h5 style={{ margin: '16px 0 12px 0', color: '#334155', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    ✅ Tiêu chuẩn kép khi lên chương trình (Bắt buộc)
                                </h5>
                                <SOPChecklist groups={chkTab2_init} processKey="step_5_proposal" process={process} isViewOnly={isViewOnly} updateStep={updateStep} />
                            </StepCard>
                        </>
                    )}

                    {activeTab === 'tab_3_event' && (
                        <>
                            <StepCard id="step_5_event" title="Bước 5 (Tiếp) - Teambuilding & Gói thiết kế" icon={FileText} process={process} isViewOnly={isViewOnly} toggleStep={toggleStep}>
                                <SOPChecklist groups={chkTab3_event} processKey="step_5_event" process={process} isViewOnly={isViewOnly} updateStep={updateStep} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <LinkIcon size={14}/> Link Drive Proposal / Báo giá
                                        </label>
                                        <input type="text" style={inputStyle} value={process.step_5_proposal?.link_drive || ''} onChange={e => updateStep('step_5_proposal', { link_drive: e.target.value })} disabled={isViewOnly} placeholder="Dán link thư mục Drive chứa file..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Ghi chú phản hồi của khách</label>
                                        <textarea style={{ ...inputStyle, height: '60px', resize: 'vertical' }} value={process.step_5_proposal?.note || ''} onChange={e => updateStep('step_5_proposal', { note: e.target.value })} disabled={isViewOnly} placeholder="Khách khen kịch bản, chê giá cao..."></textarea>
                                    </div>
                                </div>
                            </StepCard>
                        </>
                    )}
                </div>

                <div style={{ padding: '1.25rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button onClick={onClose} style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Đóng & Xác nhận lưu vào Form chính
                    </button>
                </div>
            </div>
        </div>
    );
}
