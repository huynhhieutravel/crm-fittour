import React, { useMemo, useState } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    Handle,
    Position,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
    Users, PhoneCall, ShoppingCart, DollarSign, Briefcase, 
    HeartHandshake, Megaphone, FileText, CheckCircle, 
    Truck, Building, Compass, UserCheck, Star, LifeBuoy
} from 'lucide-react';

const CustomWorkflowNode = ({ data, selected }) => {
    let iconBg = '#334155';
    let iconColor = '#cbd5e1';
    let borderColor = selected ? '#6366f1' : '#334155';
    let glowColor = 'rgba(0,0,0,0)';
    
    // Role/Category colors
    if (data.category === 'marketing') {
        iconBg = '#ec4899'; // Pink
        iconColor = '#fce7f3';
        glowColor = 'rgba(236, 72, 153, 0.2)';
        borderColor = selected ? '#ec4899' : '#831843';
    } else if (data.category === 'sales') {
        iconBg = '#3b82f6'; // Blue
        iconColor = '#dbeafe';
        glowColor = 'rgba(59, 130, 246, 0.2)';
        borderColor = selected ? '#3b82f6' : '#1e3a8a';
    } else if (data.category === 'accounting') {
        iconBg = '#f59e0b'; // Amber
        iconColor = '#fffbeb';
        glowColor = 'rgba(245, 158, 11, 0.2)';
        borderColor = selected ? '#f59e0b' : '#78350f';
    } else if (data.category === 'ops') {
        iconBg = '#10b981'; // Green
        iconColor = '#d1fae5';
        glowColor = 'rgba(16, 185, 129, 0.2)';
        borderColor = selected ? '#10b981' : '#064e3b';
    } else if (data.category === 'cskh') {
        iconBg = '#ef4444'; // Red
        iconColor = '#fee2e2';
        glowColor = 'rgba(239, 68, 68, 0.2)';
        borderColor = selected ? '#ef4444' : '#7f1d1d';
    } else if (data.category === 'product') {
        iconBg = '#8b5cf6'; // Purple
        iconColor = '#ede9fe';
        glowColor = 'rgba(139, 92, 246, 0.2)';
        borderColor = selected ? '#8b5cf6' : '#4c1d95';
    }

    return (
        <div style={{
            background: '#151b23',
            border: `2px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '24px 20px',
            minWidth: '260px',
            boxShadow: selected ? `0 0 0 4px ${glowColor}` : `0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 0 20px 0 ${glowColor}`,
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: '#f8fafc',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: iconBg,
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px',
            }}></div>

            {/* Render conditional handles based on node config to allow multiple incoming/outgoing lines cleanly */}
            <Handle type="target" position={Position.Left} id="left" style={{ background: '#64748b', width: '12px', height: '12px', left: '-6px', border: 'none' }} />
            <Handle type="target" position={Position.Top} id="top" style={{ background: '#64748b', width: '12px', height: '12px', top: '-6px', border: 'none' }} />
            
            <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: iconBg,
                color: iconColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 14px 0 ${iconBg}80`,
                marginBottom: '4px'
            }}>
                {data.icon}
            </div>
            
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: iconBg, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    {data.role}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                    {data.label}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                    {data.description}
                </div>
            </div>

            {data.features && (
                <div style={{ marginTop: '12px', width: '100%', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {data.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            )}

            <Handle type="source" position={Position.Right} id="right" style={{ background: '#64748b', width: '12px', height: '12px', right: '-6px', border: 'none' }} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#64748b', width: '12px', height: '12px', bottom: '-6px', border: 'none' }} />
        </div>
    );
};

const defaultEdgeOpt = {
    animated: true,
    style: { strokeWidth: 3 },
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
};

const initialNodes = [
    {
        id: '1', type: 'custom', position: { x: 50, y: 350 },
        data: { 
            role: 'MARKETING / ĐỐI TÁC', label: 'NGUỒN KHÁCH', 
            description: 'Khách hàng tiềm năng đổ về hệ thống.',
            category: 'marketing', icon: <Megaphone size={28} />,
            features: ['Facebook Ads / Messenger', 'Zalo ZNS / OA', 'Khách giới thiệu', 'Đăng ký B2B']
        }
    },
    {
        id: '2', type: 'custom', position: { x: 500, y: 350 },
        data: { 
            role: 'SALES', label: 'QUẢN LÝ LEADS', 
            description: 'Tiếp nhận, phân loại và tư vấn theo kịch bản.',
            category: 'sales', icon: <Users size={28} />,
            features: ['Inbox tự động chia số', 'Đánh giá: Tiềm năng / Không', 'Ghi chú lịch sử tư vấn', 'Nhắc nhở công việc (Reminders)']
        }
    },
    {
        id: '3', type: 'custom', position: { x: 500, y: 750 },
        data: { 
            role: 'SALES', label: 'DOANH NGHIỆP (B2B)', 
            description: 'Tệp đối tác B2B, Trưởng đoàn, Đại lý.',
            category: 'sales', icon: <Building size={28} />,
            features: ['Quản lý công ty', 'Quản lý trưởng đoàn', 'Dự án Tour MICE']
        }
    },
    {
        id: '4', type: 'custom', position: { x: 500, y: -50 },
        data: { 
            role: 'MANAGER / ĐIỀU HÀNH', label: 'SẢN PHẨM TOUR', 
            description: 'Nơi Sales truy cập để check giá, lịch khởi hành.',
            category: 'product', icon: <Compass size={28} />,
            features: ['Tour Mẫu (Templates)', 'Lịch khởi hành (Departures)', 'Bảng giá linh hoạt (Lớn/Bé)']
        }
    },
    {
        id: '5', type: 'custom', position: { x: 950, y: 350 },
        data: { 
            role: 'SALES', label: 'CHỐT ĐƠN & BÁO GIÁ', 
            description: 'Xác nhận nhu cầu, gửi báo giá PDF và chốt deal.',
            category: 'sales', icon: <FileText size={28} />,
            features: ['Tạo báo giá nhanh', 'Chuyển Lead -> Chốt đơn', 'Yêu cầu xử lý hợp đồng']
        }
    },
    {
        id: '6', type: 'custom', position: { x: 1400, y: 350 },
        data: { 
            role: 'SALES', label: 'GIỮ CHỖ (BOOKING)', 
            description: 'Sau khi chốt, tạo Booking giữ chỗ trên Lịch khởi hành.',
            category: 'sales', icon: <ShoppingCart size={28} />,
            features: ['Chọn số lượng ghế', 'Nhập danh sách hành khách', 'Hồ sơ xin Visa', 'Xác định Deadline cọc']
        }
    },
    {
        id: '7', type: 'custom', position: { x: 1400, y: 750 },
        data: { 
            role: 'HỆ THỐNG', label: 'KHÁCH HÀNG (CRM)', 
            description: 'Khách hàng chính thức được lưu trữ bảo mật.',
            category: 'sales', icon: <UserCheck size={28} />,
            features: ['Lịch sử đi tour', 'Phân hạng mức VIP', 'Thông tin Passport/CCCD']
        }
    },
    {
        id: '8', type: 'custom', position: { x: 1850, y: 350 },
        data: { 
            role: 'KẾ TOÁN', label: 'THANH TOÁN (PAYMENT)', 
            description: 'Xử lý dòng tiền, xuất phiếu thu.',
            category: 'accounting', icon: <DollarSign size={28} />,
            features: ['Cọc lệnh (Deposit)', 'Thanh toán Full', 'Xuất/In Biên lai', 'Duyệt chuyển trạng thái Booking']
        }
    },
    {
        id: '14', type: 'custom', position: { x: 50, y: 750 },
        data: { 
            role: 'SALES', label: 'DỊCH VỤ HỖ TRỢ', 
            description: 'Nhập thông tin hỗ trợ ngay khi Khách thanh toán cho Tour.',
            category: 'sales', icon: <LifeBuoy size={28} />,
            features: ['Dịch vụ Visa', 'Bảo hiểm Du lịch', 'Sim/eSIM Quốc tế', 'Giấy tờ chứng minh tài chính']
        }
    },
    {
        id: '9', type: 'custom', position: { x: 2750, y: 350 },
        data: { 
            role: 'ĐIỀU HÀNH (OP)', label: 'QUẢN LÝ DỊCH VỤ OP', 
            description: 'Điều phối đặt dịch vụ với Nhà Cung Cấp cho đoàn.',
            category: 'ops', icon: <Briefcase size={28} />,
            features: ['Bàn giao Sales -> OP', 'Check số lượng thực tế', 'Đặt cọc Nhà cung cấp', 'Theo dõi lợi nhuận OpTours']
        }
    },
    {
        id: '10', type: 'custom', position: { x: 2750, y: -50 },
        data: { 
            role: 'NHÀ CUNG CẤP', label: 'KHO DỮ LIỆU NCC', 
            description: 'Danh sách và bảng giá NCC đối tác.',
            category: 'ops', icon: <Truck size={28} />,
            features: ['Khách sạn (Hotels)', 'Nhà hàng (Restaurants)', 'Nhà xe (Transports)', 'Vé tham quan / Hàng không']
        }
    },
    {
        id: '11', type: 'custom', position: { x: 2750, y: 750 },
        data: { 
            role: 'QUẢN LÝ', label: 'ĐIỀU PHỐI HDV', 
            description: 'Chỉ định HDV dẫn đoàn cho lịch trình này.',
            category: 'ops', icon: <Star size={28} />,
            features: ['Xếp lịch HDV (Timeline)', 'Đánh giá năng lực HDV', 'Tính phí công tác']
        }
    },
    {
        id: '12', type: 'custom', position: { x: 3200, y: 350 },
        data: { 
            role: 'HỆ THỐNG', label: 'THỰC HIỆN TOUR', 
            description: 'Đoàn bắt đầu khởi hành và kết thúc.',
            category: 'ops', icon: <CheckCircle size={28} />,
            features: ['Trạng thái: Đang chạy', 'Xử lý sự cố phát sinh', 'Quyết toán công nợ cuối tour']
        }
    },
    {
        id: '13', type: 'custom', position: { x: 3650, y: 350 },
        data: { 
            role: 'CSKH', label: 'CHĂM SÓC HẬU MÃI', 
            description: 'Giữ chân khách hàng và đánh giá chất lượng.',
            category: 'cskh', icon: <HeartHandshake size={28} />,
            features: ['Gọi điện hỏi thăm', 'Xử lý khiếu nại (CSKH Board)', 'Đánh giá điểm hài lòng', 'Upsell tour tiếp theo']
        }
    }
];

const initialEdges = [
    // Marketing -> Sales
    { id: 'e1-2', source: '1', target: '2', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#ec4899', strokeWidth: 3 } },
    
    // B2B -> Leads / Sales
    { id: 'e3-2', source: '3', target: '2', sourceHandle: 'top', targetHandle: 'bottom', ...defaultEdgeOpt, style: { stroke: '#3b82f6', strokeWidth: 3 }, label: 'Chuyển thành Khách đoàn', labelStyle: { fill: '#cbd5e1', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' } },
    
    // Sales referencing Products
    { id: 'e4-2', source: '4', target: '2', sourceHandle: 'bottom', targetHandle: 'top', ...defaultEdgeOpt, style: { stroke: '#8b5cf6', strokeWidth: 3 }, animated: false, label: 'Lấy báo giá / Lịch', labelStyle: { fill: '#cbd5e1', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' } },
    { id: 'e4-5', source: '4', target: '5', sourceHandle: 'right', targetHandle: 'top', ...defaultEdgeOpt, style: { stroke: '#8b5cf6', strokeWidth: 3 }, animated: false },

    // Lead -> Quotation -> Booking
    { id: 'e2-5', source: '2', target: '5', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#3b82f6', strokeWidth: 3 } },
    { id: 'e5-6', source: '5', target: '6', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#3b82f6', strokeWidth: 3 }, label: 'Chốt DEAL', labelStyle: { fill: '#3b82f6', fontWeight: 800, fontSize: '0.8rem' }, labelBgStyle: { fill: '#1e293b', border: '1px solid #3b82f6' } },

    // Booking -> Customer DB
    { id: 'e6-7', source: '6', target: '7', sourceHandle: 'bottom', targetHandle: 'top', ...defaultEdgeOpt, style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }, animated: false, label: 'Lưu rải tệp khách', labelStyle: { fill: '#cbd5e1', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' } },

    // Booking -> Payment 
    { id: 'e6-8', source: '6', target: '8', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#f59e0b', strokeWidth: 3 } },
    
    // Payment -> Dịch vụ hỗ trợ (Sales làm)
    { id: 'e8-14', source: '8', target: '14', sourceHandle: 'bottom', targetHandle: 'right', ...defaultEdgeOpt, style: { stroke: '#f59e0b', strokeWidth: 3 }, label: 'Đã Cọc -> Nhập hỗ trợ', labelStyle: { fill: '#3b82f6', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' }, type: 'step' },
    
    // Dịch vụ hỗ trợ -> Ops
    { id: 'e14-9', source: '14', target: '9', sourceHandle: 'top', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#10b981', strokeWidth: 3 }, label: 'Bàn giao Hồ sơ', labelStyle: { fill: '#10b981', fontWeight: 800 }, labelBgStyle: { fill: '#1e293b' }, type: 'step' },

    // Ops references NCC & Guide
    { id: 'e10-9', source: '10', target: '9', sourceHandle: 'bottom', targetHandle: 'top', ...defaultEdgeOpt, style: { stroke: '#10b981', strokeWidth: 3 }, animated: false, label: 'Cập nhật giá NET', labelStyle: { fill: '#cbd5e1', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' } },
    { id: 'e11-9', source: '11', target: '9', sourceHandle: 'top', targetHandle: 'bottom', ...defaultEdgeOpt, style: { stroke: '#10b981', strokeWidth: 3 }, animated: false, label: 'Gắn HDV vào Tour', labelStyle: { fill: '#cbd5e1', fontWeight: 600 }, labelBgStyle: { fill: '#1e293b' } },

    // Ops -> Tour Run -> CSKH
    { id: 'e9-12', source: '9', target: '12', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#10b981', strokeWidth: 3 } },
    { id: 'e12-13', source: '12', target: '13', sourceHandle: 'right', targetHandle: 'left', ...defaultEdgeOpt, style: { stroke: '#ef4444', strokeWidth: 3 } },
    
    // CSKH feedback to Marketing / CRM
    { id: 'e13-7', source: '13', target: '7', sourceHandle: 'bottom', targetHandle: 'right', ...defaultEdgeOpt, style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }, animated: true, type: 'smoothstep' }
];

const WorkflowTab = () => {
    const nodeTypes = useMemo(() => ({ custom: CustomWorkflowNode }), []);
    const [viewMode, setViewMode] = useState('ALL'); // ALL, SALES, OPS

    return (
        <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc', fontWeight: 700 }}>KIẾN TRÚC LUỒNG XỬ LÝ CRM</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>Bản đồ hệ thống vận hành từ Sales cho đến Điều hành & CSKH</p>
                </div>
                {/* Mode Selector for filtering focus if needed in future */}
                <div style={{ display: 'flex', gap: '10px', background: '#1e293b', padding: '6px', borderRadius: '12px' }}>
                    <button style={{ padding: '8px 16px', background: viewMode === 'ALL' ? '#6366f1' : 'transparent', color: viewMode === 'ALL' ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setViewMode('ALL')}>Toàn Hành Trình</button>
                    <button style={{ padding: '8px 16px', background: viewMode === 'SALES' ? '#3b82f6' : 'transparent', color: viewMode === 'SALES' ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setViewMode('SALES')}>Mô-đun Sales</button>
                    <button style={{ padding: '8px 16px', background: viewMode === 'OPS' ? '#10b981' : 'transparent', color: viewMode === 'OPS' ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setViewMode('OPS')}>Mô-đun Điều Hành</button>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <ReactFlow
                    nodes={initialNodes.map(n => ({
                        ...n,
                        style: { opacity: (viewMode === 'ALL' || (viewMode === 'SALES' && ['1','2','3','4','5','6','7','14'].includes(n.id)) || (viewMode === 'OPS' && ['8','9','10','11','12'].includes(n.id))) ? 1 : 0.2 }
                    }))}
                    edges={initialEdges.map(e => ({
                        ...e,
                        style: { ...e.style, opacity: viewMode === 'ALL' ? 1 : 0.2 }
                    }))}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    defaultZoom={0.6}
                    nodesDraggable={true}
                    panOnDrag={true}
                    zoomOnScroll={true}
                    style={{ background: '#0f172a' }} // Dark blue/gray background
                >
                    <Background color="#1e293b" gap={24} size={2} />
                    <Controls style={{ button: { backgroundColor: '#1e293b', color: '#f8fafc', borderBottom: '1px solid #334155', fill: '#f8fafc' } }} />
                </ReactFlow>
                
                {/* Simulated watermark text */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    opacity: 0.015,
                    pointerEvents: 'none',
                    zIndex: 0,
                    letterSpacing: '-5px',
                    whiteSpace: 'nowrap'
                }}>
                    FIT Tour CRM
                </div>
            </div>
        </div>
    );
};

export default WorkflowTab;
